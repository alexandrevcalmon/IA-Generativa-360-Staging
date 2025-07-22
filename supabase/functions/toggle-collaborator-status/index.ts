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
    const { collaboratorId, companyId, currentStatus } = await req.json()

    // Validate input
    if (!collaboratorId || !companyId || currentStatus === undefined) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // First, verify the collaborator exists and belongs to the company
    const { data: existingCollaborator, error: checkError } = await supabaseClient
      .from('company_users')
      .select('id, name, company_id, is_active')
      .eq('id', collaboratorId)
      .eq('company_id', companyId)
      .single()

    if (checkError || !existingCollaborator) {
      return new Response(
        JSON.stringify({ error: 'Colaborador não encontrado ou sem permissão de acesso' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Update the collaborator status
    const { data, error } = await supabaseClient
      .from('company_users')
      .update({ is_active: !currentStatus })
      .eq('id', collaboratorId)
      .eq('company_id', companyId)
      .select('id, name, is_active')
      .single()

    if (error) {
      console.error('Error updating collaborator status:', error)
      return new Response(
        JSON.stringify({ error: 'Erro ao alterar status do colaborador' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        data,
        message: `${data.name} foi ${data.is_active ? 'desbloqueado(a)' : 'bloqueado(a)'}`
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Unexpected error:', error)
    return new Response(
      JSON.stringify({ error: 'Erro interno do servidor' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
}) 