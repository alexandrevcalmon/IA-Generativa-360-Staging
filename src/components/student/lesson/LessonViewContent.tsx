
import { useState, useMemo, useEffect, useRef } from 'react';
import { LessonHeader } from './LessonHeader';
import { LessonVideoSection } from './LessonVideoSection';
import { LessonContent } from './LessonContent';
import { LessonSidebar } from './LessonSidebar';
import { AIChatWidget } from '@/components/lesson/AIChatWidget';
import { StudentLesson, StudentCourse } from '@/hooks/useStudentCourses';
import { useLessonQuizzes, useLessonQuizAttempts, useRegisterQuizAttempt } from '@/hooks/useQuizzes';
import { Button } from '@/components/ui/button';
import { useUpdateLessonProgress } from '@/hooks/progress/useUpdateLessonProgress';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface LessonViewContentProps {
  currentLesson: any;
  course: StudentCourse;
  courseId: string;
  currentModule?: { title: string } | null;
  prevLesson?: { id: string; title: string };
  nextLesson?: { id: string; title: string };
  companyId: string;
}

export const LessonViewContent = ({
  currentLesson,
  course,
  courseId,
  currentModule,
  prevLesson,
  nextLesson,
  companyId
}: LessonViewContentProps) => {
  const navigate = useNavigate();
  const { user, userRole } = useAuth();
  const [watchTime, setWatchTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [quizModalOpen, setQuizModalOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  // Detectar se é mobile
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024; // lg breakpoint
      setIsMobile(mobile);
      console.log('[LessonViewContent] Mobile detection:', { 
        windowWidth: window.innerWidth, 
        isMobile: mobile 
      });
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  // Buscar quizzes da aula atual
  const { data: quizzes = [], isLoading: quizzesLoading } = useLessonQuizzes(currentLesson.id);
  // Buscar todas as tentativas do usuário para todos os quizzes da aula atual (hook customizado)
  const { data: allAttempts = [] } = useLessonQuizAttempts(currentLesson.id);
  // Montar quizzesByLesson como objeto { [lessonId]: quizzes[] }
  const quizzesByLesson = { [currentLesson.id]: quizzes };
  const quiz = useMemo(() => quizzes[0], [quizzes]); // Considera apenas o primeiro quiz por aula
  // Busca a última tentativa do quiz atual, se houver
  const lastAttempt = useMemo(() => {
    if (!quiz) return null;
    const attempts = allAttempts.filter((a: any) => a.quiz_id === quiz.id);
    if (!attempts.length) return null;
    // Ordena por attempt_number desc
    return attempts.slice().sort((a: any, b: any) => (b.attempt_number || 0) - (a.attempt_number || 0))[0];
  }, [quiz, allAttempts]);
  const registerQuizAttempt = useRegisterQuizAttempt();
  const updateLessonProgress = useUpdateLessonProgress();

  const [quizAnswers, setQuizAnswers] = useState<any>({});
  const [quizSubmitting, setQuizSubmitting] = useState(false);
  const [quizError, setQuizError] = useState<string | null>(null);
  const [quizResult, setQuizResult] = useState<null | { score: number; passed: boolean }>(null);

  const handleQuizAnswerChange = (questionIdx: number, value: string) => {
    setQuizAnswers((prev: any) => ({ ...prev, [questionIdx]: value }));
  };

  const handleQuizRealSubmit = () => {
    if (!quiz) return;
    setQuizSubmitting(true);
    setQuizError(null);
    // Corrigir: checar se todas as perguntas foram respondidas
    if (quiz.questions.some((_: any, idx: number) => !quizAnswers[idx])) {
      setQuizError('Responda todas as perguntas antes de enviar.');
      setQuizSubmitting(false);
      return;
    }
    // Corrigir: calcular score real
    let correctAnswers = 0;
    quiz.questions.forEach((q: any, idx: number) => {
      if (quizAnswers[idx] === q.correta) correctAnswers++;
    });
    const score = (correctAnswers / quiz.questions.length) * 100;
    const passed = score >= 75;
    setQuizResult({ score, passed });
    handleQuizSubmit(quizAnswers, correctAnswers, quiz.questions.length);
    // NOVO: Se passou no quiz e progresso >= 95%, marca aula como concluída
    if (passed && progressPercentage >= 95) {
      updateLessonProgress.mutate({ lessonId: currentLesson.id, completed: true });
    }
    setQuizSubmitting(false);
    setQuizAnswers({});
  };

  const handleCloseQuizModal = () => {
    setQuizModalOpen(false);
    setQuizAnswers({});
    setQuizError(null);
    setQuizResult(null);
  };

  // Progresso do vídeo
  const progressPercentage = duration > 0 ? (watchTime / duration) * 100 : 0;
  const quizEnabled = progressPercentage >= 95;
  const quizPassed = lastAttempt?.passed;
  const quizScore = lastAttempt?.score || 0;

  // Aula só pode ser considerada concluída para avanço se progresso local >= 95% e (quiz aprovado ou não houver quiz)
  // Nunca dependa apenas de currentLesson.completed do backend para liberar o botão de próxima aula!
  const lessonReallyCompleted = (progressPercentage >= 95) && (!quiz || quizPassed);

  // Handler para submissão do quiz (simulação, adapte para seu fluxo real)
  const handleQuizSubmit = (answers: any, correctAnswers: number, totalQuestions: number) => {
    const score = (correctAnswers / totalQuestions) * 100;
    const passed = score >= 75;
    registerQuizAttempt.mutate({
      lesson_id: currentLesson.id,
      quiz_id: quiz.id,
      score,
      total_questions: totalQuestions,
      correct_answers: correctAnswers,
      answers,
      passed,
    }, {
      onSuccess: () => {
        setQuizModalOpen(false);
        if (passed) {
          // Só marca como concluída se quiz foi aprovado
          if (progressPercentage >= 95) {
            updateLessonProgress.mutate({ lessonId: currentLesson.id, completed: true });
          }
        } else {
          // Reverter conclusão da aula
          updateLessonProgress.mutate({ lessonId: currentLesson.id, completed: false });
          toast.error('Você não atingiu 75% de acerto. Assista novamente a aula e refaça o quiz.');
        }
      }
    });
  };

  // Corrige erro: define handleTimeUpdate
  const handleTimeUpdate = (currentTime: number, videoDuration: number) => {
    setWatchTime(currentTime);
    setDuration(videoDuration);
  };

  // Convert lesson to StudentLesson format for components
  const studentLesson: StudentLesson = {
    ...currentLesson,
    completed: currentLesson.completed || false,
    watch_time_seconds: currentLesson.watch_time_seconds || 0,
    video_file_url: currentLesson.video_file_url || null,
    material_url: currentLesson.material_url || null,
    // Garantir que os campos do Bunny.net sejam incluídos
    bunny_video_id: currentLesson.bunny_video_id,
    bunny_library_id: currentLesson.bunny_library_id,
    bunny_video_status: currentLesson.bunny_video_status,
    bunny_embed_url: currentLesson.bunny_embed_url,
  };

  console.log('[LessonViewContent] Current lesson data:', {
    id: currentLesson.id,
    title: currentLesson.title,
    bunny_video_id: currentLesson.bunny_video_id,
    bunny_library_id: currentLesson.bunny_library_id,
    bunny_video_status: currentLesson.bunny_video_status,
    bunny_embed_url: currentLesson.bunny_embed_url,
    video_url: currentLesson.video_url,
    video_file_url: currentLesson.video_file_url
  });

  console.log('[LessonViewContent] Student lesson data:', {
    id: studentLesson.id,
    title: studentLesson.title,
    bunny_video_id: studentLesson.bunny_video_id,
    bunny_library_id: studentLesson.bunny_library_id,
    bunny_video_status: studentLesson.bunny_video_status,
    bunny_embed_url: studentLesson.bunny_embed_url,
    video_url: studentLesson.video_url,
    video_file_url: studentLesson.video_file_url
  });

  // Definir bloqueio de avanço - sempre liberado
  const nextLessonBlocked = false;
  // Remover completamente nextLessonBlockedAction (não declarar nem usar)
  // O botão do quiz deve aparecer se: há quiz, progresso >= 95%, e ainda não passou no quiz
  const showQuizButton = quiz && quizEnabled && !quizPassed;
  const nextLessonBlockedAction = showQuizButton ? (
    <Button size="sm" className="bg-blue-600 text-white" onClick={() => setQuizModalOpen(true)}>
      Responder Quiz
    </Button>
  ) : null;

  // Adicionar estado para modal de revisão
  const [reviewQuizModalOpen, setReviewQuizModalOpen] = useState(false);

  // Função para abrir modal de revisão
  const handleOpenReviewQuiz = () => {
    setReviewQuizModalOpen(true);
  };
  const handleCloseReviewQuiz = () => {
    setReviewQuizModalOpen(false);
  };

  // Botão Revisar Quiz (aparece se quiz aprovado)
  const showReviewQuizButton = quiz && quizPassed;

  // Ref para controlar se o toast já foi exibido para esta aula
  const completionToastShownRef = useRef<string | null>(null);

  // Log para debug dos dados de navegação
  console.log('[LessonViewContent] Navigation data:', {
    prevLesson,
    nextLesson,
    currentLessonId: currentLesson.id,
    courseId
  });

  useEffect(() => {
    if (lessonReallyCompleted && completionToastShownRef.current !== currentLesson.id) {
      toast.success('Aula concluída! Parabéns! Você completou esta aula.', {
        id: 'lesson-completed-toast',
        duration: 5000,
      });
      completionToastShownRef.current = currentLesson.id;
    }
  }, [lessonReallyCompleted, currentLesson.id]);

  useEffect(() => {
    // Remover bloqueio de navegação sequencial
    // (não faz mais nada aqui)
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 max-w-full overflow-x-hidden">
      {/* Header */}
      <LessonHeader 
        currentLesson={studentLesson} 
        course={course} 
        courseId={courseId}
        currentModule={currentModule}
      />

      {/* Main Content */}
      <div className="w-full px-3 sm:px-4 lg:px-6 py-3 sm:py-4 lg:py-6">
        <div className="max-w-7xl mx-auto">
          {console.log('[LessonViewContent] Rendering layout:', { isMobile })}
          
          {/* Mobile Layout - Stack vertically */}
          {isMobile && (
            <div className="space-y-4">
              {console.log('[LessonViewContent] Rendering MOBILE layout')}
              {/* Video Section - Ajustado para melhor responsividade */}
              <div className="w-full overflow-hidden">
                <LessonVideoSection
                  currentLesson={studentLesson}
                  course={course}
                  onTimeUpdate={handleTimeUpdate}
                />
              </div>
              
              {/* Progress and Navigation - Mobile optimized */}
              <div className="w-full">
                <LessonSidebar
                  currentLesson={studentLesson}
                  courseId={courseId}
                  watchTime={watchTime}
                  duration={duration}
                  prevLesson={prevLesson}
                  nextLesson={nextLesson}
                  nextLessonBlocked={nextLessonBlocked}
                  quizzesByLesson={quizzesByLesson}
                  allAttempts={allAttempts}
                />
              </div>
              
              {/* Content */}
              <div className="w-full">
                <LessonContent 
                  currentLesson={studentLesson} 
                  currentModule={currentModule}
                />
              </div>
            </div>
          )}

          {/* Desktop Layout - Grid */}
          {!isMobile && (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 lg:gap-6">
              {console.log('[LessonViewContent] Rendering DESKTOP layout')}
              {/* Main Content - Left side */}
              <div className="lg:col-span-3 space-y-4 lg:space-y-6">
                <LessonVideoSection
                  currentLesson={studentLesson}
                  course={course}
                  onTimeUpdate={handleTimeUpdate}
                />
                
                <LessonContent 
                  currentLesson={studentLesson} 
                  currentModule={currentModule}
                />
              </div>

              {/* Sidebar - Right side */}
              <div className="lg:col-span-1">
                <LessonSidebar
                  currentLesson={studentLesson}
                  courseId={courseId}
                  watchTime={watchTime}
                  duration={duration}
                  prevLesson={prevLesson}
                  nextLesson={nextLesson}
                  nextLessonBlocked={nextLessonBlocked}
                  quizzesByLesson={quizzesByLesson}
                  allAttempts={allAttempts}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quiz Modal - Responsive */}
      {quizModalOpen && quiz && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900/95 p-4 sm:p-6 rounded-lg shadow-lg w-full max-w-4xl border border-gray-700 max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg sm:text-xl font-bold mb-4 text-white">Quiz da Aula</h2>
            <div className="max-h-[70vh] overflow-y-auto pr-2">
              {quizResult ? (
                <div className="flex flex-col items-center justify-center gap-4 py-6">
                  <div className={`text-2xl sm:text-3xl font-bold ${quizResult.passed ? 'text-emerald-400' : 'text-red-400'}`}>{quizResult.score.toFixed(0)}%</div>
                  <div className="text-base sm:text-lg font-medium text-center text-gray-300 px-4">
                    {quizResult.passed ? (
                      <>
                        Parabéns! Você atingiu o percentual necessário e pode avançar para a próxima aula.
                      </>
                    ) : (
                      <>
                        Você não atingiu 75% de acerto.<br />Assista novamente a aula e tente o quiz de novo.
                      </>
                    )}
                  </div>
                  <Button className="mt-2 !bg-gradient-to-r !from-emerald-500 !to-green-600 hover:!from-emerald-600 hover:!to-green-700 !text-white !border-0 !shadow-lg" onClick={handleCloseQuizModal}>Fechar</Button>
                </div>
              ) : (
                <form onSubmit={e => { e.preventDefault(); handleQuizRealSubmit(); }}>
                  <div className="space-y-4 sm:space-y-6">
                    {quiz.questions.map((q: any, idx: number) => (
                      <div key={idx} className="border border-gray-600 rounded-lg p-3 sm:p-4 bg-gray-800/50 relative">
                        <div className="pr-12 sm:pr-16">
                          <div className="font-medium mb-3 text-white text-base sm:text-lg">{idx + 1}. {q.pergunta}</div>
                          <div className="space-y-2">
                            {q.alternativas.map((alt: string, altIdx: number) => (
                              <label key={altIdx} className={`flex items-center gap-3 cursor-pointer p-2 sm:p-3 rounded transition-colors ${
                                quizAnswers[idx] === alt 
                                  ? 'bg-blue-500/20 border border-blue-500/30' 
                                  : 'bg-gray-700/50 border border-gray-600 hover:bg-gray-700/70'
                              }`}>
                                <input
                                  type="radio"
                                  name={`question-${idx}`}
                                  value={alt}
                                  checked={quizAnswers[idx] === alt}
                                  onChange={() => handleQuizAnswerChange(idx, alt)}
                                  className="accent-blue-500"
                                />
                                <span className="font-medium mr-2 text-gray-300">{String.fromCharCode(65 + altIdx)}.</span>
                                <span className="text-gray-300 text-sm sm:text-base">{alt}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  {quizError && <div className="text-red-400 text-sm mb-4 mt-4 bg-red-500/10 p-3 rounded border border-red-500/30">{quizError}</div>}
                  <div className="flex flex-col sm:flex-row justify-end gap-2 mt-6 pt-4 border-t border-gray-700">
                    <Button type="button" variant="outline" className="!border-gray-600 !text-gray-300 hover:!text-white hover:!bg-gray-700 !bg-transparent order-2 sm:order-1" onClick={handleCloseQuizModal}>Cancelar</Button>
                    <Button type="submit" className="!bg-gradient-to-r !from-blue-500 !to-cyan-600 hover:!from-blue-600 hover:!to-cyan-700 !text-white !border-0 !shadow-lg order-1 sm:order-2" disabled={quizSubmitting}>Enviar Respostas</Button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* AI Chat Widget */}
      <AIChatWidget
        lessonId={currentLesson.id}
        companyId={companyId}
      />

      {/* Modal de Revisão do Quiz - Responsive */}
      {reviewQuizModalOpen && quiz && lastAttempt && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900/95 p-4 sm:p-6 rounded-lg shadow-lg w-full max-w-lg border border-slate-700/50">
            <h2 className="text-lg sm:text-xl font-bold mb-4 text-white">Revisão do Quiz</h2>
            <div className="max-h-[70vh] overflow-y-auto pr-2">
              {quiz.questions.map((q: any, idx: number) => (
                <div key={idx} className="mb-4">
                  <div className="font-medium mb-2 text-white text-sm sm:text-base">{idx + 1}. {q.pergunta}</div>
                  <div className="space-y-2">
                    {q.alternativas.map((alt: string, altIdx: number) => {
                      const isSelected = lastAttempt.answers && lastAttempt.answers[idx] === alt;
                      const isCorrect = q.correta === alt;
                      return (
                        <div key={altIdx} className={`flex items-center gap-2 p-1 sm:p-2 rounded ${isCorrect ? 'bg-emerald-500/20' : isSelected ? 'bg-blue-500/20' : 'bg-slate-800/50'}`}>
                          <input
                            type="radio"
                            name={`review-question-${idx}`}
                            value={alt}
                            checked={isSelected}
                            readOnly
                            disabled
                            className="accent-emerald-500"
                          />
                          <span className={`text-sm sm:text-base ${isCorrect ? 'font-semibold text-emerald-300' : isSelected ? 'font-semibold text-blue-300' : 'text-slate-300'}`}>{alt}</span>
                          {isCorrect && <span className="ml-2 text-emerald-400 text-xs">Correta</span>}
                          {isSelected && !isCorrect && <span className="ml-2 text-blue-400 text-xs">Sua resposta</span>}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-end mt-4">
              <Button onClick={handleCloseReviewQuiz} variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-800/50">Fechar</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
