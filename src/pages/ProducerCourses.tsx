import { useState, useEffect } from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Search, Filter, BookOpen, Users, Clock, TrendingUp } from "lucide-react";
import { useCourses, useDeleteCourse, Course } from "@/hooks/useCourses";
import { useAuth } from "@/hooks/useAuth";
import { CreateCourseDialog } from "@/components/CreateCourseDialog";
import { CourseCard } from "@/components/CourseCard";

const ProducerCourses = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [difficultyFilter, setDifficultyFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);

  const { user, userRole, loading } = useAuth();
  const { data: courses = [], isLoading: coursesLoading, error: coursesError, refetch: refetchCourses } = useCourses();
  const deleteCourse = useDeleteCourse();

  // Debug logging
  useEffect(() => {
    console.log('ProducerCourses - Auth state:', { 
      user: user?.email, 
      userId: user?.id,
      userRole, 
      loading 
    });
    console.log('ProducerCourses - Courses data:', courses);
    console.log('ProducerCourses - Courses loading:', coursesLoading);
    console.log('ProducerCourses - Courses error:', coursesError);
  }, [user, userRole, loading, courses, coursesLoading, coursesError]);

  const handleEditCourse = (course: Course) => {
    setEditingCourse(course);
    setCreateDialogOpen(true);
  };

  const handleDeleteCourse = async (courseId: string) => {
    if (window.confirm("Tem certeza que deseja excluir este curso?")) {
      await deleteCourse.mutateAsync(courseId);
    }
  };

  const handleViewCourse = (courseId: string) => {
    // Implementar navegação para página de detalhes do curso
    console.log("Visualizar curso:", courseId);
  };

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="flex flex-col h-full">
        <header className="border-b bg-white px-6 py-4">
          <div className="flex items-center space-x-4">
            <SidebarTrigger />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Gerenciar Cursos</h1>
              <p className="text-gray-600">Verificando permissões...</p>
            </div>
          </div>
        </header>
        <div className="flex-1 overflow-auto p-6 bg-gray-50">
          <div className="animate-pulse space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1,2,3,4].map((i) => (
                <div key={i} className="bg-gray-200 h-24 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show access denied if user is not a producer
  if (!user || userRole !== 'producer') {
    return (
      <div className="flex flex-col h-full">
        <header className="border-b bg-white px-6 py-4">
          <div className="flex items-center space-x-4">
            <SidebarTrigger />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Acesso Negado</h1>
              <p className="text-gray-600">Você não tem permissão para acessar esta área.</p>
            </div>
          </div>
        </header>
        <div className="flex-1 overflow-auto p-6 bg-gray-50">
          <Card>
            <CardContent className="p-12 text-center">
              <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Acesso Restrito</h3>
              <p className="text-muted-foreground mb-4">
                Esta área é exclusiva para produtores de conteúdo.
              </p>
              <p className="text-sm text-muted-foreground">
                Seu perfil atual: {userRole || 'Não definido'}
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Usuário: {user?.email || 'Não logado'}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Show error state if there's an issue loading courses
  if (coursesError) {
    return (
      <div className="flex flex-col h-full">
        <header className="border-b bg-white px-6 py-4">
          <div className="flex items-center space-x-4">
            <SidebarTrigger />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Gerenciar Cursos</h1>
              <p className="text-gray-600">Erro ao carregar cursos</p>
            </div>
          </div>
        </header>
        <div className="flex-1 overflow-auto p-6 bg-gray-50">
          <Card>
            <CardContent className="p-12 text-center">
              <BookOpen className="h-12 w-12 mx-auto text-red-500 mb-4" />
              <h3 className="text-lg font-medium mb-2 text-red-700">Erro ao Carregar Cursos</h3>
              <p className="text-muted-foreground mb-4">
                {coursesError.message || 'Ocorreu um erro inesperado'}
              </p>
              <Button onClick={() => refetchCourses()} variant="outline">
                Tentar Novamente
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const filteredCourses = courses.filter((course) => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = categoryFilter === "all" || course.category === categoryFilter;
    const matchesDifficulty = difficultyFilter === "all" || course.difficulty_level === difficultyFilter;
    const matchesStatus = statusFilter === "all" || 
                         (statusFilter === "published" && course.is_published) ||
                         (statusFilter === "draft" && !course.is_published);

    return matchesSearch && matchesCategory && matchesDifficulty && matchesStatus;
  });

  const stats = {
    total: courses.length,
    published: courses.filter(c => c.is_published).length,
    draft: courses.filter(c => !c.is_published).length,
    totalHours: courses.reduce((acc, c) => acc + (c.estimated_hours || 0), 0),
  };

  const categories = Array.from(new Set(courses.map(c => c.category).filter(Boolean)));

  if (coursesLoading) {
    return (
      <div className="flex flex-col h-full">
        <header className="border-b bg-white px-6 py-4">
          <div className="flex items-center space-x-4">
            <SidebarTrigger />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Gerenciar Cursos</h1>
              <p className="text-gray-600">Carregando cursos...</p>
            </div>
          </div>
        </header>
        <div className="flex-1 overflow-auto p-6 bg-gray-50">
          <div className="animate-pulse space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1,2,3,4].map((i) => (
                <div key={i} className="bg-gray-200 h-24 rounded-lg"></div>
              ))}
            </div>
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
              <h1 className="text-2xl font-bold text-gray-900">Gerenciar Cursos</h1>
              <p className="text-gray-600">Crie e gerencie os cursos da plataforma</p>
            </div>
          </div>
          <Button 
            onClick={() => {
              setEditingCourse(null);
              setCreateDialogOpen(true);
            }}
            className="bg-gradient-to-r from-calmon-500 to-calmon-700 hover:from-calmon-600 hover:to-calmon-800 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Novo Curso
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-auto p-6 bg-gray-50">
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="hover-lift">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total de Cursos</p>
                    <p className="text-2xl font-bold">{stats.total}</p>
                  </div>
                  <BookOpen className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="hover-lift">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Cursos Publicados</p>
                    <p className="text-2xl font-bold">{stats.published}</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="hover-lift">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Rascunhos</p>
                    <p className="text-2xl font-bold">{stats.draft}</p>
                  </div>
                  <Users className="h-8 w-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="hover-lift">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total de Horas</p>
                    <p className="text-2xl font-bold">{stats.totalHours}</p>
                  </div>
                  <Clock className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters and Search */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar cursos..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="flex gap-4">
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas as categorias</SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category!}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Dificuldade" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas</SelectItem>
                      <SelectItem value="beginner">Iniciante</SelectItem>
                      <SelectItem value="intermediate">Intermediário</SelectItem>
                      <SelectItem value="advanced">Avançado</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="published">Publicados</SelectItem>
                      <SelectItem value="draft">Rascunhos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Courses Grid */}
          {filteredCourses.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Nenhum curso encontrado</h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm || categoryFilter !== "all" || difficultyFilter !== "all" || statusFilter !== "all"
                    ? "Tente ajustar os filtros de busca."
                    : "Comece criando seu primeiro curso."}
                </p>
                {!searchTerm && categoryFilter === "all" && difficultyFilter === "all" && statusFilter === "all" && (
                  <Button 
                    onClick={() => setCreateDialogOpen(true)}
                    className="bg-gradient-to-r from-calmon-500 to-calmon-700 hover:from-calmon-600 hover:to-calmon-800 text-white"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Criar Primeiro Curso
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCourses.map((course) => (
                <CourseCard
                  key={course.id}
                  course={course}
                  onEdit={handleEditCourse}
                  onDelete={handleDeleteCourse}
                  onView={handleViewCourse}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <CreateCourseDialog 
        isOpen={createDialogOpen} 
        onClose={() => {
          setCreateDialogOpen(false);
          setEditingCourse(null);
        }}
        course={editingCourse}
      />
    </div>
  );
};

export default ProducerCourses;
