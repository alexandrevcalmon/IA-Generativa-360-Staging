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
    const stripe = new (await import('https://esm.sh/stripe@14.21.0')).default(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2024-12-18.acacia',
    })

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

    // Fetch prices for each plan from Stripe
    const plansWithPrices = await Promise.all(
      plans.map(async (plan) => {
        try {
          if (plan.stripe_price_id) {
            const price = await stripe.prices.retrieve(plan.stripe_price_id)
            return {
              ...plan,
              price: price.unit_amount ? price.unit_amount / 100 : 0, // Convert from cents to reais
              currency: price.currency?.toUpperCase() || 'BRL'
            }
          }
          return {
            ...plan,
            price: 0,
            currency: 'BRL'
          }
        } catch (error) {
          console.error(`Error fetching price for plan ${plan.id}:`, error)
          return {
            ...plan,
            price: 0,
            currency: 'BRL'
          }
        }
      })
    )

    return new Response(
      JSON.stringify({ plans: plansWithPrices }),
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