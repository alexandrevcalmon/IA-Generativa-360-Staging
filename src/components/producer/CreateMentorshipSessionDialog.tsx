
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCreateMentorshipSession, useUpdateMentorshipSession, MentorshipSession } from "@/hooks/useMentorshipSessions";

interface CreateMentorshipSessionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingSession?: MentorshipSession | null;
}

export const CreateMentorshipSessionDialog = ({
  open,
  onOpenChange,
  editingSession,
}: CreateMentorshipSessionDialogProps) => {
  const [title, setTitle] = useState(editingSession?.title || "");
  const [description, setDescription] = useState(editingSession?.description || "");
  const [scheduledDate, setScheduledDate] = useState(
    editingSession ? new Date(editingSession.scheduled_at).toISOString().slice(0, 16) : ""
  );
  const [duration, setDuration] = useState(editingSession?.duration_minutes || 60);
  const [maxParticipants, setMaxParticipants] = useState(editingSession?.max_participants || 100);
  const [googleMeetUrl, setGoogleMeetUrl] = useState(editingSession?.google_meet_url || "");

  const createMutation = useCreateMentorshipSession();
  const updateMutation = useUpdateMentorshipSession();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title || !scheduledDate) return;

    const sessionData = {
      title,
      description,
      scheduled_at: new Date(scheduledDate).toISOString(),
      duration_minutes: duration,
      max_participants: maxParticipants,
      google_meet_url: googleMeetUrl || undefined,
      status: 'scheduled' as const,
      is_active: true,
    };

    try {
      if (editingSession) {
        await updateMutation.mutateAsync({
          id: editingSession.id,
          updates: sessionData,
        });
      } else {
        await createMutation.mutateAsync(sessionData);
      }
      
      onOpenChange(false);
      resetForm();
    } catch (error) {
      console.error('Error saving session:', error);
    }
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setScheduledDate("");
    setDuration(60);
    setMaxParticipants(100);
    setGoogleMeetUrl("");
  };

  const handleClose = () => {
    onOpenChange(false);
    if (!editingSession) {
      resetForm();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {editingSession ? "Editar Sessão" : "Nova Sessão de Mentoria"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Título *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Digite o título da sessão"
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descreva o conteúdo da sessão"
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="scheduled_date">Data e Hora *</Label>
            <Input
              id="scheduled_date"
              type="datetime-local"
              value={scheduledDate}
              onChange={(e) => setScheduledDate(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="duration">Duração (minutos)</Label>
              <Input
                id="duration"
                type="number"
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                min="15"
                max="480"
              />
            </div>
            <div>
              <Label htmlFor="max_participants">Máx. Participantes</Label>
              <Input
                id="max_participants"
                type="number"
                value={maxParticipants}
                onChange={(e) => setMaxParticipants(Number(e.target.value))}
                min="1"
                max="1000"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="google_meet_url">Link da Reunião (opcional)</Label>
            <Input
              id="google_meet_url"
              value={googleMeetUrl}
              onChange={(e) => setGoogleMeetUrl(e.target.value)}
              placeholder="https://meet.google.com/... ou outro link"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {editingSession ? "Atualizar" : "Criar"} Sessão
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
