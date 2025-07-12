
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

// Função utilitária para atribuir pontos ao usuário
export async function awardPointsToStudent({ studentId, points, actionType, description, referenceId }: {
  studentId: string;
  points: number;
  actionType: string;
  description?: string;
  referenceId?: string;
}) {
  console.log('[Gamificação] awardPointsToStudent chamado para', { studentId, points, actionType, description, referenceId });
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
      earned_at: new Date().toISOString(),
    });
  if (histError) throw histError;

  return { points: newPoints, total_points: newTotal, level: newLevel };
}
