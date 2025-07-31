import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { PageLayout } from "@/components/PageLayout";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, BookOpen } from "lucide-react";
import { useCourse } from "@/hooks/useCourses";
import { useCourseModules } from "@/hooks/useCourseModules";
import { CreateModuleDialog } from "@/components/CreateModuleDialog";
import { CreateLessonDialog } from "@/components/CreateLessonDialog";
import { CourseDetailsHeader } from "@/components/CourseDetailsHeader";
import { CourseInfoCard } from "@/components/CourseInfoCard";
import { ModulesTabContent } from "@/components/ModulesTabContent";
import { LessonsTabContent } from "@/components/LessonsTabContent";

const CourseDetails = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const [createModuleOpen, setCreateModuleOpen] = useState(false);
  const [createLessonOpen, setCreateLessonOpen] = useState(false);
  const [editingModule, setEditingModule] = useState<any>(null);
  const [editingLesson, setEditingLesson] = useState<any>(null);
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);

  console.log('📊📊📊 Estados do CourseDetails 📊📊📊');
  console.log('createLessonOpen:', createLessonOpen);
  console.log('editingLesson:', editingLesson);
  console.log('selectedModuleId:', selectedModuleId);
  console.log('📊📊📊 FIM Estados 📊📊📊');

  const { data: course, isLoading: courseLoading } = useCourse(courseId!);
  const { data: modules = [], isLoading: modulesLoading, refetch: refetchModules } = useCourseModules(courseId!);

  if (courseLoading || modulesLoading) {
    return (
      <PageLayout
        title="Carregando..."
        subtitle="Aguarde enquanto carregamos os detalhes do curso"
        background="gradient"
      >
        <div className="animate-pulse space-y-6">
          <div className="h-32 bg-gray-200 rounded-lg"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1,2,3,4].map((i) => (
              <div key={i} className="h-24 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </PageLayout>
    );
  }

  if (!course) {
    return (
      <PageLayout
        title="Curso não encontrado"
        subtitle="O curso solicitado não foi encontrado ou você não tem permissão para acessá-lo"
        background="gradient"
        headerContent={
          <Button variant="ghost" size="sm" onClick={() => navigate('/producer/courses')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
        }
      >
        <Card>
          <CardContent className="p-12 text-center">
            <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Curso não encontrado</h3>
            <p className="text-muted-foreground">
              O curso solicitado não foi encontrado ou você não tem permissão para acessá-lo.
            </p>
          </CardContent>
        </Card>
      </PageLayout>
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
    setEditingModule(module);
    setCreateModuleOpen(true);
  };

  const handleEditLesson = (lesson: any) => {
    console.log('🔥🔥🔥 EDITANDO AULA 🔥🔥🔥');
    console.log('Lesson to edit:', lesson);
    console.log('Lesson title:', lesson?.title);
    console.log('Lesson duration_minutes:', lesson?.duration_minutes);
    console.log('Lesson bunny_video_id:', lesson?.bunny_video_id);
    console.log('Lesson module_id:', lesson?.module_id);
    console.log('Lesson id:', lesson?.id);
    console.log('Lesson keys:', Object.keys(lesson || {}));
    console.log('🔥🔥🔥 FIM EDITANDO AULA 🔥🔥🔥');
    
    if (!lesson?.module_id) {
      console.error('❌ ERRO: lesson.module_id é null ou undefined');
      return;
    }
    
    console.log('🔧🔧🔧 CONFIGURANDO ESTADOS 🔧🔧🔧');
    console.log('Antes - selectedModuleId:', selectedModuleId);
    console.log('Antes - editingLesson:', editingLesson);
    console.log('Antes - createLessonOpen:', createLessonOpen);
    
    setSelectedModuleId(lesson.module_id);
    setEditingLesson(lesson);
    setCreateLessonOpen(true);
    
    console.log('🔧🔧🔧 ESTADOS CONFIGURADOS 🔧🔧🔧');
  };

  const handleCreateModule = () => {
    setEditingModule(null);
    setCreateModuleOpen(true);
  };

  const handleNavigateBack = () => {
    navigate('/producer/courses');
  };

  return (
    <PageLayout
      title={course.title}
      subtitle={course.description}
      background="gradient"
      headerContent={
        <Button variant="ghost" size="sm" onClick={handleNavigateBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
      }
    >
      <div className="space-y-6">
        <CourseInfoCard course={course} modules={modules} />

        <Tabs defaultValue="modules" className="w-full">
          <TabsList>
            <TabsTrigger value="modules">Módulos</TabsTrigger>
            <TabsTrigger value="lessons">Todas as Aulas</TabsTrigger>
          </TabsList>
          
          <TabsContent value="modules" className="space-y-4">
            <ModulesTabContent 
              modules={modules}
              onCreateModule={handleCreateModule}
              onEditModule={handleEditModule}
              onCreateLesson={handleCreateLesson}
            />
          </TabsContent>
          
          <TabsContent value="lessons" className="space-y-4">
            <LessonsTabContent 
              modules={modules}
              onEditLesson={handleEditLesson}
              onCreateLesson={handleCreateLesson}
            />
          </TabsContent>
        </Tabs>
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
        isOpen={createLessonOpen && !!selectedModuleId}
        onClose={() => {
          setCreateLessonOpen(false);
          setEditingLesson(null);
          setSelectedModuleId(null);
        }}
        moduleId={selectedModuleId || ''}
        lesson={editingLesson}
      />
    </PageLayout>
  );
};

export default CourseDetails;
