import { PageLayout } from "@/components/PageLayout";
import { PageSection } from "@/components/PageSection";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import {
  User,
  Settings,
  Bell,
  Shield,
  Camera,
  Edit,
  Save,
  BookOpen
} from "lucide-react";
import { useState } from "react";
import { useAuth } from '@/hooks/auth/useAuth';
import { useCourses } from '@/hooks/useCourses';

const ProducerProfile = () => {
  const { user, userRole } = useAuth();
  const { data: courses = [] } = useCourses();
  const [isEditing, setIsEditing] = useState(false);

  const getUserInitials = () => {
    return user?.email?.charAt(0).toUpperCase() || 'P';
  };

  const getDisplayName = () => {
    if (user?.email) {
      const emailPrefix = user.email.split('@')[0];
      return emailPrefix.charAt(0).toUpperCase() + emailPrefix.slice(1);
    }
    return 'Produtor';
  };

  const publishedCourses = courses.filter(course => course.is_published);
  const totalCourses = courses.length;

  // Header content com botão de editar/salvar
  const headerContent = (
    <Button 
      onClick={() => setIsEditing(!isEditing)}
      variant={isEditing ? "default" : "outline"}
      className={isEditing 
        ? "!bg-blue-600 hover:!bg-blue-700 !text-white" 
        : "!bg-gray-700 !border-gray-600 !text-gray-300 hover:!bg-gray-600 hover:!text-white"
      }
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
  );

  return (
    <PageLayout
      title="Meu Perfil"
      subtitle="Gerencie suas informações e configurações de produtor"
      headerContent={headerContent}
      background="dark"
      className="dark-theme-override"
    >
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Profile Overview */}
        <Card className="relative overflow-hidden !bg-gradient-to-r !from-gray-800 !to-gray-900 !border-gray-700">
          <div className="absolute inset-0 !bg-gradient-to-r !from-blue-500/10 !to-purple-500/10" />
          <CardContent className="relative p-6">
            <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6">
              <div className="relative">
                <Avatar className="h-24 w-24 !border-4 !border-gray-600">
                  <AvatarImage src="/api/placeholder/96/96" />
                  <AvatarFallback className="text-lg !bg-gradient-to-r !from-blue-600 !to-purple-600 !text-white">
                    {getUserInitials()}
                  </AvatarFallback>
                </Avatar>
                {isEditing && (
                  <Button
                    size="sm"
                    className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full !bg-blue-600 hover:!bg-blue-700 !text-white !border-2 !border-gray-800"
                  >
                    <Camera className="h-4 w-4" />
                  </Button>
                )}
              </div>
              
              <div className="flex-1 text-center md:text-left">
                <h2 className="text-2xl font-bold !text-white">
                  {getDisplayName()}
                </h2>
                <p className="!text-gray-300">{user?.email || 'email@exemplo.com'}</p>
                <div className="flex flex-wrap gap-2 mt-3 justify-center md:justify-start">
                  <Badge className="!bg-gradient-to-r !from-blue-600 !to-purple-600 !text-white !border-0">Produtor</Badge>
                  <Badge variant="outline" className="!bg-gray-700 !border-gray-600 !text-gray-300">
                    Membro desde {user?.created_at ? new Date(user.created_at).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }) : 'Data não disponível'}
                  </Badge>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                  <div className="text-center p-3 !bg-gray-700/50 rounded-lg !border !border-gray-600">
                    <div className="text-2xl font-bold !text-white">{totalCourses}</div>
                    <div className="text-sm !text-gray-300">Cursos Criados</div>
                  </div>
                  <div className="text-center p-3 !bg-gray-700/50 rounded-lg !border !border-gray-600">
                    <div className="text-2xl font-bold !text-white">{publishedCourses.length}</div>
                    <div className="text-sm !text-gray-300">Publicados</div>
                  </div>
                  <div className="text-center p-3 !bg-gray-700/50 rounded-lg !border !border-gray-600">
                    <div className="text-2xl font-bold !text-white">0</div>
                    <div className="text-sm !text-gray-300">Empresas</div>
                  </div>
                  <div className="text-center p-3 !bg-gray-700/50 rounded-lg !border !border-gray-600">
                    <div className="text-2xl font-bold !text-white">0</div>
                    <div className="text-sm !text-gray-300">Estudantes</div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Profile Tabs */}
        <Tabs defaultValue="personal" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 !bg-gray-800 !border-gray-700">
            <TabsTrigger value="personal" className="!text-gray-300 data-[state=active]:!bg-gray-700 data-[state=active]:!text-white">Pessoal</TabsTrigger>
            <TabsTrigger value="activity" className="!text-gray-300 data-[state=active]:!bg-gray-700 data-[state=active]:!text-white">Atividade</TabsTrigger>
            <TabsTrigger value="settings" className="!text-gray-300 data-[state=active]:!bg-gray-700 data-[state=active]:!text-white">Configurações</TabsTrigger>
          </TabsList>

          <TabsContent value="personal" className="space-y-6">
            <Card className="!bg-gray-800 !border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center !text-white">
                  <User className="h-5 w-5 mr-2 !text-blue-400" />
                  Informações Pessoais
                </CardTitle>
                <CardDescription className="!text-gray-300">
                  Suas informações pessoais e de contato
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="!text-gray-300">Email</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      value={user?.email || ''}
                      disabled={!isEditing}
                      readOnly
                      className="!bg-gray-700 !border-gray-600 !text-white disabled:!text-gray-400"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role" className="!text-gray-300">Tipo de Conta</Label>
                    <Input 
                      id="role" 
                      value="Produtor de Conteúdo"
                      disabled
                      readOnly
                      className="!bg-gray-700 !border-gray-600 !text-gray-400"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bio" className="!text-gray-300">Biografia</Label>
                  <Textarea 
                    id="bio" 
                    placeholder="Conte um pouco sobre sua experiência como produtor de conteúdo..."
                    disabled={!isEditing}
                    className="!bg-gray-700 !border-gray-600 !text-white placeholder:!text-gray-400 disabled:!text-gray-400"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

            <TabsContent value="activity" className="space-y-6">
              <Card className="!bg-gray-800 !border-gray-700">
                <CardHeader>
                  <CardTitle className="!text-white">Atividade Recente</CardTitle>
                  <CardDescription className="!text-gray-300">
                    Suas últimas atividades como produtor
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 !bg-gray-700 rounded-lg">
                      <span className="text-sm !text-gray-300">Total de Cursos</span>
                      <span className="font-semibold !text-white">{totalCourses}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 !bg-gray-700 rounded-lg">
                      <span className="text-sm !text-gray-300">Cursos Publicados</span>
                      <span className="font-semibold !text-white">{publishedCourses.length}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 !bg-gray-700 rounded-lg">
                      <span className="text-sm !text-gray-300">Empresas Parceiras</span>
                      <span className="font-semibold !text-white">0</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="settings" className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <Card className="!bg-gray-800 !border-gray-700">
                  <CardHeader>
                    <CardTitle className="flex items-center !text-white">
                      <Bell className="h-5 w-5 mr-2 !text-blue-400" />
                      Notificações
                    </CardTitle>
                    <CardDescription className="!text-gray-300">
                      Configure suas preferências de notificação
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-3 !bg-gray-700 rounded-lg">
                      <div>
                        <p className="font-medium !text-white">Novos usuários</p>
                        <p className="text-sm !text-gray-300">Notificar sobre novos estudantes</p>
                      </div>
                      <Switch />
                    </div>
                    <div className="flex items-center justify-between p-3 !bg-gray-700 rounded-lg">
                      <div>
                        <p className="font-medium !text-white">Análises</p>
                        <p className="text-sm !text-gray-300">Relatórios de performance dos cursos</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between p-3 !bg-gray-700 rounded-lg">
                      <div>
                        <p className="font-medium !text-white">Atualizações</p>
                        <p className="text-sm !text-gray-300">Novidades da plataforma</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </CardContent>
                </Card>

                <Card className="!bg-gray-800 !border-gray-700">
                  <CardHeader>
                    <CardTitle className="flex items-center !text-white">
                      <Shield className="h-5 w-5 mr-2 !text-green-400" />
                      Privacidade
                    </CardTitle>
                    <CardDescription className="!text-gray-300">
                      Gerencie suas configurações de privacidade
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-3 !bg-gray-700 rounded-lg">
                      <div>
                        <p className="font-medium !text-white">Perfil público</p>
                        <p className="text-sm !text-gray-300">Permitir que empresas vejam seu perfil</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between p-3 !bg-gray-700 rounded-lg">
                      <div>
                        <p className="font-medium !text-white">Estatísticas visíveis</p>
                        <p className="text-sm !text-gray-300">Mostrar dados de cursos e estudantes</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </PageLayout>
    );
  };

  export default ProducerProfile;
