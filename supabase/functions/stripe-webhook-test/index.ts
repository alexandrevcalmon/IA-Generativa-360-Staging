// Edge Function para testar a verificação de assinatura do Stripe
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

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
    const body = await req.text()
    const signature = req.headers.get('stripe-signature')
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')

    // Log request details
    console.log('Received webhook request')
    console.log('Has signature:', !!signature)
    console.log('Has webhook secret:', !!webhookSecret)
    console.log('Webhook secret length:', webhookSecret?.length || 0)
    console.log('Body length:', body.length)

    // Initialize Stripe
    const stripeModule = await import('https://esm.sh/stripe@15.0.0')
    const stripe = new stripeModule.default(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2025-06-30.basil',
    })

    // Verify webhook signature
    let event
    try {
      console.log('Attempting to construct event...')
      // Usar constructEvent sem await para testar
      event = stripe.webhooks.constructEvent(body, signature || '', webhookSecret || '')
      console.log('Event constructed successfully:', event.type)
    } catch (err) {
      console.error('Webhook signature verification failed:', err)
      return new Response(
        JSON.stringify({ error: `Webhook signature verification failed: ${err.message}` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Return success
    return new Response(
      JSON.stringify({ 
        received: true,
        eventType: event.type,
        eventId: event.id
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Webhook error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})