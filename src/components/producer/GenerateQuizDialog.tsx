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
        toast.success({ title: 'Quiz atualizado com sucesso!' });
      } else {
        // Criação
        await createQuizMutation.mutateAsync({
          lessonId,
          moduleId,
          title: `Quiz da aula: ${content?.slice(0, 40)}`,
          description: content?.slice(0, 100) || '',
          questions,
        });
        toast.success({ title: 'Quiz salvo com sucesso!' });
      }
      if (onQuizApproved) onQuizApproved(questions);
      onOpenChange(false);
    } catch (error: any) {
      console.error('[GenerateQuizDialog] Erro ao salvar quiz:', error);
      toast.error({
        title: 'Erro ao salvar quiz',
        description: error.message || String(error)
      });
    }
  };

  const canSave = questions.length > 0 && questions.every(q => q.pergunta && q.alternativas.length === 4 && q.alternativas.every(a => a) && q.correta);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-gray-900 border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-white">Quiz Gerado com IA</DialogTitle>
        </DialogHeader>
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin mb-4 text-gray-400" />
            <span className="text-gray-300">Gerando perguntas com IA...</span>
          </div>
        ) : error ? (
          <div className="text-red-400 text-center py-8">{error}</div>
        ) : (
          <div className="space-y-6">
            {questions.length === 0 && (
              <div className="text-center text-gray-400">Nenhuma pergunta gerada.</div>
            )}
            {questions.map((q, idx) => (
              <div key={idx} className="border border-gray-600 rounded p-4 mb-2 bg-gray-800/50 relative">
                {editingIndex === idx ? (
                  <div className="space-y-2">
                    <Textarea
                      value={editData?.pergunta || ''}
                      onChange={e => setEditData(d => d ? { ...d, pergunta: e.target.value } : d)}
                      placeholder="Pergunta"
                      rows={2}
                      className="bg-gray-800 border-gray-600 text-white placeholder:text-gray-400 focus:border-blue-500 focus:ring-blue-500"
                    />
                    {editData?.alternativas.map((alt, i) => (
                      <Input
                        key={i}
                        value={alt}
                        onChange={e => setEditData(d => d ? { ...d, alternativas: d.alternativas.map((a, j) => j === i ? e.target.value : a) } : d)}
                        placeholder={`Alternativa ${String.fromCharCode(65 + i)}`}
                        className="mb-1 bg-gray-800 border-gray-600 text-white placeholder:text-gray-400 focus:border-blue-500 focus:ring-blue-500"
                      />
                    ))}
                    <Input
                      value={editData?.correta || ''}
                      onChange={e => setEditData(d => d ? { ...d, correta: e.target.value } : d)}
                      placeholder="Alternativa correta (copie exatamente uma das alternativas acima)"
                      className="bg-gray-800 border-gray-600 text-white placeholder:text-gray-400 focus:border-blue-500 focus:ring-blue-500"
                    />
                    <div className="flex gap-2">
                      <Button size="sm" onClick={handleSaveEdit} className="!bg-gradient-to-r !from-blue-500 !to-cyan-600 hover:!from-blue-600 hover:!to-cyan-700 !text-white !border-0 !shadow-lg">Salvar</Button>
                      <Button size="sm" variant="outline" onClick={() => { setEditingIndex(null); setEditData(null); }} className="!border-gray-600 !text-gray-300 hover:!text-white hover:!bg-gray-700 !bg-transparent">Cancelar</Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="pr-16">
                      <div className="font-medium mb-3 text-white text-lg">{q.pergunta}</div>
                      <ul className="mb-3 space-y-2">
                        {q.alternativas.map((alt, i) => (
                          <li key={i} className={`p-2 rounded ${alt === q.correta ? 'bg-green-500/20 border border-green-500/30 font-semibold text-green-400' : 'bg-gray-700/50 border border-gray-600 text-gray-300'}`}>
                            <span className="font-medium mr-2">{String.fromCharCode(65 + i)}.</span> {alt}
                          </li>
                        ))}
                      </ul>
                      <div className="text-sm text-gray-400 bg-gray-700/30 p-2 rounded">
                        <span className="font-medium">Correta:</span> {q.correta}
                      </div>
                    </div>
                    <div className="absolute top-3 right-3 flex gap-1">
                      <Button size="icon" variant="ghost" onClick={() => handleEdit(idx)} className="!text-orange-400 hover:!text-orange-300 hover:!bg-gray-700 !h-8 !w-8">
                        <span className="sr-only">Editar</span>✏️
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => handleDelete(idx)} className="!text-red-400 hover:!text-red-300 hover:!bg-gray-700 !h-8 !w-8">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </>
                )}
              </div>
            ))}
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleAdd} className="!border-gray-600 !text-gray-300 hover:!text-white hover:!bg-gray-700 !bg-transparent">
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Pergunta
              </Button>
              <Button variant="secondary" size="sm" onClick={handleGenerateWithAI} className="!bg-gray-700 !text-gray-300 hover:!text-white hover:!bg-gray-600">
                Gerar perguntas com IA
              </Button>
            </div>
            <div className="flex justify-end gap-2 pt-4 border-t border-gray-700">
              <Button variant="outline" onClick={() => onOpenChange(false)} className="!border-gray-600 !text-gray-300 hover:!text-white hover:!bg-gray-700 !bg-transparent">
                Cancelar
              </Button>
              <Button onClick={handleSaveQuiz} disabled={!canSave} className="!bg-gradient-to-r !from-blue-500 !to-cyan-600 hover:!from-blue-600 hover:!to-cyan-700 !text-white !border-0 !shadow-lg">
                Salvar Quiz
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
