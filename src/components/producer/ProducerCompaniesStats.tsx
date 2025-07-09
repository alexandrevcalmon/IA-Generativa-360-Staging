
import { Card, CardContent } from "@/components/ui/card";
import { Building2, TrendingUp, Users } from "lucide-react";

interface ProducerCompaniesStatsProps {
  totalCompanies: number;
  activeCompanies: number;
  totalCollaborators: number;
}

export function ProducerCompaniesStats({ 
  totalCompanies, 
  activeCompanies, 
  totalCollaborators 
}: ProducerCompaniesStatsProps) {
  return (
    <>
      <Card className="hover-lift bg-white shadow-sm border-gray-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total de Empresas</p>
              <p className="text-2xl font-bold text-gray-900">{totalCompanies}</p>
            </div>
            <Building2 className="h-8 w-8 text-calmon-500" />
          </div>
        </CardContent>
      </Card>

      <Card className="hover-lift bg-white shadow-sm border-gray-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Empresas Ativas</p>
              <p className="text-2xl font-bold text-green-600">
                {activeCompanies}
              </p>
            </div>
            <TrendingUp className="h-8 w-8 text-green-600" />
          </div>
        </CardContent>
      </Card>

      <Card className="hover-lift bg-white shadow-sm border-gray-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Colaboradores</p>
              <p className="text-2xl font-bold text-blue-600">
                {totalCollaborators}
              </p>
            </div>
            <Users className="h-8 w-8 text-blue-600" />
          </div>
        </CardContent>
      </Card>
    </>
  );
}
