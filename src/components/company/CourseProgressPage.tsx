
import { useState } from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { useCompanyCourses } from "@/hooks/useCompanyCourses";
import { useGetCompanyCollaborators } from "@/hooks/useCompanyCollaborators";
import { useCompanyData } from "@/hooks/useCompanyData";
import { useCollaboratorAnalytics } from "@/hooks/useCollaboratorAnalytics";
import { BookOpen, Users, Search, Filter, TrendingUp, Clock, Award } from "lucide-react";

const CourseProgressPage = () => {
  const { data: companyData } = useCompanyData();
  const { data: courses = [], isLoading: coursesLoading } = useCompanyCourses();
  const { data: collaborators = [], isLoading: collaboratorsLoading } = useGetCompanyCollaborators(companyData?.id);
  const { data: analyticsData = [], isLoading: analyticsLoading } = useCollaboratorAnalytics();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const isLoading = coursesLoading || collaboratorsLoading || analyticsLoading;

  // Use real progress data from analytics
  const progressData = analyticsData.map(analytics => {
    const collaborator = collaborators.find(c => c.id === analytics.collaborator_id);
    const averageProgress = analytics.courses_enrolled > 0 
      ? Math.round((analytics.courses_completed / analytics.courses_enrolled) * 100)
      : 0;
    
    return {
      id: analytics.collaborator_id,
      name: analytics.collaborator.name,
      email: analytics.collaborator.email,
      coursesEnrolled: analytics.courses_enrolled,
      coursesCompleted: analytics.courses_completed,
      totalWatchTime: analytics.total_watch_time_minutes,
      averageProgress: averageProgress,
      lastActivity: analytics.updated_at ? new Date(analytics.updated_at).toLocaleDateString('pt-BR') : 'N/A',
      lessonsCompleted: analytics.lessons_completed,
      lessonsStarted: analytics.lessons_started,
      totalPoints: analytics.total_points,
      currentLevel: analytics.current_level,
      streakDays: analytics.streak_days
    };
  });

  const filteredProgress = progressData.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || 
                         (statusFilter === "active" && item.averageProgress > 0) ||
                         (statusFilter === "completed" && item.coursesCompleted > 0) ||
                         (statusFilter === "inactive" && item.averageProgress === 0);
    
    return matchesSearch && matchesStatus;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        <div className="container mx-auto px-6 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-500 to-yellow-500 bg-clip-text text-transparent">
              Progresso dos Cursos
            </h1>
            <p className="text-gray-400 mt-2">Carregando dados...</p>
          </div>
          <div className="animate-pulse grid gap-6 md:grid-cols-3">
            {[1,2,3].map((i) => (
              <div key={i} className="h-32 bg-gray-800 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const totalCollaborators = collaborators.length;
  const activeCollaborators = progressData.filter(p => p.averageProgress > 0).length;
  const averageCompletion = Math.round(progressData.reduce((acc, p) => acc + p.averageProgress, 0) / totalCollaborators);

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-500 to-yellow-500 bg-clip-text text-transparent">
            Progresso dos Cursos
          </h1>
          <p className="text-gray-400 mt-2">
            Acompanhe o progresso de aprendizado dos colaboradores
          </p>
        </div>

        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid gap-6 md:grid-cols-3">
            <Card className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/30 shadow-2xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-400">Colaboradores Ativos</p>
                    <p className="text-2xl font-bold text-white">{activeCollaborators}/{totalCollaborators}</p>
                  </div>
                  <div className="p-3 rounded-full bg-blue-900/20 border border-blue-500/30">
                    <Users className="h-6 w-6 text-blue-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/30 shadow-2xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-400">Progresso Médio</p>
                    <p className="text-2xl font-bold text-white">{averageCompletion}%</p>
                  </div>
                  <div className="p-3 rounded-full bg-emerald-900/20 border border-emerald-500/30">
                    <TrendingUp className="h-6 w-6 text-emerald-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/30 shadow-2xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-400">Cursos Disponíveis</p>
                    <p className="text-2xl font-bold text-white">{courses.length}</p>
                  </div>
                  <div className="p-3 rounded-full bg-purple-900/20 border border-purple-500/30">
                    <BookOpen className="h-6 w-6 text-purple-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/30 shadow-2xl">
            <CardHeader>
              <CardTitle className="flex items-center text-white">
                <Filter className="h-5 w-5 mr-2 text-orange-400" />
                Filtros
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Buscar colaborador..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-gray-700/50 border-gray-600 text-white placeholder-gray-400 focus:border-orange-500 focus:ring-orange-500"
                  />
                </div>
                
                <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                  <SelectTrigger className="bg-gray-700/50 border-gray-600 text-white focus:border-orange-500 focus:ring-orange-500">
                    <SelectValue placeholder="Curso" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-600">
                    <SelectItem value="all" className="text-white hover:bg-gray-700">Todos os cursos</SelectItem>
                    {courses.map(course => (
                      <SelectItem key={course.id} value={course.id} className="text-white hover:bg-gray-700">
                        {course.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="bg-gray-700/50 border-gray-600 text-white focus:border-orange-500 focus:ring-orange-500">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-600">
                    <SelectItem value="all" className="text-white hover:bg-gray-700">Todos os status</SelectItem>
                    <SelectItem value="active" className="text-white hover:bg-gray-700">Ativos</SelectItem>
                    <SelectItem value="completed" className="text-white hover:bg-gray-700">Concluídos</SelectItem>
                    <SelectItem value="inactive" className="text-white hover:bg-gray-700">Inativos</SelectItem>
                  </SelectContent>
                </Select>

                <Button 
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedCourse("all");
                    setStatusFilter("all");
                  }}
                  className="bg-gray-700/50 border-gray-600 text-gray-300 hover:bg-gray-600 hover:text-white hover:border-gray-500 transition-all duration-200"
                >
                  Limpar Filtros
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Progress List */}
          <Card className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/30 shadow-2xl">
            <CardHeader>
              <CardTitle className="text-white">Progresso Individual</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredProgress.map((item) => (
                  <div key={item.id} className="border rounded-lg p-4 hover:bg-gray-700/50">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-medium text-white">{item.name}</h4>
                        <p className="text-sm text-gray-400">{item.email}</p>
                      </div>
                      <div className="text-right">
                        <Badge variant={item.averageProgress > 50 ? "default" : "secondary"} className="bg-blue-900/20 border border-blue-500/30 text-blue-400">
                          {item.averageProgress}% completo
                        </Badge>
                      </div>
                    </div>
                    
                    <Progress 
                      value={item.averageProgress} 
                      className="mb-3 bg-black border border-gray-600 [&>div]:bg-white" 
                    />
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-400">
                      <div className="flex items-center">
                        <BookOpen className="h-4 w-4 mr-2" />
                        {item.coursesEnrolled} matriculados
                      </div>
                      <div className="flex items-center">
                        <Award className="h-4 w-4 mr-2" />
                        {item.coursesCompleted} concluídos
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-2" />
                        {item.totalWatchTime}min estudadas
                      </div>
                      <div className="flex items-center">
                        <TrendingUp className="h-4 w-4 mr-2" />
                        {item.lessonsCompleted} aulas concluídas
                      </div>
                    </div>
                    
                    {/* Additional stats */}
                    <div className="mt-3 pt-3 border-t border-gray-700/30">
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-xs text-gray-500">
                        <div>Última atividade: {item.lastActivity}</div>
                        <div>Pontos: {item.totalPoints}</div>
                        <div>Nível: {item.currentLevel}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CourseProgressPage;
