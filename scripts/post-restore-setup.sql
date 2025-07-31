-- Script para configurar o novo projeto após a restauração
-- Execute este script no novo projeto após a clonagem

-- 1. Desabilitar extensões críticas que podem causar problemas
-- pg_net (operações HTTP externas)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_net') THEN
        -- Desabilitar pg_net
        PERFORM pg_net.disable();
        RAISE NOTICE 'pg_net desabilitado com sucesso';
    ELSE
        RAISE NOTICE 'pg_net não encontrado';
    END IF;
END $$;

-- pg_cron (agendamento de tarefas)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
        -- Desabilitar pg_cron
        PERFORM cron.disable();
        RAISE NOTICE 'pg_cron desabilitado com sucesso';
    ELSE
        RAISE NOTICE 'pg_cron não encontrado';
    END IF;
END $$;

-- 2. Verificar e limpar dados de teste/sensíveis
-- Limpar logs de autenticação antigos (opcional)
DELETE FROM auth_audit_logs 
WHERE created_at < NOW() - INTERVAL '30 days';

-- Limpar tentativas de login antigas
DELETE FROM auth_login_attempts 
WHERE last_attempt < NOW() - INTERVAL '30 days';

-- 3. Verificar integridade dos dados restaurados
SELECT 
    'Verificação de Integridade' as check_type,
    COUNT(*) as total_companies,
    COUNT(CASE WHEN is_active = true THEN 1 END) as active_companies
FROM companies;

SELECT 
    'Verificação de Usuários' as check_type,
    COUNT(*) as total_users,
    COUNT(CASE WHEN is_active = true THEN 1 END) as active_users
FROM company_users;

SELECT 
    'Verificação de Cursos' as check_type,
    COUNT(*) as total_courses,
    COUNT(CASE WHEN is_published = true THEN 1 END) as published_courses
FROM courses;

-- 4. Verificar RLS (Row Level Security)
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled,
    CASE 
        WHEN rowsecurity = true THEN '✅ RLS Ativo'
        ELSE '⚠️ RLS Desabilitado - Verificar'
    END as status
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN (
    'companies', 'company_users', 'courses', 'lessons', 
    'enrollments', 'lesson_progress', 'mentorship_sessions'
)
ORDER BY tablename;

-- 5. Verificar políticas RLS
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'public'
AND tablename IN ('companies', 'company_users', 'courses', 'lessons')
ORDER BY tablename, policyname;

-- 6. Verificar índices importantes
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes 
WHERE schemaname = 'public'
AND tablename IN ('companies', 'company_users', 'courses', 'lessons')
ORDER BY tablename, indexname;

-- 7. Verificar configurações de autenticação
SELECT 
    'Auth Config' as check_type,
    'Verificar configurações de email, SMTP, etc.' as instruction;

-- 8. Verificar webhooks e integrações
SELECT 
    'Webhooks' as check_type,
    COUNT(*) as total_events,
    'Atualizar endpoints para novo projeto' as instruction
FROM stripe_webhook_events;

-- 9. Verificar configurações de AI
SELECT 
    'AI Configurations' as check_type,
    COUNT(*) as total_configs,
    COUNT(CASE WHEN is_active = true THEN 1 END) as active_configs
FROM ai_configurations;

-- 10. Verificar Edge Functions (se aplicável)
SELECT 
    'Edge Functions' as check_type,
    'Verificar se todas as functions estão funcionando' as instruction;

-- 11. Atualizar estatísticas do banco
ANALYZE;

-- 12. Verificar tamanho do banco restaurado
SELECT 
    pg_size_pretty(pg_database_size(current_database())) as database_size,
    pg_size_pretty(pg_total_relation_size('companies')) as companies_size,
    pg_size_pretty(pg_total_relation_size('company_users')) as users_size,
    pg_size_pretty(pg_total_relation_size('courses')) as courses_size,
    pg_size_pretty(pg_total_relation_size('lessons')) as lessons_size;

-- 13. Checklist pós-restauração
SELECT 
    'CHECKLIST PÓS-RESTAURAÇÃO' as section,
    '1. ✅ Extensões críticas desabilitadas' as item
UNION ALL
SELECT 
    'CHECKLIST PÓS-RESTAURAÇÃO' as section,
    '2. ✅ Dados de integridade verificados' as item
UNION ALL
SELECT 
    'CHECKLIST PÓS-RESTAURAÇÃO' as section,
    '3. ✅ RLS verificado' as item
UNION ALL
SELECT 
    'CHECKLIST PÓS-RESTAURAÇÃO' as section,
    '4. ⚠️ Atualizar variáveis de ambiente' as item
UNION ALL
SELECT 
    'CHECKLIST PÓS-RESTAURAÇÃO' as section,
    '5. ⚠️ Atualizar webhook endpoints' as item
UNION ALL
SELECT 
    'CHECKLIST PÓS-RESTAURAÇÃO' as section,
    '6. ⚠️ Testar Edge Functions' as item
UNION ALL
SELECT 
    'CHECKLIST PÓS-RESTAURAÇÃO' as section,
    '7. ⚠️ Configurar monitoramento' as item
UNION ALL
SELECT 
    'CHECKLIST PÓS-RESTAURAÇÃO' as section,
    '8. ⚠️ Configurar backups' as item;

-- 14. Comandos para verificar extensões desabilitadas
SELECT 
    'Verificação Final' as check_type,
    extname as extension_name,
    CASE 
        WHEN extname IN ('pg_net', 'pg_cron') THEN '❌ DEVE ESTAR DESABILITADA'
        ELSE '✅ OK'
    END as status
FROM pg_extension 
WHERE extname IN ('pg_net', 'pg_cron', 'wrappers', 'http', 'dblink'); 