
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/auth';

export const useStudentPoints = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: points, isLoading } = useQuery({
    queryKey: ['student-points', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('No user found');

      // First, get the company_users.id based on auth_user_id
      const { data: studentRecord, error: studentError } = await supabase
        .from('company_users')
        .select('id')
        .eq('auth_user_id', user.id)
        .maybeSingle();

      if (studentError) {
        console.error('Error fetching student record:', studentError);
        throw studentError;
      }

      if (!studentRecord) {
        console.log('No student record found for user:', user.id);
        return null;
      }

      const { data, error } = await supabase
        .from('student_points')
        .select('*')
        .eq('student_id', studentRecord.id) // Use company_users.id
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching student points:', error);
        throw error;
      }

      return data;
    },
    enabled: !!user,
  });

  const initializeMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('No user found');

      // First, get the company_users.id based on auth_user_id
      const { data: studentRecord, error: studentError } = await supabase
        .from('company_users')
        .select('id')
        .eq('auth_user_id', user.id)
        .maybeSingle();

      if (studentError) {
        console.error('Error fetching student record:', studentError);
        throw studentError;
      }

      if (!studentRecord) {
        throw new Error('No student record found for user');
      }

      // First check if points record already exists
      const { data: existing } = await supabase
        .from('student_points')
        .select('*')
        .eq('student_id', studentRecord.id) // Use company_users.id
        .maybeSingle();

      if (existing) {
        return existing;
      }

      // Create new points record
      const { data, error } = await supabase
        .from('student_points')
        .insert([{
          student_id: studentRecord.id, // Use company_users.id
          points: 0,
          total_points: 0,
          level: 1,
          streak_days: 0
        }])
        .select()
        .single();

      if (error) {
        console.error('Error initializing student points:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-points'] });
    },
  });

  return {
    data: points, // Return as 'data' to match expected interface
    points, // Keep backward compatibility
    isLoading,
    initializePoints: initializeMutation.mutate,
    isInitializing: initializeMutation.isPending,
  };
};

// Função utilitária para checar e atualizar limites diários
async function checkAndUpdateDailyLimit({ studentId, actionType, maxPerDay }: { studentId: string, actionType: string, maxPerDay: number }) {
  // Buscar o auth.uid() correspondente ao studentId
  let userId = null;
  // Tenta obter o auth.uid() do contexto do Supabase
  const { data: { user } } = await supabase.auth.getUser();
  if (user && user.id) {
    userId = user.id;
  } else {
    // Fallback: buscar na tabela company_users
    const { data: companyUser } = await supabase
      .from('company_users')
      .select('auth_user_id')
      .eq('id', studentId)
      .maybeSingle();
    userId = companyUser?.auth_user_id;
  }
  if (!userId) throw new Error('Não foi possível determinar o auth.uid() para limites diários');
  const today = new Date().toISOString().slice(0, 10);
  const { data: limit, error } = await supabase
    .from('user_daily_gamification_limits')
    .select('*')
    .eq('user_id', userId)
    .eq('action_type', actionType)
    .eq('action_date', today)
    .maybeSingle();
  if (error) throw error;
  if (limit && limit.count >= maxPerDay) return false;
  if (limit) {
    const { error: updateError } = await supabase
      .from('user_daily_gamification_limits')
      .update({ count: limit.count + 1 })
      .eq('id', limit.id);
    if (updateError) throw updateError;
  } else {
    const { error: insertError } = await supabase
      .from('user_daily_gamification_limits')
      .insert({ user_id: userId, action_type: actionType, action_date: today, count: 1 });
    if (insertError) throw insertError;
  }
  return true;
}

// Função utilitária para atribuir/remover pontos ao usuário, com suporte a limites e metadados
export async function awardPointsToStudent({ studentId, points, actionType, description, referenceId, meta, checkLimit, limitPerDay, uniquePerReference }: {
  studentId: string;
  points: number;
  actionType: string;
  description?: string;
  referenceId?: string;
  meta?: any;
  checkLimit?: boolean;
  limitPerDay?: number;
  uniquePerReference?: boolean;
}) {
  console.log('[Gamificação] awardPointsToStudent chamado para', { studentId, points, actionType, description, referenceId, meta });

  // Checar limite diário se necessário
  if (checkLimit && limitPerDay) {
    const allowed = await checkAndUpdateDailyLimit({ studentId, actionType, maxPerDay: limitPerDay });
    if (!allowed) {
      console.log('[Gamificação] Limite diário atingido para', actionType, studentId);
      return { skipped: true, reason: 'daily_limit' };
    }
  }

  // Evitar duplicidade por referência (ex: quiz_passed, primeira resposta, primeira curtida)
  if (uniquePerReference && referenceId) {
    const { data: existing, error: existingError } = await supabase
      .from('points_history')
      .select('id')
      .eq('student_id', studentId)
      .eq('action_type', actionType)
      .eq('reference_id', referenceId)
      .maybeSingle();
    if (existingError) throw existingError;
    if (existing) {
      console.log('[Gamificação] Pontos já atribuídos para esta referência:', { actionType, referenceId });
      return { skipped: true, reason: 'already_awarded' };
    }
  }

  // Atualizar student_points
  const { data: current, error: fetchError } = await supabase
    .from('student_points')
    .select('*')
    .eq('student_id', studentId)
    .maybeSingle();
  if (fetchError) throw fetchError;

  let newPoints = points;
  let newTotal = points;
  let newLevel = 1;
  let streakDays = 1;
  if (current) {
    newPoints = (current.points || 0) + points;
    newTotal = (current.total_points || 0) + points;
    newLevel = Math.floor(newTotal / 100) + 1;
    streakDays = current.streak_days || 1;
  }

  const { error: updateError } = await supabase
    .from('student_points')
    .upsert({
      student_id: studentId,
      points: newPoints,
      total_points: newTotal,
      level: newLevel,
      streak_days: streakDays,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'student_id' });
  if (updateError) throw updateError;

  // Registrar no histórico
  const { error: histError } = await supabase
    .from('points_history')
    .insert({
      student_id: studentId,
      points,
      action_type: actionType,
      description,
      reference_id: referenceId,
      meta,
      earned_at: new Date().toISOString(),
    });
  if (histError) throw histError;

  return { points: newPoints, total_points: newTotal, level: newLevel };
}
