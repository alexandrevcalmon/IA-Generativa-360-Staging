
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
      <DialogContent className="max-w-md !bg-gray-900 !border-gray-700">
        <DialogHeader>
          <DialogTitle className="!text-white">Nova Sessão de Mentoria</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title" className="!text-gray-300">Título *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Digite o título da mentoria"
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
              placeholder="Descreva o conteúdo da mentoria"
              rows={3}
              className="!bg-gray-800 !border-gray-600 !text-white !placeholder-gray-400 focus:!border-blue-500 focus:!ring-blue-500"
            />
          </div>

          <div>
            <Label htmlFor="scheduledAt" className="!text-gray-300">Data e Hora *</Label>
            <Input
              id="scheduledAt"
              type="datetime-local"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
              required
              className="!bg-gray-800 !border-gray-600 !text-white focus:!border-blue-500 focus:!ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="duration" className="!text-gray-300">Duração (min)</Label>
              <Input
                id="duration"
                type="number"
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Number(e.target.value))}
                min={15}
                max={300}
                className="!bg-gray-800 !border-gray-600 !text-white focus:!border-blue-500 focus:!ring-blue-500"
              />
            </div>

            <div>
              <Label htmlFor="maxParticipants" className="!text-gray-300">Máx. Participantes</Label>
              <Input
                id="maxParticipants"
                type="number"
                value={maxParticipants}
                onChange={(e) => setMaxParticipants(Number(e.target.value))}
                min={1}
                max={1000}
                className="!bg-gray-800 !border-gray-600 !text-white focus:!border-blue-500 focus:!ring-blue-500"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="meetUrl" className="!text-gray-300">Link da Reunião</Label>
            <Input
              id="meetUrl"
              value={meetUrl}
              onChange={(e) => setMeetUrl(e.target.value)}
              placeholder="https://meet.google.com/..."
              className="!bg-gray-800 !border-gray-600 !text-white !placeholder-gray-400 focus:!border-blue-500 focus:!ring-blue-500"
            />
          </div>

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1 !bg-gray-800 !border-gray-600 !text-gray-300 hover:!bg-gray-700 hover:!text-white"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={createMutation.isPending}
              className="flex-1 !bg-gradient-to-r !from-blue-600 !to-purple-600 hover:!from-blue-700 hover:!to-purple-700 !text-white"
            >
              {createMutation.isPending ? "Criando..." : "Criar Sessão"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
