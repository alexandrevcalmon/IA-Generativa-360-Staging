import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/auth/useAuth';
import { useSupportTickets } from '@/hooks/useSupportTickets';
import { PageLayout } from '@/components/PageLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowLeft, 
  MessageSquare, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Send,
  FileText,
  User,
  Calendar
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function SupportTicketDetail() {
  const { ticketId } = useParams<{ ticketId: string }>();
  const navigate = useNavigate();
  const { userRole } = useAuth();
  const { getTicket, updateTicket, createReply, isCreatingReply, isUpdatingTicket } = useSupportTickets();
  
  const [replyContent, setReplyContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const ticketQuery = getTicket(ticketId!);
  const ticket = ticketQuery.data;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'in_progress':
        return <Clock className="h-4 w-4 text-blue-500" />;

      case 'closed':
        return <XCircle className="h-4 w-4 text-gray-500" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'open':
        return 'Chamado Aberto';
      case 'in_progress':
        return 'Chamado em Andamento';

      case 'closed':
        return 'Chamado Encerrado';
      default:
        return status;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'high':
        return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'medium':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'low':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getCategoryText = (category: string) => {
    switch (category) {
      case 'bug':
        return 'Bug';
      case 'feature_request':
        return 'Solicitação';
      case 'question':
        return 'Dúvida';
      case 'technical_issue':
        return 'Problema Técnico';
      case 'billing':
        return 'Faturamento';
      case 'general':
        return 'Geral';
      default:
        return category;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'bug':
        return '🐛';
      case 'feature_request':
        return '💡';
      case 'question':
        return '❓';
      case 'technical_issue':
        return '🔧';
      case 'billing':
        return '💰';
      case 'general':
        return '📋';
      default:
        return '📄';
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!ticket) return;
    
    console.log('🔄 Changing ticket status:', { 
      ticketId: ticket.id, 
      currentStatus: ticket.status, 
      newStatus 
    });
    
    setIsSubmitting(true);
    try {
      await updateTicket({
        ticketId: ticket.id,
        updates: { 
          status: newStatus as any,
  
          ...(newStatus === 'closed' && { closed_at: new Date().toISOString() })
        }
      });
      console.log('✅ Status updated successfully');
    } catch (error) {
      console.error('❌ Error updating status:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitReply = async () => {
    if (!ticket || !replyContent.trim()) return;
    
    setIsSubmitting(true);
    try {
      await createReply({
        ticketId: ticket.id,
        content: replyContent.trim()
      });
      setReplyContent('');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (ticketQuery.isLoading) {
    return (
      <PageLayout
        title="Carregando..."
        subtitle="Buscando detalhes do chamado"
        background="dark"
      >
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-700 rounded w-1/3"></div>
          <div className="h-4 bg-gray-700 rounded w-1/2"></div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </PageLayout>
    );
  }

  if (!ticket) {
    return (
      <PageLayout
        title="Chamado não encontrado"
        subtitle="O chamado que você está procurando não existe ou foi removido"
        background="dark"
      >
        <div className="text-center py-12">
          <MessageSquare className="h-12 w-12 text-gray-500 mx-auto mb-4" />
          <Button onClick={() => navigate(userRole === 'producer' ? '/producer/support' : '/company/support')} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar aos Chamados
          </Button>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      title="Detalhes do Chamado"
      subtitle="Visualize e gerencie o chamado de suporte"
      background="dark"
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(userRole === 'producer' ? '/producer/support' : '/company/support')}
              className="text-gray-400 hover:text-white"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-white">{ticket.title}</h1>
              <p className="text-gray-400 text-sm">
                Criado {formatDistanceToNow(new Date(ticket.created_at), {
                  addSuffix: true,
                  locale: ptBR,
                })}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className={`${getPriorityColor(ticket.priority)}`}
            >
              {ticket.priority === 'urgent' ? 'Urgente' :
               ticket.priority === 'high' ? 'Alta' :
               ticket.priority === 'medium' ? 'Média' : 'Baixa'}
            </Badge>
            <Badge
              variant="outline"
              className={`${
                ticket.status === 'open' ? 'border-yellow-500/30 text-yellow-400' :
                ticket.status === 'in_progress' ? 'border-blue-500/30 text-blue-400' :

                'border-gray-500/30 text-gray-400'
              }`}
            >
              {getStatusIcon(ticket.status)}
              <span className="ml-1">{getStatusText(ticket.status)}</span>
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Conteúdo principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Detalhes do ticket */}
            <Card className="bg-gray-800/50 border-gray-700/50">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Detalhes do Chamado
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <span>{getCategoryIcon(ticket.category)}</span>
                  <span>{getCategoryText(ticket.category)}</span>
                </div>
                
                <div className="prose prose-invert max-w-none">
                  <p className="text-gray-300 whitespace-pre-wrap">{ticket.description}</p>
                </div>
                
                <div className="flex items-center gap-4 text-xs text-gray-500 pt-4 border-t border-gray-700/50">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>{format(new Date(ticket.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Respostas */}
            <Card className="bg-gray-800/50 border-gray-700/50">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Respostas ({ticket.replies?.length || 0})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {ticket.replies && ticket.replies.length > 0 ? (
                  ticket.replies.map((reply, index) => (
                    <div key={reply.id}>
                      <div className={`p-4 rounded-lg ${
                        reply.author_role === 'producer' 
                          ? 'bg-blue-500/10 border border-blue-500/20' 
                          : 'bg-gray-700/30'
                      }`}>
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <div className="flex items-center gap-2">
                            <Badge
                              variant="outline"
                              className={`text-xs ${
                                reply.author_role === 'producer'
                                  ? 'border-blue-500/30 text-blue-400'
                                  : 'border-green-500/30 text-green-400'
                              }`}
                            >
                              {reply.author_role === 'producer' ? 'Suporte' : 'Empresa'}
                            </Badge>
                            {reply.author?.email && (
                              <span className="text-xs text-gray-400">
                                {reply.author.email}
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-gray-500">
                            {formatDistanceToNow(new Date(reply.created_at), {
                              addSuffix: true,
                              locale: ptBR,
                            })}
                          </span>
                        </div>
                        <p className="text-gray-300 whitespace-pre-wrap">{reply.content}</p>
                      </div>
                      {index < ticket.replies!.length - 1 && (
                        <Separator className="my-4 bg-gray-700/30" />
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <MessageSquare className="h-8 w-8 text-gray-500 mx-auto mb-2" />
                    <p className="text-gray-400">Nenhuma resposta ainda</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Nova resposta */}
            {ticket.status !== 'closed' && (
              <Card className="bg-gray-800/50 border-gray-700/50">
                <CardHeader>
                  <CardTitle className="text-white">Adicionar Resposta</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Textarea
                    placeholder="Digite sua resposta..."
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    className="min-h-[120px] bg-gray-700/50 border-gray-600/50 text-white placeholder:text-gray-400"
                  />
                  <div className="flex justify-end">
                    <Button
                      onClick={handleSubmitReply}
                      disabled={!replyContent.trim() || isSubmitting}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <Send className="h-4 w-4 mr-2" />
                      Enviar Resposta
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Ações */}
            <Card className="bg-gray-800/50 border-gray-700/50">
              <CardHeader>
                <CardTitle className="text-white">Ações</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                
                {/* Botão para encerrar chamado - disponível quando em andamento OU quando há respostas, mas NÃO quando fechado */}
                {(ticket.status === 'in_progress' || (ticket.status === 'open' && ticket.replies && ticket.replies.length > 0)) && ticket.status !== 'closed' && (
                  <Button
                    onClick={() => handleStatusChange('closed')}
                    disabled={isSubmitting}
                    className="w-full bg-gray-600 hover:bg-gray-700 text-white"
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Encerrar Chamado
                  </Button>
                )}
                
                {/* Botão para reabrir chamado - disponível apenas quando fechado */}
                {ticket.status === 'closed' && (
                  <Button
                    onClick={() => handleStatusChange('in_progress')}
                    disabled={isSubmitting}
                    className="w-full bg-yellow-600 hover:bg-yellow-700 text-white"
                  >
                    <AlertCircle className="h-4 w-4 mr-2" />
                    Reabrir Chamado
                  </Button>
                )}
                
                {/* Mensagem informativa para chamados abertos sem respostas */}
                {ticket.status === 'open' && (!ticket.replies || ticket.replies.length === 0) && (
                  <div className="text-center p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                    <Clock className="h-8 w-8 mx-auto mb-2 text-blue-400" />
                    <p className="text-blue-300 text-sm">
                      Aguardando primeira resposta para iniciar o atendimento
                    </p>
                  </div>
                )}
                
                {/* Mensagem para chamados abertos com respostas (status não foi atualizado automaticamente) */}
                {ticket.status === 'open' && ticket.replies && ticket.replies.length > 0 && (
                  <div className="text-center p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                    <AlertCircle className="h-8 w-8 mx-auto mb-2 text-yellow-400" />
                    <p className="text-yellow-300 text-sm">
                      Atendimento em andamento - {ticket.replies.length} resposta{ticket.replies.length > 1 ? 's' : ''}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Informações */}
            <Card className="bg-gray-800/50 border-gray-700/50">
              <CardHeader>
                <CardTitle className="text-white">Informações</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Status:</span>
                  <span className="text-white">{getStatusText(ticket.status)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Prioridade:</span>
                  <span className="text-white">
                    {ticket.priority === 'urgent' ? 'Urgente' :
                     ticket.priority === 'high' ? 'Alta' :
                     ticket.priority === 'medium' ? 'Média' : 'Baixa'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Categoria:</span>
                  <span className="text-white">{getCategoryText(ticket.category)}</span>
                </div>
                {ticket.company && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Empresa:</span>
                    <span className="text-white">{ticket.company.name}</span>
                  </div>
                )}
                <Separator className="bg-gray-700/30" />
                <div className="flex justify-between">
                  <span className="text-gray-400">Criado:</span>
                  <span className="text-white">
                    {format(new Date(ticket.created_at), 'dd/MM/yyyy', { locale: ptBR })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Atualizado:</span>
                  <span className="text-white">
                    {format(new Date(ticket.updated_at), 'dd/MM/yyyy', { locale: ptBR })}
                  </span>
                </div>

                {ticket.closed_at && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Fechado:</span>
                    <span className="text-white">
                      {format(new Date(ticket.closed_at), 'dd/MM/yyyy', { locale: ptBR })}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PageLayout>
  );
} 
