
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/auth/useAuth';

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
  is_published: boolean;
  created_at: string;
  updated_at: string;
  is_sequential?: boolean;
}

export interface StudentModule {
  id: string;
  title: string;
  description: string;
  order_index: number;
  is_published: boolean;
  created_at: string;
  image_url: string;
  lessons: StudentLesson[];
}

export interface StudentLesson {
  id: string;
  title: string;
  content?: string;
  video_url?: string;
  video_file_url?: string;
  material_url?: string;
  duration_minutes?: number;
  order_index: number;
  is_free: boolean;
  completed: boolean;
  watch_time_seconds: number;
  is_optional?: boolean;
  resources?: any;
  image_url?: string;
  // Campos do Bunny.net
  bunny_video_id?: string | null;
  bunny_library_id?: number | null;
  bunny_video_status?: 'pending' | 'processing' | 'ready' | 'error' | null;
  bunny_embed_url?: string | null;
}

export type StudentLessonOrQuiz = StudentLesson | StudentQuizItem;

export interface StudentQuizItem {
  id: string;
  type: 'quiz';
  lesson_id: string;
  title: string;
  status: 'Aprovado' | 'Não Respondido' | 'Reprovado';
  completed: boolean;
  passing_score: number;
  user_score?: number;
  attempts?: number;
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
        .select(`
          *,
          is_sequential
        `)
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
            .select(`
              id,
              title,
              description,
              order_index,
              is_published,
              created_at,
              image_url,
              lessons(
                id,
                module_id,
                title,
                content,
                video_url,
                video_file_url,
                material_url,
                image_url,
                duration_minutes,
                order_index,
                is_free,
                resources,
                is_optional,
                bunny_video_id,
                bunny_library_id,
                bunny_video_status,
                bunny_embed_url
              )
            `)
            .eq('course_id', course.id)
            .eq('is_published', true)
            .order('order_index');

          if (modulesError) {
            console.error('Error fetching modules for course', course.id, ':', modulesError);
            // Continue with empty modules rather than failing
          }

          console.log(`[useStudentCourses] Raw modules data for course ${course.id}:`, modules);

          const modulesWithLessons = await Promise.all(
            (modules || []).map(async (module) => {
              console.log('Processing module:', module.title);

              // Use lessons from the first query instead of making a second query
              const lessons = module.lessons || [];
              
              console.log(`[useStudentCourses] Module ${module.title} has ${lessons.length} lessons`);
              lessons.forEach((lesson, index) => {
                console.log(`[useStudentCourses] Lesson ${index + 1}:`, {
                  id: lesson.id,
                  title: lesson.title,
                  bunny_video_id: lesson.bunny_video_id,
                  bunny_library_id: lesson.bunny_library_id,
                  bunny_video_status: lesson.bunny_video_status,
                  bunny_embed_url: lesson.bunny_embed_url,
                  video_url: lesson.video_url,
                  video_file_url: lesson.video_file_url
                });
              });

              // Get progress for each lesson with improved handling - using auth user ID directly
              const lessonsWithProgressAndQuizzes = await Promise.all(
                (lessons || []).map(async (lesson) => {
                  // Busca progresso da aula
                  let lessonProgress = { completed: false, watch_time_seconds: 0 };
                  try {
                    const { data: progress, error: progressError } = await supabase
                      .from('lesson_progress')
                      .select('completed, watch_time_seconds')
                      .eq('lesson_id', lesson.id)
                      .eq('user_id', user.id)
                      .maybeSingle();
                    if (!progressError && progress) lessonProgress = progress;
                  } catch {}
                  // Monta lesson normal
                  const lessonItem: StudentLessonOrQuiz = {
                    ...lesson,
                    completed: lessonProgress.completed || false,
                    watch_time_seconds: lessonProgress.watch_time_seconds || 0,
                    type: 'lesson',
                  };
                  // Busca quizzes relacionados
                  const { data: quizzes } = await supabase
                    .from('quizzes')
                    .select('*')
                    .eq('lesson_id', lesson.id)
                    .order('created_at');
                  const quizItems: StudentQuizItem[] = [];
                  if (quizzes && quizzes.length > 0) {
                    for (const quiz of quizzes) {
                      // Busca tentativas do usuário
                      const { data: attempts } = await supabase
                        .from('quiz_attempts')
                        .select('score, passed')
                        .eq('quiz_id', quiz.id)
                        .eq('user_id', user.id)
                        .order('attempt_number', { ascending: false })
                        .limit(1);
                      let status: 'Aprovado' | 'Não Respondido' | 'Reprovado' = 'Não Respondido';
                      let completed = false;
                      let user_score = undefined;
                      if (attempts && attempts.length > 0) {
                        user_score = attempts[0].score;
                        if (attempts[0].passed) {
                          status = 'Aprovado';
                          completed = true;
                        } else {
                          status = 'Reprovado';
                        }
                      }
                      quizItems.push({
                        id: quiz.id,
                        type: 'quiz',
                        lesson_id: lesson.id,
                        title: quiz.title,
                        status,
                        completed,
                        passing_score: quiz.passing_score || 75,
                        user_score,
                      });
                    }
                  }
                  // Retorna lesson + quizzes
                  return [lessonItem, ...quizItems];
                })
              );
              // Achata a lista
              const flatLessons = lessonsWithProgressAndQuizzes.flat();

              return {
                ...module,
                lessons: flatLessons,
              };
            })
          );

          // Calculate progress percentage based on completed lessons
          const totalLessons = modulesWithLessons.reduce((total, module) => total + module.lessons.length, 0);
          const completedLessons = modulesWithLessons.reduce((total, module) => 
            total + module.lessons.filter(item => item.completed).length, 0
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
        .select(`
          id,
          title,
          description,
          order_index,
          is_published,
          created_at,
          image_url,
          lessons(
            id,
            module_id,
            title,
            content,
            video_url,
            video_file_url,
            material_url,
            image_url,
            duration_minutes,
            order_index,
            is_free,
            resources,
            is_optional,
            bunny_video_id,
            bunny_library_id,
            bunny_video_status,
            bunny_embed_url
          )
        `)
        .eq('course_id', courseId)
        .eq('is_published', true)
        .order('order_index');

      console.log(`[useStudentCourse] Raw modules data for course ${courseId}:`, modules);

      const modulesWithLessons = await Promise.all(
        (modules || []).map(async (module) => {
          // Use lessons from the first query instead of making a second query
          const lessons = module.lessons || [];
          
          console.log(`[useStudentCourse] Module ${module.title} has ${lessons.length} lessons`);
          lessons.forEach((lesson, index) => {
            console.log(`[useStudentCourse] Lesson ${index + 1}:`, {
              id: lesson.id,
              title: lesson.title,
              bunny_video_id: lesson.bunny_video_id,
              bunny_library_id: lesson.bunny_library_id,
              bunny_video_status: lesson.bunny_video_status,
              bunny_embed_url: lesson.bunny_embed_url,
              video_url: lesson.video_url,
              video_file_url: lesson.video_file_url
            });
          });

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
