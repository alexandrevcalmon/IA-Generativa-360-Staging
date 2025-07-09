
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/auth';
import type { StudentAchievement } from './types';

export const useStudentAchievements = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['student-achievements', user?.id],
    queryFn: async (): Promise<StudentAchievement[]> => {
      if (!user) throw new Error('User not authenticated');

      console.log('🏆 Fetching student achievements for user:', user.id);

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
        console.log('⚠️ No student record found for achievements');
        return [];
      }

      const { data, error } = await supabase
        .from('student_achievements')
        .select(`
          *,
          achievements:achievement_id (
            id,
            name,
            description,
            icon,
            badge_color,
            type,
            points_required
          )
        `)
        .eq('student_id', studentRecord.id);

      if (error) {
        console.error('❌ Error fetching achievements:', error);
        throw error;
      }

      console.log('✅ Successfully fetched achievements');
      return data || [];
    },
    enabled: !!user,
  });
};
