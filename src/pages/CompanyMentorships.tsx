
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useCompanyMentorships } from "@/hooks/useCompanyMentorships";
import { useCompanyData } from "@/hooks/useCompanyData";
import { useEnrollInCollectiveMentorship, useUnenrollFromCollectiveMentorship } from "@/hooks/useCollectiveMentorshipEnrollment";
import { Calendar, CheckCircle, AlertCircle } from "lucide-react";
import { useState } from "react";
import { MentorshipStatsGrid } from "@/components/mentorship/MentorshipStatsGrid";
import { MentorshipCard } from "@/components/mentorship/MentorshipCard";
import { MentorshipSection } from "@/components/mentorship/MentorshipSection";
import { MentorshipHeader } from "@/components/mentorship/MentorshipHeader";
import { MentorshipEmptyState } from "@/components/mentorship/MentorshipEmptyState";

const CompanyMentorships = () => {
  const { data: mentorships, isLoading, error, refetch } = useCompanyMentorships();
  const { data: companyData } = useCompanyData();
  const enrollMutation = useEnrollInCollectiveMentorship();
  const unenrollMutation = useUnenrollFromCollectiveMentorship();
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const handleEnroll = (sessionId: string) => {
    enrollMutation.mutate(sessionId);
  };

  const handleUnenroll = (sessionId: string) => {
    unenrollMutation.mutate(sessionId);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col h-full">
        <MentorshipHeader 
          companyName={companyData?.name}
          onRefresh={handleRefresh}
          refreshing={refreshing}
        />
        <div className="flex-1 p-6 bg-gray-50">
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-white rounded-lg shadow-sm"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col h-full">
        <MentorshipHeader 
          companyName={companyData?.name}
          onRefresh={handleRefresh}
          refreshing={refreshing}
        />
        <div className="flex-1 p-6 bg-gray-50 flex items-center justify-center">
          <Card className="border border-gray-200 bg-white shadow-lg">
            <CardContent className="p-8 text-center">
              <AlertCircle className="h-12 w-12 mx-auto text-red-500 mb-4" />
              <h3 className="text-lg font-medium mb-2 text-gray-900">Erro ao carregar sessões de mentoria</h3>
              <p className="text-gray-600 mb-4">
                Ocorreu um erro ao carregar as sessões de mentoria. Tente novamente.
              </p>
              <div className="space-x-2">
                <Button 
                  onClick={handleRefresh} 
                  disabled={refreshing}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {refreshing ? 'Atualizando...' : 'Tentar Novamente'}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => window.location.reload()}
                  className="border-gray-200 text-gray-700 hover:bg-gray-50"
                >
                  Recarregar Página
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const upcomingMentorships = mentorships?.filter(m => 
    new Date(m.scheduled_at) > new Date() && m.status === 'scheduled'
  ) || [];

  const pastMentorships = mentorships?.filter(m => 
    new Date(m.scheduled_at) <= new Date() || m.status === 'completed'
  ) || [];

  return (
    <div className="flex flex-col h-full">
      <MentorshipHeader 
        companyName={companyData?.name}
        onRefresh={handleRefresh}
        refreshing={refreshing}
      />

      <div className="flex-1 overflow-auto p-6 bg-gray-50">
        <div className="space-y-6">
          {/* Stats Cards */}
          {mentorships && mentorships.length > 0 && (
            <div className="bg-white rounded-lg p-1 shadow-lg border border-gray-200">
              <MentorshipStatsGrid mentorships={mentorships} />
            </div>
          )}

          {/* Upcoming Mentorships */}
          {upcomingMentorships.length > 0 && (
            <MentorshipSection 
              title="Próximas Mentorias"
              icon={<Calendar className="h-5 w-5 mr-2 text-blue-600" />}
            >
              {upcomingMentorships.map(mentorship => (
                <MentorshipCard
                  key={mentorship.id}
                  mentorship={mentorship}
                  onEnroll={handleEnroll}
                  onUnenroll={handleUnenroll}
                  enrolling={enrollMutation.isPending}
                  unenrolling={unenrollMutation.isPending}
                />
              ))}
            </MentorshipSection>
          )}

          {/* Past Mentorships */}
          {pastMentorships.length > 0 && (
            <MentorshipSection 
              title="Mentorias Anteriores"
              icon={<CheckCircle className="h-5 w-5 mr-2 text-green-600" />}
            >
              {pastMentorships.map(mentorship => (
                <MentorshipCard
                  key={mentorship.id}
                  mentorship={mentorship}
                  isPast={true}
                />
              ))}
            </MentorshipSection>
          )}

          {/* Empty State */}
          {(!mentorships || mentorships.length === 0) && (
            <div className="bg-white rounded-lg p-1 shadow-lg border border-gray-200">
              <MentorshipEmptyState />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CompanyMentorships;

