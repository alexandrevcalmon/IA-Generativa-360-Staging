
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/auth/useAuth';
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

      // Get user's lesson progress to check real progress
      const { data: lessonProgress, error: lessonProgressError } = await supabase
        .from('lesson_progress')
        .select('lesson_id, completed')
        .eq('user_id', user.id)
        .eq('completed', true);

      if (lessonProgressError) {
        console.error('Error fetching lesson progress:', lessonProgressError);
        // Don't throw error, just continue without lesson progress data
      }

      const hasCompletedFirstLesson = (lessonProgress || []).length > 0;

      // Create a set of unlocked achievement IDs for fast lookup
      const unlockedAchievementIds = new Set(
        unlockedAchievements?.map(a => a.achievement_id) || []
      );

      // Filter out already unlocked achievements, considering real progress
      const availableAchievements = allAchievements?.filter(achievement => {
        const nameLower = achievement.name.toLowerCase();
        
        // Special logic for "Primeira Lição" - only show as available if not completed
        if (nameLower.includes('primeira lição') || nameLower.includes('first lesson')) {
          return !hasCompletedFirstLesson;
        }
        
        // For other achievements, use the standard logic
        return !unlockedAchievementIds.has(achievement.id);
      }) || [];

      return availableAchievements;
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
    refetchOnWindowFocus: false,
    refetchOnMount: true,
  });
};
