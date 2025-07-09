
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useProducerAuth = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['producer-auth', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('No user found');

      console.log('[useProducerAuth] Checking producer auth for user:', user.id);

      // Use the enhanced producer-specific function with automatic migration
      const { data, error } = await supabase.rpc('is_current_user_producer_enhanced');

      if (error) {
        console.error('[useProducerAuth] Error checking producer auth:', error);
        // If there's an error, assume not a producer
        return {
          isProducer: false,
          role: 'student'
        };
      }

      console.log('[useProducerAuth] Producer check result:', data);

      // Also get the role directly for additional info using enhanced function
      const { data: roleData, error: roleError } = await supabase.rpc('get_user_role_enhanced', {
        user_id: user.id
      });

      const role = roleError ? 'student' : (roleData || 'student');

      return {
        isProducer: data === true,
        role: role
      };
    },
    enabled: !!user,
  });
};
