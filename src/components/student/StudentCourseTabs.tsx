
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { BookOpen } from "lucide-react";
import { StudentCourse } from "@/hooks/useStudentCourses";
import { StudentCourseGrid } from "./StudentCourseGrid";

interface StudentCourseTabsProps {
  courses: StudentCourse[];
  viewMode: 'grid' | 'list';
  inProgressCourses: StudentCourse[];
  completedCourses: StudentCourse[];
}

export const StudentCourseTabs = ({ 
  courses, 
  viewMode, 
  inProgressCourses, 
  completedCourses 
}: StudentCourseTabsProps) => {
  return (
    <Tabs defaultValue="all" className="space-y-6">
      <div className="overflow-x-auto">
        <TabsList className="grid w-full grid-cols-4 lg:w-fit lg:grid-cols-4">
          <TabsTrigger value="all">Todos</TabsTrigger>
          <TabsTrigger value="in-progress">Em Andamento</TabsTrigger>
          <TabsTrigger value="completed">Concluídos</TabsTrigger>
          <TabsTrigger value="bookmarked">Favoritos</TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="all" className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h2 className="text-lg font-semibold">
            {courses?.length || 0} cursos disponíveis
          </h2>
          <Select defaultValue="newest">
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Mais Recentes</SelectItem>
              <SelectItem value="popular">Mais Populares</SelectItem>
              <SelectItem value="rating">Melhor Avaliados</SelectItem>
              <SelectItem value="duration">Duração</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <StudentCourseGrid courses={courses || []} viewMode={viewMode} />
      </TabsContent>

      <TabsContent value="in-progress" className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h2 className="text-lg font-semibold">
            {inProgressCourses.length} cursos em andamento
          </h2>
        </div>

        <StudentCourseGrid courses={inProgressCourses} viewMode={viewMode} />
      </TabsContent>

      <TabsContent value="completed" className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h2 className="text-lg font-semibold">
            {completedCourses.length} cursos concluídos
          </h2>
        </div>

        <StudentCourseGrid courses={completedCourses} viewMode={viewMode} />
      </TabsContent>

      <TabsContent value="bookmarked" className="space-y-6">
        <div className="text-center py-12">
          <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Nenhum curso favoritado ainda
          </h3>
          <p className="text-gray-600 mb-4">
            Marque cursos como favoritos para acessá-los rapidamente
          </p>
          <Button variant="outline">
            Explorar Cursos
          </Button>
        </div>
      </TabsContent>
    </Tabs>
  );
};
