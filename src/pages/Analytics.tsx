
import { useState } from 'react';
import { AppSidebar } from "@/components/AppSidebar";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  TrendingUp,
  TrendingDown,
  Users,
  BookOpen,
  Clock,
  Star,
  Target,
  BarChart3,
  PieChart,
  Activity,
  Calendar,
  Award,
  Zap,
  Eye,
  MessageCircle,
  Heart,
  Share2
} from "lucide-react";
import { useAuth } from '@/hooks/auth/useAuth';

const Analytics = () => {
  const { user } = useAuth();
  const [timeRange, setTimeRange] = useState('30d');
  const [selectedMetric, setSelectedMetric] = useState('overview');

  // Check if user is producer or student
  const isProducer = user?.user_metadata?.role === 'producer';
  const isStudent = user?.user_metadata?.role === 'student';

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
                    <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
                    <p className="text-gray-600">Métricas e insights do seu negócio</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Select value={timeRange} onValueChange={setTimeRange}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7d">Últimos 7 dias</SelectItem>
                      <SelectItem value="30d">Últimos 30 dias</SelectItem>
                      <SelectItem value="90d">Últimos 90 dias</SelectItem>
                      <SelectItem value="1y">Último ano</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </header>

            {/* Main Content */}
            <div className="flex-1 overflow-auto p-6">
              <div className="text-center py-12">
                <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Analytics do Produtor
                </h3>
                <p className="text-gray-600 mb-4">
                  As métricas detalhadas do produtor estarão disponíveis em breve
                </p>
                <Button variant="outline">
                  <Calendar className="h-4 w-4 mr-2" />
                  Configurar Analytics
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
                    <h1 className="text-2xl font-bold text-gray-900">Meu Progresso</h1>
                    <p className="text-gray-600">Acompanhe seu desenvolvimento e conquistas</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Select value={timeRange} onValueChange={setTimeRange}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7d">Últimos 7 dias</SelectItem>
                      <SelectItem value="30d">Últimos 30 dias</SelectItem>
                      <SelectItem value="90d">Últimos 90 dias</SelectItem>
                      <SelectItem value="1y">Último ano</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </header>

            {/* Main Content */}
            <div className="flex-1 overflow-auto p-6">
              <div className="text-center py-12">
                <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Analytics do Estudante
                </h3>
                <p className="text-gray-600 mb-4">
                  As métricas detalhadas do estudante estarão disponíveis em breve
                </p>
                <Button variant="outline">
                  <Target className="h-4 w-4 mr-2" />
                  Ver Metas
                </Button>
              </div>
            </div>
          </div>
        </main>
      </>
    );
  }

  // Default view for other roles
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
                  <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
                  <p className="text-gray-600">Métricas e insights da plataforma</p>
                </div>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <div className="flex-1 overflow-auto p-6">
            <div className="text-center py-12">
              <PieChart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Analytics Gerais
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

export default Analytics;
