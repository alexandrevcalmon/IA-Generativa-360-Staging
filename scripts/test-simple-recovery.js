import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ Variáveis de ambiente do Supabase não encontradas');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testSimpleRecovery() {
  console.log('🔐 Teste Simples de Recuperação de Senha');
  console.log('========================================\n');

  // Email para testar (substitua pelo email real que você está testando)
  const testEmail = 'teste@exemplo.com'; // ⚠️ SUBSTITUA PELO EMAIL REAL
  
  console.log(`📧 Testando recuperação para: ${testEmail}`);
  console.log(`🔄 URL de redirecionamento: ${process.env.VITE_FRONTEND_URL || 'http://localhost:8081'}/reset-password`);

  try {
    console.log('\n📤 Enviando email de recuperação...');
    
    const { error } = await supabase.auth.resetPasswordForEmail(testEmail, {
      redirectTo: `${process.env.VITE_FRONTEND_URL || 'http://localhost:8081'}/reset-password`,
    });

    if (error) {
      console.error('❌ Erro ao enviar email de recuperação:', error.message);
      
      if (error.message.includes('User not found')) {
        console.log('\n🔧 DIAGNÓSTICO: Usuário não encontrado');
        console.log('💡 POSSÍVEIS CAUSAS:');
        console.log('   1. O email não existe no sistema');
        console.log('   2. O colaborador não foi criado corretamente');
        console.log('   3. O colaborador não ativou a conta');
        console.log('   4. O auth_user_id não está vinculado');
        console.log('\n💡 SOLUÇÕES:');
        console.log('   1. Verifique se o email está correto');
        console.log('   2. Crie um colaborador via área de colaboradores');
        console.log('   3. Aguarde o email de convite e ative a conta');
        console.log('   4. Teste novamente a recuperação');
      } else if (error.message.includes('For security purposes')) {
        console.log('\n🔧 DIAGNÓSTICO: Muitas tentativas');
        console.log('💡 SOLUÇÃO: Aguardar alguns minutos antes de tentar novamente');
      } else {
        console.log('\n🔧 DIAGNÓSTICO: Erro desconhecido');
        console.log('💡 Verifique os logs do Supabase para mais detalhes');
      }
    } else {
      console.log('✅ Email de recuperação enviado com sucesso!');
      console.log('📋 Verifique a caixa de entrada do email');
      console.log('🔗 O link deve redirecionar para: /reset-password');
      console.log('\n💡 PRÓXIMOS PASSOS:');
      console.log('   1. Abra o email recebido');
      console.log('   2. Clique no link de recuperação');
      console.log('   3. Verifique se redireciona para /reset-password');
      console.log('   4. Teste a redefinição da senha');
      console.log('   5. Verifique se consegue fazer login com a nova senha');
    }

  } catch (error) {
    console.error('❌ Erro inesperado:', error.message);
  }
}

async function checkConfiguration() {
  console.log('\n⚙️ Verificando Configuração');
  console.log('===========================\n');

  console.log(`🔗 Supabase URL: ${SUPABASE_URL ? '✅ Configurada' : '❌ Não configurada'}`);
  console.log(`🔑 Supabase Anon Key: ${SUPABASE_ANON_KEY ? '✅ Configurada' : '❌ Não configurada'}`);
  console.log(`🌐 Frontend URL: ${process.env.VITE_FRONTEND_URL || 'http://localhost:8081'}`);
  console.log(`🔄 Redirect URL: ${process.env.VITE_FRONTEND_URL || 'http://localhost:8081'}/reset-password`);

  // Verificar se a URL de redirecionamento está correta
  const redirectUrl = `${process.env.VITE_FRONTEND_URL || 'http://localhost:8081'}/reset-password`;
  console.log(`\n🔍 URL de redirecionamento completa: ${redirectUrl}`);
  
  if (redirectUrl.includes('localhost:8081')) {
    console.log('⚠️ Usando localhost:8081 - certifique-se de que o servidor está rodando');
  }
}

async function main() {
  console.log('🚀 Iniciando Teste Simples de Recuperação\n');
  
  await checkConfiguration();
  await testSimpleRecovery();
  
  console.log('\n📋 Resumo do Teste');
  console.log('==================');
  console.log('✅ Configuração verificada');
  console.log('✅ Função de recuperação testada');
  console.log('\n💡 Para resolver o problema "Link Inválido":');
  console.log('1. Verifique se o email existe no sistema');
  console.log('2. Verifique se o colaborador foi criado e ativado');
  console.log('3. Verifique se o auth_user_id está vinculado');
  console.log('4. Teste com um email válido');
  console.log('5. Verifique os logs do console do navegador');
  console.log('6. Verifique se a URL de redirecionamento está correta');
  console.log('\n🔧 Se o problema persistir:');
  console.log('- Verifique os logs do Supabase');
  console.log('- Teste com uma conta de empresa (que sabemos que funciona)');
  console.log('- Verifique se os templates de email estão configurados');
}

main().catch(console.error); 