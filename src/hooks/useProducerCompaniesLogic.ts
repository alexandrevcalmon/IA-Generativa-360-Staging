
import { useCompaniesWithPlans } from "@/hooks/useCompaniesWithPlans";
import { useDeleteCompany } from "@/hooks/useCompanies";

export const useProducerCompaniesLogic = (searchTerm: string) => {
  const { data: companies = [], isLoading, error } = useCompaniesWithPlans();
  const deleteCompanyMutation = useDeleteCompany();

  const filteredCompanies = companies.filter(company =>
    company.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalCompanies = companies.length;
  const activeCompanies = companies.filter(c => c.is_active).length;
  const totalCollaborators = companies.reduce((sum, c) => sum + (c.current_students || 0), 0);

  const handleDeleteCompany = async (companyId: string) => {
    await deleteCompanyMutation.mutateAsync(companyId);
  };

  return {
    companies,
    filteredCompanies,
    isLoading,
    error,
    totalCompanies,
    activeCompanies,
    totalCollaborators,
    handleDeleteCompany,
    deleteCompanyMutation,
  };
};
