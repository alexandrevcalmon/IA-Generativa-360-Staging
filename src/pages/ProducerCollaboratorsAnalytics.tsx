
import { useState } from "react";
import { useCollaboratorAnalytics } from "@/hooks/useCollaboratorAnalytics";
import { useCollaboratorAnalyticsFiltering } from "@/hooks/useCollaboratorAnalyticsFiltering";
import { CollaboratorAnalyticsSummary } from "@/components/producer/CollaboratorAnalyticsSummary";
import { CollaboratorAnalyticsFilters } from "@/components/producer/CollaboratorAnalyticsFilters";
import { CollaboratorAnalyticsList } from "@/components/producer/CollaboratorAnalyticsList";
import { CollaboratorAnalyticsEmptyStates } from "@/components/producer/CollaboratorAnalyticsEmptyStates";
import { CollaboratorAnalyticsLoading } from "@/components/producer/CollaboratorAnalyticsLoading";
import { CollaboratorAnalyticsError } from "@/components/producer/CollaboratorAnalyticsError";
import { CollaboratorAnalyticsHeader } from "@/components/producer/CollaboratorAnalyticsHeader";
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

  if (isLoading) {
    return <CollaboratorAnalyticsLoading />;
  }

  if (error) {
    return <CollaboratorAnalyticsError error={error as Error} onRetry={handleRefresh} />;
  }

  return (
    <div className="flex flex-col h-full">
      <CollaboratorAnalyticsHeader onRefresh={handleRefresh} />

      <div className="flex-1 overflow-auto p-6 bg-gray-50">
        <div className="space-y-6">
          <CollaboratorAnalyticsSummary stats={analytics} />

          <CollaboratorAnalyticsFilters
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            sortBy={sortBy}
            setSortBy={setSortBy}
            filterStatus={filterStatus}
            setFilterStatus={setFilterStatus}
          />

          {filteredAndSortedAnalytics.length > 0 && (
            <CollaboratorAnalyticsList collaborators={filteredAndSortedAnalytics} />
          )}

          <CollaboratorAnalyticsEmptyStates 
            hasFiltered={filteredAndSortedAnalytics.length === 0 && analytics.length > 0}
            hasData={analytics.length > 0}
          />
        </div>
      </div>
    </div>
  );
};

export default ProducerCollaboratorsAnalytics;
