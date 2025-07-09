
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
import { BookOpen, Users, Search, Filter, TrendingUp, Clock, Award } from "lucide-react";

const CourseProgressPage = () => {
  const { data: companyData } = useCompanyData();
  const { data: courses = [], isLoading: coursesLoading } = useCompanyCourses();
  const { data: collaborators = [], isLoading: collaboratorsLoading } = useGetCompanyCollaborators(companyData?.id);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const isLoading = coursesLoading || collaboratorsLoading;

  // Mock progress data - in a real app, this would come from the API
  const progressData = collaborators.map(collaborator => ({
    id: collaborator.id,
    name: collaborator.name,
    email: collaborator.email,
    coursesEnrolled: Math.floor(Math.random() * courses.length) + 1,
    coursesCompleted: Math.floor(Math.random() * 3),
    totalWatchTime: Math.floor(Math.random() * 120) + 10,
    averageProgress: Math.floor(Math.random() * 100),
    lastActivity: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toLocaleDateString('pt-BR')
  }));

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
      <div className="flex flex-col h-full">
        <header className="border-b bg-white px-6 py-4">
          <div className="flex items-center space-x-4">
            <SidebarTrigger />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Progresso dos Cursos</h1>
              <p className="text-gray-600">Carregando dados...</p>
            </div>
          </div>
        </header>
        <div className="flex-1 p-6 bg-gray-50">
          <div className="animate-pulse grid gap-6 md:grid-cols-3">
            {[1,2,3].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
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
    <div className="flex flex-col h-full">
      {/* Header */}
      <header className="border-b bg-white px-6 py-4">
        <div className="flex items-center space-x-4">
          <SidebarTrigger />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Progresso dos Cursos</h1>
            <p className="text-gray-600">
              Acompanhe o progresso de aprendizado dos colaboradores
            </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-auto p-6 bg-gray-50">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Summary Cards */}
          <div className="grid gap-6 md:grid-cols-3">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Colaboradores Ativos</p>
                    <p className="text-2xl font-bold text-gray-900">{activeCollaborators}/{totalCollaborators}</p>
                  </div>
                  <div className="p-3 rounded-full bg-blue-100">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Progresso Médio</p>
                    <p className="text-2xl font-bold text-gray-900">{averageCompletion}%</p>
                  </div>
                  <div className="p-3 rounded-full bg-green-100">
                    <TrendingUp className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Cursos Disponíveis</p>
                    <p className="text-2xl font-bold text-gray-900">{courses.length}</p>
                  </div>
                  <div className="p-3 rounded-full bg-purple-100">
                    <BookOpen className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Filter className="h-5 w-5 mr-2" />
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
                    className="pl-10"
                  />
                </div>
                
                <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                  <SelectTrigger>
                    <SelectValue placeholder="Curso" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os cursos</SelectItem>
                    {courses.map(course => (
                      <SelectItem key={course.id} value={course.id}>
                        {course.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os status</SelectItem>
                    <SelectItem value="active">Ativos</SelectItem>
                    <SelectItem value="completed">Concluídos</SelectItem>
                    <SelectItem value="inactive">Inativos</SelectItem>
                  </SelectContent>
                </Select>

                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedCourse("all");
                    setStatusFilter("all");
                  }}
                >
                  Limpar Filtros
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Progress List */}
          <Card>
            <CardHeader>
              <CardTitle>Progresso Individual</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredProgress.map((item) => (
                  <div key={item.id} className="border rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-medium">{item.name}</h4>
                        <p className="text-sm text-gray-600">{item.email}</p>
                      </div>
                      <div className="text-right">
                        <Badge variant={item.averageProgress > 50 ? "default" : "secondary"}>
                          {item.averageProgress}% completo
                        </Badge>
                      </div>
                    </div>
                    
                    <Progress value={item.averageProgress} className="mb-3" />
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
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
                        {item.totalWatchTime}h estudadas
                      </div>
                      <div>
                        Última atividade: {item.lastActivity}
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
