// Script de teste para a função create-stripe-checkout
const testData = {
  companyData: {
    name: "Empresa Teste",
    contact_name: "João Silva",
    contact_email: "joao@empresateste.com",
    contact_phone: "11999999999",
    cnpj: "12.345.678/0001-90",
    address_street: "Rua Teste, 123",
    address_city: "São Paulo",
    address_state: "SP",
    address_zip_code: "01234-567"
  },
  planId: "894f4457-d535-4b95-9d13-afaf0c7ab467"
};

console.log('Dados de teste:', JSON.stringify(testData, null, 2));

// URL da função
const functionUrl = 'https://ldlxebhnkayiwksipvyc.supabase.co/functions/v1/create-stripe-checkout';

console.log('URL da função:', functionUrl);
console.log('Para testar, faça uma requisição POST para:', functionUrl);
console.log('Com os dados:', JSON.stringify(testData, null, 2)); 