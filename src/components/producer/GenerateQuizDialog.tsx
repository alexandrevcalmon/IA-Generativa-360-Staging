import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Plus, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useCreateQuiz } from '@/hooks/useQuizzes';
import { useUpdateQuiz } from '@/hooks/useQuizzes';
import { useToast } from '@/hooks/use-toast';

interface QuizQuestion {
  pergunta: string;
  alternativas: string[];
  correta: string;
}

interface GenerateQuizDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  content: string;
  lessonId?: string;
  moduleId?: string;
  onQuizApproved: (questions: QuizQuestion[]) => void;
}

export function GenerateQuizDialog({
  open,
  onOpenChange,
  content,
  lessonId,
  moduleId,
  quiz,
  onQuizApproved,
}: GenerateQuizDialogProps & { quiz?: any }) {
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editData, setEditData] = useState<QuizQuestion | null>(null);
  const createQuizMutation = useCreateQuiz();
  const updateQuizMutation = useUpdateQuiz();
  const { toast } = useToast();

  // Inicializar perguntas se for edição
  useEffect(() => {
    if (quiz) {
      setQuestions(quiz.questions || []);
    } else if (open && content) {
      // Só gera perguntas com IA automaticamente se não estiver editando
      setQuestions([]);
    }
  }, [quiz, open, content]);

  // Função para adicionar perguntas geradas por IA ao final da lista
  const handleGenerateWithAI = async () => {
    try {
      setLoading(true);
      setError(null);
      // Chamada para gerar perguntas com IA (igual ao fluxo original)
      const { data: { session } } = await supabase.auth.getSession();
      const accessToken = session?.access_token;
      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-quiz`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
          ...(accessToken ? { 'Authorization': `Bearer ${accessToken}` } : {}),
        },
        body: JSON.stringify({
          content,
          lessonId,
          moduleId,
          numQuestions: 5,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro ao gerar quiz');
      // Adiciona as perguntas geradas ao final da lista
      setQuestions(prev => [...prev, ...(data.questions || [])]);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (idx: number) => {
    setEditingIndex(idx);
    setEditData({ ...questions[idx] });
  };

  const handleSaveEdit = () => {
    if (editingIndex === null || !editData) return;
    setQuestions((prev) => prev.map((q, i) => (i === editingIndex ? editData : q)));
    setEditingIndex(null);
    setEditData(null);
  };

  const handleDelete = (idx: number) => {
    setQuestions((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleAdd = () => {
    setQuestions((prev) => [
      ...prev,
      { pergunta: '', alternativas: ['', '', '', ''], correta: '' },
    ]);
    setEditingIndex(questions.length);
    setEditData({ pergunta: '', alternativas: ['', '', '', ''], correta: '' });
  };

  const handleSaveQuiz = async () => {
    try {
      console.log('[GenerateQuizDialog] Salvando quiz', { lessonId, moduleId, questions, quiz });
      if (!lessonId && !moduleId) throw new Error('lessonId ou moduleId obrigatório');
      if (!questions || questions.length === 0) throw new Error('Nenhuma pergunta para salvar');
      if (quiz && quiz.id) {
        // Edição
        await updateQuizMutation.mutateAsync({
          id: quiz.id,
          title: quiz.title || `Quiz da aula: ${content?.slice(0, 40)}`,
          description: content?.slice(0, 100) || '',
          questions,
        });
        toast({ title: 'Quiz atualizado com sucesso!' });
      } else {
        // Criação
        await createQuizMutation.mutateAsync({
          lessonId,
          moduleId,
          title: `Quiz da aula: ${content?.slice(0, 40)}`,
          description: content?.slice(0, 100) || '',
          questions,
        });
        toast({ title: 'Quiz salvo com sucesso!' });
      }
      if (onQuizApproved) onQuizApproved(questions);
      onOpenChange(false);
    } catch (error: any) {
      console.error('[GenerateQuizDialog] Erro ao salvar quiz:', error);
      toast({
        title: 'Erro ao salvar quiz',
        description: error.message || String(error),
        variant: 'destructive',
      });
    }
  };

  const canSave = questions.length > 0 && questions.every(q => q.pergunta && q.alternativas.length === 4 && q.alternativas.every(a => a) && q.correta);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Quiz Gerado com IA</DialogTitle>
        </DialogHeader>
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin mb-4" />
            <span>Gerando perguntas com IA...</span>
          </div>
        ) : error ? (
          <div className="text-red-600 text-center py-8">{error}</div>
        ) : (
          <div className="space-y-6">
            {questions.length === 0 && (
              <div className="text-center text-gray-500">Nenhuma pergunta gerada.</div>
            )}
            {questions.map((q, idx) => (
              <div key={idx} className="border rounded p-4 mb-2 bg-gray-50 relative">
                {editingIndex === idx ? (
                  <div className="space-y-2">
                    <Textarea
                      value={editData?.pergunta || ''}
                      onChange={e => setEditData(d => d ? { ...d, pergunta: e.target.value } : d)}
                      placeholder="Pergunta"
                      rows={2}
                    />
                    {editData?.alternativas.map((alt, i) => (
                      <Input
                        key={i}
                        value={alt}
                        onChange={e => setEditData(d => d ? { ...d, alternativas: d.alternativas.map((a, j) => j === i ? e.target.value : a) } : d)}
                        placeholder={`Alternativa ${String.fromCharCode(65 + i)}`}
                        className="mb-1"
                      />
                    ))}
                    <Input
                      value={editData?.correta || ''}
                      onChange={e => setEditData(d => d ? { ...d, correta: e.target.value } : d)}
                      placeholder="Alternativa correta (copie exatamente uma das alternativas acima)"
                    />
                    <Button size="sm" onClick={handleSaveEdit}>Salvar</Button>
                    <Button size="sm" variant="outline" onClick={() => { setEditingIndex(null); setEditData(null); }}>Cancelar</Button>
                  </div>
                ) : (
                  <>
                    <div className="font-medium mb-1">{q.pergunta}</div>
                    <ul className="mb-1">
                      {q.alternativas.map((alt, i) => (
                        <li key={i} className={alt === q.correta ? 'font-semibold text-green-700' : ''}>
                          {String.fromCharCode(65 + i)}. {alt}
                        </li>
                      ))}
                    </ul>
                    <div className="text-xs text-gray-500 mb-1">Correta: {q.correta}</div>
                    <div className="flex gap-2 absolute top-2 right-2">
                      <Button size="icon" variant="ghost" onClick={() => handleEdit(idx)}><span className="sr-only">Editar</span>✏️</Button>
                      <Button size="icon" variant="ghost" onClick={() => handleDelete(idx)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                    </div>
                  </>
                )}
              </div>
            ))}
            <Button variant="outline" size="sm" onClick={handleAdd} className="flex items-center gap-2"><Plus className="h-4 w-4" />Adicionar Pergunta</Button>
            <Button variant="secondary" size="sm" onClick={handleGenerateWithAI} className="flex items-center gap-2 ml-2">Gerar perguntas com IA</Button>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
              <Button onClick={handleSaveQuiz} disabled={!canSave}>Salvar Quiz</Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
} 