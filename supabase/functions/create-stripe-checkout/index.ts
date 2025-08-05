import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Helper function to detect Stripe environment
function detectStripeEnvironment(stripeKey: string) {
  if (stripeKey.startsWith('sk_test_')) {
    return 'test'
  } else if (stripeKey.startsWith('sk_live_')) {
    return 'production'
  } else {
    return 'unknown'
  }
}

// Helper function to ensure product exists in Stripe
async function ensureProductExists(stripe: any, planInfo: any) {
  const stripeProductId = planInfo.stripe_product_id
  
  try {
    // Try to retrieve the product
    const product = await stripe.products.retrieve(stripeProductId)
    console.log('[create-stripe-checkout] Product exists:', product.id)
    return product
  } catch (error) {
    console.log('[create-stripe-checkout] Product not found, creating new one:', stripeProductId)
    
    // Create the product if it doesn't exist
    const newProduct = await stripe.products.create({
      id: stripeProductId,
      name: `Plano ${planInfo.name}`,
      description: `Plano ${planInfo.name} - ${planInfo.max_collaborators} colaboradores`,
      active: true,
    })
    
    console.log('[create-stripe-checkout] New product created:', newProduct.id)
    
    // Create the price for the product
    const price = await stripe.prices.create({
      product: newProduct.id,
      unit_amount: Math.round(planInfo.price * 100), // Convert to cents
      currency: 'brl',
      recurring: {
        interval: planInfo.subscription_period_days === 365 ? 'year' : 'month',
        interval_count: planInfo.subscription_period_days === 365 ? 1 : 6,
      },
    })
    
    console.log('[create-stripe-checkout] New price created:', price.id)
    
    // Update the plan in the database with the new price ID
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )
    
    await supabase
      .from('subscription_plans')
      .update({ stripe_price_id: price.id })
      .eq('id', planInfo.id)
    
    console.log('[create-stripe-checkout] Updated plan with new price ID')
    
    return newProduct
  }
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
    
    // Detect Stripe environment
    const stripeEnvironment = detectStripeEnvironment(stripeSecretKey || '')
    console.log('[create-stripe-checkout] Stripe environment detected:', stripeEnvironment)
    
    console.log('[create-stripe-checkout] Environment check:', {
      hasStripeKey: !!stripeSecretKey,
      hasSupabaseUrl: !!supabaseUrl,
      hasServiceKey: !!supabaseServiceKey,
      hasFrontendUrl: !!frontendUrl,
      stripeEnvironment
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
    const Stripe = (await import('https://esm.sh/stripe@12.18.0')).default
    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2023-10-16',
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

    console.log('[create-stripe-checkout] Plan query result:', { planInfo, planError })

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

    // Verify if the product exists in Stripe before fetching prices
    console.log('[create-stripe-checkout] Verifying product exists in Stripe:', stripeProductId)
    console.log('[create-stripe-checkout] Using Stripe environment:', stripeEnvironment)
    
    try {
      const product = await stripe.products.retrieve(stripeProductId)
      console.log('[create-stripe-checkout] Product found in Stripe:', {
        productId: product.id,
        productName: product.name,
        productActive: product.active
      })
    } catch (productError) {
      console.error('[create-stripe-checkout] Product verification failed:', {
        productId: stripeProductId,
        error: productError.message,
        errorCode: productError.code,
        errorType: productError.type,
        stripeEnvironment
      })
      
      // Log all available products for debugging
      try {
        const allProducts = await stripe.products.list({ limit: 100 })
        console.log('[create-stripe-checkout] Available products in Stripe:', 
          allProducts.data.map(p => ({ id: p.id, name: p.name, active: p.active }))
        )
      } catch (listError) {
        console.error('[create-stripe-checkout] Failed to list products:', listError.message)
      }
      
      // If we're in test mode but the product exists in production, provide a helpful error
      if (stripeEnvironment === 'test') {
        return new Response(
          JSON.stringify({ 
            error: 'Produto não encontrado no ambiente de teste', 
            details: `O produto ${stripeProductId} não existe no ambiente de teste do Stripe, mas pode existir no ambiente de produção. Verifique se está usando as chaves corretas.`,
            productId: stripeProductId,
            stripeEnvironment,
            suggestion: 'Configure a chave de produção do Stripe (sk_live_...) para acessar produtos de produção'
          }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      } else {
        return new Response(
          JSON.stringify({ 
            error: 'Produto não encontrado no Stripe', 
            details: `O produto ${stripeProductId} não existe ou foi removido do Stripe. Entre em contato com o suporte.`,
            productId: stripeProductId,
            stripeEnvironment,
            suggestion: 'Verifique se o produto foi criado corretamente no dashboard do Stripe'
          }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    }

    // Get Stripe prices for the product
    console.log('[create-stripe-checkout] Fetching Stripe prices for product:', stripeProductId)
    let prices
    try {
      prices = await stripe.prices.list({
        product: stripeProductId,
        active: true,
      })
    } catch (stripeError) {
      console.error('[create-stripe-checkout] Stripe error fetching prices:', {
        productId: stripeProductId,
        error: stripeError.message,
        errorCode: stripeError.code,
        errorType: stripeError.type
      })
      return new Response(
        JSON.stringify({ 
          error: 'Erro ao buscar preços do produto', 
          details: `Erro ao buscar preços para o produto ${stripeProductId}: ${stripeError.message}`,
          productId: stripeProductId 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('[create-stripe-checkout] Stripe prices found:', prices.data.length)

    if (prices.data.length === 0) {
      console.error('[create-stripe-checkout] No prices found for product:', stripeProductId)
      return new Response(
        JSON.stringify({ 
          error: 'Nenhum preço encontrado para o produto', 
          details: `O produto ${stripeProductId} não possui preços ativos no Stripe.`,
          productId: stripeProductId 
        }),
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
      console.log('[create-stripe-checkout] Calling Stripe customers.list...')
      const existingCustomers = await stripe.customers.list({
        email: companyData.contact_email,
        limit: 1,
      })
      console.log('[create-stripe-checkout] Stripe customers.list response:', existingCustomers.data.length)

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
      console.error('[create-stripe-checkout] Customer error details:', {
        message: customerError.message,
        stack: customerError.stack,
        name: customerError.name
      })
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
      // Configuração para permitir cupons - versão melhorada
      allow_promotion_codes: true,
      billing_address_collection: 'required',
      // Configurações adicionais para melhorar a experiência
      payment_method_collection: 'always',
      customer_update: {
        address: 'auto',
        name: 'auto',
      },
      // Configuração específica para assinaturas com cupons
      subscription_data: {
        metadata: {
          company_name: companyData.name,
          plan_id: planId,
        },
      },
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
        // Flag para indicar que cupons estão habilitados
        allow_coupons: 'true',
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