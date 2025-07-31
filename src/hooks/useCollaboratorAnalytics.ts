
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./auth";
import { useCompanyData } from "./useCompanyData";

export interface CollaboratorStats {
  id: string;
  collaborator: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    position?: string;
    is_active: boolean;
    company_name?: string; // Add company name for producer view
    company_id?: string; // Add company_id for producer view
  };
  collaborator_id: string;
  lessons_completed: number;
  courses_completed: number;
  courses_enrolled: number;
  lessons_started: number;
  total_watch_time_minutes: number;
  total_points: number;
  current_level: number;
  streak_days: number;
  last_login_at?: string;
  updated_at: string;
}

export const useCollaboratorAnalytics = () => {
  const { user, userRole } = useAuth();
  const { data: companyData } = useCompanyData();

  return useQuery({
    queryKey: ['collaborator-analytics', user?.id, companyData?.id, userRole],
    queryFn: async () => {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      let collaborators: any[] = [];

      if (userRole === 'producer') {
        // Para produtor único, buscar todos os colaboradores de todas as empresas
        const { data: allCollaborators, error: collaboratorsError } = await supabase
          .from('company_users')
          .select(`*, companies:company_id (id, name)`);

        if (collaboratorsError) {
          console.error('❌ Error fetching collaborators:', collaboratorsError);
          throw collaboratorsError;
        }

        collaborators = allCollaborators || [];

      } else if (userRole === 'company' && companyData?.id) {
        // For companies, get collaborators from their own company
        
        const { data: companyCollaborators, error: collaboratorsError } = await supabase
          .from('company_users')
          .select('*')
          .eq('company_id', companyData.id);

        if (collaboratorsError) {
          console.error('❌ Error fetching collaborators:', collaboratorsError);
          throw collaboratorsError;
        }

        collaborators = companyCollaborators || [];

      } else if (userRole === 'collaborator') {
        // For collaborators, get their own data and company data
        const { data: collaboratorData, error: collaboratorError } = await supabase
          .from('company_users')
          .select(`
            *,
            companies:company_id (
              id,
              name
            )
          `)
          .eq('auth_user_id', user.id)
          .eq('is_active', true)
          .maybeSingle();

        if (collaboratorError) {
          console.error('❌ Error fetching collaborator data:', collaboratorError);
          throw collaboratorError;
        }

        if (collaboratorData) {
          collaborators = [collaboratorData];
        } else {
          collaborators = [];
        }

      } else {
        throw new Error('Invalid user role or company not found');
      }

      if (collaborators.length === 0) {
        return [];
      }

      // Get analytics for each collaborator
      const analyticsData = await Promise.all(
        collaborators.map(async (collaborator) => {
          try {
            // Get lessons completed
            const { count: lessonsCompleted } = await supabase
              .from('lesson_progress')
              .select('*', { count: 'exact', head: true })
              .eq('user_id', collaborator.auth_user_id)
              .eq('completed', true);

            // Get lessons started
            const { count: lessonsStarted } = await supabase
              .from('lesson_progress')
              .select('*', { count: 'exact', head: true })
              .eq('user_id', collaborator.auth_user_id);

            // Get total watch time
            const { data: watchTimeData } = await supabase
              .from('lesson_progress')
              .select('watch_time_seconds')
              .eq('user_id', collaborator.auth_user_id);

            const totalWatchTimeMinutes = Math.round(
              (watchTimeData?.reduce((sum, item) => sum + (item.watch_time_seconds || 0), 0) || 0) / 60
            );

            // Direct SQL-like approach for course analysis
            const { data: courseStats } = await supabase
              .from('courses')
              .select(`
                id,
                title,
                course_modules!inner(
                  lessons!inner(
                    id
                  )
                )
              `);

            let coursesEnrolled = 0;
            let coursesCompleted = 0;

            if (courseStats) {
              for (const course of courseStats) {
                // Count total lessons for this course
                let totalLessons = 0;
                course.course_modules.forEach(module => {
                  totalLessons += module.lessons.length;
                });

                // Count completed lessons for this course
                const { count: completedLessons } = await supabase
                  .from('lesson_progress')
                  .select('*', { count: 'exact', head: true })
                  .eq('user_id', collaborator.auth_user_id)
                  .eq('completed', true)
                  .in('lesson_id', course.course_modules.flatMap(m => m.lessons.map(l => l.id)));

                if (completedLessons && completedLessons > 0) {
                  coursesEnrolled++;
                  if (completedLessons === totalLessons) {
                    coursesCompleted++;
                  }
                }
              }
            }

            console.log('📊 Course analytics for', collaborator.name, ':', {
              coursesEnrolled,
              coursesCompleted,
              courseStats: courseStats?.length
            });



            // Get total points - using company_users.id (not auth_user_id)
            const { data: pointsData } = await supabase
              .from('student_points')
              .select('total_points, level, streak_days')
              .eq('student_id', collaborator.id)
              .maybeSingle();

            const result = {
              id: collaborator.id,
              collaborator: {
                id: collaborator.id,
                name: collaborator.name,
                email: collaborator.email,
                phone: collaborator.phone,
                position: collaborator.position,
                is_active: collaborator.is_active,
                company_name: userRole === 'producer' ? collaborator.companies?.name : undefined,
                company_id: userRole === 'producer' ? collaborator.companies?.id : undefined,
              },
              collaborator_id: collaborator.id,
              lessons_completed: lessonsCompleted || 0,
              courses_completed: coursesCompleted || 0,
              courses_enrolled: coursesEnrolled || 0,
              lessons_started: lessonsStarted || 0,
              total_watch_time_minutes: totalWatchTimeMinutes,
              total_points: pointsData?.total_points || 0,
              current_level: pointsData?.level || 1,
              streak_days: pointsData?.streak_days || 0,
              last_login_at: null, // This would need to be tracked separately
              updated_at: collaborator.created_at, // Using created_at as fallback
            };
            
            return result;
          } catch (error) {
            console.warn('⚠️ Error fetching analytics for collaborator:', collaborator.id, error);
            return {
              id: collaborator.id,
              collaborator: {
                id: collaborator.id,
                name: collaborator.name,
                email: collaborator.email,
                phone: collaborator.phone,
                position: collaborator.position,
                is_active: collaborator.is_active,
                company_name: userRole === 'producer' ? collaborator.companies?.name : undefined,
                company_id: userRole === 'producer' ? collaborator.companies?.id : undefined,
              },
              collaborator_id: collaborator.id,
              lessons_completed: 0,
              courses_completed: 0,
              courses_enrolled: 0,
              lessons_started: 0,
              total_watch_time_minutes: 0,
              total_points: 0,
              current_level: 1,
              streak_days: 0,
              last_login_at: null,
              updated_at: collaborator.created_at,
            };
          }
        })
      );

      return analyticsData as CollaboratorStats[];
    },
    enabled: !!user?.id && (userRole === 'producer' || userRole === 'company' || userRole === 'collaborator'),
    refetchOnWindowFocus: true,
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // Refetch a cada 60 segundos
  });
};
