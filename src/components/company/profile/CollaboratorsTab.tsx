
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { User } from "lucide-react";

export const CollaboratorsTab = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Colaboradores</CardTitle>
        <CardDescription>
          Gerencie os colaboradores da sua empresa
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8">
          <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Funcionalidade em desenvolvimento
          </h3>
          <p className="text-gray-600">
            A gestão de colaboradores estará disponível em breve
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
