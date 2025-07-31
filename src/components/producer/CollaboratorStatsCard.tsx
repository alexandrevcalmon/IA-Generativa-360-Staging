
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Clock, BookOpen, Trophy, Target, MoreVertical, Edit, UserX, UserCheck, Send } from "lucide-react";
import { CollaboratorStats } from "@/hooks/useCollaboratorAnalytics";
import { useState } from "react";
import { EditCollaboratorDialog } from "../EditCollaboratorDialog";
import { useToggleCollaboratorStatus } from "@/hooks/useCompanyCollaborators";
import { useResendActivationEmail } from "@/hooks/collaborators/useResendActivationEmail";
import { useToast } from "@/hooks/use-toast";

interface CollaboratorStatsCardProps {
  stats: CollaboratorStats;
}

export const CollaboratorStatsCard = ({ stats }: CollaboratorStatsCardProps) => {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const toggleStatusMutation = useToggleCollaboratorStatus();
  const resendActivationEmailMutation = useResendActivationEmail();
  const { toast } = useToast();

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

  const handleToggleStatus = async () => {
    try {
      await toggleStatusMutation.mutateAsync({
        collaboratorId: stats.collaborator.id,
        companyId: stats.collaborator.company_id || '',
        currentStatus: stats.collaborator.is_active
      });
      
      const action = stats.collaborator.is_active ? "bloqueado" : "desbloqueado";
      toast.success({
        title: `Colaborador ${action}!`,
        description: `${stats.collaborator.name} foi ${action} com sucesso.`
      });
    } catch (error: any) {
      toast.error({
        title: "Erro ao alterar status",
        description: error.message || "Ocorreu um erro inesperado."
      });
    }
  };

  const handleResendActivationEmail = async () => {
    try {
      await resendActivationEmailMutation.mutateAsync({
        collaboratorId: stats.collaborator.id,
        companyId: stats.collaborator.company_id || ''
      });
      toast.success({
        title: "E-mail de ativação reenviado!",
        description: `E-mail de ativação para ${stats.collaborator.name} foi reenviado.`
      });
    } catch (error: any) {
      toast.error({
        title: "Erro ao reenviar e-mail de ativação",
        description: error.message || "Ocorreu um erro inesperado."
      });
    }
  };

  // Converter stats para o formato esperado pelo EditCollaboratorDialog
  const collaboratorForEdit = {
    id: stats.collaborator.id,
    name: stats.collaborator.name,
    email: stats.collaborator.email,
    position: stats.collaborator.position || '',
    phone: '',
    is_active: stats.collaborator.is_active,
    company_id: stats.collaborator.company_id || '',
    needs_complete_registration: false
  };

  return (
    <TooltipProvider>
      <div className="flex items-center justify-between p-4 !bg-gray-700 !border-gray-600 rounded-lg hover:!shadow-lg transition-shadow">
        {/* Colaborador Info */}
        <div className="flex items-center space-x-3 flex-1 min-w-0">
          <Avatar className="h-10 w-10">
            <AvatarFallback className="!bg-blue-500/20 !text-blue-300 text-sm">
              {getInitials(stats.collaborator.name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <h3 className="font-medium !text-white truncate">
                {stats.collaborator.name}
              </h3>
              <Badge variant={stats.collaborator.is_active ? "default" : "secondary"} className="text-xs">
                {stats.collaborator.is_active ? "Ativo" : "Inativo"}
              </Badge>
            </div>
            <p className="text-sm !text-gray-300 truncate">{stats.collaborator.email}</p>
            {stats.collaborator.company_name && (
              <p className="text-xs !text-blue-400 truncate font-medium">{stats.collaborator.company_name}</p>
            )}
            {stats.collaborator.position && (
              <p className="text-xs !text-gray-400 truncate">{stats.collaborator.position}</p>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center space-x-6 text-sm">
          <Tooltip>
            <TooltipTrigger>
              <div className="flex items-center space-x-1 !text-blue-400">
                <Clock className="h-4 w-4" />
                <span className="font-medium">{formatLastLogin(stats.last_login_at)}</span>
              </div>
            </TooltipTrigger>
            <TooltipContent className="!bg-gray-800 !border-gray-700">
              <p className="!text-white">Último acesso à plataforma</p>
            </TooltipContent>
          </Tooltip>
          
          <Tooltip>
            <TooltipTrigger>
              <div className="flex items-center space-x-1 !text-green-400">
                <BookOpen className="h-4 w-4" />
                <span className="font-medium">{stats.lessons_completed}</span>
              </div>
            </TooltipTrigger>
            <TooltipContent className="!bg-gray-800 !border-gray-700">
              <p className="!text-white">Lições completadas</p>
            </TooltipContent>
          </Tooltip>
          
          <Tooltip>
            <TooltipTrigger>
              <div className="flex items-center space-x-1 !text-yellow-400">
                <Trophy className="h-4 w-4" />
                <span className="font-medium">{formatWatchTime(stats.total_watch_time_minutes)}</span>
              </div>
            </TooltipTrigger>
            <TooltipContent className="!bg-gray-800 !border-gray-700">
              <p className="!text-white">Tempo total de estudo</p>
            </TooltipContent>
          </Tooltip>
          
          <Tooltip>
            <TooltipTrigger>
              <div className="flex items-center space-x-1 !text-purple-400">
                <Target className="h-4 w-4" />
                <span className="font-medium">{stats.courses_enrolled}</span>
              </div>
            </TooltipTrigger>
            <TooltipContent className="!bg-gray-800 !border-gray-700">
              <p className="!text-white">Cursos matriculados</p>
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Additional Info */}
        <div className="flex items-center space-x-4 text-xs !text-gray-400 ml-6">
          <span>Nível {stats.current_level}</span>
          <span>{stats.total_points} pts</span>
          <span>{stats.streak_days} dias</span>
        </div>

        {/* Menu de 3 pontinhos */}
        <div className="ml-4 flex-shrink-0">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm"
                className="!text-gray-400 hover:!text-gray-200 hover:!bg-gray-600 transition-all duration-300"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              align="end"
              className="!bg-gray-800 !border-gray-700 shadow-lg"
            >
              <DropdownMenuItem 
                onClick={() => setIsEditDialogOpen(true)}
                className="!text-gray-300 hover:!text-white hover:!bg-gray-700 transition-all duration-200"
              >
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={handleResendActivationEmail}
                className="!text-blue-400 hover:!text-blue-300 hover:!bg-blue-500/20 transition-all duration-200"
              >
                <Send className="h-4 w-4 mr-2" />
                Reenviar E-mail
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={handleToggleStatus}
                className={`transition-all duration-200 ${
                  stats.collaborator.is_active 
                    ? "!text-orange-400 hover:!text-orange-300 hover:!bg-orange-500/20" 
                    : "!text-green-400 hover:!text-green-300 hover:!bg-green-500/20"
                }`}
              >
                {stats.collaborator.is_active ? (
                  <>
                    <UserX className="h-4 w-4 mr-2" />
                    Bloquear
                  </>
                ) : (
                  <>
                    <UserCheck className="h-4 w-4 mr-2" />
                    Desbloquear
                  </>
                )}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Dialog de Edição */}
      <EditCollaboratorDialog
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        collaborator={collaboratorForEdit}
        companyId={stats.collaborator.company_id || ''}
      />
    </TooltipProvider>
  );
};
