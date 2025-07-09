
import { CreateCompanyDialog } from "@/components/CreateCompanyDialog";
import { EditCompanyDialog } from "@/components/EditCompanyDialog";
import { transformCompanyWithPlanToCompany } from "@/utils/companyTransformations";
import { ProducerCompaniesHeader } from "@/components/producer/ProducerCompaniesHeader";
import { ProducerCompaniesContent } from "@/components/producer/ProducerCompaniesContent";
import { ProducerCompaniesLoading } from "@/components/producer/ProducerCompaniesLoading";
import { useProducerCompaniesState } from "@/hooks/useProducerCompaniesState";
import { useProducerCompaniesLogic } from "@/hooks/useProducerCompaniesLogic";

const ProducerCompanies = () => {
  const {
    searchTerm,
    setSearchTerm,
    isCreateDialogOpen,
    setIsCreateDialogOpen,
    editingCompany,
    setEditingCompany,
  } = useProducerCompaniesState();

  const {
    filteredCompanies,
    isLoading,
    error,
    totalCompanies,
    activeCompanies,
    totalCollaborators,
    handleDeleteCompany,
    deleteCompanyMutation,
  } = useProducerCompaniesLogic(searchTerm);

  if (isLoading) {
    return <ProducerCompaniesLoading />;
  }

  if (error) {
    return (
      <div className="flex flex-col h-full items-center justify-center">
        <p className="text-red-500 text-lg">Erro ao carregar as empresas.</p>
        <p>{(error as Error)?.message || "Tente novamente mais tarde."}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <ProducerCompaniesHeader onCreateCompany={() => setIsCreateDialogOpen(true)} />

      <ProducerCompaniesContent
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        totalCompanies={totalCompanies}
        activeCompanies={activeCompanies}
        totalCollaborators={totalCollaborators}
        filteredCompanies={filteredCompanies}
        onEdit={setEditingCompany}
        onDelete={handleDeleteCompany}
        deletingCompanyId={deleteCompanyMutation.isPending ? deleteCompanyMutation.variables : null}
      />

      <CreateCompanyDialog 
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
      />

      <EditCompanyDialog
        isOpen={!!editingCompany}
        onClose={() => setEditingCompany(null)}
        company={editingCompany}
      />
    </div>
  );
};

export default ProducerCompanies;
