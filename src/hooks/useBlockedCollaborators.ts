import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './auth';

interface BlockedCollaborator {
  id: string;
  auth_user_id: string;
  company_id: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  profiles: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

interface BlockedCollaboratorsData {
  blockedCollaborators: BlockedCollaborator[];
  totalBlocked: number;
  totalActive: number;
  subscriptionStatus: string;
  subscriptionEndsAt: string | null;
  daysUntilExpiry: number | null;
  isSubscriptionActive: boolean;
}

export function useBlockedCollaborators() {
  const { user, userRole } = useAuth();

  return useQuery<BlockedCollaboratorsData>({
    queryKey: ['blocked-collaborators', user?.id],
    queryFn: async () => {
      if (!user?.id || userRole !== 'company') {
        console.log('Hook useBlockedCollaborators - Usuário ou role inválido:', { userId: user?.id, userRole });
        throw new Error('Apenas empresas podem acessar esta informação');
      }

      console.log('Hook useBlockedCollaborators - Buscando empresa para usuário:', user.id);
      // Buscar dados da empresa
      const { data: company, error: companyError } = await supabase
        .from('companies')
        .select(`
          id,
          subscription_status,
          subscription_ends_at
        `)
        .eq('auth_user_id', user.id)
        .single();

      if (companyError || !company) {
        console.error('Erro ao buscar empresa:', companyError);
        throw new Error('Empresa não encontrada. Verifique se você está logado como uma empresa.');
      }

      // Buscar todos os colaboradores da empresa
      const { data: collaborators, error: collaboratorsError } = await supabase
        .from('company_users')
        .select(`
          id,
          auth_user_id,
          company_id,
          is_active,
          created_at,
          updated_at
        `)
        .eq('company_id', company.id);

      if (collaboratorsError) {
        throw new Error('Erro ao buscar colaboradores');
      }

      // Buscar perfis dos colaboradores
      const authUserIds = collaborators?.map(c => c.auth_user_id) || [];
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, name, email, role')
        .in('id', authUserIds);

      if (profilesError) {
        throw new Error('Erro ao buscar perfis dos colaboradores');
      }

      // Combinar dados
      const collaboratorsWithProfiles = collaborators?.map(collaborator => {
        const profile = profiles?.find(p => p.id === collaborator.auth_user_id);
        return {
          ...collaborator,
          profiles: profile || { id: '', name: 'Usuário não encontrado', email: '', role: '' }
        };
      }) || [];

      const blockedCollaborators = collaboratorsWithProfiles?.filter(c => !c.is_active) || [];
      const activeCollaborators = collaboratorsWithProfiles?.filter(c => c.is_active) || [];

      // Calcular dias até expiração
      let daysUntilExpiry = null;
      if (company.subscription_ends_at) {
        const endDate = new Date(company.subscription_ends_at);
        const today = new Date();
        const diffTime = endDate.getTime() - today.getTime();
        daysUntilExpiry = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      }

      const isSubscriptionActive = company.subscription_status === 'active' || company.subscription_status === 'trialing';
      const isNotExpired = !company.subscription_ends_at || new Date(company.subscription_ends_at) > new Date();

      return {
        blockedCollaborators,
        totalBlocked: blockedCollaborators.length,
        totalActive: activeCollaborators.length,
        subscriptionStatus: company.subscription_status,
        subscriptionEndsAt: company.subscription_ends_at,
        daysUntilExpiry,
        isSubscriptionActive: isSubscriptionActive && isNotExpired
      };
    },
    enabled: !!user?.id && userRole === 'company',
    staleTime: 2 * 60 * 1000, // 2 minutos
  });
} 
