// Script para testar a criação de empresa
const testCompanyData = {
  name: "Empresa 10",
  contact_name: "João Silva",
  contact_email: "joao@empresa10.com",
  contact_phone: "11999999999",
  cnpj: "12.345.678/0001-90",
  address: "Rua Teste, 123",
  city: "São Paulo",
  state: "SP",
  zip_code: "01234-567",
  plan_id: "894f4457-d535-4b95-9d13-afaf0c7ab467",
  stripe_customer_id: "cus_SitJ2vAmG2THS2",
  stripe_subscription_id: "sub_1RnRWw4gaE84sNi0VWeQ6sEh",
  subscription_starts_at: new Date().toISOString(),
  subscription_ends_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
  max_collaborators: "5"
};

async function testCompanyCreation() {
  try {
    console.log('Testando criação de empresa...');
    console.log('Dados de teste:', JSON.stringify(testCompanyData, null, 2));
    
    const response = await fetch('https://ldlxebhnkayiwksipvyc.supabase.co/functions/v1/stripe-webhook', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxkbHhlYmhua2F5aXdrc2lwdnljIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE2NDA2NTMsImV4cCI6MjA2NzIxNjY1M30.XTc1M64yGVGuY4FnOsy9D3q5Ov1HAoyuZAV8IPwYEZ0',
      },
      body: JSON.stringify({
        type: 'checkout.session.completed',
        data: {
          object: {
            id: 'cs_test_123',
            customer: 'cus_SitJ2vAmG2THS2',
            subscription: 'sub_1RnRWw4gaE84sNi0VWeQ6sEh',
            metadata: {
              company_name: testCompanyData.name,
              contact_name: testCompanyData.contact_name,
              contact_email: testCompanyData.contact_email,
              contact_phone: testCompanyData.contact_phone,
              cnpj: testCompanyData.cnpj,
              address: testCompanyData.address,
              city: testCompanyData.city,
              state: testCompanyData.state,
              zip_code: testCompanyData.zip_code,
              plan_id: testCompanyData.plan_id,
              max_collaborators: testCompanyData.max_collaborators,
              subscription_period: "365"
            }
          }
        }
      }),
    });

    console.log('Status da resposta:', response.status);
    const data = await response.json();
    console.log('Resposta da função:', data);

  } catch (error) {
    console.error('❌ Erro ao testar criação de empresa:', error);
  }
}

// Executar o teste
testCompanyCreation(); 