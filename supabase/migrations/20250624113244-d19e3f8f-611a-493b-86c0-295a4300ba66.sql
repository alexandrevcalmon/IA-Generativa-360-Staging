
-- LIMPEZA COMPLETA DO BANCO DE DADOS - VERSÃO CORRIGIDA
-- ATENÇÃO: Esta operação é IRREVERSÍVEL e apagará TODOS os dados exceto produtores ativos

-- ETAPA 1: LIMPEZA DE DADOS DERIVADOS E ESTATÍSTICAS
-- Limpar dados de atividade e estatísticas dos colaboradores
DELETE FROM public.collaborator_activity_stats;
DELETE FROM public.collaborator_activity_logs;

-- Limpar dados de gamificação
DELETE FROM public.student_achievements;
DELETE FROM public.points_history;
DELETE FROM public.student_points;

-- Limpar progresso de lições e matrículas
DELETE FROM public.lesson_progress;
DELETE FROM public.enrollments;

-- Limpar dados de quiz
DELETE FROM public.quiz_attempts;

-- Limpar certificados
DELETE FROM public.certificates;

-- ETAPA 2: LIMPEZA DE DADOS DE COMUNIDADE
-- Limpar likes primeiro (para evitar problemas de FK)
DELETE FROM public.community_topic_likes;
DELETE FROM public.community_reply_likes;

-- Limpar respostas da comunidade
DELETE FROM public.community_replies;

-- Limpar tópicos da comunidade
DELETE FROM public.community_topics;

-- ETAPA 3: LIMPEZA DE DADOS DE MENTORIA
-- Limpar participantes de mentoria
DELETE FROM public.mentorship_participants;
DELETE FROM public.mentorship_attendees;
DELETE FROM public.producer_mentorship_participants;

-- Limpar sessões de mentoria
DELETE FROM public.mentorship_sessions;
DELETE FROM public.mentorships;
DELETE FROM public.producer_mentorship_sessions;

-- ETAPA 4: LIMPEZA DE DADOS DE CALENDÁRIO E MENSAGENS
DELETE FROM public.calendar_events;
DELETE FROM public.company_messages;

-- ETAPA 5: LIMPEZA DE DADOS DE CHAT IA
DELETE FROM public.ai_chat_messages;
DELETE FROM public.ai_chat_sessions;

-- ETAPA 6: LIMPEZA DE ESTRUTURA DE CURSOS
-- Limpar materiais de lições
DELETE FROM public.lesson_materials;

-- Limpar discussões e respostas
DELETE FROM public.discussion_replies;
DELETE FROM public.discussions;

-- Limpar quizzes
DELETE FROM public.quizzes;

-- Limpar lições
DELETE FROM public.lessons;

-- Limpar módulos dos cursos
DELETE FROM public.course_modules;

-- Limpar cursos
DELETE FROM public.courses;

-- ETAPA 7: LIMPEZA DE LEARNING PATHS
DELETE FROM public.learning_path_courses;
DELETE FROM public.learning_paths;

-- ETAPA 8: LIMPEZA DE DADOS DE USUÁRIOS
-- Limpar colaboradores das empresas
DELETE FROM public.company_users;

-- Limpar empresas (mas manter planos de assinatura)
DELETE FROM public.companies;

-- ETAPA 9: LIMPEZA DE DADOS DE AUTENTICAÇÃO
-- Remover profiles de usuários específicos (manter produtores essenciais)
DELETE FROM public.profiles 
WHERE id NOT IN (
  SELECT auth_user_id FROM public.producers WHERE is_active = true
);

-- Remover usuários do auth.users (manter apenas produtores ativos)
-- ATENÇÃO: Esta operação é irreversível e remove usuários do sistema de autenticação
DELETE FROM auth.users 
WHERE id NOT IN (
  SELECT auth_user_id FROM public.producers WHERE is_active = true
);

-- ETAPA 10: VERIFICAÇÃO FINAL
-- Verificar se as tabelas principais estão vazias
SELECT 
  'companies' as tabela, COUNT(*) as registros FROM public.companies
UNION ALL
SELECT 
  'company_users' as tabela, COUNT(*) as registros FROM public.company_users
UNION ALL
SELECT 
  'courses' as tabela, COUNT(*) as registros FROM public.courses
UNION ALL
SELECT 
  'producers' as tabela, COUNT(*) as registros FROM public.producers
UNION ALL
SELECT 
  'profiles' as tabela, COUNT(*) as registros FROM public.profiles
UNION ALL
SELECT 
  'auth_users' as tabela, COUNT(*) as registros FROM auth.users;
