
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookOpen, Play, Edit, Plus } from "lucide-react";
import { CourseModule } from "@/hooks/useCourseModules";
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
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Todas as Aulas ({allLessons.length})</h3>
        {modules.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="bg-gradient-to-r from-calmon-500 to-calmon-700 hover:from-calmon-600 hover:to-calmon-800 text-white">
                <Plus className="h-4 w-4 mr-2" />
                Nova Aula
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
      </div>
      
      <div className="grid gap-4">
        {allLessons.map((lesson) => (
          <Card key={lesson.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Play className="h-4 w-4 text-muted-foreground" />
                    <h4 className="font-medium">{lesson.title}</h4>
                    {lesson.is_free && (
                      <Badge variant="secondary" className="text-xs">Gratuita</Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    Módulo: {lesson.moduleName}
                  </p>
                  {lesson.content && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {lesson.content}
                    </p>
                  )}
                </div>
                
                <div className="flex items-center gap-2">
                  {lesson.duration_minutes && (
                    <span className="text-xs text-muted-foreground">
                      {lesson.duration_minutes}min
                    </span>
                  )}
                  <Button variant="ghost" size="sm" onClick={() => onEditLesson(lesson)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
