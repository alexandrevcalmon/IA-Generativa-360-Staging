
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/auth';
import type { Achievement } from './types';

export const useAvailableAchievements = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['available-achievements', user?.id],
    queryFn: async (): Promise<Achievement[]> => {
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

      // Get all achievements
      const { data: allAchievements, error: achievementsError } = await supabase
        .from('achievements')
        .select('*')
        .eq('is_active', true)
        .order('points_required', { ascending: true });

      if (achievementsError) {
        console.error('Error fetching achievements:', achievementsError);
        throw achievementsError;
      }

      // Get user's unlocked achievements
      const { data: unlockedAchievements, error: unlockedError } = await supabase
        .from('student_achievements')
        .select('achievement_id')
        .eq('student_id', studentRecord.id);

      if (unlockedError) {
        console.error('Error fetching unlocked achievements:', unlockedError);
        throw unlockedError;
      }

      // Create a set of unlocked achievement IDs for fast lookup
      const unlockedAchievementIds = new Set(
        unlockedAchievements?.map(a => a.achievement_id) || []
      );

      // Filter out already unlocked achievements
      const availableAchievements = allAchievements?.filter(
        achievement => !unlockedAchievementIds.has(achievement.id)
      ) || [];

      return availableAchievements;
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
    refetchOnWindowFocus: false,
    refetchOnMount: true,
  });
};
