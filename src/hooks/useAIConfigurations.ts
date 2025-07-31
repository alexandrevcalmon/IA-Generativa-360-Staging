
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';

export interface AIConfiguration {
  id: string;
  company_id: string | null;
  provider_id: string;
  model_name: string;
  api_key_encrypted: string | null;
  system_prompt: string;
  temperature: number;
  max_tokens: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  ai_providers?: {
    name: string;
    display_name: string;
    supported_models: string[];
    default_model: string | null;
  };
}

export const useAIConfigurations = () => {
  return useQuery({
    queryKey: ['ai-configurations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ai_configurations')
        .select(`
          *,
          ai_providers (
            name,
            display_name,
            supported_models,
            default_model
          )
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as AIConfiguration[];
    },
  });
};

export const useCreateAIConfiguration = () => {
  const queryClient = useQueryClient();
  const { userRole } = useAuth();
  
  return useMutation({
    mutationFn: async (config: Omit<AIConfiguration, 'id' | 'created_at' | 'updated_at'>) => {
      // For producers, set company_id to null for global configurations
      const configData = userRole === 'producer' 
        ? { ...config, company_id: null }
        : config;

      const { data, error } = await supabase
        .from('ai_configurations')
        .insert(configData)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-configurations'] });
      toast.success('Configuração de IA criada com sucesso!');
    },
    onError: (error) => {
      console.error('Error creating AI configuration:', error);
      toast.error('Erro ao criar configuração de IA');
    },
  });
};

export const useUpdateAIConfiguration = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...config }: Partial<AIConfiguration> & { id: string }) => {
      const { data, error } = await supabase
        .from('ai_configurations')
        .update(config)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-configurations'] });
      toast.success('Configuração de IA atualizada com sucesso!');
    },
    onError: (error) => {
      console.error('Error updating AI configuration:', error);
      toast.error('Erro ao atualizar configuração de IA');
    },
  });
};

export const useDeleteAIConfiguration = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('ai_configurations')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-configurations'] });
      toast.success('Configuração de IA removida com sucesso!');
    },
    onError: (error) => {
      console.error('Error deleting AI configuration:', error);
      toast.error('Erro ao remover configuração de IA');
    },
  });
};
