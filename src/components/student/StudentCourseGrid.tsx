
import { StudentCourse } from "@/hooks/useStudentCourses";
import { StudentCourseCard } from "./StudentCourseCard";
import { BookOpen } from "lucide-react";

interface StudentCourseGridProps {
  courses: StudentCourse[];
  viewMode: 'grid' | 'list';
  emptyMessage?: string;
  emptyDescription?: string;
}

export const StudentCourseGrid = ({ 
  courses, 
  viewMode, 
  emptyMessage = "Nenhum curso encontrado",
  emptyDescription = "Novos cursos serão adicionados em breve"
}: StudentCourseGridProps) => {
  if (courses.length === 0) {
    return (
      <div className="text-center py-12">
        <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {emptyMessage}
        </h3>
        <p className="text-gray-600">
          {emptyDescription}
        </p>
      </div>
    );
  }

  return (
    <div className={viewMode === 'grid' ? 'grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6' : 'space-y-4'}>
      {courses.map((course, index) => (
        <StudentCourseCard 
          key={course.id} 
          course={course} 
          isListView={viewMode === 'list'} 
          index={index} 
        />
      ))}
    </div>
  );
};
