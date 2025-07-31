
import { supabase } from '@/integrations/supabase/client';

export const createRoleManagementService = () => {
  const updateUserRole = async (userId: string, role: string) => {
    try {
      console.log(`[RoleManagementService] Updating role for user ${userId} to ${role}`);
      
      const { error } = await supabase
        .from('profiles')
        .upsert({ id: userId, role });

      if (error) {
        console.error('[RoleManagementService] Error updating user role:', error);
        throw error;
      }

      console.log('[RoleManagementService] User role updated successfully');
    } catch (error) {
      console.error('[RoleManagementService] Failed to update user role:', error);
      throw error;
    }
  };

  const ensureProfileConsistency = async (userId: string, role: string) => {
    try {
      await supabase
        .from('profiles')
        .upsert({ id: userId, role });
    } catch (error) {
      console.error('[RoleManagementService] Error ensuring profile consistency:', error);
    }
  };

  return {
    updateUserRole,
    ensureProfileConsistency,
  };
};
