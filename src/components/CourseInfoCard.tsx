
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Clock, Users, TrendingUp } from "lucide-react";
import { Course } from "@/hooks/useCourses";
import { CourseModule } from "@/hooks/useCourseModules";

interface CourseInfoCardProps {
  course: Course;
  modules: CourseModule[];
}

export const CourseInfoCard = ({ course, modules }: CourseInfoCardProps) => {
  const totalLessons = modules.reduce((acc, module) => acc + (module.lessons?.length || 0), 0);
  
  return (
    <Card className="bg-gray-900/50 border-gray-700 shadow-xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-white">{course.title}</CardTitle>
            <CardDescription className="mt-1 text-gray-300">
              {course.description || 'Sem descrição'}
            </CardDescription>
          </div>
          <Badge variant={course.is_published ? 'default' : 'outline'} className={course.is_published ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white border-0" : "bg-gray-700 text-gray-300 border-gray-600"}>
            {course.is_published ? 'Publicado' : 'Rascunho'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex items-center gap-3 p-3 bg-gray-800/60 rounded-lg border border-gray-600 shadow-md">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg shadow-lg">
              <BookOpen className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-white">{modules.length}</p>
              <p className="text-xs text-gray-300">Módulos</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-3 bg-gray-800/60 rounded-lg border border-gray-600 shadow-md">
            <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg shadow-lg">
              <TrendingUp className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-white">{totalLessons}</p>
              <p className="text-xs text-gray-300">Aulas</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-3 bg-gray-800/60 rounded-lg border border-gray-600 shadow-md">
            <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg shadow-lg">
              <Clock className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-white">{course.estimated_hours || 0}h</p>
              <p className="text-xs text-gray-300">Duração</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-3 bg-gray-800/60 rounded-lg border border-gray-600 shadow-md">
            <div className="p-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg shadow-lg">
              <Users className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-white">0</p>
              <p className="text-xs text-gray-300">Colaboradores</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
