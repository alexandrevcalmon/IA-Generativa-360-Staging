
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useAutoEnrollment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ courseId, userId }: { courseId: string; userId: string }) => {
      console.log('🎓 [useAutoEnrollment] Checking enrollment for course:', courseId, 'user:', userId);
      
      try {
        // Check if user is already enrolled
        const { data: existingEnrollment, error: checkError } = await supabase
          .from('enrollments')
          .select('id')
          .eq('course_id', courseId)
          .eq('user_id', userId)
          .maybeSingle(); // Use maybeSingle instead of single to avoid errors when no record

        if (checkError) {
          console.error('❌ [useAutoEnrollment] Error checking existing enrollment:', checkError);
          // If we can't check, don't try to auto-enroll to avoid duplicates
          throw checkError;
        }

        if (existingEnrollment) {
          console.log('✅ [useAutoEnrollment] User already enrolled in course');
          return existingEnrollment;
        }

        // Auto-enroll the user
        console.log('🔄 [useAutoEnrollment] Auto-enrolling user in course');
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
          console.error('❌ [useAutoEnrollment] Error auto-enrolling user:', error);
          throw error;
        }

        console.log('✅ [useAutoEnrollment] User auto-enrolled successfully');
        return data;
      } catch (error) {
        console.error('❌ [useAutoEnrollment] Auto-enrollment process failed:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-courses'] });
      queryClient.invalidateQueries({ queryKey: ['enrollments'] });
    },
    onError: (error) => {
      console.error('❌ [useAutoEnrollment] Auto-enrollment failed:', error);
      // Don't show error toast for auto-enrollment, it should be silent
    },
  });
};
