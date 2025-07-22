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
    // Initialize Stripe
    const stripe = new (await import('https://esm.sh/stripe@14.21.0')).default(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2024-12-18.acacia',
      httpClient: Stripe.createFetchHttpClient(),
    })

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Get request body
    const requestBody = await req.json()
    const { userId } = requestBody

    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'Missing userId' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get company data for the user
    const { data: companyData, error: companyError } = await supabase
      .from('companies')
      .select('stripe_customer_id, name')
      .eq('auth_user_id', userId)
      .maybeSingle()

    if (companyError) {
      console.error('Error fetching company data:', companyError)
      return new Response(
        JSON.stringify({ error: 'Failed to fetch company data' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!companyData || !companyData.stripe_customer_id) {
      return new Response(
        JSON.stringify({ error: 'No customer found for this user' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Create customer portal session
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: companyData.stripe_customer_id,
      return_url: `${Deno.env.get('FRONTEND_URL')}/company/dashboard`,
      configuration: Deno.env.get('STRIPE_PORTAL_CONFIGURATION_ID') || undefined
    })

    return new Response(
      JSON.stringify({
        success: true,
        url: portalSession.url
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Customer portal error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
}) 