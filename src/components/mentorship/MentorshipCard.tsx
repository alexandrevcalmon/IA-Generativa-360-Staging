
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Users, Video, UserPlus, UserMinus, Globe } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CompanyMentorship } from "@/hooks/useCompanyMentorships";

interface MentorshipCardProps {
  mentorship: CompanyMentorship;
  onEnroll?: (sessionId: string) => void;
  onUnenroll?: (sessionId: string) => void;
  enrolling?: boolean;
  unenrolling?: boolean;
  isPast?: boolean;
}

export const MentorshipCard = ({ 
  mentorship, 
  onEnroll, 
  onUnenroll, 
  enrolling, 
  unenrolling,
  isPast = false
}: MentorshipCardProps) => {
  const getStatusBadge = (status: string, scheduledAt: string) => {
    const now = new Date();
    const sessionDate = new Date(scheduledAt);
    
    if (status === 'completed') {
      return <Badge className="bg-green-100 text-green-700">Concluída</Badge>;
    }
    
    if (status === 'cancelled') {
      return <Badge variant="destructive">Cancelada</Badge>;
    }
    
    if (sessionDate > now) {
      return <Badge className="bg-blue-100 text-blue-700">Agendada</Badge>;
    }
    
    return <Badge className="bg-yellow-100 text-yellow-700">Em andamento</Badge>;
  };

  const getTypeBadge = (type: string) => {
    if (type === 'collective') {
      return <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
        <Globe className="h-3 w-3 mr-1" />
        Coletiva
      </Badge>;
    }
    return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
      Empresa
    </Badge>;
  };

  const formatDateTime = (dateString: string) => {
    return format(new Date(dateString), "dd 'de' MMMM 'às' HH:mm", { locale: ptBR });
  };

  return (
    <Card className={`hover:shadow-md transition-shadow ${isPast ? 'opacity-75' : ''}`}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2 flex-wrap gap-2">
              <h3 className="font-semibold text-gray-900 text-lg">
                {mentorship.title}
              </h3>
              {getTypeBadge(mentorship.type)}
              {getStatusBadge(mentorship.status, mentorship.scheduled_at)}
            </div>
            
            {mentorship.description && (
              <p className="text-gray-600 mb-3">{mentorship.description}</p>
            )}
            
            <div className="flex flex-wrap gap-4 text-sm text-gray-600">
              <div className="flex items-center space-x-1">
                <Calendar className="h-4 w-4" />
                <span>{formatDateTime(mentorship.scheduled_at)}</span>
              </div>
              
              <div className="flex items-center space-x-1">
                <Clock className="h-4 w-4" />
                <span>{mentorship.duration_minutes} minutos</span>
              </div>
              
              <div className="flex items-center space-x-1">
                <Users className="h-4 w-4" />
                <span>
                  {isPast ? 
                    `${mentorship.participants_count} participantes` :
                    `${mentorship.participants_count}/${mentorship.max_participants} participantes`
                  }
                </span>
              </div>
            </div>
          </div>
          
          {!isPast && (
            <div className="flex flex-col gap-2 ml-4">
              {mentorship.type === 'collective' && new Date(mentorship.scheduled_at) > new Date() && (
                <>
                  {mentorship.is_enrolled ? (
                    <Button 
                      variant="outline"
                      size="sm" 
                      onClick={() => onUnenroll?.(mentorship.id)}
                      disabled={unenrolling}
                      className="flex items-center space-x-1"
                    >
                      <UserMinus className="h-4 w-4" />
                      <span>Cancelar Inscrição</span>
                    </Button>
                  ) : (
                    <Button 
                      size="sm" 
                      onClick={() => onEnroll?.(mentorship.id)}
                      disabled={enrolling}
                      className="flex items-center space-x-1"
                    >
                      <UserPlus className="h-4 w-4" />
                      <span>Inscrever-se</span>
                    </Button>
                  )}
                </>
              )}

              {(mentorship.meet_url || mentorship.google_meet_url) && (
                <Button 
                  size="sm" 
                  className="flex items-center space-x-1"
                  onClick={() => window.open(mentorship.meet_url || mentorship.google_meet_url, '_blank')}
                >
                  <Video className="h-4 w-4" />
                  <span>Entrar na Sessão</span>
                </Button>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
