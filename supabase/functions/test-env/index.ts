import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const envVars = {
      hasStripeKey: !!Deno.env.get('STRIPE_SECRET_KEY'),
      hasSupabaseUrl: !!Deno.env.get('SUPABASE_URL'),
      hasServiceKey: !!Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'),
      hasFrontendUrl: !!Deno.env.get('FRONTEND_URL'),
      stripeKeyLength: Deno.env.get('STRIPE_SECRET_KEY')?.length || 0,
      supabaseUrl: Deno.env.get('SUPABASE_URL') || 'not set',
      frontendUrl: Deno.env.get('FRONTEND_URL') || 'not set'
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        environment: envVars,
        timestamp: new Date().toISOString()
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error', 
        details: error.message 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
}) 