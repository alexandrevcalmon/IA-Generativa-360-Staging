import { ReactNode } from 'react';
import { useSubscription } from '@/hooks/useSubscription';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CreditCard, Users, AlertTriangle, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface SubscriptionGuardProps {
  children: ReactNode;
  feature?: string;
  requiresActiveSubscription?: boolean;
  requiresCollaboratorSlot?: boolean;
  fallbackMessage?: string;
}

export function SubscriptionGuard({
  children,
  feature = 'esta funcionalidade',
  requiresActiveSubscription = true,
  requiresCollaboratorSlot = false,
  fallbackMessage,
}: SubscriptionGuardProps) {
  const navigate = useNavigate();
  const {
    isActive,
    isLoading,
    subscriptionStatus,
    canAddCollaborators,
    maxCollaborators,
    currentCollaborators,
    daysUntilExpiry,
    error,
  } = useSubscription();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-calmon-600" />
          <p className="text-gray-600">Verificando assinatura...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            Erro ao verificar assinatura
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button 
            onClick={() => window.location.reload()} 
            variant="outline" 
            className="w-full"
          >
            Tentar novamente
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Verificar se precisa de assinatura ativa
  if (requiresActiveSubscription && !isActive) {
    return (
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-orange-600">
            <CreditCard className="h-5 w-5" />
            Assinatura Necessária
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {subscriptionStatus === 'past_due' ? (
            <Alert className="border-orange-200 bg-orange-50">
              <AlertTriangle className="h-4 w-4 text-orange-600" />
              <AlertDescription className="text-orange-800">
                Sua assinatura está com pagamento pendente. Regularize para acessar {feature}.
              </AlertDescription>
            </Alert>
          ) : subscriptionStatus === 'canceled' ? (
            <Alert className="border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                Sua assinatura foi cancelada. Reative para acessar {feature}.
              </AlertDescription>
            </Alert>
          ) : (
            <Alert className="border-blue-200 bg-blue-50">
              <AlertTriangle className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800">
                {fallbackMessage || `Para acessar ${feature}, você precisa de uma assinatura ativa.`}
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Button
              onClick={() => navigate('/planos')}
              className="w-full bg-calmon-500 hover:bg-calmon-600"
            >
              <CreditCard className="h-4 w-4 mr-2" />
              Ver Planos
            </Button>
            
            {subscriptionStatus === 'past_due' && (
              <Button
                onClick={() => window.open('https://billing.stripe.com/p/login/test_123', '_blank')}
                variant="outline"
                className="w-full"
              >
                Atualizar Pagamento
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Verificar limite de colaboradores
  if (requiresCollaboratorSlot && !canAddCollaborators) {
    return (
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-orange-600">
            <Users className="h-5 w-5" />
            Limite de Colaboradores
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert className="border-orange-200 bg-orange-50">
            <Users className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-800">
              Você atingiu o limite de {maxCollaborators} colaboradores do seu plano atual.
              <br />
              <span className="text-sm">Colaboradores ativos: {currentCollaborators}/{maxCollaborators}</span>
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Button
              onClick={() => navigate('/planos')}
              className="w-full bg-calmon-500 hover:bg-calmon-600"
            >
              <CreditCard className="h-4 w-4 mr-2" />
              Fazer Upgrade do Plano
            </Button>
            
            <Button
              onClick={() => navigate('/empresa/colaboradores')}
              variant="outline"
              className="w-full"
            >
              <Users className="h-4 w-4 mr-2" />
              Gerenciar Colaboradores
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Mostrar alerta se próximo do vencimento
  const showExpiryWarning = daysUntilExpiry !== null && daysUntilExpiry <= 7 && daysUntilExpiry > 0;

  return (
    <div>
      {showExpiryWarning && (
        <Alert className="mb-4 border-yellow-200 bg-yellow-50">
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800">
            Sua assinatura vence em {daysUntilExpiry} dias. 
            <Button
              variant="link"
              className="p-0 h-auto ml-2 text-yellow-800 underline"
              onClick={() => navigate('/planos')}
            >
              Renovar agora
            </Button>
          </AlertDescription>
        </Alert>
      )}
      
      {children}
    </div>
  );
} 
