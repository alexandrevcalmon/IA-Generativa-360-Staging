
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy } from "lucide-react";

interface ProducerPerformanceSummaryProps {
  publishedCourses: number;
  activeCompanies: number;
  totalCollaborators: number;
  completionRate?: number;
  averageRating?: number;
}

export const ProducerPerformanceSummary = ({ 
  publishedCourses, 
  activeCompanies, 
  totalCollaborators, 
  completionRate, 
  averageRating 
}: ProducerPerformanceSummaryProps) => {
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
            <span className="font-medium">{activeCompanies}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm">Colaboradores Ativos</span>
            <span className="font-medium">{totalCollaborators}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm">Taxa de Conclusão</span>
            <span className="font-medium text-green-600">
              {completionRate !== undefined ? `${completionRate}%` : '-'}
            </span>
          </div>
          <div className="pt-2 border-t">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Avaliação Geral</span>
              <Badge className="bg-yellow-100 text-yellow-700">
                {averageRating !== undefined ? averageRating.toFixed(1) : '-'}
              </Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
