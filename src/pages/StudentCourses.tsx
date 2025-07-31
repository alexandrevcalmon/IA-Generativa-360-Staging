import { useState } from "react";
import { PageLayout } from "@/components/PageLayout";
import { PageSection } from "@/components/PageSection";
import { useStudentCourses } from "@/hooks/useStudentCourses";
import { CourseSearchFilters } from "@/components/student/CourseSearchFilters";
import { StudentCourseTabs } from "@/components/student/StudentCourseTabs";


const StudentCourses = () => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const { data: courses, isLoading } = useStudentCourses();

  const categories = ["Todos", "IA Generativa", "Técnicas", "Bem-estar", "Desenvolvimento", "Ética", "Automação"];
  const levels = ["Todos os níveis", "Iniciante", "Intermediário", "Avançado"];

  const inProgressCourses = courses?.filter(c => c.progress_percentage > 0 && c.progress_percentage < 100) || [];
  const completedCourses = courses?.filter(c => c.progress_percentage === 100) || [];



  if (isLoading) {
    return (
      <PageLayout
        title="Catálogo de Cursos"
        subtitle="Carregando..."
      >
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-gray-600">Carregando cursos...</div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      title="Catálogo de Cursos"
      subtitle="Explore nossa biblioteca completa de conhecimento"
      background="dark"
    >
      <div className="space-y-12 dark-theme-override pl-6">
        <PageSection>
          <CourseSearchFilters categories={categories} levels={levels} />
        </PageSection>
        
        <PageSection noPadding>
          <StudentCourseTabs 
            courses={courses || []}
            viewMode={viewMode}
            inProgressCourses={inProgressCourses}
            completedCourses={completedCourses}
          />
        </PageSection>
      </div>
    </PageLayout>
  );
};

export default StudentCourses;
