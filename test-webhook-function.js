// Script para testar a função stripe-webhook
const testWebhookData = {
  id: "evt_1RnUEO4gaE84sNi0tE7HWJ1u",
  object: "event",
  api_version: "2025-06-30.basil",
  created: 1753144735,
  data: {
    object: {
      id: "in_1RnUEK4gaE84sNi07zTxZc8N",
      object: "invoice",
      customer: "cus_Siw5aHN3VjPSZ6",
      subscription: "sub_1RnUEK4gaE84sNi099zWykGe",
      status: "paid",
      amount_paid: 24600,
      currency: "brl"
    }
  },
  type: "invoice.payment_succeeded"
};

async function testWebhookFunction() {
  try {
    console.log('Testando função stripe-webhook...');
    console.log('Dados de teste:', JSON.stringify(testWebhookData, null, 2));
    
    const response = await fetch('https://ldlxebhnkayiwksipvyc.supabase.co/functions/v1/stripe-webhook', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'stripe-signature': 'test-signature',
      },
      body: JSON.stringify(testWebhookData),
    });

    console.log('Status da resposta:', response.status);
    console.log('Headers da resposta:', Object.fromEntries(response.headers.entries()));

    const data = await response.json();
    console.log('Resposta da função:', data);

  } catch (error) {
    console.error('❌ Erro ao testar função:', error);
  }
}

// Executar o teste
testWebhookFunction(); 