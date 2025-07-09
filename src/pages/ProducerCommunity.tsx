
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  MessageCircle,
  Users,
  Search,
  Plus,
  Pin,
  Lock,
  Unlock,
  Trash2,
  AlertCircle,
  TrendingUp,
  Eye,
  ThumbsUp,
  Filter,
  PinOff
} from 'lucide-react';
import {
  useCommunityTopics,
  useToggleTopicPin,
  useToggleTopicLock,
  useDeleteCommunityTopic,
  type CommunityTopic
} from '@/hooks/useCommunityTopics';
import { CreateTopicDialog } from '@/components/community/CreateTopicDialog';
import { TopicCard } from '@/components/community/TopicCard';
import { EditTopicDialog } from '@/components/community/EditTopicDialog';

const ProducerCommunity = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [createTopicOpen, setCreateTopicOpen] = useState(false);
  const [editTopicOpen, setEditTopicOpen] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<CommunityTopic | null>(null);

  const { data: topics = [], isLoading, error } = useCommunityTopics();

  const handleEditTopic = (topic: CommunityTopic) => {
    setSelectedTopic(topic);
    setEditTopicOpen(true);
  };

  const filteredTopics = topics.filter(topic => {
    const matchesSearch = topic.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         topic.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || topic.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const communityStats = {
    totalTopics: topics.length,
    totalReplies: topics.reduce((sum, topic) => sum + topic.replies_count, 0),
    totalLikes: topics.reduce((sum, topic) => sum + topic.likes_count, 0),
    totalViews: topics.reduce((sum, topic) => sum + topic.views_count, 0),
  };

  if (isLoading) {
    return (
      <div className="flex flex-col h-full">
        <div className="bg-white border-b p-6">
          <h1 className="text-2xl font-bold text-gray-900">Gerenciar Comunidade</h1>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-lg text-gray-600">Carregando comunidade...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col h-full">
        <div className="bg-white border-b p-6">
          <h1 className="text-2xl font-bold text-gray-900">Gerenciar Comunidade</h1>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Erro ao carregar comunidade
            </h3>
            <p className="text-gray-600">
              Tente recarregar a página ou entre em contato com o suporte.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="bg-white border-b p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Gerenciar Comunidade
            </h1>
            <p className="text-gray-600">
              Modere discussões, fixe tópicos importantes e acompanhe a atividade
            </p>
          </div>
          <Button 
            className="bg-gradient-to-r from-purple-500 to-purple-700 hover:from-purple-600 hover:to-purple-800 text-white"
            onClick={() => setCreateTopicOpen(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Novo Tópico
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6 bg-gray-50">
        <div className="space-y-6">
          {/* Estatísticas */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <MessageCircle className="h-8 w-8 text-blue-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total de Tópicos</p>
                    <p className="text-2xl font-bold text-gray-900">{communityStats.totalTopics}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Users className="h-8 w-8 text-green-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total de Respostas</p>
                    <p className="text-2xl font-bold text-gray-900">{communityStats.totalReplies}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <ThumbsUp className="h-8 w-8 text-purple-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total de Curtidas</p>
                    <p className="text-2xl font-bold text-gray-900">{communityStats.totalLikes}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Eye className="h-8 w-8 text-orange-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total de Visualizações</p>
                    <p className="text-2xl font-bold text-gray-900">{communityStats.totalViews}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filtros e Busca */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Buscar tópicos..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button variant="outline">
                    <Filter className="h-4 w-4 mr-2" />
                    Filtros
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Lista de Tópicos */}
          <Tabs defaultValue="all" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">Todos</TabsTrigger>
              <TabsTrigger value="pinned">Fixados</TabsTrigger>
              <TabsTrigger value="recent">Recentes</TabsTrigger>
              <TabsTrigger value="trending">Em Alta</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-4">
              {filteredTopics.length > 0 ? (
                filteredTopics.map((topic) => (
                  <TopicCard 
                    key={topic.id} 
                    topic={topic} 
                    onEdit={handleEditTopic}
                    showModeratorActions={true}
                  />
                ))
              ) : (
                <Card>
                  <CardContent className="p-8 text-center">
                    <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Nenhum tópico encontrado
                    </h3>
                    <p className="text-gray-600">
                      Quando os colaboradores criarem tópicos, eles aparecerão aqui.
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="pinned" className="space-y-4">
              {filteredTopics.filter(topic => topic.is_pinned).length > 0 ? (
                filteredTopics.filter(topic => topic.is_pinned).map((topic) => (
                  <TopicCard 
                    key={topic.id} 
                    topic={topic} 
                    onEdit={handleEditTopic}
                    showModeratorActions={true}
                  />
                ))
              ) : (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Pin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Nenhum tópico fixado
                    </h3>
                    <p className="text-gray-600">
                      Use a opção de fixar para destacar tópicos importantes.
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="recent" className="space-y-4">
              <Card>
                <CardContent className="p-8 text-center">
                  <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Em desenvolvimento
                  </h3>
                  <p className="text-gray-600">
                    Funcionalidade em desenvolvimento.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="trending" className="space-y-4">
              <Card>
                <CardContent className="p-8 text-center">
                  <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Em desenvolvimento
                  </h3>
                  <p className="text-gray-600">
                    Funcionalidade em desenvolvimento.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <CreateTopicDialog 
        open={createTopicOpen} 
        onOpenChange={setCreateTopicOpen} 
      />
      
      <EditTopicDialog 
        open={editTopicOpen} 
        onOpenChange={setEditTopicOpen} 
        topic={selectedTopic}
      />
    </div>
  );
};

export default ProducerCommunity;
