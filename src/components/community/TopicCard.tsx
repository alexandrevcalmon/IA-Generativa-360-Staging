
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  MessageCircle,
  ThumbsUp,
  Eye,
  Pin,
  Lock,
  Edit,
  Trash2,
  MoreHorizontal
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useToggleTopicLike, useGetTopicLikes } from '@/hooks/useToggleTopicLike';
import { useDeleteCommunityTopic, useToggleTopicPin, useToggleTopicLock } from '@/hooks/useCommunityTopics';
import { useAuth } from '@/hooks/auth/useAuth';
import { toast } from 'sonner';
import type { CommunityTopic } from '@/hooks/useCommunityTopics';

interface TopicCardProps {
  topic: CommunityTopic;
  onEdit?: (topic: CommunityTopic) => void;
  showModeratorActions?: boolean;
}

export const TopicCard = ({ topic, onEdit, showModeratorActions = false }: TopicCardProps) => {
  const navigate = useNavigate();
  const { user, userRole } = useAuth();
  const { data: likesData } = useGetTopicLikes(topic.id);
  const { mutate: toggleLike } = useToggleTopicLike();
  const { mutate: deleteTopic } = useDeleteCommunityTopic();
  const { mutate: togglePin } = useToggleTopicPin();
  const { mutate: toggleLock } = useToggleTopicLock();

  const isAuthor = user?.id === topic.author_id;
  const isProducer = userRole === 'producer';
  const canModerate = isAuthor || isProducer;

  const handleLike = () => {
    if (!user) {
      toast.error('Você precisa estar logado para curtir');
      return;
    }
    toggleLike({ topicId: topic.id, isLiked: likesData?.isLiked || false });
  };

  const handleDelete = () => {
    deleteTopic(topic.id);
  };

  const handleTogglePin = () => {
    togglePin({ topicId: topic.id, isPinned: !topic.is_pinned });
  };

  const handleToggleLock = () => {
    toggleLock({ topicId: topic.id, isLocked: !topic.is_locked });
  };

  const handleViewTopic = () => {
    navigate(`/student/community/topic/${topic.id}`);
  };

  return (
    <Card className={
      topic.is_pinned
        ? '!border-purple-500/30 !bg-purple-500/10'
        : topic.replies_count > 0
        ? '!border-emerald-500/30 !bg-emerald-500/10'
        : '!border-slate-700/50 !bg-slate-900/20'
    }>
      <CardHeader className={
        topic.is_pinned
          ? '!bg-purple-500/10 !text-white !border-b !border-purple-500/20'
          : topic.replies_count > 0
          ? '!bg-emerald-500/10 !text-white !border-b !border-emerald-500/20'
          : '!bg-slate-900/20 !text-white !border-b !border-slate-700/50'
      }>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <CardTitle 
                className="!text-lg cursor-pointer hover:!text-emerald-400 transition-colors !text-white"
                onClick={handleViewTopic}
              >
                {topic.title}
              </CardTitle>
              {topic.is_pinned && (
                <Badge className="!bg-purple-500/20 !text-purple-300 !border-purple-500/30">
                  <Pin className="w-3 h-3 mr-1" />
                  Fixado
                </Badge>
              )}
              {topic.is_locked && (
                <Badge variant="outline" className="!border-red-500/30 !text-red-300">
                  <Lock className="w-3 h-3 mr-1" />
                  Bloqueado
                </Badge>
              )}
              <Badge variant="outline" className="!border-slate-600 !text-slate-300">{topic.category}</Badge>
            </div>
            <p 
              className="!text-slate-300 mb-3 cursor-pointer hover:!text-slate-200 transition-colors"
              onClick={handleViewTopic}
            >
              {topic.content.substring(0, 200)}...
            </p>
            <div className="flex items-center gap-2 mb-2">
              <Avatar className="h-6 w-6">
                <AvatarFallback className="!text-xs !bg-slate-700 !text-white">
                  {topic.author_name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex items-center gap-4 text-sm !text-slate-400">
                <span>Por {topic.author_name}</span>
                {topic.company_name && <span>• {topic.company_name}</span>}
                <span>• {new Date(topic.created_at).toLocaleDateString('pt-BR')}</span>
              </div>
            </div>
          </div>
          {canModerate && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="!text-slate-300 hover:!bg-slate-800/50">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="!bg-slate-800 !border-slate-700">
                {onEdit && (
                  <DropdownMenuItem onClick={() => onEdit(topic)} className="!text-white hover:!bg-slate-700">
                    <Edit className="h-4 w-4 mr-2" />
                    Editar
                  </DropdownMenuItem>
                )}
                {showModeratorActions && isProducer && (
                  <>
                    <DropdownMenuItem onClick={handleTogglePin} className="!text-white hover:!bg-slate-700">
                      <Pin className="h-4 w-4 mr-2" />
                      {topic.is_pinned ? 'Desfixar' : 'Fixar'}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleToggleLock} className="!text-white hover:!bg-slate-700">
                      <Lock className="h-4 w-4 mr-2" />
                      {topic.is_locked ? 'Desbloquear' : 'Bloquear'}
                    </DropdownMenuItem>
                  </>
                )}
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="!text-white hover:!bg-slate-700">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Deletar
                    </DropdownMenuItem>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="!bg-slate-800 !border-slate-700">
                    <AlertDialogHeader>
                      <AlertDialogTitle className="!text-white">Deletar tópico</AlertDialogTitle>
                      <AlertDialogDescription className="!text-slate-300">
                        Tem certeza que deseja deletar este tópico? Esta ação não pode ser desfeita.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="!bg-slate-700 !text-white hover:!bg-slate-600">Cancelar</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDelete}
                        className="!bg-red-600 hover:!bg-red-700 !text-white"
                      >
                        Deletar
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </CardHeader>
      <CardContent className={
        topic.is_pinned
          ? '!bg-purple-500/10'
          : topic.replies_count > 0
          ? '!bg-emerald-500/10'
          : '!bg-slate-900/20'
      }>
        <div className="flex items-center gap-6 text-sm !text-slate-400">
          <div
            onClick={handleViewTopic}
            className={`flex items-center gap-1 cursor-pointer transition-all duration-200 rounded-md px-2 py-1 ${
              topic.replies_count > 0 
                ? '!text-emerald-400 hover:!text-emerald-300 hover:!bg-emerald-500/10' 
                : '!text-slate-400 hover:!text-slate-300 hover:!bg-slate-700/30'
            }`}
          >
            <MessageCircle className={`h-4 w-4 ${topic.replies_count > 0 ? '!text-emerald-400' : '!text-slate-400'}`} />
            <span>{topic.replies_count} respostas</span>
          </div>
          <div
            onClick={handleLike}
            className={`flex items-center gap-1 cursor-pointer transition-all duration-200 rounded-md px-2 py-1 ${
              likesData?.isLiked 
                ? '!text-purple-400 hover:!text-purple-300 hover:!bg-purple-500/10' 
                : '!text-slate-400 hover:!text-slate-300 hover:!bg-slate-700/30'
            }`}
          >
            <ThumbsUp className={`h-4 w-4 ${likesData?.isLiked ? 'fill-current !text-purple-400' : '!text-slate-400'}`} />
            <span>{likesData?.likesCount || topic.likes_count} curtidas</span>
          </div>
          <div className="flex items-center gap-1 !text-slate-400">
            <Eye className="h-4 w-4" />
            <span>{topic.views_count} visualizações</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
