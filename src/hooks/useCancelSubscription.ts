import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './auth';
import { useToast } from './use-toast';

interface CancelSubscriptionParams {
  reason?: string;
  immediate?: boolean;
}

export function useCancelSubscription() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ reason, immediate = false }: CancelSubscriptionParams) => {
      if (!user?.id) {
        throw new Error('Usuário não autenticado');
      }

      // Buscar dados da empresa
      const { data: company, error: companyError } = await supabase
        .from('companies')
        .select(`
          id,
          stripe_subscription_id,
          subscription_status
        `)
        .eq('auth_user_id', user.id)
        .single();

      if (companyError || !company) {
        throw new Error('Empresa não encontrada');
      }

      if (!company.stripe_subscription_id) {
        throw new Error('Nenhuma assinatura ativa encontrada');
      }

      if (company.subscription_status === 'canceled') {
        throw new Error('Assinatura já foi cancelada');
      }

      // Chamar Edge Function para cancelar no Stripe
      const { data, error } = await supabase.functions.invoke('cancel-subscription', {
        body: {
          subscriptionId: company.stripe_subscription_id,
          reason: reason || 'Cancelamento solicitado pelo cliente',
          immediate: immediate
        }
      });

      if (error) {
        console.error('Erro ao cancelar assinatura:', error);
        throw new Error('Erro ao cancelar assinatura. Tente novamente.');
      }

      return data;
    },
    onSuccess: (data) => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: ['subscription'] });
      queryClient.invalidateQueries({ queryKey: ['company-data'] });
      queryClient.invalidateQueries({ queryKey: ['blocked-collaborators'] });

      toast({
        title: 'Assinatura cancelada',
        description: data.immediate 
          ? 'Sua assinatura foi cancelada imediatamente. Os colaboradores serão bloqueados.'
          : 'Sua assinatura será cancelada no final do período atual.',
        variant: 'default',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao cancelar assinatura',
        description: error instanceof Error ? error.message : 'Erro desconhecido',
        variant: 'destructive',
      });
    },
  });
} 
