
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  UserPlus, 
  Edit, 
  UserX, 
  UserCheck,
  Mail,
  Phone,
  Briefcase 
} from "lucide-react";
import { useState } from "react";
import { 
  useGetCompanyCollaborators, 
  useToggleCollaboratorStatus 
} from "@/hooks/useCompanyCollaborators";
import { AddCollaboratorDialog } from "@/components/AddCollaboratorDialog";
import { EditCollaboratorDialog } from "@/components/EditCollaboratorDialog";
import { CompanyWithPlan } from "@/hooks/useCompaniesWithPlans";
import { Collaborator } from "@/hooks/useCompanyCollaborators";

interface CompanyCollaboratorsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  company: CompanyWithPlan;
}

export function CompanyCollaboratorsDialog({ 
  isOpen, 
  onClose, 
  company 
}: CompanyCollaboratorsDialogProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingCollaborator, setEditingCollaborator] = useState<Collaborator | null>(null);
  
  const { data: collaborators = [], isLoading } = useGetCompanyCollaborators(company.id);
  const toggleStatusMutation = useToggleCollaboratorStatus();

  const activeCollaborators = collaborators.filter(c => c.is_active);
  const inactiveCollaborators = collaborators.filter(c => !c.is_active);
  
  // Get the max collaborators from the company's subscription plan
  const maxCollaborators = company.subscription_plan?.max_students || 5;
  const canAddMore = activeCollaborators.length < maxCollaborators;

  const handleToggleStatus = async (collaborator: Collaborator) => {
    await toggleStatusMutation.mutateAsync({
      collaboratorId: collaborator.id,
      companyId: company.id,
      currentStatus: collaborator.is_active
    });
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-calmon-600" />
              Colaboradores - {company.name}
            </DialogTitle>
            <DialogDescription>
              Gerencie os colaboradores desta empresa. Máximo de {maxCollaborators} colaboradores ativos conforme o plano {company.subscription_plan?.name || 'contratado'}.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Header com estatísticas */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="text-sm text-gray-600">
                  <span className="font-semibold text-lg">
                    {activeCollaborators.length}/{maxCollaborators}
                  </span> colaboradores ativos
                </div>
                {!canAddMore && (
                  <Badge variant="secondary" className="text-amber-600 bg-amber-50">
                    Limite do plano atingido
                  </Badge>
                )}
                {company.subscription_plan && (
                  <Badge className="bg-blue-100 text-blue-700 border-blue-200">
                    Plano {company.subscription_plan.name}
                  </Badge>
                )}
              </div>
              
              <Button
                onClick={() => setIsAddDialogOpen(true)}
                disabled={!canAddMore}
                className="bg-gradient-to-r from-calmon-500 to-calmon-700 hover:from-calmon-600 hover:to-calmon-800 text-white"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Adicionar Colaborador
              </Button>
            </div>

            {isLoading ? (
              <div className="text-center py-8">
                <p className="text-gray-500">Carregando colaboradores...</p>
              </div>
            ) : collaborators.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">Nenhum colaborador cadastrado</p>
                <Button
                  onClick={() => setIsAddDialogOpen(true)}
                  className="bg-gradient-to-r from-calmon-500 to-calmon-700 hover:from-calmon-600 hover:to-calmon-800 text-white"
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Adicionar Primeiro Colaborador
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Colaboradores Ativos */}
                {activeCollaborators.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <UserCheck className="h-5 w-5 text-green-600" />
                      Colaboradores Ativos ({activeCollaborators.length})
                    </h3>
                    <div className="grid gap-3">
                      {activeCollaborators.map((collaborator) => (
                        <div key={collaborator.id} className="bg-green-50 border border-green-200 rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                <Users className="h-5 w-5 text-green-600" />
                              </div>
                              <div>
                                <h4 className="font-semibold text-gray-900">{collaborator.name}</h4>
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                  <Mail className="h-3 w-3" />
                                  <span>{collaborator.email}</span>
                                </div>
                                {collaborator.phone && (
                                  <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <Phone className="h-3 w-3" />
                                    <span>{collaborator.phone}</span>
                                  </div>
                                )}
                                {collaborator.position && (
                                  <div className="flex items-center gap-2 text-sm text-gray-500">
                                    <Briefcase className="h-3 w-3" />
                                    <span>{collaborator.position}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge className="bg-green-100 text-green-700 border-green-200">
                                Ativo
                              </Badge>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setEditingCollaborator(collaborator)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleToggleStatus(collaborator)}
                                disabled={toggleStatusMutation.isPending}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <UserX className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Colaboradores Inativos */}
                {inactiveCollaborators.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <UserX className="h-5 w-5 text-gray-500" />
                      Colaboradores Bloqueados ({inactiveCollaborators.length})
                    </h3>
                    <div className="grid gap-3">
                      {inactiveCollaborators.map((collaborator) => (
                        <div key={collaborator.id} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                                <Users className="h-5 w-5 text-gray-500" />
                              </div>
                              <div>
                                <h4 className="font-semibold text-gray-700">{collaborator.name}</h4>
                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                  <Mail className="h-3 w-3" />
                                  <span>{collaborator.email}</span>
                                </div>
                                {collaborator.phone && (
                                  <div className="flex items-center gap-2 text-sm text-gray-500">
                                    <Phone className="h-3 w-3" />
                                    <span>{collaborator.phone}</span>
                                  </div>
                                )}
                                {collaborator.position && (
                                  <div className="flex items-center gap-2 text-sm text-gray-400">
                                    <Briefcase className="h-3 w-3" />
                                    <span>{collaborator.position}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary" className="bg-gray-100 text-gray-600">
                                Bloqueado
                              </Badge>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setEditingCollaborator(collaborator)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleToggleStatus(collaborator)}
                                disabled={toggleStatusMutation.isPending || !canAddMore}
                                className="text-green-600 hover:text-green-700 hover:bg-green-50"
                              >
                                <UserCheck className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <AddCollaboratorDialog
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        companyId={company.id}
      />

      {editingCollaborator && (
        <EditCollaboratorDialog
          isOpen={!!editingCollaborator}
          onClose={() => setEditingCollaborator(null)}
          collaborator={editingCollaborator}
          companyId={company.id}
        />
      )}
    </>
  );
}
