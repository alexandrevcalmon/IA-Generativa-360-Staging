
import { AppSidebar } from "@/components/AppSidebar";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Brain,
  Target,
  CheckCircle,
  Clock,
  Lock,
  Play,
  Award,
  BookOpen,
  Users,
  ArrowRight,
  Lightbulb
} from "lucide-react";

const Learning = () => {
  const learningPaths = [
    {
      id: 1,
      title: "IA para Desenvolvedores",
      description: "Trilha completa para desenvolvedores que querem dominar IA Generativa",
      level: "Intermediário",
      totalModules: 12,
      completedModules: 7,
      estimatedTime: "40 horas",
      category: "Desenvolvimento",
      isActive: true,
      nextModule: "APIs e Integrações",
      progress: 58
    },
    {
      id: 2,
      title: "Fundamentos de IA Generativa",
      description: "Base sólida em conceitos e aplicações de IA",
      level: "Iniciante",
      totalModules: 8,
      completedModules: 0,
      estimatedTime: "24 horas",
      category: "Fundamentos",
      isActive: false,
      nextModule: "Introdução à IA",
      progress: 0
    },
    {
      id: 3,
      title: "Saúde Mental Digital",
      description: "Bem-estar e equilíbrio no mundo tecnológico",
      level: "Todos os níveis",
      totalModules: 6,
      completedModules: 0,
      estimatedTime: "18 horas",
      category: "Bem-estar",
      isActive: false,
      nextModule: "Mindfulness Digital",
      progress: 0
    }
  ];

  const currentPath = learningPaths.find(path => path.isActive);

  const pathModules = [
    {
      id: 1,
      title: "Introdução à IA Generativa",
      description: "Conceitos fundamentais e panorama atual",
      duration: "45 min",
      status: "completed",
      type: "video",
      order: 1
    },
    {
      id: 2,
      title: "Modelos de Linguagem (LLMs)",
      description: "Como funcionam GPT, BERT e outros modelos",
      duration: "1h 30min",
      status: "completed",
      type: "video",
      order: 2
    },
    {
      id: 3,
      title: "Prompt Engineering Básico",
      description: "Técnicas essenciais de criação de prompts",
      duration: "2h 15min",
      status: "completed",
      type: "interactive",
      order: 3
    },
    {
      id: 4,
      title: "Ferramentas e Plataformas",
      description: "OpenAI, Anthropic, Google AI e outras",
      duration: "1h 45min",
      status: "completed",
      type: "hands-on",
      order: 4
    },
    {
      id: 5,
      title: "Ética e Responsabilidade",
      description: "Uso responsável de IA e considerações éticas",
      duration: "1h 15min",
      status: "completed",
      type: "discussion",
      order: 5
    },
    {
      id: 6,
      title: "Casos de Uso Práticos",
      description: "Aplicações reais em diferentes indústrias",
      duration: "2h 30min",
      status: "completed",
      type: "case-study",
      order: 6
    },
    {
      id: 7,
      title: "Prompt Engineering Avançado",
      description: "Técnicas sofisticadas e otimização",
      duration: "3h 0min",
      status: "completed",
      type: "interactive",
      order: 7
    },
    {
      id: 8,
      title: "APIs e Integrações",
      description: "Integrando IA em aplicações",
      duration: "2h 45min",
      status: "current",
      type: "hands-on",
      order: 8
    },
    {
      id: 9,
      title: "Fine-tuning e Customização",
      description: "Personalizando modelos para suas necessidades",
      duration: "4h 15min",
      status: "locked",
      type: "advanced",
      order: 9
    },
    {
      id: 10,
      title: "RAG (Retrieval Augmented Generation)",
      description: "Combinando IA com bases de conhecimento",
      duration: "3h 30min",
      status: "locked",
      type: "advanced",
      order: 10
    },
    {
      id: 11,
      title: "Projeto Prático",
      description: "Desenvolvendo uma aplicação completa",
      duration: "8h 0min",
      status: "locked",
      type: "project",
      order: 11
    },
    {
      id: 12,
      title: "Avaliação Final",
      description: "Teste final e certificação",
      duration: "2h 0min",
      status: "locked",
      type: "assessment",
      order: 12
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'current':
        return <Play className="h-5 w-5 text-blue-500" />;
      case 'locked':
        return <Lock className="h-5 w-5 text-gray-400" />;
      default:
        return <Clock className="h-5 w-5 text-gray-400" />;
    }
  };

  const getTypeColor = (type: string) => {
    const colors = {
      video: 'bg-blue-100 text-blue-700',
      interactive: 'bg-purple-100 text-purple-700',
      'hands-on': 'bg-green-100 text-green-700',
      discussion: 'bg-orange-100 text-orange-700',
      'case-study': 'bg-indigo-100 text-indigo-700',
      advanced: 'bg-red-100 text-red-700',
      project: 'bg-yellow-100 text-yellow-700',
      assessment: 'bg-gray-100 text-gray-700'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-700';
  };

  return (
    <>
      <AppSidebar />
      <main className="flex-1 overflow-hidden">
        <div className="flex flex-col h-full">
          {/* Header */}
          <header className="border-b bg-white px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <SidebarTrigger />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Trilha de Aprendizagem</h1>
                  <p className="text-gray-600">Sua jornada personalizada de conhecimento</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Badge className="ai-gradient text-white border-0">
                  <Target className="h-4 w-4 mr-1" />
                  58% Concluído
                </Badge>
                <Button variant="outline">
                  <Lightbulb className="h-4 w-4 mr-2" />
                  Recomendações IA
                </Button>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <div className="flex-1 overflow-auto p-6 bg-gray-50">
            <div className="max-w-6xl mx-auto space-y-6">
              {/* Current Path Overview */}
              {currentPath && (
                <Card className="border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-purple-50">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 ai-gradient rounded-lg flex items-center justify-center">
                          <Brain className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <CardTitle className="text-xl">{currentPath.title}</CardTitle>
                          <CardDescription className="text-base">
                            {currentPath.description}
                          </CardDescription>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-sm">
                        {currentPath.level}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-3 gap-6">
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">Progresso Geral</span>
                          <span className="text-sm text-gray-500">
                            {currentPath.completedModules} de {currentPath.totalModules} módulos
                          </span>
                        </div>
                        <Progress value={currentPath.progress} className="h-3" />
                        <div className="flex items-center text-sm text-gray-600">
                          <Clock className="h-4 w-4 mr-1" />
                          <span>Tempo estimado: {currentPath.estimatedTime}</span>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <h4 className="font-medium">Próximo Módulo</h4>
                        <div className="p-3 bg-white rounded-lg border">
                          <p className="font-medium text-sm">{currentPath.nextModule}</p>
                          <p className="text-xs text-gray-600 mt-1">
                            Continue sua jornada de aprendizagem
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex flex-col justify-center">
                        <Button className="ai-gradient text-white mb-2">
                          <Play className="h-4 w-4 mr-2" />
                          Continuar Aprendendo
                        </Button>
                        <Button variant="outline" size="sm">
                          Ver Todas as Trilhas
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Learning Path Modules */}
              <div className="grid lg:grid-cols-3 gap-6">
                {/* Main Content - Modules List */}
                <div className="lg:col-span-2 space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <BookOpen className="h-5 w-5 mr-2" />
                        Módulos da Trilha
                      </CardTitle>
                      <CardDescription>
                        Progresso detalhado dos módulos da sua trilha atual
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {pathModules.map((module, index) => (
                        <div
                          key={module.id}
                          className={`flex items-center space-x-4 p-4 rounded-lg border transition-all ${
                            module.status === 'current'
                              ? 'border-blue-200 bg-blue-50'
                              : module.status === 'completed'
                              ? 'border-green-200 bg-green-50'
                              : 'border-gray-200 bg-white'
                          } ${module.status !== 'locked' ? 'hover:shadow-md cursor-pointer' : 'opacity-60'}`}
                        >
                          <div className="flex-shrink-0">
                            {getStatusIcon(module.status)}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className={`font-medium ${
                                module.status === 'locked' ? 'text-gray-400' : 'text-gray-900'
                              }`}>
                                {module.order}. {module.title}
                              </h4>
                              <Badge className={`text-xs ${getTypeColor(module.type)}`}>
                                {module.type}
                              </Badge>
                            </div>
                            <p className={`text-sm ${
                              module.status === 'locked' ? 'text-gray-400' : 'text-gray-600'
                            }`}>
                              {module.description}
                            </p>
                            <div className="flex items-center mt-2 text-xs text-gray-500">
                              <Clock className="h-3 w-3 mr-1" />
                              {module.duration}
                            </div>
                          </div>
                          
                          {module.status === 'current' && (
                            <Button size="sm" className="ai-gradient text-white">
                              Continuar
                            </Button>
                          )}
                          
                          {module.status === 'completed' && (
                            <Button size="sm" variant="outline">
                              Revisar
                            </Button>
                          )}
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </div>

                {/* Sidebar - Additional Info */}
                <div className="space-y-6">
                  {/* Available Learning Paths */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Outras Trilhas</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {learningPaths.filter(path => !path.isActive).map(path => (
                        <div key={path.id} className="p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                          <h4 className="font-medium text-sm mb-1">{path.title}</h4>
                          <p className="text-xs text-gray-600 mb-2">{path.description}</p>
                          <div className="flex items-center justify-between">
                            <Badge variant="outline" className="text-xs">
                              {path.level}
                            </Badge>
                            <Button size="sm" variant="ghost" className="text-xs h-6 px-2">
                              Iniciar
                              <ArrowRight className="h-3 w-3 ml-1" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  {/* Learning Stats */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Suas Estatísticas</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Módulos Concluídos</span>
                        <span className="font-semibold">7/12</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Tempo Investido</span>
                        <span className="font-semibold">23h 15min</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Streak Atual</span>
                        <span className="font-semibold">12 dias 🔥</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">XP Ganho</span>
                        <span className="font-semibold">+2,840 XP</span>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Rewards & Certificates */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center text-lg">
                        <Award className="h-5 w-5 mr-2 text-yellow-500" />
                        Certificações
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center py-4">
                        <div className="w-16 h-16 ai-gradient rounded-full flex items-center justify-center mx-auto mb-3">
                          <Award className="h-8 w-8 text-white" />
                        </div>
                        <p className="text-sm font-medium mb-1">
                          Certificado IA Developer
                        </p>
                        <p className="text-xs text-gray-600 mb-3">
                          Complete a trilha para ganhar
                        </p>
                        <Progress value={58} className="h-2 mb-2" />
                        <p className="text-xs text-gray-500">
                          5 módulos restantes
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default Learning;
