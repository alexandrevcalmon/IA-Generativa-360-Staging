
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
    queryKey: ['collaborator-analytics', user?.id, companyData?.id],
    queryFn: async () => {
      if (!user?.id || !companyData?.id) {
        throw new Error('User not authenticated or company not found');
      }

      console.log('📊 Fetching collaborator analytics for company:', companyData.id);

      // Get all company users/collaborators
      const { data: collaborators, error: collaboratorsError } = await supabase
        .from('company_users')
        .select('*')
        .eq('company_id', companyData.id);

      if (collaboratorsError) {
        console.error('❌ Error fetching collaborators:', collaboratorsError);
        throw collaboratorsError;
      }

      console.log('✅ Found collaborators:', collaborators?.length || 0);

      if (!collaborators || collaborators.length === 0) {
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

            // Get courses enrolled
            const { count: coursesEnrolled } = await supabase
              .from('enrollments')
              .select('*', { count: 'exact', head: true })
              .eq('user_id', collaborator.auth_user_id);

            // Get courses completed (enrollments with completed_at)
            const { count: coursesCompleted } = await supabase
              .from('enrollments')
              .select('*', { count: 'exact', head: true })
              .eq('user_id', collaborator.auth_user_id)
              .not('completed_at', 'is', null);

            // Get total points - using company_users.id (not auth_user_id)
            const { data: pointsData } = await supabase
              .from('student_points')
              .select('total_points, level, streak_days')
              .eq('student_id', collaborator.id) // Use company_users.id, not auth_user_id
              .maybeSingle();

            return {
              id: collaborator.id,
              collaborator: {
                id: collaborator.id,
                name: collaborator.name,
                email: collaborator.email,
                phone: collaborator.phone,
                position: collaborator.position,
                is_active: collaborator.is_active,
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

      console.log('✅ Analytics processed for', analyticsData.length, 'collaborators');
      return analyticsData as CollaboratorStats[];
    },
    enabled: !!user?.id && !!companyData?.id && userRole === 'company',
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};
