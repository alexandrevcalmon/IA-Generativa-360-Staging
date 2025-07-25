#!/bin/bash

# =====================================================
# SCRIPT DE MIGRAÇÃO AUTOMATIZADA: STAGING → PRODUÇÃO
# =====================================================
# Este script automatiza a migração completa do banco de dados
# Execute com cuidado e sempre faça backup antes
# =====================================================

# Configurações - AJUSTE ESTAS VARIÁVEIS
# =====================================================
STAGING_HOST="your-staging-host.supabase.co"
STAGING_DB="postgres"
STAGING_USER="postgres"
STAGING_PASSWORD="your-staging-password"

PRODUCTION_HOST="your-production-host.supabase.co"
PRODUCTION_DB="postgres"
PRODUCTION_USER="postgres"
PRODUCTION_PASSWORD="your-production-password"

BACKUP_DIR="./backup_migracao_$(date +%Y%m%d_%H%M%S)"
EXPORT_DIR="./export_$(date +%Y%m%d_%H%M%S)"

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para log colorido
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}"
}

info() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')] INFO: $1${NC}"
}

# Função para confirmar ação
confirm() {
    read -p "$1 (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        return 0
    else
        return 1
    fi
}

# Verificar dependências
check_dependencies() {
    log "Verificando dependências..."
    
    if ! command -v psql &> /dev/null; then
        error "psql não encontrado. Instale o PostgreSQL client."
        exit 1
    fi
    
    if ! command -v pg_dump &> /dev/null; then
        error "pg_dump não encontrado. Instale o PostgreSQL client."
        exit 1
    fi
    
    log "Dependências verificadas com sucesso."
}

# Criar diretórios
create_directories() {
    log "Criando diretórios..."
    mkdir -p "$BACKUP_DIR"
    mkdir -p "$EXPORT_DIR"
    log "Diretórios criados: $BACKUP_DIR, $EXPORT_DIR"
}

# Backup do banco de produção
backup_production() {
    log "Fazendo backup do banco de produção..."
    
    if ! confirm "Deseja fazer backup do banco de produção?"; then
        warn "Backup pulado. Continuando sem backup..."
        return
    fi
    
    local backup_file="$BACKUP_DIR/backup_producao_$(date +%Y%m%d_%H%M%S).sql"
    
    PGPASSWORD="$PRODUCTION_PASSWORD" pg_dump \
        -h "$PRODUCTION_HOST" \
        -U "$PRODUCTION_USER" \
        -d "$PRODUCTION_DB" \
        --verbose \
        --clean \
        --if-exists \
        --create \
        --no-owner \
        --no-privileges \
        > "$backup_file"
    
    if [ $? -eq 0 ]; then
        log "Backup criado com sucesso: $backup_file"
    else
        error "Erro ao criar backup"
        exit 1
    fi
}

# Exportar dados do staging
export_staging_data() {
    log "Exportando dados do banco de staging..."
    
    # Lista de todas as tabelas para exportar
    local tables=(
        "achievements"
        "ai_providers"
        "ai_configurations"
        "subscription_plans"
        "companies"
        "profiles"
        "producers"
        "company_users"
        "courses"
        "course_modules"
        "lessons"
        "lesson_materials"
        "enrollments"
        "lesson_progress"
        "quizzes"
        "quiz_attempts"
        "student_points"
        "points_history"
        "student_achievements"
        "mentorships"
        "mentorship_sessions"
        "mentorship_participants"
        "mentorship_attendees"
        "producer_mentorship_sessions"
        "producer_mentorship_participants"
        "community_topics"
        "community_replies"
        "community_topic_likes"
        "community_reply_likes"
        "discussions"
        "discussion_replies"
        "learning_paths"
        "learning_path_courses"
        "certificates"
        "calendar_events"
        "company_messages"
        "collaborator_activity_logs"
        "collaborator_activity_stats"
        "auth_audit_logs"
        "auth_login_attempts"
        "ai_chat_sessions"
        "ai_chat_messages"
        "notification_logs"
        "notification_queue"
        "stripe_webhook_events"
        "user_daily_gamification_limits"
    )
    
    for table in "${tables[@]}"; do
        log "Exportando tabela: $table"
        local export_file="$EXPORT_DIR/${table}.csv"
        
        PGPASSWORD="$STAGING_PASSWORD" psql \
            -h "$STAGING_HOST" \
            -U "$STAGING_USER" \
            -d "$STAGING_DB" \
            -c "\copy (SELECT * FROM public.$table) TO STDOUT WITH CSV HEADER" \
            > "$export_file"
        
        if [ $? -eq 0 ]; then
            log "Tabela $table exportada: $export_file"
        else
            error "Erro ao exportar tabela $table"
            exit 1
        fi
    done
    
    log "Exportação concluída. Dados salvos em: $EXPORT_DIR"
}

# Limpar banco de produção (opcional)
clean_production() {
    if ! confirm "Deseja limpar completamente o banco de produção antes da migração?"; then
        warn "Limpeza pulada. Os dados existentes serão mantidos."
        return
    fi
    
    log "Limpando banco de produção..."
    
    # Desabilitar RLS temporariamente
    PGPASSWORD="$PRODUCTION_PASSWORD" psql \
        -h "$PRODUCTION_HOST" \
        -U "$PRODUCTION_USER" \
        -d "$PRODUCTION_DB" \
        -c "
        -- Desabilitar RLS
        ALTER TABLE IF EXISTS public.achievements DISABLE ROW LEVEL SECURITY;
        ALTER TABLE IF EXISTS public.ai_chat_messages DISABLE ROW LEVEL SECURITY;
        ALTER TABLE IF EXISTS public.ai_chat_sessions DISABLE ROW LEVEL SECURITY;
        ALTER TABLE IF EXISTS public.ai_configurations DISABLE ROW LEVEL SECURITY;
        ALTER TABLE IF EXISTS public.ai_providers DISABLE ROW LEVEL SECURITY;
        ALTER TABLE IF EXISTS public.auth_audit_logs DISABLE ROW LEVEL SECURITY;
        ALTER TABLE IF EXISTS public.auth_login_attempts DISABLE ROW LEVEL SECURITY;
        ALTER TABLE IF EXISTS public.calendar_events DISABLE ROW LEVEL SECURITY;
        ALTER TABLE IF EXISTS public.certificates DISABLE ROW LEVEL SECURITY;
        ALTER TABLE IF EXISTS public.collaborator_activity_logs DISABLE ROW LEVEL SECURITY;
        ALTER TABLE IF EXISTS public.collaborator_activity_stats DISABLE ROW LEVEL SECURITY;
        ALTER TABLE IF EXISTS public.community_replies DISABLE ROW LEVEL SECURITY;
        ALTER TABLE IF EXISTS public.community_reply_likes DISABLE ROW LEVEL SECURITY;
        ALTER TABLE IF EXISTS public.community_topic_likes DISABLE ROW LEVEL SECURITY;
        ALTER TABLE IF EXISTS public.community_topics DISABLE ROW LEVEL SECURITY;
        ALTER TABLE IF EXISTS public.companies DISABLE ROW LEVEL SECURITY;
        ALTER TABLE IF EXISTS public.company_messages DISABLE ROW LEVEL SECURITY;
        ALTER TABLE IF EXISTS public.company_users DISABLE ROW LEVEL SECURITY;
        ALTER TABLE IF EXISTS public.course_modules DISABLE ROW LEVEL SECURITY;
        ALTER TABLE IF EXISTS public.courses DISABLE ROW LEVEL SECURITY;
        ALTER TABLE IF EXISTS public.discussion_replies DISABLE ROW LEVEL SECURITY;
        ALTER TABLE IF EXISTS public.discussions DISABLE ROW LEVEL SECURITY;
        ALTER TABLE IF EXISTS public.enrollments DISABLE ROW LEVEL SECURITY;
        ALTER TABLE IF EXISTS public.student_points DISABLE ROW LEVEL SECURITY;
        ALTER TABLE IF EXISTS public.learning_path_courses DISABLE ROW LEVEL SECURITY;
        ALTER TABLE IF EXISTS public.learning_paths DISABLE ROW LEVEL SECURITY;
        ALTER TABLE IF EXISTS public.lesson_materials DISABLE ROW LEVEL SECURITY;
        ALTER TABLE IF EXISTS public.lesson_progress DISABLE ROW LEVEL SECURITY;
        ALTER TABLE IF EXISTS public.lessons DISABLE ROW LEVEL SECURITY;
        ALTER TABLE IF EXISTS public.mentorship_attendees DISABLE ROW LEVEL SECURITY;
        ALTER TABLE IF EXISTS public.mentorship_participants DISABLE ROW LEVEL SECURITY;
        ALTER TABLE IF EXISTS public.mentorship_sessions DISABLE ROW LEVEL SECURITY;
        ALTER TABLE IF EXISTS public.mentorships DISABLE ROW LEVEL SECURITY;
        ALTER TABLE IF EXISTS public.notification_logs DISABLE ROW LEVEL SECURITY;
        ALTER TABLE IF EXISTS public.notification_queue DISABLE ROW LEVEL SECURITY;
        ALTER TABLE IF EXISTS public.points_history DISABLE ROW LEVEL SECURITY;
        ALTER TABLE IF EXISTS public.producer_mentorship_participants DISABLE ROW LEVEL SECURITY;
        ALTER TABLE IF EXISTS public.producer_mentorship_sessions DISABLE ROW LEVEL SECURITY;
        ALTER TABLE IF EXISTS public.producers DISABLE ROW LEVEL SECURITY;
        ALTER TABLE IF EXISTS public.profiles DISABLE ROW LEVEL SECURITY;
        ALTER TABLE IF EXISTS public.quiz_attempts DISABLE ROW LEVEL SECURITY;
        ALTER TABLE IF EXISTS public.quizzes DISABLE ROW LEVEL SECURITY;
        ALTER TABLE IF EXISTS public.stripe_webhook_events DISABLE ROW LEVEL SECURITY;
        ALTER TABLE IF EXISTS public.student_achievements DISABLE ROW LEVEL SECURITY;
        ALTER TABLE IF EXISTS public.subscription_plans DISABLE ROW LEVEL SECURITY;
        ALTER TABLE IF EXISTS public.user_daily_gamification_limits DISABLE ROW LEVEL SECURITY;
        "
    
    # Limpar todas as tabelas
    PGPASSWORD="$PRODUCTION_PASSWORD" psql \
        -h "$PRODUCTION_HOST" \
        -U "$PRODUCTION_USER" \
        -d "$PRODUCTION_DB" \
        -c "
        TRUNCATE TABLE public.user_daily_gamification_limits CASCADE;
        TRUNCATE TABLE public.subscription_plans CASCADE;
        TRUNCATE TABLE public.student_achievements CASCADE;
        TRUNCATE TABLE public.stripe_webhook_events CASCADE;
        TRUNCATE TABLE public.quizzes CASCADE;
        TRUNCATE TABLE public.quiz_attempts CASCADE;
        TRUNCATE TABLE public.profiles CASCADE;
        TRUNCATE TABLE public.producers CASCADE;
        TRUNCATE TABLE public.producer_mentorship_sessions CASCADE;
        TRUNCATE TABLE public.producer_mentorship_participants CASCADE;
        TRUNCATE TABLE public.points_history CASCADE;
        TRUNCATE TABLE public.notification_queue CASCADE;
        TRUNCATE TABLE public.notification_logs CASCADE;
        TRUNCATE TABLE public.mentorships CASCADE;
        TRUNCATE TABLE public.mentorship_sessions CASCADE;
        TRUNCATE TABLE public.mentorship_participants CASCADE;
        TRUNCATE TABLE public.mentorship_attendees CASCADE;
        TRUNCATE TABLE public.lessons CASCADE;
        TRUNCATE TABLE public.lesson_progress CASCADE;
        TRUNCATE TABLE public.lesson_materials CASCADE;
        TRUNCATE TABLE public.learning_paths CASCADE;
        TRUNCATE TABLE public.learning_path_courses CASCADE;
        TRUNCATE TABLE public.student_points CASCADE;
        TRUNCATE TABLE public.enrollments CASCADE;
        TRUNCATE TABLE public.discussions CASCADE;
        TRUNCATE TABLE public.discussion_replies CASCADE;
        TRUNCATE TABLE public.courses CASCADE;
        TRUNCATE TABLE public.course_modules CASCADE;
        TRUNCATE TABLE public.company_users CASCADE;
        TRUNCATE TABLE public.company_messages CASCADE;
        TRUNCATE TABLE public.companies CASCADE;
        TRUNCATE TABLE public.community_topics CASCADE;
        TRUNCATE TABLE public.community_topic_likes CASCADE;
        TRUNCATE TABLE public.community_replies CASCADE;
        TRUNCATE TABLE public.community_reply_likes CASCADE;
        TRUNCATE TABLE public.collaborator_activity_stats CASCADE;
        TRUNCATE TABLE public.collaborator_activity_logs CASCADE;
        TRUNCATE TABLE public.certificates CASCADE;
        TRUNCATE TABLE public.calendar_events CASCADE;
        TRUNCATE TABLE public.auth_login_attempts CASCADE;
        TRUNCATE TABLE public.auth_audit_logs CASCADE;
        TRUNCATE TABLE public.ai_providers CASCADE;
        TRUNCATE TABLE public.ai_configurations CASCADE;
        TRUNCATE TABLE public.ai_chat_sessions CASCADE;
        TRUNCATE TABLE public.ai_chat_messages CASCADE;
        TRUNCATE TABLE public.achievements CASCADE;
        "
    
    log "Banco de produção limpo com sucesso."
}

# Importar dados no banco de produção
import_production_data() {
    log "Importando dados no banco de produção..."
    
    # Lista de tabelas na ordem de importação (respeitando dependências)
    local tables=(
        "achievements"
        "ai_providers"
        "ai_configurations"
        "subscription_plans"
        "companies"
        "profiles"
        "producers"
        "company_users"
        "courses"
        "course_modules"
        "lessons"
        "lesson_materials"
        "enrollments"
        "lesson_progress"
        "quizzes"
        "quiz_attempts"
        "student_points"
        "points_history"
        "student_achievements"
        "mentorships"
        "mentorship_sessions"
        "mentorship_participants"
        "mentorship_attendees"
        "producer_mentorship_sessions"
        "producer_mentorship_participants"
        "community_topics"
        "community_replies"
        "community_topic_likes"
        "community_reply_likes"
        "discussions"
        "discussion_replies"
        "learning_paths"
        "learning_path_courses"
        "certificates"
        "calendar_events"
        "company_messages"
        "collaborator_activity_logs"
        "collaborator_activity_stats"
        "auth_audit_logs"
        "auth_login_attempts"
        "ai_chat_sessions"
        "ai_chat_messages"
        "notification_logs"
        "notification_queue"
        "stripe_webhook_events"
        "user_daily_gamification_limits"
    )
    
    for table in "${tables[@]}"; do
        log "Importando tabela: $table"
        local import_file="$EXPORT_DIR/${table}.csv"
        
        if [ -f "$import_file" ]; then
            PGPASSWORD="$PRODUCTION_PASSWORD" psql \
                -h "$PRODUCTION_HOST" \
                -U "$PRODUCTION_USER" \
                -d "$PRODUCTION_DB" \
                -c "\copy public.$table FROM '$import_file' WITH CSV HEADER"
            
            if [ $? -eq 0 ]; then
                log "Tabela $table importada com sucesso"
            else
                error "Erro ao importar tabela $table"
                exit 1
            fi
        else
            warn "Arquivo não encontrado: $import_file"
        fi
    done
    
    log "Importação concluída."
}

# Reabilitar RLS e políticas
reenable_rls() {
    log "Reabilitando RLS e políticas..."
    
    PGPASSWORD="$PRODUCTION_PASSWORD" psql \
        -h "$PRODUCTION_HOST" \
        -U "$PRODUCTION_USER" \
        -d "$PRODUCTION_DB" \
        -c "
        -- Reabilitar RLS
        ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
        ALTER TABLE public.ai_chat_messages ENABLE ROW LEVEL SECURITY;
        ALTER TABLE public.ai_chat_sessions ENABLE ROW LEVEL SECURITY;
        ALTER TABLE public.ai_configurations ENABLE ROW LEVEL SECURITY;
        ALTER TABLE public.ai_providers ENABLE ROW LEVEL SECURITY;
        ALTER TABLE public.auth_audit_logs ENABLE ROW LEVEL SECURITY;
        ALTER TABLE public.auth_login_attempts ENABLE ROW LEVEL SECURITY;
        ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;
        ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;
        ALTER TABLE public.collaborator_activity_logs ENABLE ROW LEVEL SECURITY;
        ALTER TABLE public.collaborator_activity_stats ENABLE ROW LEVEL SECURITY;
        ALTER TABLE public.community_replies ENABLE ROW LEVEL SECURITY;
        ALTER TABLE public.community_reply_likes ENABLE ROW LEVEL SECURITY;
        ALTER TABLE public.community_topic_likes ENABLE ROW LEVEL SECURITY;
        ALTER TABLE public.community_topics ENABLE ROW LEVEL SECURITY;
        ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
        ALTER TABLE public.company_messages ENABLE ROW LEVEL SECURITY;
        ALTER TABLE public.company_users ENABLE ROW LEVEL SECURITY;
        ALTER TABLE public.course_modules ENABLE ROW LEVEL SECURITY;
        ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
        ALTER TABLE public.discussion_replies ENABLE ROW LEVEL SECURITY;
        ALTER TABLE public.discussions ENABLE ROW LEVEL SECURITY;
        ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;
        ALTER TABLE public.student_points ENABLE ROW LEVEL SECURITY;
        ALTER TABLE public.learning_path_courses ENABLE ROW LEVEL SECURITY;
        ALTER TABLE public.learning_paths ENABLE ROW LEVEL SECURITY;
        ALTER TABLE public.lesson_materials ENABLE ROW LEVEL SECURITY;
        ALTER TABLE public.lesson_progress ENABLE ROW LEVEL SECURITY;
        ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
        ALTER TABLE public.mentorship_attendees ENABLE ROW LEVEL SECURITY;
        ALTER TABLE public.mentorship_participants ENABLE ROW LEVEL SECURITY;
        ALTER TABLE public.mentorship_sessions ENABLE ROW LEVEL SECURITY;
        ALTER TABLE public.mentorships ENABLE ROW LEVEL SECURITY;
        ALTER TABLE public.notification_logs ENABLE ROW LEVEL SECURITY;
        ALTER TABLE public.notification_queue ENABLE ROW LEVEL SECURITY;
        ALTER TABLE public.points_history ENABLE ROW LEVEL SECURITY;
        ALTER TABLE public.producer_mentorship_participants ENABLE ROW LEVEL SECURITY;
        ALTER TABLE public.producer_mentorship_sessions ENABLE ROW LEVEL SECURITY;
        ALTER TABLE public.producers ENABLE ROW LEVEL SECURITY;
        ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
        ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;
        ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;
        ALTER TABLE public.stripe_webhook_events ENABLE ROW LEVEL SECURITY;
        ALTER TABLE public.student_achievements ENABLE ROW LEVEL SECURITY;
        ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
        ALTER TABLE public.user_daily_gamification_limits ENABLE ROW LEVEL SECURITY;
        "
    
    log "RLS e políticas reabilitadas."
}

# Verificação final
verify_migration() {
    log "Executando verificação final..."
    
    PGPASSWORD="$PRODUCTION_PASSWORD" psql \
        -h "$PRODUCTION_HOST" \
        -U "$PRODUCTION_USER" \
        -d "$PRODUCTION_DB" \
        -c "
        -- Verificar contagem de registros
        SELECT 
            schemaname,
            tablename,
            n_tup_ins as registros
        FROM pg_stat_user_tables 
        WHERE schemaname = 'public'
        ORDER BY tablename;
        "
    
    log "Verificação concluída."
}

# Função principal
main() {
    echo "====================================================="
    echo "SCRIPT DE MIGRAÇÃO AUTOMATIZADA: STAGING → PRODUÇÃO"
    echo "====================================================="
    echo
    
    if ! confirm "Deseja continuar com a migração? Esta operação irá sobrescrever o banco de produção."; then
        log "Migração cancelada pelo usuário."
        exit 0
    fi
    
    # Executar etapas da migração
    check_dependencies
    create_directories
    backup_production
    export_staging_data
    clean_production
    import_production_data
    reenable_rls
    verify_migration
    
    log "Migração concluída com sucesso!"
    log "Backup salvo em: $BACKUP_DIR"
    log "Dados exportados em: $EXPORT_DIR"
    
    if confirm "Deseja limpar os arquivos temporários de exportação?"; then
        rm -rf "$EXPORT_DIR"
        log "Arquivos temporários removidos."
    fi
}

# Executar função principal
main "$@" 