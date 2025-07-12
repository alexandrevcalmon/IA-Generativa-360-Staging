
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useCompanyData } from "@/hooks/useCompanyData";
import { useCompanyCourses } from "@/hooks/useCompanyCourses";
import { useCompanyMentorships } from "@/hooks/useCompanyMentorships";
import { useSubscription } from '@/hooks/useSubscription';
import { useCollaboratorAnalytics } from '@/hooks/useCollaboratorAnalytics';
import { CompanyDashboardStats } from '@/components/company/CompanyDashboardStats';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, Legend } from 'recharts';
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
import { getPlanInfo } from "@/lib/stripe";

const CompanyDashboard = () => {
  const { data: companyData, isLoading: companyLoading } = useCompanyData();
  const { data: courses = [], isLoading: coursesLoading } = useCompanyCourses();
  const { data: mentorships = [], isLoading: mentorshipsLoading } = useCompanyMentorships();
  const subscription = useSubscription();
  const { data: collaboratorAnalytics = [], isLoading: analyticsLoading } = useCollaboratorAnalytics();

  const isLoading = companyLoading || coursesLoading || mentorshipsLoading;

  // Calculate stats
  const totalEnrollments = courses.reduce((sum, course) => sum + course.enrolled_students, 0);
  const totalCompletions = courses.reduce((sum, course) => sum + course.completed_students, 0);
  const completionRate = totalEnrollments > 0 ? Math.round((totalCompletions / totalEnrollments) * 100) : 0;
  const upcomingMentorships = mentorships.filter(m => m.status === 'scheduled').length;

  // Gráfico: evolução de novos colaboradores
  const evolutionData = collaboratorAnalytics
    .map(c => ({
      date: new Date(c.updated_at).toLocaleDateString('pt-BR'),
      count: 1
    }))
    .reduce((acc, curr) => {
      const found = acc.find(a => a.date === curr.date);
      if (found) found.count += 1;
      else acc.push({ ...curr });
      return acc;
    }, []);
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

  if (companyData) {
    // Log para depuração do plano
    console.log('[Dashboard] companyData:', companyData);
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

          {/* Stats Analíticos dos Colaboradores */}
          <CompanyDashboardStats collaborators={collaboratorAnalytics} />
          {/* Gráficos Analíticos */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Evolução de Novos Colaboradores */}
            <Card>
              <CardHeader>
                <CardTitle>Evolução de Novos Colaboradores</CardTitle>
              </CardHeader>
              <CardContent style={{ height: 250 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={evolutionData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Line type="monotone" dataKey="count" stroke="#2563eb" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            {/* Top 5 Colaboradores Mais Ativos */}
            <Card>
              <CardHeader>
                <CardTitle>Top 5 Colaboradores Mais Ativos</CardTitle>
              </CardHeader>
              <CardContent style={{ height: 250 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topActive.map(c => ({ name: c.collaborator.name, minutos: c.total_watch_time_minutes }))}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="minutos" fill="#10b981" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            {/* Progresso Médio dos Colaboradores */}
            <Card>
              <CardHeader>
                <CardTitle>Progresso Médio (Lições Completas)</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center justify-center" style={{ height: 250 }}>
                <div className="text-5xl font-bold text-blue-600">{avgProgress}</div>
                <div className="text-gray-500 mt-2">lições completas por colaborador</div>
              </CardContent>
            </Card>
          </div>
          {/* Últimos Colaboradores Cadastrados */}
          <Card>
            <CardHeader>
              <CardTitle>Últimos Colaboradores Cadastrados</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="divide-y divide-gray-200">
                {lastRegistered.map(c => (
                  <li key={c.collaborator.id} className="py-2 flex justify-between items-center">
                    <span>{c.collaborator.name}</span>
                    <span className="text-xs text-gray-500">{new Date(c.updated_at).toLocaleDateString('pt-BR')}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
          {/* Informações do Plano Real */}
          <Card>
            <CardHeader>
              <CardTitle>Informações do Plano</CardTitle>
              <CardDescription>Plano real integrado ao Stripe</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-4">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-600">Plano Atual</p>
                  <p className="text-lg font-semibold capitalize">
                    {companyData?.subscription_plan_data?.name || 'N/A'}
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-600">Preço</p>
                  <p className="text-lg font-semibold">
                    {companyData?.subscription_plan_data?.price !== undefined ? `R$ ${companyData.subscription_plan_data.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : 'N/A'}
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-600">Limite de Alunos</p>
                  <p className="text-lg font-semibold">
                    {companyData?.subscription_plan_data?.max_students ?? 'N/A'}
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-600">Colaboradores</p>
                  <p className="text-lg font-semibold">
                    {subscription.currentCollaborators} / {subscription.maxCollaborators}
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-600">Status</p>
                  <Badge variant={subscription.isActive ? "default" : "secondary"}>
                    {subscription.subscriptionStatus}
                  </Badge>
                  {subscription.subscriptionEndsAt && (
                    <p className="text-xs text-gray-500 mt-1">Vence em: {new Date(subscription.subscriptionEndsAt).toLocaleDateString('pt-BR')}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CompanyDashboard;
