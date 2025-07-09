
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Achievement } from './types';

export const useAvailableAchievements = () => {
  return useQuery({
    queryKey: ['available-achievements'],
    queryFn: async (): Promise<Achievement[]> => {
      console.log('📜 Fetching available achievements');

      const { data, error } = await supabase
        .from('achievements')
        .select('*')
        .eq('is_active', true)
        .order('points_required', { ascending: true });

      if (error) {
        console.error('❌ Error fetching available achievements:', error);
        throw error;
      }

      console.log('✅ Successfully fetched available achievements');
      return data || [];
    },
  });
};
