
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
  is_optional?: boolean;
  // Campos do Bunny.net
  bunny_video_id?: string | null;
  bunny_library_id?: number | null;
  bunny_video_status?: 'pending' | 'processing' | 'ready' | 'error' | null;
  bunny_embed_url?: string | null;
}

export const useLessons = (moduleId: string) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['lessons', moduleId],
    queryFn: async () => {
      console.log('Fetching lessons for module:', moduleId);
      
      const { data: lessons, error: lessonsError } = await supabase
        .from('lessons')
        .select(`
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
        `)
        .eq('module_id', moduleId)
        .order('order_index', { ascending: true });

      if (lessonsError) {
        console.error('Error fetching lessons:', lessonsError);
        throw lessonsError;
      }
      
      console.log('Lessons fetched successfully:', lessons?.length);
      return lessons as Lesson[];
    },
    enabled: !!moduleId && !!user,
  });
};

export const useLesson = (lessonId: string) => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['lesson', lessonId],
    queryFn: async () => {
      if (!lessonId) return null;
      const { data, error } = await supabase
        .from('lessons')
        .select(`
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
        `)
        .eq('id', lessonId)
        .single();
      if (error) throw error;
      return data as Lesson;
    },
    enabled: !!lessonId && !!user,
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
        .select(`
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
        `)
        .single();

      if (error) {
        console.error('Error creating lesson:', error);
        throw error;
      }
      
      console.log('Lesson created successfully:', data);
      return data;
    },
    onSuccess: async (data) => {
      // Invalidar a query das aulas do módulo
      queryClient.invalidateQueries({ queryKey: ['lessons', data.module_id] });
      
      // Buscar o course_id do módulo para invalidar a query course-modules
      const { data: moduleData } = await supabase
        .from('course_modules')
        .select('course_id')
        .eq('id', data.module_id)
        .single();
      
      if (moduleData) {
        // Invalidar a query dos módulos do curso (que inclui as aulas)
        queryClient.invalidateQueries({ queryKey: ['course-modules', moduleData.course_id] });
      }
      
      toast.success({
        title: "Sucesso",
        description: "Aula criada com sucesso!"
      });
    },
    onError: (error) => {
      console.error('Create lesson error:', error);
      toast.error({
        title: "Erro",
        description: "Erro ao criar aula: " + error.message
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
        .select(`
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
        `)
        .single();

      if (error) {
        console.error('Error updating lesson:', error);
        throw error;
      }
      
      console.log('Lesson updated successfully:', data);
      return data;
    },
    onSuccess: async (data) => {
      console.log('=== DEBUG: useUpdateLesson onSuccess ===');
      console.log('Updated lesson data:', data);
      
      // Invalidar a query das aulas do módulo
      queryClient.invalidateQueries({ queryKey: ['lessons', data.module_id] });
      
      // Buscar o course_id do módulo para invalidar a query course-modules
      const { data: moduleData } = await supabase
        .from('course_modules')
        .select('course_id')
        .eq('id', data.module_id)
        .single();
      
      if (moduleData) {
        console.log('Module data found:', moduleData);
        // Invalidar a query dos módulos do curso (que inclui as aulas)
        queryClient.invalidateQueries({ queryKey: ['course-modules', moduleData.course_id] });
        
        // Forçar refetch das queries
        await queryClient.refetchQueries({ queryKey: ['course-modules', moduleData.course_id] });
      }
      
      console.log('=== END DEBUG ===');
      
      toast.success({
        title: "Sucesso",
        description: "Aula atualizada com sucesso!"
      });
    },
    onError: (error) => {
      console.error('Update lesson error:', error);
      toast.error({
        title: "Erro",
        description: "Erro ao atualizar aula: " + error.message
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
    onSuccess: async ({ moduleId }) => {
      // Invalidar a query das aulas do módulo
      queryClient.invalidateQueries({ queryKey: ['lessons', moduleId] });
      
      // Buscar o course_id do módulo para invalidar a query course-modules
      const { data: moduleData } = await supabase
        .from('course_modules')
        .select('course_id')
        .eq('id', moduleId)
        .single();
      
      if (moduleData) {
        // Invalidar a query dos módulos do curso (que inclui as aulas)
        queryClient.invalidateQueries({ queryKey: ['course-modules', moduleData.course_id] });
      }
      
      toast.success({
        title: "Sucesso",
        description: "Ordem das aulas atualizada com sucesso!"
      });
    },
    onError: (error) => {
      console.error('Update lesson order error:', error);
      toast.error({
        title: "Erro",
        description: "Erro ao atualizar ordem das aulas: " + error.message
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
    onSuccess: async ({ moduleId }) => {
      // Invalidar a query das aulas do módulo
      queryClient.invalidateQueries({ queryKey: ['lessons', moduleId] });
      
      // Buscar o course_id do módulo para invalidar a query course-modules
      const { data: moduleData } = await supabase
        .from('course_modules')
        .select('course_id')
        .eq('id', moduleId)
        .single();
      
      if (moduleData) {
        // Invalidar a query dos módulos do curso (que inclui as aulas)
        queryClient.invalidateQueries({ queryKey: ['course-modules', moduleData.course_id] });
      }
      
      toast.success({
        title: "Sucesso",
        description: "Aula excluída com sucesso!"
      });
    },
    onError: (error) => {
      console.error('Delete lesson error:', error);
      toast.error({
        title: "Erro",
        description: "Erro ao excluir aula: " + error.message
      });
    },
  });
};
