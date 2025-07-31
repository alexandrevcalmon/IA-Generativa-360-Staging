
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './auth';

export interface CollaboratorData {
  id: string;
  auth_user_id: string;
  company_id: string;
  name: string;
  email: string;
  position?: string;
  phone?: string;
  is_active: boolean;
  company?: {
    id: string;
    name: string;
    logo_url?: string;
  };
}

export const useCollaboratorData = () => {
  const { user, userRole } = useAuth();

  return useQuery<CollaboratorData | null>({
    queryKey: ['collaborator-data', user?.id],
    queryFn: async () => {
      if (!user?.id || userRole !== 'collaborator') {
        return null;
      }

      console.log('🔍 Fetching collaborator data for user:', user.id);

      const { data, error } = await supabase
        .from('company_users')
        .select(`
          *,
          companies:company_id (
            id,
            name,
            logo_url,
            subscription_status,
            subscription_ends_at
          )
        `)
        .eq('auth_user_id', user.id)
        .eq('is_active', true)
        .maybeSingle();

      if (error) {
        console.error('❌ Error fetching collaborator data:', error);
        throw error;
      }

      if (!data) {
        console.log('⚠️ No collaborator data found for user:', user.id);
        return null;
      }

      // Verificar se a empresa tem assinatura ativa
      const company = data.companies;
      if (company) {
        const isSubscriptionActive = company.subscription_status === 'active' || company.subscription_status === 'trialing';
        const isNotExpired = !company.subscription_ends_at || new Date(company.subscription_ends_at) > new Date();
        
        if (!isSubscriptionActive || !isNotExpired) {
          console.log('⚠️ Company subscription is inactive or expired:', {
            status: company.subscription_status,
            expiresAt: company.subscription_ends_at
          });
          return null; // Retorna null para indicar que colaborador não tem acesso
        }
      }

      console.log('✅ Collaborator data fetched:', data);
      return {
        ...data,
        company: data.companies
      } as CollaboratorData;
    },
    enabled: !!user?.id && userRole === 'collaborator',
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
