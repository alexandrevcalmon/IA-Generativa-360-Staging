import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Users, 
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react';

interface StripeMetricsSummaryProps {
  summary: {
    totalCompanies: number;
    activeSubscriptions: number;
    overdueSubscriptions: number;
    canceledSubscriptions: number;
    monthlyRecurringRevenue: number;
    annualRecurringRevenue: number;
    churnRate: number;
  };
}

export function StripeMetricsSummary({ summary }: StripeMetricsSummaryProps) {
  const getChurnStatus = () => {
    if (summary.churnRate > 5) return { color: 'text-red-600', bg: 'bg-red-100', icon: TrendingDown };
    if (summary.churnRate > 2) return { color: 'text-orange-600', bg: 'bg-orange-100', icon: AlertTriangle };
    return { color: 'text-green-600', bg: 'bg-green-100', icon: CheckCircle };
  };

  const churnStatus = getChurnStatus();
  const ChurnIcon = churnStatus.icon;

  return (
    <Card>
      <CardHeader className="px-3 sm:px-6 py-3 sm:py-6">
        <CardTitle className="flex items-center gap-2 text-sm sm:text-base lg:text-lg">
          <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
          Métricas do Stripe
        </CardTitle>
        <CardDescription className="text-xs sm:text-sm">
          Dados em tempo real das assinaturas
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 sm:space-y-4 px-3 sm:px-6 pb-3 sm:pb-6">
        {/* Status Geral */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          <div className="text-center p-2 sm:p-3 bg-blue-50 rounded-lg">
            <div className="text-lg sm:text-xl lg:text-2xl font-bold text-blue-600">{summary.activeSubscriptions}</div>
            <div className="text-xs sm:text-sm text-blue-600">Ativas</div>
          </div>
          <div className="text-center p-2 sm:p-3 bg-orange-50 rounded-lg">
            <div className="text-lg sm:text-xl lg:text-2xl font-bold text-orange-600">{summary.overdueSubscriptions}</div>
            <div className="text-xs sm:text-sm text-orange-600">Em Atraso</div>
          </div>
        </div>

        {/* Receita */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm font-medium">MRR (Mensal)</span>
            <span className="text-sm sm:text-base lg:text-lg font-bold text-green-600">
              R$ {summary.monthlyRecurringRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm font-medium">ARR (Anual)</span>
            <span className="text-sm sm:text-base lg:text-lg font-bold text-blue-600">
              R$ {summary.annualRecurringRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {/* Taxa de Churn */}
        <div className="flex items-center justify-between p-2 sm:p-3 rounded-lg border">
          <div className="flex items-center gap-2">
            <ChurnIcon className={`h-4 w-4 sm:h-5 sm:w-5 ${churnStatus.color}`} />
            <span className="text-xs sm:text-sm font-medium">Taxa de Churn</span>
          </div>
          <div className="text-right">
            <div className={`text-sm sm:text-base lg:text-lg font-bold ${churnStatus.color}`}>
              {summary.churnRate.toFixed(1)}%
            </div>
            <div className="text-xs text-gray-500">
              {summary.canceledSubscriptions} cancelamentos
            </div>
          </div>
        </div>

        {/* Indicadores de Qualidade */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs sm:text-sm">
            <span>Taxa de Ativação</span>
            <Badge variant={summary.activeSubscriptions / summary.totalCompanies > 0.8 ? 'default' : 'secondary'} className="text-xs">
              {((summary.activeSubscriptions / summary.totalCompanies) * 100).toFixed(1)}%
            </Badge>
          </div>
          <div className="flex items-center justify-between text-xs sm:text-sm">
            <span>Empresas em Risco</span>
            <Badge variant="outline" className="text-xs">
              {summary.totalCompanies - summary.activeSubscriptions - summary.canceledSubscriptions}
            </Badge>
          </div>
        </div>

        {/* Última Atualização */}
        <div className="text-xs text-gray-500 flex items-center gap-1">
          <Clock className="h-3 w-3" />
          Atualizado em tempo real via Stripe
        </div>
      </CardContent>
    </Card>
  );
} 
