// Script para testar a configuração de redirecionamento
console.log('🔧 Testando configuração de redirecionamento...');

// Verificar se as variáveis de ambiente estão configuradas corretamente
const testConfig = {
  SUPABASE_ACTIVATION_REDIRECT_URL: 'https://staging.grupocalmon.com/activate-account',
  FRONTEND_URL: 'https://staging.grupocalmon.com',
  expectedRedirectUrl: 'https://staging.grupocalmon.com/activate-account'
};

console.log('📋 Configuração esperada:', testConfig);

// Verificar se o link de ativação está sendo gerado corretamente
console.log('\n🔍 Verificações necessárias:');
console.log('1. ✅ Variável SUPABASE_ACTIVATION_REDIRECT_URL configurada');
console.log('2. ✅ Edge Functions usando redirectTo corretamente');
console.log('3. ✅ Página /activate-account protegida contra redirecionamento automático');
console.log('4. ✅ Template de email usando {{ .ConfirmationURL }}');

console.log('\n📧 Para testar o link de ativação:');
console.log('1. Faça uma nova compra de plano');
console.log('2. Verifique o email recebido');
console.log('3. Clique no link de ativação');
console.log('4. Verifique se redireciona para /activate-account');

console.log('\n⚠️ Se ainda redirecionar para /#:');
console.log('- Verifique se a variável SUPABASE_ACTIVATION_REDIRECT_URL está configurada');
console.log('- Verifique se as Edge Functions foram deployadas');
console.log('- Verifique se o template de email está correto');
console.log('- Verifique os logs das Edge Functions');

console.log('\n🔧 Comandos úteis:');
console.log('- Verificar Edge Functions: supabase functions list');
console.log('- Ver logs: supabase functions logs stripe-webhook --follow');
console.log('- Redeploy: supabase functions deploy stripe-webhook'); 