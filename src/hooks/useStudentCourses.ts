
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/auth';

export interface StudentCourse {
  id: string;
  title: string;
  description: string;
  thumbnail_url: string;
  category: string;
  difficulty_level: string;
  estimated_hours: number;
  progress_percentage: number;
  enrolled_at?: string;
  modules: StudentModule[];
}

export interface StudentModule {
  id: string;
  title: string;
  description: string;
  order_index: number;
  lessons: StudentLesson[];
}

export interface StudentLesson {
  id: string;
  title: string;
  content: string;
  video_url: string;
  video_file_url: string;
  material_url: string;
  duration_minutes: number;
  order_index: number;
  is_free: boolean;
  completed: boolean;
  watch_time_seconds: number;
}

export const useStudentCourses = () => {
  const { user, userRole } = useAuth();

  return useQuery({
    queryKey: ['student-courses', user?.id, userRole],
    queryFn: async () => {
      console.log('🔍 [useStudentCourses] Starting query with:', { 
        userId: user?.id, 
        userEmail: user?.email,
        userRole,
        hasUser: !!user 
      });

      if (!user) {
        console.error('❌ [useStudentCourses] User not authenticated');
        throw new Error('User not authenticated');
      }

      console.log('📚 [useStudentCourses] Fetching courses for user:', user.id, 'with role:', userRole);

      // Get published courses with improved error handling
      const { data: courses, error: coursesError } = await supabase
        .from('courses')
        .select('*')
        .eq('is_published', true)
        .order('created_at', { ascending: false });

      if (coursesError) {
        console.error('❌ [useStudentCourses] Error fetching courses:', coursesError);
        throw coursesError;
      }

      console.log('✅ [useStudentCourses] Found published courses:', courses?.length || 0);

      // Get enrollment data for the current user using auth.uid()
      console.log('🎓 [useStudentCourses] Fetching enrollments for user:', user.id);
      
      let enrollments = null;
      let enrollmentsError = null;
      
      try {
        // Primeira tentativa: busca direta
        const { data, error } = await supabase
          .from('enrollments')
          .select('course_id, enrolled_at, progress_percentage')
          .eq('user_id', user.id);
          
        enrollments = data;
        enrollmentsError = error;
      } catch (error) {
        console.error('❌ [useStudentCourses] Direct enrollment query failed:', error);
        enrollmentsError = error;
      }

      if (enrollmentsError) {
        console.error('❌ [useStudentCourses] Error fetching enrollments:', enrollmentsError);
        console.warn('⚠️ [useStudentCourses] Continuing without enrollment data');
        enrollments = []; // Use empty array as fallback
      }

      console.log('✅ [useStudentCourses] Found enrollments:', enrollments?.length || 0);

      const enrollmentMap = new Map(
        enrollments?.map(e => [e.course_id, e]) || []
      );

      // For each course, get modules/lessons and progress
      const coursesWithProgress = await Promise.all(
        (courses || []).map(async (course) => {
          console.log('Processing course:', course.title);

          const enrollment = enrollmentMap.get(course.id);

          // Get modules with better error handling
          const { data: modules, error: modulesError } = await supabase
            .from('course_modules')
            .select('*')
            .eq('course_id', course.id)
            .eq('is_published', true)
            .order('order_index');

          if (modulesError) {
            console.error('Error fetching modules for course', course.id, ':', modulesError);
            // Continue with empty modules rather than failing
          }

          const modulesWithLessons = await Promise.all(
            (modules || []).map(async (module) => {
              console.log('Processing module:', module.title);

              // Get lessons with error handling
              const { data: lessons, error: lessonsError } = await supabase
                .from('lessons')
                .select('*')
                .eq('module_id', module.id)
                .order('order_index');

              if (lessonsError) {
                console.error('Error fetching lessons for module', module.id, ':', lessonsError);
                // Continue with empty lessons rather than failing
              }

              // Get progress for each lesson with improved handling - using auth user ID directly
              const lessonsWithProgress = await Promise.all(
                (lessons || []).map(async (lesson) => {
                  try {
                    const { data: lessonProgress, error: progressError } = await supabase
                      .from('lesson_progress')
                      .select('completed, watch_time_seconds')
                      .eq('lesson_id', lesson.id)
                      .eq('user_id', user.id) // Use auth user ID directly
                      .maybeSingle();

                    if (progressError) {
                      console.warn('Warning: Could not fetch lesson progress for lesson', lesson.id, ':', progressError);
                    }

                    return {
                      ...lesson,
                      completed: lessonProgress?.completed || false,
                      watch_time_seconds: lessonProgress?.watch_time_seconds || 0,
                    };
                  } catch (error) {
                    console.warn('Exception while fetching progress for lesson', lesson.id, ':', error);
                    return {
                      ...lesson,
                      completed: false,
                      watch_time_seconds: 0,
                    };
                  }
                })
              );

              return {
                ...module,
                lessons: lessonsWithProgress,
              };
            })
          );

          // Calculate progress percentage based on completed lessons
          const totalLessons = modulesWithLessons.reduce((total, module) => total + module.lessons.length, 0);
          const completedLessons = modulesWithLessons.reduce((total, module) => 
            total + module.lessons.filter(lesson => lesson.completed).length, 0
          );
          const progressPercentage = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

          return {
            ...course,
            progress_percentage: enrollment?.progress_percentage || progressPercentage,
            enrolled_at: enrollment?.enrolled_at,
            modules: modulesWithLessons,
          };
        })
      );

      console.log('Processed courses with modules and lessons:', coursesWithProgress.length);
      return coursesWithProgress as StudentCourse[];
    },
    enabled: !!user && (userRole === 'student' || userRole === 'collaborator' || userRole === 'company'),
    staleTime: 30000, // Cache for 30 seconds
    refetchOnWindowFocus: false, // Reduce unnecessary refetches
  });
};

export const useStudentCourse = (courseId: string) => {
  const { user, userRole } = useAuth();

  return useQuery({
    queryKey: ['student-course', courseId, user?.id, userRole],
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated');

      console.log('Fetching course details for:', courseId);

      const { data: course, error } = await supabase
        .from('courses')
        .select('*')
        .eq('id', courseId)
        .eq('is_published', true)
        .single();

      if (error) {
        console.error('Error fetching course:', error);
        throw error;
      }

      // Get modules with lessons
      const { data: modules } = await supabase
        .from('course_modules')
        .select('*')
        .eq('course_id', courseId)
        .eq('is_published', true)
        .order('order_index');

      const modulesWithLessons = await Promise.all(
        (modules || []).map(async (module) => {
          const { data: lessons } = await supabase
            .from('lessons')
            .select('*')
            .eq('module_id', module.id)
            .order('order_index');

          const lessonsWithProgress = await Promise.all(
            (lessons || []).map(async (lesson) => {
              try {
                const { data: lessonProgress, error: progressError } = await supabase
                  .from('lesson_progress')
                  .select('completed, watch_time_seconds')
                  .eq('lesson_id', lesson.id)
                  .eq('user_id', user.id) // Use auth user ID directly
                  .maybeSingle();

                if (progressError) {
                  console.warn('Warning: Could not fetch lesson progress:', progressError);
                }

                return {
                  ...lesson,
                  completed: lessonProgress?.completed || false,
                  watch_time_seconds: lessonProgress?.watch_time_seconds || 0,
                };
              } catch (error) {
                console.warn('Exception while fetching lesson progress:', error);
                return {
                  ...lesson,
                  completed: false,
                  watch_time_seconds: 0,
                };
              }
            })
          );

          return {
            ...module,
            lessons: lessonsWithProgress,
          };
        })
      );

      // Calculate progress percentage
      const totalLessons = modulesWithLessons.reduce((total, module) => total + module.lessons.length, 0);
      const completedLessons = modulesWithLessons.reduce((total, module) => 
        total + module.lessons.filter(lesson => lesson.completed).length, 0
      );
      const progressPercentage = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

      return {
        ...course,
        progress_percentage: progressPercentage,
        modules: modulesWithLessons,
      } as StudentCourse;
    },
    enabled: !!user && !!courseId && (userRole === 'student' || userRole === 'collaborator' || userRole === 'company'),
    staleTime: 30000, // Cache for 30 seconds
  });
};
