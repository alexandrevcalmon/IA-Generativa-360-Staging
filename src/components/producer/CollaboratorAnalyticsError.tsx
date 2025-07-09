
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

interface CollaboratorAnalyticsErrorProps {
  error: Error;
  onRetry: () => void;
}

export const CollaboratorAnalyticsError = ({ error, onRetry }: CollaboratorAnalyticsErrorProps) => {
  return (
    <div className="flex flex-col h-full items-center justify-center">
      <p className="text-red-500 text-lg">Erro ao carregar analytics</p>
      <p className="text-gray-600">{error?.message}</p>
      <Button onClick={onRetry} className="mt-4">
        <RefreshCw className="h-4 w-4 mr-2" />
        Tentar Novamente
      </Button>
    </div>
  );
};
