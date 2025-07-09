import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);
  const [editingModule, setEditingModule] = useState(null);
  const [editingLesson, setEditingLesson] = useState(null);

  const { data: course, isLoading: courseLoading } = useCourse(courseId!);
  const { data: modules = [], isLoading: modulesLoading } = useCourseModules(courseId!);

  if (courseLoading || modulesLoading) {
    return (
      <div className="flex flex-col h-full">
        <header className="border-b bg-white px-6 py-4">
          <div className="flex items-center space-x-4">
            <SidebarTrigger />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Carregando...</h1>
            </div>
          </div>
        </header>
        <div className="flex-1 overflow-auto p-6 bg-gray-50">
          <div className="animate-pulse space-y-6">
            <div className="h-32 bg-gray-200 rounded-lg"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1,2,3,4].map((i) => (
                <div key={i} className="h-24 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex flex-col h-full">
        <header className="border-b bg-white px-6 py-4">
          <div className="flex items-center space-x-4">
            <SidebarTrigger />
            <Button variant="ghost" size="sm" onClick={() => navigate('/producer/courses')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
          </div>
        </header>
        <div className="flex-1 overflow-auto p-6 bg-gray-50">
          <Card>
            <CardContent className="p-12 text-center">
              <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Curso não encontrado</h3>
              <p className="text-muted-foreground">
                O curso solicitado não foi encontrado ou você não tem permissão para acessá-lo.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const handleCreateLesson = (moduleId: string) => {
    setSelectedModuleId(moduleId);
    setEditingLesson(null);
    setCreateLessonOpen(true);
  };

  const handleEditModule = (module: any) => {
    setEditingModule(module);
    setCreateModuleOpen(true);
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

  return (
    <div className="flex flex-col h-full">
      <CourseDetailsHeader 
        course={course}
        onNavigateBack={handleNavigateBack}
        onCreateModule={handleCreateModule}
      />

      <div className="flex-1 overflow-auto p-6 bg-gray-50">
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
          setEditingLesson(null);
          setSelectedModuleId(null);
        }}
        moduleId={selectedModuleId!}
        lesson={editingLesson}
      />
    </div>
  );
};

export default CourseDetails;
