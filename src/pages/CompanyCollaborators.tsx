
import { useState } from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useCollaboratorAnalytics } from "@/hooks/useCollaboratorAnalytics";
import { useCompanyData } from "@/hooks/useCompanyData";
import { 
  Users, 
  Search, 
  Mail, 
  Phone, 
  Calendar,
  Activity,
  BookOpen,
  Clock
} from "lucide-react";

const CompanyCollaborators = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const { data: analytics, isLoading, error } = useCollaboratorAnalytics();
  const { data: companyData } = useCompanyData();

  if (isLoading) {
    return (
      <div className="flex flex-col h-full">
        <header className="border-b bg-white px-6 py-4">
          <div className="flex items-center space-x-4">
            <SidebarTrigger />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Colaboradores</h1>
              <p className="text-gray-600">Carregando dados dos colaboradores...</p>
            </div>
          </div>
        </header>
        <div className="flex-1 p-6 bg-gray-50">
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-white rounded-lg shadow-sm"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col h-full">
        <header className="border-b bg-white px-6 py-4">
          <div className="flex items-center space-x-4">
            <SidebarTrigger />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Colaboradores</h1>
              <p className="text-gray-600">Erro ao carregar dados</p>
            </div>
          </div>
        </header>
        <div className="flex-1 p-6 bg-gray-50 flex items-center justify-center">
          <Card className="border border-gray-200 bg-white shadow-lg">
            <CardContent className="p-8 text-center">
              <p className="text-red-600 mb-4 font-medium">Erro ao carregar dados dos colaboradores</p>
              <Button 
                onClick={() => window.location.reload()}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Tentar Novamente
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const filteredCollaborators = analytics?.filter(collaborator =>
    collaborator.collaborator.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    collaborator.collaborator.email.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const formatLastLogin = (date: string | null) => {
    if (!date) return 'Nunca acessou';
    return new Date(date).toLocaleDateString('pt-BR');
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <header className="border-b bg-white px-6 py-4">
        <div className="flex items-center space-x-4">
          <SidebarTrigger />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Colaboradores</h1>
            <p className="text-gray-600">
              Gerencie os colaboradores da {companyData?.name || 'empresa'}
            </p>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-auto p-6 bg-gray-50">
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="border border-gray-200 bg-white shadow-lg">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Users className="h-8 w-8 text-blue-600" />
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{analytics?.length || 0}</p>
                    <p className="text-sm text-gray-600">Total</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border border-gray-200 bg-white shadow-lg">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Activity className="h-8 w-8 text-green-600" />
                  <div>
                    <p className="text-2xl font-bold text-gray-900">
                      {analytics?.filter(c => c.collaborator.is_active).length || 0}
                    </p>
                    <p className="text-sm text-gray-600">Ativos</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-gray-200 bg-white shadow-lg">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <BookOpen className="h-8 w-8 text-purple-600" />
                  <div>
                    <p className="text-2xl font-bold text-gray-900">
                      {analytics?.reduce((sum, c) => sum + c.lessons_completed, 0) || 0}
                    </p>
                    <p className="text-sm text-gray-600">Lições Concluídas</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-gray-200 bg-white shadow-lg">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Clock className="h-8 w-8 text-orange-600" />
                  <div>
                    <p className="text-2xl font-bold text-gray-900">
                      {Math.round((analytics?.reduce((sum, c) => sum + c.total_watch_time_minutes, 0) || 0) / 60)}h
                    </p>
                    <p className="text-sm text-gray-600">Tempo Total</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Search */}
          <Card className="border border-gray-200 bg-white shadow-lg">
            <CardContent className="p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
                <Input
                  placeholder="Buscar colaboradores por nome ou email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </CardContent>
          </Card>

          {/* Collaborators List */}
          {filteredCollaborators.length > 0 ? (
            <div className="grid gap-4">
              {filteredCollaborators.map((stat) => (
                <Card key={stat.id} className="border border-gray-200 bg-white shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <Avatar className="h-12 w-12">
                          <AvatarFallback className="bg-blue-100 text-blue-700 font-semibold">
                            {getInitials(stat.collaborator.name)}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="font-semibold text-gray-900">
                              {stat.collaborator.name}
                            </h3>
                            <Badge 
                              variant={stat.collaborator.is_active ? "default" : "secondary"}
                              className={stat.collaborator.is_active 
                                ? "bg-green-100 text-green-700 border-green-200" 
                                : "bg-gray-100 text-gray-700 border-gray-200"
                              }
                            >
                              {stat.collaborator.is_active ? 'Ativo' : 'Inativo'}
                            </Badge>
                          </div>
                          
                          <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                            <div className="flex items-center space-x-1">
                              <Mail className="h-4 w-4" />
                              <span>{stat.collaborator.email}</span>
                            </div>
                            
                            {stat.collaborator.phone && (
                              <div className="flex items-center space-x-1">
                                <Phone className="h-4 w-4" />
                                <span>{stat.collaborator.phone}</span>
                              </div>
                            )}
                            
                            {stat.collaborator.position && (
                              <div className="flex items-center space-x-1">
                                <span className="font-medium">Cargo:</span>
                                <span>{stat.collaborator.position}</span>
                              </div>
                            )}
                            
                            <div className="flex items-center space-x-1">
                              <Calendar className="h-4 w-4" />
                              <span>Último acesso: {formatLastLogin(stat.last_login_at)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div className="bg-gray-100 rounded-lg p-3">
                          <p className="text-lg font-semibold text-gray-700">{stat.lessons_completed}</p>
                          <p className="text-xs text-gray-600">Lições</p>
                        </div>
                        <div className="bg-gray-100 rounded-lg p-3">
                          <p className="text-lg font-semibold text-gray-700">{stat.courses_completed}</p>
                          <p className="text-xs text-gray-600">Cursos</p>
                        </div>
                        <div className="bg-gray-100 rounded-lg p-3">
                          <p className="text-lg font-semibold text-gray-700">{stat.total_points}</p>
                          <p className="text-xs text-gray-600">Pontos</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="border border-gray-200 bg-white shadow-lg">
              <CardContent className="p-12 text-center">
                <Users className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium mb-2 text-gray-900">
                  {searchTerm ? 'Nenhum colaborador encontrado' : 'Nenhum colaborador cadastrado'}
                </h3>
                <p className="text-gray-600">
                  {searchTerm 
                    ? 'Tente buscar com outros termos ou limpe o filtro'
                    : 'Entre em contato com o administrador para adicionar colaboradores'
                  }
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default CompanyCollaborators;

