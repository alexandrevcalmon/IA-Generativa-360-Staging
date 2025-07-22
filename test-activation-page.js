// Script para testar a página de ativação
console.log('🧪 Testando página de ativação...');

// Simular acesso à página de ativação
const testActivationUrl = 'https://staging.grupocalmon.com/activate-account?token=test-token&type=invite';

console.log('📧 URL de teste:', testActivationUrl);

// Verificar se a página carrega corretamente
console.log('✅ Página de ativação deve carregar sem redirecionamento automático');
console.log('✅ Formulário de senha deve aparecer');
console.log('✅ Validação de token deve funcionar');

// Instruções para teste manual
console.log('\n📋 Para testar manualmente:');
console.log('1. Acesse o link de ativação que chegou no email');
console.log('2. Verifique se a página /activate-account carrega');
console.log('3. Verifique se o formulário de senha aparece');
console.log('4. Verifique se não há redirecionamento automático');
console.log('5. Teste o processo de ativação completo');

console.log('\n🔧 Se ainda houver problemas:');
console.log('- Verifique os logs do console do navegador');
console.log('- Verifique se o token está sendo processado corretamente');
console.log('- Verifique se não há erros de JavaScript'); 