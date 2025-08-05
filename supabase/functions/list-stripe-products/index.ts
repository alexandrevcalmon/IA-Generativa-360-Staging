import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

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
    const stripe = new (await import('https://esm.sh/stripe@14.21.0')).default(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2024-12-18.acacia',
    })

    console.log('Fetching Stripe products...')
    
    // Get all active products from Stripe
    const products = await stripe.products.list({
      active: true,
      limit: 100,
    })

    console.log(`Found ${products.data.length} active products`)

    // Get prices for each product
    const productsWithPrices = await Promise.all(
      products.data.map(async (product) => {
        try {
          const prices = await stripe.prices.list({
            product: product.id,
            active: true,
          })

          return {
            id: product.id,
            name: product.name,
            description: product.description,
            active: product.active,
            created: product.created,
            prices: prices.data.map(price => ({
              id: price.id,
              unit_amount: price.unit_amount,
              currency: price.currency,
              recurring: price.recurring,
              active: price.active,
            }))
          }
        } catch (error) {
          console.error(`Error fetching prices for product ${product.id}:`, error)
          return {
            id: product.id,
            name: product.name,
            description: product.description,
            active: product.active,
            created: product.created,
            prices: [],
            error: error.message
          }
        }
      })
    )

    return new Response(
      JSON.stringify({ 
        message: `Found ${products.data.length} active products in Stripe`,
        products: productsWithPrices,
        total: products.data.length
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('List products error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})