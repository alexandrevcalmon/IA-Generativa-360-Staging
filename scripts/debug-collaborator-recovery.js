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

async function debugCollaboratorRecovery() {
  console.log('🔍 Debug: Recuperação de Senha de Colaboradores');
  console.log('===============================================\n');

  // Email do colaborador que você está testando
  const testEmail = 'colaborador@exemplo.com'; // Substitua pelo email real
  
  console.log(`📧 Testando recuperação para: ${testEmail}`);
  console.log(`🔄 URL de redirecionamento: ${process.env.VITE_FRONTEND_URL || 'http://localhost:8081'}/reset-password`);

  try {
    // 1. Verificar se o usuário existe no auth
    console.log('\n1️⃣ Verificando se usuário existe no auth...');
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
    
    if (listError) {
      console.error('❌ Erro ao listar usuários:', listError.message);
      return;
    }

    const authUser = users?.find(u => u.email === testEmail);
    if (authUser) {
      console.log('✅ Usuário encontrado no auth');
      console.log(`   - ID: ${authUser.id}`);
      console.log(`   - Email: ${authUser.email}`);
      console.log(`   - Role: ${authUser.user_metadata?.role || 'N/A'}`);
      console.log(`   - Email confirmado: ${authUser.email_confirmed_at ? 'Sim' : 'Não'}`);
    } else {
      console.log('❌ Usuário NÃO encontrado no auth');
    }

    // 2. Verificar se existe na tabela company_users
    console.log('\n2️⃣ Verificando se existe na tabela company_users...');
    const { data: collaborator, error: collaboratorError } = await supabase
      .from('company_users')
      .select(`
        id, 
        name, 
        email, 
        auth_user_id, 
        is_active,
        companies:company_id(name)
      `)
      .eq('email', testEmail)
      .maybeSingle();

    if (collaboratorError) {
      console.error('❌ Erro ao buscar colaborador:', collaboratorError.message);
    } else if (collaborator) {
      console.log('✅ Colaborador encontrado na tabela company_users');
      console.log(`   - Nome: ${collaborator.name}`);
      console.log(`   - Email: ${collaborator.email}`);
      console.log(`   - Auth User ID: ${collaborator.auth_user_id || 'NÃO VINCULADO'}`);
      console.log(`   - Empresa: ${collaborator.companies?.name || 'N/A'}`);
      console.log(`   - Ativo: ${collaborator.is_active ? 'Sim' : 'Não'}`);
    } else {
      console.log('❌ Colaborador NÃO encontrado na tabela company_users');
    }

    // 3. Tentar enviar email de recuperação
    console.log('\n3️⃣ Tentando enviar email de recuperação...');
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(testEmail, {
      redirectTo: `${process.env.VITE_FRONTEND_URL || 'http://localhost:8081'}/reset-password`,
    });

    if (resetError) {
      console.error('❌ Erro ao enviar email de recuperação:', resetError.message);
      
      if (resetError.message.includes('User not found')) {
        console.log('\n🔧 DIAGNÓSTICO: Usuário não encontrado no auth');
        console.log('💡 SOLUÇÕES:');
        console.log('   1. Verificar se o colaborador foi criado corretamente');
        console.log('   2. Verificar se o auth_user_id está vinculado na tabela company_users');
        console.log('   3. Verificar se o email está correto');
      } else if (resetError.message.includes('For security purposes')) {
        console.log('\n🔧 DIAGNÓSTICO: Muitas tentativas');
        console.log('💡 SOLUÇÃO: Aguardar alguns minutos antes de tentar novamente');
      }
    } else {
      console.log('✅ Email de recuperação enviado com sucesso!');
      console.log('📋 Verifique a caixa de entrada do email');
    }

    // 4. Verificar configuração do Supabase
    console.log('\n4️⃣ Verificando configuração do Supabase...');
    console.log(`   - Supabase URL: ${SUPABASE_URL ? '✅ Configurada' : '❌ Não configurada'}`);
    console.log(`   - Supabase Anon Key: ${SUPABASE_ANON_KEY ? '✅ Configurada' : '❌ Não configurada'}`);
    console.log(`   - Frontend URL: ${process.env.VITE_FRONTEND_URL || 'http://localhost:8081'}`);
    console.log(`   - Redirect URL: ${process.env.VITE_FRONTEND_URL || 'http://localhost:8081'}/reset-password`);

  } catch (error) {
    console.error('❌ Erro inesperado:', error.message);
  }
}

async function checkAllCollaborators() {
  console.log('\n📋 Listando TODOS os colaboradores no sistema...');
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
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Erro ao buscar colaboradores:', error.message);
      return;
    }

    if (!collaborators || collaborators.length === 0) {
      console.log('⚠️ Nenhum colaborador encontrado no sistema');
      console.log('💡 Para testar recuperação de senha:');
      console.log('   1. Crie um colaborador via área de colaboradores');
      console.log('   2. Aguarde o email de convite');
      console.log('   3. Ative a conta do colaborador');
      console.log('   4. Teste a recuperação de senha');
      return;
    }

    console.log(`✅ Encontrados ${collaborators.length} colaboradores:`);
    console.log('');

    collaborators.forEach((collaborator, index) => {
      const status = collaborator.auth_user_id ? '✅ Ativo' : '❌ Pendente';
      const authStatus = collaborator.auth_user_id ? 'Vinculado' : 'Não vinculado';
      
      console.log(`${index + 1}. ${collaborator.name}`);
      console.log(`   📧 ${collaborator.email}`);
      console.log(`   🏢 ${collaborator.companies?.name || 'N/A'}`);
      console.log(`   🔐 Status: ${status}`);
      console.log(`   🔑 Auth User: ${authStatus}`);
      console.log(`   📅 Criado: ${new Date(collaborator.created_at).toLocaleDateString('pt-BR')}`);
      console.log('');
    });

    // Mostrar estatísticas
    const total = collaborators.length;
    const withAuth = collaborators.filter(c => c.auth_user_id).length;
    const withoutAuth = total - withAuth;

    console.log('📊 Estatísticas:');
    console.log(`   - Total: ${total}`);
    console.log(`   - Com auth_user_id: ${withAuth}`);
    console.log(`   - Sem auth_user_id: ${withoutAuth}`);
    console.log(`   - Taxa de ativação: ${((withAuth / total) * 100).toFixed(1)}%`);

  } catch (error) {
    console.error('❌ Erro ao verificar colaboradores:', error.message);
  }
}

async function main() {
  console.log('🚀 Iniciando Debug de Recuperação de Colaboradores\n');
  
  await checkAllCollaborators();
  await debugCollaboratorRecovery();
  
  console.log('\n📋 Resumo do Debug');
  console.log('==================');
  console.log('✅ Status dos colaboradores verificado');
  console.log('✅ Configuração do Supabase verificada');
  console.log('✅ Função de recuperação testada');
  console.log('\n💡 Para resolver o problema:');
  console.log('1. Verifique se o colaborador existe no sistema');
  console.log('2. Verifique se o auth_user_id está vinculado');
  console.log('3. Verifique se o email está correto');
  console.log('4. Teste com um colaborador que tem auth_user_id');
  console.log('5. Verifique os logs do console do navegador');
}

main().catch(console.error); 