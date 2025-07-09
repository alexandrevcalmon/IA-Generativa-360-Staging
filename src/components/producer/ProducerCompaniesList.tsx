
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
    <Card className="bg-white shadow-sm border-gray-200">
      <CardHeader className="bg-white">
        <CardTitle className="flex items-center text-gray-900">
          <Building2 className="h-5 w-5 mr-2 text-calmon-500" />
          Empresas Cadastradas
        </CardTitle>
        <CardDescription className="text-gray-600">
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
