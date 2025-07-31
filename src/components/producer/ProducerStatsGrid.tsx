
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Users, TrendingUp, Building2 } from "lucide-react";

interface ProducerStatsGridProps {
  totalCourses: number;
  publishedCourses: number;
  totalCompanies: number;
  activeCompanies: number;
  totalCollaborators: number;
  totalRevenue?: number;
}

export const ProducerStatsGrid = ({ 
  totalCourses, 
  publishedCourses, 
  totalCompanies, 
  activeCompanies, 
  totalCollaborators, 
  totalRevenue = 0 
}: ProducerStatsGridProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card className="hover-lift">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Cursos Criados
          </CardTitle>
          <BookOpen className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalCourses}</div>
          <p className="text-xs text-muted-foreground">
            {publishedCourses} publicados
          </p>
        </CardContent>
      </Card>

      <Card className="hover-lift">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Empresas Ativas
          </CardTitle>
          <Building2 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{activeCompanies}</div>
          <p className="text-xs text-muted-foreground">
            {totalCompanies > 0 ? `${activeCompanies} de ${totalCompanies}` : 'Nenhuma empresa cadastrada'}
          </p>
        </CardContent>
      </Card>

      <Card className="hover-lift">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Total de Colaboradores
          </CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalCollaborators}</div>
          <p className="text-xs text-muted-foreground">
            {totalCollaborators > 0 ? 'Colaboradores ativos' : 'Nenhum colaborador'}
          </p>
        </CardContent>
      </Card>

      <Card className="hover-lift">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Receita Total
          </CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {totalRevenue > 0 ? `R$ ${totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : 'R$ 0,00'}
          </div>
          <p className="text-xs text-muted-foreground">
            {totalRevenue > 0 ? 'Receita acumulada' : 'Sem vendas ainda'}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
