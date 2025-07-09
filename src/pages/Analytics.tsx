
import { AppSidebar } from "@/components/AppSidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { useCourses } from "@/hooks/useCourses";
import {
  BarChart3,
  TrendingUp,
  Users,
  Clock,
  Award,
  Target,
  Calendar,
  Download,
  Filter,
  RefreshCw,
  Trophy,
  BookOpen
} from "lucide-react";

const Analytics = () => {
  const { user, userRole } = useAuth();
  const { data: courses = [], isLoading } = useCourses();

  // Calculate real statistics from actual data
  const publishedCourses = courses.filter(course => course.is_published);
  const totalCourses = courses.length;

  // Real KPIs for producers
  const kpis = userRole === 'producer' ? [
    {
      title: "Cursos Criados",
      value: totalCourses.toString(),
      change: publishedCourses.length > 0 ? `${publishedCourses.length} publicados` : "Nenhum publicado",
      trend: publishedCourses.length > 0 ? "up" : "neutral",
      period: "Total"
    },
    {
      title: "Empresas Ativas",
      value: "0",
      change: "Em breve",
      trend: "neutral",
      period: "Aguardando implementação"
    },
    {
      title: "Colaboradores Ativos",
      value: "0",
      change: "Em breve",
      trend: "neutral",
      period: "Aguardando implementação"
    },
    {
      title: "Taxa de Conclusão",
      value: "-%",
      change: "Sem dados",
      trend: "neutral",
      period: "Aguardando dados"
    }
  ] : [
    // Student KPIs would go here when we have enrollment data
    {
      title: "Cursos Matriculados",
      value: "0",
      change: "Sem matrículas",
      trend: "neutral",
      period: "Aguardando implementação"
    },
    {
      title: "Horas de Estudo",
      value: "0h",
      change: "Sem dados",
      trend: "neutral",
      period: "Aguardando implementação"
    },
    {
      title: "Cursos Concluídos",
      value: "0",
      change: "Sem conclusões",
      trend: "neutral",
      period: "Aguardando implementação"
    },
    {
      title: "Certificados",
      value: "0",
      change: "Sem certificados",
      trend: "neutral",
      period: "Aguardando implementação"
    }
  ];

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <main className="flex-1 overflow-auto">
          <div className="flex flex-col h-full">
            {/* Header */}
            <header className="border-b bg-white px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <SidebarTrigger />
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
                    <p className="text-gray-600">
                      {userRole === 'producer' 
                        ? "Acompanhe o desempenho dos seus cursos e da plataforma"
                        : "Acompanhe seu progresso e desempenho nos estudos"
                      }
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Button variant="outline" size="sm" disabled>
                    <Filter className="h-4 w-4 mr-2" />
                    Filtrar
                  </Button>
                  <Button variant="outline" size="sm" disabled>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Atualizar
                  </Button>
                  <Button className="ai-gradient text-white" size="sm" disabled>
                    <Download className="h-4 w-4 mr-2" />
                    Exportar
                  </Button>
                </div>
              </div>
            </header>

            {/* Main Content */}
            <div className="flex-1 overflow-auto p-6 bg-gray-50">
              <div className="max-w-7xl mx-auto space-y-6">
                {/* KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {kpis.map((kpi, index) => (
                    <Card key={index} className="hover-lift">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-600">
                              {kpi.title}
                            </p>
                            <p className="text-2xl font-bold text-gray-900 mt-1">
                              {kpi.value}
                            </p>
                          </div>
                          <div className={`p-2 rounded-full ${
                            kpi.trend === 'up' ? 'bg-green-100' : 
                            kpi.trend === 'down' ? 'bg-red-100' : 'bg-gray-100'
                          }`}>
                            {kpi.trend === 'up' ? (
                              <TrendingUp className="h-4 w-4 text-green-600" />
                            ) : (
                              <BarChart3 className="h-4 w-4 text-gray-600" />
                            )}
                          </div>
                        </div>
                        <div className="mt-4 flex items-center justify-between">
                          <Badge variant={kpi.trend === 'up' ? 'default' : 'secondary'} className="text-xs">
                            {kpi.change}
                          </Badge>
                          <p className="text-xs text-gray-500">
                            {kpi.period}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Analytics Tabs */}
                <Tabs defaultValue="overview" className="space-y-6">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="overview">Visão Geral</TabsTrigger>
                    <TabsTrigger value="courses">
                      {userRole === 'producer' ? 'Cursos Criados' : 'Meus Cursos'}
                    </TabsTrigger>
                    <TabsTrigger value="insights">Insights</TabsTrigger>
                  </TabsList>

                  <TabsContent value="overview" className="space-y-6">
                    <div className="grid lg:grid-cols-3 gap-6">
                      {/* Overview Chart */}
                      <Card className="lg:col-span-2">
                        <CardHeader>
                          <CardTitle className="flex items-center">
                            <BarChart3 className="h-5 w-5 mr-2 text-blue-600" />
                            {userRole === 'producer' ? 'Visão Geral da Plataforma' : 'Meu Progresso'}
                          </CardTitle>
                          <CardDescription>
                            {userRole === 'producer' 
                              ? 'Dados sobre cursos e engajamento na plataforma'
                              : 'Seu progresso de aprendizagem'
                            }
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="text-center py-8">
                            <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                              Dados em Desenvolvimento
                            </h3>
                            <p className="text-gray-600">
                              {userRole === 'producer' 
                                ? 'Os analytics detalhados estarão disponíveis quando houver mais atividade na plataforma.'
                                : 'Seus dados de progresso aparecerão aqui conforme você avança nos cursos.'
                              }
                            </p>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Quick Stats */}
                      <Card>
                        <CardHeader>
                          <CardTitle>Estatísticas Rápidas</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          {userRole === 'producer' ? (
                            <>
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">Total de Cursos</span>
                                <span className="font-semibold">{totalCourses}</span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">Cursos Publicados</span>
                                <span className="font-semibold">{publishedCourses.length}</span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">Empresas Cadastradas</span>
                                <span className="font-semibold">0</span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">Colaboradores Ativos</span>
                                <span className="font-semibold">0</span>
                              </div>
                            </>
                          ) : (
                            <>
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">Cursos Disponíveis</span>
                                <span className="font-semibold">{publishedCourses.length}</span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">Matrículas</span>
                                <span className="font-semibold">0</span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">Horas Estudadas</span>
                                <span className="font-semibold">0h</span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">Certificados</span>
                                <span className="font-semibold">0</span>
                              </div>
                            </>
                          )}
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>

                  <TabsContent value="courses" className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>
                          {userRole === 'producer' ? 'Meus Cursos' : 'Progresso dos Cursos'}
                        </CardTitle>
                        <CardDescription>
                          {userRole === 'producer' 
                            ? 'Cursos que você criou na plataforma'
                            : 'Acompanhe seu avanço em cada curso'
                          }
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        {isLoading ? (
                          <div className="text-center py-8">
                            <div className="text-lg">Carregando...</div>
                          </div>
                        ) : courses.length > 0 ? (
                          <div className="space-y-6">
                            {courses.map((course, index) => (
                              <div key={index} className="border-b pb-6 last:border-b-0 last:pb-0">
                                <div className="flex items-start justify-between mb-3">
                                  <div className="flex-1">
                                    <h4 className="font-medium text-gray-900 mb-1">
                                      {course.title}
                                    </h4>
                                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                                      <span>{course.category || 'Sem categoria'}</span>
                                      <span>•</span>
                                      <span>{course.difficulty_level || 'Iniciante'}</span>
                                      <Badge variant="outline" className="text-xs">
                                        {course.is_published ? 'Publicado' : 'Rascunho'}
                                      </Badge>
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    {userRole === 'producer' ? (
                                      <div className="text-lg font-semibold text-gray-900 mb-1">
                                        {course.is_published ? 'Ativo' : 'Inativo'}
                                      </div>
                                    ) : (
                                      <div className="text-lg font-semibold text-gray-900 mb-1">
                                        0%
                                      </div>
                                    )}
                                  </div>
                                </div>
                                {userRole !== 'producer' && (
                                  <Progress value={0} className="h-2" />
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-8">
                            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                              {userRole === 'producer' ? 'Nenhum curso criado' : 'Nenhum curso disponível'}
                            </h3>
                            <p className="text-gray-600">
                              {userRole === 'producer' 
                                ? 'Comece criando seu primeiro curso na seção Cursos.'
                                : 'Aguarde novos cursos serem disponibilizados.'
                              }
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="insights" className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Insights e Recomendações</CardTitle>
                        <CardDescription>
                          {userRole === 'producer' 
                            ? 'Insights baseados na atividade da sua plataforma'
                            : 'Recomendações baseadas no seu padrão de aprendizagem'
                          }
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="text-center py-8">
                          <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            Insights em Desenvolvimento
                          </h3>
                          <p className="text-gray-600">
                            {userRole === 'producer' 
                              ? 'Insights detalhados estarão disponíveis conforme a plataforma cresce e mais dados são coletados.'
                              : 'Recomendações personalizadas aparecerão aqui conforme você usa a plataforma.'
                            }
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Analytics;
