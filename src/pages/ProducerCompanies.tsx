import { PageLayout } from "@/components/PageLayout";
import { PageSection } from "@/components/PageSection";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { CreateCompanyDialog } from "@/components/CreateCompanyDialog";
import { EditCompanyDialog } from "@/components/EditCompanyDialog";
import { transformCompanyWithPlanToCompany } from "@/utils/companyTransformations";
import { ProducerCompaniesSearch } from "@/components/producer/ProducerCompaniesSearch";
import { ProducerCompaniesStats } from "@/components/producer/ProducerCompaniesStats";
import { ProducerCompaniesList } from "@/components/producer/ProducerCompaniesList";
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

  // Header content com botão de criar empresa
  const headerContent = (
    <Button 
      onClick={() => setIsCreateDialogOpen(true)}
      className="bg-calmon-500 hover:bg-calmon-600 text-white shadow-sm"
    >
      <Plus className="h-4 w-4 mr-2" />
      Nova Empresa
    </Button>
  );

  if (isLoading) {
    return (
      <div className="dark-theme-override" style={{ backgroundColor: '#0f172a', color: '#e2e8f0' }}>
        <PageLayout
          title="Gerenciar Empresas"
          subtitle="Carregando dados..."
          background="dark"
          className="dark-theme-override"
        >
          <div className="animate-pulse space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1,2,3].map((i) => (
                <div key={i} className="bg-gray-800 h-24 rounded-lg"></div>
              ))}
            </div>
            <div className="bg-gray-800 h-64 rounded-lg"></div>
          </div>
        </PageLayout>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dark-theme-override" style={{ backgroundColor: '#0f172a', color: '#e2e8f0' }}>
        <PageLayout
          title="Gerenciar Empresas"
          subtitle="Erro ao carregar dados"
          background="dark"
          className="dark-theme-override"
        >
          <PageSection>
            <div className="flex flex-col items-center justify-center p-12">
              <p className="text-red-400 text-lg">Erro ao carregar as empresas.</p>
              <p className="text-gray-300">{(error as Error)?.message || "Tente novamente mais tarde."}</p>
              <Button 
                onClick={() => window.location.reload()}
                className="mt-4 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white shadow-lg border-0"
              >
                Tentar novamente
              </Button>
            </div>
          </PageSection>
        </PageLayout>
      </div>
    );
  }

  return (
    <div className="dark-theme-override" style={{ backgroundColor: '#0f172a', color: '#e2e8f0' }}>
      <PageLayout
        title="Gerenciar Empresas"
        subtitle="Gerencie suas empresas clientes e seus colaboradores"
        headerContent={headerContent}
        background="dark"
        className="dark-theme-override"
      >
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-1">
              <PageSection noPadding>
                <ProducerCompaniesSearch 
                  searchTerm={searchTerm}
                  onSearchChange={setSearchTerm}
                />
              </PageSection>
            </div>
            
            <div className="lg:col-span-3">
              <ProducerCompaniesStats
                totalCompanies={totalCompanies}
                activeCompanies={activeCompanies}
                totalCollaborators={totalCollaborators}
              />
            </div>
          </div>

          <PageSection noPadding>
            <ProducerCompaniesList
              companies={filteredCompanies}
              onEdit={setEditingCompany}
              onDelete={handleDeleteCompany}
              deletingCompanyId={deleteCompanyMutation.isPending ? deleteCompanyMutation.variables : null}
              transformCompany={transformCompanyWithPlanToCompany}
            />
          </PageSection>
        </div>

        <CreateCompanyDialog 
          isOpen={isCreateDialogOpen}
          onClose={() => setIsCreateDialogOpen(false)}
        />

        <EditCompanyDialog
          isOpen={!!editingCompany}
          onClose={() => setEditingCompany(null)}
          company={editingCompany}
        />
      </PageLayout>
    </div>
  );
};

export default ProducerCompanies;
