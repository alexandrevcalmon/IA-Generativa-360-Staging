// Edge Function para processar webhooks do Stripe
// IMPORTANTE: Esta função NÃO deve ter verify_jwt habilitado
// pois o Stripe não envia tokens de autorização do Supabase
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@14.21.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2024-12-18.acacia',
    })

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const signature = req.headers.get('stripe-signature')
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')

    const body = await req.text();

    console.log('🔧 Debug - Received signature:', signature);
    console.log('🔧 Debug - Webhook secret (masked):', webhookSecret ? webhookSecret.substring(0, 10) + '...' : 'MISSING');
    console.log('🔧 Debug - Body length:', body.length);
    console.log('🔧 Debug - Body preview:', body.substring(0, 100));

    let event: Stripe.Event;

    try {
      event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return new Response(
        JSON.stringify({ error: 'Invalid signature' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    console.log('✅ Signature verified successfully');
    // Em produção, não logar dados sensíveis ou payloads completos
    // Apenas logar tipo de evento e erros críticos
    // console.log('📋 Event type:', event.type);
    // console.log('📝 Event data:', JSON.stringify(event.data.object, null, 2));

    try {
      switch (event.type) {
        case 'checkout.session.completed': {
          console.log('🔧 Processing checkout.session.completed');
          const session = event.data.object as Stripe.Checkout.Session;
          console.log('📝 Session metadata:', session.metadata);
          const companyData = JSON.parse(session.metadata?.company_data || '{}');
          console.log('📝 Parsed companyData:', companyData);
          const planId = session.metadata?.plan_id;
          const maxCollaborators = parseInt(session.metadata?.max_collaborators || '0');
          const subscriptionPeriod = session.metadata?.subscription_period;
          console.log('📋 Plan info:', { planId, maxCollaborators, subscriptionPeriod });

          // Calcular data de término da assinatura
          const now = new Date();
          const subscriptionEndsAt = new Date(now);
          if (subscriptionPeriod === 'semestral') {
            subscriptionEndsAt.setMonth(subscriptionEndsAt.getMonth() + 6);
          } else if (subscriptionPeriod === 'anual') {
            subscriptionEndsAt.setFullYear(subscriptionEndsAt.getFullYear() + 1);
          }
          console.log('📅 Subscription dates:', { startsAt: now.toISOString(), endsAt: subscriptionEndsAt.toISOString() });

          // Validação de UF (address_state)
          const validUFs = [
            "AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO"
          ];
          let uf = (companyData.address_state || '').toUpperCase().trim();
          if (!validUFs.includes(uf)) {
            console.warn('⚠️ UF inválido recebido no webhook:', uf, '- será salvo como vazio.');
            uf = '';
          }

          // Criar empresa no banco
          console.log('🗄️ Inserting company into Supabase');
          const { data: company, error: companyError } = await supabase
            .from('companies')
            .insert({
              name: companyData.name,
              official_name: companyData.official_name,
              cnpj: companyData.cnpj,
              email: companyData.email,
              phone: companyData.phone,
              address_street: companyData.address_street,
              address_number: companyData.address_number,
              address_complement: companyData.address_complement,
              address_district: companyData.address_district,
              address_city: companyData.address_city,
              address_state: uf,
              address_zip_code: companyData.address_zip_code,
              contact_name: companyData.contact_name,
              contact_email: companyData.contact_email,
              contact_phone: companyData.contact_phone,
              stripe_customer_id: session.customer as string,
              stripe_subscription_id: session.subscription as string,
              subscription_status: 'active',
              max_collaborators: maxCollaborators,
              subscription_period: subscriptionPeriod,
              subscription_ends_at: subscriptionEndsAt.toISOString(),
              created_via_stripe: true,
            })
            .select()
            .single();

          if (companyError) {
            console.error('❌ Error creating company:', companyError);
            throw companyError;
          }

          console.log('✅ Company created successfully:', company.id);

          // Chamar função de convite de usuário admin
          try {
            const invitePayload = {
              email: companyData.contact_email,
              companyId: company.id,
              companyName: companyData.name,
              contactName: companyData.contact_name
            };
            const inviteUrl = `${Deno.env.get('SUPABASE_URL')}/functions/v1/create-company-auth-user`;
            const inviteRes = await fetch(inviteUrl, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`
              },
              body: JSON.stringify(invitePayload)
            });
            const inviteResult = await inviteRes.json();
            if (!inviteRes.ok) {
              console.error('❌ Erro ao convidar usuário admin:', inviteResult);
            } else {
              console.log('✅ Convite enviado para usuário admin:', inviteResult);
            }
          } catch (inviteErr) {
            console.error('❌ Erro inesperado ao chamar função de convite:', inviteErr);
          }
          break;
        }

        case 'customer.subscription.updated':
        case 'customer.subscription.deleted': {
          console.log('🔧 Processing subscription update/delete');
          const subscription = event.data.object as Stripe.Subscription;
          const status = subscription.status;
          console.log('📋 Subscription status:', status);

          const { error } = await supabase
            .from('companies')
            .update({
              subscription_status: status,
              subscription_ends_at: subscription.ended_at ? new Date(subscription.ended_at * 1000).toISOString() : null,
            })
            .eq('stripe_subscription_id', subscription.id);

          if (error) {
            console.error('❌ Error updating subscription:', error);
            throw error;
          }

          console.log('✅ Subscription updated successfully:', subscription.id);
          break;
        }

        default:
          console.log(`Unhandled event type ${event.type}`);
      }

      return new Response(
        JSON.stringify({ received: true }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    } catch (error) {
      console.error('❌ Error processing webhook:', error);
      return new Response(
        JSON.stringify({
          error: 'Webhook processing failed',
          details: error instanceof Error ? error.message : 'Unknown error'
        }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

  } catch (error) {
    console.error('❌ Error in stripe-webhook:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Webhook processing failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
}) 