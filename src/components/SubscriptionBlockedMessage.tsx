import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Calendar, CreditCard, AlertTriangle, RefreshCw } from 'lucide-react';
import { subscriptionMonitorService } from '@/hooks/auth/subscriptionMonitorService';
import { useAuth } from '@/hooks/auth';
import { useToast } from '@/hooks/use-toast';

interface SubscriptionBlockedMessageProps {
  status: {
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
}

export function SubscriptionBlockedMessage({ status, alert }: SubscriptionBlockedMessageProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

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
    if (status.isExpired) return 'destructive';
    if (status.daysUntilExpiry !== null && status.daysUntilExpiry <= 3) return 'destructive';
    if (status.daysUntilExpiry !== null && status.daysUntilExpiry <= 7) return 'default';
    return 'secondary';
  };

  const getStatusIcon = () => {
    if (status.isExpired) return <AlertTriangle className="h-4 w-4" />;
    if (status.daysUntilExpiry !== null && status.daysUntilExpiry <= 3) return <AlertTriangle className="h-4 w-4" />;
    return <Calendar className="h-4 w-4" />;
  };

  const formatExpiryDate = (dateString?: string) => {
    if (!dateString) return 'Não definida';
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black p-4">
      <Card className="w-full max-w-md bg-gray-800/50 backdrop-blur-xl border border-gray-700/30 shadow-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-red-500 to-red-600 shadow-lg">
            <CreditCard className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold text-white">
            Assinatura {status.isExpired ? 'Expirada' : 'Com Problemas'}
          </CardTitle>
          <CardDescription className="text-gray-300 text-base">
            Sua assinatura precisa de atenção para continuar acessando a plataforma
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {alert && (
            <Alert variant={alert.type === 'error' ? 'destructive' : 'default'}>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                {alert.message}
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-300">Status:</span>
              <Badge variant={getStatusColor()} className="bg-gray-700/50 border-gray-600 text-white">
                {getStatusIcon()}
                <span className="ml-1 capitalize">
                  {status.status === 'active' ? 'Ativa' : 
                   status.status === 'trialing' ? 'Período de Teste' :
                   status.status === 'past_due' ? 'Pagamento Pendente' :
                   status.status === 'canceled' ? 'Cancelada' :
                   status.status === 'unpaid' ? 'Não Paga' :
                   status.status}
                </span>
              </Badge>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-300">Expira em:</span>
              <span className="text-sm text-gray-400">
                {formatExpiryDate(status.expiresAt)}
              </span>
            </div>

            {status.daysUntilExpiry !== null && (
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-300">Dias restantes:</span>
                <span className={`text-sm font-medium ${
                  status.daysUntilExpiry <= 0 ? 'text-red-400' :
                  status.daysUntilExpiry <= 3 ? 'text-orange-400' :
                  status.daysUntilExpiry <= 7 ? 'text-yellow-400' :
                  'text-green-400'
                }`}>
                  {status.daysUntilExpiry <= 0 ? 'Expirada' : `${status.daysUntilExpiry} dia${status.daysUntilExpiry !== 1 ? 's' : ''}`}
                </span>
              </div>
            )}
          </div>

          <div className="space-y-3 pt-6">
            {status.isExpired || status.status === 'canceled' ? (
              <Button 
                onClick={handleManageSubscription}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-semibold"
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
                  className="w-full border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
                >
                  <CreditCard className="mr-2 h-4 w-4" />
                  Gerenciar Assinatura
                </Button>
                
                <Button 
                  onClick={handleRefreshSubscription}
                  disabled={isLoading}
                  variant="ghost"
                  className="w-full text-gray-300 hover:bg-gray-700 hover:text-white"
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

          <div className="pt-6 border-t border-gray-600/30">
            <p className="text-xs text-gray-400 text-center">
              Em caso de dúvidas, entre em contato com nosso suporte
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 