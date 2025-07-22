
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Play, Plus } from "lucide-react";
import { CourseModule } from "@/hooks/useCourseModules";
import { DraggableLessonsListWithHeader } from "./DraggableLessonsListWithHeader";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";

interface LessonsTabContentProps {
  modules: CourseModule[];
  onEditLesson: (lesson: any) => void;
  onCreateLesson: (moduleId: string) => void;
}

export const LessonsTabContent = ({ modules, onEditLesson, onCreateLesson }: LessonsTabContentProps) => {
  console.log('[LessonsTabContent] Modules received:', modules);
  
  const allLessons = modules.flatMap(module => {
    console.log(`[LessonsTabContent] Module ${module.title} has ${module.lessons?.length || 0} lessons:`, module.lessons);
    return module.lessons?.map(lesson => ({ 
      ...lesson, 
      moduleName: module.title,
      moduleId: module.id
    })) || [];
  });

  console.log('[LessonsTabContent] All lessons:', allLessons);

  if (allLessons.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <Play className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">Nenhuma aula criada</h3>
          <p className="text-muted-foreground mb-4">
            {modules.length === 0 
              ? "Crie módulos primeiro, depois adicione aulas a eles."
              : "Adicione aulas aos módulos existentes."}
          </p>
          {modules.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="bg-gradient-to-r from-calmon-500 to-calmon-700 hover:from-calmon-600 hover:to-calmon-800 text-white">
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Primeira Aula
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {modules.map((module) => (
                  <DropdownMenuItem 
                    key={module.id}
                    onClick={() => onCreateLesson(module.id)}
                  >
                    <BookOpen className="mr-2 h-4 w-4" />
                    {module.title}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-white">Todas as Aulas ({allLessons.length})</h3>
        {modules.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white">
                <Plus className="h-4 w-4 mr-2" />
                Nova Aula
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-gray-800 border-gray-600">
              {modules.map((module) => (
                <DropdownMenuItem 
                  key={module.id}
                  onClick={() => onCreateLesson(module.id)}
                  className="text-gray-300 hover:bg-gray-700 hover:text-white"
                >
                  <BookOpen className="mr-2 h-4 w-4" />
                  {module.title}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
      
      <div className="space-y-8">
        <p className="text-sm text-gray-400">
          💡 Dica: Arraste as aulas para reordenar dentro de cada módulo
        </p>
        
        {/* Usar o componente DraggableLessonsListWithHeader para cada módulo */}
        {modules.filter(module => module.lessons && module.lessons.length > 0).map((module) => (
          <DraggableLessonsListWithHeader
            key={module.id}
            module={module}
            onEditLesson={onEditLesson}
            onCreateLesson={onCreateLesson}
          />
        ))}
      </div>
    </div>
  );
};
