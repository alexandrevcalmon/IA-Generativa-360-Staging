import { useState, useEffect, useCallback } from 'react';
import { PageLayout } from "@/components/PageLayout";
import { PageSection } from "@/components/PageSection";
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Search, Filter } from 'lucide-react';
import { useCommunityTopics } from '@/hooks/useCommunityTopics';
import { CreateTopicDialog } from '@/components/community/CreateTopicDialog';
import { EditTopicDialog } from '@/components/community/EditTopicDialog';
import { TopicCard } from '@/components/community/TopicCard';
import type { CommunityTopic } from '@/hooks/useCommunityTopics';

const StudentCommunity = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingTopic, setEditingTopic] = useState<CommunityTopic | null>(null);

  const { data: topics = [], isLoading, error, refetch } = useCommunityTopics();

  // Refetch topics when component mounts
  useEffect(() => {
    console.log('🔄 StudentCommunity: Component mounted, refetching topics');
    refetch();
  }, [refetch]);

  // Filter topics based on search and category
  const filteredTopics = useCallback(() => {
    return topics.filter(topic => {
      const matchesSearch = topic.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           topic.content.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || topic.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [topics, searchTerm, selectedCategory]);

  // Get unique categories for filter
  const categories = Array.from(new Set(topics.map(topic => topic.category)));

  // Sort topics: pinned first, then by creation date
  const sortedTopics = filteredTopics().sort((a, b) => {
    if (a.is_pinned && !b.is_pinned) return -1;
    if (!a.is_pinned && b.is_pinned) return 1;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  // Header content com botão de novo tópico
  const headerContent = (
    <div className="flex items-center gap-2">
      <Button 
        onClick={() => setIsCreateDialogOpen(true)} 
        className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
      >
        <Plus className="h-4 w-4" />
        <span className="hidden sm:inline">Novo Tópico</span>
      </Button>
      

    </div>
  );

  const handleCreateSuccess = useCallback(() => {
    console.log('✅ Topic created successfully, refetching topics');
    refetch();
  }, [refetch]);

  const handleEditSuccess = useCallback(() => {
    console.log('✅ Topic edited successfully, refetching topics');
    refetch();
    setEditingTopic(null);
  }, [refetch]);

  if (error) {
    return (
      <PageLayout
        title="Comunidade"
        subtitle="Conecte-se com outros estudantes e tire suas dúvidas"
        headerContent={headerContent}
        background="dark"
      >
        <PageSection transparent>
          <Card className="border-red-700/50 bg-red-900/20 shadow-lg">
            <CardContent className="p-8 text-center bg-red-900/20">
              <div className="text-red-500 mb-4">
                <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-white mb-2">Erro ao carregar tópicos</h3>
              <p className="text-red-300 mb-4">
                Ocorreu um erro ao carregar os tópicos da comunidade.
              </p>
              <Button 
                onClick={() => refetch()} 
                className="mt-2 bg-red-600 hover:bg-red-700 text-white"
              >
                Tentar Novamente
              </Button>
            </CardContent>
          </Card>
        </PageSection>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      title="Comunidade"
      subtitle="Conecte-se com outros estudantes e tire suas dúvidas"
      headerContent={headerContent}
      background="dark"
    >
      <div className="space-y-6">
        {/* Filters */}
        <PageSection transparent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
              <Input
                placeholder="Buscar tópicos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-slate-800/50 border-slate-700/50 text-white placeholder:text-slate-400 focus:border-emerald-500/50"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full sm:w-48 bg-slate-800/50 border-slate-700/50 text-white">
                <Filter className="h-4 w-4 mr-2 text-slate-400" />
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                <SelectItem value="all" className="text-white hover:bg-slate-700">Todas as categorias</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category} value={category} className="text-white hover:bg-slate-700">
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </PageSection>

        {/* Content */}
        {isLoading ? (
          <PageSection transparent>
            <div className="flex items-center justify-center h-32">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mx-auto mb-2"></div>
                <p className="text-slate-300">Carregando tópicos...</p>
              </div>
            </div>
          </PageSection>
        ) : sortedTopics.length > 0 ? (
          <PageSection noPadding transparent>
            <div className="space-y-4">
              {sortedTopics.map(topic => (
                <TopicCard 
                  key={topic.id} 
                  topic={topic} 
                  onEdit={setEditingTopic}
                />
              ))}
            </div>
          </PageSection>
        ) : (
          <PageSection transparent>
            <Card className="border-slate-700/50 bg-slate-900/20 shadow-lg">
              <CardContent className="p-8 text-center bg-slate-900/20">
                <div className="text-slate-500 mb-4">
                  <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-white mb-2">Nenhum tópico encontrado</h3>
                <p className="text-slate-300 mb-4">
                  {searchTerm || selectedCategory !== 'all' 
                    ? 'Tente ajustar os filtros de busca.'
                    : 'Seja o primeiro a iniciar uma discussão na comunidade!'
                  }
                </p>
                {!searchTerm && selectedCategory === 'all' && (
                  <Button onClick={() => setIsCreateDialogOpen(true)} className="mt-2 bg-emerald-600 hover:bg-emerald-700 text-white">
                    <Plus className="h-4 w-4 mr-2" />
                    Criar Primeiro Tópico
                  </Button>
                )}
              </CardContent>
            </Card>
          </PageSection>
        )}
      </div>

      {/* Dialogs */}
      <CreateTopicDialog 
        open={isCreateDialogOpen} 
        onOpenChange={setIsCreateDialogOpen}
      />
      
      {editingTopic && (
        <EditTopicDialog 
          topic={editingTopic}
          open={!!editingTopic}
          onOpenChange={(open) => !open && setEditingTopic(null)}
        />
      )}
    </PageLayout>
  );
};

export default StudentCommunity;
