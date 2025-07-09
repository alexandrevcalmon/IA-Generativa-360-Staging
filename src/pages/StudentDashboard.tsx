
import { useAuth } from '@/hooks/auth';
import { useStudentPoints } from '@/hooks/useStudentGamification';
import { useStudentCourses } from '@/hooks/useStudentCourses';
import { usePointsHistory } from '@/hooks/useStudentGamification';
import { StudentDashboardHeader } from '@/components/student/StudentDashboardHeader';
import { StudentStatsGrid } from '@/components/student/StudentStatsGrid';
import { StudentQuickActions } from '@/components/student/StudentQuickActions';
import { StudentRecentActivities } from '@/components/student/StudentRecentActivities';
import { StudentAchievements } from '@/components/student/StudentAchievements';
import { StudentPageHeader } from '@/components/student/StudentPageHeader';

const StudentDashboard = () => {
  const { companyUserData } = useAuth();
  const { data: studentPoints } = useStudentPoints();
  const { data: courses = [] } = useStudentCourses();
  const { data: pointsHistory = [] } = usePointsHistory();

  const totalPoints = studentPoints?.total_points || 0;
  const currentStreak = studentPoints?.streak_days || 0;

  // Calculate real stats from actual data
  const coursesInProgress = courses.filter(course => 
    course.progress_percentage > 0 && course.progress_percentage < 100
  ).length;
  
  const completedCourses = courses.filter(course => 
    course.progress_percentage >= 100
  ).length;

  // Calculate total hours studied based on course progress
  const hoursStudied = courses.reduce((total, course) => {
    const progressDecimal = course.progress_percentage / 100;
    return total + (course.estimated_hours * progressDecimal);
  }, 0);

  // Transform points history into activities format
  const recentActivities = pointsHistory.slice(0, 5).map(entry => ({
    type: entry.action_type,
    title: entry.description || `${entry.action_type} - ${entry.points} pontos`,
    time: new Date(entry.earned_at).toLocaleDateString('pt-BR'),
    points: entry.points
  }));

  return (
    <div className="flex flex-col h-full bg-calmon-bg-gradient">
      <StudentPageHeader
        title={`Olá, ${companyUserData?.name || 'Estudante'}! 👋`}
        subtitle="Continue sua jornada de aprendizado"
      />
      
      <div className="flex-1 overflow-auto p-4 md:p-6">
        <div className="space-y-6">
          <div className="bg-white/80 backdrop-blur-sm rounded-lg p-1 shadow-lg">
            <StudentStatsGrid 
              coursesInProgress={coursesInProgress}
              completedCourses={completedCourses}
              hoursStudied={hoursStudied}
              totalPoints={totalPoints}
            />
          </div>
          
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white/80 backdrop-blur-sm rounded-lg p-1 shadow-lg">
                <StudentQuickActions />
              </div>
              <div className="bg-white/80 backdrop-blur-sm rounded-lg p-1 shadow-lg">
                <StudentRecentActivities activities={recentActivities} />
              </div>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-lg p-1 shadow-lg">
              <StudentAchievements 
                coursesInProgress={coursesInProgress} 
                completedCourses={completedCourses} 
                totalPoints={totalPoints} 
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
