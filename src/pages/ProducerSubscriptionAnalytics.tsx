import { PageLayout } from "@/components/PageLayout";
import { useCompanySubscriptionReports } from "@/hooks/useCompanySubscriptionReports";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  AlertTriangle, 
  DollarSign,
  Users,
  Calendar,
  RefreshCw,
  CheckCircle,
  Filter
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const ProducerSubscriptionAnalytics = () => {
  const { data, isLoading, error, refetch } = useCompanySubscriptionReports();
  
  // Estado para filtros de período
  const [periodFilter, setPeriodFilter] = useState<'day' | 'week' | 'month' | 'semester' | 'year' | 'total'>('total');
  
  // Função para calcular dados filtrados por período
  const getFilteredData = () => {
    if (!data) return null;
    
    const now = new Date();
    let startDate: Date;
    
    switch (periodFilter) {
      case 'day':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'semester':
        startDate = new Date(now.getFullYear(), now.getMonth() - 6, 1);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      case 'total':
      default:
        return data; // Retorna todos os dados
    }
    
    // Filtrar empresas criadas no período
    const filteredCompanies = data.companies.filter(company => {
      const companyDate = new Date(company.created_at);
      return companyDate >= startDate;
    });
    
    // Recalcular métricas baseadas nos dados filtrados
    const activeSubscriptions = filteredCompanies.filter(c => 
      c.subscription_status === 'active' || c.subscription_status === 'trialing'
    );
    
    const overdueSubscriptions = filteredCompanies.filter(c => 
      c.subscription_status === 'past_due' || c.is_overdue
    );
    
    const canceledSubscriptions = filteredCompanies.filter(c => 
      c.subscription_status === 'canceled'
    );
    
    const monthlyRecurringRevenue = filteredCompanies
      .filter(c => c.subscription_status === 'active' || c.subscription_status === 'trialing')
      .reduce((sum, c) => {
        if (c.stripe_data?.amount) {
          return sum + (c.stripe_data.amount / 100);
        }
        return sum;
      }, 0);
    
    const annualRecurringRevenue = monthlyRecurringRevenue * 12;
    const totalSubscriptions = filteredCompanies.length;
    const churnRate = totalSubscriptions > 0 
      ? (canceledSubscriptions.length / totalSubscriptions) * 100 
      : 0;
    
    return {
      ...data,
      companies: filteredCompanies,
      summary: {
        totalCompanies: filteredCompanies.length,
        activeSubscriptions: activeSubscriptions.length,
        overdueSubscriptions: overdueSubscriptions.length,
        canceledSubscriptions: canceledSubscriptions.length,
        totalRevenue: monthlyRecurringRevenue,
        totalBlockedCollaborators: filteredCompanies.reduce((sum, c) => sum + (c.blocked_collaborators || 0), 0),
        companiesAtRisk: filteredCompanies.filter(c => 
          c.days_until_expiry !== null && c.days_until_expiry <= 7 && c.days_until_expiry > 0
        ).length,
        monthlyRecurringRevenue,
        annualRecurringRevenue,
        churnRate,
        lastSyncAt: data.summary.lastSyncAt
      },
      overdueCompanies: filteredCompanies.filter(c => 
        c.subscription_status === 'past_due' || c.is_overdue
      ),
      atRiskCompanies: filteredCompanies.filter(c => 
        c.days_until_expiry !== null && c.days_until_expiry <= 7 && c.days_until_expiry > 0
      )
    };
  };
  
  const filteredData = getFilteredData();
  
  return (
    <PageLayout
      title="Analytics de Assinaturas"
      subtitle="Monitore o status das assinaturas das empresas em tempo real"
      background="dark"
      className="dark-theme-override"
      headerContent={
        <div className="flex items-center gap-3">
          {/* Filtros de Período */}
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 !text-gray-300" />
            <Select value={periodFilter} onValueChange={(value: any) => setPeriodFilter(value)}>
              <SelectTrigger className="w-40 !bg-gray-800 !border-gray-600 !text-gray-300">
                <SelectValue placeholder="Período" />
              </SelectTrigger>
              <SelectContent className="!bg-gray-800 !border-gray-600">
                <SelectItem value="day" className="!text-gray-300 hover:!bg-gray-700">Hoje</SelectItem>
                <SelectItem value="week" className="!text-gray-300 hover:!bg-gray-700">Última Semana</SelectItem>
                <SelectItem value="month" className="!text-gray-300 hover:!bg-gray-700">Este Mês</SelectItem>
                <SelectItem value="semester" className="!text-gray-300 hover:!bg-gray-700">Último Semestre</SelectItem>
                <SelectItem value="year" className="!text-gray-300 hover:!bg-gray-700">Este Ano</SelectItem>
                <SelectItem value="total" className="!text-gray-300 hover:!bg-gray-700">Total</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center gap-2 px-3 py-1 !bg-gradient-to-r !from-green-500/20 !to-blue-500/20 rounded-full !border !border-green-400/30">
            <div className="w-2 h-2 !bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium !text-green-300">Dados em Tempo Real</span>
          </div>
          <Button
            onClick={() => refetch()}
            disabled={isLoading}
            size="sm"
            variant="outline"
            className="!border-gray-600 !text-gray-300 hover:!bg-gray-700 hover:!text-white"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Atualizar Dados
          </Button>
        </div>
      }
    >
      <div className="max-w-7xl mx-auto">
        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <RefreshCw className="h-12 w-12 animate-spin !text-blue-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold !text-white mb-2">Carregando Analytics</h3>
              <p className="!text-gray-300">Buscando dados atualizados do Stripe...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-16">
            <div className="max-w-md mx-auto">
              <AlertTriangle className="h-16 w-16 !text-red-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold !text-white mb-2">Erro ao carregar dados</h3>
              <p className="!text-gray-300 mb-6">{error.message}</p>
              <Button onClick={() => refetch()} variant="outline" size="lg" className="!border-gray-600 !text-gray-300 hover:!bg-gray-700 hover:!text-white">
                <RefreshCw className="h-4 w-4 mr-2" />
                Tentar Novamente
              </Button>
            </div>
          </div>
        )}

        {/* Main Content */}
        {filteredData && (
          <div className="space-y-8">
            {/* Seção Única - Métricas Principais */}
            <div className="!bg-gradient-to-r !from-gray-800 !to-gray-900 rounded-xl p-6 !border !border-gray-700">
              <div className="mb-6">
                <h2 className="text-xl font-semibold !text-white mb-2">Métricas Principais</h2>
                <p className="!text-gray-300">
                  Visão geral das métricas principais do negócio
                  {periodFilter !== 'total' && (
                    <span className="!text-blue-300 ml-2">
                      (Filtrado por período: {periodFilter === 'day' ? 'Hoje' : 
                        periodFilter === 'week' ? 'Última Semana' :
                        periodFilter === 'month' ? 'Este Mês' :
                        periodFilter === 'semester' ? 'Último Semestre' :
                        periodFilter === 'year' ? 'Este Ano' : 'Total'})
                    </span>
                  )}
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
                {/* Total de Empresas */}
                <Card className="!bg-gray-800 !border-2 !border-gray-600 shadow-sm hover:!shadow-lg transition-all duration-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <Users className="h-6 w-6 !text-blue-400" />
                      <span className="text-xs font-medium !text-blue-300 !bg-blue-500/20 px-2 py-1 rounded-full">
                        Total
                      </span>
                    </div>
                    <div>
                      <p className="text-2xl font-bold !text-white mb-1">{filteredData.summary.totalCompanies}</p>
                      <p className="text-xs font-medium !text-gray-300">Total de Empresas</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Assinaturas Ativas */}
                <Card className="!bg-gray-800 !border-2 !border-green-500/30 shadow-sm hover:!shadow-lg transition-all duration-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <CheckCircle className="h-6 w-6 !text-green-400" />
                      <span className="text-xs font-medium !text-green-300 !bg-green-500/20 px-2 py-1 rounded-full">
                        Ativas
                      </span>
                    </div>
                    <div>
                      <p className="text-2xl font-bold !text-green-300 mb-1">{filteredData.summary.activeSubscriptions}</p>
                      <p className="text-xs font-medium !text-green-200">Assinaturas Ativas</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Em Atraso */}
                <Card className="!bg-gray-800 !border-2 !border-orange-500/30 shadow-sm hover:!shadow-lg transition-all duration-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <AlertTriangle className="h-6 w-6 !text-orange-400" />
                      <span className="text-xs font-medium !text-orange-300 !bg-orange-500/20 px-2 py-1 rounded-full">
                        Atraso
                      </span>
                    </div>
                    <div>
                      <p className="text-2xl font-bold !text-orange-300 mb-1">{filteredData.summary.overdueSubscriptions}</p>
                      <p className="text-xs font-medium !text-orange-200">Em Atraso</p>
                    </div>
                  </CardContent>
                </Card>

                {/* MRR */}
                <Card className="!bg-gray-800 !border-2 !border-purple-500/30 shadow-sm hover:!shadow-lg transition-all duration-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <TrendingUp className="h-6 w-6 !text-purple-400" />
                      <span className="text-xs font-medium !text-purple-300 !bg-purple-500/20 px-2 py-1 rounded-full">
                        MRR
                      </span>
                    </div>
                    <div>
                      <p className="text-xl font-bold !text-purple-300 mb-1">
                        R$ {filteredData.summary.monthlyRecurringRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
                      </p>
                      <p className="text-xs !text-purple-200 mb-1">Receita Mensal</p>
                      <p className="text-xs font-medium !text-purple-200">MRR (Mensal)</p>
                    </div>
                  </CardContent>
                </Card>

                {/* ARR */}
                <Card className="!bg-gray-800 !border-2 !border-indigo-500/30 shadow-sm hover:!shadow-lg transition-all duration-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <DollarSign className="h-6 w-6 !text-indigo-400" />
                      <span className="text-xs font-medium !text-indigo-300 !bg-indigo-500/20 px-2 py-1 rounded-full">
                        ARR
                      </span>
                    </div>
                    <div>
                      <p className="text-xl font-bold !text-indigo-300 mb-1">
                        R$ {filteredData.summary.annualRecurringRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
                      </p>
                      <p className="text-xs !text-indigo-200 mb-1">Receita Anual</p>
                      <p className="text-xs font-medium !text-indigo-200">ARR (Anual)</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Taxa de Churn */}
                <Card className="!bg-gray-800 !border-2 !border-red-500/30 shadow-sm hover:!shadow-lg transition-all duration-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <TrendingDown className="h-6 w-6 !text-red-400" />
                      <span className="text-xs font-medium !text-red-300 !bg-red-500/20 px-2 py-1 rounded-full">
                        Churn
                      </span>
                    </div>
                    <div>
                      <p className="text-2xl font-bold !text-red-300 mb-1">{filteredData.summary.churnRate.toFixed(1)}%</p>
                      <p className="text-xs !text-red-200 mb-1">{filteredData.summary.canceledSubscriptions} cancelamentos</p>
                      <p className="text-xs font-medium !text-red-200">Taxa de Churn</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Dashboard de Analytics - Foco em Dados Detalhados */}
            <div className="grid gap-6 grid-cols-1 lg:grid-cols-12">
              {/* Métricas Detalhadas - Lado Esquerdo */}
              <div className="lg:col-span-4">
                <Card className="sticky top-6 !bg-gray-800 !border-gray-700">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 !text-white">
                      <BarChart3 className="h-5 w-5 !text-blue-400" />
                      Análise Detalhada
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Taxa de Ativação */}
                    <div className="flex items-center justify-between p-3 !bg-green-500/10 rounded-lg !border !border-green-500/20">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 !text-green-400" />
                        <span className="text-sm font-medium !text-white">Taxa de Ativação</span>
                      </div>
                      <Badge className="!bg-green-500/20 !text-green-300 !border-green-500/30">
                        {((filteredData.summary.activeSubscriptions / filteredData.summary.totalCompanies) * 100).toFixed(1)}%
                      </Badge>
                    </div>

                    {/* Empresas em Risco */}
                    <div className="flex items-center justify-between p-3 !bg-amber-500/10 rounded-lg !border !border-amber-500/20">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 !text-amber-400" />
                        <span className="text-sm font-medium !text-white">Empresas em Risco</span>
                      </div>
                      <Badge variant="outline" className="!border-amber-500/30 !text-amber-300">
                        {filteredData.atRiskCompanies.length}
                      </Badge>
                    </div>

                    {/* Receita por Empresa */}
                    <div className="flex items-center justify-between p-3 !bg-purple-500/10 rounded-lg !border !border-purple-500/20">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-5 w-5 !text-purple-400" />
                        <span className="text-sm font-medium !text-white">Receita/Empresa</span>
                      </div>
                      <span className="text-sm font-bold !text-purple-300">
                        R$ {(filteredData.summary.monthlyRecurringRevenue / filteredData.summary.totalCompanies).toFixed(0)}
                      </span>
                    </div>

                    {/* Status da Taxa de Churn */}
                    <div className={`flex items-center justify-between p-3 rounded-lg !border ${
                      filteredData.summary.churnRate > 5 ? '!bg-red-500/10 !border-red-500/20' : 
                      filteredData.summary.churnRate > 2 ? '!bg-orange-500/10 !border-orange-500/20' : '!bg-green-500/10 !border-green-500/20'
                    }`}>
                      <div className="flex items-center gap-2">
                        <TrendingDown className={`h-5 w-5 ${
                          filteredData.summary.churnRate > 5 ? '!text-red-400' : 
                          filteredData.summary.churnRate > 2 ? '!text-orange-400' : '!text-green-400'
                        }`} />
                        <span className="text-sm font-medium !text-white">Status do Churn</span>
                      </div>
                      <Badge className={
                        filteredData.summary.churnRate > 5 ? '!bg-red-500/20 !text-red-300 !border-red-500/30' : 
                        filteredData.summary.churnRate > 2 ? '!bg-orange-500/20 !text-orange-300 !border-orange-500/30' : '!bg-green-500/20 !text-green-300 !border-green-500/30'
                      }>
                        {filteredData.summary.churnRate > 5 ? 'Alto' : 
                         filteredData.summary.churnRate > 2 ? 'Médio' : 'Baixo'}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Lista de Empresas - Lado Direito */}
              <div className="lg:col-span-8">
                <Card className="!bg-gray-800 !border-gray-700">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 !text-white">
                      <Users className="h-5 w-5 !text-gray-400" />
                      Lista de Empresas
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {filteredData.companies.map((company) => (
                        <div key={company.id} className="flex items-center justify-between p-4 !bg-gray-700 rounded-lg !border !border-gray-600">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h4 className="font-medium !text-white">{company.name}</h4>
                              <Badge className={
                                company.subscription_status === 'active' ? '!bg-green-500/20 !text-green-300 !border-green-500/30' :
                                company.subscription_status === 'past_due' ? '!bg-orange-500/20 !text-orange-300 !border-orange-500/30' :
                                company.subscription_status === 'canceled' ? '!bg-red-500/20 !text-red-300 !border-red-500/30' :
                                '!bg-gray-500/20 !text-gray-300 !border-gray-500/30'
                              }>
                                {company.subscription_status === 'active' ? 'Ativa' :
                                 company.subscription_status === 'past_due' ? 'Em Atraso' :
                                 company.subscription_status === 'canceled' ? 'Cancelada' :
                                 company.subscription_status}
                              </Badge>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <div>
                                <span className="!text-gray-400">Plano:</span>
                                <p className="font-medium !text-white">{company.stripe_data?.plan_name || company.subscription_plan_data?.name || 'N/A'}</p>
                              </div>
                              <div>
                                <span className="!text-gray-400">Valor:</span>
                                <p className="font-medium !text-white">
                                  {company.stripe_data?.amount 
                                    ? `R$ ${(company.stripe_data.amount / 100).toLocaleString('pt-BR')}`
                                    : company.subscription_plan_data?.price 
                                    ? `R$ ${company.subscription_plan_data.price}`
                                    : 'N/A'
                                  }
                                </p>
                              </div>
                              <div>
                                <span className="!text-gray-400">Colaboradores:</span>
                                <p className="font-medium !text-white">{company.total_collaborators || 0}</p>
                              </div>
                              <div>
                                <span className="!text-gray-400">Vence em:</span>
                                <p className="font-medium !text-white">
                                  {company.days_until_expiry !== null 
                                    ? `${company.days_until_expiry} dias`
                                    : 'N/A'
                                  }
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Alerts and Actions - Layout Melhorado */}
            <div className="grid gap-6 grid-cols-1 lg:grid-cols-12">
              {/* Upcoming Renewals */}
              <div className="lg:col-span-6">
                <Card className="!border !border-yellow-500/30 !bg-gradient-to-br !from-yellow-500/10 !to-gray-800 h-full">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 !text-yellow-300">
                      <Calendar className="h-5 w-5" />
                      Próximos Vencimentos
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm !text-yellow-200 mb-4">
                      Empresas com vencimento nos próximos 7 dias
                    </p>
                    <div className="space-y-3">
                      {filteredData.atRiskCompanies.length > 0 ? (
                        filteredData.atRiskCompanies.slice(0, 5).map((company) => (
                          <div key={company.id} className="flex items-center justify-between p-3 !bg-gray-700 rounded-lg !border !border-yellow-500/30 shadow-sm hover:!shadow-md transition-shadow">
                            <div>
                              <span className="text-sm font-medium !text-white">{company.name}</span>
                              <p className="text-xs !text-gray-300">Vence em {company.days_until_expiry} dias</p>
                            </div>
                            <Badge variant="outline" className="!border-yellow-500/30 !text-yellow-300">
                              {company.days_until_expiry} dias
                            </Badge>
                          </div>
                        ))
                      ) : (
                        <div className="flex items-center justify-between p-3 !bg-gray-700 rounded-lg !border !border-green-500/30 shadow-sm">
                          <div>
                            <span className="text-sm font-medium !text-green-300">Nenhuma empresa em risco</span>
                            <p className="text-xs !text-green-200">Todas as assinaturas estão em dia</p>
                          </div>
                          <Badge className="!bg-green-500/20 !text-green-300 !border-green-500/30">✓</Badge>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Required Actions */}
              <div className="lg:col-span-6">
                <Card className="!border !border-red-500/30 !bg-gradient-to-br !from-red-500/10 !to-gray-800 h-full">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 !text-red-300">
                      <AlertTriangle className="h-5 w-5" />
                      Ações Necessárias
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm !text-red-200 mb-4">
                      Ações recomendadas para manter a saúde financeira
                    </p>
                    <div className="space-y-3">
                      {filteredData.overdueCompanies.length > 0 && (
                        <div className="flex items-center justify-between p-3 !bg-gray-700 rounded-lg !border !border-red-500/30 shadow-sm hover:!shadow-md transition-shadow">
                          <div>
                            <span className="text-sm font-medium !text-red-300">
                              {filteredData.overdueCompanies.length} empresa(s) em atraso
                            </span>
                            <p className="text-xs !text-red-200">Ação urgente necessária</p>
                          </div>
                          <Badge variant="destructive" className="!bg-red-500/20 !text-red-300 !border-red-500/30">Urgente</Badge>
                        </div>
                      )}
                      {filteredData.summary.churnRate > 5 && (
                        <div className="flex items-center justify-between p-3 !bg-gray-700 rounded-lg !border !border-orange-500/30 shadow-sm hover:!shadow-md transition-shadow">
                          <div>
                            <span className="text-sm font-medium !text-orange-300">
                              Taxa de churn alta ({filteredData.summary.churnRate.toFixed(1)}%)
                            </span>
                            <p className="text-xs !text-orange-200">Revisar estratégia de retenção</p>
                          </div>
                          <Badge variant="outline" className="!border-orange-500/30 !text-orange-300">Atenção</Badge>
                        </div>
                      )}
                      {filteredData.overdueCompanies.length === 0 && filteredData.summary.churnRate <= 5 && (
                        <div className="flex items-center justify-between p-3 !bg-gray-700 rounded-lg !border !border-green-500/30 shadow-sm">
                          <div>
                            <span className="text-sm font-medium !text-green-300">Tudo em ordem</span>
                            <p className="text-xs !text-green-200">Nenhuma ação necessária</p>
                          </div>
                          <Badge className="!bg-green-500/20 !text-green-300 !border-green-500/30">✓</Badge>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Status Legend */}
            <Card className="!bg-gradient-to-r !from-gray-800 !to-gray-900 !border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 !text-white">
                  <BarChart3 className="h-5 w-5 !text-gray-400" />
                  Legenda dos Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  <div className="flex items-center gap-3 p-3 !bg-gray-700 rounded-lg !border !border-gray-600">
                    <Badge className="!bg-green-500/20 !text-green-300 !border-green-500/30">Ativa</Badge>
                    <span className="text-sm !text-gray-300">Assinatura em dia</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 !bg-gray-700 rounded-lg !border !border-gray-600">
                    <Badge className="!bg-orange-500/20 !text-orange-300 !border-orange-500/30">Pagamento Pendente</Badge>
                    <span className="text-sm !text-gray-300">Pagamento em atraso</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 !bg-gray-700 rounded-lg !border !border-gray-600">
                    <Badge className="!bg-red-500/20 !text-red-300 !border-red-500/30">Cancelada</Badge>
                    <span className="text-sm !text-gray-300">Assinatura cancelada</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 !bg-gray-700 rounded-lg !border !border-gray-600">
                    <Badge className="!bg-blue-500/20 !text-blue-300 !border-blue-500/30">Período de Teste</Badge>
                    <span className="text-sm !text-gray-300">Em período de teste</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 !bg-gray-700 rounded-lg !border !border-gray-600">
                    <Badge className="!bg-purple-500/20 !text-purple-300 !border-purple-500/30">Cancelamento Programado</Badge>
                    <span className="text-sm !text-gray-300">Será cancelada no final do período</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 !bg-gray-700 rounded-lg !border !border-gray-600">
                    <Badge className="!bg-yellow-500/20 !text-yellow-300 !border-yellow-500/30">Em Risco</Badge>
                    <span className="text-sm !text-gray-300">Vence em ≤ 7 dias</span>
                  </div>
                </div>
                
                <div className="mt-6 p-4 !bg-gradient-to-r !from-blue-500/10 !to-indigo-500/10 rounded-lg !border !border-blue-500/30">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 !bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-white text-xs font-bold">💡</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium !text-blue-300 mb-1">Dados em Tempo Real</p>
                      <p className="text-sm !text-blue-200">
                        Os dados são atualizados automaticamente via Stripe. Use o botão "Atualizar Dados" 
                        para sincronizar as informações mais recentes quando necessário.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && !data && (
          <div className="text-center py-16">
            <div className="max-w-md mx-auto">
              <BarChart3 className="h-16 w-16 !text-gray-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold !text-white mb-2">Nenhum dado disponível</h3>
              <p className="!text-gray-300">Não há empresas cadastradas ainda.</p>
            </div>
          </div>
        )}
      </div>
    </PageLayout>
  );
};

export default ProducerSubscriptionAnalytics; 
