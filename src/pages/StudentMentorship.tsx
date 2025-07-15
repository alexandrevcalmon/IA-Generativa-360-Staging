
import { useMentorshipSessions, useRegisterForMentorship, useUserMentorshipRegistrations, useMyMentorshipSessions } from '@/hooks/useMentorshipSessions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Calendar, Clock, Video, AlertCircle, Check } from 'lucide-react';
import { toast } from 'sonner';

// Novo componente para o calendário de mentorias do usuário
const MentorshipCalendarSection = () => {
  const { data: allMentorships, isLoading } = useMentorshipSessions();
  const today = new Date();
  // Apenas sessões agendadas
  const scheduledMentorships = (allMentorships || []).filter(session => session.status === 'scheduled');
  const todayMentorships = scheduledMentorships.filter(session => {
    const eventDate = new Date(session.scheduled_at);
    return eventDate.toDateString() === today.toDateString();
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-lg text-gray-600">Carregando mentorias...</div>
      </div>
    );
  }

  return (
    <div className="mb-8">
      {/* Mentorias de hoje */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-600" />
            Hoje ({today.toLocaleDateString('pt-BR')})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {todayMentorships.length > 0 ? (
              todayMentorships.map((session) => (
                <div key={session.id} className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full">
                    <Users className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-gray-900">{session.title}</h4>
                      <Badge variant="outline" className="text-xs">Mentoria</Badge>
                    </div>
                    {session.description && (
                      <p className="text-sm text-gray-600 mb-2">{session.description}</p>
                    )}
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>
                          {new Date(session.scheduled_at).toLocaleTimeString('pt-BR', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                      {session.google_meet_url && (
                        <button
                          className="flex items-center gap-1 text-green-700 font-semibold hover:underline ml-2"
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
              <p className="text-gray-500 text-center py-4">
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
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'live': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
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

  if (isLoading) {
    return (
      <div className="flex flex-col h-full">
        <div className="bg-white border-b p-6">
          <h1 className="text-2xl font-bold text-gray-900">Mentoria</h1>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-lg text-gray-600">Carregando mentorias...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col h-full">
        <div className="bg-white border-b p-6">
          <h1 className="text-2xl font-bold text-gray-900">Mentoria</h1>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Erro ao carregar mentorias
            </h3>
            <p className="text-gray-600">
              Tente recarregar a página ou entre em contato com o suporte.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Regra: sessões de hoje só aparecem no card 'Hoje', não em 'Próximas Sessões'
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const isToday = (dateStr: string) => {
    const d = new Date(dateStr);
    d.setHours(0, 0, 0, 0);
    return d.getTime() === today.getTime();
  };

  const upcomingSessions = mentorshipSessions?.filter(session => 
    session.status === 'scheduled' &&
    new Date(session.scheduled_at) > today &&
    !isToday(session.scheduled_at)
  ) || [];

  const liveSessions = mentorshipSessions?.filter(session => 
    session.status === 'live'
  ) || [];

  return (
    <div className="flex flex-col h-full">
      <div className="bg-white border-b p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Mentoria
            </h1>
            <p className="text-gray-600">
              Participe de sessões de mentoria e aprenda com especialistas
            </p>
          </div>
          <Badge className="bg-purple-100 text-purple-800 border-purple-200">
            <Users className="w-3 h-3 mr-1" />
            {mentorshipSessions?.length || 0} sessões disponíveis
          </Badge>
        </div>
      </div>
      {/* Calendário de mentorias do usuário */}
      <div className="p-6 bg-gray-50">
        <MentorshipCalendarSection />
      </div>
      <div className="flex-1 overflow-auto p-6 bg-gray-50">
        <div className="space-y-6">
          {/* Live Sessions */}
          {liveSessions.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                🔴 Ao Vivo Agora
              </h2>
              <div className="grid gap-4">
                {liveSessions.map((session) => {
                  const isRegistered = isUserRegistered(session.id);
                  
                  return (
                    <Card key={session.id} className="border-green-200 bg-green-50">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">{session.title}</CardTitle>
                          <Badge className={getStatusColor(session.status)}>
                            {getStatusText(session.status)}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {session.description && (
                            <p className="text-gray-600">{session.description}</p>
                          )}
                          <div className="flex items-center gap-4 text-sm text-gray-600">
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
                          
                          {/* Show meeting link if user is registered */}
                          {isRegistered && session.google_meet_url ? (
                            <Button asChild className="w-full bg-green-600 hover:bg-green-700">
                              <a href={session.google_meet_url} target="_blank" rel="noopener noreferrer">
                                <Video className="h-4 w-4 mr-2" />
                                Entrar na Sessão
                              </a>
                            </Button>
                          ) : !isRegistered ? (
                            <Button 
                              onClick={() => handleRegister(session.id)}
                              className="w-full"
                            >
                              <Users className="h-4 w-4 mr-2" />
                              Participar
                            </Button>
                          ) : (
                            <Button disabled className="w-full bg-green-600">
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
            </div>
          )}

          {/* Upcoming Sessions */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Próximas Sessões
            </h2>
            <div className="grid gap-4">
              {upcomingSessions.length > 0 ? (
                upcomingSessions.map((session) => {
                  const isRegistered = isUserRegistered(session.id);
                  
                  return (
                    <Card key={session.id}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">{session.title}</CardTitle>
                          <Badge className={getStatusColor(session.status)}>
                            {getStatusText(session.status)}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {session.description && (
                            <p className="text-gray-600">{session.description}</p>
                          )}
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              <span>
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

                          {/* Show different buttons based on registration status and meeting link */}
                          {isRegistered ? (
                            session.google_meet_url ? (
                              <Button asChild className="w-full bg-green-600 hover:bg-green-700">
                                <a href={session.google_meet_url} target="_blank" rel="noopener noreferrer">
                                  <Video className="h-4 w-4 mr-2" />
                                  Acessar Reunião
                                </a>
                              </Button>
                            ) : (
                              <Button disabled className="w-full bg-green-600">
                                <Check className="h-4 w-4 mr-2" />
                                Inscrito - Link em breve
                              </Button>
                            )
                          ) : (
                            <Button 
                              onClick={() => handleRegister(session.id)}
                              className="w-full"
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
                <Card>
                  <CardContent className="p-8 text-center">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Nenhuma mentoria agendada
                    </h3>
                    <p className="text-gray-600">
                      Novas sessões de mentoria serão disponibilizadas em breve.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentMentorship;
