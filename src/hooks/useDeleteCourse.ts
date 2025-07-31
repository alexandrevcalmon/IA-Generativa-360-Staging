
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

export const useDeleteCourse = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (courseId: string) => {
      if (!user) {
        throw new Error('User not authenticated');
      }

      console.log('Deleting course:', courseId);
      console.log('Current user:', user.id);

      const { error } = await supabase
        .from('courses')
        .delete()
        .eq('id', courseId);

      if (error) {
        console.error('Error deleting course:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      toast.success({
        title: "Sucesso",
        description: "Curso excluído com sucesso!"
      });
    },
    onError: (error) => {
      console.error('Delete mutation error:', error);
      toast.error({
        title: "Erro",
        description: "Erro ao excluir curso: " + error.message
      });
    },
  });
};
