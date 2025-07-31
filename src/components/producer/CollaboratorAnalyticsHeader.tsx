
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

interface CollaboratorAnalyticsHeaderProps {
  onRefresh: () => void;
}

export const CollaboratorAnalyticsHeader = ({ onRefresh }: CollaboratorAnalyticsHeaderProps) => {
  return (
    <div className="border-b bg-calmon-gradient px-6 py-4 shadow-lg">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Analytics de Colaboradores</h1>
          <p className="text-calmon-100">Acompanhe o desempenho e engajamento dos colaboradores</p>
        </div>
        <Button 
          onClick={onRefresh} 
          variant="outline"
          className="border-white/30 text-white hover:bg-white/20 bg-white/10 backdrop-blur-sm"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Atualizar
        </Button>
      </div>
    </div>
  );
};

