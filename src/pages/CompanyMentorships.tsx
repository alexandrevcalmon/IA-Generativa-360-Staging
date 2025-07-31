import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useCompanyMentorships } from "@/hooks/useCompanyMentorships";
import { useCompanyData } from "@/hooks/useCompanyData";
import { useEnrollInCollectiveMentorship, useUnenrollFromCollectiveMentorship } from "@/hooks/useCollectiveMentorshipEnrollment";
import { Calendar, CheckCircle, AlertCircle, RefreshCw, Users, Clock, Video } from "lucide-react";
import { useState } from "react";
import { MentorshipStatsGrid } from "@/components/mentorship/MentorshipStatsGrid";
import { MentorshipCard } from "@/components/mentorship/MentorshipCard";
import { MentorshipEmptyState } from "@/components/mentorship/MentorshipEmptyState";

// Componente para o banner de mentorias de hoje
const TodayMentorshipsBanner = ({ 
  mentorships, 
  onEnroll, 
  onUnenroll, 
  enrolling, 
  unenrolling 
}: { 
  mentorships: any[];
  onEnroll?: (sessionId: string) => void;
  onUnenroll?: (sessionId: string) => void;
  enrolling?: boolean;
  unenrolling?: boolean;
}) => {
  const today = new Date();
  const todayMentorships = mentorships?.filter(m => {
    const eventDate = new Date(m.scheduled_at);
    return eventDate.toDateString() === today.toDateString() && m.status === 'scheduled';
  }) || [];

  return (
    <div className="mb-8">
      <Card className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/30 shadow-2xl">
        <CardHeader className="bg-gray-700/30 border-b border-gray-600/30">
          <CardTitle className="flex items-center gap-2 text-white">
            <Calendar className="h-5 w-5 text-emerald-400" />
            Hoje ({today.toLocaleDateString('pt-BR')})
          </CardTitle>
        </CardHeader>
        <CardContent className="bg-gray-800/50">
          <div className="space-y-4">
            {todayMentorships.length > 0 ? (
              todayMentorships.map((mentorship) => (
                <div key={mentorship.id} className="bg-gray-700/30 backdrop-blur-sm rounded-xl border border-gray-600/30 p-4">
                  <MentorshipCard
                    mentorship={mentorship}
                    onEnroll={onEnroll}
                    onUnenroll={onUnenroll}
                    enrolling={enrolling}
                    unenrolling={unenrolling}
                  />
                </div>
              ))
            ) : (
              <div className="flex items-center justify-center py-6">
                <div className="text-center">
                  <Calendar className="h-8 w-8 text-gray-500 mx-auto mb-2" />
                  <p className="text-gray-400">Nenhuma mentoria agendada para hoje</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

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
      <div className="min-h-screen bg-gray-900 text-white">
        <div className="container mx-auto px-6 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-500 to-yellow-500 bg-clip-text text-transparent">
              Mentorias
            </h1>
            <p className="text-gray-400 mt-2">
              Sessões de mentoria para {companyData?.name || 'sua empresa'}
            </p>
          </div>
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-gray-800 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        <div className="container mx-auto px-6 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-500 to-yellow-500 bg-clip-text text-transparent">
              Mentorias
            </h1>
            <p className="text-gray-400 mt-2">
              Sessões de mentoria para {companyData?.name || 'sua empresa'}
            </p>
          </div>
          <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/30 shadow-2xl rounded-xl p-8 text-center">
            <AlertCircle className="h-16 w-16 mx-auto text-red-400 mb-6" />
            <h3 className="text-xl font-medium mb-3 text-white">Erro ao carregar sessões de mentoria</h3>
            <p className="text-gray-400 mb-6 max-w-md mx-auto">
              Ocorreu um erro ao carregar as sessões de mentoria. Tente novamente.
            </p>
            <div className="space-x-3">
              <Button
                onClick={handleRefresh}
                disabled={refreshing}
                className="bg-orange-600 hover:bg-orange-500 text-white"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                {refreshing ? 'Atualizando...' : 'Tentar Novamente'}
              </Button>
              <Button
                variant="outline"
                onClick={() => window.location.reload()}
                className="bg-gray-700/50 border-gray-600 text-gray-300 hover:bg-gray-600 hover:text-white"
              >
                Recarregar Página
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const upcomingMentorships = mentorships?.filter(m =>
    new Date(m.scheduled_at) > new Date() && m.status === 'scheduled'
  ).sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime()) || [];

  const pastMentorships = mentorships?.filter(m =>
    new Date(m.scheduled_at) <= new Date() || m.status === 'completed'
  ).sort((a, b) => new Date(b.scheduled_at).getTime() - new Date(a.scheduled_at).getTime()) || [];

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-500 to-yellow-500 bg-clip-text text-transparent">
              Mentorias
            </h1>
            <p className="text-gray-400 mt-2">
              Sessões de mentoria para {companyData?.name || 'sua empresa'}
            </p>
          </div>
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={refreshing}
            className="bg-gray-700/50 border-gray-600 text-gray-300 hover:bg-gray-600 hover:text-white"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Atualizando...' : 'Atualizar'}
          </Button>
        </div>

        <div className="space-y-8">
          {/* Stats Cards */}
          {mentorships && mentorships.length > 0 && (
            <div>
              <MentorshipStatsGrid mentorships={mentorships} />
            </div>
          )}

          {/* Today's Mentorships Banner */}
          <TodayMentorshipsBanner 
            mentorships={mentorships || []} 
            onEnroll={handleEnroll}
            onUnenroll={handleUnenroll}
            enrolling={enrollMutation.isPending}
            unenrolling={unenrollMutation.isPending}
          />

          {/* Upcoming Mentorships */}
          {upcomingMentorships.length > 0 && (
            <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/30 shadow-2xl rounded-xl p-6">
              <div className="flex items-center mb-6">
                <div className="bg-teal-900/20 border border-teal-500/30 p-2 rounded-full mr-3">
                  <Calendar className="h-5 w-5 text-teal-400" />
                </div>
                <h2 className="text-xl font-semibold text-white">Próximas Mentorias</h2>
              </div>
              <div className="space-y-4">
                {upcomingMentorships.map(mentorship => (
                  <div key={mentorship.id} className="bg-gray-700/30 backdrop-blur-sm rounded-xl border border-gray-600/30 p-4">
                    <MentorshipCard
                      mentorship={mentorship}
                      onEnroll={handleEnroll}
                      onUnenroll={handleUnenroll}
                      enrolling={enrollMutation.isPending}
                      unenrolling={unenrollMutation.isPending}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Past Mentorships */}
          {pastMentorships.length > 0 && (
            <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/30 shadow-2xl rounded-xl p-6">
              <div className="flex items-center mb-6">
                <div className="bg-emerald-900/20 border border-emerald-500/30 p-2 rounded-full mr-3">
                  <CheckCircle className="h-5 w-5 text-emerald-400" />
                </div>
                <h2 className="text-xl font-semibold text-white">Mentorias Anteriores</h2>
              </div>
              <div className="space-y-4">
                {pastMentorships.map(mentorship => (
                  <div key={mentorship.id} className="bg-gray-700/30 backdrop-blur-sm rounded-xl border border-gray-600/30 p-4">
                    <MentorshipCard
                      mentorship={mentorship}
                      isPast={true}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {(!mentorships || mentorships.length === 0) && (
            <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/30 shadow-2xl rounded-xl p-8">
              <MentorshipEmptyState />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CompanyMentorships;
