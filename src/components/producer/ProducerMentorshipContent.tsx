
import { MentorshipSession } from "@/hooks/useMentorshipSessions";
import { ProducerMentorshipSessionCard } from "./ProducerMentorshipSessionCard";
import { ProducerMentorshipEmptyState } from "./ProducerMentorshipEmptyState";
import { ProducerMentorshipGrid } from "./ProducerMentorshipGrid";

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
        <p>Carregando sessões...</p>
      </div>
    );
  }

  const activeSessions = sessions.filter(session => session.is_active);

  if (activeSessions.length === 0) {
    return <ProducerMentorshipEmptyState />;
  }

  return (
    <ProducerMentorshipGrid
      sessions={activeSessions}
      onEdit={onEditSession}
      onDelete={onDeleteSession}
      onViewParticipants={onViewParticipants}
    />
  );
};
