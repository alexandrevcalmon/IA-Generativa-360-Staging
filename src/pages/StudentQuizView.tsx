import { useParams, useNavigate } from 'react-router-dom';
import { useQuizById, useRegisterQuizAttempt, useLastUserQuizAttempt } from '@/hooks/useQuizzes';
import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useLesson } from '@/hooks/useLessons';
import { awardPointsToStudent } from '@/hooks/gamification/useStudentPoints';
import { GAMIFICATION_RULES } from '@/hooks/gamification/gamificationRules';
import { useStudentProfile } from '@/hooks/useStudentProfile';
import { PageLayout } from '@/components/PageLayout';
import { ArrowLeft } from 'lucide-react';

export default function StudentQuizView() {
  const { courseId, quizId, lessonId } = useParams();
  const navigate = useNavigate();
  const { data: quiz, isLoading } = useQuizById(quizId!);
  const { data: lesson } = useLesson(quiz?.lesson_id || lessonId || '');
  const { data: lastAttempt } = useLastUserQuizAttempt(quizId!, quiz?.lesson_id);
  const registerQuizAttempt = useRegisterQuizAttempt();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { data: studentProfile } = useStudentProfile();
  const [answers, setAnswers] = useState<any>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<null | { score: number; passed: boolean }>(null);

  if (isLoading) {
    return (
      <PageLayout
        title="Carregando..."
        subtitle="Preparando o quiz"
        background="dark"
      >
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-white">Carregando quiz...</div>
        </div>
      </PageLayout>
    );
  }
  
  if (!quiz) {
    return (
      <PageLayout
        title="Quiz não encontrado"
        subtitle="O quiz solicitado não foi encontrado"
        background="dark"
        headerContent={
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="text-slate-300 hover:bg-slate-800/50">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
        }
      >
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-white">Quiz não encontrado.</div>
        </div>
      </PageLayout>
    );
  }

  const handleAnswerChange = (idx: number, value: string) => {
    setAnswers((prev: any) => ({ ...prev, [idx]: value }));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError(null);
    if (quiz.questions.some((_: any, idx: number) => !answers[idx])) {
      setError('Responda todas as perguntas antes de enviar.');
      setSubmitting(false);
      return;
    }
    let correctAnswers = 0;
    quiz.questions.forEach((q: any, idx: number) => {
      if (answers[idx] === q.correta) correctAnswers++;
    });
    const score = (correctAnswers / quiz.questions.length) * 100;
    const passed = score >= (quiz.passing_score || 75);
    setResult({ score, passed });
    registerQuizAttempt.mutate({
      lesson_id: quiz.lesson_id,
      quiz_id: quizId!,
      score,
      total_questions: quiz.questions.length,
      correct_answers: correctAnswers,
      answers,
      passed,
    }, {
      onSuccess: async () => {
        toast.success(passed ? 'Quiz aprovado!' : 'Você não atingiu a pontuação mínima.');
        setSubmitting(false);
        // Atribuir pontos apenas na primeira aprovação do quiz
        if (passed && studentProfile?.id) {
          await awardPointsToStudent({
            studentId: studentProfile.id,
            points: GAMIFICATION_RULES.quiz_passed,
            actionType: 'quiz_passed',
            description: `Quiz aprovado: ${quiz.title}`,
            referenceId: quizId!,
            meta: { lesson_id: quiz.lesson_id, score },
            uniquePerReference: true
          });
        }
        // Forçar atualização dos dados de tentativas e cursos
        queryClient.invalidateQueries({ queryKey: ['all-quiz-attempts'] });
        queryClient.invalidateQueries({ queryKey: ['student-courses'] });
        queryClient.invalidateQueries({ queryKey: ['enrollment'] });
        queryClient.invalidateQueries({ queryKey: ['lessons-progress'] });
        // NOVO: invalidar tentativas do quiz da lesson atual
        queryClient.invalidateQueries({ queryKey: ['quiz_attempts', 'lesson', user?.id, quiz.lesson_id] });
      },
      onError: (err: any) => {
        setError(err.message);
        setSubmitting(false);
      }
    });
  };

  const handleNext = () => {
    // Navegar para a próxima aula/quizz
    navigate(`/student/courses/${courseId}`); // TODO: ajustar para próxima aula real
  };

  // Função utilitária para limpar o título/descrição do quiz
  function getCleanQuizText(text: string, lessonTitle?: string) {
    if (!text) return '';
    let clean = text;
    clean = clean.replace(/^Quiz da aula:\s*/i, '');
    if (lessonTitle && clean.startsWith(lessonTitle)) {
      clean = clean.slice(lessonTitle.length).trim();
      clean = clean.replace(/^[:\-\s]+/, '');
    }
    return clean.trim();
  }

  const cleanQuizTitle = getCleanQuizText(quiz.title, lesson?.title);

  function getCleanQuizDescription(description: string, lessonTitle?: string) {
    if (!description) return '';
    let clean = description.trim();
    if (lessonTitle && clean.startsWith(lessonTitle)) {
      clean = clean.slice(lessonTitle.length).trim();
      clean = clean.replace(/^[:\-\s]+/, '');
    }
    return clean.trim();
  }
  function isGenericDescription(desc: string) {
    if (!desc) return false;
    const normalized = desc.trim().toLowerCase();
    // Remove acentos para comparar
    const semAcento = normalized.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    // Regex para pegar qualquer frase que comece com 'conheca alexandre'
    return /^conheca alexandre(\s|$)/.test(semAcento);
  }
  function isRedundantDescription(quizDesc: string, lessonDesc?: string) {
    if (!quizDesc || !lessonDesc) return false;
    const normalize = (str: string) => str.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const q = normalize(quizDesc);
    const l = normalize(lessonDesc);
    return q === l || q.startsWith(l);
  }
  const cleanQuizDescription = getCleanQuizDescription(quiz.description, lesson?.title);

  function getFinalQuizDescription(quizDesc: string, lessonDesc?: string) {
    if (!quizDesc) return '';
    if (!lessonDesc) return quizDesc.trim();
    // Normaliza para comparar
    const normalize = (str: string) => str.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    let q = quizDesc.trim();
    const l = lessonDesc.trim();
    if (normalize(q).startsWith(normalize(l))) {
      // Remove a descrição da aula do início, junto com vírgula, ponto, dois pontos, etc
      q = q.slice(l.length).replace(/^\s*[,.:;-]?\s*/, '');
    }
    return q.trim();
  }
  const finalQuizDescription = getFinalQuizDescription(cleanQuizDescription, lesson?.description);

  function isRelevantDescription(desc: string) {
    if (!desc) return false;
    // Remove pontuação e espaços
    const cleaned = desc.replace(/^[,.:;\-\s]+|[,.:;\-\s]+$/g, '');
    // Só exibe se tiver pelo menos 10 caracteres alfanuméricos
    return cleaned.replace(/[^a-zA-Z0-9]/g, '').length >= 10;
  }

  return (
    <PageLayout
      title={lesson?.title ? `Quiz: ${lesson.title}` : 'Quiz da Aula'}
      subtitle="Responda às questões para avaliar seu conhecimento"
      background="dark"
      headerContent={
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="text-slate-300 hover:bg-slate-800/50">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
      }
    >
      <div className="max-w-4xl mx-auto">
        <div className="bg-gray-900/50 border border-gray-700 rounded-lg shadow-xl p-8">
          {lastAttempt && (
            <div className="mb-6 p-4 bg-gray-800/50 border border-gray-600 rounded-lg">
              <span className="font-medium text-white">Status: </span>
              <span className={lastAttempt.passed ? 'text-emerald-400 font-semibold' : 'text-red-400 font-semibold'}>
                {lastAttempt.passed ? 'Aprovado' : 'Não Aprovado'}
              </span>
              {typeof lastAttempt.score === 'number' && (
                <span className="ml-2 text-gray-300">Pontuação: {lastAttempt.score.toFixed(0)}%</span>
              )}
            </div>
          )}
        
          {!result ? (
            <form onSubmit={e => { e.preventDefault(); handleSubmit(); }}>
              <div className="space-y-6">
                {quiz.questions.map((q: any, idx: number) => (
                  <div key={idx} className="border border-gray-600 rounded p-4 bg-gray-800/50 relative">
                    <div className="pr-16">
                      <div className="font-medium mb-3 text-white text-lg">{idx + 1}. {q.pergunta}</div>
                      <div className="space-y-2">
                        {q.alternativas.map((alt: string, altIdx: number) => (
                          <label key={altIdx} className={`flex items-center gap-3 cursor-pointer p-2 rounded transition-colors ${
                            answers[idx] === alt 
                              ? 'bg-blue-500/20 border border-blue-500/30' 
                              : 'bg-gray-700/50 border border-gray-600 hover:bg-gray-700/70'
                          }`}>
                            <input
                              type="radio"
                              name={`question-${idx}`}
                              value={alt}
                              checked={answers[idx] === alt}
                              onChange={() => handleAnswerChange(idx, alt)}
                              className="accent-blue-500"
                            />
                            <span className="font-medium mr-2 text-gray-300">{String.fromCharCode(65 + altIdx)}.</span>
                            <span className="text-gray-300">{alt}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {error && <div className="text-red-400 text-sm mb-4 mt-4 bg-red-500/10 p-3 rounded border border-red-500/30">{error}</div>}
              <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-gray-700">
                <Button 
                  type="submit" 
                  className="!bg-gradient-to-r !from-blue-500 !to-cyan-600 hover:!from-blue-600 hover:!to-cyan-700 !text-white !border-0 !shadow-lg" 
                  disabled={submitting}
                >
                  Enviar Respostas
                </Button>
              </div>
            </form>
          ) : (
            <div className="flex flex-col items-center gap-4 py-6">
              <div className={`text-2xl font-bold ${result.passed ? 'text-emerald-400' : 'text-red-400'}`}>{result.score.toFixed(0)}%</div>
              <div className="text-lg font-medium text-center text-gray-300">
                {result.passed ? (
                  <>Parabéns! Você atingiu o percentual necessário e pode avançar para a próxima aula.</>
                ) : (
                  <>Você não atingiu a pontuação mínima.<br />Tente novamente.</>
                )}
              </div>
              {result.passed && (
                <Button 
                  className="mt-2 !bg-gradient-to-r !from-emerald-500 !to-green-600 hover:!from-emerald-600 hover:!to-green-700 !text-white !border-0 !shadow-lg" 
                  onClick={handleNext}
                >
                  Próxima Aula
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  );
}
