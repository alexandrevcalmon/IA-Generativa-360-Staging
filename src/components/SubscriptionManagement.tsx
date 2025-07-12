import { useSubscription } from '@/hooks/useSubscription';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  CreditCard, 
  Users, 
  Calendar, 
  AlertTriangle, 
  CheckCircle, 
  ExternalLink,
  Loader2,
  Settings
} from 'lucide-react';
import { getPlanInfo } from '@/lib/stripe';
import { useNavigate } from 'react-router-dom';

export function SubscriptionManagement() {
  const navigate = useNavigate();
  const {
    isActive,
    isLoading,
    planId,
    maxCollaborators,
    currentCollaborators,
    subscriptionStatus,
    subscriptionEndsAt,
    daysUntilExpiry,
    error,
  } = useSubscription();

  const planInfo = planId ? getPlanInfo(planId) : null;

  const getStatusBadge = () => {
    switch (subscriptionStatus) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Ativa</Badge>;
      case 'past_due':
        return <Badge className="bg-orange-100 text-orange-800">Pagamento Pendente</Badge>;
      case 'canceled':
        return <Badge className="bg-red-100 text-red-800">Cancelada</Badge>;
      case 'incomplete':
        return <Badge className="bg-yellow-100 text-yellow-800">Incompleta</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">Inativa</Badge>;
    }
  };

  const handleManageSubscription = () => {
    // Redirecionar para o portal de cobrança do Stripe
    // Em produção, você criaria um endpoint para gerar o link do portal
    window.open('https://billing.stripe.com/p/login/test_123', '_blank');
  };

  const handleUpgradePlan = () => {
    navigate('/planos');
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-calmon-600" />
            <p className="text-gray-600">Carregando informações da assinatura...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            Erro ao carregar assinatura
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()} variant="outline">
            Tentar novamente
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Status da Assinatura */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Status da Assinatura
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-900">
                {planInfo?.displayName || 'Plano não identificado'}
              </h3>
              <p className="text-sm text-gray-600">
                Período: {planInfo?.period || 'N/A'}
              </p>
            </div>
            {getStatusBadge()}
          </div>

          {subscriptionEndsAt && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="h-4 w-4" />
              <span>
                {subscriptionStatus === 'active' ? 'Próxima cobrança:' : 'Termina em:'} {' '}
                {new Date(subscriptionEndsAt).toLocaleDateString('pt-BR')}
                {daysUntilExpiry !== null && daysUntilExpiry > 0 && (
                  <span className="ml-1">({daysUntilExpiry} dias)</span>
                )}
              </span>
            </div>
          )}

          {/* Alertas baseados no status */}
          {subscriptionStatus === 'past_due' && (
            <Alert className="border-orange-200 bg-orange-50">
              <AlertTriangle className="h-4 w-4 text-orange-600" />
              <AlertDescription className="text-orange-800">
                Seu pagamento está em atraso. Atualize seu método de pagamento para manter o acesso.
              </AlertDescription>
            </Alert>
          )}

          {daysUntilExpiry !== null && daysUntilExpiry <= 7 && daysUntilExpiry > 0 && (
            <Alert className="border-yellow-200 bg-yellow-50">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-yellow-800">
                Sua assinatura vence em {daysUntilExpiry} dias. Certifique-se de que seu método de pagamento está atualizado.
              </AlertDescription>
            </Alert>
          )}

          {isActive && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                Sua assinatura está ativa e todos os recursos estão disponíveis.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Uso de Colaboradores */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Uso de Colaboradores
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">
                Colaboradores ativos
              </span>
              <span className="text-sm font-medium">
                {currentCollaborators} / {maxCollaborators}
              </span>
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-300 ${
                  currentCollaborators >= maxCollaborators
                    ? 'bg-red-500'
                    : currentCollaborators >= maxCollaborators * 0.8
                    ? 'bg-yellow-500'
                    : 'bg-green-500'
                }`}
                style={{
                  width: `${Math.min((currentCollaborators / maxCollaborators) * 100, 100)}%`
                }}
              />
            </div>

            {currentCollaborators >= maxCollaborators && (
              <Alert className="border-orange-200 bg-orange-50">
                <Users className="h-4 w-4 text-orange-600" />
                <AlertDescription className="text-orange-800">
                  Você atingiu o limite de colaboradores do seu plano. 
                  Faça upgrade para adicionar mais colaboradores.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Ações */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Gerenciar Assinatura
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button
            onClick={handleManageSubscription}
            className="w-full justify-between"
            variant="outline"
          >
            <span className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Portal de Cobrança
            </span>
            <ExternalLink className="h-4 w-4" />
          </Button>

          <Button
            onClick={handleUpgradePlan}
            className="w-full bg-calmon-500 hover:bg-calmon-600"
          >
            <Users className="h-4 w-4 mr-2" />
            Alterar Plano
          </Button>

          <p className="text-xs text-gray-500 text-center">
            Use o portal de cobrança para atualizar método de pagamento, 
            baixar faturas e gerenciar sua assinatura.
          </p>
        </CardContent>
      </Card>
    </div>
  );
} 