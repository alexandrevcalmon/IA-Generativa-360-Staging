
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface ProducerCompaniesHeaderProps {
  onCreateCompany: () => void;
}

export function ProducerCompaniesHeader({ onCreateCompany }: ProducerCompaniesHeaderProps) {
  return (
    <header className="border-b bg-white px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <SidebarTrigger />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Gerenciar Empresas</h1>
            <p className="text-gray-600">Gerencie suas empresas clientes e seus colaboradores</p>
          </div>
        </div>
        <Button 
          onClick={onCreateCompany}
          className="bg-calmon-500 hover:bg-calmon-600 text-white shadow-sm"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nova Empresa
        </Button>
      </div>
    </header>
  );
}
