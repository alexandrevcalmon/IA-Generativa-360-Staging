
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/auth';
import type { PointsHistoryEntry } from './types';

export const usePointsHistory = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['points-history', user?.id],
    queryFn: async (): Promise<PointsHistoryEntry[]> => {
      if (!user) throw new Error('User not authenticated');

      console.log('📈 Fetching points history for user:', user.id);

      // Get the student record from company_users first
      const { data: studentRecord, error: studentError } = await supabase
        .from('company_users')
        .select('id')
        .eq('auth_user_id', user.id)
        .maybeSingle();

      if (studentError) {
        console.error('❌ Error fetching student record:', studentError);
        throw studentError;
      }

      if (!studentRecord) {
        console.log('⚠️ No student record found for points history');
        return [];
      }

      const { data, error } = await supabase
        .from('points_history')
        .select('*')
        .eq('student_id', studentRecord.id)
        .order('earned_at', { ascending: false })
        .limit(10);

      if (error) {
        console.error('❌ Error fetching points history:', error);
        throw error;
      }

      console.log('✅ Successfully fetched points history');
      return data || [];
    },
    enabled: !!user,
  });
};
