
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./auth";

export interface CompanyCourse {
  id: string;
  title: string;
  description?: string;
  thumbnail_url?: string;
  category?: string;
  difficulty_level: string;
  estimated_hours?: number;
  is_published: boolean;
  enrolled_students: number;
  completed_students: number;
  created_at: string;
}

export const useCompanyCourses = () => {
  const { user, userRole } = useAuth();

  return useQuery({
    queryKey: ['company-courses', user?.id],
    queryFn: async () => {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      console.log('📚 Fetching published courses for company dashboard...');

      // First, get all published courses
      const { data: courses, error: coursesError } = await supabase
        .from('courses')
        .select('*')
        .eq('is_published', true)
        .order('created_at', { ascending: false });

      if (coursesError) {
        console.error('❌ Error fetching courses:', coursesError);
        throw coursesError;
      }

      console.log('✅ Found courses:', courses?.length || 0);

      // For each course, get enrollment stats
      const coursesWithStats = await Promise.all(
        (courses || []).map(async (course) => {
          try {
            // Get total enrollments
            const { count: enrolledCount } = await supabase
              .from('enrollments')
              .select('*', { count: 'exact', head: true })
              .eq('course_id', course.id);

            // Get completed enrollments (those with completed_at)
            const { count: completedCount } = await supabase
              .from('enrollments')
              .select('*', { count: 'exact', head: true })
              .eq('course_id', course.id)
              .not('completed_at', 'is', null);

            return {
              ...course,
              enrolled_students: enrolledCount || 0,
              completed_students: completedCount || 0
            };
          } catch (error) {
            console.warn('⚠️ Error fetching stats for course:', course.id, error);
            return {
              ...course,
              enrolled_students: 0,
              completed_students: 0
            };
          }
        })
      );

      console.log('✅ Courses with stats processed:', coursesWithStats.length);
      return coursesWithStats as CompanyCourse[];
    },
    enabled: !!user?.id && userRole === 'company',
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};
