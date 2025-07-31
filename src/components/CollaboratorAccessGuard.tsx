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
    
    return (
      <SubscriptionBlockedMessage
        companyName={companyName}
        subscriptionStatus={subscriptionStatus}
        subscriptionEndsAt={subscriptionEndsAt}
      />
    );
  }

  // Se tem acesso, renderizar children
  return <>{children}</>;
} 
