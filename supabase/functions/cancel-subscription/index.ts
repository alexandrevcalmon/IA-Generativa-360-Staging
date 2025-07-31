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
    const { userId, reason } = requestBody

    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'Missing userId' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get company data for the user
    const { data: companyData, error: companyError } = await supabase
      .from('companies')
      .select('stripe_customer_id, stripe_subscription_id, name')
      .eq('auth_user_id', userId)
      .maybeSingle()

    if (companyError) {
      console.error('Error fetching company data:', companyError)
      return new Response(
        JSON.stringify({ error: 'Failed to fetch company data' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!companyData || !companyData.stripe_subscription_id) {
      return new Response(
        JSON.stringify({ error: 'No active subscription found for this user' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Cancel the subscription at period end
    const subscription = await stripe.subscriptions.update(
      companyData.stripe_subscription_id,
      {
        cancel_at_period_end: true,
        cancellation_details: {
          comment: reason || 'Cancelled by user',
          feedback: 'other'
        }
      }
    )

    // Update company status in database
    const { error: updateError } = await supabase
      .from('companies')
      .update({
        subscription_status: 'canceled',
        subscription_canceled_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('auth_user_id', userId)

    if (updateError) {
      console.error('Error updating company status:', updateError)
      // Don't fail the request, but log the error
    }

    // Log the cancellation event
    const { error: auditError } = await supabase
      .from('audit_logs')
      .insert({
        event_type: 'subscription_cancelled',
        user_id: userId,
        metadata: {
          company_name: companyData.name,
          subscription_id: companyData.stripe_subscription_id,
          reason: reason || 'No reason provided',
          cancelled_at: new Date().toISOString()
        },
        severity: 'medium',
        timestamp: new Date().toISOString()
      })

    if (auditError) {
      console.error('Error logging audit event:', auditError)
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Subscription will be cancelled at the end of the current billing period',
        subscription: {
          id: subscription.id,
          status: subscription.status,
          cancel_at_period_end: subscription.cancel_at_period_end,
          current_period_end: subscription.current_period_end
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Cancel subscription error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
}) 