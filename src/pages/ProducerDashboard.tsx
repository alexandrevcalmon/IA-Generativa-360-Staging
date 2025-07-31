import { useState, useEffect } from 'react';
import { useCourses } from "@/hooks/useCourses";
import { useCompanies } from "@/hooks/useCompanies";
import { useCompaniesWithPlans } from "@/hooks/useCompaniesWithPlans";
import { useCompanySubscriptionReports } from "@/hooks/useCompanySubscriptionReports";
import { useCollaboratorAnalytics } from "@/hooks/useCollaboratorAnalytics";
import { PageLayout } from "@/components/PageLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  BookOpen, 
  Building2, 
  Users, 
  BarChart3, 
  Plus, 
  MessageSquare,
  FileText,
  Settings,
  Calendar,
  Activity,
  TrendingUp,
  TrendingDown,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  RefreshCw
} from "lucide-react";
import { Link } from "react-router-dom";

const ProducerDashboard = () => {
  const { data: courses = [], isLoading: coursesLoading } = useCourses();
  const { data: companies = [], isLoading: companiesLoading } = useCompanies();
  const { data: companiesWithPlans = [], isLoading: plansLoading } = useCompaniesWithPlans();
  const { data: analyticsData, isLoading: analyticsLoading, refetch: refetchAnalytics } = useCompanySubscriptionReports();
  const { data: collaboratorAnalytics = [], isLoading: collaboratorsLoading } = useCollaboratorAnalytics();
  
  const [recentActivity, setRecentActivity] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading state
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  // Calculate real statistics from actual data
  const publishedCourses = courses.filter(course => course.is_published);
  const totalCourses = courses.length;
  const totalCompanies = companies.length;
  const activeCompanies = companiesWithPlans.filter(company => company.subscription_status === 'active').length;
  const totalCollaborators = collaboratorAnalytics?.length || 0; // Fallback para 0

  console.log('📊 Dashboard Stats:', {
    totalCourses,
    publishedCourses: publishedCourses.length,
    totalCompanies,
    activeCompanies,
    totalCollaborators,
    collaboratorAnalyticsLength: collaboratorAnalytics?.length || 0,
    collaboratorAnalytics: collaboratorAnalytics,
    collaboratorsLoading,
    userRole: 'producer' // Assumindo que é produtor
  });

  // Header content com botão de criar curso
  const headerContent = (
    <>
      <Badge className="bg-gradient-to-r from-green-500 to-emerald-600 text-white border-0 shadow-lg">
        Status: Ativo
      </Badge>
      <Link to="/producer/courses/new">
        <Button className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white shadow-lg border-0">
          <Plus className="h-4 w-4 mr-2" />
          Criar Novo Curso
        </Button>
      </Link>
    </>
  );

  if (isLoading || coursesLoading || companiesLoading || plansLoading || analyticsLoading || collaboratorsLoading) {
    return (
      <PageLayout
        title="Painel do Produtor"
        subtitle="Carregando dados..."
      >
        <div className="animate-pulse space-y-6">
          <div className="h-24 bg-gray-800 rounded-lg"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="h-64 bg-gray-800 rounded-lg"></div>
            <div className="h-64 bg-gray-800 rounded-lg"></div>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <div className="dark-theme-override" style={{ backgroundColor: '#0f172a', color: '#e2e8f0' }}>
      <PageLayout
        title="Painel do Produtor"
        subtitle="Bem-vindo de volta! Gerencie seus cursos e empresas clientes."
        headerContent={headerContent}
        background="dark"
        className="dark-theme-override"
      >
      <div className="space-y-6">
        {/* Stats Grid */}
        <div className="w-full flex justify-center">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mx-auto">
            <Card className="min-w-[260px] bg-gray-900/50 border-gray-700 shadow-xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-300">Total de Cursos</p>
                    <p className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">{totalCourses}</p>
                  </div>
                  <div className="p-3 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 shadow-lg">
                    <BookOpen className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="min-w-[260px] bg-gray-900/50 border-gray-700 shadow-xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-300">Cursos Publicados</p>
                    <p className="text-2xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">{publishedCourses.length}</p>
                  </div>
                  <div className="p-3 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 shadow-lg">
                    <FileText className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="min-w-[260px] bg-gray-900/50 border-gray-700 shadow-xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-300">Total de Colaboradores</p>
                    <p className="text-2xl font-bold bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">{totalCollaborators}</p>
                  </div>
                  <div className="p-3 rounded-full bg-gradient-to-r from-orange-500 to-red-500 shadow-lg">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - 2/3 width */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-gray-900/50 border-gray-700 shadow-xl">
              <CardHeader>
                <CardTitle className="text-white">Cursos Recentes</CardTitle>
              </CardHeader>
              <CardContent>
                {courses.length > 0 ? (
                  <div className="space-y-4">
                    {courses.slice(0, 5).map((course) => (
                      <div key={course.id} className="flex items-center justify-between border-b border-gray-700 pb-4 last:border-0 last:pb-0">
                        <div>
                          <h3 className="font-medium text-white">{course.title}</h3>
                          <p className="text-sm text-gray-400">{course.description?.substring(0, 100)}...</p>
                        </div>
                        <Badge variant={course.is_published ? "default" : "secondary"} className={course.is_published ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white border-0" : "bg-gray-700 text-gray-300 border-gray-600"}>
                          {course.is_published ? "Publicado" : "Rascunho"}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-400">
                    Nenhum curso encontrado. Crie seu primeiro curso!
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card className="bg-gray-900/50 border-gray-700 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-white">
                  <span>Análise de Desempenho</span>
                  <Button
                    onClick={() => refetchAnalytics()}
                    disabled={analyticsLoading}
                    size="sm"
                    variant="outline"
                    className="border-gray-600 hover:bg-gray-800 text-gray-300 hover:text-white"
                  >
                    <RefreshCw className={`h-4 w-4 mr-2 ${analyticsLoading ? 'animate-spin' : ''}`} />
                    Atualizar
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {analyticsLoading ? (
                  <div className="text-center py-8">
                    <RefreshCw className="h-8 w-8 animate-spin text-orange-500 mx-auto mb-4" />
                    <p className="text-gray-400">Carregando dados de analytics...</p>
                  </div>
                ) : analyticsData ? (
                  <div className="space-y-6">
                    {/* Métricas Principais */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 bg-gradient-to-r from-green-500/20 to-emerald-600/20 rounded-lg border border-green-500/30 backdrop-blur-sm">
                        <div className="flex items-center justify-center mb-2">
                          <CheckCircle className="h-5 w-5 text-green-400" />
                        </div>
                        <div className="text-2xl font-bold text-green-400">{analyticsData.summary.activeSubscriptions}</div>
                        <div className="text-sm text-green-300">Assinaturas Ativas</div>
                      </div>
                      
                      <div className="text-center p-4 bg-gradient-to-r from-orange-500/20 to-red-600/20 rounded-lg border border-orange-500/30 backdrop-blur-sm">
                        <div className="flex items-center justify-center mb-2">
                          <AlertTriangle className="h-5 w-5 text-orange-400" />
                        </div>
                        <div className="text-2xl font-bold text-orange-400">{analyticsData.summary.overdueSubscriptions}</div>
                        <div className="text-sm text-orange-300">Em Atraso</div>
                      </div>
                    </div>

                    {/* Receita */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-500/20 to-pink-600/20 rounded-lg border border-purple-500/30 backdrop-blur-sm">
                        <div className="flex items-center gap-2">
                          <TrendingUp className="h-5 w-5 text-purple-400" />
                          <span className="text-sm font-medium text-purple-300">MRR (Mensal)</span>
                        </div>
                        <span className="text-lg font-bold text-purple-400">
                          R$ {analyticsData.summary.monthlyRecurringRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-indigo-500/20 to-blue-600/20 rounded-lg border border-indigo-500/30 backdrop-blur-sm">
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-5 w-5 text-indigo-400" />
                          <span className="text-sm font-medium text-indigo-300">ARR (Anual)</span>
                        </div>
                        <span className="text-lg font-bold text-indigo-400">
                          R$ {analyticsData.summary.annualRecurringRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
                        </span>
                      </div>
                    </div>

                    {/* Taxa de Churn */}
                    <div className={`flex items-center justify-between p-3 rounded-lg border backdrop-blur-sm ${
                      analyticsData.summary.churnRate > 5 ? 'bg-gradient-to-r from-red-500/20 to-pink-600/20 border-red-500/30' : 
                      analyticsData.summary.churnRate > 2 ? 'bg-gradient-to-r from-orange-500/20 to-red-600/20 border-orange-500/30' : 'bg-gradient-to-r from-green-500/20 to-emerald-600/20 border-green-500/30'
                    }`}>
                      <div className="flex items-center gap-2">
                        <TrendingDown className={`h-5 w-5 ${
                          analyticsData.summary.churnRate > 5 ? 'text-red-400' : 
                          analyticsData.summary.churnRate > 2 ? 'text-orange-400' : 'text-green-400'
                        }`} />
                        <span className="text-sm font-medium text-gray-300">Taxa de Churn</span>
                      </div>
                      <div className="text-right">
                        <div className={`text-lg font-bold ${
                          analyticsData.summary.churnRate > 5 ? 'text-red-400' : 
                          analyticsData.summary.churnRate > 2 ? 'text-orange-400' : 'text-green-400'
                        }`}>
                          {analyticsData.summary.churnRate.toFixed(1)}%
                        </div>
                        <div className="text-xs text-gray-400">Mensal</div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-400">
                    Nenhum dado de analytics disponível.
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - 1/3 width */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card className="bg-gray-900/50 border-gray-700 shadow-xl">
              <CardHeader>
                <CardTitle className="text-white">Ações Rápidas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-3">
                  <Link to="/producer/companies/new" className="w-full h-full">
                    <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-blue-500/20 to-cyan-600/20 rounded-lg border border-blue-500/30 backdrop-blur-sm hover:from-blue-500/30 hover:to-cyan-600/30 transition-all duration-200 min-h-[100px] overflow-hidden">
                      <div className="flex-shrink-0 p-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg">
                        <Building2 className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="px-2">
                          <h3 className="font-medium text-white break-words">Nova Empresa</h3>
                          <p className="text-sm text-gray-300 truncate">Adicionar nova empresa cliente</p>
                        </div>
                      </div>
                    </div>
                  </Link>
                  
                  <Link to="/producer/courses/new" className="w-full h-full">
                    <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-green-500/20 to-emerald-600/20 rounded-lg border border-green-500/30 backdrop-blur-sm hover:from-green-500/30 hover:to-emerald-600/30 transition-all duration-200 min-h-[100px] overflow-hidden">
                      <div className="flex-shrink-0 p-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg">
                        <Plus className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="px-2">
                          <h3 className="font-medium text-white break-words">Novo Curso</h3>
                          <p className="text-sm text-gray-300 truncate">Criar novo curso</p>
                        </div>
                      </div>
                    </div>
                  </Link>
                  
                  <Link to="/producer/mentorship" className="w-full h-full">
                    <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-purple-500/20 to-pink-600/20 rounded-lg border border-purple-500/30 backdrop-blur-sm hover:from-purple-500/30 hover:to-pink-600/30 transition-all duration-200 min-h-[100px] overflow-hidden">
                      <div className="flex-shrink-0 p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
                        <MessageSquare className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="px-2">
                          <h3 className="font-medium text-white break-words">Mentorias</h3>
                          <p className="text-sm text-gray-300 truncate">Gerenciar mentorias</p>
                        </div>
                      </div>
                    </div>
                  </Link>
                  
                  <Link to="/producer/analytics" className="w-full h-full">
                    <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-orange-500/20 to-red-600/20 rounded-lg border border-orange-500/30 backdrop-blur-sm hover:from-orange-500/30 hover:to-red-600/30 transition-all duration-200 min-h-[100px] overflow-hidden">
                      <div className="flex-shrink-0 p-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg">
                        <BarChart3 className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="px-2">
                          <h3 className="font-medium text-white break-words">Analytics</h3>
                          <p className="text-sm text-gray-300 truncate">Ver relatórios detalhados</p>
                        </div>
                      </div>
                    </div>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="bg-gray-900/50 border-gray-700 shadow-xl">
              <CardHeader>
                <CardTitle className="text-white">Atividade Recente</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full">
                      <Activity className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-white">Novo curso criado</p>
                      <p className="text-xs text-gray-400">Há 2 horas</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full">
                      <Users className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-white">Nova empresa adicionada</p>
                      <p className="text-xs text-gray-400">Há 1 dia</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full">
                      <MessageSquare className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-white">Mentoria agendada</p>
                      <p className="text-xs text-gray-400">Há 2 dias</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      </PageLayout>
    </div>
  );
};

export default ProducerDashboard;
