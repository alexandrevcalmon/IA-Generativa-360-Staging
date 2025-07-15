
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
import { useAuth } from '@/hooks/auth';
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
        ? 'border-purple-200 bg-purple-50'
        : topic.replies_count > 0
        ? 'border-green-200 bg-green-50'
        : ''
    }>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <CardTitle 
                className="text-lg cursor-pointer hover:text-purple-600 transition-colors"
                onClick={handleViewTopic}
              >
                {topic.title}
              </CardTitle>
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
            <p 
              className="text-gray-600 mb-3 cursor-pointer hover:text-gray-800 transition-colors"
              onClick={handleViewTopic}
            >
              {topic.content.substring(0, 200)}...
            </p>
            <div className="flex items-center gap-2 mb-2">
              <Avatar className="h-6 w-6">
                <AvatarFallback className="text-xs">
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
          {canModerate && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {onEdit && (
                  <DropdownMenuItem onClick={() => onEdit(topic)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Editar
                  </DropdownMenuItem>
                )}
                {showModeratorActions && isProducer && (
                  <>
                    <DropdownMenuItem onClick={handleTogglePin}>
                      <Pin className="h-4 w-4 mr-2" />
                      {topic.is_pinned ? 'Desfixar' : 'Fixar'}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleToggleLock}>
                      <Lock className="h-4 w-4 mr-2" />
                      {topic.is_locked ? 'Desbloquear' : 'Bloquear'}
                    </DropdownMenuItem>
                  </>
                )}
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Deletar
                    </DropdownMenuItem>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Deletar tópico</AlertDialogTitle>
                      <AlertDialogDescription>
                        Tem certeza que deseja deletar este tópico? Esta ação não pode ser desfeita.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDelete}
                        className="bg-red-600 hover:bg-red-700"
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
      <CardContent>
        <div className="flex items-center gap-6 text-sm text-gray-600">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleViewTopic}
            className={`flex items-center gap-1 p-0 h-auto font-normal ${topic.replies_count > 0 ? 'text-green-600' : 'text-gray-600'} hover:text-green-700`}
          >
            <MessageCircle className={`h-4 w-4 ${topic.replies_count > 0 ? 'text-green-600' : ''}`} />
            <span>{topic.replies_count} respostas</span>
          </Button>
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
  );
};
