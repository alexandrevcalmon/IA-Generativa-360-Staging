
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Users, 
  Clock, 
  BookOpen, 
  TrendingUp, 
  Award, 
  Target,
  Calendar,
  Activity
} from "lucide-react";
import { CollaboratorStats } from "@/hooks/useCollaboratorAnalytics";

interface CompanyDashboardStatsProps {
  collaborators: CollaboratorStats[];
}

export const CompanyDashboardStats = ({ collaborators }: CompanyDashboardStatsProps) => {
  const totalCollaborators = collaborators.length;
  const activeCollaborators = collaborators.filter(c => c.collaborator.is_active).length;
  const totalWatchTime = collaborators.reduce((sum, c) => sum + c.total_watch_time_minutes, 0);
  const totalLessonsCompleted = collaborators.reduce((sum, c) => sum + c.lessons_completed, 0);
  const totalCoursesEnrolled = collaborators.reduce((sum, c) => sum + c.courses_enrolled, 0);
  const totalCoursesCompleted = collaborators.reduce((sum, c) => sum + c.courses_completed, 0);
  
  const averageProgress = totalCollaborators > 0 
    ? Math.round((totalLessonsCompleted / totalCollaborators))
    : 0;

  const engagementRate = totalCollaborators > 0
    ? Math.round((activeCollaborators / totalCollaborators) * 100)
    : 0;

  const completionRate = totalCoursesEnrolled > 0
    ? Math.round((totalCoursesCompleted / totalCoursesEnrolled) * 100)
    : 0;

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    return hours > 0 ? `${hours}h` : `${minutes}min`;
  };

  const stats = [
    {
      title: "Total de Colaboradores",
      value: totalCollaborators.toString(),
      subtitle: `${activeCollaborators} ativos`,
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      title: "Tempo Total de Estudo",
      value: formatTime(totalWatchTime),
      subtitle: `${Math.round(totalWatchTime / Math.max(totalCollaborators, 1))}min média`,
      icon: Clock,
      color: "text-green-600",
      bgColor: "bg-green-50"
    },
    {
      title: "Lições Completadas",
      value: totalLessonsCompleted.toString(),
      subtitle: `${averageProgress} por colaborador`,
      icon: BookOpen,
      color: "text-purple-600",
      bgColor: "bg-purple-50"
    },
    {
      title: "Taxa de Engajamento",
      value: `${engagementRate}%`,
      subtitle: "Colaboradores ativos",
      icon: TrendingUp,
      color: "text-orange-600",
      bgColor: "bg-orange-50"
    },
    {
      title: "Cursos Matriculados",
      value: totalCoursesEnrolled.toString(),
      subtitle: `${totalCoursesCompleted} concluídos`,
      icon: Target,
      color: "text-indigo-600",
      bgColor: "bg-indigo-50"
    },
    {
      title: "Taxa de Conclusão",
      value: `${completionRate}%`,
      subtitle: "Cursos finalizados",
      icon: Award,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {stats.map((stat, index) => (
        <Card key={index} className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              {stat.title}
            </CardTitle>
            <div className={`p-2 rounded-lg ${stat.bgColor}`}>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {stat.value}
            </div>
            <p className="text-xs text-gray-500">
              {stat.subtitle}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
