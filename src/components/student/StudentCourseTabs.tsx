
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
    <Tabs defaultValue="all" className="space-y-8">
      <div className="overflow-x-auto">
        <TabsList className="grid w-full grid-cols-4 lg:w-fit lg:grid-cols-4 bg-slate-600/40 border-0 p-1.5 rounded-xl">
          <TabsTrigger value="all" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-400 data-[state=active]:via-green-500 data-[state=active]:to-teal-600 data-[state=active]:text-white data-[state=active]:shadow-lg text-slate-200 hover:text-slate-100 transition-all duration-300 px-4 py-2 font-medium">Todos</TabsTrigger>
          <TabsTrigger value="in-progress" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-400 data-[state=active]:via-green-500 data-[state=active]:to-teal-600 data-[state=active]:text-white data-[state=active]:shadow-lg text-slate-200 hover:text-slate-100 transition-all duration-300 px-4 py-2 font-medium">Em Andamento</TabsTrigger>
          <TabsTrigger value="completed" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-400 data-[state=active]:via-green-500 data-[state=active]:to-teal-600 data-[state=active]:text-white data-[state=active]:shadow-lg text-slate-200 hover:text-slate-100 transition-all duration-300 px-4 py-2 font-medium">Concluídos</TabsTrigger>
          <TabsTrigger value="bookmarked" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-400 data-[state=active]:via-green-500 data-[state=active]:to-teal-600 data-[state=active]:text-white data-[state=active]:shadow-lg text-slate-200 hover:text-slate-100 transition-all duration-300 px-4 py-2 font-medium">Favoritos</TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="all" className="space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 pl-4">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-emerald-400 via-green-500 to-teal-600 bg-clip-text text-transparent">
            {courses?.length || 0} cursos disponíveis
          </h2>
                      <Select defaultValue="newest">
              <SelectTrigger className="w-full sm:w-48 h-12 bg-slate-600/40 border-0 text-slate-100 focus:border-emerald-500/50 focus:ring-emerald-500/20 !bg-slate-600/40 !border-0 !text-slate-100">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-600 border-0 !bg-slate-600 !border-0">
                <SelectItem value="newest" className="text-slate-100 hover:bg-slate-500 !text-slate-100">Mais Recentes</SelectItem>
                <SelectItem value="popular" className="text-slate-100 hover:bg-slate-500 !text-slate-100">Mais Populares</SelectItem>
                <SelectItem value="rating" className="text-slate-100 hover:bg-slate-500 !text-slate-100">Melhor Avaliados</SelectItem>
                <SelectItem value="duration" className="text-slate-100 hover:bg-slate-500 !text-slate-100">Duração</SelectItem>
              </SelectContent>
            </Select>
        </div>

        <StudentCourseGrid courses={courses || []} viewMode={viewMode} />
      </TabsContent>

      <TabsContent value="in-progress" className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pl-4">
          <h2 className="text-xl font-bold bg-gradient-to-r from-emerald-400 via-green-500 to-teal-600 bg-clip-text text-transparent">
            {inProgressCourses.length} cursos em andamento
          </h2>
        </div>

        <StudentCourseGrid courses={inProgressCourses} viewMode={viewMode} />
      </TabsContent>

      <TabsContent value="completed" className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pl-4">
          <h2 className="text-xl font-bold bg-gradient-to-r from-emerald-400 via-green-500 to-teal-600 bg-clip-text text-transparent">
            {completedCourses.length} cursos concluídos
          </h2>
        </div>

        <StudentCourseGrid courses={completedCourses} viewMode={viewMode} />
      </TabsContent>

      <TabsContent value="bookmarked" className="space-y-6">
        <div className="text-center py-12">
          <BookOpen className="h-12 w-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-200 mb-2">
            Nenhum curso favoritado ainda
          </h3>
          <p className="text-slate-400 mb-4">
            Marque cursos como favoritos para acessá-los rapidamente
          </p>
          <Button className="bg-gradient-to-r from-emerald-400 via-green-500 to-teal-600 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
            Explorar Cursos
          </Button>
        </div>
      </TabsContent>
    </Tabs>
  );
};
