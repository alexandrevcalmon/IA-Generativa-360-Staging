
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Edit, MoreVertical, Trash2, Users, Building } from "lucide-react";
import { useState } from "react";
import { CompanyWithPlan } from "@/hooks/useCompaniesWithPlans";
import { Company } from "@/hooks/useCompanies";
import { getPlanBadgeColor, getPlanIcon } from "@/utils/planUtils";
import { useGetCompanyCollaborators } from "@/hooks/useCompanyCollaborators";
import { CompanyCollaboratorsDialog } from "@/components/company/CompanyCollaboratorsDialog";

interface CompanyListItemProps {
  company: CompanyWithPlan;
  onEdit: (company: Company) => void;
  onDelete: (companyId: string) => Promise<void>;
  deletingCompanyId: string | null;
  transformCompany: (company: CompanyWithPlan) => Company;
}

export function CompanyListItem({
  company,
  onEdit,
  onDelete,
  deletingCompanyId,
  transformCompany,
}: CompanyListItemProps) {
  const [isCollaboratorsDialogOpen, setIsCollaboratorsDialogOpen] = useState(false);
  const { data: collaborators = [] } = useGetCompanyCollaborators(company.id);
  
  const isDeleting = deletingCompanyId === company.id;
  const planName = company.subscription_plan?.name;
  const activeCollaborators = collaborators.filter(c => c.is_active).length;
  const maxCollaborators = company.subscription_plan?.max_students || 5;

  return (
    <>
      <div className="bg-gray-800/50 rounded-lg border border-gray-700 p-4 hover:shadow-lg transition-shadow hover:bg-gray-800/70">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 shadow-lg">
                <Building className="w-5 h-5 text-white" />
              </div>
              
              <div>
                <h3 className="font-semibold text-white">{company.name}</h3>
                {company.official_name && company.official_name !== company.name && (
                  <p className="text-sm text-gray-300">{company.official_name}</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-4 text-sm text-gray-300">
              <button
                onClick={() => setIsCollaboratorsDialogOpen(true)}
                className="flex items-center gap-1 hover:text-orange-400 transition-colors cursor-pointer"
              >
                <Users className="w-4 h-4" />
                <span>{activeCollaborators}/{maxCollaborators} colaboradores</span>
              </button>
              
              {planName && (
                <Badge className={`${getPlanBadgeColor(planName)} bg-gray-700 text-white border-gray-600`}>
                  {getPlanIcon(planName)}
                  <span className="ml-1">{planName}</span>
                </Badge>
              )}
              
              <Badge variant={company.is_active ? "default" : "secondary"} className={company.is_active ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white border-0" : "bg-gray-700 text-gray-300 border-gray-600"}>
                {company.is_active ? "Ativa" : "Inativa"}
              </Badge>
            </div>

            {company.contact_email && (
              <p className="text-sm text-gray-400 mt-1">{company.contact_email}</p>
            )}
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-gray-300 hover:text-white hover:bg-gray-700">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-gray-800 border-gray-700">
              <DropdownMenuItem onClick={() => onEdit(transformCompany(company))} className="text-gray-300 hover:text-white hover:bg-gray-700">
                <Edit className="mr-2 h-4 w-4" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => onDelete(company.id)}
                disabled={isDeleting}
                className="text-red-400 hover:text-red-300 hover:bg-gray-700"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                {isDeleting ? "Excluindo..." : "Excluir"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <CompanyCollaboratorsDialog
        isOpen={isCollaboratorsDialogOpen}
        onClose={() => setIsCollaboratorsDialogOpen(false)}
        company={company}
      />
    </>
  );
}
