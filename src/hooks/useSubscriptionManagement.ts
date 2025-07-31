import { useState } from 'react';
import { useAuth } from '@/hooks/auth/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface SubscriptionManagementOptions {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export const useSubscriptionManagement = (options: SubscriptionManagementOptions = {}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const cancelSubscription = async (reason?: string) => {
    if (!user) {
      toast({
        title: "Erro",
        description: "Usuário não autenticado",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('cancel-subscription', {
        body: {
          userId: user.id,
          reason: reason || 'Cancelamento solicitado pelo cliente'
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data.success) {
        toast({
          title: "Assinatura cancelada",
          description: "Sua assinatura será cancelada no final do período atual",
        });
        options.onSuccess?.();
      } else {
        throw new Error(data.error || 'Erro ao cancelar assinatura');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive"
      });
      options.onError?.(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const openCustomerPortal = async () => {
    if (!user) {
      toast({
        title: "Erro",
        description: "Usuário não autenticado",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('customer-portal', {
        body: {
          userId: user.id
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data.success && data.url) {
        window.open(data.url, '_blank');
      } else {
        throw new Error(data.error || 'Erro ao abrir portal do cliente');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive"
      });
      options.onError?.(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const checkSubscriptionStatus = async () => {
    if (!user) {
      return null;
    }

    try {
      const { data, error } = await supabase.functions.invoke('check-subscription', {
        body: {
          userId: user.id
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      return data;
    } catch (error) {
      console.error('Error checking subscription status:', error);
      return null;
    }
  };

  return {
    cancelSubscription,
    openCustomerPortal,
    checkSubscriptionStatus,
    isLoading
  };
}; 
