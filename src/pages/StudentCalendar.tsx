import { PageLayout } from "@/components/PageLayout";
import { PageSection } from "@/components/PageSection";
import { useMyMentorshipSessions } from '@/hooks/useMentorshipSessions';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Video, Users } from 'lucide-react';

const StudentCalendar = () => {
  const { data: myMentorships, isLoading } = useMyMentorshipSessions();

  // Header content com badge de contagem de mentorias
  const headerContent = (
    <Badge className="badge-premium">
      <Calendar className="w-3 h-3 mr-1" />
      {myMentorships?.length || 0} mentorias
    </Badge>
  );

  if (isLoading) {
    return (
      <PageLayout
        title="Calendário"
        subtitle="Carregando eventos..."
        background="gradient"
      >
        <div className="flex items-center justify-center h-64">
          <div className="glass-effect p-8 rounded-xl text-center">
            <div className="animate-pulse mb-4">
              <Calendar className="h-12 w-12 mx-auto text-calmon-500" />
            </div>
            <div className="text-lg text-calmon-800 font-medium">Carregando eventos...</div>
          </div>
        </div>
      </PageLayout>
    );
  }

  const today = new Date();
  const todayMentorships = myMentorships?.filter(session => {
    const eventDate = new Date(session.scheduled_at);
    return eventDate.toDateString() === today.toDateString();
  }) || [];

  const upcomingMentorships = (myMentorships || [])
    .filter(session => new Date(session.scheduled_at) > today)
    .sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime());

  return (
    <PageLayout
      title="Calendário"
      subtitle="Acompanhe seus eventos e compromissos"
      headerContent={headerContent}
      background="gradient"
    >
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Mentorias de hoje */}
        <PageSection title="Hoje" 
          headerClassName="flex items-center gap-2"
          headerContent={<div className="glass-effect p-2 rounded-full"><Calendar className="h-5 w-5 text-calmon-700" /></div>}
        >
          <div className="space-y-4">
            {todayMentorships.length > 0 ? (
              todayMentorships.map((session) => (
                <div key={session.id} className="flex items-start gap-4 p-4 glass-effect rounded-xl hover:shadow-lg transition-all duration-300">
                  <div className="flex items-center justify-center w-10 h-10 bg-calmon-100 rounded-full shadow-sm">
                    <Users className="h-5 w-5 text-calmon-700" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-medium text-calmon-800 text-lg">{session.title}</h4>
                      <Badge className="badge-primary">Mentoria</Badge>
                    </div>
                    {session.description && (
                      <p className="text-sm text-gray-600 mb-3">{session.description}</p>
                    )}
                    <div className="flex items-center gap-4 text-xs">
                      <div className="flex items-center gap-1 bg-white/70 px-2 py-1 rounded-full">
                        <Clock className="h-3 w-3 text-calmon-700" />
                        <span className="text-calmon-800 font-medium">
                          {new Date(session.scheduled_at).toLocaleTimeString('pt-BR', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                      {session.google_meet_url && (
                        <button
                          className="flex items-center gap-1 bg-green-100 text-green-700 font-medium px-3 py-1 rounded-full hover:bg-green-200 transition-colors"
                          onClick={() => window.open(session.google_meet_url, '_blank')}
                        >
                          <Video className="h-3 w-3" />
                          <span>Acessar reunião</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="glass-effect p-6 rounded-xl text-center">
                <Calendar className="h-10 w-10 mx-auto text-gray-400 mb-3" />
                <p className="text-gray-500">
                  Nenhuma mentoria para hoje
                </p>
              </div>
            )}
          </div>
        </PageSection>

        {/* Próximas mentorias */}
        <PageSection title="Próximas Mentorias"
          headerClassName="flex items-center gap-2"
          headerContent={<div className="glass-effect p-2 rounded-full"><Clock className="h-5 w-5 text-green-600" /></div>}
        >
          <div className="space-y-4">
            {upcomingMentorships.length > 0 ? (
              upcomingMentorships.map((session) => (
                <div key={session.id} className="flex items-start gap-4 p-4 glass-effect rounded-xl hover:shadow-lg transition-all duration-300">
                  <div className="flex items-center justify-center w-10 h-10 bg-green-100 rounded-full shadow-sm">
                    <Users className="h-5 w-5 text-green-700" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-medium text-calmon-800 text-lg">{session.title}</h4>
                      <Badge className="badge-premium">Mentoria</Badge>
                    </div>
                    {session.description && (
                      <p className="text-sm text-gray-600 mb-3">{session.description}</p>
                    )}
                    <div className="flex flex-wrap items-center gap-3 text-xs">
                      <div className="flex items-center gap-1 bg-white/70 px-2 py-1 rounded-full">
                        <Calendar className="h-3 w-3 text-green-700" />
                        <span className="text-green-800 font-medium">
                          {new Date(session.scheduled_at).toLocaleDateString('pt-BR', {
                            day: 'numeric',
                            month: 'short',
                          })}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 bg-white/70 px-2 py-1 rounded-full">
                        <Clock className="h-3 w-3 text-green-700" />
                        <span className="text-green-800 font-medium">
                          {new Date(session.scheduled_at).toLocaleTimeString('pt-BR', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                      {session.google_meet_url && (
                        <button
                          className="flex items-center gap-1 bg-green-100 text-green-700 font-medium px-3 py-1 rounded-full hover:bg-green-200 transition-colors"
                          onClick={() => window.open(session.google_meet_url, '_blank')}
                        >
                          <Video className="h-3 w-3" />
                          <span>Acessar reunião</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="glass-effect p-6 rounded-xl text-center">
                <Clock className="h-10 w-10 mx-auto text-gray-400 mb-3" />
                <p className="text-gray-500">
                  Nenhuma mentoria futura
                </p>
              </div>
            )}
          </div>
        </PageSection>
      </div>
    </PageLayout>
  );
};

export default StudentCalendar;
