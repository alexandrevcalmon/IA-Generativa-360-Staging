
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  MessageCircle,
  ThumbsUp,
  Eye,
  Pin,
  Lock,
  ArrowLeft,
  Send
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToggleTopicLike, useGetTopicLikes } from '@/hooks/useToggleTopicLike';
import { useCommunityReplies, useCreateCommunityReply } from '@/hooks/useCommunityReplies';
import { useAuth } from '@/hooks/auth';
import { toast } from 'sonner';

export const TopicDetailView = () => {
  const { topicId } = useParams<{ topicId: string }>();
  const navigate = useNavigate();
  const { user, companyUserData } = useAuth();
  const [replyContent, setReplyContent] = useState('');

  // Fetch topic details
  const { data: topic, isLoading: topicLoading } = useQuery({
    queryKey: ['community-topic', topicId],
    queryFn: async () => {
      if (!topicId) throw new Error('Topic ID is required');
      
      const { data, error } = await supabase
        .from('community_topics')
        .select('*')
        .eq('id', topicId)
        .single();

      if (error) {
        console.error('Error fetching topic:', error);
        throw error;
      }

      return data;
    },
    enabled: !!topicId,
  });

  const { data: likesData } = useGetTopicLikes(topicId || '');
  const { data: replies = [], isLoading: repliesLoading } = useCommunityReplies(topicId);
  const { mutate: toggleLike } = useToggleTopicLike();
  const { mutate: createReply, isPending: creatingReply } = useCreateCommunityReply();

  const handleLike = () => {
    if (!user || !topicId) {
      toast.error('Você precisa estar logado para curtir');
      return;
    }
    toggleLike({ topicId, isLiked: likesData?.isLiked || false });
  };

  const handleReply = () => {
    if (!user || !topicId || !replyContent.trim()) {
      toast.error('Preencha o conteúdo da resposta');
      return;
    }

    if (!companyUserData) {
      toast.error('Dados do usuário não encontrados');
      return;
    }

    createReply({
      topic_id: topicId,
      content: replyContent.trim(),
      author_id: user.id,
      author_name: companyUserData.name,
      author_email: companyUserData.email,
      company_name: companyUserData.companies?.name,
      is_solution: false
    }, {
      onSuccess: () => {
        setReplyContent('');
        toast.success('Resposta enviada com sucesso!');
      }
    });
  };

  if (topicLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-2"></div>
          <p className="text-gray-600">Carregando tópico...</p>
        </div>
      </div>
    );
  }

  if (!topic) {
    return (
      <div className="text-center py-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Tópico não encontrado</h2>
        <p className="text-gray-600 mb-4">O tópico que você está procurando não existe ou foi removido.</p>
        <Button onClick={() => navigate('/student/community')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar para Comunidade
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Back button */}
      <Button variant="outline" onClick={() => navigate('/student/community')}>
        <ArrowLeft className="h-4 w-4 mr-2" />
        Voltar para Comunidade
      </Button>

      {/* Topic */}
      <Card className={topic.is_pinned ? 'border-purple-200 bg-purple-50' : ''}>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <CardTitle className="text-2xl">{topic.title}</CardTitle>
                {topic.is_pinned && (
                  <Badge className="bg-purple-100 text-purple-800">
                    <Pin className="w-3 h-3 mr-1" />
                    Fixado
                  </Badge>
                )}
                {topic.is_locked && (
                  <Badge variant="outline" className="border-red-200 text-red-700">
                    <Lock className="w-3 h-3 mr-1" />
                    Bloqueado
                  </Badge>
                )}
                <Badge variant="outline">{topic.category}</Badge>
              </div>
              <div className="flex items-center gap-2 mb-4">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>
                    {topic.author_name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span>Por {topic.author_name}</span>
                  {topic.company_name && <span>• {topic.company_name}</span>}
                  <span>• {new Date(topic.created_at).toLocaleDateString('pt-BR')}</span>
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="prose max-w-none mb-6">
            <p className="whitespace-pre-wrap">{topic.content}</p>
          </div>

          <div className="flex items-center gap-6 text-sm text-gray-600 border-t pt-4">
            <div className="flex items-center gap-1">
              <MessageCircle className="h-4 w-4" />
              <span>{topic.replies_count} respostas</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLike}
              className={`flex items-center gap-1 p-0 h-auto font-normal ${
                likesData?.isLiked ? 'text-purple-600' : 'text-gray-600'
              }`}
            >
              <ThumbsUp className={`h-4 w-4 ${likesData?.isLiked ? 'fill-current' : ''}`} />
              <span>{likesData?.likesCount || topic.likes_count} curtidas</span>
            </Button>
            <div className="flex items-center gap-1">
              <Eye className="h-4 w-4" />
              <span>{topic.views_count} visualizações</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Replies */}
      <Card>
        <CardHeader>
          <CardTitle>Respostas ({replies.length})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {repliesLoading ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600 mx-auto mb-2"></div>
              <p className="text-gray-600">Carregando respostas...</p>
            </div>
          ) : replies.length > 0 ? (
            replies.map((reply) => (
              <div key={reply.id} className="border-b border-gray-100 pb-4 last:border-b-0 last:pb-0">
                <div className="flex items-center gap-2 mb-2">
                  <Avatar className="h-6 w-6">
                    <AvatarFallback className="text-xs">
                      {reply.author_name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className="font-medium">{reply.author_name}</span>
                    {reply.company_name && <span>• {reply.company_name}</span>}
                    <span>• {new Date(reply.created_at).toLocaleDateString('pt-BR')}</span>
                  </div>
                </div>
                <p className="text-gray-700 whitespace-pre-wrap ml-8">{reply.content}</p>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-center py-4">Ainda não há respostas. Seja o primeiro a responder!</p>
          )}

          {/* Reply form */}
          {user && !topic.is_locked && (
            <div className="border-t pt-4 mt-6">
              <h4 className="font-medium text-gray-900 mb-2">Adicionar Resposta</h4>
              <Textarea
                placeholder="Digite sua resposta..."
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                rows={4}
                className="mb-3"
              />
              <Button 
                onClick={handleReply} 
                disabled={!replyContent.trim() || creatingReply}
              >
                <Send className="h-4 w-4 mr-2" />
                {creatingReply ? 'Enviando...' : 'Enviar Resposta'}
              </Button>
            </div>
          )}

          {!user && (
            <div className="border-t pt-4 mt-6 text-center">
              <p className="text-gray-600">Faça login para participar da discussão.</p>
            </div>
          )}

          {topic.is_locked && (
            <div className="border-t pt-4 mt-6 text-center">
              <p className="text-gray-600 flex items-center justify-center gap-2">
                <Lock className="h-4 w-4" />
                Este tópico está bloqueado para novas respostas.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
