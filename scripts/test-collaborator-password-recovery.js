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

async function testCollaboratorPasswordRecovery() {
  console.log('👥 Testando Recuperação de Senha para Colaboradores');
  console.log('==================================================\n');

  // Listar colaboradores existentes
  console.log('📋 Buscando colaboradores cadastrados...');
  
  try {
    const { data: collaborators, error: collaboratorsError } = await supabase
      .from('company_users')
      .select(`
        id, 
        name, 
        email, 
        auth_user_id, 
        is_active,
        companies:company_id(name)
      `)
      .eq('is_active', true)
      .limit(5);

    if (collaboratorsError) {
      console.error('❌ Erro ao buscar colaboradores:', collaboratorsError.message);
      return;
    }

    if (!collaborators || collaborators.length === 0) {
      console.log('⚠️ Nenhum colaborador encontrado no sistema');
      console.log('💡 Para testar, crie um colaborador primeiro via área de colaboradores');
      return;
    }

    console.log(`✅ Encontrados ${collaborators.length} colaboradores:`);
    collaborators.forEach((collaborator, index) => {
      console.log(`   ${index + 1}. ${collaborator.name} (${collaborator.email})`);
      console.log(`      - Empresa: ${collaborator.companies?.name || 'N/A'}`);
      console.log(`      - Auth User ID: ${collaborator.auth_user_id ? '✅ Vinculado' : '❌ Não vinculado'}`);
      console.log(`      - Status: ${collaborator.is_active ? 'Ativo' : 'Inativo'}`);
    });

    // Testar com o primeiro colaborador que tem email
    const testCollaborator = collaborators.find(c => c.email && c.auth_user_id);
    
    if (!testCollaborator) {
      console.log('⚠️ Nenhum colaborador com email e auth_user_id encontrado');
      console.log('💡 Colaboradores precisam ter usuário de auth vinculado para recuperação de senha');
      return;
    }

    console.log(`\n🔐 Testando recuperação para: ${testCollaborator.name}`);
    console.log(`📧 Email: ${testCollaborator.email}`);
    console.log(`🏢 Empresa: ${testCollaborator.companies?.name}`);

    const { error } = await supabase.auth.resetPasswordForEmail(testCollaborator.email, {
      redirectTo: `${process.env.VITE_FRONTEND_URL || 'http://localhost:8081'}/reset-password`,
    });

    if (error) {
      console.error('❌ Erro ao enviar email de recuperação:', error.message);
      
      if (error.message.includes('User not found')) {
        console.log('💡 Colaborador não tem usuário de auth vinculado');
        console.log('💡 Isso pode acontecer se o colaborador foi criado mas não ativou a conta');
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

async function checkCollaboratorAuthStatus() {
  console.log('\n🔍 Verificando Status de Autenticação dos Colaboradores');
  console.log('========================================================\n');

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
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) {
      console.error('❌ Erro ao buscar colaboradores:', error.message);
      return;
    }

    if (!collaborators || collaborators.length === 0) {
      console.log('⚠️ Nenhum colaborador encontrado');
      return;
    }

    console.log('📊 Status dos Colaboradores:');
    console.log('=============================');

    collaborators.forEach((collaborator, index) => {
      const status = collaborator.auth_user_id ? '✅ Ativo' : '❌ Pendente de ativação';
      const authStatus = collaborator.auth_user_id ? 'Vinculado' : 'Não vinculado';
      
      console.log(`${index + 1}. ${collaborator.name}`);
      console.log(`   📧 ${collaborator.email}`);
      console.log(`   🏢 ${collaborator.companies?.name || 'N/A'}`);
      console.log(`   🔐 Status: ${status}`);
      console.log(`   🔑 Auth User: ${authStatus}`);
      console.log(`   📅 Criado: ${new Date(collaborator.created_at).toLocaleDateString('pt-BR')}`);
      console.log('');
    });

  } catch (error) {
    console.error('❌ Erro ao verificar status:', error.message);
  }
}

async function testCollaboratorLogin() {
  console.log('\n🔐 Testando Login de Colaboradores');
  console.log('===================================\n');

  try {
    const { data: collaborators, error } = await supabase
      .from('company_users')
      .select('email, auth_user_id')
      .eq('is_active', true)
      .not('auth_user_id', 'is', null)
      .limit(3);

    if (error) {
      console.error('❌ Erro ao buscar colaboradores:', error.message);
      return;
    }

    if (!collaborators || collaborators.length === 0) {
      console.log('⚠️ Nenhum colaborador com auth_user_id encontrado');
      return;
    }

    console.log('🔍 Colaboradores com auth_user_id:');
    collaborators.forEach((collaborator, index) => {
      console.log(`   ${index + 1}. ${collaborator.email} (ID: ${collaborator.auth_user_id})`);
    });

    console.log('\n💡 Para testar login:');
    console.log('1. Use um email de colaborador que existe no sistema');
    console.log('2. Tente fazer login com a senha atual');
    console.log('3. Se falhar, teste a recuperação de senha');

  } catch (error) {
    console.error('❌ Erro ao testar login:', error.message);
  }
}

async function main() {
  console.log('🚀 Iniciando Testes de Recuperação para Colaboradores\n');
  
  await checkCollaboratorAuthStatus();
  await testCollaboratorPasswordRecovery();
  await testCollaboratorLogin();
  
  console.log('\n📋 Resumo dos Testes');
  console.log('====================');
  console.log('✅ Status dos colaboradores verificado');
  console.log('✅ Função de recuperação testada');
  console.log('✅ Login de colaboradores verificado');
  console.log('\n💡 Para testar completamente:');
  console.log('1. Use um email de colaborador que existe no sistema');
  console.log('2. Clique no link do email recebido');
  console.log('3. Verifique se redireciona para /reset-password');
  console.log('4. Teste a redefinição da senha');
  console.log('5. Verifique se o colaborador consegue fazer login com a nova senha');
  console.log('\n🔧 Possíveis problemas:');
  console.log('- Colaborador sem auth_user_id vinculado');
  console.log('- Token de recuperação expirado');
  console.log('- URL de redirecionamento incorreta');
}

main().catch(console.error); 