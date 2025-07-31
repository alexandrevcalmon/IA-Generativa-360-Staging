import { PageLayout } from "@/components/PageLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart3,
  TrendingUp,
  Clock,
  Target,
  BookOpen,
  Award,
  Calendar,
  Activity
} from "lucide-react";

const StudentAnalytics = () => {
  return (
    <div className="dark-theme-override min-h-screen" style={{ 
      backgroundColor: '#0f172a',
      color: 'white',
      '--background': '240 10% 3.9%',
      '--foreground': '0 0% 98%',
      '--card': '240 10% 3.9%',
      '--card-foreground': '0 0% 98%',
      '--popover': '240 10% 3.9%',
      '--popover-foreground': '0 0% 98%',
      '--primary': '0 0% 98%',
      '--primary-foreground': '240 5.9% 10%',
      '--secondary': '240 3.7% 15.9%',
      '--secondary-foreground': '0 0% 98%',
      '--muted': '240 3.7% 15.9%',
      '--muted-foreground': '240 5% 64.9%',
      '--accent': '240 3.7% 15.9%',
      '--accent-foreground': '0 0% 98%',
      '--destructive': '0 62.8% 30.6%',
      '--destructive-foreground': '0 0% 98%',
      '--border': 'transparent',
      '--input': '240 3.7% 15.9%',
      '--ring': '240 4.9% 83.9%'
    } as React.CSSProperties}>
      <PageLayout
        title="Meu Progresso"
        subtitle="Acompanhe seu desenvolvimento e estatísticas de aprendizagem"
        background="dark"
        className="dark-theme-override"
        contentClassName="!bg-slate-900"
      >
      <div className="space-y-6">
          {/* Stats Overview */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            <Card className="border-slate-700/50 bg-slate-900/20 shadow-lg" style={{ backgroundColor: 'rgba(15, 23, 42, 0.2)' }}>
              <CardContent className="p-4 md:p-6">
                <div className="flex items-center">
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center">
                    <BookOpen className="h-5 w-5 md:h-6 md:w-6 text-white" />
                  </div>
                  <div className="ml-3 md:ml-4">
                    <p className="text-xs md:text-sm font-medium text-slate-300">Cursos Iniciados</p>
                    <p className="text-xl md:text-2xl font-bold text-white">0</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-700/50 bg-slate-900/20 shadow-lg" style={{ backgroundColor: 'rgba(15, 23, 42, 0.2)' }}>
              <CardContent className="p-4 md:p-6">
                <div className="flex items-center">
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-r from-emerald-500 to-green-600 flex items-center justify-center">
                    <Award className="h-5 w-5 md:h-6 md:w-6 text-white" />
                  </div>
                  <div className="ml-3 md:ml-4">
                    <p className="text-xs md:text-sm font-medium text-slate-300">Cursos Concluídos</p>
                    <p className="text-xl md:text-2xl font-bold text-white">0</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-700/50 bg-slate-900/20 shadow-lg" style={{ backgroundColor: 'rgba(15, 23, 42, 0.2)' }}>
              <CardContent className="p-4 md:p-6">
                <div className="flex items-center">
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-r from-purple-500 to-violet-600 flex items-center justify-center">
                    <Clock className="h-5 w-5 md:h-6 md:w-6 text-white" />
                  </div>
                  <div className="ml-3 md:ml-4">
                    <p className="text-xs md:text-sm font-medium text-slate-300">Horas de Estudo</p>
                    <p className="text-xl md:text-2xl font-bold text-white">0h</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-700/50 bg-slate-900/20 shadow-lg" style={{ backgroundColor: 'rgba(15, 23, 42, 0.2)' }}>
              <CardContent className="p-4 md:p-6">
                <div className="flex items-center">
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center">
                    <Target className="h-5 w-5 md:h-6 md:w-6 text-white" />
                  </div>
                  <div className="ml-3 md:ml-4">
                    <p className="text-xs md:text-sm font-medium text-slate-300">Meta Semanal</p>
                    <p className="text-xl md:text-2xl font-bold text-white">0%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Analytics Tabs */}
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="w-full justify-start overflow-x-auto bg-slate-800/50 border border-slate-700/50" style={{ backgroundColor: 'rgba(30, 41, 59, 0.5)' }}>
              <TabsTrigger 
                value="overview" 
                className="data-[state=active]:bg-slate-700/50 data-[state=active]:text-white text-slate-300"
                style={{ 
                  '--background': 'rgba(51, 65, 85, 0.5)',
                  '--foreground': 'white'
                } as React.CSSProperties}
              >
                Visão Geral
              </TabsTrigger>
              <TabsTrigger 
                value="courses"
                className="data-[state=active]:bg-slate-700/50 data-[state=active]:text-white text-slate-300"
                style={{ 
                  '--background': 'rgba(51, 65, 85, 0.5)',
                  '--foreground': 'white'
                } as React.CSSProperties}
              >
                Cursos
              </TabsTrigger>
              <TabsTrigger 
                value="time"
                className="data-[state=active]:bg-slate-700/50 data-[state=active]:text-white text-slate-300"
                style={{ 
                  '--background': 'rgba(51, 65, 85, 0.5)',
                  '--foreground': 'white'
                } as React.CSSProperties}
              >
                Tempo de Estudo
              </TabsTrigger>
              <TabsTrigger 
                value="achievements"
                className="data-[state=active]:bg-slate-700/50 data-[state=active]:text-white text-slate-300"
                style={{ 
                  '--background': 'rgba(51, 65, 85, 0.5)',
                  '--foreground': 'white'
                } as React.CSSProperties}
              >
                Conquistas
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid lg:grid-cols-2 gap-6">
                <Card className="border-slate-700/50 bg-slate-900/20 shadow-lg" style={{ backgroundColor: 'rgba(15, 23, 42, 0.2)' }}>
                  <CardHeader className="bg-slate-900/20 text-white border-b border-slate-700/50" style={{ backgroundColor: 'rgba(15, 23, 42, 0.2)' }}>
                    <CardTitle className="flex items-center text-white">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 flex items-center justify-center mr-2">
                        <TrendingUp className="h-3 w-3 text-white" />
                      </div>
                      Progresso Semanal
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="bg-slate-900/20" style={{ backgroundColor: 'rgba(15, 23, 42, 0.2)' }}>
                    <div className="text-center py-8">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-emerald-500/20 to-teal-500/20 flex items-center justify-center">
                        <BarChart3 className="h-8 w-8 text-emerald-400" />
                      </div>
                      <p className="text-slate-300">
                        Dados de progresso aparecerão aqui quando você começar a estudar
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-slate-700/50 bg-slate-900/20 shadow-lg" style={{ backgroundColor: 'rgba(15, 23, 42, 0.2)' }}>
                  <CardHeader className="bg-slate-900/20 text-white border-b border-slate-700/50" style={{ backgroundColor: 'rgba(15, 23, 42, 0.2)' }}>
                    <CardTitle className="flex items-center text-white">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-r from-purple-500 to-violet-500 flex items-center justify-center mr-2">
                        <Activity className="h-3 w-3 text-white" />
                      </div>
                      Atividade Recente
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="bg-slate-900/20" style={{ backgroundColor: 'rgba(15, 23, 42, 0.2)' }}>
                    <div className="text-center py-8">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-purple-500/20 to-violet-500/20 flex items-center justify-center">
                        <Calendar className="h-8 w-8 text-purple-400" />
                      </div>
                      <p className="text-slate-300">
                        Sua atividade de aprendizagem será exibida aqui
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="courses" className="space-y-6">
              <Card className="border-slate-700/50 bg-slate-900/20 shadow-lg" style={{ backgroundColor: 'rgba(15, 23, 42, 0.2)' }}>
                <CardHeader className="bg-slate-900/20 text-white border-b border-slate-700/50" style={{ backgroundColor: 'rgba(15, 23, 42, 0.2)' }}>
                  <CardTitle className="flex items-center text-white">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center mr-2">
                      <BookOpen className="h-3 w-3 text-white" />
                    </div>
                    Progresso dos Cursos
                  </CardTitle>
                  <CardDescription className="text-slate-300">
                    Acompanhe seu progresso em cada curso
                  </CardDescription>
                </CardHeader>
                <CardContent className="bg-slate-900/20" style={{ backgroundColor: 'rgba(15, 23, 42, 0.2)' }}>
                  <div className="text-center py-12">
                    <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-r from-blue-500/20 to-blue-600/20 flex items-center justify-center">
                      <BookOpen className="h-10 w-10 text-blue-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">
                      Nenhum curso iniciado
                    </h3>
                    <p className="text-slate-300">
                      Comece um curso para ver seu progresso aqui
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="time" className="space-y-6">
              <Card className="border-slate-700/50 bg-slate-900/20 shadow-lg" style={{ backgroundColor: 'rgba(15, 23, 42, 0.2)' }}>
                <CardHeader className="bg-slate-900/20 text-white border-b border-slate-700/50" style={{ backgroundColor: 'rgba(15, 23, 42, 0.2)' }}>
                  <CardTitle className="flex items-center text-white">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-r from-purple-500 to-violet-600 flex items-center justify-center mr-2">
                      <Clock className="h-3 w-3 text-white" />
                    </div>
                    Tempo de Estudo
                  </CardTitle>
                  <CardDescription className="text-slate-300">
                    Análise detalhada do seu tempo dedicado aos estudos
                  </CardDescription>
                </CardHeader>
                <CardContent className="bg-slate-900/20" style={{ backgroundColor: 'rgba(15, 23, 42, 0.2)' }}>
                  <div className="text-center py-12">
                    <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-r from-purple-500/20 to-violet-600/20 flex items-center justify-center">
                      <Clock className="h-10 w-10 text-purple-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">
                      Nenhum tempo registrado
                    </h3>
                    <p className="text-slate-300">
                      Seus dados de tempo de estudo aparecerão aqui
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="achievements" className="space-y-6">
              <Card className="border-slate-700/50 bg-slate-900/20 shadow-lg" style={{ backgroundColor: 'rgba(15, 23, 42, 0.2)' }}>
                <CardHeader className="bg-slate-900/20 text-white border-b border-slate-700/50" style={{ backgroundColor: 'rgba(15, 23, 42, 0.2)' }}>
                  <CardTitle className="flex items-center text-white">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-r from-yellow-500 to-amber-500 flex items-center justify-center mr-2">
                      <Award className="h-3 w-3 text-white" />
                    </div>
                    Conquistas e Badges
                  </CardTitle>
                  <CardDescription className="text-slate-300">
                    Suas conquistas e marcos de aprendizagem
                  </CardDescription>
                </CardHeader>
                <CardContent className="bg-slate-900/20" style={{ backgroundColor: 'rgba(15, 23, 42, 0.2)' }}>
                  <div className="text-center py-12">
                    <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-r from-yellow-500/20 to-amber-500/20 flex items-center justify-center">
                      <Award className="h-10 w-10 text-yellow-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">
                      Nenhuma conquista ainda
                    </h3>
                    <p className="text-slate-300">
                      Complete lições e cursos para desbloquear conquistas
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
      </div>
      </PageLayout>
    </div>
  );
};

export default StudentAnalytics;
