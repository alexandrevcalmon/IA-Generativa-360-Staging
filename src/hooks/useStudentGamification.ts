
// Re-export all gamification-related hooks for backward compatibility
export { 
  useStudentPoints, 
  useStudentAchievements, 
  useAvailableAchievements, 
  usePointsHistory 
} from './gamification';
export type { 
  StudentPoints, 
  StudentAchievement, 
  Achievement, 
  PointsHistoryEntry 
} from './gamification';
