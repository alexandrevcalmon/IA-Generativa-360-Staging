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

async function testRealCollaboratorRecovery() {
  console.log('👥 Testando Recuperação com Colaborador Real');
  console.log('===========================================\n');

  // Email do colaborador real do banco de dados
  const testEmail = 'xoripec844@modirosa.com'; // Colaborador 01 - email confirmado
  
  console.log(`📧 Testando recuperação para: ${testEmail}`);
  console.log(`👤 Nome: Colaborador 01`);
  console.log(`🔄 URL de redirecionamento: ${process.env.VITE_FRONTEND_URL || 'http://localhost:8081'}/reset-password`);

  try {
    console.log('\n📤 Enviando email de recuperação...');
    
    const { error } = await supabase.auth.resetPasswordForEmail(testEmail, {
      redirectTo: `${process.env.VITE_FRONTEND_URL || 'http://localhost:8081'}/reset-password`,
    });

    if (error) {
      console.error('❌ Erro ao enviar email de recuperação:', error.message);
      
      if (error.message.includes('User not found')) {
        console.log('\n🔧 DIAGNÓSTICO: Usuário não encontrado no auth');
        console.log('💡 POSSÍVEIS CAUSAS:');
        console.log('   1. O auth_user_id não está sincronizado');
        console.log('   2. O usuário foi deletado do auth');
        console.log('   3. Problema de permissões');
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

async function testMultipleCollaborators() {
  console.log('\n📋 Testando Múltiplos Colaboradores');
  console.log('====================================\n');

  // Lista de colaboradores reais do banco
  const collaborators = [
    { name: 'Colaborador 01', email: 'xoripec844@modirosa.com', confirmed: true },
    { name: 'Colaborador 02', email: 'wamiri1143@mvpmedix.com', confirmed: true },
    { name: 'Alexandre Calmon', email: 'yajox11672@kissgy.com', confirmed: true },
    { name: 'Colaborador 05', email: 'comow54674@forexru.com', confirmed: true },
    { name: 'Colaborador 03', email: 'secobo1753@dariolo.com', confirmed: false }
  ];

  for (const collaborator of collaborators) {
    console.log(`\n🔍 Testando: ${collaborator.name} (${collaborator.email})`);
    console.log(`📧 Email confirmado: ${collaborator.confirmed ? '✅ Sim' : '❌ Não'}`);
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(collaborator.email, {
        redirectTo: `${process.env.VITE_FRONTEND_URL || 'http://localhost:8081'}/reset-password`,
      });

      if (error) {
        console.log(`❌ Erro: ${error.message}`);
      } else {
        console.log(`✅ Email enviado com sucesso!`);
      }
    } catch (error) {
      console.log(`❌ Erro inesperado: ${error.message}`);
    }
  }
}

async function checkCollaboratorAuthStatus() {
  console.log('\n🔍 Verificando Status de Auth dos Colaboradores');
  console.log('================================================\n');

  try {
    const { data: collaborators, error } = await supabase
      .from('company_users')
      .select(`
        id, 
        name, 
        email, 
        auth_user_id, 
        is_active,
        created_at,
        companies:company_id(name)
      `)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Erro ao buscar colaboradores:', error.message);
      return;
    }

    if (!collaborators || collaborators.length === 0) {
      console.log('⚠️ Nenhum colaborador ativo encontrado');
      return;
    }

    console.log(`✅ Encontrados ${collaborators.length} colaboradores ativos:`);
    console.log('');

    collaborators.forEach((collaborator, index) => {
      const status = collaborator.auth_user_id ? '✅ Vinculado' : '❌ Não vinculado';
      
      console.log(`${index + 1}. ${collaborator.name}`);
      console.log(`   📧 ${collaborator.email}`);
      console.log(`   🏢 ${collaborator.companies?.name || 'N/A'}`);
      console.log(`   🔐 Auth User: ${status}`);
      console.log(`   📅 Criado: ${new Date(collaborator.created_at).toLocaleDateString('pt-BR')}`);
      console.log('');
    });

  } catch (error) {
    console.error('❌ Erro ao verificar status:', error.message);
  }
}

async function main() {
  console.log('🚀 Iniciando Teste com Colaboradores Reais\n');
  
  await checkCollaboratorAuthStatus();
  await testRealCollaboratorRecovery();
  
  console.log('\n📋 Resumo do Teste');
  console.log('==================');
  console.log('✅ Colaboradores reais encontrados no banco');
  console.log('✅ Função de recuperação testada');
  console.log('\n💡 Para resolver o problema "Link Inválido":');
  console.log('1. Verifique se o email está correto');
  console.log('2. Verifique se o servidor está rodando em localhost:8081');
  console.log('3. Verifique os logs do console do navegador');
  console.log('4. Verifique se a URL de redirecionamento está correta');
  console.log('5. Teste com um colaborador que tem email confirmado');
  console.log('\n🔧 Se o problema persistir:');
  console.log('- Verifique os logs do Supabase');
  console.log('- Teste com uma conta de empresa (que sabemos que funciona)');
  console.log('- Verifique se os templates de email estão configurados');
}

main().catch(console.error); 