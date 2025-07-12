
import { useMyMentorshipSessions } from '@/hooks/useMentorshipSessions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, MapPin, Video, Users, GraduationCap, Building } from 'lucide-react';

const StudentCalendar = () => {
  const { data: myMentorships, isLoading } = useMyMentorshipSessions();

  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case 'mentorship': return <Users className="h-4 w-4" />;
      case 'course_deadline': return <GraduationCap className="h-4 w-4" />;
      case 'company_meeting': return <Building className="h-4 w-4" />;
      case 'training': return <GraduationCap className="h-4 w-4" />;
      default: return <Calendar className="h-4 w-4" />;
    }
  };

  const getEventTypeText = (eventType: string) => {
    switch (eventType) {
      case 'mentorship': return 'Mentoria';
      case 'course_deadline': return 'Prazo do Curso';
      case 'company_meeting': return 'Reunião da Empresa';
      case 'training': return 'Treinamento';
      case 'holiday': return 'Feriado';
      default: return eventType;
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col h-full">
        <div className="bg-white border-b p-6">
          <h1 className="text-2xl font-bold text-gray-900">Calendário</h1>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-lg text-gray-600">Carregando eventos...</div>
        </div>
      </div>
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
    <div className="flex flex-col h-full">
      <div className="bg-white border-b p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Calendário
            </h1>
            <p className="text-gray-600">
              Acompanhe seus eventos e compromissos
            </p>
          </div>
          <Badge className="bg-blue-100 text-blue-800 border-blue-200">
            <Calendar className="w-3 h-3 mr-1" />
            {myMentorships?.length || 0} mentorias
          </Badge>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6 bg-gray-50">
        <div className="grid lg:grid-cols-2 gap-6">
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

          {/* Próximas mentorias */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-green-600" />
                Próximas Mentorias
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {upcomingMentorships.length > 0 ? (
                  upcomingMentorships.map((session) => (
                    <div key={session.id} className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                      <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-full">
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
                            <Calendar className="h-3 w-3" />
                            <span>
                              {new Date(session.scheduled_at).toLocaleDateString('pt-BR', {
                                day: 'numeric',
                                month: 'short',
                              })}
                            </span>
                          </div>
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
                    Nenhuma mentoria futura
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default StudentCalendar;
