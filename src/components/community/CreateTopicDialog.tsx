
import { useState } from 'react';
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
import { useAuth } from '@/hooks/auth';

interface CreateTopicDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CreateTopicDialog = ({ open, onOpenChange }: CreateTopicDialogProps) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('general');
  const [tags, setTags] = useState('');

  const { user } = useAuth();
  const { mutate: createTopic, isPending } = useCreateCommunityTopic();

  const handleSubmit = () => {
    if (!title.trim() || !content.trim() || !user) return;

    // Get user data - we'll need to fetch this from the user's profile
    const userData = {
      id: user.id,
      email: user.email || '',
      // For now, we'll use email as name, but this should come from user profile
      name: user.email?.split('@')[0] || 'Usuário',
      companyName: undefined // This should come from user's company data
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

    createTopic(topicData, {
      onSuccess: () => {
        setTitle('');
        setContent('');
        setCategory('general');
        setTags('');
        onOpenChange(false);
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Criar Novo Tópico</DialogTitle>
          <DialogDescription>
            Compartilhe suas ideias e inicie uma discussão com a comunidade.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="title">Título</Label>
            <Input
              id="title"
              placeholder="Digite o título do tópico..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="category">Categoria</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="general">Geral</SelectItem>
                <SelectItem value="courses">Cursos</SelectItem>
                <SelectItem value="technical">Técnico</SelectItem>
                <SelectItem value="career">Carreira</SelectItem>
                <SelectItem value="networking">Networking</SelectItem>
                <SelectItem value="announcements">Anúncios</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="content">Conteúdo</Label>
            <Textarea
              id="content"
              placeholder="Descreva seu tópico em detalhes..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={6}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="tags">Tags (opcional)</Label>
            <Input
              id="tags"
              placeholder="Ex: javascript, react, nodejs (separadas por vírgula)"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={!title.trim() || !content.trim() || isPending}
          >
            {isPending ? 'Criando...' : 'Criar Tópico'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
