
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, BookOpen, Edit, Trash2, Play, ChevronDown, ChevronRight } from "lucide-react";
import { CourseModule } from "@/hooks/useCourseModules";
import { DraggableLessonsList } from "./DraggableLessonsList";

interface ModulesTabContentProps {
  modules: CourseModule[];
  onCreateModule: () => void;
  onEditModule: (module: CourseModule) => void;
  onCreateLesson: (moduleId: string) => void;
  onEditLesson?: (lesson: any) => void;
}

export const ModulesTabContent = ({ 
  modules, 
  onCreateModule, 
  onEditModule, 
  onCreateLesson,
  onEditLesson 
}: ModulesTabContentProps) => {
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
  
  console.log('[ModulesTabContent] Modules received:', modules);

  const toggleModule = (moduleId: string) => {
    const newExpanded = new Set(expandedModules);
    if (newExpanded.has(moduleId)) {
      newExpanded.delete(moduleId);
    } else {
      newExpanded.add(moduleId);
    }
    setExpandedModules(newExpanded);
  };

  const handleEditLesson = (lesson: any) => {
    if (onEditLesson) {
      onEditLesson(lesson);
    }
  };

  if (modules.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">Nenhum módulo criado</h3>
          <p className="text-muted-foreground mb-4">
            Comece criando o primeiro módulo do seu curso.
          </p>
          <Button 
            onClick={onCreateModule}
            className="bg-gradient-to-r from-calmon-500 to-calmon-700 hover:from-calmon-600 hover:to-calmon-800 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Criar Primeiro Módulo
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Módulos do Curso</h3>
        <Button 
          onClick={onCreateModule}
          className="bg-gradient-to-r from-calmon-500 to-calmon-700 hover:from-calmon-600 hover:to-calmon-800 text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          Novo Módulo
        </Button>
      </div>
      
      <div className="grid gap-4">
        {modules.map((module) => {
          const lessonsCount = module.lessons?.length || 0;
          const isExpanded = expandedModules.has(module.id);
          
          console.log(`[ModulesTabContent] Module ${module.title} has ${lessonsCount} lessons:`, module.lessons);
          
          return (
            <Card key={module.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">{module.title}</CardTitle>
                    <CardDescription className="mt-1">
                      {module.description || 'Sem descrição'}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={module.is_published ? 'default' : 'outline'}>
                      {module.is_published ? 'Publicado' : 'Rascunho'}
                    </Badge>
                    <Button variant="ghost" size="sm" onClick={() => onEditModule(module)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between text-sm text-muted-foreground mb-3">
                  <div className="flex items-center gap-1">
                    <Play className="h-4 w-4" />
                    <span>{lessonsCount} aulas</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>Ordem: {module.order_index}</span>
                    {lessonsCount > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleModule(module.id)}
                        className="h-8 w-8 p-0"
                      >
                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </Button>
                    )}
                  </div>
                </div>
                
                {/* Exibir as aulas do módulo se existirem e estiver expandido */}
                {lessonsCount > 0 && isExpanded && (
                  <div className="mb-4 pt-3 border-t">
                    <div className="mb-3 flex items-center justify-between">
                      <h5 className="text-sm font-medium">Aulas:</h5>
                      <span className="text-xs text-muted-foreground">
                        💡 Arraste para reordenar
                      </span>
                    </div>
                    <DraggableLessonsList
                      module={module}
                      onEditLesson={handleEditLesson}
                      onCreateLesson={onCreateLesson}
                    />
                  </div>
                )}
                
                {/* Botão para criar nova aula no módulo */}
                <div className="pt-3 border-t">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => onCreateLesson(module.id)}
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Nova Aula
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
