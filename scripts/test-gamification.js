// Script para testar o sistema de gamificação
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function testGamificationSystem() {
  console.log('Testando o sistema de gamificação...');

  try {
    // 1. Verificar se as tabelas existem
    console.log('Verificando tabelas...');
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .in('table_name', ['student_points', 'points_history', 'achievements', 'student_achievements', 'user_daily_gamification_limits']);

    if (tablesError) {
      throw new Error(`Erro ao verificar tabelas: ${tablesError.message}`);
    }

    const existingTables = tables.map(t => t.table_name);
    console.log('Tabelas encontradas:', existingTables);

    // 2. Verificar se as views existem
    console.log('Verificando views...');
    const { data: views, error: viewsError } = await supabase
      .from('information_schema.views')
      .select('table_name')
      .eq('table_schema', 'public')
      .in('table_name', ['global_collaborator_ranking_new', 'global_collaborator_ranking_period_v2']);

    if (viewsError) {
      throw new Error(`Erro ao verificar views: ${viewsError.message}`);
    }

    const existingViews = views.map(v => v.table_name);
    console.log('Views encontradas:', existingViews);

    // 3. Verificar se as funções existem
    console.log('Verificando funções...');
    const { data: functions, error: functionsError } = await supabase
      .from('information_schema.routines')
      .select('routine_name')
      .eq('routine_schema', 'public')
      .in('routine_name', ['check_and_unlock_achievements', 'update_streak_days']);

    if (functionsError) {
      throw new Error(`Erro ao verificar funções: ${functionsError.message}`);
    }

    const existingFunctions = functions.map(f => f.routine_name);
    console.log('Funções encontradas:', existingFunctions);

    // 4. Verificar se os triggers existem
    console.log('Verificando triggers...');
    const { data: triggers, error: triggersError } = await supabase
      .from('information_schema.triggers')
      .select('trigger_name')
      .eq('trigger_schema', 'public')
      .in('trigger_name', ['check_achievements_on_points_update', 'update_streak_on_points_history']);

    if (triggersError) {
      throw new Error(`Erro ao verificar triggers: ${triggersError.message}`);
    }

    const existingTriggers = triggers.map(t => t.trigger_name);
    console.log('Triggers encontrados:', existingTriggers);

    // 5. Testar a função de atribuição de pontos
    console.log('Testando atribuição de pontos...');
    
    // Obter um usuário de teste
    const { data: user, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      throw new Error(`Erro ao obter usuário: ${userError.message}`);
    }
    
    if (!user) {
      throw new Error('Nenhum usuário autenticado encontrado');
    }
    
    // Obter o company_user_id do usuário
    const { data: companyUser, error: companyUserError } = await supabase
      .from('company_users')
      .select('id')
      .eq('auth_user_id', user.id)
      .single();
    
    if (companyUserError) {
      throw new Error(`Erro ao obter company_user: ${companyUserError.message}`);
    }
    
    // Atribuir pontos de teste
    const { data: pointsResult, error: pointsError } = await supabase
      .rpc('award_points_to_student', {
        p_target_student_id: companyUser.id,
        p_points: 5,
        p_action_type: 'test_points',
        p_description: 'Pontos de teste do sistema de gamificação'
      });
    
    if (pointsError) {
      throw new Error(`Erro ao atribuir pontos: ${pointsError.message}`);
    }
    
    console.log('Pontos atribuídos com sucesso:', pointsResult);
    
    // 6. Verificar o histórico de pontos
    console.log('Verificando histórico de pontos...');
    const { data: history, error: historyError } = await supabase
      .from('points_history')
      .select('*')
      .eq('student_id', companyUser.id)
      .eq('action_type', 'test_points')
      .order('earned_at', { ascending: false })
      .limit(1);
    
    if (historyError) {
      throw new Error(`Erro ao verificar histórico: ${historyError.message}`);
    }
    
    console.log('Histórico de pontos:', history);
    
    console.log('Teste concluído com sucesso!');
  } catch (error) {
    console.error('Erro durante o teste:', error);
  }
}

testGamificationSystem();