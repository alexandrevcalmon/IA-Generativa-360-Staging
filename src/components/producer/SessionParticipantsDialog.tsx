
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
      <DialogContent className="max-w-4xl bg-gray-900 border-gray-700">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-white">
            <Users className="h-5 w-5 text-blue-400" />
            Participantes - {session.title}
          </DialogTitle>
          <div className="flex items-center gap-4 text-sm text-gray-300">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4 text-gray-400" />
              {format(new Date(session.scheduled_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
            </div>
            <Badge variant="outline" className="border-gray-600 text-gray-300">
              {participants.length} / {session.max_participants || 100} inscritos
            </Badge>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {isLoading ? (
            <div className="text-center py-8">
              <p className="text-gray-300">Carregando participantes...</p>
            </div>
          ) : participants.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">
                Nenhum participante inscrito
              </h3>
              <p className="text-gray-300">
                Quando alguém se inscrever na sessão, aparecerá aqui.
              </p>
            </div>
          ) : (
            <div className="border border-gray-700 rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-800/50 border-gray-700">
                    <TableHead className="text-gray-300 font-medium">Nome</TableHead>
                    <TableHead className="text-gray-300 font-medium">Email</TableHead>
                    <TableHead className="text-gray-300 font-medium">Empresa</TableHead>
                    <TableHead className="text-gray-300 font-medium">Data de Inscrição</TableHead>
                    <TableHead className="text-gray-300 font-medium">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {participants.map((participant) => (
                    <TableRow key={participant.id} className="border-gray-700 hover:bg-gray-800/30">
                      <TableCell className="font-medium text-white">
                        {participant.participant_name}
                      </TableCell>
                      <TableCell className="text-gray-300">{participant.participant_email}</TableCell>
                      <TableCell className="text-gray-300">{participant.company_name || '-'}</TableCell>
                      <TableCell className="text-gray-300">
                        {format(new Date(participant.registered_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={participant.attended === true ? "default" : "outline"}
                          className={
                            participant.attended === true 
                              ? "bg-green-500/20 text-green-300 border-green-500/30"
                              : participant.attended === false 
                                ? "bg-red-500/20 text-red-300 border-red-500/30"
                                : "bg-blue-500/20 text-blue-300 border-blue-500/30"
                          }
                        >
                          {participant.attended === true ? "Participou" : 
                           participant.attended === false ? "Não participou" : "Inscrito"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
