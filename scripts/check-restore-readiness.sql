-- Script para verificar se o projeto está pronto para restauração
-- Execute este script no projeto atual antes de iniciar a restauração

-- 1. Verificar extensões que precisam ser desabilitadas no novo projeto
SELECT 
    extname as extension_name,
    extversion as version,
    CASE 
        WHEN extname IN ('pg_net', 'pg_cron', 'wrappers') 
        THEN '⚠️ DESABILITAR APÓS CLONAGEM'
        ELSE '✅ OK'
    END as status
FROM pg_extension 
WHERE extname IN ('pg_net', 'pg_cron', 'wrappers', 'http', 'dblink');

-- 2. Verificar dados sensíveis que podem estar expostos
SELECT 
    'API Keys em configurações' as check_type,
    COUNT(*) as count,
    'Verificar se há chaves de API armazenadas' as recommendation
FROM ai_configurations 
WHERE api_key_encrypted IS NOT NULL;

-- 3. Verificar webhooks configurados
SELECT 
    'Webhooks Stripe' as check_type,
    COUNT(*) as count,
    'Atualizar endpoints no novo projeto' as recommendation
FROM stripe_webhook_events 
WHERE processed_at > NOW() - INTERVAL '30 days';

-- 4. Verificar integridade dos dados principais
SELECT 
    'companies' as table_name,
    COUNT(*) as record_count,
    COUNT(CASE WHEN is_active = true THEN 1 END) as active_count
FROM companies
UNION ALL
SELECT 
    'company_users' as table_name,
    COUNT(*) as record_count,
    COUNT(CASE WHEN is_active = true THEN 1 END) as active_count
FROM company_users
UNION ALL
SELECT 
    'courses' as table_name,
    COUNT(*) as record_count,
    COUNT(CASE WHEN is_published = true THEN 1 END) as published_count
FROM courses
UNION ALL
SELECT 
    'lessons' as table_name,
    COUNT(*) as record_count,
    COUNT(CASE WHEN video_url IS NOT NULL THEN 1 END) as with_video_count
FROM lessons;

-- 5. Verificar RLS (Row Level Security)
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled,
    CASE 
        WHEN rowsecurity = true THEN '✅ RLS Ativo'
        ELSE '⚠️ RLS Desabilitado'
    END as status
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN (
    'companies', 'company_users', 'courses', 'lessons', 
    'enrollments', 'lesson_progress', 'mentorship_sessions'
)
ORDER BY tablename;

-- 6. Verificar tamanho do banco de dados
SELECT 
    pg_size_pretty(pg_database_size(current_database())) as database_size,
    pg_size_pretty(pg_total_relation_size('companies')) as companies_size,
    pg_size_pretty(pg_total_relation_size('company_users')) as users_size,
    pg_size_pretty(pg_total_relation_size('courses')) as courses_size,
    pg_size_pretty(pg_total_relation_size('lessons')) as lessons_size;

-- 7. Verificar backups disponíveis (se possível)
-- Nota: Esta informação só está disponível via dashboard
SELECT 
    'Backups' as check_type,
    'Verificar no Dashboard: Database > Backups' as instruction,
    'Confirmar se backups físicos estão habilitados' as recommendation;

-- 8. Verificar configurações de autenticação
SELECT 
    'Auth Settings' as check_type,
    'Verificar configurações de email, SMTP, etc.' as instruction,
    'Atualizar no novo projeto se necessário' as recommendation;

-- 9. Verificar Edge Functions
SELECT 
    'Edge Functions' as check_type,
    'Verificar se todas as functions estão funcionando' as instruction,
    'Testar após a clonagem' as recommendation;

-- 10. Resumo de preparação
SELECT 
    'CHECKLIST PRÉ-RESTAURAÇÃO' as section,
    '1. Confirmar plano pago' as item
UNION ALL
SELECT 
    'CHECKLIST PRÉ-RESTAURAÇÃO' as section,
    '2. Verificar backups físicos habilitados' as item
UNION ALL
SELECT 
    'CHECKLIST PRÉ-RESTAURAÇÃO' as section,
    '3. Documentar extensões críticas' as item
UNION ALL
SELECT 
    'CHECKLIST PRÉ-RESTAURAÇÃO' as section,
    '4. Preparar novo nome de projeto' as item
UNION ALL
SELECT 
    'CHECKLIST PRÉ-RESTAURAÇÃO' as section,
    '5. Verificar custos estimados' as item
UNION ALL
SELECT 
    'CHECKLIST PRÉ-RESTAURAÇÃO' as section,
    '6. Fazer backup de configurações importantes' as item; 