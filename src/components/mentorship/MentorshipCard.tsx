
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
      return <Badge className="bg-emerald-900/20 border border-emerald-500/30 text-emerald-400">Concluída</Badge>;
    }
    
    if (status === 'cancelled') {
      return <Badge className="bg-red-900/20 border border-red-500/30 text-red-400">Cancelada</Badge>;
    }
    
    if (sessionDate > now) {
      return <Badge className="bg-blue-900/20 border border-blue-500/30 text-blue-400">Agendada</Badge>;
    }
    
    return <Badge className="bg-yellow-900/20 border border-yellow-500/30 text-yellow-400">Em andamento</Badge>;
  };

  const getTypeBadge = (type: string) => {
    if (type === 'collective') {
      return <Badge className="bg-purple-900/20 border border-purple-500/30 text-purple-400">
        <Globe className="h-3 w-3 mr-1" />
        Coletiva
      </Badge>;
    }
    if (type === 'exclusive') {
      return <Badge className="bg-orange-900/20 border border-orange-500/30 text-orange-400">
        <Users className="h-3 w-3 mr-1" />
        Exclusiva
      </Badge>;
    }
    return <Badge className="bg-blue-900/20 border border-blue-500/30 text-blue-400">
      Empresa
    </Badge>;
  };

  const formatDateTime = (dateString: string) => {
    return format(new Date(dateString), "dd 'de' MMMM 'às' HH:mm", { locale: ptBR });
  };

  return (
    <Card className={`bg-transparent border-gray-600/30 hover:bg-gray-700/20 transition-all duration-200 ${isPast ? 'opacity-75' : ''}`}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2 flex-wrap gap-2">
              <h3 className="font-semibold text-white text-lg">
                {mentorship.title}
              </h3>
              {getTypeBadge(mentorship.type)}
              {getStatusBadge(mentorship.status, mentorship.scheduled_at)}
            </div>
            
            {mentorship.description && (
              <p className="text-gray-400 mb-3">{mentorship.description}</p>
            )}
            
            <div className="space-y-3">
              {/* Data e Hora em Destaque */}
              <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-3">
                <div className="flex items-center gap-2 text-blue-300 font-medium">
                  <Calendar className="h-5 w-5" />
                  <span className="text-lg">{formatDateTime(mentorship.scheduled_at)}</span>
                </div>
              </div>
              
              {/* Outras Informações */}
              <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex items-center space-x-1">
                  <Clock className="h-4 w-4 text-gray-400" />
                  <span className="text-white font-bold">{mentorship.duration_minutes} minutos</span>
                </div>
                
                <div className="flex items-center space-x-1">
                  <Users className="h-4 w-4 text-gray-400" />
                  <span className="text-white font-bold">
                    {isPast ? 
                      `${mentorship.participants_count} participantes` :
                      `${mentorship.participants_count}/${mentorship.max_participants} participantes`
                    }
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          {!isPast && (
            <div className="flex flex-col gap-2 ml-4 w-56 min-w-[180px]">
              {/* Botão único: Participar (preto) ou Acessar Reunião (verde) */}
              {mentorship.type === 'collective' && new Date(mentorship.scheduled_at) > new Date() && (
                (mentorship.meet_url || mentorship.google_meet_url) ? (
                  <Button
                    size="sm"
                    className="flex items-center space-x-1 w-full bg-black text-white font-semibold hover:bg-gray-800 border border-gray-600"
                    onClick={() => window.open(mentorship.meet_url || mentorship.google_meet_url, '_blank')}
                  >
                    <Video className="h-4 w-4" />
                    <span>Participar</span>
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    className="flex items-center space-x-1 w-full bg-gray-700 text-gray-300 font-semibold border border-gray-600"
                    disabled
                  >
                    <Video className="h-4 w-4" />
                    <span>Link em breve</span>
                  </Button>
                )
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
