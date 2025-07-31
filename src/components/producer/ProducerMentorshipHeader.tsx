
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface ProducerMentorshipHeaderProps {
  onCreateSession: () => void;
}

export const ProducerMentorshipHeader = ({ onCreateSession }: ProducerMentorshipHeaderProps) => {
  return (
    <div className="border-b bg-white px-6 py-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sessões de Mentoria</h1>
          <p className="text-gray-600">Gerencie suas sessões de mentoria e participantes</p>
        </div>
        <Button onClick={onCreateSession}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Sessão
        </Button>
      </div>
    </div>
  );
};
