import { PageLayout } from "@/components/PageLayout";
import { PageSection } from "@/components/PageSection";
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
import { useAuth } from '@/hooks/auth/useAuth';
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
      toast.success({
        title: "Dados atualizados",
        description: "As informações do perfil foram atualizadas com sucesso."
      });
    } catch (error) {
      console.error('❌ Error refreshing student profile:', error);
      toast.error({
        title: "Erro ao atualizar",
        description: "Não foi possível atualizar os dados. Tente novamente."
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

  // Header content com botões de atualizar e editar
  const headerContent = (
    <div className="flex space-x-2">
      <Button 
        onClick={handleRefresh}
        variant="outline"
        disabled={isRefreshing}
        className="border-slate-600 text-slate-300 hover:bg-slate-700/50"
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
        className={isEditing ? "ai-gradient text-white" : "border-slate-600 text-slate-300 hover:bg-slate-700/50"}
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
  );

  // Show loading state
  if (loading) {
    return (
      <div className="dark-theme-override min-h-screen" style={{ 
        backgroundColor: '#0f172a',
        color: 'white'
      }}>
        <PageLayout
          title="Meu Perfil"
          subtitle="Carregando informações..."
          background="dark"
          className="dark-theme-override"
        >
          <div className="flex items-center justify-center h-64">
            <div className="flex items-center space-x-2 text-white">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span>Carregando seu perfil...</span>
            </div>
          </div>
        </PageLayout>
      </div>
    );
  }

  // Show error state if no user
  if (!user) {
    return (
      <div className="dark-theme-override min-h-screen" style={{ 
        backgroundColor: '#0f172a',
        color: 'white'
      }}>
        <PageLayout
          title="Meu Perfil"
          subtitle="Erro ao carregar perfil"
          background="dark"
          className="dark-theme-override"
        >
          <PageSection>
            <Alert className="max-w-md border-slate-700/50 bg-slate-900/20" style={{ backgroundColor: 'rgba(15, 23, 42, 0.2)' }}>
              <AlertCircle className="h-4 w-4 text-red-400" />
              <AlertDescription className="text-slate-300">
                Não foi possível carregar as informações do usuário. Faça login novamente.
              </AlertDescription>
            </Alert>
          </PageSection>
        </PageLayout>
      </div>
    );
  }

  const profileCompleteness = getProfileCompleteness();
  const subtitle = studentData ? 
    `Perfil ${profileCompleteness}% completo` : 
    "Gerencie suas informações pessoais e preferências";

  return (
    <div className="dark-theme-override min-h-screen" style={{ 
      backgroundColor: '#0f172a',
      color: 'white',
      '--background': '240 10% 3.9%',
      '--foreground': '0 0% 98%',
      '--card': '240 10% 3.9%',
      '--card-foreground': '0 0% 98%',
      '--popover': '240 10% 3.9%',
      '--popover-foreground': '0 0% 98%',
      '--primary': '0 0% 98%',
      '--primary-foreground': '240 5.9% 10%',
      '--secondary': '240 3.7% 15.9%',
      '--secondary-foreground': '0 0% 98%',
      '--muted': '240 3.7% 15.9%',
      '--muted-foreground': '240 5% 64.9%',
      '--accent': '240 3.7% 15.9%',
      '--accent-foreground': '0 0% 98%',
      '--destructive': '0 62.8% 30.6%',
      '--destructive-foreground': '0 0% 98%',
      '--border': 'transparent',
      '--input': '240 3.7% 15.9%',
      '--ring': '240 4.9% 83.9%'
    } as React.CSSProperties}>
      <PageLayout
        title="Meu Perfil"
        subtitle={subtitle}
        headerContent={headerContent}
        background="dark"
        className="dark-theme-override"
        contentClassName="!bg-slate-900"
      >
      <div className="space-y-6">
        {/* Data Status Alerts */}
        {error && (
          <PageSection>
            <Alert variant="destructive" className="border-red-700/50 bg-red-900/20" style={{ backgroundColor: 'rgba(127, 29, 29, 0.2)' }}>
              <AlertCircle className="h-4 w-4 text-red-400" />
              <AlertDescription className="text-slate-300">
                <strong className="text-red-300">Erro ao carregar dados:</strong> Não foi possível carregar as informações do perfil.
                <Button 
                  onClick={handleRefresh} 
                  variant="outline" 
                  size="sm" 
                  className="ml-2 border-red-600 text-red-300 hover:bg-red-700/50"
                  disabled={isRefreshing}
                >
                  {isRefreshing ? 'Atualizando...' : 'Tentar Novamente'}
                </Button>
              </AlertDescription>
            </Alert>
          </PageSection>
        )}

        {!studentData && !error && user && (
          <PageSection>
            <Alert variant="destructive" className="border-red-700/50 bg-red-900/20" style={{ backgroundColor: 'rgba(127, 29, 29, 0.2)' }}>
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
          </PageSection>
        )}

        {studentData && !studentData.name && (
          <PageSection>
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Algumas informações do seu perfil estão incompletas. Entre em contato com sua empresa para atualizar seus dados.
              </AlertDescription>
            </Alert>
          </PageSection>
        )}

        {/* Profile Overview */}
        <PageSection>
          <Card className="border-slate-700/50 bg-slate-900/20 shadow-lg" style={{ backgroundColor: 'rgba(15, 23, 42, 0.2)' }}>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6">
                <div className="relative">
                  <Avatar className="h-24 w-24 border-4 border-slate-600">
                    <AvatarImage src="/api/placeholder/96/96" />
                    <AvatarFallback className="text-lg bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                      {getUserInitials()}
                    </AvatarFallback>
                  </Avatar>
                  {isEditing && (
                    <Button
                      size="sm"
                      className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full ai-gradient text-white"
                    >
                      <Camera className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                
                <div className="flex-1 text-center md:text-left">
                  <h2 className="text-2xl font-bold text-white">
                    {studentData?.name || user.email || 'Usuário'}
                  </h2>
                  <p className="text-slate-300">{studentData?.email || user.email}</p>
                  {studentData?.companies && (
                    <p className="text-sm text-blue-400 mt-1">
                      {studentData.companies.name}
                    </p>
                  )}
                  {studentData?.position && (
                    <p className="text-sm text-slate-400 mt-1">
                      {studentData.position}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-2 mt-3 justify-center md:justify-start">
                    <Badge variant="secondary" className="bg-slate-700/50 text-slate-300">Colaborador</Badge>
                    {studentData?.is_active !== undefined && (
                      studentData.is_active ? (
                        <Badge variant="outline" className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30">Ativo</Badge>
                      ) : (
                        <Badge variant="outline" className="bg-red-500/20 text-red-300 border-red-500/30">Inativo</Badge>
                      )
                    )}
                    {profileCompleteness < 100 && (
                      <Badge variant="outline" className="bg-orange-500/20 text-orange-300 border-orange-500/30">
                        Perfil Incompleto
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </PageSection>

        {/* Profile Tabs */}
        <PageSection transparent>
          <Tabs defaultValue="personal" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 bg-slate-800/50 border border-slate-700/50" style={{ backgroundColor: 'rgba(30, 41, 59, 0.5)' }}>
              <TabsTrigger 
                value="personal" 
                className="data-[state=active]:bg-slate-700/50 data-[state=active]:text-white text-slate-300"
                style={{ 
                  '--background': 'rgba(51, 65, 85, 0.5)',
                  '--foreground': 'white'
                } as React.CSSProperties}
              >
                Pessoal
              </TabsTrigger>
              <TabsTrigger 
                value="activity"
                className="data-[state=active]:bg-slate-700/50 data-[state=active]:text-white text-slate-300"
                style={{ 
                  '--background': 'rgba(51, 65, 85, 0.5)',
                  '--foreground': 'white'
                } as React.CSSProperties}
              >
                Atividade
              </TabsTrigger>
              <TabsTrigger 
                value="settings"
                className="data-[state=active]:bg-slate-700/50 data-[state=active]:text-white text-slate-300"
                style={{ 
                  '--background': 'rgba(51, 65, 85, 0.5)',
                  '--foreground': 'white'
                } as React.CSSProperties}
              >
                Configurações
              </TabsTrigger>
            </TabsList>

            <TabsContent value="personal" className="space-y-6">
              <Card className="border-slate-700/50 bg-slate-900/20 shadow-lg" style={{ backgroundColor: 'rgba(15, 23, 42, 0.2)' }}>
                <CardHeader className="bg-slate-900/20 text-white border-b border-slate-700/50" style={{ backgroundColor: 'rgba(15, 23, 42, 0.2)' }}>
                  <CardTitle className="flex items-center text-white">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center mr-2">
                      <User className="h-3 w-3 text-white" />
                    </div>
                    Informações Pessoais
                  </CardTitle>
                  <CardDescription className="text-slate-300">
                    Suas informações pessoais e de contato
                    {!studentData && (
                      <span className="text-red-400 ml-2">
                        (Dados não carregados - tente atualizar)
                      </span>
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 bg-slate-900/20" style={{ backgroundColor: 'rgba(15, 23, 42, 0.2)' }}>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-slate-300">Nome Completo</Label>
                      <Input 
                        id="name" 
                        value={studentData?.name || ''}
                        disabled={!isEditing}
                        readOnly
                        placeholder={!studentData ? "Dados não carregados" : "Nome não informado"}
                        className="bg-slate-800/50 border-slate-600 text-white placeholder-slate-400"
                        style={{ backgroundColor: 'rgba(30, 41, 59, 0.5)' }}
                      />
                      {!studentData?.name && studentData && (
                        <p className="text-sm text-orange-400">Nome não informado no sistema</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-slate-300">Email</Label>
                      <Input 
                        id="email" 
                        type="email" 
                        value={studentData?.email || user.email || ''}
                        disabled={!isEditing}
                        readOnly
                        className="bg-slate-800/50 border-slate-600 text-white placeholder-slate-400"
                        style={{ backgroundColor: 'rgba(30, 41, 59, 0.5)' }}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-slate-300">Telefone</Label>
                      <Input 
                        id="phone" 
                        type="tel" 
                        value={studentData?.phone || ''}
                        disabled={!isEditing}
                        readOnly
                        placeholder={!studentData ? "Dados não carregados" : "Telefone não informado"}
                        className="bg-slate-800/50 border-slate-600 text-white placeholder-slate-400"
                        style={{ backgroundColor: 'rgba(30, 41, 59, 0.5)' }}
                      />
                      {!studentData?.phone && studentData && (
                        <p className="text-sm text-slate-400">Telefone não informado</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="position" className="text-slate-300">Cargo</Label>
                      <Input 
                        id="position" 
                        value={studentData?.position || ''}
                        disabled={!isEditing}
                        readOnly
                        placeholder={!studentData ? "Dados não carregados" : "Cargo não informado"}
                        className="bg-slate-800/50 border-slate-600 text-white placeholder-slate-400"
                        style={{ backgroundColor: 'rgba(30, 41, 59, 0.5)' }}
                      />
                      {!studentData?.position && studentData && (
                        <p className="text-sm text-slate-400">Cargo não informado</p>
                      )}
                    </div>
                  </div>
                  {studentData?.companies && (
                    <div className="space-y-2">
                      <Label htmlFor="company" className="text-slate-300">Empresa</Label>
                      <Input 
                        id="company" 
                        value={studentData.companies.name}
                        disabled
                        readOnly
                        className="bg-slate-800/50 border-slate-600 text-white placeholder-slate-400"
                        style={{ backgroundColor: 'rgba(30, 41, 59, 0.5)' }}
                      />
                    </div>
                  )}
                  
                  {/* Data Status Summary */}
                  <div className="mt-6 p-4 bg-slate-800/40 rounded-lg border border-slate-700/50" style={{ backgroundColor: 'rgba(30, 41, 59, 0.4)' }}>
                    <h4 className="font-medium mb-2 text-white">Status dos Dados</h4>
                    <div className="grid md:grid-cols-2 gap-2 text-sm">
                      <div className="flex items-center space-x-2">
                        {studentData?.name ? (
                          <CheckCircle className="h-4 w-4 text-emerald-400" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-400" />
                        )}
                        <span className="text-slate-300">Nome: {studentData?.name ? 'Informado' : 'Não informado'}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        {studentData?.position ? (
                          <CheckCircle className="h-4 w-4 text-emerald-400" />  
                        ) : (
                          <XCircle className="h-4 w-4 text-orange-400" />
                        )}
                        <span className="text-slate-300">Cargo: {studentData?.position ? 'Informado' : 'Não informado'}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        {studentData?.phone ? (
                          <CheckCircle className="h-4 w-4 text-emerald-400" />
                        ) : (
                          <XCircle className="h-4 w-4 text-orange-400" />
                        )}
                        <span className="text-slate-300">Telefone: {studentData?.phone ? 'Informado' : 'Não informado'}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        {studentData?.companies ? (
                          <CheckCircle className="h-4 w-4 text-emerald-400" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-400" />
                        )}
                        <span className="text-slate-300">Empresa: {studentData?.companies ? 'Vinculado' : 'Não vinculado'}</span>
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
        </PageSection>
      </div>
      </PageLayout>
    </div>
  );
};

export default StudentProfile;
