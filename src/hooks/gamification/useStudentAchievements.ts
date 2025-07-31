
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/auth/useAuth';
import type { StudentAchievement } from './types';

export const useStudentAchievements = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['student-achievements', user?.id],
    queryFn: async (): Promise<StudentAchievement[]> => {
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
        console.error('Error fetching achievements:', error);
        throw error;
      }

      // Filter achievements based on real progress
      const filteredAchievements = (data || []).filter(achievement => {
        const nameLower = achievement.achievements?.name?.toLowerCase() || '';
        
        // Special logic for "Primeira Lição" - only show if user actually completed a lesson
        if (nameLower.includes('primeira lição') || nameLower.includes('first lesson')) {
          return hasCompletedFirstLesson;
        }
        
        // For other achievements, show them normally
        return true;
      });

      // If user completed first lesson but doesn't have the achievement record, add it virtually
      if (hasCompletedFirstLesson) {
        const hasFirstLessonAchievement = filteredAchievements.some(achievement => {
          const nameLower = achievement.achievements?.name?.toLowerCase() || '';
          return nameLower.includes('primeira lição') || nameLower.includes('first lesson');
        });

        if (!hasFirstLessonAchievement) {
          // Get the "Primeira Lição" achievement from the database
          const { data: firstLessonAchievement } = await supabase
            .from('achievements')
            .select('*')
            .or('name.ilike.%primeira lição%,name.ilike.%first lesson%')
            .eq('is_active', true)
            .maybeSingle();

          if (firstLessonAchievement) {
            // Add it virtually to the results
            filteredAchievements.unshift({
              id: `virtual-${firstLessonAchievement.id}`,
              student_id: studentRecord.id,
              achievement_id: firstLessonAchievement.id,
              earned_at: new Date().toISOString(),
              achievements: firstLessonAchievement
            } as StudentAchievement);
          }
        }
      }

      return filteredAchievements;
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
    refetchOnWindowFocus: false,
    refetchOnMount: true,
  });
};
