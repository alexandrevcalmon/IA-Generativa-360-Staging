
import { useState, useEffect } from "react";
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
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [scheduledDate, setScheduledDate] = useState("");
  const [duration, setDuration] = useState(60);
  const [maxParticipants, setMaxParticipants] = useState(100);
  const [googleMeetUrl, setGoogleMeetUrl] = useState("");

  // Atualizar campos quando editingSession muda
  useEffect(() => {
    if (editingSession) {
      console.log('🔄🔄🔄 Atualizando campos da mentoria 🔄🔄🔄');
      console.log('editingSession:', editingSession);
      setTitle(editingSession.title || "");
      setDescription(editingSession.description || "");
      setScheduledDate(
        editingSession.scheduled_at 
          ? new Date(editingSession.scheduled_at).toISOString().slice(0, 16) 
          : ""
      );
      setDuration(editingSession.duration_minutes || 60);
      setMaxParticipants(editingSession.max_participants || 100);
      setGoogleMeetUrl(editingSession.google_meet_url || "");
      console.log('🔄🔄🔄 Campos atualizados 🔄🔄🔄');
    } else {
      // Reset form quando não há sessão para editar
      setTitle("");
      setDescription("");
      setScheduledDate("");
      setDuration(60);
      setMaxParticipants(100);
      setGoogleMeetUrl("");
    }
  }, [editingSession]);

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
      <DialogContent className="sm:max-w-[500px] !bg-gray-900 !border-gray-700">
        <DialogHeader>
          <DialogTitle className="!text-white">
            {editingSession ? "Editar Sessão" : "Nova Sessão de Mentoria"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title" className="!text-gray-300">Título *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Digite o título da sessão"
              required
              className="!bg-gray-800 !border-gray-600 !text-white !placeholder-gray-400 focus:!border-blue-500 focus:!ring-blue-500"
            />
          </div>

          <div>
            <Label htmlFor="description" className="!text-gray-300">Descrição</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descreva o conteúdo da sessão"
              rows={3}
              className="!bg-gray-800 !border-gray-600 !text-white !placeholder-gray-400 focus:!border-blue-500 focus:!ring-blue-500"
            />
          </div>

          <div>
            <Label htmlFor="scheduled_date" className="!text-gray-300">Data e Hora *</Label>
            <Input
              id="scheduled_date"
              type="datetime-local"
              value={scheduledDate}
              onChange={(e) => setScheduledDate(e.target.value)}
              required
              className="!bg-gray-800 !border-gray-600 !text-white focus:!border-blue-500 focus:!ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="duration" className="!text-gray-300">Duração (minutos)</Label>
              <Input
                id="duration"
                type="number"
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                min="15"
                max="480"
                className="!bg-gray-800 !border-gray-600 !text-white focus:!border-blue-500 focus:!ring-blue-500"
              />
            </div>
            <div>
              <Label htmlFor="max_participants" className="!text-gray-300">Máx. Participantes</Label>
              <Input
                id="max_participants"
                type="number"
                value={maxParticipants}
                onChange={(e) => setMaxParticipants(Number(e.target.value))}
                min="1"
                max="1000"
                className="!bg-gray-800 !border-gray-600 !text-white focus:!border-blue-500 focus:!ring-blue-500"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="google_meet_url" className="!text-gray-300">Link da Reunião (opcional)</Label>
            <Input
              id="google_meet_url"
              value={googleMeetUrl}
              onChange={(e) => setGoogleMeetUrl(e.target.value)}
              placeholder="https://meet.google.com/... ou outro link"
              className="!bg-gray-800 !border-gray-600 !text-white !placeholder-gray-400 focus:!border-blue-500 focus:!ring-blue-500"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleClose}
              className="!bg-gray-800 !border-gray-600 !text-gray-300 hover:!bg-gray-700 hover:!text-white"
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={createMutation.isPending || updateMutation.isPending}
              className="!bg-gradient-to-r !from-blue-600 !to-purple-600 hover:!from-blue-700 hover:!to-purple-700 !text-white"
            >
              {editingSession ? "Atualizar" : "Criar"} Sessão
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
