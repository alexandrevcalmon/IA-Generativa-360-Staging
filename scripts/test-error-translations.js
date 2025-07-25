import { formatErrorMessage, translateSupabaseError } from '../src/hooks/auth/commonAuthUtils.js';

// Simular erros do Supabase
const testErrors = [
  {
    name: 'Senha igual à anterior',
    error: { message: 'New password should be different from current password' },
    expected: 'A nova senha deve ser diferente da atual.'
  },
  {
    name: 'Senha muito fraca',
    error: { message: 'Password should be at least 6 characters' },
    expected: 'A senha deve ter pelo menos 6 caracteres.'
  },
  {
    name: 'Credenciais inválidas',
    error: { message: 'Invalid login credentials' },
    expected: 'Email ou senha incorretos.'
  },
  {
    name: 'Email não confirmado',
    error: { message: 'Email not confirmed' },
    expected: 'Email não confirmado. Verifique sua caixa de entrada.'
  },
  {
    name: 'Usuário não encontrado',
    error: { message: 'User not found' },
    expected: 'Usuário não encontrado.'
  },
  {
    name: 'Muitas tentativas',
    error: { message: 'For security purposes, please wait before requesting another email' },
    expected: 'Por segurança, aguarde alguns minutos antes de solicitar outro email.'
  },
  {
    name: 'Rate limit',
    error: { message: 'Too many requests' },
    expected: 'Muitas tentativas. Aguarde alguns minutos antes de tentar novamente.'
  },
  {
    name: 'JWT expirado',
    error: { message: 'JWT expired' },
    expected: 'Sua sessão expirou. Faça login novamente.'
  },
  {
    name: 'Token inválido',
    error: { message: 'Invalid JWT' },
    expected: 'Sessão inválida. Faça login novamente.'
  },
  {
    name: 'Email já em uso',
    error: { message: 'User already registered' },
    expected: 'Este email já está em uso. Tente fazer login.'
  },
  {
    name: 'Erro de rede',
    error: { message: 'fetch failed' },
    expected: 'Erro de conexão. Verifique sua internet.'
  },
  {
    name: 'Erro interno',
    error: { message: 'Internal server error' },
    expected: 'Erro interno do servidor.'
  },
  {
    name: 'Erro desconhecido',
    error: { message: 'Some unknown error message' },
    expected: 'Some unknown error message'
  }
];

function testErrorTranslations() {
  console.log('🧪 Testando Traduções de Mensagens de Erro');
  console.log('==========================================\n');

  let passedTests = 0;
  let totalTests = testErrors.length;

  testErrors.forEach((testCase, index) => {
    console.log(`📋 Teste ${index + 1}: ${testCase.name}`);
    
    // Testar função genérica
    const genericResult = formatErrorMessage(testCase.error);
    
    // Testar função específica do Supabase
    const supabaseResult = translateSupabaseError(testCase.error);
    
    console.log(`   Erro original: "${testCase.error.message}"`);
    console.log(`   Tradução genérica: "${genericResult}"`);
    console.log(`   Tradução Supabase: "${supabaseResult}"`);
    console.log(`   Esperado: "${testCase.expected}"`);
    
    // Verificar se pelo menos uma das funções retornou o resultado esperado
    const isCorrect = genericResult === testCase.expected || supabaseResult === testCase.expected;
    
    if (isCorrect) {
      console.log(`   ✅ PASSOU`);
      passedTests++;
    } else {
      console.log(`   ❌ FALHOU`);
    }
    
    console.log('');
  });

  console.log('📊 Resumo dos Testes');
  console.log('====================');
  console.log(`✅ Testes passaram: ${passedTests}/${totalTests}`);
  console.log(`❌ Testes falharam: ${totalTests - passedTests}/${totalTests}`);
  console.log(`📈 Taxa de sucesso: ${((passedTests / totalTests) * 100).toFixed(1)}%`);

  if (passedTests === totalTests) {
    console.log('\n🎉 Todos os testes passaram! As traduções estão funcionando corretamente.');
  } else {
    console.log('\n⚠️ Alguns testes falharam. Verifique as traduções.');
  }

  return passedTests === totalTests;
}

// Testar casos específicos que o usuário mencionou
function testSpecificCases() {
  console.log('\n🔍 Testando Casos Específicos Mencionados');
  console.log('=========================================\n');

  const specificCases = [
    {
      name: 'Senha igual à anterior (caso do usuário)',
      error: { message: 'New password should be different' },
      expected: 'A nova senha deve ser diferente da atual.'
    },
    {
      name: 'Senha muito fraca',
      error: { message: 'Password should be at least 6 characters' },
      expected: 'A senha deve ter pelo menos 6 caracteres.'
    },
    {
      name: 'Credenciais inválidas',
      error: { message: 'Invalid login credentials' },
      expected: 'Email ou senha incorretos.'
    }
  ];

  specificCases.forEach((testCase, index) => {
    console.log(`📋 Caso ${index + 1}: ${testCase.name}`);
    
    const result = translateSupabaseError(testCase.error);
    
    console.log(`   Entrada: "${testCase.error.message}"`);
    console.log(`   Saída: "${result}"`);
    console.log(`   Esperado: "${testCase.expected}"`);
    
    if (result === testCase.expected) {
      console.log(`   ✅ CORRETO`);
    } else {
      console.log(`   ❌ INCORRETO`);
    }
    
    console.log('');
  });
}

// Executar testes
function main() {
  const allTestsPassed = testErrorTranslations();
  testSpecificCases();
  
  console.log('\n💡 Próximos Passos:');
  console.log('1. Verifique se as mensagens de erro estão sendo traduzidas corretamente');
  console.log('2. Teste o fluxo de recuperação de senha');
  console.log('3. Teste o fluxo de alteração de senha');
  console.log('4. Verifique se não há mais mensagens em inglês');
  
  return allTestsPassed;
}

main(); 