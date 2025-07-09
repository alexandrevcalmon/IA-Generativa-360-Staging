
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Clock, BookOpen, Trophy, Target } from "lucide-react";
import { CollaboratorStats } from "@/hooks/useCollaboratorAnalytics";

interface CollaboratorStatsCardProps {
  stats: CollaboratorStats;
}

export const CollaboratorStatsCard = ({ stats }: CollaboratorStatsCardProps) => {
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const formatLastLogin = (lastLogin: string | null) => {
    if (!lastLogin) return 'Nunca';
    const date = new Date(lastLogin);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Hoje';
    if (diffDays === 1) return 'Ontem';
    if (diffDays < 7) return `${diffDays} dias atrás`;
    return date.toLocaleDateString('pt-BR');
  };

  const formatWatchTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${remainingMinutes}min`;
    }
    return `${remainingMinutes}min`;
  };

  return (
    <TooltipProvider>
      <div className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:shadow-sm transition-shadow">
        {/* Colaborador Info */}
        <div className="flex items-center space-x-3 flex-1 min-w-0">
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-blue-100 text-blue-600 text-sm">
              {getInitials(stats.collaborator.name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <h3 className="font-medium text-gray-900 truncate">
                {stats.collaborator.name}
              </h3>
              <Badge variant={stats.collaborator.is_active ? "default" : "secondary"} className="text-xs">
                {stats.collaborator.is_active ? "Ativo" : "Inativo"}
              </Badge>
            </div>
            <p className="text-sm text-gray-500 truncate">{stats.collaborator.email}</p>
            {stats.collaborator.position && (
              <p className="text-xs text-gray-400 truncate">{stats.collaborator.position}</p>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center space-x-6 text-sm">
          <Tooltip>
            <TooltipTrigger>
              <div className="flex items-center space-x-1 text-blue-600">
                <Clock className="h-4 w-4" />
                <span className="font-medium">{formatLastLogin(stats.last_login_at)}</span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Último acesso à plataforma</p>
            </TooltipContent>
          </Tooltip>
          
          <Tooltip>
            <TooltipTrigger>
              <div className="flex items-center space-x-1 text-green-600">
                <BookOpen className="h-4 w-4" />
                <span className="font-medium">{stats.lessons_completed}</span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Lições completadas</p>
            </TooltipContent>
          </Tooltip>
          
          <Tooltip>
            <TooltipTrigger>
              <div className="flex items-center space-x-1 text-yellow-600">
                <Trophy className="h-4 w-4" />
                <span className="font-medium">{formatWatchTime(stats.total_watch_time_minutes)}</span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Tempo total de estudo</p>
            </TooltipContent>
          </Tooltip>
          
          <Tooltip>
            <TooltipTrigger>
              <div className="flex items-center space-x-1 text-purple-600">
                <Target className="h-4 w-4" />
                <span className="font-medium">{stats.courses_enrolled}</span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Cursos matriculados</p>
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Additional Info */}
        <div className="flex items-center space-x-4 text-xs text-gray-500 ml-6">
          <span>Nível {stats.current_level}</span>
          <span>{stats.total_points} pts</span>
          <span>{stats.streak_days} dias</span>
        </div>
      </div>
    </TooltipProvider>
  );
};
