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

async function testPasswordRecovery() {
  console.log('🔐 Testando Fluxo de Recuperação de Senha');
  console.log('==========================================\n');

  // Email de teste (substitua por um email real)
  const testEmail = 'teste@exemplo.com';
  
  try {
    console.log(`📧 Enviando email de recuperação para: ${testEmail}`);
    
    const { error } = await supabase.auth.resetPasswordForEmail(testEmail, {
      redirectTo: `${process.env.VITE_FRONTEND_URL || 'http://localhost:5173'}/reset-password`,
    });

    if (error) {
      console.error('❌ Erro ao enviar email de recuperação:', error.message);
      
      if (error.message.includes('User not found')) {
        console.log('💡 Dica: O email não existe no sistema. Use um email válido.');
      } else if (error.message.includes('For security purposes')) {
        console.log('💡 Dica: Muitas tentativas. Aguarde alguns minutos.');
      }
    } else {
      console.log('✅ Email de recuperação enviado com sucesso!');
      console.log('📋 Verifique a caixa de entrada do email para o link de recuperação.');
    }

  } catch (error) {
    console.error('❌ Erro inesperado:', error.message);
  }
}

async function testRecoveryToken() {
  console.log('\n🔍 Testando Processamento de Token de Recuperação');
  console.log('==================================================\n');

  // Simular um token de recuperação (em produção, isso viria do email)
  const mockToken = 'mock-recovery-token';
  
  try {
    console.log('🔑 Tentando verificar token de recuperação...');
    
    const { data, error } = await supabase.auth.verifyOtp({
      token_hash: mockToken,
      type: 'recovery',
    });

    if (error) {
      console.log('⚠️ Token inválido (esperado para token mock):', error.message);
      console.log('💡 Em produção, o token seria válido e viria do email.');
    } else {
      console.log('✅ Token verificado com sucesso!');
      console.log('👤 Usuário:', data.user?.email);
    }

  } catch (error) {
    console.error('❌ Erro ao verificar token:', error.message);
  }
}

async function checkSupabaseConfig() {
  console.log('\n⚙️ Verificando Configuração do Supabase');
  console.log('=======================================\n');

  console.log('🔗 Supabase URL:', SUPABASE_URL ? '✅ Configurada' : '❌ Não configurada');
  console.log('🔑 Supabase Anon Key:', SUPABASE_ANON_KEY ? '✅ Configurada' : '❌ Não configurada');
  
  const frontendUrl = process.env.VITE_FRONTEND_URL || 'http://localhost:5173';
  console.log('🌐 Frontend URL:', frontendUrl);
  console.log('🔄 Redirect URL:', `${frontendUrl}/reset-password`);
}

async function main() {
  console.log('🚀 Iniciando Testes de Recuperação de Senha\n');
  
  await checkSupabaseConfig();
  await testPasswordRecovery();
  await testRecoveryToken();
  
  console.log('\n📋 Resumo dos Testes');
  console.log('====================');
  console.log('✅ Configuração do Supabase verificada');
  console.log('✅ Função de envio de email testada');
  console.log('✅ Processamento de token testado');
  console.log('\n💡 Para testar completamente:');
  console.log('1. Use um email real que existe no sistema');
  console.log('2. Clique no link do email recebido');
  console.log('3. Verifique se redireciona para /reset-password');
  console.log('4. Teste a redefinição da senha');
}

main().catch(console.error); 