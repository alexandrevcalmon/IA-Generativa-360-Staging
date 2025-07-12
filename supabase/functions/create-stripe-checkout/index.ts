import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@14.21.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Mapeamento dos IDs dos produtos e preços de teste do Stripe
const STRIPE_PRODUCT_IDS = {
  starter_5_semestral: 'prod_SedYxAWeBjaMM0',
  starter_5_anual: 'prod_SeddHsdOwwbtyI',
  starter_10_semestral: 'prod_SedjWSI3Hrmmb9',
  starter_10_anual: 'prod_SedlCkXK4ZQjHl',
  starter_25_semestral: 'prod_Sedo2OcgsH2hj1',
  starter_25_anual: 'prod_SedqKdKa09qAb9',
  starter_50_semestral: 'prod_SedtiC1kEgAcMd',
  starter_50_anual: 'prod_SedveLSteTQwQW',
  starter_100_semestral: 'prod_Sedx0hLJDjrbdo',
  starter_100_anual: 'prod_SedzGgwgO66Xj7',
} as const;

const STRIPE_PRICE_IDS = {
  starter_5_semestral: 'price_1RjKHe4gaE84sNi0O6fUvTgq',
  starter_5_anual: 'price_1RjKMM4gaE84sNi0zAzsXkAk',
  starter_10_semestral: 'price_1RjKRd4gaE84sNi0TCQ4mWkK',
  starter_10_anual: 'price_1RjKTx4gaE84sNi0VhePmv8M',
  starter_25_semestral: 'price_1RjKWn4gaE84sNi0yjqw2fMQ',
  starter_25_anual: 'price_1RjKYv4gaE84sNi0qdDSgHZX',
  starter_50_semestral: 'price_1RjKbN4gaE84sNi0V5j1Yurq',
  starter_50_anual: 'price_1RjKdQ4gaE84sNi0qC1LKMZJ',
  starter_100_semestral: 'price_1RjKfV4gaE84sNi0tqJWMmwV',
  starter_100_anual: 'price_1RjKhu4gaE84sNi05XaH5wij',
} as const;

// Configuração dos planos
const STRIPE_PLANS = {
  starter_5_semestral: {
    name: 'Starter 5',
    maxCollaborators: 5,
    period: 'semestral',
    displayName: 'Starter 5 (Semestral)'
  },
  starter_5_anual: {
    name: 'Starter 5',
    maxCollaborators: 5,
    period: 'anual',
    displayName: 'Starter 5 (Anual)'
  },
  starter_10_semestral: {
    name: 'Starter 10',
    maxCollaborators: 10,
    period: 'semestral',
    displayName: 'Starter 10 (Semestral)'
  },
  starter_10_anual: {
    name: 'Starter 10',
    maxCollaborators: 10,
    period: 'anual',
    displayName: 'Starter 10 (Anual)'
  },
  starter_25_semestral: {
    name: 'Starter 25',
    maxCollaborators: 25,
    period: 'semestral',
    displayName: 'Starter 25 (Semestral)'
  },
  starter_25_anual: {
    name: 'Starter 25',
    maxCollaborators: 25,
    period: 'anual',
    displayName: 'Starter 25 (Anual)'
  },
  starter_50_semestral: {
    name: 'Starter 50',
    maxCollaborators: 50,
    period: 'semestral',
    displayName: 'Starter 50 (Semestral)'
  },
  starter_50_anual: {
    name: 'Starter 50',
    maxCollaborators: 50,
    period: 'anual',
    displayName: 'Starter 50 (Anual)'
  },
  starter_100_semestral: {
    name: 'Starter 100',
    maxCollaborators: 100,
    period: 'semestral',
    displayName: 'Starter 100 (Semestral)'
  },
  starter_100_anual: {
    name: 'Starter 100',
    maxCollaborators: 100,
    period: 'anual',
    displayName: 'Starter 100 (Anual)'
  }
} as const;

type PlanId = keyof typeof STRIPE_PLANS;

function getPlanInfo(planId: PlanId) {
  return STRIPE_PLANS[planId];
}

function isValidPlan(planId: string): planId is PlanId {
  return planId in STRIPE_PLANS;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('🔧 Starting create-stripe-checkout function');
    
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeSecretKey) {
      console.error('❌ STRIPE_SECRET_KEY not found in environment');
      throw new Error('Stripe secret key not configured');
    }

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2024-12-18.acacia',
    });

    console.log('✅ Stripe initialized successfully');

    const requestBody = await req.json();
    console.log('📝 Request body:', JSON.stringify(requestBody, null, 2));

    const { planId, companyData } = requestBody;

    // Validar dados obrigatórios
    if (!planId || !companyData?.contact_email || !companyData?.name) {
      console.error('❌ Missing required fields:', { planId, contact_email: companyData?.contact_email, name: companyData?.name });
      return new Response(
        JSON.stringify({
          error: 'Missing required fields: planId, contact_email, and company name'
        }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Validar se o plano existe
    if (!isValidPlan(planId)) {
      console.error('❌ Invalid plan ID:', planId);
      return new Response(
        JSON.stringify({ error: 'Invalid plan ID' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const planInfo = getPlanInfo(planId);
    const stripeProductId = STRIPE_PRODUCT_IDS[planId];
    
    console.log('📋 Plan info:', { planId, planInfo, stripeProductId });

    // Buscar preços do produto no Stripe
    console.log('🔍 Searching for prices for product:', stripeProductId);
    const prices = await stripe.prices.list({
      product: stripeProductId,
      active: true,
    });

    console.log('💰 Found prices:', prices.data.length);

    if (prices.data.length === 0) {
      console.error('❌ No active prices found for product:', stripeProductId);
      return new Response(
        JSON.stringify({ error: 'No active prices found for this plan' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Usar o primeiro preço ativo encontrado
    const price = prices.data[0];
    console.log('💵 Using price:', price.id);

    // Criar ou buscar customer no Stripe
    console.log('👤 Searching for existing customer:', companyData.contact_email);
    let customer;
    const existingCustomers = await stripe.customers.list({
      email: companyData.contact_email,
      limit: 1,
    });

    if (existingCustomers.data.length > 0) {
      customer = existingCustomers.data[0];
      console.log('✅ Found existing customer:', customer.id);
    } else {
      console.log('➕ Creating new customer');
      customer = await stripe.customers.create({
        email: companyData.contact_email,
        name: companyData.contact_name || companyData.name,
        metadata: {
          company_name: companyData.name,
          official_name: companyData.official_name || '',
          cnpj: companyData.cnpj || '',
          phone: companyData.phone || '',
          contact_name: companyData.contact_name || '',
          contact_phone: companyData.contact_phone || '',
        },
        address: companyData.address_street ? {
          line1: `${companyData.address_street}, ${companyData.address_number || ''}`,
          line2: companyData.address_complement || '',
          city: companyData.address_city || '',
          state: companyData.address_state || '',
          postal_code: companyData.address_zip_code || '',
          country: 'BR',
        } : undefined,
      });
      console.log('✅ Created new customer:', customer.id);
    }

    // Criar sessão de checkout
    console.log('🛒 Creating checkout session');
    const session = await stripe.checkout.sessions.create({
      customer: customer.id,
      payment_method_types: ['card', 'boleto'],
      line_items: [
        {
          price: STRIPE_PRICE_IDS[planId],
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `https://staging.grupocalmon.com/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `https://staging.grupocalmon.com/planos`,
      metadata: {
        company_data: JSON.stringify(companyData),
        plan_id: planId,
        max_collaborators: planInfo.maxCollaborators.toString(),
        subscription_period: planInfo.period,
      },
      subscription_data: {
        metadata: {
          company_data: JSON.stringify(companyData),
          plan_id: planId,
          max_collaborators: planInfo.maxCollaborators.toString(),
          subscription_period: planInfo.period,
        },
      },
      tax_id_collection: {
        enabled: true,
      },
      customer_update: {
        name: 'auto',
        address: 'auto',
      },
      locale: 'pt-BR',
    });

    console.log('✅ Checkout session created:', session.id);

    return new Response(
      JSON.stringify({
        sessionId: session.id,
        url: session.url,
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('❌ Error in create-stripe-checkout:', error);
    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
}) 