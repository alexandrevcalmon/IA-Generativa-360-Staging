
import { useState, useEffect } from 'react';
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
  Zap,
  Plus
} from "lucide-react";
import { useAuth } from '@/hooks/auth/useAuth';
import { useCommunityTopics } from '@/hooks/useCommunityTopics';
import { CreateTopicDialog } from '@/components/community/CreateTopicDialog';

const Community = () => {
  const { user } = useAuth();
  const { data: topics = [], isLoading, refetch } = useCommunityTopics();
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  // Refetch topics when component mounts
  useEffect(() => {
    refetch();
  }, [refetch]);

  // Get user initials for avatar
  const getUserInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
  };

  // Get display name from user data
  const getDisplayName = () => {
    if (user?.user_metadata?.name) {
      return user.user_metadata.name;
    }
    if (user?.email) {
      const emailPrefix = user.email.split('@')[0];
      return emailPrefix.charAt(0).toUpperCase() + emailPrefix.slice(1);
    }
    return 'Usuário';
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
                  <h1 className="text-2xl font-bold text-gray-900">Comunidade</h1>
                  <p className="text-gray-600">Conecte-se, aprenda e compartilhe conhecimento</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Badge className="ai-gradient text-white border-0">
                  <Users className="h-4 w-4 mr-1" />
                  {topics.length} tópicos ativos
                </Badge>
                <Button 
                  className="ai-gradient text-white"
                  onClick={() => setShowCreateDialog(true)}
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Nova Discussão
                </Button>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <div className="flex-1 overflow-auto">
            <div className="p-6">
              <Tabs defaultValue="discussions" className="space-y-6">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="discussions">Discussões</TabsTrigger>
                  <TabsTrigger value="events">Eventos</TabsTrigger>
                  <TabsTrigger value="contributors">Contribuidores</TabsTrigger>
                </TabsList>

                <TabsContent value="discussions" className="space-y-6">
                  {isLoading ? (
                    <div className="space-y-4">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="animate-pulse">
                          <div className="bg-gray-200 h-32 rounded-lg"></div>
                        </div>
                      ))}
                    </div>
                  ) : topics.length === 0 ? (
                    <div className="text-center py-12">
                      <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Nenhuma discussão ainda
                      </h3>
                      <p className="text-gray-600 mb-4">
                        Seja o primeiro a iniciar uma discussão na comunidade
                      </p>
                      <Button 
                        onClick={() => setShowCreateDialog(true)}
                        className="ai-gradient text-white"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Criar Primeira Discussão
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {topics.map((topic) => (
                        <Card key={topic.id} className="hover:shadow-md transition-shadow">
                          <CardContent className="p-6">
                            <div className="flex items-start space-x-4">
                              <Avatar className="h-10 w-10">
                                <AvatarImage src={topic.author_avatar} />
                                <AvatarFallback>
                                  {getUserInitials(topic.author_name)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <div className="flex items-center space-x-2 mb-2">
                                      <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
                                        {topic.title}
                                      </h3>
                                      {topic.is_pinned && (
                                        <Pin className="h-4 w-4 text-blue-500" />
                                      )}
                                    </div>
                                    <p className="text-gray-600 line-clamp-2 mb-3">
                                      {topic.content}
                                    </p>
                                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                                      <span>{topic.author_name}</span>
                                      <span>•</span>
                                      <span>{new Date(topic.created_at).toLocaleDateString('pt-BR')}</span>
                                      <span>•</span>
                                      <span>{topic.category}</span>
                                    </div>
                                  </div>
                                </div>
                                
                                <div className="flex items-center justify-between mt-4">
                                  <div className="flex items-center space-x-4">
                                    <Button variant="ghost" size="sm" className="text-gray-500">
                                      <ThumbsUp className="h-4 w-4 mr-1" />
                                      {topic.likes_count || 0}
                                    </Button>
                                    <Button variant="ghost" size="sm" className="text-gray-500">
                                      <Reply className="h-4 w-4 mr-1" />
                                      {topic.replies_count || 0}
                                    </Button>
                                    <Button variant="ghost" size="sm" className="text-gray-500">
                                      <Share2 className="h-4 w-4 mr-1" />
                                      Compartilhar
                                    </Button>
                                  </div>
                                  
                                  <div className="flex flex-wrap gap-1">
                                    {topic.tags?.map((tag, index) => (
                                      <Badge key={index} variant="outline" className="text-xs">
                                        {tag}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="events" className="space-y-6">
                  <div className="text-center py-12">
                    <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Eventos em breve
                    </h3>
                    <p className="text-gray-600">
                      Os eventos da comunidade estarão disponíveis em breve
                    </p>
                  </div>
                </TabsContent>

                <TabsContent value="contributors" className="space-y-6">
                  <div className="text-center py-12">
                    <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Ranking de Contribuidores
                    </h3>
                    <p className="text-gray-600">
                      O ranking de contribuidores estará disponível em breve
                    </p>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </main>

      <CreateTopicDialog 
        open={showCreateDialog} 
        onOpenChange={setShowCreateDialog} 
      />
    </>
  );
};

export default Community;
