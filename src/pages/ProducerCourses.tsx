import { useState, useEffect } from "react";
import { PageLayout } from "@/components/PageLayout";
import { PageSection } from "@/components/PageSection";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Search, BookOpen, Users, Clock, TrendingUp } from "lucide-react";
import { useCourses, useDeleteCourse, Course } from "@/hooks/useCourses";
import { useAuth } from "@/hooks/useAuth";
import { CreateCourseDialog } from "@/components/CreateCourseDialog";
import { CourseCard } from "@/components/CourseCard";
import { StatsGrid, type StatItem } from "@/components/StatsGrid";

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

  // Header content com botão de criar curso
  const headerContent = (
    <Button 
      onClick={() => {
        setEditingCourse(null);
        setCreateDialogOpen(true);
      }}
      className="!bg-gradient-to-r !from-orange-500 !to-red-600 hover:!from-orange-600 hover:!to-red-700 !text-white !border-0 !shadow-lg"
    >
      <Plus className="h-4 w-4 mr-2" />
      Novo Curso
    </Button>
  );

  // Show loading state while checking authentication
  if (loading) {
    return (
      <PageLayout
        title="Gerenciar Cursos"
        subtitle="Verificando permissões..."
        background="dark"
        className="dark-theme-override"
      >
        <div className="animate-pulse space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1,2,3,4].map((i) => (
              <div key={i} className="bg-gray-800 h-24 rounded-lg"></div>
            ))}
          </div>
        </div>
      </PageLayout>
    );
  }

  // Show access denied if user is not a producer
  if (!user || userRole !== 'producer') {
    return (
      <PageLayout
        title="Acesso Negado"
        subtitle="Você não tem permissão para acessar esta área."
        background="dark"
        className="dark-theme-override"
      >
        <PageSection>
          <div className="p-12 text-center">
            <div className="p-3 bg-gradient-to-r from-red-500 to-pink-500 rounded-lg w-fit mx-auto mb-4">
              <BookOpen className="h-12 w-12 text-white" />
            </div>
            <h3 className="text-lg font-medium mb-2 text-white">Acesso Restrito</h3>
            <p className="text-gray-300 mb-4">
              Esta área é exclusiva para produtores de conteúdo.
            </p>
            <p className="text-sm text-gray-400">
              Seu perfil atual: {userRole || 'Não definido'}
            </p>
            <p className="text-sm text-gray-400 mt-2">
              Usuário: {user?.email || 'Não logado'}
            </p>
          </div>
        </PageSection>
      </PageLayout>
    );
  }

  // Show error state if there's an issue loading courses
  if (coursesError) {
    return (
      <PageLayout
        title="Gerenciar Cursos"
        subtitle="Erro ao carregar cursos"
        background="dark"
        className="dark-theme-override"
      >
        <PageSection>
          <div className="p-12 text-center">
            <div className="p-3 bg-gradient-to-r from-red-500 to-pink-500 rounded-lg w-fit mx-auto mb-4">
              <BookOpen className="h-12 w-12 text-white" />
            </div>
            <h3 className="text-lg font-medium mb-2 text-red-400">Erro ao Carregar Cursos</h3>
            <p className="text-gray-300 mb-4">
              {coursesError.message || 'Ocorreu um erro inesperado'}
            </p>
            <Button 
              onClick={() => refetchCourses()} 
              className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white shadow-lg border-0"
            >
              Tentar Novamente
            </Button>
          </div>
        </PageSection>
      </PageLayout>
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

  // Stats para o StatsGrid
  const statsItems: StatItem[] = [
    {
      title: "Total de Cursos",
      value: stats.total,
      icon: BookOpen,
      color: "text-blue-400",
      bgColor: "bg-blue-500/20",
    },
    {
      title: "Cursos Publicados",
      value: stats.published,
      icon: TrendingUp,
      color: "text-green-400",
      bgColor: "bg-green-500/20",
    },
    {
      title: "Rascunhos",
      value: stats.draft,
      icon: Users,
      color: "text-orange-400",
      bgColor: "bg-orange-500/20",
    },
    {
      title: "Total de Horas",
      value: stats.totalHours,
      icon: Clock,
      color: "text-purple-400",
      bgColor: "bg-purple-500/20",
    },
  ];

  if (coursesLoading) {
    return (
      <PageLayout
        title="Gerenciar Cursos"
        subtitle="Carregando cursos..."
        background="dark"
        className="dark-theme-override"
      >
        <div className="animate-pulse space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1,2,3,4].map((i) => (
              <div key={i} className="bg-gray-800 h-24 rounded-lg"></div>
            ))}
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      title="Gerenciar Cursos"
      subtitle="Crie e gerencie os cursos da plataforma"
      headerContent={headerContent}
      background="dark"
      className="dark-theme-override"
    >
      <div className="space-y-6">
        {/* Stats Grid */}
        <StatsGrid stats={statsItems} />

        {/* Filters and Search */}
        <PageSection>
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar cursos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-gray-900/50 border-gray-700 text-white placeholder:text-gray-400 focus:border-orange-500 focus:ring-orange-500"
                />
              </div>
            </div>

            <div className="flex gap-4">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-40 bg-gray-900/50 border-gray-700 text-white">
                  <SelectValue placeholder="Categoria" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  <SelectItem value="all" className="text-gray-300 hover:text-white hover:bg-gray-700">Todas as categorias</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category} className="text-gray-300 hover:text-white hover:bg-gray-700">
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
                <SelectTrigger className="w-40 bg-gray-900/50 border-gray-700 text-white">
                  <SelectValue placeholder="Dificuldade" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  <SelectItem value="all" className="text-gray-300 hover:text-white hover:bg-gray-700">Todas</SelectItem>
                  <SelectItem value="beginner" className="text-gray-300 hover:text-white hover:bg-gray-700">Iniciante</SelectItem>
                  <SelectItem value="intermediate" className="text-gray-300 hover:text-white hover:bg-gray-700">Intermediário</SelectItem>
                  <SelectItem value="advanced" className="text-gray-300 hover:text-white hover:bg-gray-700">Avançado</SelectItem>
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40 bg-gray-900/50 border-gray-700 text-white">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  <SelectItem value="all" className="text-gray-300 hover:text-white hover:bg-gray-700">Todos</SelectItem>
                  <SelectItem value="published" className="text-gray-300 hover:text-white hover:bg-gray-700">Publicados</SelectItem>
                  <SelectItem value="draft" className="text-gray-300 hover:text-white hover:bg-gray-700">Rascunhos</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </PageSection>

        {/* Courses Grid */}
        <PageSection>
          {filteredCourses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCourses.map((course) => (
                <CourseCard
                  key={course.id}
                  course={course}
                  onEdit={() => handleEditCourse(course)}
                  onDelete={() => handleDeleteCourse(course.id)}
                  onView={() => handleViewCourse(course.id)}
                  isDeleting={deleteCourse.isPending && deleteCourse.variables === course.id}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <BookOpen className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-300 mb-2">Nenhum curso encontrado</h3>
              <p className="text-gray-400 mb-4">
                {searchTerm || categoryFilter !== "all" || difficultyFilter !== "all" || statusFilter !== "all"
                  ? "Tente ajustar os filtros de busca."
                  : "Crie seu primeiro curso para começar."}
              </p>
              {!searchTerm && categoryFilter === "all" && difficultyFilter === "all" && statusFilter === "all" && (
                <Button 
                  onClick={() => {
                    setEditingCourse(null);
                    setCreateDialogOpen(true);
                  }}
                  className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white shadow-lg border-0"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Primeiro Curso
                </Button>
              )}
            </div>
          )}
        </PageSection>
      </div>

      <CreateCourseDialog
        isOpen={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        editingCourse={editingCourse}
      />
    </PageLayout>
  );
};

export default ProducerCourses;
