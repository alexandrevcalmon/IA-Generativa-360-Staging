
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Users, Video, Edit, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { MentorshipSession } from "@/hooks/useMentorshipSessions";

interface ProducerMentorshipSessionCardProps {
  session: MentorshipSession;
  onEdit: (session: MentorshipSession) => void;
  onDelete: (sessionId: string) => void;
  onViewParticipants: (session: MentorshipSession) => void;
}

export const ProducerMentorshipSessionCard = ({
  session,
  onEdit,
  onDelete,
  onViewParticipants,
}: ProducerMentorshipSessionCardProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'live':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'Agendada';
      case 'live':
        return 'Ao Vivo';
      case 'completed':
        return 'Concluída';
      case 'cancelled':
        return 'Cancelada';
      default:
        return status;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{session.title}</CardTitle>
            <Badge className={getStatusColor(session.status)}>
              {getStatusText(session.status)}
            </Badge>
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(session)}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDelete(session.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {session.description && (
          <p className="text-gray-600 mb-4">{session.description}</p>
        )}
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex items-center text-sm text-gray-600">
            <Calendar className="h-4 w-4 mr-2" />
            {format(new Date(session.scheduled_at), "dd/MM/yyyy", { locale: ptBR })}
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <Clock className="h-4 w-4 mr-2" />
            {format(new Date(session.scheduled_at), "HH:mm", { locale: ptBR })} ({session.duration_minutes}min)
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <Users className="h-4 w-4 mr-2" />
            Máx. {session.max_participants || 100} participantes
          </div>
          {session.google_meet_url && (
            <div className="flex items-center text-sm text-gray-600">
              <Video className="h-4 w-4 mr-2" />
              Google Meet
            </div>
          )}
        </div>

        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onViewParticipants(session)}
          >
            <Users className="h-4 w-4 mr-2" />
            Ver Participantes
          </Button>
          {session.google_meet_url && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(session.google_meet_url, '_blank')}
            >
              <Video className="h-4 w-4 mr-2" />
              Abrir Meet
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
