
import { useState } from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ProducerMentorshipHeader } from "@/components/producer/ProducerMentorshipHeader";
import { ProducerMentorshipContent } from "@/components/producer/ProducerMentorshipContent";
import { CreateMentorshipSessionDialog } from "@/components/producer/CreateMentorshipSessionDialog";
import { SessionParticipantsDialog } from "@/components/producer/SessionParticipantsDialog";
import { useMentorshipSessions, useUpdateMentorshipSession, MentorshipSession } from "@/hooks/useMentorshipSessions";

const ProducerMentorship = () => {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingSession, setEditingSession] = useState<MentorshipSession | null>(null);
  const [showParticipantsDialog, setShowParticipantsDialog] = useState(false);
  const [selectedSession, setSelectedSession] = useState<MentorshipSession | null>(null);

  const { data: sessions = [], isLoading } = useMentorshipSessions();
  const updateMutation = useUpdateMentorshipSession();

  const handleEditSession = (session: MentorshipSession) => {
    setEditingSession(session);
    setShowCreateDialog(true);
  };

  const handleDeleteSession = async (sessionId: string) => {
    if (confirm('Tem certeza que deseja excluir esta sessão?')) {
      try {
        await updateMutation.mutateAsync({
          id: sessionId,
          updates: { is_active: false, status: 'cancelled' }
        });
      } catch (error) {
        console.error('Error deleting session:', error);
      }
    }
  };

  const handleViewParticipants = (session: MentorshipSession) => {
    setSelectedSession(session);
    setShowParticipantsDialog(true);
  };

  const handleCreateSession = () => {
    setEditingSession(null);
    setShowCreateDialog(true);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <header className="border-b bg-white px-6 py-4">
        <div className="flex items-center space-x-4">
          <SidebarTrigger />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Sessões de Mentoria</h1>
            <p className="text-gray-600">Gerencie suas sessões de mentoria e participantes</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-auto p-6 bg-gray-50">
        <div className="max-w-6xl mx-auto space-y-6">
          <ProducerMentorshipHeader onCreateSession={handleCreateSession} />

          <ProducerMentorshipContent
            sessions={sessions}
            isLoading={isLoading}
            onEditSession={handleEditSession}
            onDeleteSession={handleDeleteSession}
            onViewParticipants={handleViewParticipants}
          />
        </div>
      </div>

      <CreateMentorshipSessionDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        editingSession={editingSession}
      />

      <SessionParticipantsDialog
        open={showParticipantsDialog}
        onOpenChange={setShowParticipantsDialog}
        session={selectedSession}
      />
    </div>
  );
};

export default ProducerMentorship;
