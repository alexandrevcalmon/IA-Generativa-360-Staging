import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Calendar, CreditCard, AlertTriangle, RefreshCw, Settings, X } from 'lucide-react';
import { useSubscriptionManagement } from '@/hooks/useSubscriptionManagement';
import { useAuth } from '@/hooks/auth/useAuth';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface SubscriptionManagementProps {
  className?: string;
}

export function SubscriptionManagement({ className }: SubscriptionManagementProps) {
  const { user, companyUserData } = useAuth();
  const { cancelSubscription, openCustomerPortal, isLoading } = useSubscriptionManagement({
    onSuccess: () => {
      // Refresh user data after cancellation
      window.location.reload();
    }
  });

  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  if (!user || !companyUserData) {
    return null;
  }

  const subscription = companyUserData.subscription;
  const isActive = subscription?.status === 'active';
  const isCanceled = subscription?.status === 'canceled';
  const isExpired = subscription?.status === 'expired';

  const handleCancelSubscription = async () => {
    await cancelSubscription(cancelReason);
    setIsCancelDialogOpen(false);
    setCancelReason('');
  };

  const getStatusBadge = () => {
    if (isExpired) {
      return <Badge variant="destructive">Expirada</Badge>;
    }
    if (isCanceled) {
      return <Badge variant="secondary">Cancelada</Badge>;
    }
    if (isActive) {
      return <Badge variant="default">Ativa</Badge>;
    }
    return <Badge variant="outline">Desconhecido</Badge>;
  };

  const getStatusMessage = () => {
    if (isExpired) {
      return "Sua assinatura expirou. Renove para continuar usando os serviços.";
    }
    if (isCanceled) {
      return "Sua assinatura foi cancelada e será encerrada no final do período atual.";
    }
    if (isActive) {
      return "Sua assinatura está ativa e funcionando normalmente.";
    }
    return "Status da assinatura desconhecido.";
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Gerenciar Assinatura
        </CardTitle>
        <CardDescription>
          Gerencie sua assinatura e configurações de pagamento
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status da Assinatura */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium">Status da Assinatura</p>
            <p className="text-sm text-muted-foreground">{getStatusMessage()}</p>
          </div>
          {getStatusBadge()}
        </div>

        {/* Informações da Assinatura */}
        {subscription && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Plano:</span>
              <span className="font-medium">{subscription.plan_name || 'N/A'}</span>
            </div>
            {subscription.current_period_end && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Próxima cobrança:</span>
                <span className="font-medium">
                  {format(new Date(subscription.current_period_end), 'dd/MM/yyyy', { locale: ptBR })}
                </span>
              </div>
            )}
            {subscription.cancel_at_period_end && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Cancelamento:</span>
                <span className="font-medium text-orange-600">
                  {format(new Date(subscription.current_period_end), 'dd/MM/yyyy', { locale: ptBR })}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Alertas */}
        {isExpired && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Sua assinatura expirou. Acesse o portal do cliente para renovar.
            </AlertDescription>
          </Alert>
        )}

        {isCanceled && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Sua assinatura foi cancelada. Você ainda pode acessar os serviços até o final do período atual.
            </AlertDescription>
          </Alert>
        )}

        {/* Ações */}
        <div className="flex gap-2">
          <Button
            onClick={openCustomerPortal}
            disabled={isLoading}
            className="flex-1"
            variant="outline"
          >
            <Settings className="h-4 w-4 mr-2" />
            Portal do Cliente
          </Button>

          {isActive && !isCanceled && (
            <Dialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="destructive" disabled={isLoading}>
                  <X className="h-4 w-4 mr-2" />
                  Cancelar
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Cancelar Assinatura</DialogTitle>
                  <DialogDescription>
                    Tem certeza que deseja cancelar sua assinatura? Ela permanecerá ativa até o final do período atual.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="cancel-reason">Motivo do cancelamento (opcional)</Label>
                    <Textarea
                      id="cancel-reason"
                      placeholder="Conte-nos por que está cancelando..."
                      value={cancelReason}
                      onChange={(e) => setCancelReason(e.target.value)}
                      className="mt-2"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setIsCancelDialogOpen(false)}
                    disabled={isLoading}
                  >
                    Manter Assinatura
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleCancelSubscription}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Cancelando...
                      </>
                    ) : (
                      'Confirmar Cancelamento'
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 
