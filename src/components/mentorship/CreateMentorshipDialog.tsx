
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useCreateCompanyMentorship } from "@/hooks/useCompanyMentorshipMutations";
import { toast } from "sonner";

interface CreateMentorshipDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CreateMentorshipDialog = ({ open, onOpenChange }: CreateMentorshipDialogProps) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [maxParticipants, setMaxParticipants] = useState(50);
  const [meetUrl, setMeetUrl] = useState("");

  const createMutation = useCreateCompanyMentorship();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !scheduledAt) {
      toast.error("Título e data são obrigatórios");
      return;
    }

    try {
      await createMutation.mutateAsync({
        title,
        description,
        scheduled_at: scheduledAt,
        duration_minutes: durationMinutes,
        max_participants: maxParticipants,
        meet_url: meetUrl
      });
      
      // Reset form
      setTitle("");
      setDescription("");
      setScheduledAt("");
      setDurationMinutes(60);
      setMaxParticipants(50);
      setMeetUrl("");
      
      onOpenChange(false);
    } catch (error) {
      console.error('Error creating mentorship:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Nova Sessão de Mentoria</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Título *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Digite o título da mentoria"
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descreva o conteúdo da mentoria"
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="scheduledAt">Data e Hora *</Label>
            <Input
              id="scheduledAt"
              type="datetime-local"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="duration">Duração (min)</Label>
              <Input
                id="duration"
                type="number"
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Number(e.target.value))}
                min={15}
                max={300}
              />
            </div>

            <div>
              <Label htmlFor="maxParticipants">Máx. Participantes</Label>
              <Input
                id="maxParticipants"
                type="number"
                value={maxParticipants}
                onChange={(e) => setMaxParticipants(Number(e.target.value))}
                min={1}
                max={1000}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="meetUrl">Link da Reunião</Label>
            <Input
              id="meetUrl"
              value={meetUrl}
              onChange={(e) => setMeetUrl(e.target.value)}
              placeholder="https://meet.google.com/..."
            />
          </div>

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={createMutation.isPending}
              className="flex-1"
            >
              {createMutation.isPending ? "Criando..." : "Criar Sessão"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
