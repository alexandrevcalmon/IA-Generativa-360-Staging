
import { MentorshipSession } from "@/hooks/useMentorshipSessions";
import { ProducerMentorshipSessionCard } from "./ProducerMentorshipSessionCard";
import { ProducerMentorshipEmptyState } from "./ProducerMentorshipEmptyState";
import { ProducerMentorshipGrid } from "./ProducerMentorshipGrid";
import { Badge } from "@/components/ui/badge";
import { Users, Filter } from "lucide-react";

interface ProducerMentorshipContentProps {
  sessions: MentorshipSession[];
  isLoading: boolean;
  onEditSession: (session: MentorshipSession) => void;
  onDeleteSession: (sessionId: string) => void;
  onViewParticipants: (session: MentorshipSession) => void;
}

export const ProducerMentorshipContent = ({
  sessions,
  isLoading,
  onEditSession,
  onDeleteSession,
  onViewParticipants
}: ProducerMentorshipContentProps) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <p className="text-gray-300">Carregando sessões...</p>
      </div>
    );
  }

  const activeSessions = sessions.filter(session => session.is_active);

  if (activeSessions.length === 0) {
    return <ProducerMentorshipEmptyState />;
  }

  return (
    <div className="space-y-6">
      {/* Informações dos Filtros */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-orange-400" />
            <span className="text-white font-medium">
              {activeSessions.length} sessão{activeSessions.length !== 1 ? 'ões' : ''} encontrada{activeSessions.length !== 1 ? 's' : ''}
            </span>
          </div>
          <Badge className="bg-gray-700/50 border border-gray-600 text-gray-300">
            <Filter className="h-3 w-3 mr-1" />
            Filtros aplicados
          </Badge>
        </div>
      </div>

      {/* Grid das Mentorias */}
      <ProducerMentorshipGrid
        sessions={activeSessions}
        onEdit={onEditSession}
        onDelete={onDeleteSession}
        onViewParticipants={onViewParticipants}
      />
    </div>
  );
};
