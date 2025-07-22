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
    console.log('🔧 Starting get-stripe-analytics function');
    
    // Initialize Supabase client
    console.log('🗄️ Initializing Supabase client...');
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    console.log('✅ Supabase client initialized');

    // Initialize Stripe
    console.log('💳 Initializing Stripe...');
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY')
    if (!stripeSecretKey) {
      console.error('❌ STRIPE_SECRET_KEY not found in environment');
      return new Response(
        JSON.stringify({ error: 'Stripe secret key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    const stripe = new (await import('https://esm.sh/stripe@14.21.0')).default(stripeSecretKey, {
      apiVersion: '2024-12-18.acacia',
    })
    console.log('✅ Stripe initialized successfully');

    // Sincronizar preços dos planos automaticamente
    console.log('💰 Syncing plan prices from Stripe...');
    try {
      const { data: plans, error: plansError } = await supabase
        .from('subscription_plans')
        .select('*')
        .order('max_collaborators', { ascending: true });

      if (plansError) {
        console.error('❌ Error fetching plans for sync:', plansError);
      } else if (plans && plans.length > 0) {
        // Sync prices for each plan from Stripe
        const syncResults = await Promise.all(
          plans.map(async (plan) => {
            try {
              if (plan.stripe_price_id) {
                const price = await stripe.prices.retrieve(plan.stripe_price_id);
                const stripePrice = price.unit_amount ? price.unit_amount / 100 : 0; // Convert from cents to reais
                
                // Only update if price has changed
                if (plan.price !== stripePrice) {
                  console.log(`🔄 Updating price for plan ${plan.name}: ${plan.price} → ${stripePrice}`);
                  
                  const { error: updateError } = await supabase
                    .from('subscription_plans')
                    .update({ 
                      price: stripePrice,
                      updated_at: new Date().toISOString()
                    })
                    .eq('id', plan.id);

                  if (updateError) {
                    console.error(`❌ Error updating plan ${plan.id}:`, updateError);
                    return { plan_id: plan.id, success: false, error: updateError.message };
                  }

                  return { plan_id: plan.id, success: true, old_price: plan.price, new_price: stripePrice };
                } else {
                  return { plan_id: plan.id, success: true, no_change: true, price: plan.price };
                }
              }
              
              return { plan_id: plan.id, success: false, error: 'No stripe_price_id found' };
            } catch (error) {
              console.error(`❌ Error syncing price for plan ${plan.id}:`, error);
              return { plan_id: plan.id, success: false, error: error.message };
            }
          })
        );

        const successfulSyncs = syncResults.filter(r => r.success);
        const priceUpdates = syncResults.filter(r => r.success && !r.no_change);
        
        console.log(`✅ Price sync completed: ${successfulSyncs.length}/${plans.length} successful, ${priceUpdates.length} prices updated`);
      }
    } catch (syncError) {
      console.error('❌ Error during price sync:', syncError);
      // Continue with analytics even if price sync fails
    }

    // Get all companies with Stripe subscription IDs
    console.log('🏢 Fetching companies with Stripe subscriptions...');
    const { data: companies, error: companiesError } = await supabase
      .from('companies')
      .select(`
        id,
        name,
        contact_email,
        contact_name,
        subscription_status,
        subscription_ends_at,
        max_collaborators,
        created_at,
        stripe_customer_id,
        stripe_subscription_id,
        subscription_plan_id,
        subscription_plan_data:subscription_plan_id (
          id,
          name,
          price,
          annual_price,
          semester_price
        )
      `)
      .not('stripe_subscription_id', 'is', null)
      .order('created_at', { ascending: false });

    if (companiesError) {
      console.error('❌ Error fetching companies:', companiesError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch companies' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`✅ Found ${companies?.length || 0} companies with Stripe subscriptions`);

    // Process each company's Stripe data
    const companiesWithStripeData = await Promise.all(
      (companies || []).map(async (company) => {
        try {
          console.log(`🔍 Processing Stripe data for company: ${company.name}`);
          
          // Get subscription from Stripe
          const subscription = await stripe.subscriptions.retrieve(company.stripe_subscription_id!, {
            expand: ['items.data.price.product', 'customer']
          });

          // Get collaborators count
          const { data: collaborators, error: collabError } = await supabase
            .from('company_users')
            .select('id, is_active')
            .eq('company_id', company.id);

          if (collabError) {
            console.error(`❌ Error fetching collaborators for ${company.name}:`, collabError);
          }

          const totalCollaborators = collaborators?.length || 0;
          const activeCollaborators = collaborators?.filter(c => c.is_active).length || 0;
          const blockedCollaborators = totalCollaborators - activeCollaborators;

          // Calculate subscription data
          const subscriptionEndsAt = new Date(subscription.current_period_end * 1000);
          const subscriptionItem = subscription.items.data[0];
          const price = subscriptionItem?.price;
          const product = price?.product;

          // Calculate days until expiry
          const today = new Date();
          const diffTime = subscriptionEndsAt.getTime() - today.getTime();
          const daysUntilExpiry = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          const isOverdue = daysUntilExpiry < 0;

          // Check if subscription is active
          const isActive = subscription.status === 'active' || subscription.status === 'trialing';
          const isNotExpired = subscriptionEndsAt > new Date();

          // Update company data in database
          const { error: updateError } = await supabase
            .from('companies')
            .update({
              subscription_status: subscription.status,
              subscription_ends_at: subscriptionEndsAt.toISOString(),
              updated_at: new Date().toISOString()
            })
            .eq('id', company.id);

          if (updateError) {
            console.error(`❌ Error updating company ${company.name}:`, updateError);
          }

          return {
            ...company,
            subscription_status: subscription.status,
            subscription_ends_at: subscriptionEndsAt.toISOString(),
            total_collaborators: totalCollaborators,
            active_collaborators: activeCollaborators,
            blocked_collaborators: blockedCollaborators,
            days_until_expiry: daysUntilExpiry,
            is_overdue: isOverdue,
            last_payment_date: subscriptionEndsAt.toISOString(),
            stripe_data: {
              status: subscription.status,
              current_period_end: subscriptionEndsAt.toISOString(),
              cancel_at_period_end: subscription.cancel_at_period_end,
              plan_name: product?.name || 'Plano Personalizado',
              amount: price?.unit_amount || 0,
              currency: subscription.currency || 'brl',
              subscription_id: subscription.id,
              customer_id: subscription.customer as string
            }
          };
        } catch (error) {
          console.error(`❌ Error processing company ${company.name}:`, error);
          // Return company with basic data if Stripe fails
          return {
            ...company,
            stripe_data: null,
            error: error.message
          };
        }
      })
    );

    // Calculate analytics summary
    const activeSubscriptions = companiesWithStripeData.filter(c => 
      c.subscription_status === 'active' || c.subscription_status === 'trialing'
    );
    
    const overdueSubscriptions = companiesWithStripeData.filter(c => 
      c.subscription_status === 'past_due' || c.is_overdue
    );
    
    const canceledSubscriptions = companiesWithStripeData.filter(c => 
      c.subscription_status === 'canceled'
    );

    // Calculate MRR and revenue
    const monthlyRecurringRevenue = companiesWithStripeData
      .filter(c => c.subscription_status === 'active' || c.subscription_status === 'trialing')
      .reduce((sum, c) => {
        if (c.stripe_data?.amount) {
          return sum + (c.stripe_data.amount / 100); // Convert cents to reais
        }
        return sum;
      }, 0);

    const annualRecurringRevenue = monthlyRecurringRevenue * 12;
    const totalRevenue = monthlyRecurringRevenue;

    // Calculate churn rate
    const totalSubscriptions = companiesWithStripeData.length;
    const churnRate = totalSubscriptions > 0 
      ? (canceledSubscriptions.length / totalSubscriptions) * 100 
      : 0;

    const summary = {
      totalCompanies: companiesWithStripeData.length,
      activeSubscriptions: activeSubscriptions.length,
      overdueSubscriptions: overdueSubscriptions.length,
      canceledSubscriptions: canceledSubscriptions.length,
      totalRevenue,
      totalBlockedCollaborators: companiesWithStripeData.reduce((sum, c) => sum + c.blocked_collaborators, 0),
      companiesAtRisk: companiesWithStripeData.filter(c => 
        c.days_until_expiry !== null && c.days_until_expiry <= 7 && c.days_until_expiry > 0
      ).length,
      monthlyRecurringRevenue,
      annualRecurringRevenue,
      churnRate,
      lastSyncAt: new Date().toISOString()
    };

    // Filter companies in critical situations
    const overdueCompanies = companiesWithStripeData.filter(c => 
      c.subscription_status === 'past_due' || c.is_overdue
    );

    const atRiskCompanies = companiesWithStripeData.filter(c => 
      c.days_until_expiry !== null && c.days_until_expiry <= 7 && c.days_until_expiry > 0
    );

    console.log('✅ Analytics data processed successfully');
    return new Response(
      JSON.stringify({
        success: true,
        companies: companiesWithStripeData,
        summary,
        overdueCompanies,
        atRiskCompanies
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Error in get-stripe-analytics:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
}) 