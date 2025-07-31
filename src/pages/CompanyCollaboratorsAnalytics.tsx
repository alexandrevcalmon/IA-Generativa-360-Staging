import { useState } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { useCollaboratorAnalytics } from "@/hooks/useCollaboratorAnalytics";
import { useCollaboratorAnalyticsFiltering } from "@/hooks/useCollaboratorAnalyticsFiltering";
import { CollaboratorAnalyticsSummary } from "@/components/producer/CollaboratorAnalyticsSummary";
import { CollaboratorAnalyticsFilters } from "@/components/producer/CollaboratorAnalyticsFilters";
import { CollaboratorAnalyticsList } from "@/components/producer/CollaboratorAnalyticsList";
import { CollaboratorAnalyticsEmptyStates } from "@/components/producer/CollaboratorAnalyticsEmptyStates";

const CompanyCollaboratorsAnalytics = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("updated_at");
  const [filterStatus, setFilterStatus] = useState("all");
  const [refreshing, setRefreshing] = useState(false);

  const { data: analytics, isLoading, error, refetch } = useCollaboratorAnalytics();

  const filteredAnalytics = useCollaboratorAnalyticsFiltering(
    analytics || [],
    searchTerm,
    sortBy,
    filterStatus
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  // Header content com botão de atualizar
  const headerContent = (
    <Button 
      variant="outline" 
      onClick={handleRefresh} 
      disabled={refreshing || isLoading}
      className="bg-gray-700/50 hover:bg-gray-600/50 text-gray-300 border-gray-600"
    >
      <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
      {refreshing ? 'Atualizando...' : 'Atualizar Dados'}
    </Button>
  );

  const hasData = analytics && analytics.length > 0;
  const hasFiltered = Boolean(searchTerm || filterStatus !== "all");

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
        {/* Header */}
        <header className="border-slate-700/50 py-10 bg-slate-950/90 backdrop-blur-xl shadow-2xl border-slate-700/50">
          <div className="max-w-7xl mx-auto px-4 md:px-6">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center space-x-4">
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600 bg-clip-text text-transparent">
                    Análise de Colaboradores
                  </h1>
                  <p className="text-slate-300 text-lg leading-relaxed mt-1">
                    Carregando dados...
                  </p>
                </div>
              </div>
              {headerContent && (
                <div className="flex items-center gap-2 ml-12">
                  {headerContent}
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Loading Content */}
        <div className="flex-1 overflow-auto p-4 md:p-6">
          <div className="max-w-7xl mx-auto">
            <div className="animate-pulse space-y-6">
              <div className="h-32 bg-gray-800/50 rounded-lg"></div>
              <div className="h-16 bg-gray-800/50 rounded-lg"></div>
              <div className="h-64 bg-gray-800/50 rounded-lg"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
        {/* Header */}
        <header className="border-slate-700/50 py-10 bg-slate-950/90 backdrop-blur-xl shadow-2xl border-slate-700/50">
          <div className="max-w-7xl mx-auto px-4 md:px-6">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center space-x-4">
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600 bg-clip-text text-transparent">
                    Análise de Colaboradores
                  </h1>
                  <p className="text-slate-300 text-lg leading-relaxed mt-1">
                    Erro ao carregar dados
                  </p>
                </div>
              </div>
              {headerContent && (
                <div className="flex items-center gap-2 ml-12">
                  {headerContent}
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Error Content */}
        <div className="flex-1 overflow-auto p-4 md:p-6">
          <div className="max-w-7xl mx-auto">
            <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/30 shadow-2xl rounded-xl p-12 text-center">
              <p className="text-red-400 text-lg mb-2">Erro ao carregar dados de colaboradores.</p>
              <p className="text-gray-400 mb-4">{(error as Error)?.message || "Tente novamente mais tarde."}</p>
              <Button 
                onClick={handleRefresh}
                className="mt-4 bg-blue-600 hover:bg-blue-700 text-white"
                disabled={refreshing}
              >
                {refreshing ? 'Atualizando...' : 'Tentar Novamente'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      {/* Header */}
      <header className="border-slate-700/50 py-10 bg-slate-950/90 backdrop-blur-xl shadow-2xl border-slate-700/50">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center space-x-4">
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600 bg-clip-text text-transparent">
                  Análise de Colaboradores
                </h1>
                <p className="text-slate-300 text-lg leading-relaxed mt-1">
                  Acompanhe o progresso e engajamento dos colaboradores
                </p>
              </div>
            </div>
            {headerContent && (
              <div className="flex items-center gap-2 ml-12">
                {headerContent}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-auto p-4 md:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-fade-in space-y-6">
            {hasData && (
              <>
                <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/30 shadow-2xl rounded-xl p-6">
                  <CollaboratorAnalyticsSummary stats={analytics} />
                </div>
                
                <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/30 shadow-2xl rounded-xl p-6">
                  <CollaboratorAnalyticsFilters
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    sortBy={sortBy}
                    setSortBy={setSortBy}
                    filterStatus={filterStatus}
                    setFilterStatus={setFilterStatus}
                  />
                </div>
              </>
            )}

            {filteredAnalytics.length > 0 ? (
              <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/30 shadow-2xl rounded-xl p-6">
                <CollaboratorAnalyticsList collaborators={filteredAnalytics} />
              </div>
            ) : (
              <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/30 shadow-2xl rounded-xl p-6">
                <CollaboratorAnalyticsEmptyStates 
                  hasFiltered={hasFiltered} 
                  hasData={hasData} 
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyCollaboratorsAnalytics;
