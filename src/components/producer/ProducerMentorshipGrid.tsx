
import { MentorshipSession } from "@/hooks/useMentorshipSessions";
import { ProducerMentorshipSessionCard } from "./ProducerMentorshipSessionCard";

interface ProducerMentorshipGridProps {
  sessions: MentorshipSession[];
  onEdit: (session: MentorshipSession) => void;
  onDelete: (sessionId: string) => void;
  onViewParticipants: (session: MentorshipSession) => void;
}

export const ProducerMentorshipGrid = ({
  sessions,
  onEdit,
  onDelete,
  onViewParticipants
}: ProducerMentorshipGridProps) => {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {sessions.map((session) => (
        <ProducerMentorshipSessionCard
          key={session.id}
          session={session}
          onEdit={onEdit}
          onDelete={onDelete}
          onViewParticipants={onViewParticipants}
        />
      ))}
    </div>
  );
};
