
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCreateCommunityTopic } from '@/hooks/useCommunityTopics';
import { useAuth } from '@/hooks/auth/useAuth';
import { toast } from 'sonner';

interface CreateTopicDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CreateTopicDialog = ({ open, onOpenChange }: CreateTopicDialogProps) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('general');
  const [tags, setTags] = useState('');

  const { user, companyUserData } = useAuth();
  const { mutate: createTopic, isPending } = useCreateCommunityTopic();

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (!open) {
      setTitle('');
      setContent('');
      setCategory('general');
      setTags('');
    }
  }, [open]);

  const handleSubmit = () => {
    if (!title.trim() || !content.trim() || !user) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    // Get user data with fallbacks
    const userData = {
      id: user.id,
      email: user.email || '',
      name: companyUserData?.name || user.user_metadata?.name || user.email?.split('@')[0] || 'Usuário',
      companyName: companyUserData?.companies?.name || companyUserData?.company_name || undefined
    };

    const topicData = {
      title: title.trim(),
      content: content.trim(),
      author_id: userData.id,
      author_name: userData.name,
      author_email: userData.email,
      company_name: userData.companyName,
      category,
      is_pinned: false,
      is_locked: false,
      tags: tags ? tags.split(',').map(tag => tag.trim()).filter(Boolean) : undefined,
    };

    console.log('📝 Submitting topic data:', topicData);

    createTopic(topicData, {
      onSuccess: (data) => {
        console.log('✅ Topic created successfully:', data);
        toast.success('Tópico criado com sucesso!');
        setTitle('');
        setContent('');
        setCategory('general');
        setTags('');
        onOpenChange(false);
      },
      onError: (error) => {
        console.error('❌ Error creating topic:', error);
        toast.error('Erro ao criar tópico. Tente novamente.');
      },
    });
  };

  const handleClose = () => {
    if (!isPending) {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[525px] !bg-gray-900 !border-gray-700">
        <DialogHeader>
          <DialogTitle className="!text-white">Criar Novo Tópico</DialogTitle>
          <DialogDescription className="!text-gray-300">
            Compartilhe suas ideias e inicie uma discussão com a comunidade.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="title" className="!text-gray-300">Título *</Label>
            <Input
              id="title"
              placeholder="Digite o título do tópico..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="!bg-gray-800 !border-gray-600 !text-white !placeholder-gray-400 focus:!border-blue-500 focus:!ring-blue-500"
              disabled={isPending}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="category" className="!text-gray-300">Categoria</Label>
            <Select value={category} onValueChange={setCategory} disabled={isPending}>
              <SelectTrigger className="!bg-gray-800 !border-gray-600 !text-white focus:!border-blue-500 focus:!ring-blue-500">
                <SelectValue placeholder="Selecione uma categoria" />
              </SelectTrigger>
              <SelectContent className="!bg-gray-800 !border-gray-700">
                <SelectItem value="general" className="!text-white hover:!bg-gray-700">Geral</SelectItem>
                <SelectItem value="courses" className="!text-white hover:!bg-gray-700">Cursos</SelectItem>
                <SelectItem value="technical" className="!text-white hover:!bg-gray-700">Técnico</SelectItem>
                <SelectItem value="career" className="!text-white hover:!bg-gray-700">Carreira</SelectItem>
                <SelectItem value="networking" className="!text-white hover:!bg-gray-700">Networking</SelectItem>
                <SelectItem value="announcements" className="!text-white hover:!bg-gray-700">Anúncios</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="content" className="!text-gray-300">Conteúdo *</Label>
            <Textarea
              id="content"
              placeholder="Descreva seu tópico em detalhes..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={6}
              className="!bg-gray-800 !border-gray-600 !text-white !placeholder-gray-400 focus:!border-blue-500 focus:!ring-blue-500"
              disabled={isPending}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="tags" className="!text-gray-300">Tags (opcional)</Label>
            <Input
              id="tags"
              placeholder="Ex: javascript, react, nodejs (separadas por vírgula)"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="!bg-gray-800 !border-gray-600 !text-white !placeholder-gray-400 focus:!border-blue-500 focus:!ring-blue-500"
              disabled={isPending}
            />
          </div>
        </div>
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={handleClose}
            disabled={isPending}
            className="!bg-gray-800 !border-gray-600 !text-gray-300 hover:!bg-gray-700 hover:!text-white"
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={!title.trim() || !content.trim() || isPending}
            className="!bg-gradient-to-r !from-blue-600 !to-purple-600 hover:!from-blue-700 hover:!to-purple-700 !text-white"
          >
            {isPending ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Criando...
              </>
            ) : (
              'Criar Tópico'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
