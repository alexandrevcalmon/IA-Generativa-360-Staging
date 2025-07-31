
import { User } from '@supabase/supabase-js';
import { createUserRoleDetectionService } from './userRoleDetectionService';
import { createRoleManagementService } from './roleManagementService';
import { createUserAuxiliaryDataService } from './userAuxiliaryDataService';

export const createUserRoleService = () => {
  const roleDetectionService = createUserRoleDetectionService();
  const roleManagementService = createRoleManagementService();

  return {
    getUserRole: roleDetectionService.getUserRole,
    updateUserRole: roleManagementService.updateUserRole,
  };
};

// Export the auxiliary data service function for backward compatibility
export const fetchUserRoleAuxiliaryData = (user: User) => {
  const auxiliaryDataService = createUserAuxiliaryDataService();
  return auxiliaryDataService.fetchUserRoleAuxiliaryData(user);
};
