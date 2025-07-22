
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2 } from "lucide-react";
import { CompanyWithPlan } from "@/hooks/useCompaniesWithPlans";
import { Company } from "@/hooks/useCompanies";
import { CompanyListItem } from "./CompanyListItem";

interface ProducerCompaniesListProps {
  companies: CompanyWithPlan[];
  onEdit: (company: Company) => void;
  onDelete: (companyId: string) => Promise<void>;
  deletingCompanyId: string | null;
  transformCompany: (company: CompanyWithPlan) => Company;
}

export function ProducerCompaniesList({ 
  companies, 
  onEdit, 
  onDelete, 
  deletingCompanyId,
  transformCompany 
}: ProducerCompaniesListProps) {
  return (
    <Card className="bg-gray-900/50 border-gray-700 shadow-xl">
      <CardHeader className="bg-gray-900/50">
        <CardTitle className="flex items-center text-white">
          <div className="p-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg mr-3 shadow-lg">
            <Building2 className="h-5 w-5 text-white" />
          </div>
          Empresas Cadastradas
        </CardTitle>
        <CardDescription className="text-gray-300">
          Lista de todas as empresas clientes e seus status
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {companies.map((company) => (
            <CompanyListItem
              key={company.id}
              company={company}
              onEdit={onEdit}
              onDelete={onDelete}
              deletingCompanyId={deletingCompanyId}
              transformCompany={transformCompany}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
