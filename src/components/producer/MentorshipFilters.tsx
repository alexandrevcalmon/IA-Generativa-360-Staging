import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Filter, Globe, Building2, CalendarDays } from "lucide-react";
import { format, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, subDays, addDays } from "date-fns";
import { ptBR } from "date-fns/locale";

export type MentorshipType = 'all' | 'collective' | 'exclusive';
export type PeriodType = 'all' | 'day' | 'week' | 'month' | 'custom' | 'future';

interface MentorshipFiltersProps {
  typeFilter: MentorshipType;
  onTypeFilterChange: (type: MentorshipType) => void;
  periodFilter: PeriodType;
  onPeriodFilterChange: (period: PeriodType) => void;
  customDateRange: { from: Date | undefined; to: Date | undefined };
  onCustomDateRangeChange: (range: { from: Date | undefined; to: Date | undefined }) => void;
}

export const MentorshipFilters = ({
  typeFilter,
  onTypeFilterChange,
  periodFilter,
  onPeriodFilterChange,
  customDateRange,
  onCustomDateRangeChange
}: MentorshipFiltersProps) => {
  const [showCustomDatePicker, setShowCustomDatePicker] = useState(false);

  // Função para obter a data atual no horário de Brasília
  const getCurrentDateInBrasilia = () => {
    const now = new Date();
    // Para simplificar, vamos usar a data atual do sistema
    // O usuário pode ajustar manualmente se necessário
    return now;
  };

  const getTypeFilterLabel = (type: MentorshipType) => {
    switch (type) {
      case 'all': return 'Todas';
      case 'collective': return 'Coletivas';
      case 'exclusive': return 'Exclusivas';
      default: return 'Todas';
    }
  };

  const getPeriodFilterLabel = (period: PeriodType) => {
    switch (period) {
      case 'all': return 'Todas';
      case 'day': return 'Hoje';
      case 'week': return 'Esta Semana (futuras)';
      case 'month': return 'Este Mês (futuras)';
      case 'custom': return 'Período Personalizado';
      case 'future': return 'Todas Futuras';
      default: return 'Todas';
    }
  };

  const handleQuickDateSelect = (days: number) => {
    const todayBrasilia = getCurrentDateInBrasilia();
    const from = todayBrasilia; // Começa hoje
    const to = addDays(todayBrasilia, days); // Vai até X dias no futuro
    onCustomDateRangeChange({ from, to });
    onPeriodFilterChange('custom');
  };

  return (
    <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/30 shadow-2xl rounded-xl p-6 mb-6">
      <div className="flex items-center gap-2 mb-4">
        <Filter className="h-5 w-5 text-orange-400" />
        <h3 className="text-lg font-semibold text-white">Filtros</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Filtro por Tipo */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-300">Tipo de Mentoria</label>
          <Select value={typeFilter} onValueChange={(value: MentorshipType) => onTypeFilterChange(value)}>
            <SelectTrigger className="!bg-gray-700 !border-gray-600 !text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="!bg-gray-700 !border-gray-600">
              <SelectItem value="all" className="!text-white hover:!bg-gray-600">
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  Todas as Mentorias
                </div>
              </SelectItem>
              <SelectItem value="collective" className="!text-white hover:!bg-gray-600">
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-purple-400" />
                  Apenas Coletivas
                </div>
              </SelectItem>
              <SelectItem value="exclusive" className="!text-white hover:!bg-gray-600">
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-orange-400" />
                  Apenas Exclusivas
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Filtro por Período */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-300">Período</label>
          <Select value={periodFilter} onValueChange={(value: PeriodType) => {
            onPeriodFilterChange(value);
            // Se selecionar período personalizado, definir data de início como hoje
            if (value === 'custom' && !customDateRange.from) {
              const todayBrasilia = getCurrentDateInBrasilia();
              onCustomDateRangeChange({ from: todayBrasilia, to: customDateRange.to });
            }
          }}>
            <SelectTrigger className="!bg-gray-700 !border-gray-600 !text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="!bg-gray-700 !border-gray-600">
              <SelectItem value="all" className="!text-white hover:!bg-gray-600">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Todas as Mentorias
                </div>
              </SelectItem>
              <SelectItem value="future" className="!text-white hover:!bg-gray-600">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Todas Futuras
                </div>
              </SelectItem>
              <SelectItem value="day" className="!text-white hover:!bg-gray-600">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Hoje
                </div>
              </SelectItem>
              <SelectItem value="week" className="!text-white hover:!bg-gray-600">
                <div className="flex items-center gap-2">
                  <CalendarDays className="h-4 w-4" />
                  Esta Semana (futuras)
                </div>
              </SelectItem>
              <SelectItem value="month" className="!text-white hover:!bg-gray-600">
                <div className="flex items-center gap-2">
                  <CalendarDays className="h-4 w-4" />
                  Este Mês (futuras)
                </div>
              </SelectItem>
              <SelectItem value="custom" className="!text-white hover:!bg-gray-600">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Período Personalizado
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Seletores Rápidos de Data */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-300">Períodos Rápidos</label>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleQuickDateSelect(0)}
              className="!bg-gray-700 !border-gray-600 !text-white hover:!bg-gray-600"
            >
              Hoje
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleQuickDateSelect(7)}
              className="!bg-gray-700 !border-gray-600 !text-white hover:!bg-gray-600"
            >
              Próximos 7 dias
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleQuickDateSelect(30)}
              className="!bg-gray-700 !border-gray-600 !text-white hover:!bg-gray-600"
            >
              Próximos 30 dias
            </Button>
          </div>
        </div>

        {/* Período Personalizado */}
        {periodFilter === 'custom' && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Período Personalizado</label>
            <div className="space-y-2">
              <input
                type="date"
                value={customDateRange.from ? format(customDateRange.from, 'yyyy-MM-dd') : ''}
                onChange={(e) => {
                  const date = e.target.value ? new Date(e.target.value) : undefined;
                  onCustomDateRangeChange({ ...customDateRange, from: date });
                }}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              <input
                type="date"
                value={customDateRange.to ? format(customDateRange.to, 'yyyy-MM-dd') : ''}
                onChange={(e) => {
                  const date = e.target.value ? new Date(e.target.value) : undefined;
                  onCustomDateRangeChange({ ...customDateRange, to: date });
                }}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>
        )}
      </div>

      {/* Badges de Filtros Ativos */}
      <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-700">
        <Badge className="bg-orange-900/20 border border-orange-500/30 text-orange-400">
          {getTypeFilterLabel(typeFilter)}
        </Badge>
        <Badge className="bg-blue-900/20 border border-blue-500/30 text-blue-400">
          {getPeriodFilterLabel(periodFilter)}
        </Badge>
        {periodFilter === 'custom' && customDateRange.from && customDateRange.to && (
          <Badge className="bg-purple-900/20 border border-purple-500/30 text-purple-400">
            {format(customDateRange.from, 'dd/MM/yyyy', { locale: ptBR })} - {format(customDateRange.to, 'dd/MM/yyyy', { locale: ptBR })}
          </Badge>
        )}
      </div>
    </div>
  );
}; 
