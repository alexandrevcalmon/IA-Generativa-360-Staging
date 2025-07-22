import { useState } from "react";
import { PageLayout } from "@/components/PageLayout";
import { PageSection } from "@/components/PageSection";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
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

  // Header content com botão de criar sessão
  const headerContent = (
    <Button 
      onClick={handleCreateSession}
      className="!bg-gradient-to-r !from-orange-500 !to-red-600 hover:!from-orange-600 hover:!to-red-700 !text-white !border-0 !shadow-lg"
    >
      <Plus className="h-4 w-4 mr-2" />
      Nova Sessão
    </Button>
  );

  return (
    <PageLayout
      title="Sessões de Mentoria"
      subtitle="Gerencie suas sessões de mentoria e participantes"
      headerContent={headerContent}
      background="dark"
      className="dark-theme-override"
    >
      <PageSection>
        <ProducerMentorshipContent
          sessions={sessions}
          isLoading={isLoading}
          onEditSession={handleEditSession}
          onDeleteSession={handleDeleteSession}
          onViewParticipants={handleViewParticipants}
        />
      </PageSection>

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
    </PageLayout>
  );
};

export default ProducerMentorship;