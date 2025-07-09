
import { useState } from "react";
import { useStudentCourses } from "@/hooks/useStudentCourses";
import { StudentPageHeader } from "@/components/student/StudentPageHeader";
import { CourseSearchFilters } from "@/components/student/CourseSearchFilters";
import { StudentCourseTabs } from "@/components/student/StudentCourseTabs";
import { CourseViewToggle } from "@/components/student/CourseViewToggle";

const StudentCourses = () => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const { data: courses, isLoading } = useStudentCourses();

  const categories = ["Todos", "IA Generativa", "Técnicas", "Bem-estar", "Desenvolvimento", "Ética", "Automação"];
  const levels = ["Todos os níveis", "Iniciante", "Intermediário", "Avançado"];

  const inProgressCourses = courses?.filter(c => c.progress_percentage > 0 && c.progress_percentage < 100) || [];
  const completedCourses = courses?.filter(c => c.progress_percentage === 100) || [];

  if (isLoading) {
    return (
      <div className="flex flex-col h-full">
        <StudentPageHeader
          title="Catálogo de Cursos"
          subtitle="Carregando..."
        />
        <div className="flex-1 overflow-auto p-4 md:p-6 bg-gray-50">
          <div className="flex items-center justify-center h-64">
            <div className="text-lg text-gray-600">Carregando cursos...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <StudentPageHeader
        title="Catálogo de Cursos"
        subtitle="Explore nossa biblioteca completa de conhecimento"
      >
        <CourseViewToggle viewMode={viewMode} onViewModeChange={setViewMode} />
      </StudentPageHeader>

      <div className="flex-1 overflow-auto p-4 md:p-6 bg-gray-50">
        <div className="space-y-6">
          <CourseSearchFilters categories={categories} levels={levels} />
          <StudentCourseTabs 
            courses={courses || []}
            viewMode={viewMode}
            inProgressCourses={inProgressCourses}
            completedCourses={completedCourses}
          />
        </div>
      </div>
    </div>
  );
};

export default StudentCourses;
