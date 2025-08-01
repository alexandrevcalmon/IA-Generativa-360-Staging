import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { 
      status: 200,
      headers: corsHeaders 
    })
  }

  try {
    // Initialize Stripe
    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY') || ''
    console.log(`Stripe key length: ${stripeKey.length}`)
    console.log(`Stripe key starts with: ${stripeKey.substring(0, 10)}...`)
    
    const stripe = new (await import('https://esm.sh/stripe@14.21.0')).default(stripeKey, {
      apiVersion: '2024-12-18.acacia',
    })

    // Test Stripe connectivity
    let diagnosticInfo = {
      stripeKeyLength: stripeKey.length,
      stripeKeyPrefix: stripeKey.substring(0, 10),
      accountId: null,
      availableProducts: [],
      testProductFound: false,
      testProductPrices: [],
      connectionError: null
    }
    
    try {
      const account = await stripe.accounts.retrieve()
      diagnosticInfo.accountId = account.id
      console.log(`Connected to Stripe account: ${account.id}`)
      
      // List available products to debug
      const products = await stripe.products.list({ limit: 10 })
      diagnosticInfo.availableProducts = products.data.map(p => ({ id: p.id, name: p.name }))
      console.log(`Available products:`, products.data.map(p => ({ id: p.id, name: p.name })))
      
      // Test retrieving a specific product
      try {
        const testProduct = await stripe.products.retrieve('prod_SlSXMZzwJie1z0')
        diagnosticInfo.testProductFound = true
        console.log(`Test product found:`, testProduct.name)
        
        // List prices for this product
        const prices = await stripe.prices.list({ product: 'prod_SlSXMZzwJie1z0' })
        diagnosticInfo.testProductPrices = prices.data.map(p => ({ id: p.id, unit_amount: p.unit_amount }))
        console.log(`Prices for product:`, prices.data.map(p => ({ id: p.id, unit_amount: p.unit_amount })))
      } catch (productError) {
        diagnosticInfo.connectionError = productError.message
        console.error(`Error retrieving test product:`, productError.message)
      }
      
    } catch (accountError) {
      diagnosticInfo.connectionError = accountError.message
      console.error('Error connecting to Stripe:', accountError.message)
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Get all plans from database
    const { data: plans, error: plansError } = await supabase
      .from('subscription_plans')
      .select('*')
      .order('max_collaborators', { ascending: true })

    if (plansError) {
      console.error('Database error:', plansError)
      return new Response(
        JSON.stringify({ error: 'Failed to fetch plans from database' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    if (!plans || plans.length === 0) {
      return new Response(
        JSON.stringify({ plans: [] }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Use prices directly from database (already synced with Stripe)
    const plansWithPrices = plans.map(plan => {
      // Use the price from database (already in monthly format)
      const monthlyPrice = plan.price ? parseFloat(plan.price) : 0
      
      return {
        ...plan,
        price: monthlyPrice, // Monthly price
        monthlyPrice: monthlyPrice,
        currency: 'BRL',
        debug: {
          usingDatabasePrice: true,
          originalPrice: plan.price
        }
      }
    })

    return new Response(
      JSON.stringify({ 
        plans: plansWithPrices,
        diagnostic: diagnosticInfo
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Get prices error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
}) 