
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Clock, BookOpen, Trophy } from "lucide-react";
import { CollaboratorStats } from "@/hooks/useCollaboratorAnalytics";

interface CollaboratorAnalyticsSummaryProps {
  stats: CollaboratorStats[];
}

export const CollaboratorAnalyticsSummary = ({ stats }: CollaboratorAnalyticsSummaryProps) => {
  const totalCollaborators = stats.length;
  const activeCollaborators = stats.filter(s => s.collaborator.is_active).length;
  const totalWatchTime = stats.reduce((sum, s) => sum + s.total_watch_time_minutes, 0);
  const totalLessonsCompleted = stats.reduce((sum, s) => sum + s.lessons_completed, 0);
  const averageCompletionRate = totalCollaborators > 0 
    ? (totalLessonsCompleted / totalCollaborators).toFixed(1) 
    : '0';

  const formatWatchTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    if (hours > 0) {
      return `${hours}h`;
    }
    return `${minutes}min`;
  };

  const recentlyActive = stats.filter(s => {
    if (!s.last_login_at) return false;
    const lastLogin = new Date(s.last_login_at);
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    return lastLogin > sevenDaysAgo;
  }).length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <Card className="!bg-gray-800 !border-gray-700">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="!text-sm !font-medium !text-gray-300">Total de Colaboradores</CardTitle>
          <Users className="h-4 w-4 !text-gray-400" />
        </CardHeader>
        <CardContent>
          <div className="!text-2xl !font-bold !text-white">{totalCollaborators}</div>
          <p className="!text-xs !text-gray-400">
            {activeCollaborators} ativos
          </p>
        </CardContent>
      </Card>

      <Card className="!bg-gray-800 !border-gray-700">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="!text-sm !font-medium !text-gray-300">Tempo Total de Estudo</CardTitle>
          <Clock className="h-4 w-4 !text-gray-400" />
        </CardHeader>
        <CardContent>
          <div className="!text-2xl !font-bold !text-white">{formatWatchTime(totalWatchTime)}</div>
          <p className="!text-xs !text-gray-400">
            {recentlyActive} ativos na semana
          </p>
        </CardContent>
      </Card>

      <Card className="!bg-gray-800 !border-gray-700">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="!text-sm !font-medium !text-gray-300">Lições Completadas</CardTitle>
          <BookOpen className="h-4 w-4 !text-gray-400" />
        </CardHeader>
        <CardContent>
          <div className="!text-2xl !font-bold !text-white">{totalLessonsCompleted}</div>
          <p className="!text-xs !text-gray-400">
            {averageCompletionRate} por colaborador
          </p>
        </CardContent>
      </Card>

      <Card className="!bg-gray-800 !border-gray-700">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="!text-sm !font-medium !text-gray-300">Engajamento</CardTitle>
          <Trophy className="h-4 w-4 !text-gray-400" />
        </CardHeader>
        <CardContent>
          <div className="!text-2xl !font-bold !text-white">{totalCollaborators > 0 ? Math.round((recentlyActive / totalCollaborators) * 100) : 0}%</div>
          <p className="!text-xs !text-gray-400">
            Últimos 7 dias
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
