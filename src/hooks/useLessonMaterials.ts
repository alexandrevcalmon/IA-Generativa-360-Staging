
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export interface LessonMaterial {
  id: string;
  lesson_id: string;
  file_name: string;
  file_url: string;
  file_type: string;
  file_size_bytes: number | null;
  extracted_content: string | null;
  storage_file_id: string | null;
  created_at: string;
}

export interface CreateLessonMaterialData {
  lesson_id: string;
  file_name: string;
  file_url: string;
  file_type: string;
  file_size_bytes: number;
  storage_file_id: string;
  company_id?: string;
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

export const useCreateLessonMaterial = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (materialData: CreateLessonMaterialData) => {
      if (!user) {
        throw new Error('User not authenticated');
      }

      console.log('Creating lesson material:', materialData);

      // Buscar a empresa do usuário autenticado
      const { data: companyData, error: companyError } = await supabase
        .from('companies')
        .select('id')
        .eq('auth_user_id', user.id)
        .single();

      // Se não encontrar empresa, verificar se o usuário é produtor
      if (companyError || !companyData) {
        console.log('No company found, checking if user is producer');
        
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        if (profileError || !profileData) {
          throw new Error('User profile not found. Please contact support.');
        }

        if (profileData.role !== 'producer') {
          throw new Error('User company not found and user is not a producer. Please ensure you have a company associated with your account.');
        }

        // Para produtores, permitir criar material sem empresa
        console.log('User is producer, creating material without company');
        
        const { data, error } = await supabase
          .from('lesson_materials')
          .insert([{
            ...materialData,
            company_id: null, // Produtores podem criar materiais sem empresa
            uploaded_by: user.id,
          }])
          .select()
          .single();

        if (error) {
          console.error('Error creating lesson material:', error);
          throw error;
        }
        
        console.log('Lesson material created successfully (producer):', data);
        return data;
      }

      // Usuário tem empresa, criar material normalmente
      const { data, error } = await supabase
        .from('lesson_materials')
        .insert([{
          ...materialData,
          company_id: companyData.id,
          uploaded_by: user.id,
        }])
        .select()
        .single();

      if (error) {
        console.error('Error creating lesson material:', error);
        throw error;
      }
      
      console.log('Lesson material created successfully (company):', data);
      return data;
    },
    onSuccess: (data) => {
      // Invalidar a query dos materiais da aula
      queryClient.invalidateQueries({ queryKey: ['lesson-materials', data.lesson_id] });
      
      toast.success({
        title: "Sucesso",
        description: "Material de aula criado com sucesso!"
      });
    },
    onError: (error) => {
      console.error('Create lesson material error:', error);
      toast.error({
        title: "Erro",
        description: "Erro ao criar material de aula: " + error.message
      });
    },
  });
};
