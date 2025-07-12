import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  UserPlus, 
  Upload, 
  Search, 
  Users, 
  Edit, 
  UserX, 
  UserCheck,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Briefcase,
  MoreVertical,
  AlertTriangle,
  CheckCircle
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CollaboratorForm } from "./CollaboratorForm";
import { BulkUpload } from "./BulkUpload";
import { useAddCompanyCollaborator } from "@/hooks/collaborators/useAddCompanyCollaborator";
import { useGetCompanyCollaborators, useToggleCollaboratorStatus } from "@/hooks/useCompanyCollaborators";
import { useSeatLimit } from "@/hooks/collaborators/useSeatLimit";
import { useCompanyData } from "@/hooks/useCompanyData";
import { useToast } from "@/hooks/use-toast";
import { CreateCollaboratorData, Collaborator } from "@/hooks/collaborators/types";

export const CollaboratorManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState("list");
  const [searchTerm, setSearchTerm] = useState("");
  const [editingCollaborator, setEditingCollaborator] = useState<Collaborator | null>(null);
  const [isBulkUploading, setIsBulkUploading] = useState(false);
  
  const { data: companyData } = useCompanyData();
  const { data: seatInfo } = useSeatLimit();
  const { data: collaborators = [], isLoading: collaboratorsLoading } = useGetCompanyCollaborators(companyData?.id);
  const addCollaboratorMutation = useAddCompanyCollaborator();
  const toggleStatusMutation = useToggleCollaboratorStatus();
  const { toast } = useToast();

  const filteredCollaborators = collaborators.filter(collaborator =>
    collaborator.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    collaborator.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    collaborator.position?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeCollaborators = collaborators.filter(c => c.is_active);
  const inactiveCollaborators = collaborators.filter(c => !c.is_active);

  const handleAddCollaborator = async (data: CreateCollaboratorData) => {
    try {
      await addCollaboratorMutation.mutateAsync(data);
      toast({
        title: "Colaborador cadastrado!",
        description: `${data.name} foi cadastrado e receberá um e-mail de ativação.`,
      });
      setActiveTab("list");
    } catch (error: any) {
      toast({
        title: "Erro ao cadastrar colaborador",
        description: error.message || "Ocorreu um erro inesperado.",
        variant: "destructive"
      });
    }
  };

  const handleBulkUpload = async (collaborators: CreateCollaboratorData[]) => {
    setIsBulkUploading(true);
    try {
      const results = [];
      let successCount = 0;
      let errorCount = 0;

      for (const collaborator of collaborators) {
        try {
          await addCollaboratorMutation.mutateAsync(collaborator);
          results.push({ name: collaborator.name, success: true });
          successCount++;
        } catch (error: any) {
          results.push({ name: collaborator.name, success: false, error: error.message });
          errorCount++;
        }
      }

      if (successCount > 0) {
        toast({
          title: "Importação concluída!",
          description: `${successCount} colaboradores importados com sucesso. ${errorCount} falharam.`,
        });
      }

      if (errorCount === 0) {
        setActiveTab("list");
      }
    } catch (error: any) {
      toast({
        title: "Erro na importação",
        description: error.message || "Ocorreu um erro durante a importação.",
        variant: "destructive"
      });
    } finally {
      setIsBulkUploading(false);
    }
  };

  const handleToggleStatus = async (collaborator: Collaborator) => {
    try {
      await toggleStatusMutation.mutateAsync({
        collaboratorId: collaborator.id,
        companyId: collaborator.company_id,
        currentStatus: collaborator.is_active
      });
      
      const action = collaborator.is_active ? "bloqueado" : "desbloqueado";
      toast({
        title: `Colaborador ${action}!`,
        description: `${collaborator.name} foi ${action} com sucesso.`,
      });
    } catch (error: any) {
      toast({
        title: "Erro ao alterar status",
        description: error.message || "Ocorreu um erro inesperado.",
        variant: "destructive"
      });
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  if (collaboratorsLoading) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando colaboradores...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header com estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold text-gray-900">{collaborators.length}</p>
                <p className="text-sm text-gray-600">Total</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <UserCheck className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold text-gray-900">{activeCollaborators.length}</p>
                <p className="text-sm text-gray-600">Ativos</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <UserX className="h-8 w-8 text-orange-600" />
              <div>
                <p className="text-2xl font-bold text-gray-900">{inactiveCollaborators.length}</p>
                <p className="text-sm text-gray-600">Bloqueados</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <UserPlus className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-2xl font-bold text-gray-900">{seatInfo?.availableSeats || 0}</p>
                <p className="text-sm text-gray-600">Vagas Disponíveis</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Limite do plano */}
      {seatInfo && (
        <Alert className={seatInfo.isAtLimit ? "border-orange-200 bg-orange-50" : "border-blue-200 bg-blue-50"}>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Plano atual:</strong> {seatInfo.activeCollaborators}/{seatInfo.maxCollaborators} colaboradores utilizados.
            {seatInfo.isAtLimit && (
              <span className="text-orange-700 ml-2">
                Limite atingido! Atualize seu plano para adicionar mais colaboradores.
              </span>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* Tabs principais */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="list" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Lista de Colaboradores
          </TabsTrigger>
          <TabsTrigger value="individual" className="flex items-center gap-2" disabled={seatInfo?.isAtLimit}>
            <UserPlus className="h-4 w-4" />
            Cadastrar Individual
          </TabsTrigger>
          <TabsTrigger value="bulk" className="flex items-center gap-2" disabled={seatInfo?.isAtLimit}>
            <Upload className="h-4 w-4" />
            Importação em Massa
          </TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          {/* Busca */}
          <Card>
            <CardContent className="p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
                <Input
                  placeholder="Buscar por nome, e-mail ou cargo..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardContent>
          </Card>

          {/* Lista de colaboradores */}
          <div className="space-y-4">
            {filteredCollaborators.length > 0 ? (
              filteredCollaborators.map((collaborator) => (
                <Card key={collaborator.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <Avatar className="h-12 w-12">
                          <AvatarFallback className="bg-blue-100 text-blue-700 font-semibold">
                            {getInitials(collaborator.name)}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="font-semibold text-gray-900">{collaborator.name}</h3>
                            <Badge 
                              variant={collaborator.is_active ? "default" : "secondary"}
                              className={collaborator.is_active 
                                ? "bg-green-100 text-green-700 border-green-200" 
                                : "bg-gray-100 text-gray-700 border-gray-200"
                              }
                            >
                              {collaborator.is_active ? 'Ativo' : 'Bloqueado'}
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                            <div className="flex items-center space-x-1">
                              <Mail className="h-4 w-4" />
                              <span>{collaborator.email}</span>
                            </div>
                            
                            {collaborator.phone && (
                              <div className="flex items-center space-x-1">
                                <Phone className="h-4 w-4" />
                                <span>{collaborator.phone}</span>
                              </div>
                            )}
                            
                            {collaborator.position && (
                              <div className="flex items-center space-x-1">
                                <Briefcase className="h-4 w-4" />
                                <span>{collaborator.position}</span>
                              </div>
                            )}
                            
                            {collaborator.city && collaborator.state && (
                              <div className="flex items-center space-x-1">
                                <MapPin className="h-4 w-4" />
                                <span>{collaborator.city}, {collaborator.state}</span>
                              </div>
                            )}
                            
                            {collaborator.birth_date && (
                              <div className="flex items-center space-x-1">
                                <Calendar className="h-4 w-4" />
                                <span>Nascimento: {formatDate(collaborator.birth_date)}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setEditingCollaborator(collaborator)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleToggleStatus(collaborator)}
                            className={collaborator.is_active ? "text-orange-600" : "text-green-600"}
                          >
                            {collaborator.is_active ? (
                              <>
                                <UserX className="h-4 w-4 mr-2" />
                                Bloquear
                              </>
                            ) : (
                              <>
                                <UserCheck className="h-4 w-4 mr-2" />
                                Desbloquear
                              </>
                            )}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <Users className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium mb-2 text-gray-900">
                    {searchTerm ? 'Nenhum colaborador encontrado' : 'Nenhum colaborador cadastrado'}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {searchTerm 
                      ? 'Tente buscar com outros termos ou limpe o filtro'
                      : 'Comece cadastrando seu primeiro colaborador'
                    }
                  </p>
                  {!searchTerm && !seatInfo?.isAtLimit && (
                    <Button onClick={() => setActiveTab("individual")}>
                      <UserPlus className="h-4 w-4 mr-2" />
                      Cadastrar Colaborador
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="individual">
          <CollaboratorForm
            onSubmit={handleAddCollaborator}
            isLoading={addCollaboratorMutation.isPending}
            companyId={companyData?.id || ""}
          />
        </TabsContent>

        <TabsContent value="bulk">
          <BulkUpload
            onSubmit={handleBulkUpload}
            isLoading={isBulkUploading}
            companyId={companyData?.id || ""}
            maxCollaborators={seatInfo?.availableSeats || 0}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}; 