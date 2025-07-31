
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Users, Video, Edit, Trash2, Building2, Globe } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { MentorshipSession } from "@/hooks/useMentorshipSessions";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

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
  // Buscar informações da empresa se a mentoria for exclusiva
  const { data: companyData } = useQuery({
    queryKey: ['company-info', session.target_company_id],
    queryFn: async () => {
      if (!session.target_company_id) return null;
      
      const { data, error } = await supabase
        .from('companies')
        .select('name')
        .eq('id', session.target_company_id)
        .single();
      
      if (error) {
        console.error('Error fetching company info:', error);
        return null;
      }
      
      return data;
    },
    enabled: !!session.target_company_id,
  });
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-500/20 text-blue-300 border border-blue-500/30';
      case 'live':
        return 'bg-green-500/20 text-green-300 border border-green-500/30';
      case 'completed':
        return 'bg-gray-500/20 text-gray-300 border border-gray-500/30';
      case 'cancelled':
        return 'bg-red-500/20 text-red-300 border border-red-500/30';
      default:
        return 'bg-gray-500/20 text-gray-300 border border-gray-500/30';
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
    <Card className="bg-gray-900/50 border-gray-700 shadow-xl">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg text-white">{session.title}</CardTitle>
            <div className="flex gap-2 mt-2">
              <Badge className={getStatusColor(session.status)}>
                {getStatusText(session.status)}
              </Badge>
              <Badge className={session.is_collective 
                ? "bg-purple-500/20 text-purple-300 border border-purple-500/30" 
                : "bg-orange-500/20 text-orange-300 border border-orange-500/30"
              }>
                {session.is_collective ? (
                  <>
                    <Globe className="h-3 w-3 mr-1" />
                    Coletiva
                  </>
                ) : (
                  <>
                    <Building2 className="h-3 w-3 mr-1" />
                    {companyData ? `Exclusiva - ${companyData.name}` : 'Exclusiva'}
                  </>
                )}
              </Badge>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(session)}
              className="!bg-gray-700 !text-white hover:!bg-gray-600 !border-gray-600 !shadow-md"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDelete(session.id)}
              className="!bg-red-600/20 !text-red-300 hover:!bg-red-600/30 !border-red-500/30 !shadow-md"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {session.description && (
          <p className="text-gray-300 mb-4">{session.description}</p>
        )}
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex items-center text-sm text-gray-300">
            <Calendar className="h-4 w-4 mr-2 text-gray-400" />
            {format(new Date(session.scheduled_at), "dd/MM/yyyy", { locale: ptBR })}
          </div>
          <div className="flex items-center text-sm text-gray-300">
            <Clock className="h-4 w-4 mr-2 text-gray-400" />
            {format(new Date(session.scheduled_at), "HH:mm", { locale: ptBR })} ({session.duration_minutes}min)
          </div>
          <div className="flex items-center text-sm text-gray-300">
            <Users className="h-4 w-4 mr-2 text-gray-400" />
            Máx. {session.max_participants || 100} participantes
          </div>
          {session.google_meet_url && (
            <div className="flex items-center text-sm text-gray-300">
              <Video className="h-4 w-4 mr-2 text-gray-400" />
              Google Meet
            </div>
          )}
        </div>

        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onViewParticipants(session)}
            className="!bg-gradient-to-r !from-blue-500 !to-cyan-600 hover:!from-blue-600 hover:!to-cyan-700 !text-white !border-0 !shadow-lg"
          >
            <Users className="h-4 w-4 mr-2" />
            Ver Participantes
          </Button>
          {session.google_meet_url && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(session.google_meet_url, '_blank')}
              className="!bg-gradient-to-r !from-green-500 !to-emerald-600 hover:!from-green-600 hover:!to-emerald-700 !text-white !border-0 !shadow-lg"
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
