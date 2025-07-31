
import { AppSidebar } from "@/components/AppSidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/useAuth";
import { useCourses } from "@/hooks/useCourses";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Award,
  Settings,
  Bell,
  Shield,
  Download,
  Upload,
  Camera,
  Zap,
  Trophy,
  Target,
  BookOpen,
  Building
} from "lucide-react";

const Profile = () => {
  const { user, userRole, companyUserData } = useAuth();
  const { data: courses = [] } = useCourses();

  // Calculate real statistics from actual data
  const publishedCourses = courses.filter(course => course.is_published);
  const totalCourses = courses.length;

  // Real user stats based on role
  const userStats = {
    totalCourses: userRole === 'producer' ? totalCourses : 0,
    publishedCourses: userRole === 'producer' ? publishedCourses.length : 0,
    completedCourses: userRole === 'student' ? 0 : undefined, // Will be implemented when we have enrollment data
    joinDate: user?.created_at ? new Date(user.created_at).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }) : 'Data não disponível'
  };

  // Get user initials for avatar
  const getUserInitials = () => {
    if (companyUserData?.name) {
      return companyUserData.name.split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase();
    }
    if (user?.email) {
      const emailPrefix = user.email.split('@')[0];
      return emailPrefix.slice(0, 2).toUpperCase();
    }
    return 'US';
  };

  // Get display name from company data or email
  const getDisplayName = () => {
    if (companyUserData?.name) {
      return companyUserData.name;
    }
    if (user?.email) {
      const emailPrefix = user.email.split('@')[0];
      return emailPrefix.charAt(0).toUpperCase() + emailPrefix.slice(1);
    }
    return 'Usuário';
  };

  // Role display mapping
  const getRoleDisplay = () => {
    switch (userRole) {
      case 'producer':
        return 'Produtor de Conteúdo';
      case 'company':
        return 'Empresa';
      case 'student':
        return 'Colaborador';
      default:
        return 'Usuário';
    }
  };

  // Get company name from company data
  const getCompanyName = () => {
    console.log('🏢 Getting company name from data:', {
      hasCompanyUserData: !!companyUserData,
      hasCompaniesProperty: !!companyUserData?.companies,
      companyName: companyUserData?.companies?.name,
      fullCompanyData: companyUserData?.companies
    });
    
    if (companyUserData?.companies?.name) {
      return companyUserData.companies.name;
    }
    return 'Não vinculado';
  };

  const notificationSettings = [
    {
      title: "Novos cursos disponíveis",
      description: "Receba notificações sobre novos conteúdos",
      enabled: true
    },
    {
      title: "Atualizações da plataforma",
      description: "Notificações sobre melhorias e novidades",
      enabled: true
    },
    {
      title: "Relatórios de atividade",
      description: userRole === 'producer' ? "Relatórios sobre seus cursos" : "Relatórios de progresso nos estudos",
      enabled: false
    },
    {
      title: "Mensagens do sistema",
      description: "Comunicações importantes da plataforma",
      enabled: true
    }
  ];

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
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          <AppSidebar />
          <main className="flex-1 overflow-hidden">
            <div className="flex flex-col h-full">
              {/* Header */}
              <header className="border-b border-slate-700/50 bg-slate-900/20 px-6 py-4" style={{ backgroundColor: 'rgba(15, 23, 42, 0.2)' }}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <SidebarTrigger />
                    <div>
                      <h1 className="text-2xl font-bold text-white">Meu Perfil</h1>
                      <p className="text-slate-300">Gerencie suas informações e preferências</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Button variant="outline" size="sm" disabled className="border-slate-600 text-slate-300 hover:bg-slate-700/50">
                      <Download className="h-4 w-4 mr-2" />
                      Exportar Dados
                    </Button>
                    <Button className="ai-gradient text-white" size="sm" disabled>
                      <Settings className="h-4 w-4 mr-2" />
                      Configurações
                    </Button>
                  </div>
                </div>
              </header>

              {/* Main Content */}
              <div className="flex-1 overflow-auto p-6 bg-slate-900" style={{ backgroundColor: '#0f172a' }}>
              <div className="max-w-6xl mx-auto space-y-6">
                {/* Profile Header Card */}
                <Card className="relative overflow-hidden border-slate-700/50 bg-slate-900/20 shadow-lg" style={{ backgroundColor: 'rgba(15, 23, 42, 0.2)' }}>
                  <div className="absolute inset-0 ai-gradient opacity-10" />
                  <CardContent className="relative p-8">
                    <div className="flex flex-col md:flex-row items-start md:items-center space-y-6 md:space-y-0 md:space-x-8">
                      {/* Avatar Section */}
                      <div className="relative">
                        <Avatar className="w-32 h-32 border-4 border-slate-600 shadow-lg">
                          <AvatarImage src="" />
                          <AvatarFallback className="text-2xl font-bold ai-gradient text-white">
                            {getUserInitials()}
                          </AvatarFallback>
                        </Avatar>
                        <Button 
                          size="sm" 
                          className="absolute -bottom-2 -right-2 rounded-full w-10 h-10 p-0 ai-gradient text-white"
                          disabled
                        >
                          <Camera className="h-4 w-4" />
                        </Button>
                      </div>

                      {/* User Info */}
                      <div className="flex-1">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4">
                          <div>
                            <h2 className="text-3xl font-bold text-white mb-2">
                              {getDisplayName()}
                            </h2>
                            <p className="text-lg text-slate-300 mb-3">
                              {getRoleDisplay()}
                            </p>
                            <div className="flex flex-wrap gap-2">
                              <Badge className="ai-gradient text-white border-0">
                                {getRoleDisplay()}
                              </Badge>
                              <Badge variant="outline" className="border-slate-600 text-slate-300">
                                Membro desde {userStats.joinDate}
                              </Badge>
                              {companyUserData?.companies && (
                                <Badge variant="secondary" className="flex items-center gap-1 bg-slate-700/50 text-slate-300">
                                  <Building className="h-3 w-3" />
                                  {companyUserData.companies.name}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Quick Stats */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          {userRole === 'producer' ? (
                            <>
                              <div className="text-center p-3 bg-slate-800/40 rounded-lg border border-slate-700/50" style={{ backgroundColor: 'rgba(30, 41, 59, 0.4)' }}>
                                <div className="text-2xl font-bold text-white">
                                  {userStats.totalCourses}
                                </div>
                                <div className="text-sm text-slate-300">Cursos Criados</div>
                              </div>
                              <div className="text-center p-3 bg-slate-800/40 rounded-lg border border-slate-700/50" style={{ backgroundColor: 'rgba(30, 41, 59, 0.4)' }}>
                                <div className="text-2xl font-bold text-white">
                                  {userStats.publishedCourses}
                                </div>
                                <div className="text-sm text-slate-300">Publicados</div>
                              </div>
                              <div className="text-center p-3 bg-slate-800/40 rounded-lg border border-slate-700/50" style={{ backgroundColor: 'rgba(30, 41, 59, 0.4)' }}>
                                <div className="text-2xl font-bold text-white">
                                  0
                                </div>
                                <div className="text-sm text-slate-300">Empresas</div>
                              </div>
                              <div className="text-center p-3 bg-slate-800/40 rounded-lg border border-slate-700/50" style={{ backgroundColor: 'rgba(30, 41, 59, 0.4)' }}>
                                <div className="text-2xl font-bold text-white">
                                  0
                                </div>
                                <div className="text-sm text-slate-300">Estudantes</div>
                              </div>
                            </>
                          ) : (
                            <>
                              <div className="text-center p-3 bg-slate-800/40 rounded-lg border border-slate-700/50" style={{ backgroundColor: 'rgba(30, 41, 59, 0.4)' }}>
                                <div className="text-2xl font-bold text-white">
                                  0
                                </div>
                                <div className="text-sm text-slate-300">Cursos</div>
                              </div>
                              <div className="text-center p-3 bg-slate-800/40 rounded-lg border border-slate-700/50" style={{ backgroundColor: 'rgba(30, 41, 59, 0.4)' }}>
                                <div className="text-2xl font-bold text-white">
                                  0h
                                </div>
                                <div className="text-sm text-slate-300">Horas</div>
                              </div>
                              <div className="text-center p-3 bg-slate-800/40 rounded-lg border border-slate-700/50" style={{ backgroundColor: 'rgba(30, 41, 59, 0.4)' }}>
                                <div className="text-2xl font-bold text-white">
                                  0
                                </div>
                                <div className="text-sm text-slate-300">Certificados</div>
                              </div>
                              <div className="text-center p-3 bg-slate-800/40 rounded-lg border border-slate-700/50" style={{ backgroundColor: 'rgba(30, 41, 59, 0.4)' }}>
                                <div className="text-2xl font-bold text-white">
                                  0
                                </div>
                                <div className="text-sm text-slate-300">Conquistas</div>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Profile Tabs */}
                <Tabs defaultValue="info" className="space-y-6">
                  <TabsList className="grid w-full grid-cols-3 bg-slate-800/50 border border-slate-700/50" style={{ backgroundColor: 'rgba(30, 41, 59, 0.5)' }}>
                    <TabsTrigger 
                      value="info" 
                      className="data-[state=active]:bg-slate-700/50 data-[state=active]:text-white text-slate-300"
                      style={{ 
                        '--background': 'rgba(51, 65, 85, 0.5)',
                        '--foreground': 'white'
                      } as React.CSSProperties}
                    >
                      Informações
                    </TabsTrigger>
                    <TabsTrigger 
                      value="notifications"
                      className="data-[state=active]:bg-slate-700/50 data-[state=active]:text-white text-slate-300"
                      style={{ 
                        '--background': 'rgba(51, 65, 85, 0.5)',
                        '--foreground': 'white'
                      } as React.CSSProperties}
                    >
                      Notificações
                    </TabsTrigger>
                    <TabsTrigger 
                      value="privacy"
                      className="data-[state=active]:bg-slate-700/50 data-[state=active]:text-white text-slate-300"
                      style={{ 
                        '--background': 'rgba(51, 65, 85, 0.5)',
                        '--foreground': 'white'
                      } as React.CSSProperties}
                    >
                      Privacidade
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="info" className="space-y-6">
                    <div className="grid lg:grid-cols-2 gap-6">
                      {/* Personal Information */}
                      <Card className="border-slate-700/50 bg-slate-900/20 shadow-lg" style={{ backgroundColor: 'rgba(15, 23, 42, 0.2)' }}>
                        <CardHeader className="bg-slate-900/20 text-white border-b border-slate-700/50" style={{ backgroundColor: 'rgba(15, 23, 42, 0.2)' }}>
                          <CardTitle className="flex items-center text-white">
                            <div className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center mr-2">
                              <User className="h-3 w-3 text-white" />
                            </div>
                            Informações Pessoais
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 bg-slate-900/20" style={{ backgroundColor: 'rgba(15, 23, 42, 0.2)' }}>
                          <div className="grid md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="name" className="text-slate-300">Nome Completo</Label>
                              <Input 
                                id="name" 
                                value={companyUserData?.name || ''}
                                disabled
                                readOnly
                                className="bg-slate-800/50 border-slate-600 text-white placeholder-slate-400"
                                style={{ backgroundColor: 'rgba(30, 41, 59, 0.5)' }}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="email" className="text-slate-300">Email</Label>
                              <div className="relative">
                                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <Input 
                                  id="email" 
                                  value={companyUserData?.email || user?.email || ''} 
                                  className="pl-10 bg-slate-800/50 border-slate-600 text-white placeholder-slate-400"
                                  style={{ backgroundColor: 'rgba(30, 41, 59, 0.5)' }}
                                  disabled
                                  readOnly
                                />
                              </div>
                            </div>
                          </div>

                          <div className="grid md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="phone" className="text-slate-300">Telefone</Label>
                              <div className="relative">
                                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <Input 
                                  id="phone" 
                                  value={companyUserData?.phone || ''}
                                  className="pl-10 bg-slate-800/50 border-slate-600 text-white placeholder-slate-400"
                                  style={{ backgroundColor: 'rgba(30, 41, 59, 0.5)' }}
                                  disabled
                                  readOnly
                                />
                              </div>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="position" className="text-slate-300">Cargo</Label>
                              <Input 
                                id="position" 
                                value={companyUserData?.position || ''}
                                className="bg-slate-800/50 border-slate-600 text-white placeholder-slate-400"
                                style={{ backgroundColor: 'rgba(30, 41, 59, 0.5)' }}
                                disabled
                                readOnly
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="company" className="text-slate-300">Empresa</Label>
                            <div className="relative">
                              <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                              <Input 
                                id="company" 
                                value={getCompanyName()}
                                className="pl-10 bg-slate-800/50 border-slate-600 text-white placeholder-slate-400"
                                style={{ backgroundColor: 'rgba(30, 41, 59, 0.5)' }}
                                disabled
                                readOnly
                              />
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="role" className="text-slate-300">Tipo de Conta</Label>
                            <Input 
                              id="role" 
                              value={getRoleDisplay()} 
                              className="bg-slate-800/50 border-slate-600 text-white placeholder-slate-400"
                              style={{ backgroundColor: 'rgba(30, 41, 59, 0.5)' }}
                              disabled
                              readOnly
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="joinDate" className="text-slate-300">Membro desde</Label>
                            <div className="relative">
                              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                              <Input 
                                id="joinDate" 
                                value={userStats.joinDate} 
                                className="pl-10 bg-slate-800/50 border-slate-600 text-white placeholder-slate-400"
                                style={{ backgroundColor: 'rgba(30, 41, 59, 0.5)' }}
                                disabled
                                readOnly
                              />
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="bio" className="text-slate-300">Biografia</Label>
                            <Textarea 
                              id="bio" 
                              placeholder="Conte um pouco sobre você..."
                              defaultValue=""
                              className="bg-slate-800/50 border-slate-600 text-white placeholder-slate-400"
                              style={{ backgroundColor: 'rgba(30, 41, 59, 0.5)' }}
                            />
                          </div>
                          
                          <Button className="ai-gradient text-white" disabled>
                            Salvar Alterações
                          </Button>
                        </CardContent>
                      </Card>

                      {/* Activity Summary */}
                      <Card className="border-slate-700/50 bg-slate-900/20 shadow-lg" style={{ backgroundColor: 'rgba(15, 23, 42, 0.2)' }}>
                        <CardHeader className="bg-slate-900/20 text-white border-b border-slate-700/50" style={{ backgroundColor: 'rgba(15, 23, 42, 0.2)' }}>
                          <CardTitle className="flex items-center text-white">
                            <div className="w-6 h-6 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 flex items-center justify-center mr-2">
                              <Activity className="h-3 w-3 text-white" />
                            </div>
                            Resumo de Atividade
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 bg-slate-900/20" style={{ backgroundColor: 'rgba(15, 23, 42, 0.2)' }}>
                          {userRole === 'producer' ? (
                            <>
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-slate-300">Cursos Criados</span>
                                <span className="font-semibold text-white">{userStats.totalCourses}</span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-slate-300">Cursos Publicados</span>
                                <span className="font-semibold text-white">{userStats.publishedCourses}</span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-slate-300">Empresas Parceiras</span>
                                <span className="font-semibold text-white">0</span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-slate-300">Estudantes Alcançados</span>
                                <span className="font-semibold text-white">0</span>
                              </div>
                            </>
                          ) : (
                            <>
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-slate-300">Cursos Matriculados</span>
                                <span className="font-semibold text-white">0</span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-slate-300">Cursos Concluídos</span>
                                <span className="font-semibold text-white">0</span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-slate-300">Horas de Estudo</span>
                                <span className="font-semibold text-white">0h</span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-slate-300">Certificados</span>
                                <span className="font-semibold text-white">0</span>
                              </div>

                              {/* Company Information for Students */}
                              {companyUserData?.companies && (
                                <>
                                  <Separator />
                                  <div className="pt-2">
                                    <h4 className="font-medium mb-3 flex items-center text-white">
                                      <Building className="h-4 w-4 mr-2 text-slate-300" />
                                      Informações da Empresa
                                    </h4>
                                    <div className="space-y-2">
                                      <div className="flex items-center justify-between">
                                        <span className="text-sm text-slate-300">Nome da Empresa</span>
                                        <span className="font-semibold text-white">{companyUserData.companies.name}</span>
                                      </div>
                                      {companyUserData.companies.official_name && (
                                        <div className="flex items-center justify-between">
                                          <span className="text-sm text-slate-300">Razão Social</span>
                                          <span className="font-semibold text-white">{companyUserData.companies.official_name}</span>
                                        </div>
                                      )}
                                      <div className="flex items-center justify-between">
                                        <span className="text-sm text-slate-300">Status na Empresa</span>
                                        <Badge variant={companyUserData.is_active ? "default" : "secondary"} className={companyUserData.is_active ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" : "bg-slate-700/50 text-slate-300"}>
                                          {companyUserData.is_active ? "Ativo" : "Inativo"}
                                        </Badge>
                                      </div>
                                    </div>
                                  </div>
                                </>
                              )}
                            </>
                          )}
                          
                          <div className="pt-4 mt-4 border-t border-slate-700/50">
                            <p className="text-sm text-slate-400 text-center">
                              {userRole === 'producer' 
                                ? 'Dados atualizados em tempo real conforme você cria conteúdo.'
                                : 'Seus dados de progresso aparecerão conforme você avança nos estudos.'
                              }
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>

                  <TabsContent value="notifications" className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center">
                          <Bell className="h-5 w-5 mr-2" />
                          Preferências de Notificação
                        </CardTitle>
                        <CardDescription>
                          Configure como você quer receber notificações
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-6">
                          {notificationSettings.map((setting, index) => (
                            <div key={index} className="flex items-center justify-between">
                              <div className="space-y-1">
                                <div className="font-medium">{setting.title}</div>
                                <div className="text-sm text-gray-600">
                                  {setting.description}
                                </div>
                              </div>
                              <Switch defaultChecked={setting.enabled} />
                            </div>
                          ))}
                          
                          <Separator />
                          
                          <div className="space-y-4">
                            <h4 className="font-medium">Canais de Notificação</h4>
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <span>Email</span>
                                <Switch defaultChecked />
                              </div>
                              <div className="flex items-center justify-between">
                                <span>Notificações no navegador</span>
                                <Switch />
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="privacy" className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center">
                          <Shield className="h-5 w-5 mr-2" />
                          Privacidade e Segurança
                        </CardTitle>
                        <CardDescription>
                          Gerencie seus dados e configurações de privacidade
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium">Perfil Público</div>
                              <div className="text-sm text-gray-600">
                                {userRole === 'producer' 
                                  ? 'Permitir que outros usuários vejam seu perfil de produtor'
                                  : 'Permitir que outros usuários vejam seu perfil'
                                }
                              </div>
                            </div>
                            <Switch defaultChecked={userRole === 'producer'} />
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium">Analytics de Uso</div>
                              <div className="text-sm text-gray-600">
                                Permitir coleta de dados para melhorar a experiência
                              </div>
                            </div>
                            <Switch defaultChecked />
                          </div>
                        </div>
                        
                        <Separator />
                        
                        <div className="space-y-4">
                          <h4 className="font-medium">Controle de Dados</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Button variant="outline" disabled>
                              <Download className="h-4 w-4 mr-2" />
                              Exportar Dados
                            </Button>
                            <Button variant="outline" disabled>
                              <Shield className="h-4 w-4 mr-2" />
                              Alterar Senha
                            </Button>
                          </div>
                          
                          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                            <h5 className="font-medium text-red-900 mb-2">
                              Zona de Perigo
                            </h5>
                            <p className="text-sm text-red-700 mb-3">
                              Estas ações são irreversíveis. Proceda com cuidado.
                            </p>
                            <Button variant="outline" size="sm" className="text-red-600 border-red-300" disabled>
                              Excluir Conta
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </div>
        </main>
      </div>
      </SidebarProvider>
    </div>
  );
};

export default Profile;
