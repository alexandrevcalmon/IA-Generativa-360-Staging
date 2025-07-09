
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Plus } from "lucide-react";

export const MentorshipEmptyState = () => {
  return (
    <Card>
      <CardContent className="p-12 text-center">
        <Calendar className="h-12 w-12 mx-auto text-gray-400 mb-4" />
        <h3 className="text-lg font-medium mb-2">Nenhuma mentoria disponível</h3>
        <p className="text-gray-600 mb-4">
          Solicite uma sessão de mentoria para desenvolvimento da sua equipe ou aguarde mentorias coletivas
        </p>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Solicitar Primeira Mentoria
        </Button>
      </CardContent>
    </Card>
  );
};
