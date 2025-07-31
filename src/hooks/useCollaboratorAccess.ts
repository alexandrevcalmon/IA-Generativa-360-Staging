import { useCollaboratorData } from './useCollaboratorData';
import { useAuth } from './auth';

interface CollaboratorAccessInfo {
  hasAccess: boolean;
  isBlocked: boolean;
  companyName?: string;
  subscriptionStatus?: string;
  subscriptionEndsAt?: string;
  isLoading: boolean;
  error?: string;
}

export function useCollaboratorAccess(): CollaboratorAccessInfo {
  const { userRole } = useAuth();
  const { data: collaboratorData, isLoading, error } = useCollaboratorData();

  // Se não é colaborador, não aplica verificação
  if (userRole !== 'collaborator') {
    return {
      hasAccess: true,
      isBlocked: false,
      isLoading: false
    };
  }

  // Se está carregando
  if (isLoading) {
    return {
      hasAccess: false,
      isBlocked: false,
      isLoading: true
    };
  }

  // Se há erro
  if (error) {
    return {
      hasAccess: false,
      isBlocked: false,
      isLoading: false,
      error: error.message
    };
  }

  // Se não há dados do colaborador (incluindo quando empresa está inativa)
  if (!collaboratorData) {
    return {
      hasAccess: false,
      isBlocked: true,
      isLoading: false,
      companyName: 'Sua empresa',
      subscriptionStatus: 'inactive'
    };
  }

  const company = collaboratorData.company;
  
  // Verificar se a empresa tem assinatura ativa
  const isSubscriptionActive = company?.subscription_status === 'active' || company?.subscription_status === 'trialing';
  const isNotExpired = !company?.subscription_ends_at || new Date(company.subscription_ends_at) > new Date();
  
  const hasAccess = isSubscriptionActive && isNotExpired;
  const isBlocked = !hasAccess;

  return {
    hasAccess,
    isBlocked,
    companyName: company?.name,
    subscriptionStatus: company?.subscription_status,
    subscriptionEndsAt: company?.subscription_ends_at,
    isLoading: false
  };
} 
