
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CollaboratorStatsCard } from "@/components/producer/CollaboratorStatsCard";
import { CollaboratorStats } from "@/hooks/useCollaboratorAnalytics";

interface CollaboratorAnalyticsListProps {
  collaborators: CollaboratorStats[];
}

export const CollaboratorAnalyticsList = ({ collaborators }: CollaboratorAnalyticsListProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Colaboradores ({collaborators.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {collaborators.map((stat) => (
            <CollaboratorStatsCard key={stat.id} stats={stat} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
