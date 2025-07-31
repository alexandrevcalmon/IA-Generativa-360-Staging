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

async function testCompanyPasswordRecovery() {
  console.log('🏢 Testando Recuperação de Senha para Empresas');
  console.log('==============================================\n');

  // Listar empresas existentes
  console.log('📋 Buscando empresas cadastradas...');
  
  try {
    const { data: companies, error: companiesError } = await supabase
      .from('companies')
      .select('id, name, contact_email, auth_user_id')
      .limit(5);

    if (companiesError) {
      console.error('❌ Erro ao buscar empresas:', companiesError.message);
      return;
    }

    if (!companies || companies.length === 0) {
      console.log('⚠️ Nenhuma empresa encontrada no sistema');
      console.log('💡 Para testar, crie uma empresa primeiro via checkout');
      return;
    }

    console.log(`✅ Encontradas ${companies.length} empresas:`);
    companies.forEach((company, index) => {
      console.log(`   ${index + 1}. ${company.name} (${company.contact_email})`);
      console.log(`      - Auth User ID: ${company.auth_user_id ? '✅ Vinculado' : '❌ Não vinculado'}`);
      console.log(`      - Status: ${company.auth_user_id ? 'Ativa' : 'Pendente de ativação'}`);
    });

    // Testar com a primeira empresa que tem email
    const testCompany = companies.find(c => c.contact_email);
    
    if (!testCompany) {
      console.log('⚠️ Nenhuma empresa com email de contato encontrada');
      return;
    }

    console.log(`\n🔐 Testando recuperação para: ${testCompany.name}`);
    console.log(`📧 Email: ${testCompany.contact_email}`);

    const { error } = await supabase.auth.resetPasswordForEmail(testCompany.contact_email, {
      redirectTo: `${process.env.VITE_FRONTEND_URL || 'http://localhost:8081'}/reset-password`,
    });

    if (error) {
      console.error('❌ Erro ao enviar email de recuperação:', error.message);
      
      if (error.message.includes('User not found')) {
        console.log('💡 Empresa não tem usuário de auth vinculado');
        console.log('💡 Isso é normal para empresas recém-criadas');
      } else if (error.message.includes('For security purposes')) {
        console.log('💡 Muitas tentativas. Aguarde alguns minutos.');
      }
    } else {
      console.log('✅ Email de recuperação enviado com sucesso!');
      console.log('📋 Verifique a caixa de entrada do email para o link de recuperação.');
      console.log('🔄 O link deve redirecionar para: /reset-password');
    }

  } catch (error) {
    console.error('❌ Erro inesperado:', error.message);
  }
}

async function checkCompanyAuthStatus() {
  console.log('\n🔍 Verificando Status de Autenticação das Empresas');
  console.log('==================================================\n');

  try {
    const { data: companies, error } = await supabase
      .from('companies')
      .select('id, name, contact_email, auth_user_id, created_at')
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) {
      console.error('❌ Erro ao buscar empresas:', error.message);
      return;
    }

    if (!companies || companies.length === 0) {
      console.log('⚠️ Nenhuma empresa encontrada');
      return;
    }

    console.log('📊 Status das Empresas:');
    console.log('=======================');

    companies.forEach((company, index) => {
      const status = company.auth_user_id ? '✅ Ativa' : '❌ Pendente de ativação';
      
      console.log(`${index + 1}. ${company.name}`);
      console.log(`   📧 ${company.contact_email}`);
      console.log(`   🔐 Status: ${status}`);
      console.log(`   🔑 Auth User: ${company.auth_user_id ? 'Vinculado' : 'Não vinculado'}`);
      console.log(`   📅 Criada: ${new Date(company.created_at).toLocaleDateString('pt-BR')}`);
      console.log('');
    });

  } catch (error) {
    console.error('❌ Erro ao verificar status:', error.message);
  }
}

async function main() {
  console.log('🚀 Iniciando Testes de Recuperação para Empresas\n');
  
  await checkCompanyAuthStatus();
  await testCompanyPasswordRecovery();
  
  console.log('\n📋 Resumo dos Testes');
  console.log('====================');
  console.log('✅ Status das empresas verificado');
  console.log('✅ Função de recuperação testada');
  console.log('\n💡 Para testar completamente:');
  console.log('1. Use um email de empresa que existe no sistema');
  console.log('2. Clique no link do email recebido');
  console.log('3. Verifique se redireciona para /reset-password');
  console.log('4. Teste a redefinição da senha');
  console.log('5. Verifique se o usuário consegue fazer login com a nova senha');
}

main().catch(console.error); 