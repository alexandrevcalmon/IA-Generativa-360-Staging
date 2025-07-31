
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";

interface MentorshipHeaderProps {
  companyName?: string;
  onRefresh: () => void;
  refreshing: boolean;
}

export const MentorshipHeader = ({ companyName, onRefresh, refreshing }: MentorshipHeaderProps) => {
  return (
    <header className="border-b bg-white px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <SidebarTrigger />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Mentorias</h1>
            <p className="text-gray-600">
              Sessões da {companyName || 'empresa'} e mentorias coletivas
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            onClick={onRefresh} 
            disabled={refreshing}
            className="border-gray-200 text-gray-700 hover:bg-gray-50"
          >
            {refreshing ? 'Atualizando...' : 'Atualizar'}
          </Button>
        </div>
      </div>
    </header>
  );
};

