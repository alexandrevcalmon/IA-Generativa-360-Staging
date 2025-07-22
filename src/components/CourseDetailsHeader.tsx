
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus } from "lucide-react";
import { Course } from "@/hooks/useCourses";

interface CourseDetailsHeaderProps {
  course: Course;
  onNavigateBack: () => void;
  onCreateModule: () => void;
}

export const CourseDetailsHeader = ({ course, onNavigateBack, onCreateModule }: CourseDetailsHeaderProps) => {
  return (
    <header className="border-b border-slate-700/50 bg-adapta-dark px-6 py-10">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <SidebarTrigger className="text-slate-300" />
          <Button variant="ghost" size="sm" onClick={onNavigateBack} className="text-slate-300 hover:text-white hover:bg-slate-800/50">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-white">{course.title}</h1>
            <p className="text-slate-300">Gerencie o conteúdo do curso</p>
          </div>
        </div>
        <Button 
          onClick={onCreateModule}
          className="!bg-gradient-to-r !from-orange-500 !to-red-600 hover:!from-orange-600 hover:!to-red-700 !text-white !border-0 !shadow-lg"
        >
          <Plus className="h-4 w-4 mr-2" />
          Novo Módulo
        </Button>
      </div>
    </header>
  );
};
