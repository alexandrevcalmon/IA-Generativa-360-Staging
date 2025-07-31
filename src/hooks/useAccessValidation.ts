import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface AccessValidationParams {
  requiredRole?: string;
  companyId?: string;
}

export interface AccessValidationResult {
  success: boolean;
  user?: {
    id: string;
    email: string;
    role: string;
  };
  access?: {
    success: boolean;
    user_role?: string;
    access_type?: string;
  };
  linkage?: {
    success: boolean;
    action?: string;
    company_id?: string;
    company_name?: string;
  };
  error?: string;
}

export const useAccessValidation = () => {
  return useMutation<AccessValidationResult, Error, AccessValidationParams>({
    mutationFn: async ({ requiredRole, companyId }) => {
      try {
        const { data, error } = await supabase.functions.invoke('validate-access', {
          body: { requiredRole, companyId }
        });

        if (error) {
          console.error('❌ Access validation error:', error);
          throw new Error('Access validation failed');
        }

        if (!data?.success) {
          console.error('❌ Access denied:', data?.error);
          throw new Error(data?.error || 'Access denied');
        }

        console.log('✅ Access validated successfully:', data);
        return data as AccessValidationResult;
      } catch (error) {
        console.error('❌ Error in access validation:', error);
        throw error;
      }
    },
    retry: false, // Não tentar novamente em caso de erro
  });
};

// Hook para validação específica de empresa
export const useCompanyAccessValidation = (companyId?: string) => {
  return useAccessValidation();
};

// Hook para validação específica de role
export const useRoleAccessValidation = (requiredRole?: string) => {
  return useAccessValidation();
}; 
