
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface AIProvider {
  id: string;
  name: string;
  display_name: string;
  api_endpoint: string;
  requires_api_key: boolean;
  supported_models: string[];
  default_model: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const useAIProviders = () => {
  return useQuery({
    queryKey: ['ai-providers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ai_providers')
        .select('*')
        .eq('is_active', true)
        .order('display_name');
      
      if (error) throw error;
      return data as AIProvider[];
    },
  });
};
