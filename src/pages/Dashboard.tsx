
import { useState, useEffect } from 'react';
import { AppSidebar } from "@/components/AppSidebar";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  TrendingUp,
  TrendingDown,
  Users,
  BookOpen,
  Clock,
  Star,
  Target,
  Calendar,
  Award,
  Zap,
  Eye,
  MessageCircle,
  Heart,
  Share2,
  Play,
  CheckCircle,
  AlertCircle,
  Plus
} from "lucide-react";
import { useAuth } from '@/hooks/auth/useAuth';
import { useCourses } from '@/hooks/useCourses';
import { useStudentCourses } from '@/hooks/useStudentCourses';
import { useStudentProgress } from '@/hooks/useStudentProgress';

const Dashboard = () => {
  const { user } = useAuth();
  const { data: courses = [], isLoading: coursesLoading } = useCourses();
  const { data: studentCourses = [], isLoading: studentCoursesLoading } = useStudentCourses();
  const { data: progress = [], isLoading: progressLoading } = useStudentProgress();
  
  const [recentActivity, setRecentActivity] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading state
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  // Check user role
  const isProducer = user?.user_metadata?.role === 'producer';
  const isStudent = user?.user_metadata?.role === 'student';
  const isCompany = user?.user_metadata?.role === 'company';

  // Get user initials for avatar
  const getUserInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
  };

  // Get display name from user data
  const getDisplayName = () => {
    if (user?.user_metadata?.name) {
      return user.user_metadata.name;
    }
    if (user?.email) {
      const emailPrefix = user.email.split('@')[0];
      return emailPrefix.charAt(0).toUpperCase() + emailPrefix.slice(1);
    }
    return 'Usuário';
  };

  if (isLoading) {
    return (
      <>
        <AppSidebar />
        <main className="flex-1 overflow-hidden">
          <div className="flex flex-col h-full">
            <header className="border-b bg-white px-6 py-4">
              <div className="flex items-center space-x-4">
                <SidebarTrigger />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                  <p className="text-gray-600">Bem-vindo de volta!</p>
                </div>
              </div>
            </header>
            <div className="flex-1 overflow-auto p-6">
              <div className="animate-pulse space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="bg-gray-200 h-32 rounded-lg"></div>
                  ))}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="bg-gray-200 h-64 rounded-lg"></div>
                  <div className="bg-gray-200 h-64 rounded-lg"></div>
                  <div className="bg-gray-200 h-64 rounded-lg"></div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </>
    );
  }

  if (isProducer) {
    return (
      <>
        <AppSidebar />
        <main className="flex-1 overflow-hidden">
          <div className="flex flex-col h-full">
            {/* Header */}
            <header className="border-b bg-white px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <SidebarTrigger />
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">Dashboard do Produtor</h1>
                    <p className="text-gray-600">Bem-vindo de volta, {getDisplayName()}!</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Button variant="outline">
                    <Calendar className="h-4 w-4 mr-2" />
                    Relatórios
                  </Button>
                  <Button className="ai-gradient text-white">
                    <Plus className="h-4 w-4 mr-2" />
                    Novo Curso
                  </Button>
                </div>
              </div>
            </header>

            {/* Main Content */}
            <div className="flex-1 overflow-auto p-6">
              <div className="text-center py-12">
                <Zap className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Dashboard do Produtor
                </h3>
                <p className="text-gray-600 mb-4">
                  As métricas detalhadas do produtor estarão disponíveis em breve
                </p>
                <Button variant="outline">
                  <BookOpen className="h-4 w-4 mr-2" />
                  Gerenciar Cursos
                </Button>
              </div>
            </div>
          </div>
        </main>
      </>
    );
  }

  if (isStudent) {
    return (
      <>
        <AppSidebar />
        <main className="flex-1 overflow-hidden">
          <div className="flex flex-col h-full">
            {/* Header */}
            <header className="border-b bg-white px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <SidebarTrigger />
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">Meu Dashboard</h1>
                    <p className="text-gray-600">Bem-vindo de volta, {getDisplayName()}!</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Button variant="outline">
                    <Target className="h-4 w-4 mr-2" />
                    Metas
                  </Button>
                  <Button className="ai-gradient text-white">
                    <BookOpen className="h-4 w-4 mr-2" />
                    Explorar Cursos
                  </Button>
                </div>
              </div>
            </header>

            {/* Main Content */}
            <div className="flex-1 overflow-auto p-6">
              <div className="text-center py-12">
                <Award className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Dashboard do Estudante
                </h3>
                <p className="text-gray-600 mb-4">
                  As métricas detalhadas do estudante estarão disponíveis em breve
                </p>
                <Button variant="outline">
                  <Play className="h-4 w-4 mr-2" />
                  Continuar Aprendendo
                </Button>
              </div>
            </div>
          </div>
        </main>
      </>
    );
  }

  if (isCompany) {
    return (
      <>
        <AppSidebar />
        <main className="flex-1 overflow-hidden">
          <div className="flex flex-col h-full">
            {/* Header */}
            <header className="border-b bg-white px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <SidebarTrigger />
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">Dashboard da Empresa</h1>
                    <p className="text-gray-600">Bem-vindo de volta, {getDisplayName()}!</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Button variant="outline">
                    <Users className="h-4 w-4 mr-2" />
                    Colaboradores
                  </Button>
                  <Button className="ai-gradient text-white">
                    <BookOpen className="h-4 w-4 mr-2" />
                    Gerenciar Cursos
                  </Button>
                </div>
              </div>
            </header>

            {/* Main Content */}
            <div className="flex-1 overflow-auto p-6">
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Dashboard da Empresa
                </h3>
                <p className="text-gray-600 mb-4">
                  As métricas detalhadas da empresa estarão disponíveis em breve
                </p>
                <Button variant="outline">
                  <Users className="h-4 w-4 mr-2" />
                  Gerenciar Colaboradores
                </Button>
              </div>
            </div>
          </div>
        </main>
      </>
    );
  }

  // Default dashboard for other roles
  return (
    <>
      <AppSidebar />
      <main className="flex-1 overflow-hidden">
        <div className="flex flex-col h-full">
          {/* Header */}
          <header className="border-b bg-white px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <SidebarTrigger />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                  <p className="text-gray-600">Bem-vindo de volta, {getDisplayName()}!</p>
                </div>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <div className="flex-1 overflow-auto p-6">
            <div className="text-center py-12">
              <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Dashboard Geral
              </h3>
              <p className="text-gray-600">
                As métricas gerais estarão disponíveis em breve
              </p>
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default Dashboard;
