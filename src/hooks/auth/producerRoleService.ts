
import { supabase } from '@/integrations/supabase/client';

export const createProducerRoleService = () => {
  const isUserProducer = async (userId: string) => {
    try {
      console.log(`[ProducerRoleService] Checking if user ${userId} is a producer`);
      
      // Use the new enhanced function that includes automatic migration
      const { data: producerCheck, error: producerError } = await supabase.rpc('is_current_user_producer_enhanced');

      if (!producerError && producerCheck) {
        console.log(`[ProducerRoleService] User is confirmed as producer via enhanced check`);
        return true;
      }

      // Additional fallback to the enhanced role check
      const { data: roleData, error: roleError } = await supabase.rpc('get_user_role_enhanced', {
        user_id: userId
      });

      if (!roleError && roleData === 'producer') {
        console.log(`[ProducerRoleService] User is confirmed as producer via enhanced role check`);
        return true;
      }

      console.log(`[ProducerRoleService] User is not a producer`);
      return false;
    } catch (error) {
      console.error('[ProducerRoleService] Error checking producer status:', error);
      return false;
    }
  };

  const getProducerData = async (userId: string) => {
    try {
      const { data: producerData, error: producerDataError } = await supabase
        .from('producers')
        .select('*')
        .eq('auth_user_id', userId)
        .eq('is_active', true)
        .single();

      if (producerDataError) {
        console.error('[ProducerRoleService] Error fetching producer data:', producerDataError);
        return null;
      }

      return producerData;
    } catch (error) {
      console.error('[ProducerRoleService] Unexpected error fetching producer data:', error);
      return null;
    }
  };

  return {
    isUserProducer,
    getProducerData,
  };
};
