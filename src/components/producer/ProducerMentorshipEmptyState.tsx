
import { Card, CardContent } from "@/components/ui/card";
import { Calendar } from "lucide-react";

export const ProducerMentorshipEmptyState = () => {
  return (
    <Card className="bg-gray-900/50 border-gray-700 shadow-xl">
      <CardContent className="text-center py-12">
        <Calendar className="h-12 w-12 mx-auto text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-white mb-2">
          Nenhuma sessão criada
        </h3>
        <p className="text-gray-300 mb-4">
          Comece criando sua primeira sessão de mentoria
        </p>
      </CardContent>
    </Card>
  );
};
