
import { useState } from 'react';
import { LessonHeader } from './LessonHeader';
import { LessonVideoSection } from './LessonVideoSection';
import { LessonContent } from './LessonContent';
import { LessonSidebar } from './LessonSidebar';
import { AIChatWidget } from '@/components/lesson/AIChatWidget';
import { StudentLesson, StudentCourse } from '@/hooks/useStudentCourses';

interface LessonViewContentProps {
  currentLesson: any;
  course: StudentCourse;
  courseId: string;
  currentModule?: { title: string } | null;
  prevLesson?: { id: string; title: string };
  nextLesson?: { id: string; title: string };
  companyId: string;
}

export const LessonViewContent = ({
  currentLesson,
  course,
  courseId,
  currentModule,
  prevLesson,
  nextLesson,
  companyId
}: LessonViewContentProps) => {
  const [watchTime, setWatchTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const handleTimeUpdate = (currentTime: number, videoDuration: number) => {
    setWatchTime(currentTime);
    setDuration(videoDuration);
  };

  // Convert lesson to StudentLesson format for components
  const studentLesson: StudentLesson = {
    ...currentLesson,
    completed: currentLesson.completed || false,
    watch_time_seconds: currentLesson.watch_time_seconds || 0,
    video_file_url: currentLesson.video_file_url || null,
    material_url: currentLesson.material_url || null,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <LessonHeader 
        currentLesson={studentLesson} 
        course={course} 
        courseId={courseId}
        currentModule={currentModule}
      />

      {/* Main Content */}
      <div className="w-full px-3 sm:px-4 lg:px-6 py-3 sm:py-4 lg:py-6">
        <div className="max-w-7xl mx-auto">
          {/* Mobile Layout - Stack vertically */}
          <div className="block lg:hidden space-y-4">
            {/* Video Section */}
            <LessonVideoSection
              currentLesson={studentLesson}
              course={course}
              onTimeUpdate={handleTimeUpdate}
            />
            
            {/* Progress and Navigation */}
            <LessonSidebar
              currentLesson={studentLesson}
              courseId={courseId}
              watchTime={watchTime}
              duration={duration}
              prevLesson={prevLesson}
              nextLesson={nextLesson}
            />
            
            {/* Content */}
            <LessonContent 
              currentLesson={studentLesson} 
              currentModule={currentModule}
            />
          </div>

          {/* Desktop Layout - Grid */}
          <div className="hidden lg:grid lg:grid-cols-4 gap-6">
            {/* Main Content - Left side */}
            <div className="lg:col-span-3 space-y-6">
              <LessonVideoSection
                currentLesson={studentLesson}
                course={course}
                onTimeUpdate={handleTimeUpdate}
              />
              
              <LessonContent 
                currentLesson={studentLesson} 
                currentModule={currentModule}
              />
            </div>

            {/* Sidebar - Right side */}
            <div className="lg:col-span-1">
              <LessonSidebar
                currentLesson={studentLesson}
                courseId={courseId}
                watchTime={watchTime}
                duration={duration}
                prevLesson={prevLesson}
                nextLesson={nextLesson}
              />
            </div>
          </div>
        </div>
      </div>

      {/* AI Chat Widget */}
      <AIChatWidget
        lessonId={currentLesson.id}
        companyId={companyId}
      />
    </div>
  );
};
