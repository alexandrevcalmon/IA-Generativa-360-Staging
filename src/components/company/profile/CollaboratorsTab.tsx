
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { User } from "lucide-react";

export const CollaboratorsTab = () => {
  return (
    <Card className="!bg-gray-800 !border-gray-700" style={{ backgroundColor: '#1f2937', borderColor: '#374151' }}>
      <CardHeader>
        <CardTitle className="!text-white" style={{ color: '#ffffff' }}>Colaboradores</CardTitle>
        <CardDescription className="!text-gray-300" style={{ color: '#d1d5db' }}>
          Gerencie os colaboradores da sua empresa
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8">
          <User className="h-12 w-12 !text-gray-400 mx-auto mb-4" style={{ color: '#9ca3af' }} />
          <h3 className="text-lg font-semibold !text-white mb-2" style={{ color: '#ffffff' }}>
            Funcionalidade em desenvolvimento
          </h3>
          <p className="!text-gray-300" style={{ color: '#d1d5db' }}>
            A gestão de colaboradores estará disponível em breve
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
