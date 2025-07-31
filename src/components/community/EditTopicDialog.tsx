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
import { useUpdateCommunityTopic, type CommunityTopic } from '@/hooks/useCommunityTopics';

interface EditTopicDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  topic: CommunityTopic | null;
}

export const EditTopicDialog = ({ open, onOpenChange, topic }: EditTopicDialogProps) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('general');
  const [tags, setTags] = useState('');

  const { mutate: updateTopic, isPending } = useUpdateCommunityTopic();

  useEffect(() => {
    if (topic) {
      setTitle(topic.title);
      setContent(topic.content);
      setCategory(topic.category);
      setTags(topic.tags?.join(', ') || '');
    }
  }, [topic]);

  const handleSubmit = () => {
    if (!title.trim() || !content.trim() || !topic) return;

    const updates = {
      title: title.trim(),
      content: content.trim(),
      category,
      tags: tags ? tags.split(',').map(tag => tag.trim()).filter(Boolean) : undefined,
    };

    updateTopic({ id: topic.id, ...updates }, {
      onSuccess: () => {
        onOpenChange(false);
      },
    });
  };

  const handleClose = () => {
    onOpenChange(false);
    // Reset form when closing
    if (topic) {
      setTitle(topic.title);
      setContent(topic.content);
      setCategory(topic.category);
      setTags(topic.tags?.join(', ') || '');
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Editar Tópico</DialogTitle>
          <DialogDescription>
            Faça as alterações necessárias no seu tópico.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="edit-title">Título</Label>
            <Input
              id="edit-title"
              placeholder="Digite o título do tópico..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="edit-category">Categoria</Label>
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
            <Label htmlFor="edit-content">Conteúdo</Label>
            <Textarea
              id="edit-content"
              placeholder="Descreva seu tópico em detalhes..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={6}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="edit-tags">Tags (opcional)</Label>
            <Input
              id="edit-tags"
              placeholder="Ex: javascript, react, nodejs (separadas por vírgula)"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancelar
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={!title.trim() || !content.trim() || isPending}
          >
            {isPending ? 'Salvando...' : 'Salvar Alterações'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
