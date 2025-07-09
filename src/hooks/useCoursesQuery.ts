
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface Course {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  difficulty_level: string | null;
  estimated_hours: number | null;
  thumbnail_url: string | null;
  is_published: boolean | null;
  tags: string[] | null;
  instructor_id: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export const useCourses = () => {
  const { user, userRole } = useAuth();

  return useQuery({
    queryKey: ['courses', userRole, user?.id],
    queryFn: async () => {
      if (!user) {
        console.log('[useCourses] No user, returning empty array.');
        return [];
      }

      console.log(`[useCourses] Current user: ${user.email}, Role: ${userRole}, ID: ${user.id}`);

      let query = supabase
        .from('courses')
        .select('*');

      if (userRole === 'producer') {
        console.log(`[useCourses] User is a producer. Fetching courses where instructor_id matches user ID`);
        // For producers, get courses where they are the instructor
        query = query.eq('instructor_id', user.id).order('created_at', { ascending: false });
      } else {
        // For other roles, fetch all published courses
        console.log(`[useCourses] User role is '${userRole}'. Fetching all published courses.`);
        query = query.eq('is_published', true).order('created_at', { ascending: false });
      }

      const { data, error } = await query;

      if (error) {
        console.error('[useCourses] Error fetching courses:', error.message, error.details);
        console.error('[useCourses] Full error object:', error);
        throw error;
      }
      
      console.log(`[useCourses] Courses fetched successfully for role '${userRole}', user '${user.id}'. Count: ${data?.length || 0}`);
      console.log('[useCourses] Fetched courses data:', data);
      return data as Course[] || [];
    },
    enabled: !!user,
    retry: 3,
    retryDelay: 1000,
  });
};

export const useCourse = (courseId: string) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['course', courseId],
    queryFn: async () => {
      console.log('[useCourse] Fetching single course:', courseId);
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('id', courseId)
        .single();

      if (error) {
        console.error('[useCourse] Error fetching course:', error.message);
        throw error;
      }
      console.log('[useCourse] Course fetched successfully:', data);
      return data as Course;
    },
    enabled: !!courseId && !!user,
  });
};
