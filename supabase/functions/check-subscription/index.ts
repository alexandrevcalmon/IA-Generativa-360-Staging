import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
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
    console.log('🔧 Starting check-subscription function');
    
    // Get request body first
    console.log('📝 Parsing request body...');
    const requestBody = await req.json()
    console.log('📄 Request body:', JSON.stringify(requestBody, null, 2));
    const { userId, subscriptionId } = requestBody

    if (!userId && !subscriptionId) {
      return new Response(
        JSON.stringify({ error: 'Missing userId or subscriptionId' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Initialize Supabase client
    console.log('🗄️ Initializing Supabase client...');
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    console.log('✅ Supabase client initialized');

    // Get company data if userId is provided
    let companyData = null;
    let targetSubscriptionId = subscriptionId;
    
    if (userId) {
      console.log('🏢 Fetching company data for userId:', userId);
      const { data: company, error: companyError } = await supabase
        .from('companies')
        .select('id, stripe_subscription_id, stripe_customer_id, subscription_status, subscription_ends_at')
        .eq('id', userId)
        .maybeSingle();

      if (companyError) {
        console.error('❌ Error fetching company data:', companyError);
        return new Response(
          JSON.stringify({ error: 'Failed to fetch company data' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      companyData = company;
      targetSubscriptionId = company?.stripe_subscription_id || subscriptionId;
      console.log('✅ Company data fetched:', companyData);
      console.log('🎯 Target subscription ID:', targetSubscriptionId);
    }

    // If no subscription ID found, return basic company data
    if (!targetSubscriptionId) {
      console.log('⚠️ No subscription ID found, returning basic company data');
      return new Response(
        JSON.stringify({
          success: true,
          message: 'No subscription found',
          userId,
          subscriptionId: targetSubscriptionId,
          companyData
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Stripe
    console.log('💳 Initializing Stripe...');
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
    console.log('🔑 Stripe secret key present:', !!stripeSecretKey);
    console.log('🔑 Stripe secret key length:', stripeSecretKey?.length || 0);
    
    if (!stripeSecretKey) {
      console.error('❌ STRIPE_SECRET_KEY not found in environment');
      return new Response(
        JSON.stringify({ 
          error: 'Stripe secret key not configured',
          debug: {
            hasStripeKey: false,
            envVars: {
              hasSupabaseUrl: !!Deno.env.get('SUPABASE_URL'),
              hasServiceKey: !!Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'),
              hasStripeKey: false
            }
          }
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const stripe = new (await import('https://esm.sh/stripe@14.21.0')).default(stripeSecretKey, {
      apiVersion: '2024-12-18.acacia',
    });
    console.log('✅ Stripe initialized successfully');

    // Get subscription from Stripe with expanded data
    console.log('🔍 Fetching subscription from Stripe:', targetSubscriptionId);
    const subscription = await stripe.subscriptions.retrieve(targetSubscriptionId, {
      expand: ['items.data.price.product', 'customer']
    });
    console.log('✅ Stripe subscription fetched successfully');

    // Calculate new end date
    const subscriptionEndsAt = new Date(subscription.current_period_end * 1000);

    // Get the first item (assuming one subscription item per subscription)
    const subscriptionItem = subscription.items.data[0];
    const price = subscriptionItem?.price;
    const product = price?.product;

    // Update company subscription data if we have company data
    if (companyData) {
      console.log('🔄 Updating company subscription data...');
      const { error: updateError } = await supabase
        .from('companies')
        .update({
          subscription_status: subscription.status,
          subscription_ends_at: subscriptionEndsAt.toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', companyData.id);

      if (updateError) {
        console.error('❌ Error updating company subscription:', updateError);
        // Continue anyway, don't fail the request
      } else {
        console.log('✅ Company subscription data updated');
      }
    }

    // Check if subscription is active
    const isActive = subscription.status === 'active' || subscription.status === 'trialing';
    const isNotExpired = subscriptionEndsAt > new Date();

    console.log('✅ Function completed successfully with Stripe data');
    return new Response(
      JSON.stringify({
        success: true,
        subscription: {
          id: subscription.id,
          status: subscription.status,
          current_period_end: subscription.current_period_end,
          cancel_at_period_end: subscription.cancel_at_period_end,
          currency: subscription.currency,
          items: {
            data: [{
              price: {
                unit_amount: price?.unit_amount,
                currency: price?.currency,
                product: {
                  name: product?.name,
                  description: product?.description
                }
              }
            }]
          },
          customer: subscription.customer,
          isActive: isActive && isNotExpired,
          expiresAt: subscriptionEndsAt.toISOString(),
          daysUntilExpiry: Math.ceil((subscriptionEndsAt.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );


  } catch (error) {
    console.error('Check subscription error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
}) 