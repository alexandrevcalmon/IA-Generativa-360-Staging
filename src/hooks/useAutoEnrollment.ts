
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useAutoEnrollment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ courseId, userId }: { courseId: string; userId: string }) => {
      console.log('🎓 Checking enrollment for course:', courseId, 'user:', userId);
      
      // Check if user is already enrolled
      const { data: existingEnrollment } = await supabase
        .from('enrollments')
        .select('id')
        .eq('course_id', courseId)
        .eq('user_id', userId)
        .single();

      if (existingEnrollment) {
        console.log('✅ User already enrolled in course');
        return existingEnrollment;
      }

      // Auto-enroll the user
      console.log('🔄 Auto-enrolling user in course');
      const { data, error } = await supabase
        .from('enrollments')
        .insert({
          course_id: courseId,
          user_id: userId,
          progress_percentage: 0
        })
        .select()
        .single();

      if (error) {
        console.error('❌ Error auto-enrolling user:', error);
        throw error;
      }

      console.log('✅ User auto-enrolled successfully');
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-courses'] });
      queryClient.invalidateQueries({ queryKey: ['enrollments'] });
    },
    onError: (error) => {
      console.error('❌ Auto-enrollment failed:', error);
      // Don't show error toast for auto-enrollment, it should be silent
    },
  });
};
