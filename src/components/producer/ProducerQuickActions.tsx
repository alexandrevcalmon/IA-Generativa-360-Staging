
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Plus,
  Building2,
  CreditCard,
  MessageCircle,
  Upload,
  FileText,
  Users
} from "lucide-react";
import { Link } from "react-router-dom";

export const ProducerQuickActions = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Ações Rápidas</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Link to="/producer/courses" className="block">
          <Button className="w-full justify-start bg-gradient-to-r from-calmon-500 to-calmon-700 hover:from-calmon-600 hover:to-calmon-800 text-white">
            <Plus className="h-4 w-4 mr-2" />
            Criar Novo Curso
          </Button>
        </Link>
        <Link to="/producer/mentorship" className="block">
          <Button className="w-full justify-start bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white">
            <Users className="h-4 w-4 mr-2" />
            Gerenciar Mentoria
          </Button>
        </Link>
        <Link to="/producer/community" className="block">
          <Button className="w-full justify-start bg-gradient-to-r from-purple-500 to-purple-700 hover:from-purple-600 hover:to-purple-800 text-white">
            <MessageCircle className="h-4 w-4 mr-2" />
            Gerenciar Comunidade
          </Button>
        </Link>
        <Link to="/producer/companies" className="block">
          <Button className="w-full justify-start" variant="outline">
            <Building2 className="h-4 w-4 mr-2" />
            Gerenciar Empresas
          </Button>
        </Link>
        <Link to="/producer/plans" className="block">
          <Button className="w-full justify-start" variant="outline">
            <CreditCard className="h-4 w-4 mr-2" />
            Gerenciar Planos
          </Button>
        </Link>
        <Button className="w-full justify-start" variant="outline" disabled>
          <Upload className="h-4 w-4 mr-2" />
          Upload de Conteúdo
        </Button>
        <Button className="w-full justify-start" variant="outline" disabled>
          <FileText className="h-4 w-4 mr-2" />
          Criar Material
        </Button>
        <Button className="w-full justify-start" variant="outline" disabled>
          <MessageCircle className="h-4 w-4 mr-2" />
          Suporte ao Colaborador
        </Button>
      </CardContent>
    </Card>
  );
};
