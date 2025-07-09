import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StudentPageHeader } from "@/components/student/StudentPageHeader";
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
    <div className="flex flex-col h-full">
      {/* Header */}
      <StudentPageHeader
        title="Meu Progresso"
        subtitle="Acompanhe seu desenvolvimento e estatísticas de aprendizagem"
      />

      {/* Main Content */}
      <div className="flex-1 overflow-auto p-4 md:p-6 bg-gray-50">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Stats Overview */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            <Card>
              <CardContent className="p-4 md:p-6">
                <div className="flex items-center">
                  <BookOpen className="h-6 w-6 md:h-8 md:w-8 text-blue-600" />
                  <div className="ml-3 md:ml-4">
                    <p className="text-xs md:text-sm font-medium text-gray-600">Cursos Iniciados</p>
                    <p className="text-xl md:text-2xl font-bold text-gray-900">0</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 md:p-6">
                <div className="flex items-center">
                  <Award className="h-6 w-6 md:h-8 md:w-8 text-green-600" />
                  <div className="ml-3 md:ml-4">
                    <p className="text-xs md:text-sm font-medium text-gray-600">Cursos Concluídos</p>
                    <p className="text-xl md:text-2xl font-bold text-gray-900">0</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 md:p-6">
                <div className="flex items-center">
                  <Clock className="h-6 w-6 md:h-8 md:w-8 text-purple-600" />
                  <div className="ml-3 md:ml-4">
                    <p className="text-xs md:text-sm font-medium text-gray-600">Horas de Estudo</p>
                    <p className="text-xl md:text-2xl font-bold text-gray-900">0h</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 md:p-6">
                <div className="flex items-center">
                  <Target className="h-6 w-6 md:h-8 md:w-8 text-orange-600" />
                  <div className="ml-3 md:ml-4">
                    <p className="text-xs md:text-sm font-medium text-gray-600">Meta Semanal</p>
                    <p className="text-xl md:text-2xl font-bold text-gray-900">0%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Analytics Tabs */}
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="w-full justify-start overflow-x-auto">
              <TabsTrigger value="overview">Visão Geral</TabsTrigger>
              <TabsTrigger value="courses">Cursos</TabsTrigger>
              <TabsTrigger value="time">Tempo de Estudo</TabsTrigger>
              <TabsTrigger value="achievements">Conquistas</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <TrendingUp className="h-5 w-5 mr-2" />
                      Progresso Semanal
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">
                        Dados de progresso aparecerão aqui quando você começar a estudar
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Activity className="h-5 w-5 mr-2" />
                      Atividade Recente
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">
                        Sua atividade de aprendizagem será exibida aqui
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="courses" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Progresso dos Cursos</CardTitle>
                  <CardDescription>
                    Acompanhe seu progresso em cada curso
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Nenhum curso iniciado
                    </h3>
                    <p className="text-gray-600">
                      Comece um curso para ver seu progresso aqui
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="time" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Tempo de Estudo</CardTitle>
                  <CardDescription>
                    Análise detalhada do seu tempo dedicado aos estudos
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Nenhum tempo registrado
                    </h3>
                    <p className="text-gray-600">
                      Seus dados de tempo de estudo aparecerão aqui
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="achievements" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Conquistas e Badges</CardTitle>
                  <CardDescription>
                    Suas conquistas e marcos de aprendizagem
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <Award className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Nenhuma conquista ainda
                    </h3>
                    <p className="text-gray-600">
                      Complete lições e cursos para desbloquear conquistas
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default StudentAnalytics;
