
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";

export const ProducerAnalyticsSection = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <BarChart3 className="h-5 w-5 mr-2 text-blue-600" />
          Analytics de Conteúdo
        </CardTitle>
        <CardDescription>
          Acompanhe o desempenho e engajamento dos seus cursos
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8">
          <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Analytics em Desenvolvimento
          </h3>
          <p className="text-gray-600 mb-4">
            Os dados de engajamento e performance estarão disponíveis quando houver atividade nos seus cursos.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">-</div>
              <div className="text-sm text-gray-600">Avaliação Média</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">-</div>
              <div className="text-sm text-gray-600">Taxa de Satisfação</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">0</div>
              <div className="text-sm text-gray-600">Total de Avaliações</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
