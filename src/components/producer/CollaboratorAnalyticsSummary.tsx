
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
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total de Colaboradores</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalCollaborators}</div>
          <p className="text-xs text-muted-foreground">
            {activeCollaborators} ativos
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Tempo Total de Estudo</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatWatchTime(totalWatchTime)}</div>
          <p className="text-xs text-muted-foreground">
            {recentlyActive} ativos na semana
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Lições Completadas</CardTitle>
          <BookOpen className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalLessonsCompleted}</div>
          <p className="text-xs text-muted-foreground">
            {averageCompletionRate} por colaborador
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Engajamento</CardTitle>
          <Trophy className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{Math.round((recentlyActive / totalCollaborators) * 100)}%</div>
          <p className="text-xs text-muted-foreground">
            Últimos 7 dias
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
