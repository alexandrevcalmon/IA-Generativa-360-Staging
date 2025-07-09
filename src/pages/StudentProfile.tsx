
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  User,
  Settings,
  Bell,
  Shield,
  Camera,
  Calendar,
  Edit,
  Save,
  AlertCircle,
  Loader2,
  RefreshCw,
  CheckCircle,
  XCircle
} from "lucide-react";
import { useState } from "react";
import { useAuth } from '@/hooks/auth';
import { useToast } from '@/hooks/use-toast';
import { useStudentProfile } from '@/hooks/useStudentProfile';

const StudentProfile = () => {
  const { user, loading: authLoading } = useAuth();
  const { data: studentData, isLoading: profileLoading, refetch, error } = useStudentProfile();
  const [isEditing, setIsEditing] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { toast } = useToast();

  const handleRefresh = async () => {
    setIsRefreshing(true);
    console.log('🔄 Manually refreshing student profile...');
    
    try {
      await refetch();
      console.log('✅ Student profile refresh completed');
      toast({
        title: "Dados atualizados",
        description: "As informações do perfil foram atualizadas com sucesso.",
      });
    } catch (error) {
      console.error('❌ Error refreshing student profile:', error);
      toast({
        title: "Erro ao atualizar",
        description: "Não foi possível atualizar os dados. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const getUserInitials = () => {
    if (studentData?.name) {
      return studentData.name.split(' ').map(n => n[0]).join('').toUpperCase();
    }
    if (user?.email) {
      return user.email.charAt(0).toUpperCase();
    }
    return 'U';
  };

  const getProfileCompleteness = () => {
    if (!studentData) return 0;
    
    const fields = [
      studentData.name,
      studentData.email,
      studentData.position,
      studentData.phone
    ];
    
    const completedFields = fields.filter(field => field && field.trim() !== '').length;
    return Math.round((completedFields / fields.length) * 100);
  };

  const loading = authLoading || profileLoading;

  // Show loading state
  if (loading) {
    return (
      <div className="flex flex-col h-full">
        <header className="border-b bg-white px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Meu Perfil</h1>
              <p className="text-gray-600">Carregando informações...</p>
            </div>
          </div>
        </header>
        <div className="flex-1 flex items-center justify-center">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Carregando seu perfil...</span>
          </div>
        </div>
      </div>
    );
  }

  // Show error state if no user
  if (!user) {
    return (
      <div className="flex flex-col h-full">
        <header className="border-b bg-white px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Meu Perfil</h1>
              <p className="text-gray-600">Erro ao carregar perfil</p>
            </div>
          </div>
        </header>
        <div className="flex-1 flex items-center justify-center">
          <Alert className="max-w-md">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Não foi possível carregar as informações do usuário. Faça login novamente.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  const profileCompleteness = getProfileCompleteness();

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <header className="border-b bg-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Meu Perfil</h1>
            <p className="text-gray-600">Gerencie suas informações pessoais e preferências</p>
            {studentData && (
              <div className="flex items-center mt-2 space-x-2">
                <div className="flex items-center space-x-1">
                  {profileCompleteness === 100 ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <XCircle className="h-4 w-4 text-orange-500" />
                  )}
                  <span className="text-sm text-gray-500">
                    Perfil {profileCompleteness}% completo
                  </span>
                </div>
              </div>
            )}
          </div>
          <div className="flex space-x-2">
            <Button 
              onClick={handleRefresh}
              variant="outline"
              disabled={isRefreshing}
            >
              {isRefreshing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Atualizando...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Atualizar
                </>
              )}
            </Button>
            <Button 
              onClick={() => setIsEditing(!isEditing)}
              variant={isEditing ? "default" : "outline"}
            >
              {isEditing ? (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Salvar
                </>
              ) : (
                <>
                  <Edit className="h-4 w-4 mr-2" />
                  Editar Perfil
                </>
              )}
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-auto p-6 bg-gray-50">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Data Status Alerts */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Erro ao carregar dados:</strong> Não foi possível carregar as informações do perfil.
                <Button 
                  onClick={handleRefresh} 
                  variant="outline" 
                  size="sm" 
                  className="ml-2"
                  disabled={isRefreshing}
                >
                  {isRefreshing ? 'Atualizando...' : 'Tentar Novamente'}
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {!studentData && !error && user && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Dados do colaborador não encontrados:</strong> Suas informações não foram carregadas corretamente. 
                Tente atualizar os dados ou entre em contato com sua empresa.
                <Button 
                  onClick={handleRefresh} 
                  variant="outline" 
                  size="sm" 
                  className="ml-2"
                  disabled={isRefreshing}
                >
                  {isRefreshing ? 'Atualizando...' : 'Tentar Novamente'}
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {studentData && !studentData.name && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Algumas informações do seu perfil estão incompletas. Entre em contato com sua empresa para atualizar seus dados.
              </AlertDescription>
            </Alert>
          )}

          {/* Profile Overview */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6">
                <div className="relative">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src="/api/placeholder/96/96" />
                    <AvatarFallback className="text-lg bg-blue-100 text-blue-700">
                      {getUserInitials()}
                    </AvatarFallback>
                  </Avatar>
                  {isEditing && (
                    <Button
                      size="sm"
                      className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full"
                    >
                      <Camera className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                
                <div className="flex-1 text-center md:text-left">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {studentData?.name || user.email || 'Usuário'}
                  </h2>
                  <p className="text-gray-600">{studentData?.email || user.email}</p>
                  {studentData?.companies && (
                    <p className="text-sm text-blue-600 mt-1">
                      {studentData.companies.name}
                    </p>
                  )}
                  {studentData?.position && (
                    <p className="text-sm text-gray-500 mt-1">
                      {studentData.position}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-2 mt-3 justify-center md:justify-start">
                    <Badge variant="secondary">Colaborador</Badge>
                    {studentData?.is_active !== undefined && (
                      studentData.is_active ? (
                        <Badge variant="outline" className="bg-green-100 text-green-700">Ativo</Badge>
                      ) : (
                        <Badge variant="outline" className="bg-red-100 text-red-700">Inativo</Badge>
                      )
                    )}
                    {profileCompleteness < 100 && (
                      <Badge variant="outline" className="bg-orange-100 text-orange-700">
                        Perfil Incompleto
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Profile Tabs */}
          <Tabs defaultValue="personal" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="personal">Pessoal</TabsTrigger>
              <TabsTrigger value="activity">Atividade</TabsTrigger>
              <TabsTrigger value="settings">Configurações</TabsTrigger>
            </TabsList>

            <TabsContent value="personal" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <User className="h-5 w-5 mr-2" />
                    Informações Pessoais
                  </CardTitle>
                  <CardDescription>
                    Suas informações pessoais e de contato
                    {!studentData && (
                      <span className="text-red-600 ml-2">
                        (Dados não carregados - tente atualizar)
                      </span>
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nome Completo</Label>
                      <Input 
                        id="name" 
                        value={studentData?.name || ''}
                        disabled={!isEditing}
                        readOnly
                        placeholder={!studentData ? "Dados não carregados" : "Nome não informado"}
                      />
                      {!studentData?.name && studentData && (
                        <p className="text-sm text-orange-600">Nome não informado no sistema</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input 
                        id="email" 
                        type="email" 
                        value={studentData?.email || user.email || ''}
                        disabled={!isEditing}
                        readOnly
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Telefone</Label>
                      <Input 
                        id="phone" 
                        type="tel" 
                        value={studentData?.phone || ''}
                        disabled={!isEditing}
                        readOnly
                        placeholder={!studentData ? "Dados não carregados" : "Telefone não informado"}
                      />
                      {!studentData?.phone && studentData && (
                        <p className="text-sm text-gray-500">Telefone não informado</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="position">Cargo</Label>
                      <Input 
                        id="position" 
                        value={studentData?.position || ''}
                        disabled={!isEditing}
                        readOnly
                        placeholder={!studentData ? "Dados não carregados" : "Cargo não informado"}
                      />
                      {!studentData?.position && studentData && (
                        <p className="text-sm text-gray-500">Cargo não informado</p>
                      )}
                    </div>
                  </div>
                  {studentData?.companies && (
                    <div className="space-y-2">
                      <Label htmlFor="company">Empresa</Label>
                      <Input 
                        id="company" 
                        value={studentData.companies.name}
                        disabled
                        readOnly
                      />
                    </div>
                  )}
                  
                  {/* Data Status Summary */}
                  <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium mb-2">Status dos Dados</h4>
                    <div className="grid md:grid-cols-2 gap-2 text-sm">
                      <div className="flex items-center space-x-2">
                        {studentData?.name ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-500" />
                        )}
                        <span>Nome: {studentData?.name ? 'Informado' : 'Não informado'}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        {studentData?.position ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />  
                        ) : (
                          <XCircle className="h-4 w-4 text-orange-500" />
                        )}
                        <span>Cargo: {studentData?.position ? 'Informado' : 'Não informado'}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        {studentData?.phone ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <XCircle className="h-4 w-4 text-orange-500" />
                        )}
                        <span>Telefone: {studentData?.phone ? 'Informado' : 'Não informado'}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        {studentData?.companies ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-500" />
                        )}
                        <span>Empresa: {studentData?.companies ? 'Vinculado' : 'Não vinculado'}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="activity" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Atividade Recente</CardTitle>
                  <CardDescription>
                    Suas últimas atividades na plataforma
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Nenhuma atividade registrada
                    </h3>
                    <p className="text-gray-600">
                      Comece explorando os cursos disponíveis
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="settings" className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Bell className="h-5 w-5 mr-2" />
                      Notificações
                    </CardTitle>
                    <CardDescription>
                      Configure suas preferências de notificação
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Novos cursos</p>
                        <p className="text-sm text-gray-600">Notificar sobre novos cursos disponíveis</p>
                      </div>
                      <Switch />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Progresso</p>
                        <p className="text-sm text-gray-600">Lembretes de estudo e marcos</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Comunidade</p>
                        <p className="text-sm text-gray-600">Atividades da comunidade</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Shield className="h-5 w-5 mr-2" />
                      Privacidade
                    </CardTitle>
                    <CardDescription>
                      Gerencie suas configurações de privacidade
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Perfil público</p>
                        <p className="text-sm text-gray-600">Permitir que outros vejam seu perfil</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Progresso visível</p>
                        <p className="text-sm text-gray-600">Mostrar progresso nos cursos</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Atividade na comunidade</p>
                        <p className="text-sm text-gray-600">Mostrar participação em discussões</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default StudentProfile;
