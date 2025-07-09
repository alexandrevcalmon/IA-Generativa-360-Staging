
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

export interface Lesson {
  id: string;
  module_id: string;
  title: string;
  content: string | null;
  video_url: string | null;
  duration_minutes: number | null;
  order_index: number;
  is_free: boolean;
  resources: any | null;
  created_at: string;
  image_url?: string | null;
  video_file_url?: string | null;
  material_url?: string | null;
}

export const useLessons = (moduleId: string) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['lessons', moduleId],
    queryFn: async () => {
      console.log('Fetching lessons for module:', moduleId);
      
      const { data, error } = await supabase
        .from('lessons')
        .select('*')
        .eq('module_id', moduleId)
        .order('order_index', { ascending: true }); // Mudança aqui: ordenar por order_index

      if (error) {
        console.error('Error fetching lessons:', error);
        throw error;
      }
      
      console.log('Lessons fetched successfully:', data?.length);
      return data as Lesson[];
    },
    enabled: !!moduleId && !!user,
  });
};

export const useCreateLesson = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (lessonData: Omit<Lesson, 'id' | 'created_at'>) => {
      if (!user) {
        throw new Error('User not authenticated');
      }

      console.log('Creating lesson with data:', lessonData);

      // Buscar o próximo order_index baseado na quantidade de aulas
      const { count } = await supabase
        .from('lessons')
        .select('*', { count: 'exact', head: true })
        .eq('module_id', lessonData.module_id);

      const dataWithOrder = {
        ...lessonData,
        order_index: count || 0,
      };

      const { data, error } = await supabase
        .from('lessons')
        .insert([dataWithOrder])
        .select()
        .single();

      if (error) {
        console.error('Error creating lesson:', error);
        throw error;
      }
      
      console.log('Lesson created successfully:', data);
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['lessons', data.module_id] });
      toast({
        title: "Sucesso",
        description: "Aula criada com sucesso!",
      });
    },
    onError: (error) => {
      console.error('Create lesson error:', error);
      toast({
        title: "Erro",
        description: "Erro ao criar aula: " + error.message,
        variant: "destructive",
      });
    },
  });
};

export const useUpdateLesson = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ id, ...lessonData }: Partial<Lesson> & { id: string }) => {
      if (!user) {
        throw new Error('User not authenticated');
      }

      console.log('Updating lesson:', id);

      const { data, error } = await supabase
        .from('lessons')
        .update(lessonData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating lesson:', error);
        throw error;
      }
      
      console.log('Lesson updated successfully:', data);
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['lessons', data.module_id] });
      toast({
        title: "Sucesso",
        description: "Aula atualizada com sucesso!",
      });
    },
    onError: (error) => {
      console.error('Update lesson error:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar aula: " + error.message,
        variant: "destructive",
      });
    },
  });
};

export const useUpdateLessonOrder = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ moduleId, lessons }: { moduleId: string; lessons: { id: string; order_index: number }[] }) => {
      if (!user) {
        throw new Error('User not authenticated');
      }

      console.log('Updating lesson order:', lessons);

      // Atualizar cada aula individualmente
      const updates = lessons.map(async (lesson) => {
        const { error } = await supabase
          .from('lessons')
          .update({ order_index: lesson.order_index })
          .eq('id', lesson.id);

        if (error) {
          console.error('Error updating lesson order:', error);
          throw error;
        }
      });

      await Promise.all(updates);
      return { moduleId };
    },
    onSuccess: ({ moduleId }) => {
      queryClient.invalidateQueries({ queryKey: ['lessons', moduleId] });
      toast({
        title: "Sucesso",
        description: "Ordem das aulas atualizada com sucesso!",
      });
    },
    onError: (error) => {
      console.error('Update lesson order error:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar ordem das aulas: " + error.message,
        variant: "destructive",
      });
    },
  });
};

export const useDeleteLesson = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ lessonId, moduleId }: { lessonId: string; moduleId: string }) => {
      if (!user) {
        throw new Error('User not authenticated');
      }

      console.log('Deleting lesson:', lessonId);

      const { error } = await supabase
        .from('lessons')
        .delete()
        .eq('id', lessonId);

      if (error) {
        console.error('Error deleting lesson:', error);
        throw error;
      }

      return { lessonId, moduleId };
    },
    onSuccess: ({ moduleId }) => {
      queryClient.invalidateQueries({ queryKey: ['lessons', moduleId] });
      toast({
        title: "Sucesso",
        description: "Aula excluída com sucesso!",
      });
    },
    onError: (error) => {
      console.error('Delete lesson error:', error);
      toast({
        title: "Erro",
        description: "Erro ao excluir aula: " + error.message,
        variant: "destructive",
      });
    },
  });
};
