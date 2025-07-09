
import { AppSidebar } from "@/components/AppSidebar";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  MessageCircle,
  Heart,
  Share2,
  MessageSquare,
  TrendingUp,
  Users,
  Calendar,
  Pin,
  ThumbsUp,
  Reply,
  BookOpen,
  Zap
} from "lucide-react";

const Community = () => {
  const forumPosts = [
    {
      id: 1,
      title: "Como otimizar prompts para ChatGPT em desenvolvimento?",
      content: "Estou trabalhando em um projeto que utiliza ChatGPT para gerar código automaticamente. Alguém tem dicas de como estruturar melhor os prompts para obter resultados mais precisos?",
      author: {
        name: "Carlos Silva",
        avatar: "/api/placeholder/40/40",
        role: "Desenvolvedor Senior",
        level: 15
      },
      timestamp: "2 horas atrás",
      category: "Prompt Engineering",
      likes: 12,
      replies: 8,
      isPinned: false,
      tags: ["ChatGPT", "Desenvolvimento", "Prompts"]
    },
    {
      id: 2,
      title: "Compartilhando: Template de prompt para documentação",
      content: "Criei um template que tem funcionado muito bem para gerar documentação técnica. Funciona com GPT-4 e Claude. Segue o template...",
      author: {
        name: "Ana Costa",
        avatar: "/api/placeholder/40/40",
        role: "Tech Lead",
        level: 22
      },
      timestamp: "5 horas atrás",
      category: "Templates",
      likes: 28,
      replies: 15,
      isPinned: true,
      tags: ["Template", "Documentação", "GPT-4"]
    },
    {
      id: 3,
      title: "Discussão: Ética no uso de IA para criação de conteúdo",
      content: "Gostaria de abrir uma discussão sobre os aspectos éticos do uso de IA para criação de conteúdo. Onde devemos traçar os limites?",
      author: {
        name: "Roberto Lima",
        avatar: "/api/placeholder/40/40",
        role: "Product Manager",
        level: 18
      },
      timestamp: "1 dia atrás",
      category: "Ética",
      likes: 45,
      replies: 32,
      isPinned: false,
      tags: ["Ética", "Conteúdo", "IA"]
    }
  ];

  const upcomingEvents = [
    {
      id: 1,
      title: "Mentoria: Implementação Prática de RAG",
      description: "Aprenda a implementar Retrieval Augmented Generation em projetos reais",
      mentor: "Dr. Maria Santos",
      date: "Hoje, 15:00",
      duration: "1h 30min",
      attendees: 24,
      maxAttendees: 30,
      type: "mentoria"
    },
    {
      id: 2,
      title: "Workshop: Fine-tuning com Dados Próprios",
      description: "Como customizar modelos de IA com seus próprios datasets",
      mentor: "Prof. João Oliveira",
      date: "Amanhã, 10:00",
      duration: "2h 00min",
      attendees: 18,
      maxAttendees: 25,
      type: "workshop"
    },
    {
      id: 3,
      title: "Live Q&A: Carreira em IA",
      description: "Tire suas dúvidas sobre carreira e mercado de trabalho em IA",
      mentor: "Equipe IA 360º",
      date: "Sex, 14:00",
      duration: "45min",
      attendees: 67,
      maxAttendees: 100,
      type: "qa"
    }
  ];

  const topContributors = [
    {
      name: "Ana Costa",
      avatar: "/api/placeholder/40/40",
      points: 2840,
      contributions: 156,
      badge: "Expert"
    },
    {
      name: "Carlos Silva",
      avatar: "/api/placeholder/40/40",
      points: 2120,
      contributions: 89,
      badge: "Mentor"
    },
    {
      name: "Roberto Lima",
      avatar: "/api/placeholder/40/40",
      points: 1890,
      contributions: 67,
      badge: "Helper"
    }
  ];

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
                  <h1 className="text-2xl font-bold text-gray-900">Comunidade</h1>
                  <p className="text-gray-600">Conecte-se, aprenda e compartilhe conhecimento</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Badge className="ai-gradient text-white border-0">
                  <Users className="h-4 w-4 mr-1" />
                  2,847 membros ativos
                </Badge>
                <Button className="ai-gradient text-white">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Nova Discussão
                </Button>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <div className="flex-1 overflow-auto p-6 bg-gray-50">
            <div className="max-w-7xl mx-auto">
              <div className="grid lg:grid-cols-4 gap-6">
                {/* Main Content - 3/4 width */}
                <div className="lg:col-span-3 space-y-6">
                  {/* Quick Post */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Compartilhe com a comunidade</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex space-x-4">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src="/api/placeholder/40/40" />
                          <AvatarFallback>JD</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 space-y-3">
                          <Textarea
                            placeholder="Compartilhe uma dica, faça uma pergunta ou inicie uma discussão..."
                            className="min-h-[100px]"
                          />
                          <div className="flex items-center justify-between">
                            <div className="flex space-x-2">
                              <Badge variant="outline" className="cursor-pointer hover:bg-gray-100">
                                #IA
                              </Badge>
                              <Badge variant="outline" className="cursor-pointer hover:bg-gray-100">
                                #Desenvolvimento
                              </Badge>
                              <Badge variant="outline" className="cursor-pointer hover:bg-gray-100">
                                #Prompts
                              </Badge>
                            </div>
                            <Button className="ai-gradient text-white">
                              Publicar
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Forum Tabs */}
                  <Tabs defaultValue="recent" className="space-y-6">
                    <TabsList className="grid w-full grid-cols-4">
                      <TabsTrigger value="recent">Recentes</TabsTrigger>
                      <TabsTrigger value="trending">Em Alta</TabsTrigger>
                      <TabsTrigger value="unanswered">Sem Resposta</TabsTrigger>
                      <TabsTrigger value="following">Seguindo</TabsTrigger>
                    </TabsList>

                    <TabsContent value="recent" className="space-y-4">
                      {forumPosts.map(post => (
                        <Card key={post.id} className="hover:shadow-md transition-shadow">
                          <CardContent className="p-6">
                            <div className="flex space-x-4">
                              <Avatar className="h-12 w-12">
                                <AvatarImage src={post.author.avatar} />
                                <AvatarFallback>
                                  {post.author.name.split(' ').map(n => n[0]).join('')}
                                </AvatarFallback>
                              </Avatar>
                              
                              <div className="flex-1">
                                <div className="flex items-start justify-between mb-3">
                                  <div>
                                    <div className="flex items-center space-x-2">
                                      {post.isPinned && (
                                        <Pin className="h-4 w-4 text-blue-500" />
                                      )}
                                      <h3 className="font-semibold text-lg text-gray-900">
                                        {post.title}
                                      </h3>
                                    </div>
                                    <div className="flex items-center space-x-3 text-sm text-gray-600 mt-1">
                                      <span className="font-medium">{post.author.name}</span>
                                      <Badge variant="outline" className="text-xs">
                                        {post.author.role}
                                      </Badge>
                                      <Badge className="text-xs ai-gradient text-white border-0">
                                        Nível {post.author.level}
                                      </Badge>
                                      <span>•</span>
                                      <span>{post.timestamp}</span>
                                    </div>
                                  </div>
                                  <Badge variant="outline">
                                    {post.category}
                                  </Badge>
                                </div>
                                
                                <p className="text-gray-700 mb-4 leading-relaxed">
                                  {post.content}
                                </p>
                                
                                <div className="flex flex-wrap gap-2 mb-4">
                                  {post.tags.map(tag => (
                                    <Badge key={tag} variant="outline" className="text-xs cursor-pointer hover:bg-gray-100">
                                      #{tag}
                                    </Badge>
                                  ))}
                                </div>
                                
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-6">
                                    <button className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors">
                                      <ThumbsUp className="h-4 w-4" />
                                      <span className="text-sm">{post.likes}</span>
                                    </button>
                                    <button className="flex items-center space-x-2 text-gray-600 hover:text-green-600 transition-colors">
                                      <MessageCircle className="h-4 w-4" />
                                      <span className="text-sm">{post.replies} respostas</span>
                                    </button>
                                    <button className="flex items-center space-x-2 text-gray-600 hover:text-purple-600 transition-colors">
                                      <Share2 className="h-4 w-4" />
                                      <span className="text-sm">Compartilhar</span>
                                    </button>
                                  </div>
                                  <Button variant="outline" size="sm">
                                    <Reply className="h-4 w-4 mr-2" />
                                    Responder
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </TabsContent>

                    <TabsContent value="trending" className="space-y-4">
                      <div className="text-center py-8">
                        <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          Discussões em Alta
                        </h3>
                        <p className="text-gray-600">
                          As discussões mais populares da semana aparecerão aqui
                        </p>
                      </div>
                    </TabsContent>

                    <TabsContent value="unanswered" className="space-y-4">
                      <div className="text-center py-8">
                        <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          Perguntas Sem Resposta
                        </h3>
                        <p className="text-gray-600 mb-4">
                          Ajude a comunidade respondendo perguntas em aberto
                        </p>
                        <Button variant="outline">
                          Ver Perguntas
                        </Button>
                      </div>
                    </TabsContent>

                    <TabsContent value="following" className="space-y-4">
                      <div className="text-center py-8">
                        <Heart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          Discussões que Você Segue
                        </h3>
                        <p className="text-gray-600">
                          Acompanhe as atualizações das discussões do seu interesse
                        </p>
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>

                {/* Sidebar - 1/4 width */}
                <div className="space-y-6">
                  {/* Upcoming Events */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center text-lg">
                        <Calendar className="h-5 w-5 mr-2 text-purple-600" />
                        Próximos Eventos
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {upcomingEvents.map(event => (
                        <div key={event.id} className="p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-medium text-sm leading-tight">
                              {event.title}
                            </h4>
                            <Badge 
                              variant="outline" 
                              className={`text-xs ml-2 ${
                                event.type === 'mentoria' ? 'border-blue-200 text-blue-700' :
                                event.type === 'workshop' ? 'border-green-200 text-green-700' :
                                'border-purple-200 text-purple-700'
                              }`}
                            >
                              {event.type}
                            </Badge>
                          </div>
                          <p className="text-xs text-gray-600 mb-2">
                            {event.description}
                          </p>
                          <div className="text-xs text-gray-500 space-y-1">
                            <div>📅 {event.date}</div>
                            <div>⏱️ {event.duration}</div>
                            <div>👥 {event.attendees}/{event.maxAttendees} participantes</div>
                          </div>
                          <Button size="sm" variant="outline" className="w-full mt-3 text-xs h-8">
                            Participar
                          </Button>
                        </div>
                      ))}
                      <Button variant="outline" className="w-full" size="sm">
                        Ver Todos os Eventos
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Top Contributors */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center text-lg">
                        <Zap className="h-5 w-5 mr-2 text-yellow-600" />
                        Top Contribuidores
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {topContributors.map((contributor, index) => (
                        <div key={contributor.name} className="flex items-center space-x-3">
                          <div className="flex-shrink-0">
                            <Badge className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                              index === 0 ? 'bg-yellow-500' :
                              index === 1 ? 'bg-gray-400' :
                              'bg-orange-500'
                            }`}>
                              {index + 1}
                            </Badge>
                          </div>
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={contributor.avatar} />
                            <AvatarFallback className="text-xs">
                              {contributor.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">
                              {contributor.name}
                            </p>
                            <div className="flex items-center space-x-2 text-xs text-gray-500">
                              <span>{contributor.points} pts</span>
                              <span>•</span>
                              <Badge variant="outline" className="text-xs">
                                {contributor.badge}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  {/* Community Stats */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Estatísticas</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Discussões Ativas</span>
                        <span className="font-semibold">1,247</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Membros Online</span>
                        <span className="font-semibold">342</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Respostas Hoje</span>
                        <span className="font-semibold">89</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Novos Membros</span>
                        <span className="font-semibold">+12</span>
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

export default Community;
