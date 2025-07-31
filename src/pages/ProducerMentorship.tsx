import { useState, useMemo } from "react";
import { PageLayout } from "@/components/PageLayout";
import { PageSection } from "@/components/PageSection";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { ProducerMentorshipContent } from "@/components/producer/ProducerMentorshipContent";
import { CreateMentorshipSessionDialog } from "@/components/producer/CreateMentorshipSessionDialog";
import { SessionParticipantsDialog } from "@/components/producer/SessionParticipantsDialog";
import { MentorshipFilters, MentorshipType, PeriodType } from "@/components/producer/MentorshipFilters";
import { useMentorshipSessions, useUpdateMentorshipSession, MentorshipSession } from "@/hooks/useMentorshipSessions";
import { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, isWithinInterval } from "date-fns";

const ProducerMentorship = () => {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingSession, setEditingSession] = useState<MentorshipSession | null>(null);
  const [showParticipantsDialog, setShowParticipantsDialog] = useState(false);
  const [selectedSession, setSelectedSession] = useState<MentorshipSession | null>(null);

  // Estados dos filtros
  const [typeFilter, setTypeFilter] = useState<MentorshipType>('all');
  const [periodFilter, setPeriodFilter] = useState<PeriodType>('future');
  const [customDateRange, setCustomDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined,
  });

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

  // Lógica de filtragem
  const filteredSessions = useMemo(() => {
    let filtered = sessions.filter(session => session.is_active);

    // Filtro por tipo
    if (typeFilter !== 'all') {
      filtered = filtered.filter(session => {
        if (typeFilter === 'collective') {
          return session.is_collective;
        } else if (typeFilter === 'exclusive') {
          return !session.is_collective;
        }
        return true;
      });
    }

    // Filtro por período
    if (periodFilter !== 'all') {
      const now = new Date();
      
      filtered = filtered.filter(session => {
        const sessionDate = new Date(session.scheduled_at);
        
        switch (periodFilter) {
          case 'future':
            // Todas as mentorias futuras (a partir de agora)
            return sessionDate >= now;
          case 'day':
            // Mentorias de hoje (incluindo as que já passaram hoje)
            return isWithinInterval(sessionDate, {
              start: startOfDay(now),
              end: endOfDay(now)
            });
          case 'week':
            // Mentorias desta semana (de hoje até o final da semana)
            return isWithinInterval(sessionDate, {
              start: startOfDay(now),
              end: endOfWeek(now, { weekStartsOn: 1 })
            });
          case 'month':
            // Mentorias deste mês (de hoje até o final do mês)
            return isWithinInterval(sessionDate, {
              start: startOfDay(now),
              end: endOfMonth(now)
            });
          case 'custom':
            if (customDateRange.from && customDateRange.to) {
              return isWithinInterval(sessionDate, {
                start: startOfDay(customDateRange.from),
                end: endOfDay(customDateRange.to)
              });
            }
            return true;
          default:
            return true;
        }
      });
    }

    return filtered;
  }, [sessions, typeFilter, periodFilter, customDateRange]);

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
        {/* Filtros */}
        <MentorshipFilters
          typeFilter={typeFilter}
          onTypeFilterChange={setTypeFilter}
          periodFilter={periodFilter}
          onPeriodFilterChange={setPeriodFilter}
          customDateRange={customDateRange}
          onCustomDateRangeChange={setCustomDateRange}
        />

        {/* Conteúdo das Mentorias */}
        <ProducerMentorshipContent
          sessions={filteredSessions}
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
