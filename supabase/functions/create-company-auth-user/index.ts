// supabase/functions/create-company-auth-user/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  console.log('[create-company-auth-user] Function invoked. Method:', req.method);
  if (req.method === 'OPTIONS') {
    console.log('[create-company-auth-user] Handling OPTIONS request.');
    return new Response('ok', { headers: corsHeaders });
  }

  let requestBody;
  try {
    requestBody = await req.json();
  } catch (e: any) {
    console.error('[create-company-auth-user] Error parsing request body:', e.message);
    return new Response(JSON.stringify({ error: 'Invalid JSON body' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }

  const { email, companyId, companyName, contactName } = requestBody; // contactName is available but not used in current logic.
  console.log('[create-company-auth-user] Request body parsed:', { email, companyId, companyName, contactName });

  if (!email || !companyId) {
    console.error('[create-company-auth-user] Missing required parameters: email or companyId.');
    return new Response(JSON.stringify({ error: 'Missing required parameters: email or companyId' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { autoRefreshToken: false, persistSession: false } }
    );
    console.log('[create-company-auth-user] Supabase admin client initialized.');

    console.log(`[create-company-auth-user] Fetching company. ID: ${companyId}`);
    const { data: company, error: companyError } = await supabaseAdmin
      .from('companies')
      .select('*')
      .eq('id', companyId)
      .maybeSingle(); // MODIFIED to maybeSingle

    if (companyError) {
      console.error('[create-company-auth-user] Error fetching company:', companyError.message, companyError.details);
      return new Response(JSON.stringify({ error: `Error fetching company: ${companyError.message}` }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    if (!company) {
      console.error(`[create-company-auth-user] Company not found with ID: ${companyId}.`);
      return new Response(JSON.stringify({ error: 'Company not found' }), { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
     // Validate contact_email after fetching company by ID
    if (company.contact_email !== email) {
        console.error(`[create-company-auth-user] Company ${companyId} found, but its contact_email ('${company.contact_email}') does not match provided email ('${email}').`);
        return new Response(JSON.stringify({ error: 'Company found, but contact email does not match request.' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    console.log('[create-company-auth-user] Company fetched successfully:', company.name, `(ID: ${company.id})`);

    if (company.auth_user_id) {
      console.log(`[create-company-auth-user] Company ${company.id} already has auth_user_id: ${company.auth_user_id}.`);
      // Potentially verify if the existing auth_user_id matches the email, or update metadata if needed.
      // For now, assume if auth_user_id exists, it's correctly linked.
      return new Response(JSON.stringify({ success: true, authUserId: company.auth_user_id, message: "Company already linked to an auth user." }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    let authUserId: string;
    let isNewUser = false;

    console.log(`[create-company-auth-user] Checking for existing Supabase auth user with email: ${email}`);
    const { data: { users: userList }, error: listUsersError } = await supabaseAdmin.auth.admin.listUsers(); // Consider pagination for large user bases

    if (listUsersError) {
        console.error('[create-company-auth-user] Error listing users:', listUsersError.message);
        // This is a significant error, might be best to stop.
        return new Response(JSON.stringify({ error: `Error listing users: ${listUsersError.message}` }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const existingAuthUser = userList?.find(user => user.email === email);
    const effectiveCompanyName = companyName || company.name; // Use provided companyName or fallback to company's current name

    if (existingAuthUser) {
      authUserId = existingAuthUser.id;
      console.log(`[create-company-auth-user] Auth user already exists with email ${email}. ID: ${authUserId}. Updating metadata.`);
      const { error: updateMetaError } = await supabaseAdmin.auth.admin.updateUserById(
        authUserId,
        { user_metadata: { ...existingAuthUser.user_metadata, role: 'company', company_id: companyId, company_name: effectiveCompanyName, name: contactName || effectiveCompanyName } }
      );
      if (updateMetaError) {
        console.error('[create-company-auth-user] Error updating existing user metadata:', updateMetaError.message);
        // Non-fatal for now, proceed to link company, but this is a warning.
      } else {
        console.log('[create-company-auth-user] Successfully updated metadata for existing auth user.');
      }
    } else {
      const tempPassword = Deno.env.get('NEW_COMPANY_USER_DEFAULT_PASSWORD') || 'ia360graus';
      console.log(`[create-company-auth-user] No existing auth user. Creating new one for email: ${email}`);
      const { data: newAuthUserData, error: createAuthError } = await supabaseAdmin.auth.admin.createUser({
        email: email,
        password: tempPassword,
        email_confirm: true, // Auto-confirm for simplicity in this flow
        user_metadata: { role: 'company', company_id: companyId, company_name: effectiveCompanyName, name: contactName || effectiveCompanyName }
      });

      if (createAuthError || !newAuthUserData?.user) {
        console.error('[create-company-auth-user] Error creating new auth user:', createAuthError?.message || 'User object not returned.');
        return new Response(JSON.stringify({ error: `Failed to create auth user: ${createAuthError?.message}` }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
      authUserId = newAuthUserData.user.id;
      isNewUser = true;
      console.log(`[create-company-auth-user] New auth user created successfully. ID: ${authUserId}`);
    }

    console.log(`[create-company-auth-user] Updating 'companies' table for ID ${companyId} with auth_user_id ${authUserId}.`);
    const { error: updateCompanyError } = await supabaseAdmin
      .from('companies')
      .update({ auth_user_id: authUserId, updated_at: new Date().toISOString() })
      .eq('id', companyId);

    if (updateCompanyError) {
      console.error('[create-company-auth-user] Error updating company table:', updateCompanyError.message, updateCompanyError.details);
      if (isNewUser) {
        console.warn(`[create-company-auth-user] Company update failed for new user ${authUserId}. Deleting the new auth user to prevent orphaned auth user.`);
        await supabaseAdmin.auth.admin.deleteUser(authUserId);
        console.log(`[create-company-auth-user] Orphaned new auth user ${authUserId} deleted.`);
      }
      return new Response(JSON.stringify({ error: `Failed to update company with auth user: ${updateCompanyError.message}` }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    console.log('[create-company-auth-user] Company table updated successfully.');

    console.log(`[create-company-auth-user] Upserting 'profiles' table for ID ${authUserId}.`);
    const profileDataForUpsert: any = {
      id: authUserId,
      role: 'company',
      email: email,
      name: contactName || effectiveCompanyName || email, // Fallback to email if no name
      updated_at: new Date().toISOString()
    };

    // If it's a brand new auth user, we explicitly set created_at.
    // The profiles table has DEFAULT NOW() for created_at, so this ensures it's set for new profile rows via upsert.
    // If the profile already exists (isNewUser is false, or somehow true but profile exists),
    // this created_at will only apply if it's a new insert part of the upsert.
    // If it's an update part of the upsert, created_at is not typically modified by default unless part of the SET clause.
    if (isNewUser) {
        profileDataForUpsert.created_at = new Date().toISOString();
    }

    const { error: upsertProfileError } = await supabaseAdmin
      .from('profiles')
      .upsert(profileDataForUpsert, { onConflict: 'id' });

    if (upsertProfileError) {
      console.error('[create-company-auth-user] Error upserting profile record:', upsertProfileError.message, upsertProfileError.details);
      // Non-fatal, but log it. The main goal was to link auth user to company.
    } else {
      console.log('[create-company-auth-user] Profile record upserted successfully.');
    }

    console.log('[create-company-auth-user] Process completed successfully:', { authUserId, companyId, isNewUser, needsPasswordChange: true });
    return new Response(JSON.stringify({ success: true, authUserId: authUserId, needsPasswordChange: true, isNewUser: isNewUser }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  } catch (error: any) {
    console.error('[create-company-auth-user] Unhandled error in function:', error.message, error.stack);
    return new Response(JSON.stringify({ error: 'Internal server error', details: error.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
