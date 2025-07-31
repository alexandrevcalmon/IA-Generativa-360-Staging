
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCreateMentorshipSession, useUpdateMentorshipSession, MentorshipSession } from "@/hooks/useMentorshipSessions";
import { useCompaniesWithPlans } from "@/hooks/useCompaniesWithPlans";
import { useCreateMentorshipNotification } from "@/hooks/useMentorshipNotifications";

interface CreateMentorshipSessionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingSession?: MentorshipSession | null;
}

export const CreateMentorshipSessionDialog = ({
  open,
  onOpenChange,
  editingSession,
}: CreateMentorshipSessionDialogProps) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [scheduledDate, setScheduledDate] = useState("");
  const [duration, setDuration] = useState(60);
  const [maxParticipants, setMaxParticipants] = useState(100);
  const [googleMeetUrl, setGoogleMeetUrl] = useState("");
  const [isCollective, setIsCollective] = useState(true);
  const [targetCompanyId, setTargetCompanyId] = useState<string>("");
  const [companySearchTerm, setCompanySearchTerm] = useState("");

  // Buscar empresas para o dropdown
  const { data: companies = [], isLoading: companiesLoading } = useCompaniesWithPlans();

  // Atualizar campos quando editingSession muda
  useEffect(() => {
    if (editingSession) {
      console.log('🔄🔄🔄 Atualizando campos da mentoria 🔄🔄🔄');
      console.log('editingSession:', editingSession);
      setTitle(editingSession.title || "");
      setDescription(editingSession.description || "");
      setScheduledDate(
        editingSession.scheduled_at 
          ? new Date(editingSession.scheduled_at).toISOString().slice(0, 16) 
          : ""
      );
      setDuration(editingSession.duration_minutes || 60);
      setMaxParticipants(editingSession.max_participants || 100);
      setGoogleMeetUrl(editingSession.google_meet_url || "");
      setIsCollective(editingSession.is_collective ?? true);
      setTargetCompanyId(editingSession.target_company_id || "");
      console.log('🔄🔄🔄 Campos atualizados 🔄🔄🔄');
    } else {
      // Reset form quando não há sessão para editar
      setTitle("");
      setDescription("");
      setScheduledDate("");
      setDuration(60);
      setMaxParticipants(100);
      setGoogleMeetUrl("");
      setIsCollective(true);
      setTargetCompanyId("");
      setCompanySearchTerm("");
    }
  }, [editingSession]);

  // Atualizar max_participants quando uma empresa específica é selecionada
  useEffect(() => {
    if (!isCollective && targetCompanyId) {
      const selectedCompany = companies.find(c => c.id === targetCompanyId);
      if (selectedCompany && selectedCompany.subscription_plan) {
        // Usar o max_students do plano da empresa
        setMaxParticipants(selectedCompany.subscription_plan.max_students);
        console.log('📊 Atualizando max_participants para:', selectedCompany.subscription_plan.max_students, 'da empresa:', selectedCompany.name);
      }
    } else if (isCollective) {
      // Reset para valor padrão quando for coletiva
      setMaxParticipants(100);
    }
  }, [isCollective, targetCompanyId, companies]);

  const createMutation = useCreateMentorshipSession();
  const updateMutation = useUpdateMentorshipSession();
  const createNotificationMutation = useCreateMentorshipNotification();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title || !scheduledDate) return;

    const sessionData = {
      title,
      description,
      scheduled_at: new Date(scheduledDate).toISOString(),
      duration_minutes: duration,
      max_participants: maxParticipants,
      google_meet_url: googleMeetUrl || undefined,
      status: 'scheduled' as const,
      is_active: true,
      is_collective: isCollective,
      target_company_id: isCollective ? undefined : targetCompanyId || undefined,
    };

    try {
      let createdSession;
      
      if (editingSession) {
        await updateMutation.mutateAsync({
          id: editingSession.id,
          updates: sessionData,
        });
      } else {
        createdSession = await createMutation.mutateAsync(sessionData);
        
        // Se for mentoria específica de empresa, criar notificação
        if (!isCollective && targetCompanyId && createdSession) {
          const selectedCompany = companies.find(c => c.id === targetCompanyId);
          if (selectedCompany) {
            await createNotificationMutation.mutateAsync({
              sessionId: createdSession.id,
              companyId: targetCompanyId,
              title: `Nova Mentoria: ${title}`,
              message: `Uma nova sessão de mentoria foi criada especificamente para ${selectedCompany.name}. Título: ${title}. Data: ${new Date(scheduledDate).toLocaleDateString('pt-BR')}.`
            });
          }
        }
      }
      
      onOpenChange(false);
      resetForm();
    } catch (error) {
      console.error('Error saving session:', error);
    }
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setScheduledDate("");
    setDuration(60);
    setMaxParticipants(100);
    setGoogleMeetUrl("");
    setIsCollective(true);
    setTargetCompanyId("");
    setCompanySearchTerm("");
  };

  const handleClose = () => {
    onOpenChange(false);
    if (!editingSession) {
      resetForm();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] !bg-gray-900 !border-gray-700 max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="!text-white">
            {editingSession ? "Editar Sessão" : "Nova Sessão de Mentoria"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 flex-1 overflow-y-auto pr-2">
          <div>
            <Label htmlFor="title" className="!text-gray-300">Título *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Digite o título da sessão"
              required
              className="!bg-gray-800 !border-gray-600 !text-white !placeholder-gray-400 focus:!border-blue-500 focus:!ring-blue-500"
            />
          </div>

          <div>
            <Label htmlFor="description" className="!text-gray-300">Descrição</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descreva o conteúdo da sessão"
              rows={3}
              className="!bg-gray-800 !border-gray-600 !text-white !placeholder-gray-400 focus:!border-blue-500 focus:!ring-blue-500"
            />
          </div>

          <div>
            <Label className="!text-gray-300">Tipo de Mentoria</Label>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="collective"
                  name="mentorshipType"
                  checked={isCollective}
                  onChange={() => setIsCollective(true)}
                  className="text-blue-500 focus:ring-blue-500"
                />
                <Label htmlFor="collective" className="!text-gray-300 cursor-pointer">
                  Coletiva (disponível para todas as empresas)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="specific"
                  name="mentorshipType"
                  checked={!isCollective}
                  onChange={() => setIsCollective(false)}
                  className="text-blue-500 focus:ring-blue-500"
                />
                <Label htmlFor="specific" className="!text-gray-300 cursor-pointer">
                  Selecionar Empresa
                </Label>
              </div>
            </div>
          </div>

          {!isCollective && (
            <div>
              <Label htmlFor="company" className="!text-gray-300">Empresa</Label>
              <div className="space-y-2">
                <Input
                  type="text"
                  placeholder="Digite para buscar empresa..."
                  value={companySearchTerm}
                  onChange={(e) => setCompanySearchTerm(e.target.value)}
                  className="!bg-gray-800 !border-gray-600 !text-white !placeholder-gray-400 focus:!border-blue-500 focus:!ring-blue-500"
                />
                <Select value={targetCompanyId} onValueChange={setTargetCompanyId}>
                  <SelectTrigger className="!bg-gray-800 !border-gray-600 !text-white focus:!border-blue-500 focus:!ring-blue-500">
                    <SelectValue placeholder="Selecione uma empresa" />
                  </SelectTrigger>
                  <SelectContent className="!bg-gray-800 !border-gray-600">
                    {companies
                      .filter(company => 
                        company.name.toLowerCase().includes(companySearchTerm.toLowerCase()) ||
                        company.official_name?.toLowerCase().includes(companySearchTerm.toLowerCase())
                      )
                      .sort((a, b) => a.name.localeCompare(b.name))
                      .map((company) => (
                        <SelectItem 
                          key={company.id} 
                          value={company.id}
                          className="!text-gray-300 hover:!bg-gray-700"
                        >
                          {company.name}
                          {company.official_name && company.official_name !== company.name && (
                            <span className="text-gray-400 ml-2">({company.official_name})</span>
                          )}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          <div>
            <Label htmlFor="scheduled_date" className="!text-gray-300">Data e Hora *</Label>
            <Input
              id="scheduled_date"
              type="datetime-local"
              value={scheduledDate}
              onChange={(e) => setScheduledDate(e.target.value)}
              required
              className="!bg-gray-800 !border-gray-600 !text-white focus:!border-blue-500 focus:!ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="duration" className="!text-gray-300">Duração (minutos)</Label>
              <Input
                id="duration"
                type="number"
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                min="15"
                max="480"
                className="!bg-gray-800 !border-gray-600 !text-white focus:!border-blue-500 focus:!ring-blue-500"
              />
            </div>
            <div>
              <Label htmlFor="max_participants" className="!text-gray-300">
                Máx. Participantes
                {!isCollective && targetCompanyId && (
                  <span className="text-blue-400 text-xs ml-2">
                    (baseado no plano da empresa)
                  </span>
                )}
              </Label>
              <Input
                id="max_participants"
                type="number"
                value={maxParticipants}
                onChange={(e) => setMaxParticipants(Number(e.target.value))}
                min="1"
                max="1000"
                disabled={!isCollective && targetCompanyId}
                className={`!bg-gray-800 !border-gray-600 !text-white focus:!border-blue-500 focus:!ring-blue-500 ${
                  !isCollective && targetCompanyId ? '!opacity-60 !cursor-not-allowed' : ''
                }`}
              />
              {!isCollective && targetCompanyId && (
                <p className="text-xs text-blue-400 mt-1">
                  Valor baseado no plano da empresa selecionada
                </p>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="google_meet_url" className="!text-gray-300">Link da Reunião (opcional)</Label>
            <Input
              id="google_meet_url"
              value={googleMeetUrl}
              onChange={(e) => setGoogleMeetUrl(e.target.value)}
              placeholder="https://meet.google.com/... ou outro link"
              className="!bg-gray-800 !border-gray-600 !text-white !placeholder-gray-400 focus:!border-blue-500 focus:!ring-blue-500"
            />
          </div>
        </form>

        {/* Botões fixos na parte inferior */}
        <div className="flex justify-end space-x-2 pt-4 border-t border-gray-700 mt-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={handleClose}
            className="!bg-gray-800 !border-gray-600 !text-gray-300 hover:!bg-gray-700 hover:!text-white"
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={createMutation.isPending || updateMutation.isPending}
            className="!bg-gradient-to-r !from-blue-600 !to-purple-600 hover:!from-blue-700 hover:!to-purple-700 !text-white"
          >
            {editingSession ? "Atualizar" : "Criar"} Sessão
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
