import { PageLayout } from "@/components/PageLayout";
import { PageSection } from "@/components/PageSection";
import { useMentorshipSessions, useRegisterForMentorship, useUserMentorshipRegistrations, useMyMentorshipSessions } from '@/hooks/useMentorshipSessions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Calendar, Clock, Video, AlertCircle, Check, Globe } from 'lucide-react';
import { toast } from 'sonner';

// Função utilitária para renderizar badge de tipo de mentoria
const getTypeBadge = (session: any) => {
  if (session.is_collective) {
    return (
      <Badge className="bg-purple-900/20 border border-purple-500/30 text-purple-400">
        <Globe className="h-3 w-3 mr-1" />
        Coletiva
      </Badge>
    );
  }
  return (
    <Badge className="bg-orange-900/20 border border-orange-500/30 text-orange-400">
      <Users className="h-3 w-3 mr-1" />
      Exclusiva
    </Badge>
  );
};

// Novo componente para o calendário de mentorias do usuário
const MentorshipCalendarSection = () => {
  const { data: allMentorships, isLoading } = useMentorshipSessions();
  const { data: userRegistrations = [] } = useUserMentorshipRegistrations();
  const { registerForMentorship } = useRegisterForMentorship();
  const today = new Date();
  
  // Apenas sessões agendadas
  const scheduledMentorships = (allMentorships || []).filter(session => session.status === 'scheduled');
  const todayMentorships = scheduledMentorships.filter(session => {
    const eventDate = new Date(session.scheduled_at);
    return eventDate.toDateString() === today.toDateString();
  }).sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime());

  const handleRegister = async (sessionId: string) => {
    try {
      await registerForMentorship(sessionId);
    } catch (error) {
      console.error('Error registering for mentorship:', error);
    }
  };

  const isUserRegistered = (sessionId: string) => {
    return userRegistrations.includes(sessionId);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-lg text-slate-300">Carregando mentorias...</div>
      </div>
    );
  }

  return (
    <div className="mb-8">
      {/* Mentorias de hoje */}
      <Card className="border-slate-700/50 bg-slate-900/20 shadow-lg">
        <CardHeader className="bg-slate-900/20 text-white border-b border-slate-700/50">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-emerald-400" />
            Hoje ({today.toLocaleDateString('pt-BR')})
          </CardTitle>
        </CardHeader>
        <CardContent className="bg-slate-900/20">
          <div className="space-y-4">
            {todayMentorships.length > 0 ? (
              todayMentorships.map((session) => {
                const isRegistered = isUserRegistered(session.id);
                
                return (
                  <Card key={session.id} className="border-emerald-500/30 bg-emerald-500/10">
                    <CardHeader className="bg-emerald-500/10 text-white border-b border-emerald-500/20">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{session.title}</CardTitle>
                        <div className="flex items-center gap-2">
                          {getTypeBadge(session)}
                          <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30">
                            Hoje
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="bg-emerald-500/10">
                      <div className="space-y-3">
                        {session.description && (
                          <p className="text-slate-300">{session.description}</p>
                        )}
                        <div className="space-y-3">
                          {/* Data e Hora em Destaque */}
                          <div className="bg-emerald-900/20 border border-emerald-500/30 rounded-lg p-3">
                            <div className="flex items-center gap-2 text-emerald-300 font-medium">
                              <Calendar className="h-5 w-5" />
                              <span className="text-lg">
                                {new Date(session.scheduled_at).toLocaleDateString('pt-BR', {
                                  weekday: 'long',
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </span>
                            </div>
                          </div>
                          
                          {/* Outras Informações */}
                          <div className="flex items-center gap-4 text-sm text-slate-400">
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              <span>{session.duration_minutes} minutos</span>
                            </div>
                            {session.max_participants && (
                              <div className="flex items-center gap-1">
                                <Users className="h-4 w-4" />
                                <span>Máx. {session.max_participants} participantes</span>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {/* Show different buttons based on registration status and meeting link */}
                        {isRegistered ? (
                          session.google_meet_url ? (
                            <Button asChild className="w-full bg-emerald-600 hover:bg-emerald-700 text-white">
                              <a href={session.google_meet_url} target="_blank" rel="noopener noreferrer">
                                <Video className="h-4 w-4 mr-2" />
                                Acessar Reunião
                              </a>
                            </Button>
                          ) : (
                            <Button disabled className="w-full bg-emerald-600 text-white">
                              <Check className="h-4 w-4 mr-2" />
                              Inscrito - Link em breve
                            </Button>
                          )
                        ) : (
                          <Button 
                            onClick={() => handleRegister(session.id)}
                            className="w-full bg-orange-600 hover:bg-orange-700 text-white"
                          >
                            <Users className="h-4 w-4 mr-2" />
                            Participar
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            ) : (
              <p className="text-slate-400 text-center py-4">
                Nenhuma mentoria para hoje
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const StudentMentorship = () => {
  const { data: mentorshipSessions, isLoading, error } = useMentorshipSessions();
  const { data: userRegistrations = [] } = useUserMentorshipRegistrations();
  const { registerForMentorship } = useRegisterForMentorship();

  const handleRegister = async (sessionId: string) => {
    try {
      await registerForMentorship(sessionId);
    } catch (error) {
      console.error('Error registering for mentorship:', error);
      // Error toast is already handled in the hook
    }
  };

  const isUserRegistered = (sessionId: string) => {
    return userRegistrations.includes(sessionId);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'live': return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      case 'completed': return 'bg-slate-500/20 text-slate-300 border-slate-500/30';
      case 'cancelled': return 'bg-red-500/20 text-red-300 border-red-500/30';
      default: return 'bg-slate-500/20 text-slate-300 border-slate-500/30';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'scheduled': return 'Agendada';
      case 'live': return 'Ao Vivo';
      case 'completed': return 'Concluída';
      case 'cancelled': return 'Cancelada';
      default: return status;
    }
  };



  // Header content com badge de sessões disponíveis
  const headerContent = (
    <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">
      <Users className="w-3 h-3 mr-1" />
      {mentorshipSessions?.length || 0} sessões disponíveis
    </Badge>
  );

  if (isLoading) {
    return (
      <PageLayout
        title="Mentoria"
        subtitle="Carregando mentorias..."
        background="dark"
      >
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-slate-300">Carregando mentorias...</div>
        </div>
      </PageLayout>
    );
  }

  if (error) {
    return (
      <PageLayout
        title="Mentoria"
        subtitle="Erro ao carregar mentorias"
        background="dark"
      >
        <PageSection transparent>
          <div className="text-center py-12">
            <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">
              Erro ao carregar mentorias
            </h3>
            <p className="text-slate-300">
              Tente recarregar a página ou entre em contato com o suporte.
            </p>
            <Button 
              onClick={() => window.location.reload()}
              className="mt-4 bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              Tentar Novamente
            </Button>
          </div>
        </PageSection>
      </PageLayout>
    );
  }

  // Regra: sessões de hoje só aparecem no card 'Hoje', não em 'Próximas Sessões'
  const today = new Date();
  const isToday = (dateStr: string) => {
    const eventDate = new Date(dateStr);
    return eventDate.toDateString() === today.toDateString();
  };

  const upcomingSessions = mentorshipSessions?.filter(session => 
    session.status === 'scheduled' &&
    !isToday(session.scheduled_at)
  ).sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime()) || [];

  const liveSessions = mentorshipSessions?.filter(session => 
    session.status === 'live'
  ).sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime()) || [];

  return (
    <PageLayout
      title="Mentoria"
      subtitle="Participe de sessões de mentoria e aprenda com especialistas"
      headerContent={headerContent}
      background="dark"
    >
      <div className="space-y-6">
        {/* Calendário de mentorias do usuário */}
        <PageSection transparent>
          <MentorshipCalendarSection />
        </PageSection>

        {/* Live Sessions */}
        {liveSessions.length > 0 && (
          <PageSection 
            title="🔴 Ao Vivo Agora" 
            transparent 
            headerClassName="text-white"
          >
            <div className="grid gap-4">
              {liveSessions.map((session) => {
                const isRegistered = isUserRegistered(session.id);
                
                return (
                  <Card key={session.id} className="border-emerald-500/30 bg-emerald-500/10">
                    <CardHeader className="bg-emerald-500/10 text-white border-b border-emerald-500/20">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{session.title}</CardTitle>
                        <div className="flex items-center gap-2">
                          {getTypeBadge(session)}
                          <Badge className={getStatusColor(session.status)}>
                            {getStatusText(session.status)}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="bg-emerald-500/10">
                      <div className="space-y-3">
                        {session.description && (
                          <p className="text-slate-300">{session.description}</p>
                        )}
                        <div className="space-y-3">
                          {/* Data e Hora em Destaque */}
                          <div className="bg-emerald-900/20 border border-emerald-500/30 rounded-lg p-3">
                            <div className="flex items-center gap-2 text-emerald-300 font-medium">
                              <Calendar className="h-5 w-5" />
                              <span className="text-lg">
                                {new Date(session.scheduled_at).toLocaleDateString('pt-BR', {
                                  weekday: 'long',
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </span>
                            </div>
                          </div>
                          
                          {/* Outras Informações */}
                          <div className="flex items-center gap-4 text-sm text-slate-400">
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              <span>{session.duration_minutes} minutos</span>
                            </div>
                            {session.max_participants && (
                              <div className="flex items-center gap-1">
                                <Users className="h-4 w-4" />
                                <span>Máx. {session.max_participants} participantes</span>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {/* Show meeting link if user is registered */}
                        {isRegistered && session.google_meet_url ? (
                          <Button asChild className="w-full bg-emerald-600 hover:bg-emerald-700 text-white">
                            <a href={session.google_meet_url} target="_blank" rel="noopener noreferrer">
                              <Video className="h-4 w-4 mr-2" />
                              Entrar na Sessão
                            </a>
                          </Button>
                        ) : !isRegistered ? (
                          <Button 
                            onClick={() => handleRegister(session.id)}
                            className="w-full bg-orange-600 hover:bg-orange-700 text-white"
                          >
                            <Users className="h-4 w-4 mr-2" />
                            Participar
                          </Button>
                        ) : (
                          <Button disabled className="w-full bg-emerald-600 text-white">
                            <Check className="h-4 w-4 mr-2" />
                            Inscrito - Link em breve
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </PageSection>
        )}

        {/* Upcoming Sessions */}
        <PageSection 
          title="Próximas Sessões" 
          transparent 
          headerClassName="text-white"
        >
          <div className="grid gap-4">
            {upcomingSessions.length > 0 ? (
              upcomingSessions.map((session) => {
                const isRegistered = isUserRegistered(session.id);
                
                return (
                  <Card key={session.id} className="border-slate-700/50 bg-slate-900/20 shadow-lg">
                    <CardHeader className="bg-slate-900/20 text-white border-b border-slate-700/50">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{session.title}</CardTitle>
                        <div className="flex items-center gap-2">
                          {getTypeBadge(session)}
                          <Badge className={getStatusColor(session.status)}>
                            {getStatusText(session.status)}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="bg-slate-900/20">
                      <div className="space-y-3">
                        {session.description && (
                          <p className="text-slate-300">{session.description}</p>
                        )}
                                            <div className="space-y-3">
                      {/* Data e Hora em Destaque */}
                      <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-3">
                        <div className="flex items-center gap-2 text-blue-300 font-medium">
                          <Calendar className="h-5 w-5" />
                          <span className="text-lg">
                            {new Date(session.scheduled_at).toLocaleDateString('pt-BR', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                      </div>
                      
                      {/* Outras Informações */}
                      <div className="flex items-center gap-4 text-sm text-slate-400">
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>{session.duration_minutes} minutos</span>
                        </div>
                        {session.max_participants && (
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            <span>Máx. {session.max_participants} participantes</span>
                          </div>
                        )}
                      </div>
                    </div>

                        {/* Show different buttons based on registration status and meeting link */}
                        {isRegistered ? (
                          session.google_meet_url ? (
                            <Button asChild className="w-full bg-emerald-600 hover:bg-emerald-700 text-white">
                              <a href={session.google_meet_url} target="_blank" rel="noopener noreferrer">
                                <Video className="h-4 w-4 mr-2" />
                                Acessar Reunião
                              </a>
                            </Button>
                          ) : (
                            <Button disabled className="w-full bg-emerald-600 text-white">
                              <Check className="h-4 w-4 mr-2" />
                              Inscrito - Link em breve
                            </Button>
                          )
                        ) : (
                          <Button 
                            onClick={() => handleRegister(session.id)}
                            className="w-full bg-orange-600 hover:bg-orange-700 text-white"
                          >
                            <Users className="h-4 w-4 mr-2" />
                            Participar
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            ) : (
              <Card className="border-slate-700/50 bg-slate-900/20 shadow-lg">
                <CardContent className="p-8 text-center bg-slate-900/20">
                  <Users className="h-12 w-12 text-slate-500 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-white mb-2">
                    Nenhuma mentoria agendada
                  </h3>
                  <p className="text-slate-300">
                    Novas sessões de mentoria serão disponibilizadas em breve.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </PageSection>
      </div>
    </PageLayout>
  );
};

export default StudentMentorship;
