
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface LessonMaterial {
  id: string;
  lesson_id: string;
  file_name: string;
  file_url: string;
  file_type: string;
  file_size_bytes: number | null;
  extracted_content: string | null;
  created_at: string;
}

export const useLessonMaterials = (lessonId: string) => {
  return useQuery({
    queryKey: ['lesson-materials', lessonId],
    queryFn: async () => {
      console.log('Fetching materials for lesson:', lessonId);
      
      const { data, error } = await supabase
        .from('lesson_materials')
        .select('*')
        .eq('lesson_id', lessonId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching lesson materials:', error);
        throw error;
      }
      
      console.log('Materials fetched successfully:', data?.length);
      return data as LessonMaterial[];
    },
    enabled: !!lessonId,
  });
};
