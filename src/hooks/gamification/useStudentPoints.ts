
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/auth';

export const useStudentPoints = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: points, isLoading } = useQuery({
    queryKey: ['student-points', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('No user found');

      const { data, error } = await supabase
        .from('student_points')
        .select('*')
        .eq('student_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching student points:', error);
        throw error;
      }

      return data;
    },
    enabled: !!user,
  });

  const initializeMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('No user found');

      // First check if points record already exists
      const { data: existing } = await supabase
        .from('student_points')
        .select('*')
        .eq('student_id', user.id)
        .maybeSingle();

      if (existing) {
        return existing;
      }

      // Create new points record
      const { data, error } = await supabase
        .from('student_points')
        .insert([{
          student_id: user.id,
          points: 0,
          total_points: 0,
          level: 1,
          streak_days: 0
        }])
        .select()
        .single();

      if (error) {
        console.error('Error initializing student points:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-points'] });
    },
  });

  return {
    data: points, // Return as 'data' to match expected interface
    points, // Keep backward compatibility
    isLoading,
    initializePoints: initializeMutation.mutate,
    isInitializing: initializeMutation.isPending,
  };
};
