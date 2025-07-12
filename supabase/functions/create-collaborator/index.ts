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

  const { 
    company_id, 
    name, 
    email, 
    phone, 
    position,
    needs_complete_registration = true
  } = requestBody;
  
  console.log('[create-collaborator] Request body parsed (simplified flow):', { 
    company_id, 
    name, 
    email, 
    phone, 
    position,
    needs_complete_registration
  });

  // Validar apenas campos básicos obrigatórios
  if (!company_id || !name || !email || !position) {
    console.error('[create-collaborator] Missing required parameters');
    return new Response(JSON.stringify({ 
      error: 'Campos obrigatórios: company_id, name, email, position' 
    }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }});
  }

  // Validar formato do e-mail
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    console.error('[create-collaborator] Invalid email format:', email);
    return new Response(JSON.stringify({ error: 'Formato de e-mail inválido' }), { 
      status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
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
      return new Response(JSON.stringify({ error: 'Unauthorized: Missing Authorization header' }), { 
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }
    
    const supabaseUserClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '', 
      Deno.env.get('SUPABASE_ANON_KEY') ?? '', 
      { global: { headers: { Authorization: authHeader } } }
    );

    console.log('[create-collaborator] Fetching calling user.');
    const { data: { user: callingUser }, error: callingUserError } = await supabaseUserClient.auth.getUser();

    if (callingUserError || !callingUser) {
      console.error('[create-collaborator] Error fetching calling user:', callingUserError?.message);
      return new Response(JSON.stringify({ error: 'Unauthorized: Could not verify calling user' }), { 
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }
    console.log(`[create-collaborator] Calling user: ${callingUser.id}, email: ${callingUser.email}`);

    // Verificar se o usuário é um producer ou company
    console.log(`[create-collaborator] Verifying if calling user ${callingUser.id} is a producer or company.`);
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', callingUser.id)
      .single();

    if (profileError || (profile?.role !== 'producer' && profile?.role !== 'company')) {
      console.error(`[create-collaborator] Calling user ${callingUser.id} is not a producer or company. Profile role: ${profile?.role}`);
      return new Response(JSON.stringify({ error: 'Forbidden: Calling user is not a producer or company' }), { 
        status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }
    console.log(`[create-collaborator] Calling user ${callingUser.id} confirmed as ${profile.role}.`);

    // Se for empresa, verificar se está tentando adicionar colaborador para sua própria empresa
    if (profile.role === 'company') {
      const { data: userCompany, error: userCompanyError } = await supabaseAdmin
        .from('companies')
        .select('id')
        .eq('auth_user_id', callingUser.id)
        .single();

      if (userCompanyError || !userCompany) {
        console.error(`[create-collaborator] Company user ${callingUser.id} does not have associated company`);
        return new Response(JSON.stringify({ error: 'Company user does not have associated company' }), { 
          status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        });
      }

      if (userCompany.id !== company_id) {
        console.error(`[create-collaborator] Company user ${callingUser.id} trying to add collaborator to different company`);
        return new Response(JSON.stringify({ error: 'Company users can only add collaborators to their own company' }), { 
          status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        });
      }

      console.log(`[create-collaborator] Company user ${callingUser.id} authorized to add collaborator to company ${company_id}`);
    }

    // Verificar limite de assentos da empresa
    console.log(`[create-collaborator] Checking company seat limit for company: ${company_id}`);
    const { data: company, error: companyError } = await supabaseAdmin
      .from('companies')
      .select('max_collaborators')
      .eq('id', company_id)
      .single();

    if (companyError || !company) {
      console.error('[create-collaborator] Error fetching company:', companyError?.message);
      return new Response(JSON.stringify({ error: 'Empresa não encontrada' }), { 
        status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }

    // Contar colaboradores ativos
    const { count: activeCount, error: countError } = await supabaseAdmin
      .from('company_users')
      .select('*', { count: 'exact', head: true })
      .eq('company_id', company_id)
      .eq('is_active', true);

    if (countError) {
      console.error('[create-collaborator] Error counting active collaborators:', countError.message);
      return new Response(JSON.stringify({ error: 'Erro ao verificar limite de colaboradores' }), { 
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }

    const maxCollaborators = company.max_collaborators || 5;
    const currentActive = activeCount || 0;

    if (currentActive >= maxCollaborators) {
      console.error(`[create-collaborator] Seat limit reached: ${currentActive}/${maxCollaborators}`);
      return new Response(JSON.stringify({ 
        error: `Limite de colaboradores atingido (${currentActive}/${maxCollaborators}). Atualize seu plano para adicionar mais colaboradores.` 
      }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Verificar colaborador existente
    console.log(`[create-collaborator] Checking for existing collaborator: ${email}`);
    const { data: existingCompanyUser, error: existingCompanyUserError } = await supabaseAdmin
      .from('company_users')
      .select('auth_user_id, company_id, is_active, name')
      .eq('email', email)
      .maybeSingle();

    if (existingCompanyUserError) {
      console.error(`[create-collaborator] Error checking existing company_users:`, existingCompanyUserError.message);
      return new Response(JSON.stringify({ error: `Erro ao verificar colaborador existente: ${existingCompanyUserError.message}` }), { 
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }

    if (existingCompanyUser) {
      console.log(`[create-collaborator] Found existing company_user: ${existingCompanyUser.auth_user_id}`);
      if (existingCompanyUser.company_id === company_id) {
        if (existingCompanyUser.is_active) {
          console.warn(`[create-collaborator] User ${email} is already an active collaborator.`);
          return new Response(JSON.stringify({ error: `O usuário ${email} já é um colaborador ativo desta empresa.` }), { 
            status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          });
        } else {
          // Reativar colaborador existente
          console.log(`[create-collaborator] Reactivating inactive collaborator: ${email}`);
          const { data: reactivatedData, error: reactivateError } = await supabaseAdmin
            .from('company_users')
            .update({ 
              name, 
              phone: phone || null, 
              position,
              is_active: true, 
              needs_complete_registration: true,
              updated_at: new Date().toISOString() 
            })
            .eq('auth_user_id', existingCompanyUser.auth_user_id)
            .eq('company_id', company_id)
            .select()
            .single();

          if (reactivateError) {
            console.error(`[create-collaborator] Error reactivating collaborator:`, reactivateError.message);
            return new Response(JSON.stringify({ error: `Erro ao reativar colaborador: ${reactivateError.message}` }), { 
              status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            });
          }

          return new Response(JSON.stringify({ data: reactivatedData, isReactivation: true }), { 
            status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          });
        }
      } else {
        console.warn(`[create-collaborator] User ${email} is a collaborator in a different company.`);
        return new Response(JSON.stringify({ error: `O usuário ${email} já é colaborador de outra empresa.` }), { 
          status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        });
      }
    }

    // Criar novo colaborador
    let authUserId: string;
    let isNewAuthUser = false;

    console.log(`[create-collaborator] Checking for existing auth user: ${email}`);
    const { data: { users: userList }, error: listUsersError } = await supabaseAdmin.auth.admin.listUsers();
    if (listUsersError) {
      console.error(`[create-collaborator] Error listing users:`, listUsersError.message);
      return new Response(JSON.stringify({ error: `Error checking existing users: ${listUsersError.message}` }), { 
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }
    
    const existingAuthUser = userList?.find(u => u.email === email);

    if (existingAuthUser) {
      authUserId = existingAuthUser.id;
      console.log(`[create-collaborator] Auth user already exists: ${authUserId}`);
      
      // Atualizar metadata
      const { error: updateMetaError } = await supabaseAdmin.auth.admin.updateUserById(authUserId, {
        user_metadata: { 
          ...existingAuthUser.user_metadata, 
          role: 'collaborator', 
          company_id: company_id, 
          name: name 
        }
      });
      if (updateMetaError) {
        console.error(`[create-collaborator] Error updating metadata:`, updateMetaError.message);
      }
    } else {
      // Criar novo usuário via inviteUserByEmail
      console.log(`[create-collaborator] Creating new auth user via invite: ${email}`);
      const redirectTo = 'https://staging.grupocalmon.com/activate-account';
      
      const { data: newAuthUserData, error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
        data: { 
          role: 'collaborator', 
          company_id: company_id, 
          name: name 
        },
        redirectTo: redirectTo
      });

      if (inviteError || !newAuthUserData?.user) {
        console.error(`[create-collaborator] Error inviting user:`, inviteError?.message);
        return new Response(JSON.stringify({ error: `Erro ao enviar convite: ${inviteError?.message}` }), { 
          status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        });
      }
      
      authUserId = newAuthUserData.user.id;
      isNewAuthUser = true;
      console.log(`[create-collaborator] New auth user invited successfully: ${authUserId}`);
    }

    // Inserir registro na tabela company_users (apenas campos básicos)
    console.log(`[create-collaborator] Inserting company_users record for: ${authUserId}`);
    const { data: companyUserData, error: companyUserInsertError } = await supabaseAdmin
      .from('company_users')
      .insert([{ 
        auth_user_id: authUserId, 
        company_id: company_id, 
        name: name, 
        email: email, 
        phone: phone || null, 
        position: position,
        pais: 'Brasil',
        is_active: true, 
        needs_complete_registration: true
      }])
      .select()
      .single();

    if (companyUserInsertError) {
      console.error(`[create-collaborator] Error inserting company_users:`, companyUserInsertError.message);
      if (isNewAuthUser) {
        console.warn(`[create-collaborator] Deleting orphaned auth user: ${authUserId}`);
        await supabaseAdmin.auth.admin.deleteUser(authUserId);
      }
      return new Response(JSON.stringify({ error: `Erro ao adicionar colaborador: ${companyUserInsertError.message}` }), { 
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }

    // Upsert profile
    console.log(`[create-collaborator] Upserting profile for: ${authUserId}`);
    const profileToUpsert: any = { 
      id: authUserId, 
      role: 'collaborator', 
      email: email, 
      name: name, 
      updated_at: new Date().toISOString() 
    };
    if (isNewAuthUser) profileToUpsert.created_at = new Date().toISOString();
    
    const { error: upsertProfileError } = await supabaseAdmin
      .from('profiles')
      .upsert(profileToUpsert, { onConflict: 'id' });
      
    if (upsertProfileError) {
      console.error(`[create-collaborator] Error upserting profile:`, upsertProfileError.message);
    }

    console.log(`[create-collaborator] Process completed successfully for: ${email} (simplified flow)`);
    return new Response(JSON.stringify({ 
      data: companyUserData, 
      isReactivation: false, 
      isNewAuthUser: isNewAuthUser,
      invitationSent: isNewAuthUser,
      needsCompleteRegistration: true
    }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  } catch (error: any) {
    console.error('[create-collaborator] Unexpected error:', error.message);
    return new Response(JSON.stringify({ error: `Erro interno: ${error.message}` }), { 
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });
  }
});
