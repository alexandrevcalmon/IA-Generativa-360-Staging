
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useCompanyData } from "@/hooks/useCompanyData";
import { useCompanyCourses } from "@/hooks/useCompanyCourses";
import { useCompanyMentorships } from "@/hooks/useCompanyMentorships";
import { 
  Users, 
  BookOpen, 
  Calendar, 
  TrendingUp, 
  Clock,
  GraduationCap,
  Info,
  ExternalLink
} from "lucide-react";
import { Link } from "react-router-dom";

const CompanyDashboard = () => {
  const { data: companyData, isLoading: companyLoading } = useCompanyData();
  const { data: courses = [], isLoading: coursesLoading } = useCompanyCourses();
  const { data: mentorships = [], isLoading: mentorshipsLoading } = useCompanyMentorships();

  const isLoading = companyLoading || coursesLoading || mentorshipsLoading;

  // Calculate stats
  const totalEnrollments = courses.reduce((sum, course) => sum + course.enrolled_students, 0);
  const totalCompletions = courses.reduce((sum, course) => sum + course.completed_students, 0);
  const completionRate = totalEnrollments > 0 ? Math.round((totalCompletions / totalEnrollments) * 100) : 0;
  const upcomingMentorships = mentorships.filter(m => m.status === 'scheduled').length;

  const stats = [
    {
      title: "Cursos Disponíveis",
      value: courses.length,
      icon: BookOpen,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "Total de Matrículas",
      value: totalEnrollments,
      icon: Users,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "Taxa de Conclusão",
      value: `${completionRate}%`,
      icon: GraduationCap,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
    {
      title: "Mentorias Agendadas",
      value: upcomingMentorships,
      icon: Calendar,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
    },
  ];

  if (isLoading) {
    return (
      <div className="flex flex-col h-full">
        <header className="border-b bg-white px-6 py-4">
          <div className="flex items-center space-x-4">
            <SidebarTrigger />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-600">Carregando dados...</p>
            </div>
          </div>
        </header>
        <div className="flex-1 p-6 bg-gray-50">
          <div className="animate-pulse grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[1,2,3,4].map((i) => (
              <div key={i} className="h-24 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <header className="border-b bg-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <SidebarTrigger />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-600">
                Bem-vindo, {companyData?.name || 'Empresa'}
              </p>
            </div>
          </div>
          {companyData && (
            <Badge variant={companyData.is_active ? "default" : "secondary"}>
              {companyData.is_active ? "Ativo" : "Inativo"}
            </Badge>
          )}
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-auto p-6 bg-gray-50">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Info Banner */}
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Este é um ambiente de demonstração. Os dados mostrados são exemplos para visualização das funcionalidades da plataforma.
            </AlertDescription>
          </Alert>

          {/* Stats Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => (
              <Card key={stat.title}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                      <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    </div>
                    <div className={`p-3 rounded-full ${stat.bgColor}`}>
                      <stat.icon className={`h-6 w-6 ${stat.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Company Info */}
          {companyData && (
            <Card>
              <CardHeader>
                <CardTitle>Informações da Empresa</CardTitle>
                <CardDescription>
                  Dados do seu plano e limites de uso
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-600">Plano Atual</p>
                    <p className="text-lg font-semibold capitalize">
                      {companyData.subscription_plan_data?.name || companyData.subscription_plan || 'Básico'}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-600">Colaboradores</p>
                    <p className="text-lg font-semibold">
                      {companyData.current_students} / {companyData.max_students}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-600">Status</p>
                    <Badge variant={companyData.is_active ? "default" : "secondary"}>
                      {companyData.is_active ? "Ativo" : "Inativo"}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Quick Actions */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Courses Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BookOpen className="h-5 w-5 mr-2" />
                  Cursos em Destaque
                </CardTitle>
                <CardDescription>
                  Cursos mais populares entre seus colaboradores
                </CardDescription>
              </CardHeader>
              <CardContent>
                {courses.length > 0 ? (
                  <div className="space-y-4">
                    {courses.slice(0, 3).map((course) => (
                      <div key={course.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <h4 className="font-medium">{course.title}</h4>
                          <p className="text-sm text-gray-600">
                            {course.enrolled_students} matriculados
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-green-600">
                            {course.enrolled_students > 0 
                              ? Math.round((course.completed_students / course.enrolled_students) * 100) 
                              : 0}% concluído
                          </p>
                        </div>
                      </div>
                    ))}
                    <Button asChild className="w-full" variant="outline">
                      <Link to="/company/courses">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Ver Todos os Cursos
                      </Link>
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <BookOpen className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-600">Nenhum curso disponível</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Upcoming Mentorships */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2" />
                  Próximas Mentorias
                </CardTitle>
                <CardDescription>
                  Sessões de mentoria agendadas
                </CardDescription>
              </CardHeader>
              <CardContent>
                {mentorships.length > 0 ? (
                  <div className="space-y-4">
                    {mentorships
                      .filter(m => m.status === 'scheduled')
                      .slice(0, 3)
                      .map((mentorship) => (
                      <div key={mentorship.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <h4 className="font-medium">{mentorship.title}</h4>
                          <div className="flex items-center text-sm text-gray-600">
                            <Clock className="h-4 w-4 mr-1" />
                            {new Date(mentorship.scheduled_at).toLocaleDateString('pt-BR')}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">
                            {mentorship.participants_count}/{mentorship.max_participants}
                          </p>
                          <p className="text-xs text-gray-500">participantes</p>
                        </div>
                      </div>
                    ))}
                    <Button asChild className="w-full" variant="outline">
                      <Link to="/company/mentorships">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Ver Todas as Mentorias
                      </Link>
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <Calendar className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-600">Nenhuma mentoria agendada</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyDashboard;
