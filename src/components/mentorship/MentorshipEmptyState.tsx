
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Plus } from "lucide-react";

export const MentorshipEmptyState = () => {
  return (
    <Card className="bg-transparent border-gray-600/30">
      <CardContent className="p-12 text-center">
        <div className="p-3 rounded-full bg-gray-700/50 border border-gray-600/30 w-fit mx-auto mb-4">
          <Calendar className="h-12 w-12 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium mb-2 text-white">Nenhuma mentoria disponível</h3>
        <p className="text-gray-400 mb-4">
          Solicite uma sessão de mentoria para desenvolvimento da sua equipe ou aguarde mentorias coletivas
        </p>
        <Button className="bg-orange-600 hover:bg-orange-500 text-white">
          <Plus className="h-4 w-4 mr-2" />
          Solicitar Primeira Mentoria
        </Button>
      </CardContent>
    </Card>
  );
};
