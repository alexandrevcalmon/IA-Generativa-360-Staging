
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
      <Card className="bg-gray-900/50 border-gray-700 shadow-xl">
        <CardContent className="p-12 text-center">
          <BookOpen className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium mb-2 text-white">Nenhum módulo criado</h3>
          <p className="text-gray-300 mb-4">
            Comece criando o primeiro módulo do seu curso.
          </p>
          <Button 
            onClick={onCreateModule}
            className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white shadow-lg border-0"
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
        <h3 className="text-lg font-medium text-white">Módulos do Curso</h3>
        <Button 
          onClick={onCreateModule}
          className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white shadow-lg border-0"
        >
          <Plus className="h-4 w-4 mr-2" />
          Novo Módulo
        </Button>
      </div>
      
      <div className="grid gap-6">
        {modules.map((module) => {
          const lessonsCount = module.lessons?.length || 0;
          const isExpanded = expandedModules.has(module.id);
          
          console.log(`[ModulesTabContent] Module ${module.title} has ${lessonsCount} lessons:`, module.lessons);
          
          return (
            <Card key={module.id} className="hover:shadow-md transition-shadow bg-gray-800/80 border-gray-600 shadow-xl">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg text-white">{module.title}</CardTitle>
                    <CardDescription className="mt-1 text-gray-300">
                      {module.description || 'Sem descrição'}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={module.is_published ? 'default' : 'outline'} className={module.is_published ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white border-0" : "bg-gray-700 text-gray-300 border-gray-600"}>
                      {module.is_published ? 'Publicado' : 'Rascunho'}
                    </Badge>
                    <Button variant="ghost" size="sm" onClick={() => onEditModule(module)} className="text-gray-300 hover:text-white hover:bg-gray-700">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between text-sm text-gray-300 mb-3">
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
                        className="h-8 w-8 p-0 text-gray-300 hover:text-white hover:bg-gray-700"
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
                  <div className="mb-4 pt-3 border-t border-gray-700">
                    <div className="mb-3 flex items-center justify-between">
                      <h5 className="text-sm font-medium text-white">Aulas:</h5>
                      <span className="text-xs text-gray-400">
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
                <div className="pt-3 border-t border-gray-700">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => onCreateLesson(module.id)}
                    className="w-full bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white border-0 shadow-lg"
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
