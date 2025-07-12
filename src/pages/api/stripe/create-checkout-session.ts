import { getPlanInfo, isValidPlan } from '@/lib/stripe';
import { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';

// Inicializar Stripe SDK no backend
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
  typescript: true,
});

interface CheckoutRequestBody {
  planId: string;
  companyData: {
    name: string;
    official_name?: string;
    cnpj?: string;
    email: string;
    phone?: string;
    address_street?: string;
    address_number?: string;
    address_complement?: string;
    address_district?: string;
    address_city?: string;
    address_state?: string;
    address_zip_code?: string;
    contact_name?: string;
    contact_email: string;
    contact_phone?: string;
  };
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { planId, companyData }: CheckoutRequestBody = req.body;

    // Validar dados obrigatórios
    if (!planId || !companyData?.contact_email || !companyData?.name) {
      return res.status(400).json({
        error: 'Missing required fields: planId, contact_email, and company name'
      });
    }

    // Validar se o plano existe
    if (!isValidPlan(planId)) {
      return res.status(400).json({
        error: 'Invalid plan ID'
      });
    }

    const planInfo = getPlanInfo(planId);
    if (!planInfo) {
      return res.status(400).json({
        error: 'Plan information not found'
      });
    }

    // Buscar preços do produto no Stripe
    const prices = await stripe.prices.list({
      product: planId,
      active: true,
    });

    if (prices.data.length === 0) {
      return res.status(400).json({
        error: 'No active prices found for this plan'
      });
    }

    // Usar o primeiro preço ativo encontrado
    const price = prices.data[0];

    // Criar ou buscar customer no Stripe
    let customer;
    const existingCustomers = await stripe.customers.list({
      email: companyData.contact_email,
      limit: 1,
    });

    if (existingCustomers.data.length > 0) {
      customer = existingCustomers.data[0];
    } else {
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
    }

    // Criar sessão de checkout
    const session = await stripe.checkout.sessions.create({
      customer: customer.id,
      payment_method_types: ['card', 'boleto'],
      line_items: [
        {
          price: price.id,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.VITE_APP_URL || 'https://staging.grupocalmon.com'}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.VITE_APP_URL || 'https://staging.grupocalmon.com'}/planos`,
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
      automatic_tax: {
        enabled: true,
      },
      tax_id_collection: {
        enabled: true,
      },
      locale: 'pt-BR',
    });

    res.status(200).json({
      sessionId: session.id,
      url: session.url,
    });

  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 