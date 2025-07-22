// Script para verificar configurações do Supabase Auth
console.log('🔧 Verificando configurações do Supabase Auth...');

// Configurações que devem estar ativas no Supabase
const requiredConfigs = {
  // Autenticação
  'Email Auth': 'Deve estar habilitado',
  'Email Confirmations': 'Deve estar habilitado',
  'Secure Email Change': 'Deve estar habilitado',
  
  // URLs de redirecionamento
  'Site URL': 'https://staging.grupocalmon.com',
  'Redirect URLs': [
    'https://staging.grupocalmon.com/activate-account',
    'https://staging.grupocalmon.com/auth',
    'https://staging.grupocalmon.com/dashboard'
  ],
  
  // Configurações de email
  'SMTP Host': 'Configurado (Resend ou outro)',
  'SMTP Port': '587 ou 465',
  'SMTP User': 'Configurado',
  'SMTP Pass': 'Configurado',
  
  // Configurações de segurança
  'JWT Expiry': '24 horas (padrão)',
  'Refresh Token Rotation': 'Habilitado',
  'Secure Session Cookie': 'Habilitado'
};

console.log('\n📋 Configurações necessárias:');
Object.entries(requiredConfigs).forEach(([config, description]) => {
  if (Array.isArray(description)) {
    console.log(`- ${config}:`);
    description.forEach(url => console.log(`  • ${url}`));
  } else {
    console.log(`- ${config}: ${description}`);
  }
});

console.log('\n🔧 Para verificar no Supabase Dashboard:');
console.log('1. Vá para Authentication > Settings');
console.log('2. Verifique se Email Auth está habilitado');
console.log('3. Configure as URLs de redirecionamento');
console.log('4. Vá para Authentication > Email Templates');
console.log('5. Verifique se o template "Invite" está configurado');

console.log('\n📧 Configurações de Email Template:');
console.log('1. Template deve usar {{ .ConfirmationURL }}');
console.log('2. URL de redirecionamento deve ser configurada');
console.log('3. Assunto e conteúdo devem estar corretos');

console.log('\n⚠️ Problemas comuns:');
console.log('1. URLs de redirecionamento não configuradas');
console.log('2. Template de email não configurado');
console.log('3. Variáveis de ambiente não definidas');
console.log('4. Edge Functions sem as variáveis necessárias');

console.log('\n🎯 Para resolver o problema de redirecionamento:');
console.log('1. Verifique se SUPABASE_ACTIVATION_REDIRECT_URL está configurada');
console.log('2. Verifique se as URLs estão na lista de redirecionamento permitido');
console.log('3. Verifique se o template de email está correto');
console.log('4. Teste com uma nova compra de plano'); 