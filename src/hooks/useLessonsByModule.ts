
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
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
}

export const useLessonsByModule = (moduleId: string) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['lessons-by-module', moduleId],
    queryFn: async () => {
      console.log('Fetching lessons for module:', moduleId);
      
      const { data: lessons, error } = await supabase
        .from('lessons')
        .select(`
          *,
          is_optional
        `)
        .eq('module_id', moduleId)
        .order('order_index', { ascending: true });

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
