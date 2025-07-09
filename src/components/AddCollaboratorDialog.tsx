
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { UserPlus, Mail, Briefcase, Phone, Loader2 } from "lucide-react";
import { useAddCompanyCollaborator } from "@/hooks/useCompanyCollaborators";

interface AddCollaboratorDialogProps {
  isOpen: boolean;
  onClose: () => void;
  companyId: string;
}

interface CollaboratorFormData {
  name: string;
  email: string;
  position: string;
  phone: string;
}

const initialFormData: CollaboratorFormData = {
  name: "",
  email: "",
  position: "",
  phone: "",
};

export function AddCollaboratorDialog({
  isOpen,
  onClose,
  companyId
}: AddCollaboratorDialogProps) {
  const [formData, setFormData] = useState<CollaboratorFormData>(initialFormData);
  const addCollaboratorMutation = useAddCompanyCollaborator();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const submitData = {
      company_id: companyId,
      name: formData.name,
      email: formData.email,
      position: formData.position || null,
      phone: formData.phone || null,
    };

    try {
      await addCollaboratorMutation.mutateAsync(submitData);
      setFormData(initialFormData);
      onClose();
    } catch (error) {
      console.error("Failed to add collaborator from dialog:", error);
    }
  };

  const handleClose = () => {
    setFormData(initialFormData);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) handleClose();
    }}>
      <DialogContent className="sm:max-w-[450px] bg-white">
        <DialogHeader>
          <DialogTitle className="flex items-center text-xl">
            <UserPlus className="h-5 w-5 mr-2 text-calmon-600" />
            Adicionar Colaborador
          </DialogTitle>
          <DialogDescription>
            Preencha os dados do novo colaborador. Um email de convite será enviado.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="collaborator-name" className="flex items-center">
              <UserPlus className="h-4 w-4 mr-1" /> Nome Completo *
            </Label>
            <Input
              id="collaborator-name"
              placeholder="Digite o nome completo"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="collaborator-email" className="flex items-center">
              <Mail className="h-4 w-4 mr-1" /> Email *
            </Label>
            <Input
              id="collaborator-email"
              type="email"
              placeholder="Digite o email do colaborador"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="collaborator-position" className="flex items-center">
              <Briefcase className="h-4 w-4 mr-1" /> Cargo (Opcional)
            </Label>
            <Input
              id="collaborator-position"
              placeholder="Ex: Desenvolvedor, Designer"
              value={formData.position}
              onChange={(e) => setFormData(prev => ({ ...prev, position: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="collaborator-phone" className="flex items-center">
              <Phone className="h-4 w-4 mr-1" /> Telefone (Opcional)
            </Label>
            <Input
              id="collaborator-phone"
              type="tel"
              placeholder="Ex: (11) 99999-9999"
              value={formData.phone}
              onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
            />
          </div>

          <DialogFooter className="pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={addCollaboratorMutation.isPending}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="bg-gradient-to-r from-calmon-500 to-calmon-700 hover:from-calmon-600 hover:to-calmon-800 text-white min-w-[140px]"
              disabled={addCollaboratorMutation.isPending}
            >
              {addCollaboratorMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              {addCollaboratorMutation.isPending ? "Adicionando..." : "Adicionar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
