
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCompanyCourses } from "@/hooks/useCompanyCourses";
import { BookOpen, Users, Clock, Search, Filter, Eye, GraduationCap, TrendingUp } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

const CompanyCourses = () => {
  const { data: courses = [], isLoading, error } = useCompanyCourses();
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [difficultyFilter, setDifficultyFilter] = useState("all");

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "all" || course.category === categoryFilter;
    const matchesDifficulty = difficultyFilter === "all" || course.difficulty_level === difficultyFilter;
    
    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  const categories = [...new Set(courses.map(course => course.category).filter(Boolean))];

  const getDifficultyColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDifficultyText = (level: string) => {
    switch (level) {
      case 'beginner': return 'Iniciante';
      case 'intermediate': return 'Intermediário';
      case 'advanced': return 'Avançado';
      default: return level;
    }
  };

  const calculateCompletionRate = (course: any) => {
    if (course.enrolled_students === 0) return 0;
    return Math.round((course.completed_students / course.enrolled_students) * 100);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col h-full">
        <header className="border-b bg-white px-6 py-4">
          <div className="flex items-center space-x-4">
            <SidebarTrigger />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Cursos Disponíveis</h1>
              <p className="text-gray-600">Carregando cursos...</p>
            </div>
          </div>
        </header>
        <div className="flex-1 p-6 bg-gray-50">
          <div className="animate-pulse grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1,2,3,4,5,6].map((i) => (
              <div key={i} className="h-64 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col h-full">
        <header className="border-b bg-white px-6 py-4">
          <div className="flex items-center space-x-4">
            <SidebarTrigger />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Cursos Disponíveis</h1>
              <p className="text-gray-600">Erro ao carregar cursos</p>
            </div>
          </div>
        </header>
        <div className="flex-1 p-6 bg-gray-50 flex items-center justify-center">
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-red-500 mb-4">Erro ao carregar cursos</p>
              <Button onClick={() => window.location.reload()}>Tentar Novamente</Button>
            </CardContent>
          </Card>
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
              <h1 className="text-2xl font-bold text-gray-900">Cursos Disponíveis</h1>
              <p className="text-gray-600">
                Explore nosso catálogo de {courses.length} cursos disponíveis
              </p>
            </div>
          </div>
          <Button asChild>
            <Link to="/company/course-progress">
              <TrendingUp className="h-4 w-4 mr-2" />
              Ver Progresso dos Colaboradores
            </Link>
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-auto p-6 bg-gray-50">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Filtros */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Filter className="h-5 w-5 mr-2" />
                Filtros de Busca
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Buscar cursos..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as categorias</SelectItem>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Dificuldade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as dificuldades</SelectItem>
                    <SelectItem value="beginner">Iniciante</SelectItem>
                    <SelectItem value="intermediate">Intermediário</SelectItem>
                    <SelectItem value="advanced">Avançado</SelectItem>
                  </SelectContent>
                </Select>

                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSearchTerm("");
                    setCategoryFilter("all");
                    setDifficultyFilter("all");
                  }}
                >
                  Limpar Filtros
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Lista de Cursos */}
          {filteredCourses.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredCourses.map((course) => (
                <Card key={course.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    {course.thumbnail_url && (
                      <img 
                        src={course.thumbnail_url} 
                        alt={course.title}
                        className="w-full h-40 object-cover rounded-md mb-4"
                      />
                    )}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Badge className={getDifficultyColor(course.difficulty_level)}>
                          {getDifficultyText(course.difficulty_level)}
                        </Badge>
                        {course.category && (
                          <Badge variant="outline">{course.category}</Badge>
                        )}
                      </div>
                      <CardTitle className="text-lg">{course.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {course.description && (
                      <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                        {course.description}
                      </p>
                    )}
                    
                    <div className="grid grid-cols-2 gap-4 mb-4 text-sm text-gray-600">
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-2" />
                        {course.enrolled_students} matriculados
                      </div>
                      {course.estimated_hours && (
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-2" />
                          {course.estimated_hours}h de duração
                        </div>
                      )}
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Taxa de conclusão:</span>
                        <div className="flex items-center">
                          <GraduationCap className="h-4 w-4 mr-1 text-green-600" />
                          <span className="font-medium">{calculateCompletionRate(course)}%</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <span>{course.completed_students} colaboradores concluíram</span>
                      </div>

                      <Button className="w-full" size="sm">
                        <Eye className="h-4 w-4 mr-2" />
                        Ver Progresso dos Colaboradores
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <BookOpen className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Nenhum curso encontrado
                </h3>
                <p className="text-gray-600">
                  Tente ajustar os filtros para encontrar cursos disponíveis
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default CompanyCourses;
