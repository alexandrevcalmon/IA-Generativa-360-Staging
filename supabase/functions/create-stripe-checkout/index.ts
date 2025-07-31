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
    console.log('[create-stripe-checkout] Function started')
    
    // Check environment variables
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY')
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    const frontendUrl = Deno.env.get('FRONTEND_URL')
    
    console.log('[create-stripe-checkout] Environment check:', {
      hasStripeKey: !!stripeSecretKey,
      hasSupabaseUrl: !!supabaseUrl,
      hasServiceKey: !!supabaseServiceKey,
      hasFrontendUrl: !!frontendUrl
    })
    
    if (!stripeSecretKey) {
      return new Response(
        JSON.stringify({ error: 'Stripe configuration missing' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    if (!supabaseUrl || !supabaseServiceKey) {
      return new Response(
        JSON.stringify({ error: 'Supabase configuration missing' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Initialize Stripe
    console.log('[create-stripe-checkout] Initializing Stripe...')
    const Stripe = (await import('https://esm.sh/stripe@14.21.0')).default
    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2024-12-18.acacia',
    })
    console.log('[create-stripe-checkout] Stripe initialized successfully')

    // Initialize Supabase client
    console.log('[create-stripe-checkout] Initializing Supabase...')
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    console.log('[create-stripe-checkout] Supabase initialized successfully')

    // Get request body
    console.log('[create-stripe-checkout] Parsing request body...')
    const requestBody = await req.json()
    console.log('[create-stripe-checkout] Request body:', JSON.stringify(requestBody, null, 2))
    
    const { companyData, planId } = requestBody

    if (!companyData || !planId) {
      console.error('[create-stripe-checkout] Missing required data:', { companyData: !!companyData, planId: !!planId })
      return new Response(
        JSON.stringify({ error: 'Missing required data: companyData and planId are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    console.log('[create-stripe-checkout] Request data validated:', { 
      companyName: companyData.name, 
      companyEmail: companyData.contact_email, 
      planId 
    })

    // Get plan information from database
    console.log('[create-stripe-checkout] Fetching plan from database:', planId)
    const { data: planInfo, error: planError } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('id', planId)
      .single()

    if (planError) {
      console.error('[create-stripe-checkout] Database error fetching plan:', planError)
      return new Response(
        JSON.stringify({ error: 'Database error fetching plan', details: planError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    if (!planInfo) {
      console.error('[create-stripe-checkout] Plan not found:', planId)
      return new Response(
        JSON.stringify({ error: 'Plan not found', planId }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    console.log('[create-stripe-checkout] Plan found:', { 
      planName: planInfo.name, 
      stripeProductId: planInfo.stripe_product_id,
      maxCollaborators: planInfo.max_collaborators 
    })

    const stripeProductId = planInfo.stripe_product_id
    const maxCollaborators = planInfo.max_collaborators
    const subscriptionPeriod = planInfo.subscription_period_days || 30

    // Get Stripe prices for the product
    console.log('[create-stripe-checkout] Fetching Stripe prices for product:', stripeProductId)
    const prices = await stripe.prices.list({
      product: stripeProductId,
      active: true,
    })

    console.log('[create-stripe-checkout] Stripe prices found:', prices.data.length)

    if (prices.data.length === 0) {
      console.error('[create-stripe-checkout] No prices found for product:', stripeProductId)
      return new Response(
        JSON.stringify({ error: 'No prices found for product', productId: stripeProductId }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Use the first price (usually the default)
    const price = prices.data[0]
    console.log('[create-stripe-checkout] Using price:', { 
      priceId: price.id, 
      amount: price.unit_amount, 
      currency: price.currency 
    })

    // Check if customer already exists
    console.log('[create-stripe-checkout] Checking for existing customer:', companyData.contact_email)
    let customer
    try {
      const existingCustomers = await stripe.customers.list({
        email: companyData.contact_email,
        limit: 1,
      })

      if (existingCustomers.data.length > 0) {
        customer = existingCustomers.data[0]
        console.log('[create-stripe-checkout] Found existing customer:', customer.id)
      } else {
        // Create new customer
        console.log('[create-stripe-checkout] Creating new customer...')
        customer = await stripe.customers.create({
          email: companyData.contact_email,
          name: companyData.name,
          phone: companyData.contact_phone,
          metadata: {
            company_name: companyData.name,
            contact_name: companyData.contact_name,
          },
        })
        console.log('[create-stripe-checkout] New customer created:', customer.id)
      }
    } catch (customerError) {
      console.error('[create-stripe-checkout] Customer error:', customerError)
      return new Response(
        JSON.stringify({ error: 'Failed to create or find customer', details: customerError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Create checkout session
    console.log('[create-stripe-checkout] Creating checkout session...')
    const effectiveFrontendUrl = frontendUrl || 'https://academy.grupocalmon.com'
    console.log('[create-stripe-checkout] Frontend URL:', effectiveFrontendUrl)
    
    const sessionData = {
      customer: customer.id,
      payment_method_types: ['card'],
      line_items: [
        {
          price: price.id,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${effectiveFrontendUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${effectiveFrontendUrl}/planos`,
      metadata: {
        company_name: companyData.name,
        contact_name: companyData.contact_name,
        contact_email: companyData.contact_email,
        contact_phone: companyData.contact_phone || '',
        cnpj: companyData.cnpj,
        address_street: companyData.address_street || '',
        address_city: companyData.address_city || '',
        address_state: companyData.address_state || '',
        address_zip_code: companyData.address_zip_code || '',
        plan_id: planId,
        max_collaborators: maxCollaborators.toString(),
        subscription_period: subscriptionPeriod.toString(),
      },
      subscription_data: {
        metadata: {
          company_name: companyData.name,
          plan_id: planId,
        },
      },
    }
    
    console.log('[create-stripe-checkout] Session data prepared:', {
      customerId: customer.id,
      priceId: price.id,
      planId,
      frontendUrl: effectiveFrontendUrl
    })
    
    const session = await stripe.checkout.sessions.create(sessionData)

    console.log('[create-stripe-checkout] Checkout session created successfully:', {
      sessionId: session.id, 
      url: session.url 
    })

    return new Response(
      JSON.stringify({ 
        sessionId: session.id,
        checkout_url: session.url 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('[create-stripe-checkout] Checkout creation error:', error)
    console.error('[create-stripe-checkout] Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    })
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error', 
        details: error.message,
        timestamp: new Date().toISOString()
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
}) 