
import { Card, CardContent } from "@/components/ui/card";

interface CollaboratorAnalyticsEmptyStatesProps {
  hasFiltered: boolean;
  hasData: boolean;
}

export const CollaboratorAnalyticsEmptyStates = ({ hasFiltered, hasData }: CollaboratorAnalyticsEmptyStatesProps) => {
  if (hasFiltered && hasData) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <p className="text-gray-500">Nenhum colaborador encontrado com os filtros aplicados</p>
        </CardContent>
      </Card>
    );
  }

  if (!hasData) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <p className="text-gray-500">Nenhum dado de analytics disponível ainda</p>
        </CardContent>
      </Card>
    );
  }

  return null;
};
