
import { useMutation } from '@tanstack/react-query';
import { useUpdateLessonProgress } from './useUpdateLessonProgress';

export const useMarkLessonComplete = () => {
  const updateProgress = useUpdateLessonProgress();
  
  return useMutation({
    mutationFn: async (lessonId: string) => {
      return updateProgress.mutateAsync({ 
        lessonId, 
        completed: true 
      });
    },
  });
};
