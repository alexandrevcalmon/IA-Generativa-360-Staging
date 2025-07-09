
import { Card, CardContent } from "@/components/ui/card";
import { Calendar } from "lucide-react";

export const ProducerMentorshipEmptyState = () => {
  return (
    <Card>
      <CardContent className="text-center py-12">
        <Calendar className="h-12 w-12 mx-auto text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Nenhuma sessão criada
        </h3>
        <p className="text-gray-600 mb-4">
          Comece criando sua primeira sessão de mentoria
        </p>
      </CardContent>
    </Card>
  );
};
