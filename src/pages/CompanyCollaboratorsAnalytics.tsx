
import { useState } from "react";
import { useCollaboratorAnalytics } from "@/hooks/useCollaboratorAnalytics";
import { useCollaboratorAnalyticsFiltering } from "@/hooks/useCollaboratorAnalyticsFiltering";
import { CollaboratorAnalyticsHeader } from "@/components/producer/CollaboratorAnalyticsHeader";
import { CollaboratorAnalyticsSummary } from "@/components/producer/CollaboratorAnalyticsSummary";
import { CollaboratorAnalyticsFilters } from "@/components/producer/CollaboratorAnalyticsFilters";
import { CollaboratorAnalyticsList } from "@/components/producer/CollaboratorAnalyticsList";
import { CollaboratorAnalyticsLoading } from "@/components/producer/CollaboratorAnalyticsLoading";
import { CollaboratorAnalyticsError } from "@/components/producer/CollaboratorAnalyticsError";
import { CollaboratorAnalyticsEmptyStates } from "@/components/producer/CollaboratorAnalyticsEmptyStates";

const CompanyCollaboratorsAnalytics = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("updated_at");
  const [filterStatus, setFilterStatus] = useState("all");

  const { data: analytics, isLoading, error, refetch } = useCollaboratorAnalytics();

  const filteredAnalytics = useCollaboratorAnalyticsFiltering(
    analytics || [],
    searchTerm,
    sortBy,
    filterStatus
  );

  const handleRefresh = () => {
    refetch();
  };

  if (isLoading) {
    return <CollaboratorAnalyticsLoading />;
  }

  if (error) {
    return <CollaboratorAnalyticsError error={error} onRetry={handleRefresh} />;
  }

  const hasData = analytics && analytics.length > 0;
  const hasFiltered = Boolean(searchTerm || filterStatus !== "all");

  return (
    <div className="flex flex-col h-full">
      <CollaboratorAnalyticsHeader onRefresh={handleRefresh} />
      
      <div className="flex-1 overflow-auto p-6 bg-calmon-bg-gradient">
        <div className="space-y-6">
          {hasData && (
            <>
              <div className="bg-white/80 backdrop-blur-sm rounded-lg p-1 shadow-lg">
                <CollaboratorAnalyticsSummary stats={analytics} />
              </div>
              
              <div className="bg-white/80 backdrop-blur-sm rounded-lg p-1 shadow-lg">
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
            <div className="bg-white/80 backdrop-blur-sm rounded-lg p-1 shadow-lg">
              <CollaboratorAnalyticsList collaborators={filteredAnalytics} />
            </div>
          ) : (
            <div className="bg-white/80 backdrop-blur-sm rounded-lg p-1 shadow-lg">
              <CollaboratorAnalyticsEmptyStates 
                hasFiltered={hasFiltered} 
                hasData={hasData} 
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CompanyCollaboratorsAnalytics;

