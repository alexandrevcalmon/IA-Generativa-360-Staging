
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, BookOpen, AlertCircle } from "lucide-react";
import { useCourse } from "@/hooks/useCourses";
import { useCourseModules } from "@/hooks/useCourseModules";
import { useAuth } from "@/hooks/auth";
import { CreateModuleDialog } from "@/components/CreateModuleDialog";
import { CreateLessonDialog } from "@/components/CreateLessonDialog";
import { CourseDetailsHeader } from "@/components/CourseDetailsHeader";
import { CourseInfoCard } from "@/components/CourseInfoCard";
import { ModulesTabContent } from "@/components/ModulesTabContent";
import { LessonsTabContent } from "@/components/LessonsTabContent";

const ProducerCourseDetails = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { user, userRole, loading: authLoading } = useAuth();
  
  const [createModuleOpen, setCreateModuleOpen] = useState(false);
  const [createLessonOpen, setCreateLessonOpen] = useState(false);
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);
  const [editingModule, setEditingModule] = useState(null);
  const [editingLesson, setEditingLesson] = useState(null);

  const { data: course, isLoading: courseLoading, error: courseError } = useCourse(courseId!);
  const { data: modules = [], isLoading: modulesLoading } = useCourseModules(courseId!);

  console.log('📚 ProducerCourseDetails: Component state', {
    courseId,
    user: user?.email,
    userRole,
    authLoading,
    courseLoading,
    courseError: courseError?.message,
    courseExists: !!course
  });

  // Show auth loading state
  if (authLoading) {
    return (
      <div className="flex flex-col h-full">
        <header className="border-b border-gray-700 bg-gray-900 px-6 py-6">
          <div className="flex items-center space-x-4">
            <SidebarTrigger />
            <div>
              <h1 className="text-2xl font-bold text-white">Verificando permissões...</h1>
            </div>
          </div>
        </header>
        <div className="flex-1 overflow-auto p-6 bg-gray-900">
          <div className="animate-pulse space-y-6">
            <div className="h-32 bg-gray-800 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  // Show permission error for non-producers
  if (userRole !== 'producer') {
    return (
      <div className="flex flex-col h-full">
        <header className="border-b border-gray-700 bg-gray-900 px-6 py-6">
          <div className="flex items-center space-x-4">
            <SidebarTrigger />
            <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="text-gray-300 hover:text-white hover:bg-gray-700">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
          </div>
        </header>
        <div className="flex-1 overflow-auto p-6 bg-gray-900">
          <Card className="bg-gray-800/50 border-gray-700">
            <CardContent className="p-12 text-center">
              <div className="p-3 bg-gradient-to-r from-red-500 to-pink-500 rounded-lg w-fit mx-auto mb-4">
                <AlertCircle className="h-12 w-12 text-white" />
              </div>
              <h3 className="text-lg font-medium mb-2 text-white">Acesso Negado</h3>
              <p className="text-gray-300 mb-4">
                Você não tem permissão para acessar esta página. Apenas produtores podem gerenciar cursos.
              </p>
              <p className="text-sm text-gray-400 mb-4">
                Seu perfil atual: {userRole || 'indefinido'}
              </p>
              <Button 
                onClick={() => navigate(-1)}
                className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white shadow-lg border-0"
              >
                Voltar
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Show course loading state
  if (courseLoading || modulesLoading) {
    return (
      <div className="flex flex-col h-full">
        <header className="border-b border-gray-700 bg-gray-900 px-6 py-6">
          <div className="flex items-center space-x-4">
            <SidebarTrigger />
            <div>
              <h1 className="text-2xl font-bold text-white">Carregando curso...</h1>
            </div>
          </div>
        </header>
        <div className="flex-1 overflow-auto p-6 bg-gray-900">
          <div className="animate-pulse space-y-6">
            <div className="h-32 bg-gray-800 rounded-lg"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1,2,3,4].map((i) => (
                <div key={i} className="h-24 bg-gray-800 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show course not found error
  if (courseError || !course) {
    console.error('📚 ProducerCourseDetails: Course not found', { courseId, courseError });
    
    return (
      <div className="flex flex-col h-full">
        <header className="border-b border-gray-700 bg-gray-900 px-6 py-6">
          <div className="flex items-center space-x-4">
            <SidebarTrigger />
            <Button variant="ghost" size="sm" onClick={() => navigate('/producer/courses')} className="text-gray-300 hover:text-white hover:bg-gray-700">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
          </div>
        </header>
        <div className="flex-1 overflow-auto p-6 bg-gray-900">
          <Card className="bg-gray-800/50 border-gray-700">
            <CardContent className="p-12 text-center">
              <div className="p-3 bg-gradient-to-r from-gray-500 to-gray-600 rounded-lg w-fit mx-auto mb-4">
                <BookOpen className="h-12 w-12 text-white" />
              </div>
              <h3 className="text-lg font-medium mb-2 text-white">Curso não encontrado</h3>
              <p className="text-gray-300 mb-4">
                O curso solicitado não foi encontrado ou você não tem permissão para acessá-lo.
              </p>
              <p className="text-sm text-gray-400 mb-4">
                ID do curso: {courseId}
              </p>
              <Button 
                onClick={() => navigate('/producer/courses')}
                className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white shadow-lg border-0"
              >
                Ver todos os cursos
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const handleCreateLesson = (moduleId: string) => {
    if (!moduleId) {
      console.error('❌ ERRO: moduleId é vazio ou undefined no handleCreateLesson');
      return;
    }
    console.log('✅ handleCreateLesson chamado com moduleId:', moduleId);
    setSelectedModuleId(moduleId);
    setEditingLesson(null);
    setCreateLessonOpen(true);
  };

  const handleEditModule = (module: any) => {
    console.log('🔧🔧🔧 handleEditModule executado 🔧🔧🔧');
    console.log('module recebido:', module);
    console.log('module.title:', module?.title);
    console.log('module.description:', module?.description);
    console.log('module.order_index:', module?.order_index);
    console.log('module.is_published:', module?.is_published);
    console.log('module.image_url:', module?.image_url);
    
    setEditingModule(module);
    setCreateModuleOpen(true);
    
    console.log('🔧🔧🔧 Estados configurados 🔧🔧🔧');
    console.log('editingModule definido como:', module);
    console.log('createModuleOpen definido como: true');
  };

  const handleEditLesson = (lesson: any) => {
    setSelectedModuleId(lesson.module_id);
    setEditingLesson(lesson);
    setCreateLessonOpen(true);
  };

  const handleCreateModule = () => {
    setEditingModule(null);
    setCreateModuleOpen(true);
  };

  const handleNavigateBack = () => {
    navigate('/producer/courses');
  };

  console.log('📚 ProducerCourseDetails: Rendering course details', {
    courseTitle: course.title,
    modulesCount: modules.length
  });

  return (
    <div className="flex flex-col h-full">
      <CourseDetailsHeader 
        course={course}
        onNavigateBack={handleNavigateBack}
        onCreateModule={handleCreateModule}
      />

      <div className="flex-1 overflow-auto p-6 bg-gray-900">
        <div className="space-y-6">
          <CourseInfoCard course={course} modules={modules} />

          <Tabs defaultValue="modules" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-gray-800 border-gray-700">
              <TabsTrigger value="modules" className="data-[state=active]:bg-gray-700 data-[state=active]:text-white text-gray-300">
                Módulos
              </TabsTrigger>
              <TabsTrigger value="lessons" className="data-[state=active]:bg-gray-700 data-[state=active]:text-white text-gray-300">
                Todas as Aulas
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="modules" className="mt-6">
              <ModulesTabContent
                modules={modules}
                onCreateLesson={handleCreateLesson}
                onEditModule={handleEditModule}
                onEditLesson={handleEditLesson}
              />
            </TabsContent>
            
            <TabsContent value="lessons" className="mt-6">
              <LessonsTabContent
                modules={modules}
                onCreateLesson={handleCreateLesson}
                onEditLesson={handleEditLesson}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <CreateModuleDialog
        isOpen={createModuleOpen}
        onClose={() => {
          setCreateModuleOpen(false);
          setEditingModule(null);
        }}
        courseId={courseId!}
        module={editingModule}
      />

      <CreateLessonDialog
        isOpen={createLessonOpen}
        onClose={() => {
          setCreateLessonOpen(false);
          setSelectedModuleId(null);
          setEditingLesson(null);
        }}
        moduleId={selectedModuleId || ''}
        lesson={editingLesson}
      />
    </div>
  );
};

export default ProducerCourseDetails;
