
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
import { useCommunityReplies, useCreateCommunityReply, useToggleReplyLike, useUpdateCommunityReply, useDeleteCommunityReply } from '@/hooks/useCommunityReplies';
import { useAuth } from '@/hooks/auth/useAuth';
import { toast } from 'sonner';

const TopicDetailView = () => {
  const { topicId } = useParams<{ topicId: string }>();
  const navigate = useNavigate();
  const { user, companyUserData } = useAuth();
  const [replyContent, setReplyContent] = useState('');
  const { isProducer } = useAuth();
  const { mutate: toggleReplyLike } = useToggleReplyLike();
  const { mutate: updateReply } = useUpdateCommunityReply();
  const { mutate: deleteReply } = useDeleteCommunityReply();
  const [editingReplyId, setEditingReplyId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');

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

    // Fallback: usar dados do user se companyUserData não estiver disponível
    let authorName = companyUserData?.name || user.user_metadata?.name || user.email || 'Usuário';
    let authorEmail = companyUserData?.email || user.email || '';
    let companyName = companyUserData?.companies?.name || companyUserData?.company_name || undefined;

    if (!companyUserData) {
      console.warn('[TopicDetailView] companyUserData não encontrado, usando fallback do user:', user.email);
      toast.warning('Seu cadastro está incompleto, mas sua resposta será enviada normalmente.');
    }

    createReply({
      topic_id: topicId,
      content: replyContent.trim(),
      author_id: user.id,
      author_name: authorName,
      author_email: authorEmail,
      company_name: companyName,
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
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mx-auto mb-2"></div>
          <p className="text-slate-300">Carregando tópico...</p>
        </div>
      </div>
    );
  }

  if (!topic) {
    return (
      <div className="text-center py-8">
        <h2 className="text-xl font-semibold text-white mb-2">Tópico não encontrado</h2>
        <p className="text-slate-300 mb-4">O tópico que você está procurando não existe ou foi removido.</p>
        <Button onClick={() => navigate('/student/community')} className="bg-emerald-600 hover:bg-emerald-700 text-white" style={{ backgroundColor: '#059669', color: 'white' }}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar para Comunidade
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center w-full px-2 md:px-0 dark-theme-override min-h-screen bg-slate-900">
      {/* Back button */}
      <div className="w-full max-w-3xl mb-4">
        <Button variant="outline" onClick={() => navigate('/student/community')} className="border-slate-600 text-slate-300 hover:bg-slate-800/50" style={{ borderColor: '#475569', color: '#cbd5e1' }}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar para Comunidade
        </Button>
      </div>

      {/* Topic */}
      <div className="w-full max-w-3xl mb-6">
        <Card className={
          topic.is_pinned 
            ? 'border-purple-500/40 bg-purple-500/10 shadow-xl' 
            : 'border-emerald-500/40 bg-slate-800/40 shadow-xl'
        } style={{ 
          backgroundColor: topic.is_pinned ? 'rgba(147, 51, 234, 0.15)' : 'rgba(30, 41, 59, 0.4)',
          borderWidth: '2px',
          borderColor: topic.is_pinned ? 'rgba(147, 51, 234, 0.4)' : 'rgba(16, 185, 129, 0.4)'
        }}>
          <CardHeader className={
            topic.is_pinned
              ? 'bg-purple-500/15 text-white border-b border-purple-500/25'
              : 'bg-slate-700/50 text-white border-b border-emerald-500/20'
          } style={{ backgroundColor: topic.is_pinned ? 'rgba(147, 51, 234, 0.15)' : 'rgba(51, 65, 85, 0.5)' }}>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${topic.is_pinned ? 'bg-purple-400' : 'bg-emerald-400'}`}></div>
                    <CardTitle className="text-2xl text-white">{topic.title}</CardTitle>
                  </div>
                  {topic.is_pinned && (
                    <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30" style={{ backgroundColor: 'rgba(147, 51, 234, 0.2)', color: '#c4b5fd', borderColor: 'rgba(147, 51, 234, 0.3)' }}>
                      <Pin className="w-3 h-3 mr-1" />
                      Fixado
                    </Badge>
                  )}
                  {topic.is_locked && (
                    <Badge variant="outline" className="border-red-500/30 text-red-300" style={{ borderColor: 'rgba(239, 68, 68, 0.3)', color: '#fca5a5' }}>
                      <Lock className="w-3 h-3 mr-1" />
                      Bloqueado
                    </Badge>
                  )}
                  <Badge variant="outline" className="border-slate-600 text-slate-300" style={{ borderColor: '#475569', color: '#cbd5e1' }}>{topic.category}</Badge>
                </div>
                <div className="flex items-center gap-2 mb-4">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-slate-700 text-white">
                      {topic.author_name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex items-center gap-4 text-sm text-slate-400">
                    <span>Por {topic.author_name}</span>
                    {topic.company_name && <span>• {topic.company_name}</span>}
                    <span>• {new Date(topic.created_at).toLocaleDateString('pt-BR')}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className={
            topic.is_pinned
              ? 'bg-purple-500/10'
              : 'bg-slate-700/30'
          } style={{ backgroundColor: topic.is_pinned ? 'rgba(147, 51, 234, 0.1)' : 'rgba(51, 65, 85, 0.3)' }}>
            <div className="prose max-w-none mb-6">
              <p className="whitespace-pre-wrap text-slate-300">{topic.content}</p>
            </div>

            <div className="flex items-center gap-6 text-sm text-slate-400 border-t border-slate-700/50 pt-4">
              <div className="flex items-center gap-1">
                <MessageCircle className="h-4 w-4" />
                <span>{topic.replies_count} respostas</span>
              </div>
              <div
                onClick={handleLike}
                className={`flex items-center gap-1 cursor-pointer transition-all duration-200 rounded-md px-2 py-1 ${
                  likesData?.isLiked 
                    ? 'text-purple-400 hover:text-purple-300 hover:bg-purple-500/10' 
                    : 'text-slate-400 hover:text-slate-300 hover:bg-slate-700/30'
                }`}
              >
                <ThumbsUp className={`h-4 w-4 ${likesData?.isLiked ? 'fill-current text-purple-400' : 'text-slate-400'}`} />
                <span>{likesData?.likesCount || topic.likes_count} curtidas</span>
              </div>
              <div className="flex items-center gap-1 text-slate-400">
                <Eye className="h-4 w-4" />
                <span>{topic.views_count} visualizações</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Replies */}
      <div className="w-full max-w-3xl">
        <Card className="border-slate-600/50 bg-slate-900/30 shadow-lg" style={{ backgroundColor: 'rgba(15, 23, 42, 0.3)' }}>
                                  <CardHeader className="bg-slate-900/30 text-white border-b border-slate-600/50" style={{ backgroundColor: 'rgba(15, 23, 42, 0.3)' }}>
              <CardTitle className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-slate-400"></div>
                Respostas ({replies.length})
              </CardTitle>
            </CardHeader>
          <CardContent className="space-y-6 bg-slate-900/30" style={{ backgroundColor: 'rgba(15, 23, 42, 0.3)' }}>
            {repliesLoading ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-500 mx-auto mb-2"></div>
                <p className="text-slate-300">Carregando respostas...</p>
              </div>
            ) : replies.length > 0 ? (
              replies.map((reply) => (
                <div key={reply.id} className="p-4 rounded-lg border border-slate-700/50 bg-slate-800/40 shadow-md" style={{ backgroundColor: 'rgba(30, 41, 59, 0.4)' }}>
                  <div className="flex items-center gap-2 mb-2">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="text-xs bg-slate-700 text-white">
                        {reply.author_name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex items-center gap-4 text-sm text-slate-400">
                      <span className="font-medium text-white">{reply.author_name}</span>
                      {reply.company_name && <span>• {reply.company_name}</span>}
                      <span>• {new Date(reply.created_at).toLocaleDateString('pt-BR')}</span>
                    </div>
                  </div>
                  {/* Conteúdo da resposta ou edição inline */}
                  {editingReplyId === reply.id ? (
                    <div className="flex flex-col gap-2">
                      <Textarea
                        value={editContent}
                        onChange={e => setEditContent(e.target.value)}
                        rows={3}
                        className="mb-2 bg-slate-800/50 border-slate-700/50 text-white placeholder:text-slate-400 focus:border-emerald-500/50"
                        style={{ 
                          backgroundColor: 'rgba(30, 41, 59, 0.5)', 
                          borderColor: 'rgba(71, 85, 105, 0.5)',
                          color: 'white'
                        }}
                      />
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => {
                          updateReply({ id: reply.id, content: editContent, topic_id: reply.topic_id }, {
                            onSuccess: () => setEditingReplyId(null)
                          });
                        }} className="bg-emerald-600 hover:bg-emerald-700 text-white" style={{ backgroundColor: '#059669', color: 'white' }}>Salvar</Button>
                        <Button size="sm" variant="outline" onClick={() => setEditingReplyId(null)} className="border-slate-600 text-slate-300 hover:bg-slate-800/50" style={{ borderColor: '#475569', color: '#cbd5e1' }}>Cancelar</Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <p className="text-slate-300 whitespace-pre-wrap flex-1">{reply.content}</p>
                      <div className="flex items-center gap-2 ml-4">
                        {/* Botão de curtir */}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => toggleReplyLike({ replyId: reply.id, isLiked: reply.isLiked })}
                          className={`p-1 ${reply.isLiked ? 'text-purple-400' : 'text-slate-400'} hover:bg-slate-800/50`}
                          title={reply.isLiked ? 'Descurtir' : 'Curtir'}
                        >
                          <ThumbsUp className={`h-4 w-4 ${reply.isLiked ? 'fill-current text-purple-400' : 'text-slate-400'}`} />
                          <span className="ml-1 text-xs">{reply.likes_count}</span>
                        </Button>
                        {/* Ações de moderação: produtor pode editar/excluir, autor pode editar e excluir se não houver curtidas nem respostas-filhas */}
                        {(isProducer || (user && user.id === reply.author_id)) && (
                          <Button size="icon" variant="ghost" title="Editar resposta" className="text-slate-400 hover:bg-slate-800/50" onClick={() => {
                            setEditingReplyId(reply.id);
                            setEditContent(reply.content);
                          }}>
                            ✏️
                          </Button>
                        )}
                        {/* Excluir: produtor sempre pode, autor só se não houver curtidas nem respostas-filhas */}
                        {(isProducer || (user && user.id === reply.author_id && reply.likes_count === 0 /* && !reply.hasChildren */)) && (
                          <Button size="icon" variant="ghost" title="Excluir resposta" className="text-red-400 hover:bg-red-500/10" onClick={() => {
                            if (window.confirm('Tem certeza que deseja excluir esta resposta?')) {
                              deleteReply({ id: reply.id, topic_id: reply.topic_id });
                            }
                          }}>
                            🗑️
                          </Button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p className="text-slate-400 text-center py-4">Ainda não há respostas. Seja o primeiro a responder!</p>
            )}

            {/* Reply form */}
            {user && !topic.is_locked && (
              <div className="border-t border-slate-700/50 pt-4 mt-6">
                <h4 className="font-medium text-white mb-2">Adicionar Resposta</h4>
                <Textarea
                  placeholder="Digite sua resposta..."
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  rows={4}
                  className="mb-3 bg-slate-800/50 border-slate-700/50 text-white placeholder:text-slate-400 focus:border-emerald-500/50"
                  style={{ 
                    backgroundColor: 'rgba(30, 41, 59, 0.5)', 
                    borderColor: 'rgba(71, 85, 105, 0.5)',
                    color: 'white'
                  }}
                />
                <Button 
                  onClick={handleReply} 
                  disabled={!replyContent.trim() || creatingReply}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                  style={{ 
                    backgroundColor: '#059669',
                    color: 'white'
                  }}
                >
                  <Send className="h-4 w-4 mr-2" />
                  {creatingReply ? 'Enviando...' : 'Enviar Resposta'}
                </Button>
              </div>
            )}

            {!user && (
              <div className="border-t border-slate-700/50 pt-4 mt-6 text-center">
                <p className="text-slate-400">Faça login para participar da discussão.</p>
              </div>
            )}

            {topic.is_locked && (
              <div className="border-t border-slate-700/50 pt-4 mt-6 text-center">
                <p className="text-slate-400 flex items-center justify-center gap-2">
                  <Lock className="h-4 w-4" />
                  Este tópico está bloqueado para novas respostas.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TopicDetailView;
