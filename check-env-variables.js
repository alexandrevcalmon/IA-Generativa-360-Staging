// Script para verificar variáveis de ambiente necessárias para o sistema de autenticação
console.log('🔧 Verificando variáveis de ambiente...');

// Variáveis necessárias para o sistema de autenticação
const requiredEnvVars = {
  // Supabase
  'SUPABASE_URL': 'URL do projeto Supabase',
  'SUPABASE_SERVICE_ROLE_KEY': 'Chave de serviço do Supabase',
  'SUPABASE_ANON_KEY': 'Chave anônima do Supabase',
  
  // URLs de redirecionamento
  'SUPABASE_ACTIVATION_REDIRECT_URL': 'URL de redirecionamento para ativação',
  'FRONTEND_URL': 'URL do frontend',
  
  // Stripe
  'STRIPE_SECRET_KEY': 'Chave secreta do Stripe',
  'STRIPE_WEBHOOK_SECRET': 'Segredo do webhook do Stripe',
  
  // Email
  'RESEND_API_KEY': 'Chave da API do Resend (opcional)',
  
  // APIs Externas
  'IBGE_API_BASE_URL': 'URL da API do IBGE (opcional)'
};

console.log('\n📋 Variáveis necessárias:');
Object.entries(requiredEnvVars).forEach(([varName, description]) => {
  console.log(`- ${varName}: ${description}`);
});

console.log('\n⚠️ Verificações importantes:');
console.log('1. ✅ SUPABASE_ACTIVATION_REDIRECT_URL deve ser: https://staging.grupocalmon.com/activate-account');
console.log('2. ✅ FRONTEND_URL deve ser: https://staging.grupocalmon.com');
console.log('3. ✅ Todas as Edge Functions devem ter essas variáveis configuradas');
console.log('4. ✅ Template de email deve usar {{ .ConfirmationURL }}');

console.log('\n🔧 Para configurar no Supabase Dashboard:');
console.log('1. Vá para Settings > API');
console.log('2. Configure as URLs de redirecionamento');
console.log('3. Vá para Settings > Edge Functions');
console.log('4. Configure as variáveis de ambiente');

console.log('\n📧 Para testar o fluxo completo:');
console.log('1. Verifique se as variáveis estão configuradas');
console.log('2. Faça uma nova compra de plano');
console.log('3. Verifique o email recebido');
console.log('4. Teste o link de ativação');
console.log('5. Verifique os logs das Edge Functions'); 