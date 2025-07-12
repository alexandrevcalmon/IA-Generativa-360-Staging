import { getPlanInfo } from '@/lib/stripe';
import { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';
import { supabase } from '@/integrations/supabase/client';

// Inicializar Stripe SDK no backend
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
  typescript: true,
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const sig = req.headers['stripe-signature'] as string;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

  let event: Stripe.Event;

  try {
    const body = JSON.stringify(req.body);
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return res.status(400).json({ error: 'Invalid signature' });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const companyData = JSON.parse(session.metadata?.company_data || '{}');
        const planId = session.metadata?.plan_id;
        const maxCollaborators = parseInt(session.metadata?.max_collaborators || '0');
        const subscriptionPeriod = session.metadata?.subscription_period;

        // Calcular data de término da assinatura
        const now = new Date();
        const subscriptionEndsAt = new Date(now);
        if (subscriptionPeriod === 'semestral') {
          subscriptionEndsAt.setMonth(subscriptionEndsAt.getMonth() + 6);
        } else if (subscriptionPeriod === 'anual') {
          subscriptionEndsAt.setFullYear(subscriptionEndsAt.getFullYear() + 1);
        }

        // Criar empresa no banco
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
            address_state: companyData.address_state,
            address_zip_code: companyData.address_zip_code,
            contact_name: companyData.contact_name,
            contact_email: companyData.contact_email,
            contact_phone: companyData.contact_phone,
            stripe_customer_id: session.customer as string,
            stripe_subscription_id: session.subscription as string,
            subscription_status: 'active',
            max_collaborators: maxCollaborators,
            subscription_period: subscriptionPeriod,
            subscription_starts_at: now.toISOString(),
            subscription_ends_at: subscriptionEndsAt.toISOString(),
          })
          .select()
          .single();

        if (companyError) {
          console.error('Error creating company:', companyError);
          throw companyError;
        }

        console.log('Company created successfully:', company.id);
        break;
      }

      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const status = subscription.status;

        const { error } = await supabase
          .from('companies')
          .update({
            subscription_status: status,
            subscription_ends_at: subscription.ended_at ? new Date(subscription.ended_at * 1000).toISOString() : null,
          })
          .eq('stripe_subscription_id', subscription.id);

        if (error) {
          console.error('Error updating subscription:', error);
          throw error;
        }

        console.log('Subscription updated successfully:', subscription.id);
        break;
      }

      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
} 