
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/auth/useAuth';

export interface CompanyData {
  id: string;
  name: string;
  contact_email: string;
  contact_name?: string;
  subscription_status: string;
  subscription_ends_at?: string;
  max_collaborators: number;
  current_students: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  subscription_plan_data?: {
    id: string;
    name: string;
    price: number;
    max_students: number;
  };
}

export const useCompanyData = () => {
  const { user, userRole } = useAuth();

  return useQuery({
    queryKey: ['company-data', user?.id],
    queryFn: async () => {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      console.log('🏢 Fetching company data for user:', user.id, 'with role:', userRole);

      // Buscar dados da empresa diretamente
      const { data, error } = await supabase
        .from('companies')
        .select(`
          *,
          subscription_plan_data:subscription_plan_id (
            id,
            name,
            price,
            max_students
          )
        `)
        .eq('auth_user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('❌ Error fetching company data:', error);
        
        // Se for erro de permissão, tentar garantir vínculo
        if (error.code === 'PGRST301' || error.message?.includes('permission')) {
          console.log('🔄 Attempting to fix user-company linkage...');
          
          try {
            const { data: linkageResult, error: linkageError } = await supabase.rpc(
              'ensure_user_company_linkage',
              { user_id: user.id, user_role: 'company' }
            );

            if (linkageError) {
              console.error('❌ Linkage error:', linkageError);
            } else {
              console.log('✅ Linkage result:', linkageResult);
              
              // Tentar buscar novamente após garantir vínculo
              const { data: retryData, error: retryError } = await supabase
                .from('companies')
                        .select(`
          *,
          subscription_plan_data:subscription_plan_id (
            id,
            name,
            price,
            max_students
          )
        `)
                .eq('auth_user_id', user.id)
                .maybeSingle();

              if (retryError) {
                throw retryError;
              }

              if (!retryData) {
                console.log('⚠️ No company data found after linkage fix');
                return null;
              }

              console.log('✅ Company data fetched after linkage fix:', retryData);
              return retryData as CompanyData;
            }
          } catch (linkageError) {
            console.error('❌ Error during linkage fix:', linkageError);
          }
        }
        
        throw error;
      }

      if (!data) {
        console.log('⚠️ No company data found for user:', user.id);
        return null;
      }

      console.log('✅ Company data fetched:', data);
      return data as CompanyData;
    },
    enabled: !!user?.id && userRole === 'company',
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error) => {
      // Não tentar novamente se for erro de permissão
      if (error instanceof Error && error.message.includes('permission')) {
        return false;
      }
      return failureCount < 3;
    },
  });
};
