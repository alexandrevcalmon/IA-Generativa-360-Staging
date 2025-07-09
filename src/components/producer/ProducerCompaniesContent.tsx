
import { ProducerCompaniesSearch } from "./ProducerCompaniesSearch";
import { ProducerCompaniesStats } from "./ProducerCompaniesStats";
import { ProducerCompaniesList } from "./ProducerCompaniesList";
import { CompanyWithPlan } from "@/hooks/useCompaniesWithPlans";
import { Company } from "@/hooks/useCompanies";
import { transformCompanyWithPlanToCompany } from "@/utils/companyTransformations";

interface ProducerCompaniesContentProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  totalCompanies: number;
  activeCompanies: number;
  totalCollaborators: number;
  filteredCompanies: CompanyWithPlan[];
  onEdit: (company: Company) => void;
  onDelete: (companyId: string) => Promise<void>;
  deletingCompanyId: string | null;
}

export function ProducerCompaniesContent({
  searchTerm,
  onSearchChange,
  totalCompanies,
  activeCompanies,
  totalCollaborators,
  filteredCompanies,
  onEdit,
  onDelete,
  deletingCompanyId,
}: ProducerCompaniesContentProps) {
  return (
    <div className="flex-1 overflow-auto p-6 bg-gray-50/30">
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <ProducerCompaniesSearch 
              searchTerm={searchTerm}
              onSearchChange={onSearchChange}
            />
          </div>
          
          <ProducerCompaniesStats
            totalCompanies={totalCompanies}
            activeCompanies={activeCompanies}
            totalCollaborators={totalCollaborators}
          />
        </div>

        <ProducerCompaniesList
          companies={filteredCompanies}
          onEdit={onEdit}
          onDelete={onDelete}
          deletingCompanyId={deletingCompanyId}
          transformCompany={transformCompanyWithPlanToCompany}
        />
      </div>
    </div>
  );
}
