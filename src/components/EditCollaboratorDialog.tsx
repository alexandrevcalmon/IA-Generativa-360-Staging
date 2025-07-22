
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
import { useState, useEffect } from "react";
import { UserCog, Mail, Briefcase, Phone, Loader2 } from "lucide-react";
import {
  Collaborator,
  UpdateCollaboratorData,
  useUpdateCompanyCollaborator
} from "@/hooks/useCompanyCollaborators";

interface EditCollaboratorDialogProps {
  isOpen: boolean;
  onClose: () => void;
  collaborator: Collaborator | null;
  companyId: string;
}

interface CollaboratorEditFormData {
  name: string;
  email: string;
  position: string;
  phone: string;
}

const initialFormData: CollaboratorEditFormData = {
  name: "",
  email: "",
  position: "",
  phone: "",
};

export function EditCollaboratorDialog({
  isOpen,
  onClose,
  collaborator,
  companyId
}: EditCollaboratorDialogProps) {
  const [formData, setFormData] = useState<CollaboratorEditFormData>(initialFormData);
  const updateCollaboratorMutation = useUpdateCompanyCollaborator();

  useEffect(() => {
    if (collaborator && isOpen) {
      setFormData({
        name: collaborator.name || "",
        email: collaborator.email || "",
        position: collaborator.position || "",
        phone: collaborator.phone || "",
      });
    } else if (!isOpen) {
      setFormData(initialFormData);
    }
  }, [collaborator, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!collaborator) return;

    const updateData: UpdateCollaboratorData = {
      name: formData.name,
      email: formData.email,
      position: formData.position || null,
      phone: formData.phone || null,
    };

    try {
      await updateCollaboratorMutation.mutateAsync({
        collaboratorId: collaborator.id,
        companyId: companyId,
        data: updateData
      });
      onClose();
    } catch (error) {
      console.error("Failed to update collaborator from dialog:", error);
    }
  };

  if (!collaborator) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) onClose();
    }}>
      <DialogContent className="sm:max-w-[450px] bg-slate-800/90 backdrop-blur-md border border-slate-700/50">
        <DialogHeader>
          <DialogTitle className="flex items-center text-xl text-slate-200">
            <UserCog className="h-5 w-5 mr-2 text-amber-400" />
            Editar Colaborador: {collaborator.name}
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            Atualize os dados do colaborador.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="edit-collaborator-name" className="flex items-center text-slate-300">
              <UserCog className="h-4 w-4 mr-1" /> Nome Completo *
            </Label>
            <Input
              id="edit-collaborator-name"
              placeholder="Digite o nome completo"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              required
              className="bg-slate-700/50 border-slate-600 text-slate-200 placeholder:text-slate-400 focus:border-amber-500 focus:ring-amber-500/20"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-collaborator-email" className="flex items-center text-slate-300">
              <Mail className="h-4 w-4 mr-1" /> Email *
            </Label>
            <Input
              id="edit-collaborator-email"
              type="email"
              placeholder="Digite o email do colaborador"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              required
              className="bg-slate-700/50 border-slate-600 text-slate-200 placeholder:text-slate-400 focus:border-amber-500 focus:ring-amber-500/20"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-collaborator-position" className="flex items-center text-slate-300">
              <Briefcase className="h-4 w-4 mr-1" /> Cargo (Opcional)
            </Label>
            <Input
              id="edit-collaborator-position"
              placeholder="Ex: Desenvolvedor, Designer"
              value={formData.position}
              onChange={(e) => setFormData(prev => ({ ...prev, position: e.target.value }))}
              className="bg-slate-700/50 border-slate-600 text-slate-200 placeholder:text-slate-400 focus:border-amber-500 focus:ring-amber-500/20"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-collaborator-phone" className="flex items-center text-slate-300">
              <Phone className="h-4 w-4 mr-1" /> Telefone (Opcional)
            </Label>
            <Input
              id="edit-collaborator-phone"
              type="tel"
              placeholder="Ex: (11) 99999-9999"
              value={formData.phone}
              onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              className="bg-slate-700/50 border-slate-600 text-slate-200 placeholder:text-slate-400 focus:border-amber-500 focus:ring-amber-500/20"
            />
          </div>

          <DialogFooter className="pt-4">
            <Button
              type="button"
              onClick={onClose}
              disabled={updateCollaboratorMutation.isPending}
              className="bg-transparent border border-slate-600 text-slate-300 hover:bg-slate-700/50 hover:text-slate-200 hover:border-slate-500 transition-all duration-200 px-4 py-2 rounded-md"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-white min-w-[160px] shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              disabled={updateCollaboratorMutation.isPending}
            >
              {updateCollaboratorMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              {updateCollaboratorMutation.isPending ? "Salvando..." : "Salvar Alterações"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
