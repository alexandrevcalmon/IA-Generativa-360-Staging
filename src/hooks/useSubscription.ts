import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SubscriptionData {
  isActive: boolean;
  isLoading: boolean;
  planId: string | null;
  maxCollaborators: number;
  currentCollaborators: number;
  subscriptionStatus: string;
  subscriptionEndsAt: string | null;
  canAddCollaborators: boolean;
  daysUntilExpiry: number | null;
  error: string | null;
}

export function useSubscription() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [subscriptionData, setSubscriptionData] = useState<SubscriptionData>({
    isActive: false,
    isLoading: true,
    planId: null,
    maxCollaborators: 0,
    currentCollaborators: 0,
    subscriptionStatus: 'inactive',
    subscriptionEndsAt: null,
    canAddCollaborators: false,
    daysUntilExpiry: null,
    error: null,
  });

  useEffect(() => {
    if (user?.user_metadata?.role === 'company') {
      fetchSubscriptionData();
    } else {
      setSubscriptionData(prev => ({ ...prev, isLoading: false }));
    }
  }, [user]);

  const fetchSubscriptionData = async () => {
    try {
      setSubscriptionData(prev => ({ ...prev, isLoading: true, error: null }));

      // Buscar dados da empresa
      const { data: company, error: companyError } = await supabase
        .from('companies')
        .select(`
          id,
          stripe_customer_id,
          stripe_subscription_id,
          subscription_status,
          stripe_plan_id,
          max_collaborators,
          subscription_ends_at
        `)
        .eq('auth_user_id', user?.id)
        .single();

      if (companyError) {
        throw new Error('Erro ao buscar dados da empresa');
      }

      if (!company) {
        throw new Error('Empresa não encontrada');
      }

      // Buscar número atual de colaboradores

      let collaboratorsCount = 0;
      let countError = null;
      if (company.id) {
        const { count, error } = await supabase
          .from('company_users')
          .select('*', { count: 'exact', head: true })
          .eq('company_id', company.id);
        collaboratorsCount = count || 0;
        countError = error;
      }

      if (countError) {
        console.warn('Erro ao contar colaboradores:', countError);
      }

      // Calcular dias até expiração
      let daysUntilExpiry = null;
      if (company.subscription_ends_at) {
        const endDate = new Date(company.subscription_ends_at);
        const today = new Date();
        const diffTime = endDate.getTime() - today.getTime();
        daysUntilExpiry = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      }

      const isActive = company.subscription_status === 'active';
      const currentCollaborators = collaboratorsCount || 0;
      const canAddCollaborators = isActive && currentCollaborators < company.max_collaborators;

      setSubscriptionData({
        isActive,
        isLoading: false,
        planId: company.stripe_plan_id,
        maxCollaborators: company.max_collaborators || 0,
        currentCollaborators,
        subscriptionStatus: company.subscription_status || 'inactive',
        subscriptionEndsAt: company.subscription_ends_at,
        canAddCollaborators,
        daysUntilExpiry,
        error: null,
      });

      // Alertas baseados no status
      if (!isActive && company.subscription_status === 'past_due') {
        toast({
          title: "Pagamento em atraso",
          description: "Sua assinatura está com pagamento pendente. Regularize para manter o acesso.",
          variant: "destructive",
        });
      } else if (daysUntilExpiry !== null && daysUntilExpiry <= 7 && daysUntilExpiry > 0) {
        toast({
          title: "Assinatura próxima do vencimento",
          description: `Sua assinatura vence em ${daysUntilExpiry} dias.`,
          variant: "default",
        });
      }

    } catch (error) {
      console.error('Erro ao buscar dados de assinatura:', error);
      setSubscriptionData(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      }));
    }
  };

  const checkCollaboratorLimit = () => {
    if (!subscriptionData.isActive) {
      toast({
        title: "Assinatura inativa",
        description: "Sua assinatura está inativa. Renove para adicionar colaboradores.",
        variant: "destructive",
      });
      return false;
    }

    if (!subscriptionData.canAddCollaborators) {
      toast({
        title: "Limite de colaboradores atingido",
        description: `Você atingiu o limite de ${subscriptionData.maxCollaborators} colaboradores do seu plano.`,
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const refreshSubscription = () => {
    fetchSubscriptionData();
  };

  return {
    ...subscriptionData,
    checkCollaboratorLimit,
    refreshSubscription,
  };
} 
