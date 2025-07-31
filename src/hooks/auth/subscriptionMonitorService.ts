import { supabase } from '@/integrations/supabase/client';
import { unifiedRoleService } from './unifiedRoleService';

interface SubscriptionStatus {
  isActive: boolean;
  status: string;
  expiresAt?: string;
  daysUntilExpiry?: number;
  needsRenewal: boolean;
  isExpired: boolean;
}

interface SubscriptionAlert {
  type: 'warning' | 'error' | 'info';
  message: string;
  actionRequired: boolean;
}

export const createSubscriptionMonitorService = () => {
  const WARNING_DAYS = 7; // Aviso 7 dias antes da expiração
  const CRITICAL_DAYS = 3; // Crítico 3 dias antes da expiração

  const checkSubscriptionStatus = async (userId: string): Promise<SubscriptionStatus> => {
    try {
      const { data: companyData } = await supabase
        .from('companies')
        .select(`
          subscription_status,
          subscription_ends_at,
          stripe_subscription_id,
          stripe_customer_id
        `)
        .eq('auth_user_id', userId)
        .maybeSingle();

      if (!companyData) {
        return {
          isActive: false,
          status: 'no_subscription',
          needsRenewal: true,
          isExpired: true
        };
      }

      const now = new Date();
      const expiresAt = companyData.subscription_ends_at ? new Date(companyData.subscription_ends_at) : null;
      const daysUntilExpiry = expiresAt ? Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) : null;

      const isActive = (companyData.subscription_status === 'active' || 
                       companyData.subscription_status === 'trialing') &&
                      (!expiresAt || expiresAt > now);

      const isExpired = expiresAt ? expiresAt <= now : true;
      const needsRenewal = !isActive || (daysUntilExpiry !== null && daysUntilExpiry <= WARNING_DAYS);

      return {
        isActive,
        status: companyData.subscription_status,
        expiresAt: companyData.subscription_ends_at,
        daysUntilExpiry,
        needsRenewal,
        isExpired
      };
    } catch (error) {
      console.error('[SubscriptionMonitorService] Error checking subscription status:', error);
      return {
        isActive: false,
        status: 'error',
        needsRenewal: true,
        isExpired: true
      };
    }
  };

  const getSubscriptionAlert = (status: SubscriptionStatus): SubscriptionAlert | null => {
    if (status.isExpired) {
      return {
        type: 'error',
        message: 'Sua assinatura expirou. Renove para continuar acessando a plataforma.',
        actionRequired: true
      };
    }

    if (status.daysUntilExpiry !== null && status.daysUntilExpiry <= CRITICAL_DAYS) {
      return {
        type: 'error',
        message: `Sua assinatura expira em ${status.daysUntilExpiry} dia${status.daysUntilExpiry !== 1 ? 's' : ''}. Renove agora para evitar interrupção do serviço.`,
        actionRequired: true
      };
    }

    if (status.daysUntilExpiry !== null && status.daysUntilExpiry <= WARNING_DAYS) {
      return {
        type: 'warning',
        message: `Sua assinatura expira em ${status.daysUntilExpiry} dia${status.daysUntilExpiry !== 1 ? 's' : ''}. Considere renovar para continuar sem interrupções.`,
        actionRequired: false
      };
    }

    if (status.status === 'past_due') {
      return {
        type: 'warning',
        message: 'Há um problema com o pagamento da sua assinatura. Verifique seus dados de pagamento.',
        actionRequired: true
      };
    }

    if (status.status === 'canceled') {
      return {
        type: 'error',
        message: 'Sua assinatura foi cancelada. Reative para continuar acessando a plataforma.',
        actionRequired: true
      };
    }

    return null;
  };

  const shouldBlockAccess = (status: SubscriptionStatus): boolean => {
    return status.isExpired || 
           status.status === 'canceled' || 
           status.status === 'unpaid' ||
           (status.daysUntilExpiry !== null && status.daysUntilExpiry <= 0);
  };

  const refreshSubscriptionFromStripe = async (userId: string): Promise<boolean> => {
    try {
      console.log('[SubscriptionMonitorService] Refreshing subscription from Stripe for user:', userId);
      
      // Call Edge Function to refresh subscription status
      const { data, error } = await supabase.functions.invoke('check-subscription', {
        body: { userId }
      });

      if (error) {
        console.error('[SubscriptionMonitorService] Error refreshing subscription:', error);
        return false;
      }

      console.log('[SubscriptionMonitorService] Subscription refreshed successfully');
      return true;
    } catch (error) {
      console.error('[SubscriptionMonitorService] Error calling refresh function:', error);
      return false;
    }
  };

  const createPortalSession = async (userId: string): Promise<string | null> => {
    try {
      console.log('[SubscriptionMonitorService] Creating customer portal session for user:', userId);
      
      const { data, error } = await supabase.functions.invoke('customer-portal', {
        body: { userId }
      });

      if (error) {
        console.error('[SubscriptionMonitorService] Error creating portal session:', error);
        return null;
      }

      return data.url;
    } catch (error) {
      console.error('[SubscriptionMonitorService] Error calling portal function:', error);
      return null;
    }
  };

  const monitorSubscription = async (userId: string): Promise<{
    status: SubscriptionStatus;
    alert: SubscriptionAlert | null;
    shouldBlock: boolean;
  }> => {
    const status = await checkSubscriptionStatus(userId);
    const alert = getSubscriptionAlert(status);
    const shouldBlock = shouldBlockAccess(status);

    // If subscription is critical, try to refresh from Stripe
    if (status.needsRenewal && !status.isActive) {
      await refreshSubscriptionFromStripe(userId);
    }

    return {
      status,
      alert,
      shouldBlock
    };
  };

  return {
    checkSubscriptionStatus,
    getSubscriptionAlert,
    shouldBlockAccess,
    refreshSubscriptionFromStripe,
    createPortalSession,
    monitorSubscription
  };
};

// Export singleton instance
export const subscriptionMonitorService = createSubscriptionMonitorService(); 
