import { PageLayout } from "@/components/PageLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useCompanyData } from "@/hooks/useCompanyData";
import { useCompanyCourses } from "@/hooks/useCompanyCourses";
import { useCompanyMentorships } from "@/hooks/useCompanyMentorships";
import { useSubscription } from '@/hooks/useSubscription';
import { useCollaboratorAnalytics } from '@/hooks/useCollaboratorAnalytics';
import { BlockedCollaboratorsCard } from '@/components/BlockedCollaboratorsCard';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { 
  Users, 
  BookOpen, 
  Calendar as CalendarIcon,
  GraduationCap
} from "lucide-react";
import { useState, useMemo } from 'react';
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

const CompanyDashboard = () => {
  const { data: companyData, isLoading: companyLoading } = useCompanyData();
  const { data: courses = [], isLoading: coursesLoading } = useCompanyCourses();
  const { data: mentorships = [], isLoading: mentorshipsLoading } = useCompanyMentorships();
  const subscription = useSubscription();
  const { data: collaboratorAnalytics = [], isLoading: analyticsLoading } = useCollaboratorAnalytics();

  // Estado para controlar o período do gráfico
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'all' | 'custom'>('all');
  const [customDateRange, setCustomDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: undefined,
    to: undefined,
  });

  const isLoading = companyLoading || coursesLoading || mentorshipsLoading;

  // Calculate stats
  const totalEnrollments = courses.reduce((sum, course) => sum + course.enrolled_students, 0);
  const totalCompletions = courses.reduce((sum, course) => sum + course.completed_students, 0);
  const completionRate = totalEnrollments > 0 ? Math.round((totalCompletions / totalEnrollments) * 100) : 0;
  const upcomingMentorships = mentorships.filter(m => m.status === 'scheduled').length;

  // Função para filtrar dados por período
  const getFilteredData = useMemo(() => {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    let filteredCollaborators = collaboratorAnalytics;

    if (selectedPeriod === 'week') {
      filteredCollaborators = collaboratorAnalytics.filter(c => 
        new Date(c.collaborator.created_at || c.updated_at) >= weekAgo
      );
    } else if (selectedPeriod === 'month') {
      filteredCollaborators = collaboratorAnalytics.filter(c => 
        new Date(c.collaborator.created_at || c.updated_at) >= monthAgo
      );
    } else if (selectedPeriod === 'custom' && customDateRange.from && customDateRange.to) {
      filteredCollaborators = collaboratorAnalytics.filter(c => {
        const collaboratorDate = new Date(c.collaborator.created_at || c.updated_at);
        return collaboratorDate >= customDateRange.from! && collaboratorDate <= customDateRange.to!;
      });
    }

    return {
      collaborators: filteredCollaborators,
      evolutionData: filteredCollaborators
        .map(c => ({
          date: new Date(c.collaborator.created_at || c.updated_at).toLocaleDateString('pt-BR'),
          count: 1,
          name: c.collaborator.name
        }))
        .reduce((acc, curr) => {
          const found = acc.find(a => a.date === curr.date);
          if (found) {
            found.count += 1;
            found.names = found.names || [found.name];
            found.names.push(curr.name);
          } else {
            acc.push({ ...curr, names: [curr.name] });
          }
          return acc;
        }, [])
        .sort((a, b) => new Date(a.date.split('/').reverse().join('-')) - new Date(b.date.split('/').reverse().join('-'))),
      topActive: [...filteredCollaborators]
        .sort((a, b) => b.total_watch_time_minutes - a.total_watch_time_minutes)
        .slice(0, 5),
      lastRegistered: [...filteredCollaborators]
        .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
        .slice(0, 5),
      avgProgress: filteredCollaborators.length > 0
        ? Math.round(filteredCollaborators.reduce((sum, c) => sum + (c.lessons_completed || 0), 0) / filteredCollaborators.length)
        : 0
    };
  }, [collaboratorAnalytics, selectedPeriod, customDateRange]);

  // Top 5 colaboradores mais ativos
  const topActive = [...collaboratorAnalytics]
    .sort((a, b) => b.total_watch_time_minutes - a.total_watch_time_minutes)
    .slice(0, 5);

  // Últimos colaboradores cadastrados
  const lastRegistered = [...collaboratorAnalytics]
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
    .slice(0, 5);

  // Progresso médio
  const avgProgress = collaboratorAnalytics.length > 0
    ? Math.round(collaboratorAnalytics.reduce((sum, c) => sum + (c.lessons_completed || 0), 0) / collaboratorAnalytics.length)
    : 0;

  // Header content com badge de status
  const headerContent = companyData && (
    <Badge className={`${companyData.is_active ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white border-0" : "bg-gray-700 text-gray-300 border-gray-600"}`}>
      {companyData.is_active ? "Ativo" : "Inativo"}
    </Badge>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
        <div className="p-6">
          <div className="animate-pulse space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {[1,2,3,4].map((i) => (
                <div key={i} className="h-24 bg-gray-800/50 backdrop-blur-sm rounded-xl shadow-lg border border-gray-700/30"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      {/* Header */}
      <header className="border-slate-700/50 py-10 bg-slate-950/90 backdrop-blur-xl shadow-2xl border-slate-700/50">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center space-x-4">
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600 bg-clip-text text-transparent">
                  Dashboard
                </h1>
                <p className="text-slate-300 text-lg leading-relaxed mt-1">
                  Bem-vindo, {companyData?.name || 'Empresa'}
                </p>
              </div>
            </div>
            {headerContent && (
              <div className="flex items-center gap-2 ml-12">
                {headerContent}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-auto p-4 md:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-fade-in space-y-6">
            {/* Filtro Global de Período */}
            <Card className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/30 shadow-2xl">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-1">Filtro de Período</h3>
                    <p className="text-sm text-gray-400">Selecione o período para visualizar os dados</p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant={selectedPeriod === 'week' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedPeriod('week')}
                      className={`px-4 py-2 ${
                        selectedPeriod === 'week' 
                          ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                          : 'bg-gray-700/50 hover:bg-gray-600/50 text-gray-300 border-gray-600'
                      }`}
                    >
                      Última Semana
                    </Button>
                    <Button
                      variant={selectedPeriod === 'month' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedPeriod('month')}
                      className={`px-4 py-2 ${
                        selectedPeriod === 'month' 
                          ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                          : 'bg-gray-700/50 hover:bg-gray-600/50 text-gray-300 border-gray-600'
                      }`}
                    >
                      Último Mês
                    </Button>
                    <Button
                      variant={selectedPeriod === 'custom' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedPeriod('custom')}
                      className={`px-4 py-2 ${
                        selectedPeriod === 'custom' 
                          ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                          : 'bg-gray-700/50 hover:bg-gray-600/50 text-gray-300 border-gray-600'
                      }`}
                    >
                      Período Personalizado
                    </Button>
                    <Button
                      variant={selectedPeriod === 'all' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedPeriod('all')}
                      className={`px-4 py-2 ${
                        selectedPeriod === 'all' 
                          ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                          : 'bg-gray-700/50 hover:bg-gray-600/50 text-gray-300 border-gray-600'
                      }`}
                    >
                      Todos os Períodos
                    </Button>
                  </div>
                </div>
                
                {/* Seletor de Datas Personalizado */}
                {selectedPeriod === 'custom' && (
                  <div className="mt-4 pt-4 border-t border-gray-700">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-300">De:</span>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-[200px] justify-start text-left font-normal bg-gray-700/50 border-gray-600 text-gray-300 hover:bg-gray-600/50",
                                !customDateRange.from && "text-gray-400"
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {customDateRange.from ? (
                                format(customDateRange.from, "dd/MM/yyyy", { locale: ptBR })
                              ) : (
                                <span>Selecione uma data</span>
                              )}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0 bg-gray-800 border-gray-700">
                            <Calendar
                              mode="single"
                              selected={customDateRange.from}
                              onSelect={(date) => setCustomDateRange(prev => ({ ...prev, from: date }))}
                              initialFocus
                              className="bg-gray-800 text-white"
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-300">Até:</span>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-[200px] justify-start text-left font-normal bg-gray-700/50 border-gray-600 text-gray-300 hover:bg-gray-600/50",
                                !customDateRange.to && "text-gray-400"
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {customDateRange.to ? (
                                format(customDateRange.to, "dd/MM/yyyy", { locale: ptBR })
                              ) : (
                                <span>Selecione uma data</span>
                              )}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0 bg-gray-800 border-gray-700">
                            <Calendar
                              mode="single"
                              selected={customDateRange.to}
                              onSelect={(date) => setCustomDateRange(prev => ({ ...prev, to: date }))}
                              initialFocus
                              className="bg-gray-800 text-white"
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                      
                      <Button
                        size="sm"
                        onClick={() => {
                          if (customDateRange.from && customDateRange.to) {
                            // Aplicar filtro personalizado
                          }
                        }}
                        disabled={!customDateRange.from || !customDateRange.to}
                        className="bg-blue-600 hover:bg-blue-700 text-white disabled:bg-gray-600 disabled:text-gray-400"
                      >
                        Aplicar Filtro
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setCustomDateRange({ from: undefined, to: undefined });
                          setSelectedPeriod('all');
                        }}
                        className="bg-gray-700/50 hover:bg-gray-600/50 text-gray-300 border-gray-600"
                      >
                        Limpar
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Stats Grid */}
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-5">
              <Card className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/30 shadow-2xl hover:shadow-blue-500/10 transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-300">Cursos Disponíveis</p>
                      <p className="text-2xl font-bold text-white">{courses.length}</p>
                    </div>
                    <div className="p-3 rounded-full bg-gradient-to-br from-blue-500 to-cyan-600 shadow-lg">
                      <BookOpen className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/30 shadow-2xl hover:shadow-emerald-500/10 transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-300">Total de Matrículas</p>
                      <p className="text-2xl font-bold text-white">{totalEnrollments}</p>
                    </div>
                    <div className="p-3 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg">
                      <Users className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/30 shadow-2xl hover:shadow-purple-500/10 transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-300">Taxa de Conclusão</p>
                      <p className="text-2xl font-bold text-white">{completionRate}%</p>
                    </div>
                    <div className="p-3 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 shadow-lg">
                      <GraduationCap className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/30 shadow-2xl hover:shadow-orange-500/10 transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-300">Mentorias Agendadas</p>
                      <p className="text-2xl font-bold text-white">{upcomingMentorships}</p>
                    </div>
                    <div className="p-3 rounded-full bg-gradient-to-br from-orange-500 to-red-600 shadow-lg">
                      <CalendarIcon className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/30 shadow-2xl hover:shadow-cyan-500/10 transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-300">Progresso Médio</p>
                      <p className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent">{getFilteredData.avgProgress}</p>
                      <p className="text-xs text-gray-400">lições completas</p>
                    </div>
                    <div className="p-3 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 shadow-lg">
                      <GraduationCap className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Gráficos Analíticos */}
            <div className="grid gap-6 md:grid-cols-2">
              {/* Evolução de Novos Colaboradores */}
              <Card className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/30 shadow-2xl">
                <CardHeader>
                  <CardTitle className="text-white">Evolução de Novos Colaboradores</CardTitle>
                </CardHeader>
                <CardContent style={{ height: 350 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={getFilteredData.evolutionData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis 
                        dataKey="date" 
                        stroke="#9CA3AF" 
                        tick={{ fontSize: 12 }}
                        angle={-45}
                        textAnchor="end"
                        height={60}
                      />
                      <YAxis 
                        allowDecimals={false} 
                        stroke="#9CA3AF"
                        tick={{ fontSize: 12 }}
                        label={{ 
                          value: 'Colaboradores Cadastrados', 
                          angle: -90, 
                          position: 'insideLeft',
                          style: { textAnchor: 'middle', fill: '#9CA3AF' }
                        }}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#1F2937', 
                          border: '1px solid #374151',
                          borderRadius: '8px',
                          color: '#F9FAFB',
                          padding: '8px 12px'
                        }}
                        formatter={(value, name, props) => {
                          const data = props.payload;
                          const names = data.names || [];
                          if (names.length === 1) {
                            return [names[0], ''];
                          } else if (names.length > 1) {
                            return [names.join(', '), ''];
                          }
                          return [`${value} colaborador${value > 1 ? 'es' : ''}`, ''];
                        }}
                        labelFormatter={(label) => `📅 ${label}`}
                      />
                      <Line type="monotone" dataKey="count" stroke="#3B82F6" strokeWidth={3} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Top 5 Colaboradores Mais Ativos - NOVO */}
              <Card className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/30 shadow-2xl">
                <CardHeader>
                  <CardTitle className="text-white">Top 5 Colaboradores Mais Ativos</CardTitle>
                </CardHeader>
                <CardContent style={{ height: 350 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart 
                      data={getFilteredData.topActive.slice(0, 5).map(c => ({
                        name: c.collaborator.name,
                        minutos: c.total_watch_time_minutes || 0
                      }))}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis 
                        dataKey="name" 
                        stroke="#9CA3AF"
                        tick={{ fontSize: 11 }}
                        angle={-45}
                        textAnchor="end"
                        height={80}
                      />
                      <YAxis 
                        stroke="#9CA3AF"
                        tick={{ fontSize: 12 }}
                        label={{ 
                          value: 'Minutos de Visualização', 
                          angle: -90, 
                          position: 'insideLeft',
                          style: { textAnchor: 'middle', fill: '#9CA3AF' }
                        }}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#1F2937', 
                          border: '1px solid #374151',
                          borderRadius: '8px',
                          color: '#F9FAFB'
                        }}
                        formatter={(value, name) => [
                          `${value} minutos`,
                          'Tempo de Visualização'
                        ]}
                        labelFormatter={(label) => `👤 ${label}`}
                      />
                      <Bar 
                        dataKey="minutos" 
                        fill="#10B981"
                        radius={[4, 4, 0, 0]}
                        stroke="#059669"
                        strokeWidth={1}
                        barSize={15}
                        isAnimationActive={false}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Últimos Colaboradores Cadastrados */}
            <Card className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/30 shadow-2xl">
              <CardHeader>
                <CardTitle className="text-white">Últimos Colaboradores Cadastrados</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="divide-y divide-gray-700">
                  {getFilteredData.lastRegistered.map(c => (
                    <li key={c.collaborator.id} className="py-3 flex justify-between items-center">
                      <span className="text-gray-200">{c.collaborator.name}</span>
                      <span className="text-xs text-gray-400">{new Date(c.updated_at).toLocaleDateString('pt-BR')}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Informações do Plano */}
            <Card className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/30 shadow-2xl">
              <CardHeader>
                <CardTitle className="text-white">Informações do Plano</CardTitle>
                <CardDescription className="text-gray-400">Plano atual da empresa</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-4">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-300">Plano Atual</p>
                    <p className="text-lg font-semibold capitalize text-white">
                      {companyData?.subscription_plan_data?.name || 'N/A'}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-300">Preço</p>
                    <p className="text-lg font-semibold text-white">
                      {companyData?.subscription_plan_data?.price !== undefined ? `R$ ${companyData.subscription_plan_data.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : 'N/A'}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-300">Limite de Colaboradores</p>
                    <p className="text-lg font-semibold text-white">
                      {companyData?.subscription_plan_data?.max_students ?? 'N/A'}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-300">Colaboradores</p>
                    <p className="text-lg font-semibold text-white">
                      {subscription.currentCollaborators} / {subscription.maxCollaborators}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-300">Status</p>
                    <Badge className={`${subscription.isActive ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white border-0" : "bg-gray-700 text-gray-300 border-gray-600"}`}>
                      {subscription.subscriptionStatus}
                    </Badge>
                    {subscription.subscriptionEndsAt && (
                      <p className="text-xs text-gray-400 mt-1">Vence em: {new Date(subscription.subscriptionEndsAt).toLocaleDateString('pt-BR')}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Status dos Colaboradores */}
            <BlockedCollaboratorsCard />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyDashboard;
