// Script para testar a função create-stripe-checkout
const testData = {
  companyData: {
    name: "Empresa Teste",
    official_name: "Empresa Teste LTDA",
    cnpj: "12.345.678/0001-90",
    email: "contato@empresateste.com",
    phone: "11999999999",
    address_street: "Rua Teste, 123",
    address_number: "123",
    address_complement: "Sala 1",
    address_district: "Centro",
    address_city: "São Paulo",
    address_state: "SP",
    address_zip_code: "01234-567",
    contact_name: "João Silva",
    contact_email: "joao@empresateste.com",
    contact_phone: "11999999999"
  },
  planId: "894f4457-d535-4b95-9d13-afaf0c7ab467"
};

async function testCheckoutFunction() {
  try {
    console.log('Testando função create-stripe-checkout...');
    console.log('Dados de teste:', JSON.stringify(testData, null, 2));
    
    const response = await fetch('https://ldlxebhnkayiwksipvyc.supabase.co/functions/v1/create-stripe-checkout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxkbHhlYmhua2F5aXdrc2lwdnljIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE2NDA2NTMsImV4cCI6MjA2NzIxNjY1M30.XTc1M64yGVGuY4FnOsy9D3q5Ov1HAoyuZAV8IPwYEZ0',
      },
      body: JSON.stringify(testData),
    });

    console.log('Status da resposta:', response.status);
    console.log('Headers da resposta:', Object.fromEntries(response.headers.entries()));

    const data = await response.json();
    console.log('Resposta da função:', data);

    if (!response.ok) {
      console.error('Erro na função:', data);
      return;
    }

    if (data.checkout_url) {
      console.log('✅ Sucesso! URL de checkout:', data.checkout_url);
    } else {
      console.error('❌ URL de checkout não encontrada na resposta');
    }

  } catch (error) {
    console.error('❌ Erro ao testar função:', error);
  }
}

// Executar o teste
testCheckoutFunction(); 