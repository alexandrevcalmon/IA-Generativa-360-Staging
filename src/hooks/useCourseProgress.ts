import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface UseCourseProgressResult {
  progressPercentage: number;
  completedLessons: number;
  totalLessons: number;
}

export function useCourseProgress(courseId: string, userId: string | undefined): { data: UseCourseProgressResult, isLoading: boolean } {
  const { data, isLoading } = useQuery({
    queryKey: ['course-progress', courseId, userId],
    queryFn: async () => {
      if (!courseId || !userId) {
        return { progressPercentage: 0, completedLessons: 0, totalLessons: 0 };
      }
      // Buscar todas as aulas do curso
      const { data: courseData, error: courseError } = await supabase
        .from('courses')
        .select('course_modules(id, lessons(id))')
        .eq('id', courseId)
        .single();
      if (courseError || !courseData) {
        return { progressPercentage: 0, completedLessons: 0, totalLessons: 0 };
      }
      const allLessons = (courseData.course_modules || []).flatMap((mod: any) => mod.lessons || []);
      const lessonIds = allLessons.map((lesson: any) => lesson.id);
      // Buscar progresso do usuário nessas aulas
      const { data: progressData, error: progressError } = await supabase
        .from('lesson_progress')
        .select('lesson_id, completed')
        .eq('user_id', userId)
        .in('lesson_id', lessonIds);
      if (progressError) {
        return { progressPercentage: 0, completedLessons: 0, totalLessons: lessonIds.length };
      }
      const completedLessons = (progressData || []).filter((p: any) => p.completed).length;
      const totalLessons = lessonIds.length;
      const progressPercentage = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;
      return { progressPercentage, completedLessons, totalLessons };
    }
  });
  return { data: data || { progressPercentage: 0, completedLessons: 0, totalLessons: 0 }, isLoading };
} 