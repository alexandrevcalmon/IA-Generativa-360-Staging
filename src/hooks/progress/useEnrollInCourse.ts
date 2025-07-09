
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/auth';
import { toast } from 'sonner';

export const useEnrollInCourse = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (courseId: string) => {
      if (!user) throw new Error('User not authenticated');

      console.log('🎓 Enrolling in course:', courseId);

      const { data, error } = await supabase
        .from('enrollments')
        .insert({
          course_id: courseId,
          user_id: user.id, // Using auth user ID directly - this now references auth.users
          enrolled_at: new Date().toISOString(),
          progress_percentage: 0
        })
        .select()
        .single();

      if (error) {
        console.error('❌ Error enrolling in course:', error);
        throw error;
      }

      console.log('✅ Successfully enrolled in course:', data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-courses'] });
      toast.success("Inscrição realizada!", {
        description: "Você foi inscrito no curso com sucesso.",
      });
    },
    onError: (error) => {
      console.error('❌ Enrollment error:', error);
      toast.error("Erro na inscrição", {
        description: "Não foi possível realizar a inscrição no curso.",
      });
    },
  });
};
