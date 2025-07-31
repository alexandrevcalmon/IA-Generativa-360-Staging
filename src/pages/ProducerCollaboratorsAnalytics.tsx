import { useState } from "react";
import { PageLayout } from "@/components/PageLayout";
import { PageSection } from "@/components/PageSection";
import { useCollaboratorAnalytics } from "@/hooks/useCollaboratorAnalytics";
import { useCollaboratorAnalyticsFiltering } from "@/hooks/useCollaboratorAnalyticsFiltering";
import { CollaboratorAnalyticsSummary } from "@/components/producer/CollaboratorAnalyticsSummary";
import { CollaboratorAnalyticsFilters } from "@/components/producer/CollaboratorAnalyticsFilters";
import { CollaboratorAnalyticsList } from "@/components/producer/CollaboratorAnalyticsList";
import { CollaboratorAnalyticsEmptyStates } from "@/components/producer/CollaboratorAnalyticsEmptyStates";
import { CollaboratorAnalyticsHeader } from "@/components/producer/CollaboratorAnalyticsHeader";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { toast } from "sonner";

const ProducerCollaboratorsAnalytics = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("updated_at");
  const [filterStatus, setFilterStatus] = useState("all");
  
  const { data: analytics = [], isLoading, error, refetch } = useCollaboratorAnalytics();

  const filteredAndSortedAnalytics = useCollaboratorAnalyticsFiltering(
    analytics,
    searchTerm,
    sortBy,
    filterStatus
  );

  const handleRefresh = async () => {
    try {
      await refetch();
      toast.success("Dados atualizados com sucesso");
    } catch (error) {
      toast.error("Erro ao atualizar dados");
    }
  };

  // Header content com botão de atualizar
  const headerContent = (
    <Button 
      variant="outline"
      onClick={handleRefresh}
      disabled={isLoading}
      className="!bg-gray-800 !border-gray-600 !text-gray-300 hover:!bg-gray-700 hover:!text-white"
    >
      <RefreshCw className="h-4 w-4 mr-2" />
      Atualizar Dados
    </Button>
  );

  if (isLoading) {
    return (
      <PageLayout
        title="Análise de Colaboradores"
        subtitle="Carregando dados..."
        background="dark"
      >
        <div className="animate-pulse space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1,2,3,4].map((i) => (
              <div key={i} className="bg-gray-700 h-24 rounded-lg"></div>
            ))}
          </div>
          <div className="bg-gray-700 h-12 rounded-lg"></div>
          <div className="bg-gray-700 h-64 rounded-lg"></div>
        </div>
      </PageLayout>
    );
  }

  if (error) {
    return (
      <PageLayout
        title="Análise de Colaboradores"
        subtitle="Erro ao carregar dados"
        headerContent={headerContent}
        background="dark"
      >
        <PageSection>
          <div className="flex flex-col items-center justify-center p-12">
            <p className="!text-red-400 text-lg mb-2">Erro ao carregar dados de colaboradores.</p>
            <p className="!text-gray-300 mb-4">{(error as Error)?.message || "Tente novamente mais tarde."}</p>
            <Button 
              onClick={handleRefresh}
              className="mt-4 !bg-gradient-to-r !from-blue-600 !to-purple-600 hover:!from-blue-700 hover:!to-purple-700 !text-white"
            >
              Tentar novamente
            </Button>
          </div>
        </PageSection>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      title="Análise de Colaboradores"
      subtitle="Acompanhe o progresso e engajamento dos colaboradores"
      headerContent={headerContent}
      background="dark"
      className="dark-theme-override"
    >
      <div className="space-y-6">
        <PageSection noPadding>
          <CollaboratorAnalyticsSummary stats={analytics} />
        </PageSection>

        <PageSection noPadding>
          <CollaboratorAnalyticsFilters
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            sortBy={sortBy}
            setSortBy={setSortBy}
            filterStatus={filterStatus}
            setFilterStatus={setFilterStatus}
          />
        </PageSection>

        {filteredAndSortedAnalytics.length > 0 && (
          <PageSection noPadding>
            <CollaboratorAnalyticsList collaborators={filteredAndSortedAnalytics} />
          </PageSection>
        )}

        <CollaboratorAnalyticsEmptyStates 
          hasFiltered={filteredAndSortedAnalytics.length === 0 && analytics.length > 0}
          hasData={analytics.length > 0}
        />
      </div>
    </PageLayout>
  );
};

export default ProducerCollaboratorsAnalytics;
