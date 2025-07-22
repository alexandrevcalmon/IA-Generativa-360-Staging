
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
    <div className="grid grid-cols-3 gap-4">
      <Card className="hover-lift bg-gray-900/50 border-gray-700 shadow-xl">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-300">Total de Empresas</p>
              <p className="text-xl font-bold bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">{totalCompanies}</p>
            </div>
            <div className="p-1.5 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg shadow-lg">
              <Building2 className="h-4 w-4 text-white" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="hover-lift bg-gray-900/50 border-gray-700 shadow-xl">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-300">Empresas Ativas</p>
              <p className="text-xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                {activeCompanies}
              </p>
            </div>
            <div className="p-1.5 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg shadow-lg">
              <TrendingUp className="h-4 w-4 text-white" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="hover-lift bg-gray-900/50 border-gray-700 shadow-xl">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-300">Total Colaboradores</p>
              <p className="text-xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                {totalCollaborators}
              </p>
            </div>
            <div className="p-1.5 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg shadow-lg">
              <Users className="h-4 w-4 text-white" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
