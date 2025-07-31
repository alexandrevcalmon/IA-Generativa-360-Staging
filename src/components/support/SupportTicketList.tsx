import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  MessageSquare, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Filter,
  Search,
  Plus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useSupportTickets, SupportTicket } from '@/hooks/useSupportTickets';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface SupportTicketListProps {
  userRole: 'company' | 'producer';
  companyId?: string;
}

export function SupportTicketList({ userRole, companyId }: SupportTicketListProps) {
  const navigate = useNavigate();
  const { tickets, isLoading, ticketCounts } = useSupportTickets();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');



  // Filtrar tickets baseado no papel do usuário
  const filteredTickets = tickets.filter(ticket => {
    if (userRole === 'company' && companyId) {
      return ticket.company_id === companyId;
    }
    return true; // Produtores veem todos os tickets
  });

  // Aplicar filtros
  const filteredAndSearchedTickets = filteredTickets.filter(ticket => {
    const matchesSearch = ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || ticket.category === categoryFilter;
    
    return matchesSearch && matchesStatus && matchesCategory;
  });

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

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <Card key={i} className="bg-gray-800/50 border-gray-700/50">
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-700 rounded w-1/2 mb-4"></div>
                <div className="flex gap-2">
                  <div className="h-6 bg-gray-700 rounded w-16"></div>
                  <div className="h-6 bg-gray-700 rounded w-20"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header com estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gray-800/50 border-gray-700/50 hover:bg-gray-700/50 transition-colors">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-500/10 rounded-lg">
                <AlertCircle className="h-6 w-6 text-yellow-500" />
              </div>
              <div>
                <p className="text-sm text-gray-400 mb-1">Chamado Aberto</p>
                <p className="text-3xl font-bold text-white">{ticketCounts?.open || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gray-800/50 border-gray-700/50 hover:bg-gray-700/50 transition-colors">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <Clock className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-gray-400 mb-1">Chamado em Andamento</p>
                <p className="text-3xl font-bold text-white">{ticketCounts?.in_progress || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        

        
        <Card className="bg-gray-800/50 border-gray-700/50 hover:bg-gray-700/50 transition-colors">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-500/10 rounded-lg">
                <XCircle className="h-6 w-6 text-gray-500" />
              </div>
              <div>
                <p className="text-sm text-gray-400 mb-1">Chamado Encerrado</p>
                <p className="text-3xl font-bold text-white">{ticketCounts?.closed || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros e busca */}
      <Card className="bg-gray-800/50 border-gray-700/50">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar chamados..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-gray-700/50 border-gray-600/50 text-white placeholder:text-gray-400"
                />
              </div>
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-40 bg-gray-700/50 border-gray-600/50 text-white">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                <SelectItem value="all">Todos os Status</SelectItem>
                <SelectItem value="open">Chamado Aberto</SelectItem>
                <SelectItem value="in_progress">Chamado em Andamento</SelectItem>

                <SelectItem value="closed">Chamado Encerrado</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full md:w-40 bg-gray-700/50 border-gray-600/50 text-white">
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                <SelectItem value="all">Todas as Categorias</SelectItem>
                <SelectItem value="bug">Bug</SelectItem>
                <SelectItem value="feature_request">Solicitação</SelectItem>
                <SelectItem value="question">Dúvida</SelectItem>
                <SelectItem value="technical_issue">Problema Técnico</SelectItem>
                <SelectItem value="billing">Faturamento</SelectItem>
                <SelectItem value="general">Geral</SelectItem>
              </SelectContent>
            </Select>
            
            <Button
              onClick={() => navigate(userRole === 'producer' ? '/producer/support/new' : '/company/support/new')}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Novo Chamado
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Lista de tickets */}
      <div className="space-y-4">
        {filteredAndSearchedTickets.length === 0 ? (
          <Card className="bg-gray-800/50 border-gray-700/50">
            <CardContent className="p-8 text-center">
              <MessageSquare className="h-12 w-12 text-gray-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">
                Nenhum chamado encontrado
              </h3>
              <p className="text-gray-400 mb-4">
                {searchTerm || statusFilter !== 'all' || categoryFilter !== 'all'
                  ? 'Tente ajustar os filtros de busca.'
                  : 'Comece criando seu primeiro chamado de suporte.'}
              </p>
              {!searchTerm && statusFilter === 'all' && categoryFilter === 'all' && (
                <Button
                  onClick={() => navigate(userRole === 'producer' ? '/producer/support/new' : '/company/support/new')}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Primeiro Chamado
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          filteredAndSearchedTickets.map((ticket) => (
            <Card
              key={ticket.id}
              className="bg-gray-800/50 border-gray-700/50 hover:bg-gray-700/50 transition-all duration-200 cursor-pointer"
              onClick={() => navigate(userRole === 'producer' ? `/producer/support/${ticket.id}` : `/company/support/${ticket.id}`)}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-white truncate">
                        {ticket.title}
                      </h3>
                      <div className="flex items-center gap-1">
                        {getStatusIcon(ticket.status)}
                        <Badge
                          variant="outline"
                          className={`text-xs ${getPriorityColor(ticket.priority)}`}
                        >
                          {ticket.priority === 'urgent' ? 'Urgente' :
                           ticket.priority === 'high' ? 'Alta' :
                           ticket.priority === 'medium' ? 'Média' : 'Baixa'}
                        </Badge>
                      </div>
                    </div>
                    
                    <p className="text-gray-400 text-sm mb-3 line-clamp-2">
                      {ticket.description}
                    </p>
                    
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <span>{getCategoryIcon(ticket.category)}</span>
                        <span>{getCategoryText(ticket.category)}</span>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <MessageSquare className="h-3 w-3" />
                        <span>{ticket._count?.replies || 0} respostas</span>
                      </div>
                      
                      <span>
                        {formatDistanceToNow(new Date(ticket.created_at), {
                          addSuffix: true,
                          locale: ptBR,
                        })}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end gap-2">
                    <Badge
                      variant="outline"
                      className={`text-xs ${
                        ticket.status === 'open' ? 'border-yellow-500/30 text-yellow-400' :
                        ticket.status === 'in_progress' ? 'border-blue-500/30 text-blue-400' :

                        'border-gray-500/30 text-gray-400'
                      }`}
                    >
                      {getStatusText(ticket.status)}
                    </Badge>
                    
                    {ticket.company && userRole === 'producer' && (
                      <p className="text-xs text-gray-500">
                        {ticket.company.name}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
} 
