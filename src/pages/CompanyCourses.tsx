import { PageLayout } from "@/components/PageLayout";
import { PageSection } from "@/components/PageSection";
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
      case 'beginner': return 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white border-0';
      case 'intermediate': return 'bg-gradient-to-r from-orange-600 to-amber-600 text-white border-0';
      case 'advanced': return 'bg-gradient-to-r from-red-600 to-pink-600 text-white border-0';
      default: return 'bg-gray-700 text-gray-300 border-gray-600';
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

  // Header content com botão de ver progresso
  const headerContent = (
    <Button className="bg-gray-800 hover:bg-gray-700 text-white border border-gray-600 hover:border-gray-500 shadow-lg">
      <Link to="/company/course-progress" className="flex items-center">
        <TrendingUp className="h-4 w-4 mr-2" />
        Ver Progresso dos Colaboradores
      </Link>
    </Button>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        <div className="container mx-auto px-6 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-500 to-yellow-500 bg-clip-text text-transparent">
              Cursos Disponíveis
            </h1>
            <p className="text-gray-400 mt-2">Carregando cursos...</p>
          </div>
          <div className="animate-pulse grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1,2,3,4,5,6].map((i) => (
              <div key={i} className="h-64 bg-gray-800 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        <div className="container mx-auto px-6 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-500 to-yellow-500 bg-clip-text text-transparent">
              Cursos Disponíveis
            </h1>
            <p className="text-gray-400 mt-2">Erro ao carregar cursos</p>
          </div>
          <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/30 shadow-2xl rounded-lg p-8 text-center">
            <p className="text-red-400 mb-4">Erro ao carregar cursos</p>
            <Button 
              onClick={() => window.location.reload()}
              className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white"
            >
              Tentar Novamente
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-500 to-yellow-500 bg-clip-text text-transparent">
              Cursos Disponíveis
            </h1>
            <p className="text-gray-400 mt-2">
              Explore nosso catálogo de {courses.length} cursos disponíveis
            </p>
          </div>
          {headerContent}
        </div>

        <div className="space-y-6">
          {/* Filtros */}
          <Card className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/30 shadow-2xl">
            <CardHeader>
              <CardTitle className="flex items-center text-white">
                <Filter className="h-5 w-5 mr-2 text-orange-400" />
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
                    className="pl-10 bg-gray-700/50 border-gray-600 text-white placeholder-gray-400 focus:border-orange-500 focus:ring-orange-500"
                  />
                </div>
                
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="bg-gray-700/50 border-gray-600 text-white focus:border-orange-500 focus:ring-orange-500">
                    <SelectValue placeholder="Categoria" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-600">
                    <SelectItem value="all" className="text-white hover:bg-gray-700">Todas as categorias</SelectItem>
                    {categories.map(category => (
                      <SelectItem key={category} value={category} className="text-white hover:bg-gray-700">
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
                  <SelectTrigger className="bg-gray-700/50 border-gray-600 text-white focus:border-orange-500 focus:ring-orange-500">
                    <SelectValue placeholder="Dificuldade" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-600">
                    <SelectItem value="all" className="text-white hover:bg-gray-700">Todas as dificuldades</SelectItem>
                    <SelectItem value="beginner" className="text-white hover:bg-gray-700">Iniciante</SelectItem>
                    <SelectItem value="intermediate" className="text-white hover:bg-gray-700">Intermediário</SelectItem>
                    <SelectItem value="advanced" className="text-white hover:bg-gray-700">Avançado</SelectItem>
                  </SelectContent>
                </Select>

                <Button 
                  onClick={() => {
                    setSearchTerm("");
                    setCategoryFilter("all");
                    setDifficultyFilter("all");
                  }}
                  className="bg-gray-700/50 border-gray-600 text-gray-300 hover:bg-gray-600 hover:text-white hover:border-gray-500 transition-all duration-200"
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
                <Card key={course.id} className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/30 shadow-2xl hover:shadow-orange-500/10 transition-all duration-300">
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
                          <Badge variant="outline" className="bg-gray-700/50 text-gray-300 border-gray-600">
                            {course.category}
                          </Badge>
                        )}
                      </div>
                      <CardTitle className="text-lg text-white">{course.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {course.description && (
                      <p className="text-gray-300 text-sm mb-4 line-clamp-3">
                        {course.description}
                      </p>
                    )}
                    
                    <div className="grid grid-cols-2 gap-4 mb-4 text-sm text-gray-400">
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-2 text-orange-400" />
                        {course.enrolled_students} matriculados
                      </div>
                      {course.estimated_hours && (
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-2 text-orange-400" />
                          {course.estimated_hours}h de duração
                        </div>
                      )}
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">Taxa de conclusão:</span>
                        <div className="flex items-center">
                          <GraduationCap className="h-4 w-4 mr-1 text-emerald-400" />
                          <span className="font-medium text-emerald-400">{calculateCompletionRate(course)}%</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm text-gray-400">
                        <span>{course.completed_students} colaboradores concluíram</span>
                      </div>

                      <Button 
                        className="w-full bg-gradient-to-r from-orange-600 to-yellow-600 hover:from-orange-500 hover:to-yellow-500 text-white border-0 shadow-lg" 
                        size="sm"
                        asChild
                      >
                        <Link to="/company/course-progress">
                          <Eye className="h-4 w-4 mr-2" />
                          Ver Progresso dos Colaboradores
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/30 shadow-2xl">
              <CardContent>
                <div className="text-center py-12">
                  <BookOpen className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-white mb-2">
                    Nenhum curso encontrado
                  </h3>
                  <p className="text-gray-400">
                    Tente ajustar os filtros para encontrar cursos disponíveis
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default CompanyCourses;
