
import { Card, CardContent } from '@/components/ui/card';
import { BookOpen } from 'lucide-react';
import { VideoPlayer } from '@/components/student/VideoPlayer';
import { StudentLesson, StudentCourse } from '@/hooks/useStudentCourses';

interface LessonVideoSectionProps {
  currentLesson: StudentLesson;
  course: StudentCourse;
  onTimeUpdate?: (currentTime: number, duration: number) => void;
}

export const LessonVideoSection = ({ currentLesson, course, onTimeUpdate }: LessonVideoSectionProps) => {
  const hasVideo = currentLesson.video_url || 
                   currentLesson.video_file_url || 
                   (currentLesson.bunny_video_id && currentLesson.bunny_library_id);

  console.log('[LessonVideoSection] Video check:', {
    video_url: currentLesson.video_url,
    video_file_url: currentLesson.video_file_url,
    bunny_video_id: currentLesson.bunny_video_id,
    bunny_library_id: currentLesson.bunny_library_id,
    hasVideo
  });

  if (!hasVideo) {
    return (
      <Card className="w-full">
        <CardContent className="p-3 sm:p-4 lg:p-6 xl:p-8 text-center">
          <div className="text-gray-400 mb-2 sm:mb-3">
            <BookOpen className="mx-auto h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 xl:h-16 xl:w-16" />
          </div>
          <h3 className="text-sm sm:text-base lg:text-lg font-medium text-gray-900 mb-1 sm:mb-2">
            Esta lição não possui vídeo
          </h3>
          <p className="text-xs sm:text-sm lg:text-base text-gray-600">
            O conteúdo desta lição está disponível no texto abaixo.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full overflow-hidden">
      <CardContent className="p-0">
        <div className="w-full max-w-full overflow-hidden">
          <VideoPlayer
            currentLesson={currentLesson}
            course={course}
            onTimeUpdate={onTimeUpdate}
          />
        </div>
      </CardContent>
    </Card>
  );
};
