
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { Course } from '@/hooks/useCoursesQuery';

export const useUpdateCourse = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ id, ...courseData }: Partial<Course> & { id: string }) => {
      if (!user) {
        throw new Error('User not authenticated');
      }

      console.log('Updating course:', id);
      console.log('Update data:', courseData);
      console.log('Current user:', user.id);

      // Ensure required fields are present and properly formatted
      const updateData = {
        ...courseData,
        updated_at: new Date().toISOString(),
        // Ensure arrays are properly handled
        tags: courseData.tags || [],
        // Ensure booleans are properly set
        is_published: courseData.is_published ?? false,
        // Ensure instructor_id is maintained (don't override it during updates unless explicitly provided)
        ...(courseData.instructor_id === undefined ? {} : { instructor_id: courseData.instructor_id }),
      };

      console.log('Final update data:', updateData);

      const { data, error } = await supabase
        .from('courses')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating course:', error);
        throw new Error(`Failed to update course: ${error.message}`);
      }
      
      console.log('Course updated successfully:', data);
      return data;
    },
    onSuccess: (data) => {
      // Invalidate multiple query keys to ensure data consistency
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      queryClient.invalidateQueries({ queryKey: ['course', data.id] });
      console.log('Course update successful, queries invalidated');
      toast.success({
        title: "Sucesso",
        description: "Curso atualizado com sucesso!"
      });
    },
    onError: (error) => {
      console.error('Update mutation error:', error);
      toast.error({
        title: "Erro",
        description: `Erro ao atualizar curso: ${error.message}`
      });
    },
  });
};
