
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy } from "lucide-react";

interface ProducerPerformanceSummaryProps {
  publishedCourses: number;
}

export const ProducerPerformanceSummary = ({ publishedCourses }: ProducerPerformanceSummaryProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Trophy className="h-5 w-5 mr-2 text-yellow-600" />
          Desempenho da Plataforma
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm">Cursos Ativos</span>
            <span className="font-medium">{publishedCourses}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm">Empresas Ativas</span>
            <span className="font-medium">0</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm">Colaboradores Ativos</span>
            <span className="font-medium">0</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm">Taxa de Conclusão</span>
            <span className="font-medium text-green-600">-</span>
          </div>
          <div className="pt-2 border-t">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Avaliação Geral</span>
              <Badge className="bg-yellow-100 text-yellow-700">-</Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
