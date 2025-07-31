
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Link } from "react-router-dom";

export const ProducerDashboardHeader = () => {
  return (
    <header className="border-b bg-white px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Painel do Produtor</h1>
          <p className="text-gray-600">Bem-vindo de volta! Gerencie seus cursos e empresas clientes.</p>
        </div>
        <div className="flex items-center space-x-4">
          <Badge className="bg-green-100 text-green-700">
            Status: Ativo
          </Badge>
          <Link to="/producer/courses">
            <Button className="bg-gradient-to-r from-calmon-500 to-calmon-700 hover:from-calmon-600 hover:to-calmon-800 text-white">
              <Plus className="h-4 w-4 mr-2" />
              Criar Novo Curso
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
};
