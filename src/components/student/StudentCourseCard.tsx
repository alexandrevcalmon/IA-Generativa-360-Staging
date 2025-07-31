
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { BookOpen, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import { StudentCourse } from "@/hooks/useStudentCourses";
import { useCourseProgress } from '@/hooks/useCourseProgress';
import { useAuth } from '@/hooks/auth/useAuth';

interface StudentCourseCardProps {
  course: StudentCourse;
  isListView?: boolean;
  index: number;
}

export const StudentCourseCard = ({ course, isListView = false, index }: StudentCourseCardProps) => {
  const { user } = useAuth();
  const { data: progressData, isLoading } = useCourseProgress(String(course.id), user?.id);
  // Placeholder images for courses
  const placeholderImages = [
    "https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7?w=400&h=300&fit=crop"
  ];

  const getPlaceholderImage = (index: number) => {
    return placeholderImages[index % placeholderImages.length];
  };

  const getImageUrl = (course: StudentCourse, index: number) => {
    console.log('Course thumbnail URL:', course.thumbnail_url);
    console.log('Course title:', course.title);
    
    if (course.thumbnail_url) {
      return course.thumbnail_url;
    }
    
    return getPlaceholderImage(index);
  };

  return (
    <Card className={`relative overflow-hidden bg-slate-900/20 backdrop-blur-xl border-0 shadow-lg hover:shadow-xl transition-all duration-300 group hover:scale-[1.01] ${isListView ? 'flex flex-col sm:flex-row' : ''}`}>
      <div className={`${isListView ? 'w-full sm:w-48 flex-shrink-0' : 'w-full'}`}>
        <div className={`relative ${isListView ? 'h-48 sm:h-32' : 'h-48'} overflow-hidden ${isListView ? 'rounded-t-lg sm:rounded-l-lg sm:rounded-tr-none' : 'rounded-t-lg'}`}>
          <img 
            src={getImageUrl(course, index)}
            alt={course.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              console.log('Image failed to load, falling back to placeholder');
              e.currentTarget.src = getPlaceholderImage(index);
            }}
            onLoad={() => {
              console.log('Image loaded successfully:', course.thumbnail_url || 'placeholder');
            }}
          />
          {/* Overlay gradient for better text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
          {progressData.progressPercentage > 0 && (
            <Badge className="absolute top-3 right-3 bg-gradient-to-r from-emerald-400 via-green-500 to-teal-600 text-white border-0 shadow-lg text-xs font-medium">
              {progressData.progressPercentage === 100 ? 'Concluído' : `${Math.round(progressData.progressPercentage)}%`}
            </Badge>
          )}
        </div>
      </div>
      
      <div className={`${isListView ? 'flex-1' : ''}`}>
        <CardHeader className={`p-6 ${isListView ? 'pb-4' : ''}`}>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className={`${isListView ? 'text-lg' : 'text-xl'} mb-3 line-clamp-2 text-slate-100 font-semibold leading-tight`}>
                {course.title}
              </CardTitle>
              <CardDescription className={`${isListView ? 'line-clamp-2' : 'line-clamp-3'} mb-4 text-sm text-slate-300 leading-relaxed`}>
                {course.description}
              </CardDescription>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2 mb-4">
            <Badge className="text-xs bg-slate-600/50 border-0 text-slate-200 px-3 py-1 font-medium">{course.category}</Badge>
            <Badge className="text-xs bg-slate-600/50 border-0 text-slate-200 px-3 py-1 font-medium">{course.difficulty_level}</Badge>
          </div>
        </CardHeader>

        <CardContent className={`p-6 pt-0 ${isListView ? '' : ''}`}>
          <div className={`${isListView ? 'flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4' : 'space-y-4'}`}>
            <div className={`${isListView ? 'flex flex-wrap gap-4 text-sm' : 'space-y-3 text-sm'}`}>
              <div className="flex items-center text-slate-300 font-medium">
                <Clock className="h-4 w-4 mr-2 text-emerald-400" />
                {course.estimated_hours}h
              </div>
              <div className="flex items-center text-slate-300 font-medium">
                <BookOpen className="h-4 w-4 mr-2 text-emerald-400" />
                {course.modules?.length || 0} módulos
              </div>
            </div>
            
            <div className={`${isListView ? 'flex items-center gap-2' : 'flex justify-between items-center'}`}>
              <Button asChild className="bg-gradient-to-r from-emerald-400 via-green-500 to-teal-600 text-white text-sm px-6 py-2 border-0 shadow-lg hover:shadow-xl transition-all duration-300 font-medium">
                <Link to={`/student/courses/${course.id}`}>
                  {progressData.progressPercentage > 0 ? 'Continuar' : 'Começar Curso'}
                </Link>
              </Button>
            </div>
          </div>
          
          {progressData.progressPercentage > 0 && progressData.progressPercentage < 100 && (
            <div className="mt-6 pt-4 border-t border-slate-600/20">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-slate-200 font-medium">Progresso</span>
                <span className="text-slate-300">{Math.round(progressData.progressPercentage)}% ({progressData.completedLessons} de {progressData.totalLessons})</span>
              </div>
              <Progress value={progressData.progressPercentage} className="h-2 bg-slate-600/50 !bg-slate-600/50" />
            </div>
          )}
        </CardContent>
      </div>
    </Card>
  );
};
