
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useSessionParticipants, MentorshipSession } from "@/hooks/useMentorshipSessions";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Users, Calendar } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface SessionParticipantsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  session: MentorshipSession | null;
}

export const SessionParticipantsDialog = ({
  open,
  onOpenChange,
  session,
}: SessionParticipantsDialogProps) => {
  const { data: participants = [], isLoading } = useSessionParticipants(session?.id || '');

  if (!session) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Participantes - {session.title}
          </DialogTitle>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {format(new Date(session.scheduled_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
            </div>
            <Badge variant="outline">
              {participants.length} / {session.max_participants || 100} inscritos
            </Badge>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {isLoading ? (
            <div className="text-center py-8">
              <p>Carregando participantes...</p>
            </div>
          ) : participants.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhum participante inscrito
              </h3>
              <p className="text-gray-600">
                Quando alguém se inscrever na sessão, aparecerá aqui.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Empresa</TableHead>
                  <TableHead>Data de Inscrição</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {participants.map((participant) => (
                  <TableRow key={participant.id}>
                    <TableCell className="font-medium">
                      {participant.participant_name}
                    </TableCell>
                    <TableCell>{participant.participant_email}</TableCell>
                    <TableCell>{participant.company_name || '-'}</TableCell>
                    <TableCell>
                      {format(new Date(participant.registered_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                    </TableCell>
                    <TableCell>
                      <Badge variant={participant.attended === true ? "default" : "outline"}>
                        {participant.attended === true ? "Participou" : 
                         participant.attended === false ? "Não participou" : "Inscrito"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
