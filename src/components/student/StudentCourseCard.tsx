
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { BookOpen, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import { StudentCourse } from "@/hooks/useStudentCourses";

interface StudentCourseCardProps {
  course: StudentCourse;
  isListView?: boolean;
  index: number;
}

export const StudentCourseCard = ({ course, isListView = false, index }: StudentCourseCardProps) => {
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
    <Card className={`hover-lift transition-all duration-200 ${isListView ? 'flex flex-col sm:flex-row' : ''}`}>
      <div className={`${isListView ? 'w-full sm:w-48 flex-shrink-0' : 'w-full'}`}>
        <div className={`relative ${isListView ? 'h-48 sm:h-32' : 'h-48'} overflow-hidden ${isListView ? 'rounded-t-lg sm:rounded-l-lg sm:rounded-tr-none' : 'rounded-t-lg'}`}>
          <img 
            src={getImageUrl(course, index)}
            alt={course.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              console.log('Image failed to load, falling back to placeholder');
              e.currentTarget.src = getPlaceholderImage(index);
            }}
            onLoad={() => {
              console.log('Image loaded successfully:', course.thumbnail_url || 'placeholder');
            }}
          />
          {course.progress_percentage > 0 && (
            <Badge className="absolute top-2 right-2 bg-green-500">
              {course.progress_percentage === 100 ? 'Concluído' : `${Math.round(course.progress_percentage)}%`}
            </Badge>
          )}
        </div>
      </div>
      
      <div className={`${isListView ? 'flex-1' : ''}`}>
        <CardHeader className={`p-4 ${isListView ? 'pb-2' : ''}`}>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className={`${isListView ? 'text-lg' : 'text-xl'} mb-2 line-clamp-2`}>
                {course.title}
              </CardTitle>
              <CardDescription className={`${isListView ? 'line-clamp-2' : 'line-clamp-3'} mb-3 text-sm`}>
                {course.description}
              </CardDescription>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2 mb-3">
            <Badge variant="outline" className="text-xs">{course.category}</Badge>
            <Badge variant="outline" className="text-xs">{course.difficulty_level}</Badge>
          </div>
        </CardHeader>

        <CardContent className={`p-4 pt-0 ${isListView ? '' : ''}`}>
          <div className={`${isListView ? 'flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4' : 'space-y-3'}`}>
            <div className={`${isListView ? 'flex flex-wrap gap-4 text-sm' : 'space-y-2 text-sm'}`}>
              <div className="flex items-center text-gray-600">
                <Clock className="h-4 w-4 mr-1" />
                {course.estimated_hours}h
              </div>
              <div className="flex items-center text-gray-600">
                <BookOpen className="h-4 w-4 mr-1" />
                {course.modules?.length || 0} módulos
              </div>
              <Badge variant="outline" className="text-xs">
                {course.difficulty_level}
              </Badge>
            </div>
            
            <div className={`${isListView ? 'flex items-center gap-2' : 'flex justify-between items-center'}`}>
              <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2">
                <Link to={`/student/courses/${course.id}`}>
                  {course.progress_percentage > 0 ? 'Continuar' : 'Começar Curso'}
                </Link>
              </Button>
            </div>
          </div>
          
          {course.progress_percentage > 0 && course.progress_percentage < 100 && (
            <div className="mt-4">
              <div className="flex justify-between text-sm mb-1">
                <span>Progresso</span>
                <span>{Math.round(course.progress_percentage)}%</span>
              </div>
              <Progress value={course.progress_percentage} className="h-2" />
            </div>
          )}
        </CardContent>
      </div>
    </Card>
  );
};
