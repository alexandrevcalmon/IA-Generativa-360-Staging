// Script para testar o evento checkout.session.completed com dados reais
const testCheckoutSession = {
  type: 'checkout.session.completed',
  data: {
    object: {
      id: 'cs_test_123',
      customer: 'cus_SitJ2vAmG2THS2',
      subscription: 'sub_1RnRWw4gaE84sNi0VWeQ6sEh',
      metadata: {
        company_name: 'Empresa 10',
        contact_name: 'João Silva',
        contact_email: 'joao@empresa10.com',
        contact_phone: '11999999999',
        cnpj: '12.345.678/0001-90',
        address: 'Rua Teste, 123',
        city: 'São Paulo',
        state: 'SP',
        zip_code: '01234-567',
        plan_id: '894f4457-d535-4b95-9d13-afaf0c7ab467',
        max_collaborators: '5',
        subscription_period: '365'
      }
    }
  }
};

async function testCheckoutSessionEvent() {
  try {
    console.log('Testando evento checkout.session.completed...');
    console.log('Dados do evento:', JSON.stringify(testCheckoutSession, null, 2));
    
    const response = await fetch('https://ldlxebhnkayiwksipvyc.supabase.co/functions/v1/stripe-webhook', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxkbHhlYmhua2F5aXdrc2lwdnljIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE2NDA2NTMsImV4cCI6MjA2NzIxNjY1M30.XTc1M64yGVGuY4FnOsy9D3q5Ov1HAoyuZAV8IPwYEZ0',
      },
      body: JSON.stringify(testCheckoutSession),
    });

    console.log('Status da resposta:', response.status);
    const data = await response.json();
    console.log('Resposta da função:', data);

    if (response.ok) {
      console.log('✅ Evento processado com sucesso!');
    } else {
      console.log('❌ Erro no processamento do evento');
    }

  } catch (error) {
    console.error('❌ Erro ao testar evento:', error);
  }
}

// Executar o teste
testCheckoutSessionEvent(); 