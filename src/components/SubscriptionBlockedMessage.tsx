import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Calendar, CreditCard, AlertTriangle, RefreshCw } from 'lucide-react';
import { subscriptionMonitorService } from '@/hooks/auth/subscriptionMonitorService';
import { useAuth } from '@/hooks/auth/useAuth';
import { useToast } from '@/hooks/use-toast';
import { withErrorBoundary } from './ErrorBoundary';

interface SubscriptionBlockedMessageProps {
  // Props para uso com status completo
  status?: {
    isActive: boolean;
    status: string;
    expiresAt?: string;
    daysUntilExpiry?: number;
    needsRenewal: boolean;
    isExpired: boolean;
  };
  alert?: {
    type: 'warning' | 'error' | 'info';
    message: string;
    actionRequired: boolean;
  };
  // Props para uso com dados básicos (usado pelo CollaboratorAccessGuard)
  companyName?: string;
  subscriptionStatus?: string;
  subscriptionEndsAt?: string;
}

function SubscriptionBlockedMessageComponent({ 
  status, 
  alert, 
  companyName, 
  subscriptionStatus, 
  subscriptionEndsAt 
}: SubscriptionBlockedMessageProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  // Criar status padrão se não fornecido
  const effectiveStatus = status || {
    isActive: false,
    status: subscriptionStatus || 'inactive',
    expiresAt: subscriptionEndsAt,
    daysUntilExpiry: subscriptionEndsAt ? calculateDaysUntilExpiry(subscriptionEndsAt) : null,
    needsRenewal: true,
    isExpired: subscriptionEndsAt ? new Date(subscriptionEndsAt) < new Date() : true
  };

  // Função para calcular dias até expiração
  function calculateDaysUntilExpiry(expiryDate: string): number {
    try {
      const expiry = new Date(expiryDate);
      const now = new Date();
      const diffTime = expiry.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays;
    } catch (error) {
      console.error('Error calculating days until expiry:', error);
      return 0;
    }
  }

  const handleRefreshSubscription = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const success = await subscriptionMonitorService.refreshSubscriptionFromStripe(user.id);
      
      if (success) {
        toast({
          title: "Status Atualizado",
          description: "O status da sua assinatura foi atualizado com sucesso.",
        });
        // Reload the page to reflect changes
        window.location.reload();
      } else {
        toast({
          title: "Erro na Atualização",
          description: "Não foi possível atualizar o status da assinatura. Tente novamente.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error refreshing subscription:', error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao atualizar o status da assinatura.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleManageSubscription = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const portalUrl = await subscriptionMonitorService.createPortalSession(user.id);
      
      if (portalUrl) {
        window.open(portalUrl, '_blank');
      } else {
        toast({
          title: "Erro",
          description: "Não foi possível abrir o portal de gerenciamento. Tente novamente.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error creating portal session:', error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao abrir o portal de gerenciamento.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = () => {
    // Proteção contra valores undefined
    if (!effectiveStatus) return 'destructive';
    
    if (effectiveStatus.isExpired) return 'destructive';
    if (effectiveStatus.daysUntilExpiry !== null && effectiveStatus.daysUntilExpiry <= 3) return 'destructive';
    if (effectiveStatus.daysUntilExpiry !== null && effectiveStatus.daysUntilExpiry <= 7) return 'default';
    return 'secondary';
  };

  const getStatusIcon = () => {
    // Proteção contra valores undefined
    if (!effectiveStatus) return <AlertTriangle className="h-4 w-4" />;
    
    if (effectiveStatus.isExpired) return <AlertTriangle className="h-4 w-4" />;
    if (effectiveStatus.daysUntilExpiry !== null && effectiveStatus.daysUntilExpiry <= 3) return <AlertTriangle className="h-4 w-4" />;
    return <Calendar className="h-4 w-4" />;
  };

  const formatExpiryDate = (dateString?: string) => {
    if (!dateString) return 'Não definida';
    try {
      return new Date(dateString).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Data inválida';
    }
  };

  // Proteção contra valores undefined
  if (!effectiveStatus) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black p-3 sm:p-4">
        <Card className="w-full max-w-sm sm:max-w-md bg-gray-800/50 backdrop-blur-xl border border-gray-700/30 shadow-2xl">
          <CardContent className="text-center p-6">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">Erro de Status</h2>
            <p className="text-gray-300">Não foi possível carregar o status da assinatura.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black p-3 sm:p-4">
      <Card className="w-full max-w-sm sm:max-w-md bg-gray-800/50 backdrop-blur-xl border border-gray-700/30 shadow-2xl">
        <CardHeader className="text-center px-4 sm:px-6 py-4 sm:py-6">
          <div className="mx-auto mb-3 sm:mb-4 flex h-12 w-12 sm:h-16 sm:w-16 items-center justify-center rounded-full bg-gradient-to-br from-red-500 to-red-600 shadow-lg">
            <CreditCard className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
          </div>
          <CardTitle className="text-xl sm:text-2xl font-bold text-white">
            Assinatura {effectiveStatus.isExpired ? 'Expirada' : 'Com Problemas'}
          </CardTitle>
          <CardDescription className="text-gray-300 text-sm sm:text-base">
            {companyName ? `A assinatura da empresa ${companyName} precisa de atenção` : 'Sua assinatura precisa de atenção'} para continuar acessando a plataforma
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4 sm:space-y-6 px-4 sm:px-6 pb-4 sm:pb-6">
          {alert && (
            <Alert variant={alert.type === 'error' ? 'destructive' : 'default'}>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="text-sm sm:text-base">
                {alert.message}
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-3 sm:space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs sm:text-sm font-medium text-gray-300">Status:</span>
              <Badge variant={getStatusColor()} className="bg-gray-700/50 border-gray-600 text-white text-xs sm:text-sm">
                {getStatusIcon()}
                <span className="ml-1 capitalize">
                  {effectiveStatus.status === 'active' ? 'Ativa' : 
                   effectiveStatus.status === 'trialing' ? 'Período de Teste' :
                   effectiveStatus.status === 'past_due' ? 'Pagamento Pendente' :
                   effectiveStatus.status === 'canceled' ? 'Cancelada' :
                   effectiveStatus.status === 'unpaid' ? 'Não Paga' :
                   effectiveStatus.status}
                </span>
              </Badge>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs sm:text-sm font-medium text-gray-300">Expira em:</span>
              <span className="text-xs sm:text-sm text-gray-400">
                {formatExpiryDate(effectiveStatus.expiresAt)}
              </span>
            </div>

            {effectiveStatus.daysUntilExpiry !== null && (
              <div className="flex items-center justify-between">
                <span className="text-xs sm:text-sm font-medium text-gray-300">Dias restantes:</span>
                <span className={`text-xs sm:text-sm font-medium ${
                  effectiveStatus.daysUntilExpiry <= 0 ? 'text-red-400' :
                  effectiveStatus.daysUntilExpiry <= 3 ? 'text-orange-400' :
                  effectiveStatus.daysUntilExpiry <= 7 ? 'text-yellow-400' :
                  'text-green-400'
                }`}>
                  {effectiveStatus.daysUntilExpiry <= 0 ? 'Expirada' : `${effectiveStatus.daysUntilExpiry} dia${effectiveStatus.daysUntilExpiry !== 1 ? 's' : ''}`}
                </span>
              </div>
            )}
          </div>

          <div className="space-y-2 sm:space-y-3 pt-4 sm:pt-6">
            {effectiveStatus.isExpired || effectiveStatus.status === 'canceled' ? (
              <Button 
                onClick={handleManageSubscription}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-semibold h-10 sm:h-12"
              >
                {isLoading ? (
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <CreditCard className="mr-2 h-4 w-4" />
                )}
                Renovar Assinatura
              </Button>
            ) : (
              <>
                <Button 
                  onClick={handleManageSubscription}
                  disabled={isLoading}
                  variant="outline"
                  className="w-full border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white h-10 sm:h-12"
                >
                  <CreditCard className="mr-2 h-4 w-4" />
                  Gerenciar Assinatura
                </Button>
                
                <Button 
                  onClick={handleRefreshSubscription}
                  disabled={isLoading}
                  variant="ghost"
                  className="w-full text-gray-300 hover:bg-gray-700 hover:text-white h-10 sm:h-12"
                >
                  {isLoading ? (
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="mr-2 h-4 w-4" />
                  )}
                  Atualizar Status
                </Button>
              </>
            )}
          </div>

          <div className="pt-4 sm:pt-6 border-t border-gray-600/30">
            <p className="text-xs text-gray-400 text-center">
              Em caso de dúvidas, entre em contato com nosso suporte
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Exportar o componente com Error Boundary
export const SubscriptionBlockedMessage = withErrorBoundary(SubscriptionBlockedMessageComponent); 
