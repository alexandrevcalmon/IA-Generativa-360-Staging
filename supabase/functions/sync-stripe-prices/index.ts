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
        JSON.stringify({ message: 'No plans found to sync' }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Sync prices for each plan from Stripe
    const syncResults = await Promise.all(
      plans.map(async (plan) => {
        try {
          if (plan.stripe_price_id) {
            const price = await stripe.prices.retrieve(plan.stripe_price_id)
            const stripePrice = price.unit_amount ? price.unit_amount / 100 : 0 // Convert from cents to reais
            
            // Update the plan in database with the real Stripe price
            const { error: updateError } = await supabase
              .from('subscription_plans')
              .update({ 
                price: stripePrice,
                updated_at: new Date().toISOString()
              })
              .eq('id', plan.id)

            if (updateError) {
              console.error(`Error updating plan ${plan.id}:`, updateError)
              return {
                plan_id: plan.id,
                plan_name: plan.name,
                stripe_price_id: plan.stripe_price_id,
                old_price: plan.price,
                new_price: stripePrice,
                success: false,
                error: updateError.message
              }
            }

            return {
              plan_id: plan.id,
              plan_name: plan.name,
              stripe_price_id: plan.stripe_price_id,
              old_price: plan.price,
              new_price: stripePrice,
              success: true
            }
          }
          
          return {
            plan_id: plan.id,
            plan_name: plan.name,
            stripe_price_id: plan.stripe_price_id,
            old_price: plan.price,
            new_price: 0,
            success: false,
            error: 'No stripe_price_id found'
          }
        } catch (error) {
          console.error(`Error syncing price for plan ${plan.id}:`, error)
          return {
            plan_id: plan.id,
            plan_name: plan.name,
            stripe_price_id: plan.stripe_price_id,
            old_price: plan.price,
            new_price: 0,
            success: false,
            error: error.message
          }
        }
      })
    )

    const successfulSyncs = syncResults.filter(r => r.success)
    const failedSyncs = syncResults.filter(r => !r.success)

    return new Response(
      JSON.stringify({ 
        message: `Price sync completed. ${successfulSyncs.length} successful, ${failedSyncs.length} failed.`,
        results: syncResults,
        summary: {
          total: syncResults.length,
          successful: successfulSyncs.length,
          failed: failedSyncs.length
        }
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Sync prices error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
}) 