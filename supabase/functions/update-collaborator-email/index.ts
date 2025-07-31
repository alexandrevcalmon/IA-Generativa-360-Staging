import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  let requestBody;
  try {
    requestBody = await req.json();
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Invalid JSON body' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }});
  }

  const { auth_user_id, new_email, company_id } = requestBody;
  if (!auth_user_id || !new_email) {
    return new Response(JSON.stringify({ error: 'Parâmetros obrigatórios: auth_user_id, new_email' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }});
  }

  // Inicializa client admin
  const supabaseAdmin = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  // Validação de permissão: só producer ou empresa dona pode alterar
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    return new Response(JSON.stringify({ error: 'Unauthorized: Missing Authorization header' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
  const supabaseUserClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    { global: { headers: { Authorization: authHeader } } }
  );
  const { data: { user: callingUser }, error: callingUserError } = await supabaseUserClient.auth.getUser();
  if (callingUserError || !callingUser) {
    return new Response(JSON.stringify({ error: 'Unauthorized: Could not verify calling user' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
  // Verifica se é producer ou empresa dona
  const { data: profile, error: profileError } = await supabaseAdmin
    .from('profiles')
    .select('role')
    .eq('id', callingUser.id)
    .single();
  if (profileError || (profile?.role !== 'producer' && profile?.role !== 'company')) {
    return new Response(JSON.stringify({ error: 'Forbidden: Only producer or company can update email' }), { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
  if (profile.role === 'company' && company_id) {
    const { data: userCompany, error: userCompanyError } = await supabaseAdmin
      .from('companies')
      .select('id')
      .eq('auth_user_id', callingUser.id)
      .single();
    if (userCompanyError || !userCompany || userCompany.id !== company_id) {
      return new Response(JSON.stringify({ error: 'Company can only update emails of its own collaborators' }), { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
  }
  // Atualiza o e-mail em auth.users
  const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(auth_user_id, { email: new_email });
  if (updateError) {
    return new Response(JSON.stringify({ error: 'Erro ao atualizar e-mail em auth.users: ' + updateError.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
  // Atualiza também em company_users
  const { error: updateCompanyUserError } = await supabaseAdmin
    .from('company_users')
    .update({ email: new_email })
    .eq('auth_user_id', auth_user_id)
    .select();
  if (updateCompanyUserError) {
    return new Response(JSON.stringify({ error: 'E-mail atualizado em auth.users, mas falhou em company_users: ' + updateCompanyUserError.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
  return new Response(JSON.stringify({ success: true }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
}); 