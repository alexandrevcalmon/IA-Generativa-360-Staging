import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  Users, 
  DollarSign,
  Calendar,
  RefreshCw,
  Mail,
  Eye
} from 'lucide-react';
import { useCompanySubscriptionReports } from '@/hooks/useCompanySubscriptionReports';
import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

export function SubscriptionAnalyticsDashboard() {
  const { data, isLoading, error, refetch } = useCompanySubscriptionReports();
  const [selectedCompany, setSelectedCompany] = useState<any>(null);

  if (isLoading) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <div className="flex items-center justify-center py-8 sm:py-12">
          <RefreshCw className="h-6 w-6 sm:h-8 sm:w-8 animate-spin text-calmon-600" />
          <span className="ml-2 sm:ml-3 text-sm sm:text-base text-gray-600">Carregando relatórios...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800 text-sm sm:text-base">
            Erro ao carregar relatórios de assinaturas: {error.message}
          </AlertDescription>
        </Alert>
        <Button onClick={() => refetch()} variant="outline" className="text-sm sm:text-base">
          <RefreshCw className="h-4 w-4 mr-2" />
          Tentar Novamente
        </Button>
      </div>
    );
  }

  if (!data) return null;

  const { summary, overdueCompanies, atRiskCompanies } = data;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Ativa</Badge>;
      case 'past_due':
        return <Badge className="bg-orange-100 text-orange-800">Pagamento Pendente</Badge>;
      case 'canceled':
        return <Badge className="bg-red-100 text-red-800">Cancelada</Badge>;
      case 'trialing':
        return <Badge className="bg-blue-100 text-blue-800">Período de Teste</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">Inativa</Badge>;
    }
  };

  const getRiskLevel = (company: any) => {
    if (company.subscription_status === 'canceled') return 'high';
    if (company.subscription_status === 'past_due') return 'high';
    if (company.days_until_expiry !== null && company.days_until_expiry <= 3) return 'high';
    if (company.days_until_expiry !== null && company.days_until_expiry <= 7) return 'medium';
    return 'low';
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'high': return 'text-red-600';
      case 'medium': return 'text-orange-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Resumo Geral */}
      <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardContent className="p-3 sm:p-4 lg:p-6">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-medium text-gray-600">Total de Empresas</p>
                <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">{summary.totalCompanies}</p>
              </div>
              <div className="p-2 sm:p-3 rounded-full bg-blue-100 flex-shrink-0">
                <Users className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 sm:p-4 lg:p-6">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-medium text-gray-600">Assinaturas Ativas</p>
                <p className="text-lg sm:text-xl lg:text-2xl font-bold text-green-600">{summary.activeSubscriptions}</p>
              </div>
              <div className="p-2 sm:p-3 rounded-full bg-green-100 flex-shrink-0">
                <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 sm:p-4 lg:p-6">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-medium text-gray-600">Em Atraso</p>
                <p className="text-lg sm:text-xl lg:text-2xl font-bold text-orange-600">{summary.overdueSubscriptions}</p>
              </div>
              <div className="p-2 sm:p-3 rounded-full bg-orange-100 flex-shrink-0">
                <AlertTriangle className="h-5 w-5 sm:h-6 sm:w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 sm:p-4 lg:p-6">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-medium text-gray-600">MRR (Receita Recorrente Mensal)</p>
                <p className="text-lg sm:text-xl lg:text-2xl font-bold text-purple-600">
                  R$ {summary.monthlyRecurringRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
                <p className="text-xs text-gray-500">
                  ARR: R$ {summary.annualRecurringRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div className="p-2 sm:p-3 rounded-full bg-purple-100 flex-shrink-0">
                <DollarSign className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 sm:p-4 lg:p-6">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-medium text-gray-600">Taxa de Churn</p>
                <p className={`text-lg sm:text-xl lg:text-2xl font-bold ${summary.churnRate > 5 ? 'text-red-600' : summary.churnRate > 2 ? 'text-orange-600' : 'text-green-600'}`}>
                  {summary.churnRate.toFixed(1)}%
                </p>
                <p className="text-xs text-gray-500">
                  {summary.canceledSubscriptions} cancelamentos
                </p>
              </div>
              <div className={`p-2 sm:p-3 rounded-full ${summary.churnRate > 5 ? 'bg-red-100' : summary.churnRate > 2 ? 'bg-orange-100' : 'bg-green-100'} flex-shrink-0`}>
                <TrendingDown className={`h-5 w-5 sm:h-6 sm:w-6 ${summary.churnRate > 5 ? 'text-red-600' : summary.churnRate > 2 ? 'text-orange-600' : 'text-green-600'}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alertas Críticos */}
      {(overdueCompanies.length > 0 || atRiskCompanies.length > 0) && (
        <div className="space-y-3 sm:space-y-4">
          {overdueCompanies.length > 0 && (
            <Alert className="border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800 text-sm sm:text-base">
                <strong>{overdueCompanies.length} empresa(s)</strong> com pagamento em atraso. 
                <Button 
                  variant="link" 
                  className="p-0 h-auto text-red-800 underline text-sm sm:text-base"
                  onClick={() => document.getElementById('overdue-table')?.scrollIntoView()}
                >
                  Ver detalhes
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {atRiskCompanies.length > 0 && (
            <Alert className="border-orange-200 bg-orange-50">
              <AlertTriangle className="h-4 w-4 text-orange-600" />
              <AlertDescription className="text-orange-800">
                <strong>{atRiskCompanies.length} empresa(s)</strong> com vencimento próximo (≤ 7 dias).
                <Button 
                  variant="link" 
                  className="p-0 h-auto text-orange-800 underline"
                  onClick={() => document.getElementById('at-risk-table')?.scrollIntoView()}
                >
                  Ver detalhes
                </Button>
              </AlertDescription>
            </Alert>
          )}
        </div>
      )}

      {/* Empresas em Atraso */}
      {overdueCompanies.length > 0 && (
        <Card id="overdue-table">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Empresas em Atraso ({overdueCompanies.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Empresa</TableHead>
                  <TableHead>Contato</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Colaboradores</TableHead>
                  <TableHead>Dias em Atraso</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {overdueCompanies.map((company) => (
                  <TableRow key={company.id}>
                    <TableCell className="font-medium">{company.name}</TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm">{company.contact_name}</p>
                        <p className="text-xs text-gray-500">{company.contact_email}</p>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(company.subscription_status)}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <span className="text-green-600">{company.active_collaborators}</span>
                        <span className="text-gray-400"> / </span>
                        <span className="text-red-600">{company.blocked_collaborators}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-red-600 font-medium">
                        {company.days_until_expiry !== null ? Math.abs(company.days_until_expiry) : 'N/A'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button size="sm" variant="outline">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Detalhes da Empresa</DialogTitle>
                              <DialogDescription>
                                Informações detalhadas sobre a assinatura
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <h4 className="font-medium">{company.name}</h4>
                                <p className="text-sm text-gray-600">{company.contact_email}</p>
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <p className="text-sm font-medium">Status</p>
                                  <p className="text-sm">{company.subscription_status}</p>
                                </div>
                                <div>
                                  <p className="text-sm font-medium">Plano</p>
                                  <p className="text-sm">{company.stripe_data?.plan_name || company.subscription_plan_data?.name || 'N/A'}</p>
                                </div>
                                <div>
                                  <p className="text-sm font-medium">Valor Mensal</p>
                                  <p className="text-sm">
                                    {company.stripe_data?.amount 
                                      ? `R$ ${(company.stripe_data.amount / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
                                      : company.subscription_plan_data?.price 
                                      ? `R$ ${company.subscription_plan_data.price.toLocaleString('pt-BR')}`
                                      : 'N/A'
                                    }
                                  </p>
                                </div>
                                <div>
                                  <p className="text-sm font-medium">Próxima Cobrança</p>
                                  <p className="text-sm">
                                    {company.stripe_data?.current_period_end 
                                      ? new Date(company.stripe_data.current_period_end).toLocaleDateString('pt-BR')
                                      : company.subscription_ends_at
                                      ? new Date(company.subscription_ends_at).toLocaleDateString('pt-BR')
                                      : 'N/A'
                                    }
                                  </p>
                                </div>
                                <div>
                                  <p className="text-sm font-medium">Colaboradores Ativos</p>
                                  <p className="text-sm">{company.active_collaborators}</p>
                                </div>
                                <div>
                                  <p className="text-sm font-medium">Colaboradores Bloqueados</p>
                                  <p className="text-sm">{company.blocked_collaborators}</p>
                                </div>
                                {company.stripe_data?.cancel_at_period_end && (
                                  <div className="col-span-2">
                                    <p className="text-sm font-medium text-orange-600">⚠️ Cancelamento Programado</p>
                                    <p className="text-sm text-gray-600">
                                      Esta assinatura será cancelada no final do período atual
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                        <Button size="sm" variant="outline">
                          <Mail className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Empresas em Risco */}
      {atRiskCompanies.length > 0 && (
        <Card id="at-risk-table">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-600">
              <Calendar className="h-5 w-5" />
              Empresas em Risco ({atRiskCompanies.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Empresa</TableHead>
                  <TableHead>Contato</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Vence em</TableHead>
                  <TableHead>Colaboradores</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {atRiskCompanies.map((company) => (
                  <TableRow key={company.id}>
                    <TableCell className="font-medium">{company.name}</TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm">{company.contact_name}</p>
                        <p className="text-xs text-gray-500">{company.contact_email}</p>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(company.subscription_status)}</TableCell>
                    <TableCell>
                      <span className={`font-medium ${getRiskColor(getRiskLevel(company))}`}>
                        {company.days_until_expiry} dias
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <span className="text-green-600">{company.active_collaborators}</span>
                        <span className="text-gray-400"> / </span>
                        <span className="text-red-600">{company.blocked_collaborators}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button size="sm" variant="outline">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Detalhes da Empresa</DialogTitle>
                              <DialogDescription>
                                Informações detalhadas sobre a assinatura
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <h4 className="font-medium">{company.name}</h4>
                                <p className="text-sm text-gray-600">{company.contact_email}</p>
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <p className="text-sm font-medium">Status</p>
                                  <p className="text-sm">{company.subscription_status}</p>
                                </div>
                                <div>
                                  <p className="text-sm font-medium">Plano</p>
                                  <p className="text-sm">{company.stripe_data?.plan_name || company.subscription_plan_data?.name || 'N/A'}</p>
                                </div>
                                <div>
                                  <p className="text-sm font-medium">Vence em</p>
                                  <p className="text-sm">{company.days_until_expiry} dias</p>
                                </div>
                                <div>
                                  <p className="text-sm font-medium">Valor Mensal</p>
                                  <p className="text-sm">
                                    {company.stripe_data?.amount 
                                      ? `R$ ${(company.stripe_data.amount / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
                                      : company.subscription_plan_data?.price 
                                      ? `R$ ${company.subscription_plan_data.price.toLocaleString('pt-BR')}`
                                      : 'N/A'
                                    }
                                  </p>
                                </div>
                                <div>
                                  <p className="text-sm font-medium">Colaboradores</p>
                                  <p className="text-sm">{company.total_collaborators}</p>
                                </div>
                                <div>
                                  <p className="text-sm font-medium">Próxima Cobrança</p>
                                  <p className="text-sm">
                                    {company.stripe_data?.current_period_end 
                                      ? new Date(company.stripe_data.current_period_end).toLocaleDateString('pt-BR')
                                      : company.subscription_ends_at
                                      ? new Date(company.subscription_ends_at).toLocaleDateString('pt-BR')
                                      : 'N/A'
                                    }
                                  </p>
                                </div>
                                {company.stripe_data?.cancel_at_period_end && (
                                  <div className="col-span-2">
                                    <p className="text-sm font-medium text-orange-600">⚠️ Cancelamento Programado</p>
                                    <p className="text-sm text-gray-600">
                                      Esta assinatura será cancelada no final do período atual
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                        <Button size="sm" variant="outline">
                          <Mail className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Ações */}
      <div className="flex justify-between items-center">
        <Button onClick={() => refetch()} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Atualizar Relatórios
        </Button>
        
        <div className="flex gap-2">
          <Button variant="outline">
            <Mail className="h-4 w-4 mr-2" />
            Enviar Lembretes
          </Button>
          <Button>
            Exportar Relatório
          </Button>
        </div>
      </div>
    </div>
  );
} 
