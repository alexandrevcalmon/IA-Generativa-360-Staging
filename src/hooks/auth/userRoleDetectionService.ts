
import { supabase } from '@/integrations/supabase/client';
import { createProducerRoleService } from './producerRoleService';

export const createUserRoleDetectionService = () => {
  const producerRoleService = createProducerRoleService();

  const getUserRole = async (userId: string) => {
    try {
      console.log(`[UserRoleDetectionService] Getting role for user: ${userId}`);
      
      // Use the new enhanced function that checks producers first
      const { data: roleData, error: roleError } = await supabase.rpc('get_user_role_enhanced', {
        user_id: userId
      });

      if (!roleError && roleData) {
        console.log(`[UserRoleDetectionService] Enhanced role check result: ${roleData}`);
        return roleData;
      }

      // Fallback to original logic if function fails
      console.log(`[UserRoleDetectionService] Falling back to original role logic`);
      
      // First check if user is a producer using the new table
      const isProducer = await producerRoleService.isUserProducer(userId);
      if (isProducer) {
        return 'producer';
      }

      // Then check if user is a company owner
      const { data: companyData, error: companyError } = await supabase
        .from('companies')
        .select('id, name')
        .eq('auth_user_id', userId)
        .single();

      if (!companyError && companyData) {
        console.log(`[UserRoleDetectionService] User is a company owner: ${companyData.name}`);
        return 'company';
      }

      // Then check profiles table for explicit role
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();

      if (!profileError && profileData?.role) {
        console.log(`[UserRoleDetectionService] User role from profiles: ${profileData.role}`);
        
        // If profiles says student but user is company owner, override to company
        if (profileData.role === 'student' && companyData) {
          console.log(`[UserRoleDetectionService] Overriding student role to company for company owner`);
          return 'company';
        }
        
        return profileData.role;
      }

      // Check if it's a company collaborator
      const { data: collaboratorData, error: collaboratorError } = await supabase
        .from('company_users')
        .select('id')
        .eq('auth_user_id', userId)
        .single();

      if (!collaboratorError && collaboratorData) {
        console.log('[UserRoleDetectionService] User is a company collaborator');
        return 'collaborator';
      }

      console.log('[UserRoleDetectionService] Defaulting to student role');
      return 'student';
    } catch (error) {
      console.error('[UserRoleDetectionService] Unexpected error getting user role:', error);
      return 'student';
    }
  };

  return {
    getUserRole,
  };
};
