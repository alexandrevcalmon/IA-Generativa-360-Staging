import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create a Supabase client with the Auth context of the function
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Get the request body
    const { collaboratorId, companyId } = await req.json()

    // Validate input
    if (!collaboratorId || !companyId) {
      return new Response(
        JSON.stringify({ error: 'Parâmetros obrigatórios: collaboratorId, companyId' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get the calling user to verify permissions
    const { data: { user: callingUser }, error: userError } = await supabaseClient.auth.getUser()
    if (userError || !callingUser) {
      return new Response(
        JSON.stringify({ error: 'Usuário não autenticado' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Verify that the calling user is a producer or the company owner
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('role')
      .eq('id', callingUser.id)
      .single()

    if (profileError || !profile) {
      return new Response(
        JSON.stringify({ error: 'Perfil não encontrado' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check if user is producer or company owner
    if (profile.role === 'company') {
      const { data: company, error: companyError } = await supabaseClient
        .from('companies')
        .select('id')
        .eq('auth_user_id', callingUser.id)
        .eq('id', companyId)
        .single()

      if (companyError || !company) {
        return new Response(
          JSON.stringify({ error: 'Acesso negado: você só pode reenviar e-mails para colaboradores da sua empresa' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    } else if (profile.role !== 'producer') {
      return new Response(
        JSON.stringify({ error: 'Acesso negado: apenas produtores e empresas podem reenviar e-mails de ativação' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get collaborator data
    const { data: collaborator, error: collaboratorError } = await supabaseClient
      .from('company_users')
      .select(`
        id,
        name,
        email,
        auth_user_id,
        is_active,
        needs_complete_registration
      `)
      .eq('id', collaboratorId)
      .eq('company_id', companyId)
      .single()

    if (collaboratorError || !collaborator) {
      return new Response(
        JSON.stringify({ error: 'Colaborador não encontrado' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check if collaborator needs activation
    if (!collaborator.needs_complete_registration) {
      return new Response(
        JSON.stringify({ error: 'Este colaborador já completou o cadastro e não precisa de reenvio de e-mail' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get company data for the email
    const { data: company, error: companyError } = await supabaseClient
      .from('companies')
      .select('name, contact_name')
      .eq('id', companyId)
      .single()

    if (companyError || !company) {
      return new Response(
        JSON.stringify({ error: 'Empresa não encontrada' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Re-send invitation email
    const redirectTo = Deno.env.get('SUPABASE_ACTIVATION_REDIRECT_URL') || 
                      Deno.env.get('FRONTEND_URL') + '/activate-account'

    const { data: inviteData, error: inviteError } = await supabaseClient.auth.admin.inviteUserByEmail(
      collaborator.email,
      {
        data: {
          role: 'collaborator',
          company_id: companyId,
          name: collaborator.name
        },
        redirectTo: redirectTo,
        // Configurar tempo de expiração mais longo (7 dias em segundos)
        options: {
          data: {
            role: 'collaborator',
            company_id: companyId,
            name: collaborator.name
          },
          emailRedirectTo: redirectTo,
          // Definir tempo de expiração personalizado (7 dias)
          expiresIn: 7 * 24 * 60 * 60 // 7 dias em segundos
        }
      }
    )

    if (inviteError || !inviteData?.user) {
      console.error('Error resending invitation:', inviteError)
      return new Response(
        JSON.stringify({ error: `Erro ao reenviar e-mail: ${inviteError?.message || 'Erro desconhecido'}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Update the collaborator's auth_user_id if it changed
    if (inviteData.user.id !== collaborator.auth_user_id) {
      const { error: updateError } = await supabaseClient
        .from('company_users')
        .update({ 
          auth_user_id: inviteData.user.id,
          updated_at: new Date().toISOString()
        })
        .eq('id', collaboratorId)

      if (updateError) {
        console.error('Error updating auth_user_id:', updateError)
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        message: `E-mail de ativação reenviado com sucesso para ${collaborator.name}`,
        collaborator: {
          id: collaborator.id,
          name: collaborator.name,
          email: collaborator.email
        }
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error: any) {
    console.error('Error in resend-activation-email:', error)
    return new Response(
      JSON.stringify({ error: `Erro interno: ${error.message}` }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
}) 