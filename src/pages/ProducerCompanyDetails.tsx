
import { AppSidebar } from "@/components/AppSidebar";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Building2,
  ArrowLeft,
  Users,
  Plus,
  Search,
  Crown,
  Star,
  Edit,
  Trash2,
  Mail,
  Calendar,
  BarChart3,
  TrendingUp,
  UserPlus,
  MoreVertical,
  ToggleLeft,
  ToggleRight,
  Loader2
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useParams, Link } from "react-router-dom";
import { useState } from "react";
import React from "react";
import { AddCollaboratorDialog } from "@/components/AddCollaboratorDialog";
import { EditCompanyDialog } from "@/components/EditCompanyDialog";
import { EditCollaboratorDialog as EditCollaboratorDialogComponent } from "@/components/EditCollaboratorDialog";
import { useCompanyById, useToggleCompanyStatus } from "@/hooks/useCompanies";
import {
  useGetCompanyCollaborators,
  useToggleCollaboratorStatus,
  Collaborator
} from "@/hooks/useCompanyCollaborators";
import { Skeleton } from "@/components/ui/skeleton";

const ProducerCompanyDetails = () => {
  const { id } = useParams<{ id: string }>();
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddCollaboratorOpen, setIsAddCollaboratorOpen] = useState(false);
  const [isCompanyEditDialogOpen, setIsCompanyEditDialogOpen] = useState(false);
  const [isEditCollaboratorDialogOpen, setIsEditCollaboratorDialogOpen] = useState(false);
  const [selectedCollaborator, setSelectedCollaborator] = useState<Collaborator | null>(null);

  const { data: company, isLoading, error, dataUpdatedAt } = useCompanyById(id);
  const toggleCompanyStatusMutation = useToggleCompanyStatus();
  const {
    data: collaborators = [],
    isLoading: collaboratorsLoading,
    error: collaboratorsError
  } = useGetCompanyCollaborators(id);
  const toggleCollaboratorStatusMutation = useToggleCollaboratorStatus();

  const getPlanBadgeColor = (planName?: string | null) => {
    switch (planName?.toLowerCase()) {
      case "premium":
        return "bg-purple-100 text-purple-700 border-purple-200";
      case "business":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "basic":
      case "starter":
        return "bg-gray-100 text-gray-700 border-gray-200";
      default:
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
    }
  };

  const getPlanIcon = (planName?: string | null) => {
    switch (planName?.toLowerCase()) {
      case "premium":
        return <Crown className="h-3 w-3" />;
      case "business":
        return <Star className="h-3 w-3" />;
      default:
        return null;
    }
  };

  const filteredCollaborators = collaborators.filter(collaborator =>
    (collaborator.name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
    (collaborator.email?.toLowerCase() || "").includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <>
        <AppSidebar />
        <main className="flex-1 overflow-hidden">
          <div className="flex flex-col h-full">
            <header className="border-b bg-white px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-3">
                    <SidebarTrigger />
                    <Link to="/producer/companies">
                      <Button variant="ghost" size="sm" disabled>
                        <ArrowLeft className="h-4 w-4 mr-1" />
                        Voltar
                      </Button>
                    </Link>
                  </div>
                  <div className="flex items-center space-x-4">
                    <Skeleton className="w-12 h-12 rounded-lg" />
                    <div>
                      <Skeleton className="h-7 w-48 mb-1" />
                      <Skeleton className="h-4 w-64" />
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Skeleton className="h-9 w-36" />
                  <Skeleton className="h-9 w-48" />
                </div>
              </div>
            </header>
            <div className="flex-1 overflow-auto p-6 bg-gray-50 text-center">
              <p>Carregando detalhes da empresa...</p>
            </div>
          </div>
        </main>
      </>
    );
  }

  if (error || !company) {
    return (
      <>
        <AppSidebar />
        <main className="flex-1 overflow-hidden">
          <div className="flex flex-col h-full items-center justify-center p-6">
            <div className="flex items-center space-x-3 mb-4">
              <SidebarTrigger />
              <Link to="/producer/companies">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Voltar para Empresas
                </Button>
              </Link>
            </div>
            <h2 className="text-xl font-semibold text-red-500">Erro ao carregar empresa</h2>
            <p>{error?.message || "A empresa não foi encontrada ou ocorreu um erro."}</p>
          </div>
        </main>
      </>
    );
  }

  const { name, subscription_plan, created_at } = company;
  const currentStudents = company.current_students;
  const maxStudents = company.subscription_plan?.max_students || company.max_students;

  return (
    <>
      <AppSidebar />
      <main className="flex-1 overflow-hidden">
        <div className="flex flex-col h-full">
          {/* Header */}
          <header className="border-b bg-white px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-3">
                  <SidebarTrigger />
                  <Link to="/producer/companies">
                    <Button variant="ghost" size="sm">
                      <ArrowLeft className="h-4 w-4 mr-1" />
                      Voltar
                    </Button>
                  </Link>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-calmon-500 to-calmon-700 flex items-center justify-center">
                    <Building2 className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h1 className="text-2xl font-bold text-gray-900">{name}</h1>
                      {subscription_plan && (
                        <Badge
                          variant="outline"
                          className={`text-xs ${getPlanBadgeColor(subscription_plan.name)}`}
                        >
                          {getPlanIcon(subscription_plan.name)}
                          <span className="ml-1 capitalize">{subscription_plan.name}</span>
                        </Badge>
                      )}
                      <Badge variant={company.is_active ? "default" : "destructive"} className="text-xs">
                        {company.is_active ? "Ativa" : "Inativa"}
                      </Badge>
                    </div>
                    <p className="text-gray-600">
                      {company.current_students || 0}/{subscription_plan?.max_students || 'N/A'} colaboradores •
                      Desde {new Date(created_at).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Button
                  variant="outline"
                  onClick={() => setIsCompanyEditDialogOpen(true)}
                  disabled={isLoading || !!error}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Editar Empresa
                </Button>
                <Button
                  variant="outline"
                  onClick={async () => {
                    if (company) {
                      await toggleCompanyStatusMutation.mutateAsync({
                        id: company.id,
                        currentStatus: company.is_active
                      });
                    }
                  }}
                  disabled={isLoading || !!error || toggleCompanyStatusMutation.isPending}
                >
                  {toggleCompanyStatusMutation.isPending ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : company.is_active ? (
                    <ToggleLeft className="h-4 w-4 mr-2 text-red-600" />
                  ) : (
                    <ToggleRight className="h-4 w-4 mr-2 text-green-600" />
                  )}
                  {toggleCompanyStatusMutation.isPending
                    ? "Alterando..."
                    : company.is_active ? "Bloquear Empresa" : "Desbloquear Empresa"}
                </Button>
                <Button 
                  onClick={() => setIsAddCollaboratorOpen(true)}
                  className="bg-gradient-to-r from-calmon-500 to-calmon-700 hover:from-calmon-600 hover:to-calmon-800 text-white"
                  disabled={isLoading || !!error}
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Adicionar Colaborador
                </Button>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <div className="flex-1 overflow-auto p-6 bg-gray-50">
            <Tabs defaultValue="overview" className="space-y-6">
              <TabsList className="bg-white border">
                <TabsTrigger value="overview">Visão Geral</TabsTrigger>
                <TabsTrigger value="collaborators">Colaboradores</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <Card className="hover-lift">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Colaboradores Ativos</p>
                          <p className="text-2xl font-bold">{company.current_students || 0}</p>
                        </div>
                        <Users className="h-8 w-8 text-blue-600" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="hover-lift">
                    <CardContent className="p-4">
                       <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Plano Atual</p>
                          <p className="text-lg font-semibold">{subscription_plan?.name || "N/A"}</p>
                        </div>
                        {subscription_plan && getPlanIcon(subscription_plan.name) ?
                          React.cloneElement(getPlanIcon(subscription_plan.name) as React.ReactElement, { className: "h-8 w-8 text-green-600" })
                          : <Star className="h-8 w-8 text-gray-400" />
                        }
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="hover-lift">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Ocupação</p>
                          <p className="text-2xl font-bold text-purple-600">
                            {(subscription_plan?.max_students && subscription_plan.max_students > 0)
                              ? `${Math.round(((company.current_students || 0) / subscription_plan.max_students) * 100)}%`
                              : "N/A"}
                          </p>
                        </div>
                        <BarChart3 className="h-8 w-8 text-purple-600" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="hover-lift">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Cursos Ativos</p>
                          <p className="text-2xl font-bold text-orange-600">8</p>
                        </div>
                        <Building2 className="h-8 w-8 text-orange-600" />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Progress Chart Placeholder */}
                <Card>
                  <CardHeader>
                    <CardTitle>Progresso dos Colaboradores</CardTitle>
                    <CardDescription>
                      Acompanhe o progresso geral dos colaboradores nos cursos
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                      <p className="text-gray-500">Gráfico de progresso será implementado aqui</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="collaborators" className="space-y-6">
                {/* Search and Actions */}
                <div className="flex items-center justify-between">
                  <div className="relative w-80">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Buscar colaboradores..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Button 
                    onClick={() => setIsAddCollaboratorOpen(true)}
                    className="bg-gradient-to-r from-calmon-500 to-calmon-700 hover:from-calmon-600 hover:to-calmon-800 text-white"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Colaborador
                  </Button>
                </div>

                {/* Collaborators List */}
                <Card>
                  <CardHeader>
                    <CardTitle>Lista de Colaboradores</CardTitle>
                    <CardDescription>
                      Gerencie os colaboradores da empresa
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                  {collaboratorsLoading ? (
                    <div className="space-y-4">
                      {[1, 2, 3].map(i => (
                        <div key={i} className="flex items-center justify-between p-4 rounded-lg border bg-white">
                          <div className="flex items-center space-x-4">
                            <Skeleton className="w-10 h-10 rounded-full" />
                            <div>
                              <Skeleton className="h-5 w-32 mb-1" />
                              <Skeleton className="h-4 w-48" />
                            </div>
                          </div>
                          <Skeleton className="h-8 w-20" />
                        </div>
                      ))}
                    </div>
                  ) : collaboratorsError ? (
                    <p className="text-red-500 text-center">Erro ao carregar colaboradores: {collaboratorsError.message}</p>
                  ) : filteredCollaborators.length === 0 ? (
                    <p className="text-center text-gray-500 py-4">Nenhum colaborador encontrado para esta empresa.</p>
                  ) : (
                    <div className="space-y-4">
                      {filteredCollaborators.map((collaborator) => (
                        <div 
                          key={collaborator.id}
                          className="flex items-center justify-between p-4 rounded-lg border bg-white hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-center space-x-4">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-calmon-500 to-calmon-700 flex items-center justify-center">
                              <span className="text-white font-medium">
                                {(collaborator.name || "N A").split(' ').map(n => n[0]).join('')}
                              </span>
                            </div>
                            <div>
                              <h3 className="font-medium text-gray-900">{collaborator.name}</h3>
                              <div className="flex items-center space-x-2 text-sm text-gray-500">
                                <span className="flex items-center">
                                  <Mail className="h-3 w-3 mr-1" />
                                  {collaborator.email}
                                </span>
                                {collaborator.position && (
                                  <>
                                  <span>•</span>
                                  <span className="text-xs">{collaborator.position}</span>
                                  </>
                                )}
                                <Badge variant={collaborator.is_active ? "default" : "outline"} className="text-xs ml-2">
                                  {collaborator.is_active ? "Ativo" : "Inativo"}
                                </Badge>
                                {collaborator.needs_password_change && (
                                   <Badge variant="outline" className="text-xs ml-2 border-yellow-500 text-yellow-600">
                                      Pendente Senha
                                   </Badge>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center space-x-2">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button size="sm" variant="outline">
                                  <MoreVertical className="h-3 w-3" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="bg-white">
                                <DropdownMenuItem
                                  onClick={() => {
                                    setSelectedCollaborator(collaborator);
                                    setIsEditCollaboratorDialogOpen(true);
                                  }}
                                >
                                  <Edit className="h-3 w-3 mr-2" />
                                  Editar Dados
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={async () => {
                                    if (id) {
                                      await toggleCollaboratorStatusMutation.mutateAsync({
                                        collaboratorId: collaborator.id,
                                        companyId: id,
                                        currentStatus: collaborator.is_active,
                                      });
                                    }
                                  }}
                                  disabled={toggleCollaboratorStatusMutation.isPending && toggleCollaboratorStatusMutation.variables?.collaboratorId === collaborator.id}
                                >
                                  {toggleCollaboratorStatusMutation.isPending && toggleCollaboratorStatusMutation.variables?.collaboratorId === collaborator.id ? (
                                    <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                                  ) : collaborator.is_active ? (
                                    <ToggleLeft className="h-3 w-3 mr-2 text-red-500" />
                                  ) : (
                                    <ToggleRight className="h-3 w-3 mr-2 text-green-500" />
                                  )}
                                  {collaborator.is_active ? "Bloquear" : "Desbloquear"}
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="analytics">
                <Card>
                  <CardHeader>
                    <CardTitle>Analytics Detalhados</CardTitle>
                    <CardDescription>
                      Relatórios e métricas detalhadas da empresa
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-96 flex items-center justify-center bg-gray-50 rounded-lg">
                      <p className="text-gray-500">Analytics detalhados serão implementados aqui</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>

      <AddCollaboratorDialog 
        isOpen={isAddCollaboratorOpen}
        onClose={() => setIsAddCollaboratorOpen(false)}
        companyId={id || ""}
      />

      {company && (
        <EditCompanyDialog
          key={`company-edit-${dataUpdatedAt}`}
          isOpen={isCompanyEditDialogOpen}
          onClose={() => setIsCompanyEditDialogOpen(false)}
          company={company}
        />
      )}

      {selectedCollaborator && id && (
        <EditCollaboratorDialogComponent
          key={`collaborator-edit-${selectedCollaborator.id}-${collaborators.find(c => c.id === selectedCollaborator.id)?.updated_at || ''}`}
          isOpen={isEditCollaboratorDialogOpen}
          onClose={() => {
            setIsEditCollaboratorDialogOpen(false);
            setSelectedCollaborator(null);
          }}
          collaborator={selectedCollaborator}
          companyId={id}
        />
      )}
    </>
  );
};

export default ProducerCompanyDetails;
