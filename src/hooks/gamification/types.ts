
// Type definitions for gamification-related functionality

export interface StudentPoints {
  id: string;
  student_id: string;
  points: number;
  total_points: number;
  level: number;
  streak_days: number;
  last_activity_date: string;
  created_at: string;
  updated_at: string;
}

export interface StudentAchievement {
  id: string;
  student_id: string;
  achievement_id: string;
  unlocked_at: string;
  achievements: {
    id: string;
    name: string;
    description: string;
    icon: string;
    badge_color: string;
    type: string;
    points_required: number;
  };
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  badge_color: string;
  type: string;
  points_required: number;
  is_active: boolean;
  created_at: string;
}

export interface PointsHistoryEntry {
  id: string;
  student_id: string;
  points: number;
  action_type: string;
  description?: string;
  reference_id?: string;
  earned_at: string;
}
