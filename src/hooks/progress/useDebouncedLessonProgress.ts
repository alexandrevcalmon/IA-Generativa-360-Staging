
import { useCallback } from 'react';
import { useUpdateLessonProgress } from './useUpdateLessonProgress';
import { debounce } from './utils';
import { UpdateProgressParams } from './types';

// Hook for debounced progress updates with enhanced timing to prevent conflicts
export const useDebouncedLessonProgress = () => {
  const updateProgress = useUpdateLessonProgress();
  
  const debouncedUpdate = useCallback(
    debounce((params: UpdateProgressParams) => {
      updateProgress.mutate(params);
    }, 4000), // Increased to 4 seconds to further reduce conflicts and prevent duplicate toasts
    [updateProgress]
  );

  return {
    ...updateProgress,
    debouncedMutate: debouncedUpdate
  };
};
