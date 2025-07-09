
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, FileText } from 'lucide-react';
import { StudentLesson } from '@/hooks/useStudentCourses';
import { useSimplifiedLessonProgress } from '@/hooks/progress/useSimplifiedLessonProgress';
import { useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/auth';

interface LessonProgressProps {
  currentLesson: StudentLesson;
  watchTime: number;
  duration: number;
}

export const LessonProgress = ({ currentLesson, watchTime, duration }: LessonProgressProps) => {
  const { user } = useAuth();
  const { mutate: updateProgress, resetCompletionToasts } = useSimplifiedLessonProgress();
  
  // Refs to track state and prevent unnecessary updates
  const lastSavedTimeRef = useRef<number>(0);
  const autoCompletedRef = useRef<boolean>(false);
  const lastProgressPercentageRef = useRef<number>(0);
  const saveIntervalRef = useRef<number>(0);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercentage = duration > 0 ? (watchTime / duration) * 100 : 0;

  // Auto-complete lesson when 95% is watched (only once)
  useEffect(() => {
    if (
      currentLesson && 
      user?.id &&
      !currentLesson.completed && 
      !autoCompletedRef.current &&
      duration > 0 && 
      progressPercentage >= 95 &&
      progressPercentage > lastProgressPercentageRef.current
    ) {
      console.log('🎯 Auto-completing lesson at 95% progress');
      autoCompletedRef.current = true;
      
      updateProgress({
        lessonId: currentLesson.id,
        completed: true,
        watchTimeSeconds: Math.floor(watchTime)
      });
    }
    
    lastProgressPercentageRef.current = progressPercentage;
  }, [currentLesson, progressPercentage, duration, watchTime, updateProgress, user?.id]);

  // Periodic save with better timing
  useEffect(() => {
    if (
      currentLesson && 
      user?.id &&
      watchTime > 0 && 
      !autoCompletedRef.current
    ) {
      const currentSaveInterval = Math.floor(watchTime / 60); // Save every minute
      
      if (
        currentSaveInterval > saveIntervalRef.current &&
        Math.floor(watchTime) !== lastSavedTimeRef.current
      ) {
        console.log('💾 Saving lesson progress at interval:', currentSaveInterval);
        lastSavedTimeRef.current = Math.floor(watchTime);
        saveIntervalRef.current = currentSaveInterval;
        
        updateProgress({
          lessonId: currentLesson.id,
          completed: currentLesson.completed || false,
          watchTimeSeconds: Math.floor(watchTime)
        });
      }
    }
  }, [watchTime, currentLesson, updateProgress, user?.id]);

  // Reset all tracking refs when lesson changes
  useEffect(() => {
    console.log('🔄 Lesson changed, resetting tracking refs');
    autoCompletedRef.current = false;
    lastSavedTimeRef.current = 0;
    lastProgressPercentageRef.current = 0;
    saveIntervalRef.current = 0;
    
    // Reset completion toasts for this lesson
    resetCompletionToasts(currentLesson?.id);
  }, [currentLesson?.id, resetCompletionToasts]);

  return (
    <>
      {/* Progress Bar */}
      <div className="mb-4 sm:mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-800">Progresso da Aula</span>
          <span className="text-sm text-gray-600 font-mono">
            {formatTime(watchTime)} / {formatTime(duration)}
          </span>
        </div>
        <Progress value={progressPercentage} className="h-3 sm:h-4 bg-gray-100 [&>div]:bg-blue-600" />
        <div className="flex justify-between items-center mt-2">
          <span className="text-xs sm:text-sm text-gray-600">
            {progressPercentage.toFixed(1)}% assistido
          </span>
          {currentLesson.completed && (
            <div className="flex items-center text-green-600 text-xs sm:text-sm font-medium">
              <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
              Concluída
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3">
        {currentLesson.material_url && (
          <Button 
            variant="outline" 
            asChild 
            className="h-11 touch-manipulation border-2 border-blue-200 hover:bg-blue-50 hover:border-blue-300 text-blue-700 font-medium"
          >
            <a href={currentLesson.material_url} download>
              <FileText className="h-4 w-4 mr-2" />
              Material de Apoio
            </a>
          </Button>
        )}
      </div>
    </>
  );
};
