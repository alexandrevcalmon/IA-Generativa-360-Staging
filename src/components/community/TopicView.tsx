import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  MessageCircle,
  ThumbsUp,
  Pin,
  Lock,
  Send
} from 'lucide-react';
import { useCommunityTopics } from '@/hooks/useCommunityTopics';
import { useCommunityReplies, useCreateCommunityReply } from '@/hooks/useCommunityReplies';
import { useToggleTopicLike, useGetTopicLikes } from '@/hooks/useToggleTopicLike';
import { useAuth } from '@/hooks/auth';
import { toast } from 'sonner';

export const TopicView = () => {
  const { topicId } = useParams<{ topicId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [replyContent, setReplyContent] = useState('');

  const { data: topics = [] } = useCommunityTopics();
  const { data: replies = [] } = useCommunityReplies(topicId);
  const { data: likesData } = useGetTopicLikes(topicId || '');
  const { mutate: toggleLike } = useToggleTopicLike();
  const { mutate: createReply, isPending: isCreatingReply } = useCreateCommunityReply();

  const topic = topics.find(t => t.id === topicId);

  if (!topic) {
    return (
      <div className="flex flex-col h-full">
        <div className="bg-white border-b p-6">
          <Button variant="ghost" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Tópico não encontrado
            </h3>
            <p className="text-gray-600">
              O tópico que você está procurando não existe ou foi removido.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const handleLike = () => {
    if (!user) {
      toast.error('Você precisa estar logado para curtir');
      return;
    }
    toggleLike({ topicId: topic.id, isLiked: likesData?.isLiked || false });
  };

  const handleReply = () => {
    if (!user) {
      toast.error('Você precisa estar logado para responder');
      return;
    }

    if (!replyContent.trim()) {
      toast.error('Digite sua resposta');
      return;
    }

    createReply({
      topic_id: topic.id,
      content: replyContent.trim(),
      author_id: user.id,
      author_name: user.user_metadata?.name || user.email?.split('@')[0] || 'Usuário',
      author_email: user.email || '',
      company_name: null,
      is_solution: false
    }, {
      onSuccess: () => {
        setReplyContent('');
        toast.success('Resposta enviada com sucesso!');
      }
    });
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="bg-white border-b p-6">
        <Button variant="ghost" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar para Comunidade
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6 bg-gray-50">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Topic */}
          <Card className={topic.is_pinned ? 'border-purple-200 bg-purple-50' : ''}>
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <CardTitle className="text-xl">{topic.title}</CardTitle>
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
                  <AvatarFallback className="text-sm">
                    {topic.author_name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span>Por {topic.author_name}</span>
                  {topic.company_name && <span>• {topic.company_name}</span>}
                  <span>• {new Date(topic.created_at).toLocaleDateString('pt-BR')}</span>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="prose max-w-none">
                <p className="text-gray-700 whitespace-pre-wrap">{topic.content}</p>
              </div>
              
              <div className="flex items-center gap-6 pt-4 border-t">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLike}
                  className={`flex items-center gap-1 ${
                    likesData?.isLiked ? 'text-purple-600' : 'text-gray-600'
                  }`}
                >
                  <ThumbsUp className={`h-4 w-4 ${likesData?.isLiked ? 'fill-current' : ''}`} />
                  <span>{likesData?.likesCount || topic.likes_count} curtidas</span>
                </Button>
                
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <MessageCircle className="h-4 w-4" />
                  <span>{replies.length} respostas</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Reply Form */}
          {!topic.is_locked && user && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Sua Resposta</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="Digite sua resposta..."
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  rows={4}
                />
                <div className="flex justify-end">
                  <Button 
                    onClick={handleReply}
                    disabled={!replyContent.trim() || isCreatingReply}
                  >
                    <Send className="h-4 w-4 mr-2" />
                    {isCreatingReply ? 'Enviando...' : 'Responder'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Replies */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Respostas ({replies.length})
            </h3>
            
            {replies.length > 0 ? (
              replies.map((reply) => (
                <Card key={reply.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-3">
                      <Avatar className="h-8 w-8 mt-1">
                        <AvatarFallback className="text-sm">
                          {reply.author_name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <span className="font-medium text-gray-900">{reply.author_name}</span>
                          {reply.company_name && <span>• {reply.company_name}</span>}
                          <span>• {new Date(reply.created_at).toLocaleDateString('pt-BR')}</span>
                          {reply.is_solution && (
                            <Badge className="bg-green-100 text-green-800">
                              Solução
                            </Badge>
                          )}
                        </div>
                        
                        <div className="prose max-w-none">
                          <p className="text-gray-700 whitespace-pre-wrap">{reply.content}</p>
                        </div>
                        
                        <div className="flex items-center gap-4 pt-2">
                          <Button variant="ghost" size="sm" className="text-gray-600">
                            <ThumbsUp className="h-4 w-4 mr-1" />
                            {reply.likes_count} curtidas
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h4 className="text-lg font-medium text-gray-900 mb-2">
                    Nenhuma resposta ainda
                  </h4>
                  <p className="text-gray-600">
                    Seja o primeiro a responder este tópico!
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
