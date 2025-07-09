import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  console.log('[create-collaborator] Function invoked. Method:', req.method);
  if (req.method === 'OPTIONS') {
    console.log('[create-collaborator] Handling OPTIONS request.');
    return new Response('ok', { headers: corsHeaders });
  }

  let requestBody;
  try {
    requestBody = await req.json();
  } catch (e: any) {
    console.error('[create-collaborator] Error parsing request body:', e.message);
    return new Response(JSON.stringify({ error: 'Invalid JSON body' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }});
  }

  const { company_id, name, email, phone, position } = requestBody;
  console.log('[create-collaborator] Request body parsed:', { company_id, name, email, phone, position });

  if (!company_id || !name || !email) {
    console.error('[create-collaborator] Missing required parameters: company_id, name, or email.');
    return new Response(JSON.stringify({ error: 'Missing required parameters: company_id, name, or email' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }});
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { autoRefreshToken: false, persistSession: false } }
    );
    console.log('[create-collaborator] Supabase admin client initialized.');

    // Authorization: Check if the calling user is a producer
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('[create-collaborator] Authorization header missing.');
      return new Response(JSON.stringify({ error: 'Unauthorized: Missing Authorization header' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    const supabaseUserClient = createClient(Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('SUPABASE_ANON_KEY') ?? '', { global: { headers: { Authorization: authHeader } } });

    console.log('[create-collaborator] Fetching calling user.');
    const { data: { user: callingUser }, error: callingUserError } = await supabaseUserClient.auth.getUser();

    if (callingUserError || !callingUser) {
      console.error('[create-collaborator] Error fetching calling user or user not found:', callingUserError?.message);
      return new Response(JSON.stringify({ error: 'Unauthorized: Could not verify calling user' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    console.log(`[create-collaborator] Calling user: ${callingUser.id}, email: ${callingUser.email}`);

    console.log(`[create-collaborator] Verifying if calling user ${callingUser.id} is a producer.`);
    const { data: profile, error: profileError } = await supabaseAdmin // Use admin client for profile check for security
      .from('profiles')
      .select('role')
      .eq('id', callingUser.id)
      .single();

    if (profileError || profile?.role !== 'producer') {
      console.error(`[create-collaborator] Calling user ${callingUser.id} is not a producer. Profile role: ${profile?.role}. Error:`, profileError?.message);
      return new Response(JSON.stringify({ error: 'Forbidden: Calling user is not a producer' }), { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    console.log(`[create-collaborator] Calling user ${callingUser.id} confirmed as producer.`);

    // Check for existing collaborator in company_users
    console.log(`[create-collaborator] Checking for existing collaborator in company_users. Email: ${email}`);
    const { data: existingCompanyUser, error: existingCompanyUserError } = await supabaseAdmin
      .from('company_users')
      .select('auth_user_id, company_id, is_active, name')
      .eq('email', email)
      .maybeSingle();

    if (existingCompanyUserError) {
      console.error(`[create-collaborator] Error checking existing company_users for ${email}:`, existingCompanyUserError.message);
      // This could be a transient DB error. Depending on policy, might be okay to proceed to auth user check.
      // For now, let's return an error to be safe.
      return new Response(JSON.stringify({ error: `DB error checking existing collaborator: ${existingCompanyUserError.message}` }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    if (existingCompanyUser) {
      console.log(`[create-collaborator] Found existing company_user record for ${email}: AuthID ${existingCompanyUser.auth_user_id}, CompanyID ${existingCompanyUser.company_id}, Active: ${existingCompanyUser.is_active}, Name: ${existingCompanyUser.name}`);
      if (existingCompanyUser.company_id === company_id) {
        if (existingCompanyUser.is_active) {
          console.warn(`[create-collaborator] User ${email} is already an active collaborator in company ${company_id}.`);
          return new Response(JSON.stringify({ error: `O usuário ${email} já é um colaborador ativo desta empresa.` }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        } else {
          // Reactivate existing user
          console.log(`[create-collaborator] Reactivating inactive collaborator ${email} (AuthID: ${existingCompanyUser.auth_user_id}) for company ${company_id}.`);
          const { data: reactivatedData, error: reactivateError } = await supabaseAdmin
            .from('company_users')
            .update({ name: name, phone: phone, position: position, is_active: true, needs_password_change: false, updated_at: new Date().toISOString() })
            .eq('auth_user_id', existingCompanyUser.auth_user_id)
            .eq('company_id', company_id)
            .select()
            .single();

          if (reactivateError) {
            console.error(`[create-collaborator] Error reactivating collaborator ${existingCompanyUser.auth_user_id}:`, reactivateError.message);
            return new Response(JSON.stringify({ error: `Erro ao reativar colaborador: ${reactivateError.message}` }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
          }
          console.log(`[create-collaborator] Collaborator ${existingCompanyUser.auth_user_id} reactivated successfully.`);

          // Ensure profile is also updated/present
          console.log(`[create-collaborator] Upserting profile for reactivated collaborator ${existingCompanyUser.auth_user_id}.`);
          const { error: profileUpsertError } = await supabaseAdmin.from('profiles').upsert({ id: existingCompanyUser.auth_user_id, email: email, name: name, role: 'collaborator', updated_at: new Date().toISOString() }, { onConflict: 'id' });
          if (profileUpsertError) console.error(`[create-collaborator] Error upserting profile on reactivation for ${existingCompanyUser.auth_user_id}:`, profileUpsertError.message);
          else console.log(`[create-collaborator] Profile upserted for reactivated collaborator ${existingCompanyUser.auth_user_id}.`);

          return new Response(JSON.stringify({ data: reactivatedData, isReactivation: true }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }
      } else {
        console.warn(`[create-collaborator] User ${email} is a collaborator in a different company (${existingCompanyUser.company_id}). Cannot add to company ${company_id}.`);
        return new Response(JSON.stringify({ error: `O usuário ${email} já é colaborador de outra empresa.` }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
    }

    // If no existing company_user, proceed to create/link auth user
    let authUserId: string;
    let isNewAuthUser = false;

    console.log(`[create-collaborator] Checking for existing Supabase auth user with email: ${email}`);
    const { data: { users: userList }, error: listUsersError } = await supabaseAdmin.auth.admin.listUsers();
    if (listUsersError) {
      console.error(`[create-collaborator] Error listing users to find ${email}:`, listUsersError.message);
      return new Response(JSON.stringify({ error: `Error checking existing users: ${listUsersError.message}` }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    const existingAuthUser = userList?.find(u => u.email === email);

    if (existingAuthUser) {
      authUserId = existingAuthUser.id;
      console.log(`[create-collaborator] Auth user already exists with email ${email}. ID: ${authUserId}. Updating metadata.`);
      const { error: updateMetaError } = await supabaseAdmin.auth.admin.updateUserById(authUserId, {
        user_metadata: { ...existingAuthUser.user_metadata, role: 'collaborator', company_id: company_id, name: name }
      });
      if (updateMetaError) console.error(`[create-collaborator] Error updating metadata for existing auth user ${authUserId}:`, updateMetaError.message); // Non-fatal for this flow.
      else console.log(`[create-collaborator] Metadata updated for existing auth user ${authUserId}.`);
    } else {
      const tempPassword = Deno.env.get('NEW_COLLABORATOR_DEFAULT_PASSWORD') || 'ia360graus';
      console.log(`[create-collaborator] No existing auth user. Creating new one for email: ${email}`);
      const { data: newAuthUserData, error: createAuthError } = await supabaseAdmin.auth.admin.createUser({
        email: email, password: tempPassword, email_confirm: true,
        user_metadata: { role: 'collaborator', company_id: company_id, name: name }
      });
      if (createAuthError || !newAuthUserData?.user) {
        console.error(`[create-collaborator] Error creating new auth user for ${email}:`, createAuthError?.message || "User object not returned.");
        return new Response(JSON.stringify({ error: `Erro ao criar usuário de autenticação: ${createAuthError?.message}` }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
      authUserId = newAuthUserData.user.id;
      isNewAuthUser = true;
      console.log(`[create-collaborator] New auth user created successfully for ${email}. ID: ${authUserId}`);
    }

    console.log(`[create-collaborator] Inserting record into 'company_users' for auth_user_id ${authUserId}, company_id ${company_id}.`);
    const { data: companyUserData, error: companyUserInsertError } = await supabaseAdmin
      .from('company_users')
      .insert([{ auth_user_id: authUserId, company_id: company_id, name: name, email: email, phone: phone, position: position, is_active: true, needs_password_change: true }])
      .select()
      .single();

    if (companyUserInsertError) {
      console.error(`[create-collaborator] Error inserting into company_users for auth_user_id ${authUserId}:`, companyUserInsertError.message);
      if (isNewAuthUser) {
        console.warn(`[create-collaborator] company_users insert failed for new auth user ${authUserId}. Deleting the new auth user.`);
        await supabaseAdmin.auth.admin.deleteUser(authUserId);
        console.log(`[create-collaborator] Orphaned new auth user ${authUserId} deleted.`);
      }
      return new Response(JSON.stringify({ error: `Erro ao adicionar colaborador à empresa: ${companyUserInsertError.message}` }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    console.log(`[create-collaborator] Record inserted into company_users successfully for auth_user_id ${authUserId}.`);

    // Upsert profile for the collaborator
    console.log(`[create-collaborator] Upserting 'profiles' table for ID ${authUserId}.`);
    const profileToUpsert: any = { id: authUserId, role: 'collaborator', email: email, name: name, updated_at: new Date().toISOString() };
    if (isNewAuthUser) profileToUpsert.created_at = new Date().toISOString();
    const { error: upsertProfileError } = await supabaseAdmin.from('profiles').upsert(profileToUpsert, { onConflict: 'id' });
    if (upsertProfileError) console.error(`[create-collaborator] Error upserting profile for ${authUserId}:`, upsertProfileError.message);
    else console.log(`[create-collaborator] Profile record for ${authUserId} upserted successfully.`);

    console.log(`[create-collaborator] Process for ${email} completed successfully. New Auth User: ${isNewAuthUser}`);
    return new Response(JSON.stringify({ data: companyUserData, isReactivation: false, isNewAuthUser: isNewAuthUser }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  } catch (e: any) {
    console.error('[create-collaborator] Unhandled error in function:', e.message, e.stack);
    return new Response(JSON.stringify({ error: 'Internal server error', details: e.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }});
  }
});
