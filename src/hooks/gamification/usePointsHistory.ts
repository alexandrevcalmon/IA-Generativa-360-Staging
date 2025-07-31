
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/auth/useAuth';
import type { PointsHistoryEntry } from './types';

export const usePointsHistory = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['points-history', user?.id],
    queryFn: async (): Promise<PointsHistoryEntry[]> => {
      if (!user) throw new Error('User not authenticated');

      // Get the student record from company_users first
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
        return [];
      }

      const { data, error } = await supabase
        .from('points_history')
        .select('*')
        .eq('student_id', studentRecord.id)
        .order('earned_at', { ascending: false })
        .limit(20); // Aumentar o limite para mostrar mais entradas

      if (error) {
        console.error('Error fetching points history:', error);
        throw error;
      }
      
      return data || [];
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
    refetchOnWindowFocus: false,
    refetchOnMount: true,
  });
};
