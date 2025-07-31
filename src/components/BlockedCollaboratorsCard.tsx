import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Users, 
  AlertTriangle, 
  Clock, 
  CheckCircle, 
  XCircle,
  RefreshCw
} from 'lucide-react';
import { useBlockedCollaborators } from '@/hooks/useBlockedCollaborators';
import { useCancelSubscription } from '@/hooks/useCancelSubscription';
import { useAuth } from '@/hooks/useAuth';
import { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

export function BlockedCollaboratorsCard() {
  const { data, isLoading, error, refetch } = useBlockedCollaborators();
  const cancelSubscription = useCancelSubscription();
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  if (isLoading) {
    return (
      <Card className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/30 shadow-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Users className="h-5 w-5" />
            Status dos Colaboradores
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin text-gray-400" />
            <span className="ml-2 text-gray-300">Carregando...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/30 shadow-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Users className="h-5 w-5" />
            Status dos Colaboradores
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert className="border-red-500/30 bg-red-900/20">
            <AlertTriangle className="h-4 w-4 text-red-400" />
            <AlertDescription className="text-red-200">
              {error.message || 'Erro ao carregar informações dos colaboradores.'}
            </AlertDescription>
          </Alert>
          <Button 
            onClick={() => refetch()} 
            variant="outline" 
            className="mt-4 border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Tentar Novamente
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!data) return null;

  const getStatusBadge = () => {
    switch (data.subscriptionStatus) {
      case 'active':
        return <Badge className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white border-0">Ativa</Badge>;
      case 'past_due':
        return <Badge className="bg-gradient-to-r from-orange-600 to-red-600 text-white border-0">Pagamento Pendente</Badge>;
      case 'canceled':
        return <Badge className="bg-gradient-to-r from-red-600 to-pink-600 text-white border-0">Cancelada</Badge>;
      case 'trialing':
        return <Badge className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white border-0">Período de Teste</Badge>;
      default:
        return <Badge className="bg-gray-700 text-gray-300 border-gray-600">Inativa</Badge>;
    }
  };

  const getStatusMessage = () => {
    if (data.subscriptionStatus === 'canceled') {
      return 'Sua assinatura foi cancelada. Todos os colaboradores estão bloqueados.';
    }
    
    if (data.subscriptionStatus === 'past_due') {
      return 'Sua assinatura está com pagamento pendente. Colaboradores podem ser bloqueados.';
    }
    
    if (data.daysUntilExpiry !== null && data.daysUntilExpiry <= 7) {
      return `Sua assinatura vence em ${data.daysUntilExpiry} dias.`;
    }
    
    if (data.totalBlocked > 0) {
      return `${data.totalBlocked} colaborador(es) bloqueado(s) devido ao status da assinatura.`;
    }
    
    return 'Todos os colaboradores estão ativos.';
  };

  const getStatusIcon = () => {
    if (data.subscriptionStatus === 'canceled') {
      return <XCircle className="h-5 w-5 text-red-400" />;
    }
    
    if (data.subscriptionStatus === 'past_due') {
      return <AlertTriangle className="h-5 w-5 text-orange-400" />;
    }
    
    if (data.totalBlocked > 0) {
      return <AlertTriangle className="h-5 w-5 text-yellow-400" />;
    }
    
    return <CheckCircle className="h-5 w-5 text-emerald-400" />;
  };

  return (
    <Card className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/30 shadow-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <Users className="h-5 w-5" />
          Status dos Colaboradores
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status da Assinatura */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            <span className="font-medium text-gray-200">Status da Assinatura</span>
          </div>
          {getStatusBadge()}
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-emerald-900/20 border border-emerald-500/30 rounded-lg">
            <div className="text-2xl font-bold text-emerald-400">{data.totalActive}</div>
            <div className="text-sm text-emerald-300">Ativos</div>
          </div>
          <div className="text-center p-3 bg-red-900/20 border border-red-500/30 rounded-lg">
            <div className="text-2xl font-bold text-red-400">{data.totalBlocked}</div>
            <div className="text-sm text-red-300">Bloqueados</div>
          </div>
        </div>

        {/* Mensagem de Status */}
        <Alert className={data.totalBlocked > 0 ? "border-orange-500/30 bg-orange-900/20" : "border-emerald-500/30 bg-emerald-900/20"}>
          {getStatusIcon()}
          <AlertDescription className={data.totalBlocked > 0 ? "text-orange-200" : "text-emerald-200"}>
            {getStatusMessage()}
          </AlertDescription>
        </Alert>

        {/* Data de Expiração */}
        {data.subscriptionEndsAt && (
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <Clock className="h-4 w-4" />
            <span>
              {data.subscriptionStatus === 'canceled' ? 'Cancelada em:' : 'Vence em:'} {' '}
              {new Date(data.subscriptionEndsAt).toLocaleDateString('pt-BR')}
              {data.daysUntilExpiry !== null && data.daysUntilExpiry > 0 && (
                <span className="ml-1">({data.daysUntilExpiry} dias)</span>
              )}
            </span>
          </div>
        )}

        {/* Lista de Colaboradores Bloqueados */}
        {data.blockedCollaborators.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-white">Colaboradores Bloqueados:</h4>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {data.blockedCollaborators.map((collaborator) => (
                <div key={collaborator.id} className="flex items-center justify-between p-2 bg-gray-700/50 border border-gray-600/30 rounded">
                  <div>
                    <p className="text-sm font-medium text-gray-200">{collaborator.profiles.name}</p>
                    <p className="text-xs text-gray-400">{collaborator.profiles.email}</p>
                  </div>
                  <Badge variant="secondary" className="text-xs bg-red-900/20 text-red-300 border-red-500/30">Bloqueado</Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Ações */}
        {data.subscriptionStatus === 'canceled' && (
          <div className="pt-4 border-t border-gray-700">
            <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="outline" 
                  className="w-full border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Reativar Assinatura
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-white">Reativar Assinatura</AlertDialogTitle>
                  <AlertDialogDescription className="text-gray-300">
                    Deseja reativar sua assinatura? Isso desbloqueará todos os colaboradores.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white">
                    Cancelar
                  </AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={() => {
                      cancelSubscription.mutate();
                      setShowCancelDialog(false);
                    }}
                    className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white"
                  >
                    Reativar
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 
