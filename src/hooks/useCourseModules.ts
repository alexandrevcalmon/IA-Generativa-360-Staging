
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface CourseModule {
  id: string;
  course_id: string;
  title: string;
  description: string | null;
  order_index: number;
  is_published: boolean;
  image_url: string | null;
  created_at: string;
  lessons?: Lesson[];
}

export interface Lesson {
  id: string;
  module_id: string;
  title: string;
  content: string | null;
  video_url: string | null;
  video_file_url: string | null;
  material_url: string | null;
  image_url: string | null;
  duration_minutes: number | null;
  order_index: number;
  is_free: boolean;
  resources: any;
  is_optional?: boolean;
}

export const useCourseModules = (courseId: string) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['course-modules', courseId],
    queryFn: async () => {
      console.log('[useCourseModules] Fetching modules for course:', courseId);
      
      const { data: modules, error: modulesError } = await supabase
        .from('course_modules')
        .select(`
          *,
          lessons(
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
            is_optional
          )
        `)
        .eq('course_id', courseId)
        .order('order_index', { ascending: true });

      if (modulesError) {
        console.error('[useCourseModules] Error fetching modules:', modulesError);
        throw modulesError;
      }
      
      // Ordenar as aulas dentro de cada módulo
      const modulesWithSortedLessons = modules?.map(module => ({
        ...module,
        lessons: module.lessons?.sort((a: any, b: any) => a.order_index - b.order_index) || []
      })) || [];
      
      console.log('[useCourseModules] Modules fetched successfully:', modulesWithSortedLessons);
      return modulesWithSortedLessons as CourseModule[];
    },
    enabled: !!courseId && !!user,
  });
};

export const useCreateModule = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (moduleData: Omit<CourseModule, 'id' | 'created_at' | 'lessons'>) => {
      console.log('[useCreateModule] Creating module:', moduleData);
      
      const { data, error } = await supabase
        .from('course_modules')
        .insert([moduleData])
        .select()
        .single();

      if (error) {
        console.error('[useCreateModule] Error creating module:', error);
        throw error;
      }

      console.log('[useCreateModule] Module created successfully:', data);
      return data;
    },
    onSuccess: (data) => {
      // Invalidate and refetch course modules
      queryClient.invalidateQueries({ queryKey: ['course-modules', data.course_id] });
    },
  });
};

export const useUpdateModule = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...moduleData }: Partial<CourseModule> & { id: string }) => {
      console.log('[useUpdateModule] Updating module:', id, moduleData);
      
      const { data, error } = await supabase
        .from('course_modules')
        .update(moduleData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('[useUpdateModule] Error updating module:', error);
        throw error;
      }

      console.log('[useUpdateModule] Module updated successfully:', data);
      return data;
    },
    onSuccess: (data) => {
      // Invalidate and refetch course modules
      queryClient.invalidateQueries({ queryKey: ['course-modules', data.course_id] });
    },
  });
};

export const useDeleteModule = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ moduleId, courseId }: { moduleId: string; courseId: string }) => {
      console.log('[useDeleteModule] Deleting module:', moduleId);
      
      const { error } = await supabase
        .from('course_modules')
        .delete()
        .eq('id', moduleId);

      if (error) {
        console.error('[useDeleteModule] Error deleting module:', error);
        throw error;
      }

      console.log('[useDeleteModule] Module deleted successfully');
      return { moduleId, courseId };
    },
    onSuccess: (data) => {
      // Invalidate and refetch course modules
      queryClient.invalidateQueries({ queryKey: ['course-modules', data.courseId] });
    },
  });
};
