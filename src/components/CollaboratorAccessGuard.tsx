import { ReactNode } from 'react';
import { useCollaboratorAccess } from '@/hooks/useCollaboratorAccess';
import { SubscriptionBlockedMessage } from './SubscriptionBlockedMessage';
import { Loader2 } from 'lucide-react';

interface CollaboratorAccessGuardProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export function CollaboratorAccessGuard({ children, fallback }: CollaboratorAccessGuardProps) {
  const { hasAccess, isBlocked, isLoading, companyName, subscriptionStatus, subscriptionEndsAt } = useCollaboratorAccess();

  // Se está carregando
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-calmon-600" />
          <p className="text-gray-600">Verificando acesso...</p>
        </div>
      </div>
    );
  }

  // Se está bloqueado, mostrar mensagem de bloqueio
  if (isBlocked) {
    if (fallback) {
      return <>{fallback}</>;
    }

    // Prepare the status object for SubscriptionBlockedMessage
    const status = {
      isActive: subscriptionStatus === 'active' || subscriptionStatus === 'trialing',
      status: subscriptionStatus || 'inactive',
      expiresAt: subscriptionEndsAt,
      needsRenewal: subscriptionStatus === 'canceled' || subscriptionStatus === 'unpaid',
      isExpired: subscriptionEndsAt ? new Date(subscriptionEndsAt) < new Date() : false,
      daysUntilExpiry: subscriptionEndsAt ?
        Math.ceil((new Date(subscriptionEndsAt).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) :
        null
    };

    // Create alert message based on subscription status
    const alert = {
      type: 'warning' as const,
      message: companyName ?
        `A assinatura da empresa ${companyName} está ${subscriptionStatus === 'canceled' ? 'cancelada' : 'inativa'}.` :
        'A assinatura da sua empresa está inativa.',
      actionRequired: true
    };

    return (
      <SubscriptionBlockedMessage
        status={status}
        alert={alert}
      />
    );
  }

  // Se tem acesso, renderizar children
  return <>{children}</>;
} 