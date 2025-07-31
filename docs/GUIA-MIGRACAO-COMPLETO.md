# Guia Completo de Migração: Staging → Produção

## 📋 Visão Geral

Este guia fornece instruções detalhadas para migrar completamente o banco de dados de staging para produção no Supabase, garantindo que o banco de produção fique exatamente igual ao de staging.

## ⚠️ Avisos Importantes

- **Este processo irá sobrescrever completamente o banco de produção**
- **Sempre faça backup antes de executar**
- **Execute em horário de baixo tráfego**
- **Teste em ambiente de desenvolvimento primeiro**

## 🛠️ Pré-requisitos

### 1. Ferramentas Necessárias
- PostgreSQL client (`psql`, `pg_dump`)
- Acesso aos bancos de staging e produção
- Permissões de administrador nos bancos

### 2. Informações Necessárias
- Host, usuário e senha do banco de staging
- Host, usuário e senha do banco de produção
- Backup do banco de produção atual

## 📁 Arquivos do Projeto

Este projeto inclui os seguintes arquivos para migração:

1. **`migracao-staging-para-producao.sql`** - Script SQL manual
2. **`script-migracao-automatizada.sh`** - Script bash automatizado
3. **`GUIA-MIGRACAO-COMPLETO.md`** - Este guia

## 🚀 Métodos de Migração

### Método 1: Script Automatizado (Recomendado)

#### Passo 1: Configurar o Script
Edite o arquivo `script-migracao-automatizada.sh` e ajuste as variáveis:

```bash
# Configurações do banco de staging
STAGING_HOST="your-staging-host.supabase.co"
STAGING_DB="postgres"
STAGING_USER="postgres"
STAGING_PASSWORD="your-staging-password"

# Configurações do banco de produção
PRODUCTION_HOST="your-production-host.supabase.co"
PRODUCTION_DB="postgres"
PRODUCTION_USER="postgres"
PRODUCTION_PASSWORD="your-production-password"
```

#### Passo 2: Executar o Script
```bash
# Tornar o script executável
chmod +x script-migracao-automatizada.sh

# Executar a migração
./script-migracao-automatizada.sh
```

#### Passo 3: Acompanhar o Progresso
O script irá:
- ✅ Verificar dependências
- ✅ Criar diretórios de backup e exportação
- ✅ Fazer backup do banco de produção
- ✅ Exportar dados do staging
- ✅ Limpar banco de produção (opcional)
- ✅ Importar dados no produção
- ✅ Reabilitar RLS e políticas
- ✅ Executar verificação final

### Método 2: Migração Manual

#### Passo 1: Backup do Banco de Produção
```bash
# Backup completo
pg_dump -h [PRODUCTION_HOST] -U [PRODUCTION_USER] -d [PRODUCTION_DB] \
  --verbose --clean --if-exists --create --no-owner --no-privileges \
  > backup_producao_$(date +%Y%m%d_%H%M%S).sql
```

#### Passo 2: Exportar Dados do Staging
```bash
# Conectar ao banco de staging e exportar cada tabela
psql -h [STAGING_HOST] -U [STAGING_USER] -d [STAGING_DB] -c "
\copy (SELECT * FROM public.achievements) TO STDOUT WITH CSV HEADER;
\copy (SELECT * FROM public.ai_providers) TO STDOUT WITH CSV HEADER;
-- ... continuar para todas as tabelas
"
```

#### Passo 3: Importar no Banco de Produção
```bash
# Conectar ao banco de produção e importar cada tabela
psql -h [PRODUCTION_HOST] -U [PRODUCTION_USER] -d [PRODUCTION_DB] -c "
\copy public.achievements FROM 'achievements.csv' WITH CSV HEADER;
\copy public.ai_providers FROM 'ai_providers.csv' WITH CSV HEADER;
-- ... continuar para todas as tabelas
"
```

## 📊 Estrutura do Banco de Dados

### Tabelas Principais (Ordem de Importação)

1. **achievements** - Conquistas do sistema
2. **ai_providers** - Provedores de IA
3. **ai_configurations** - Configurações de IA
4. **subscription_plans** - Planos de assinatura
5. **companies** - Empresas
6. **profiles** - Perfis de usuários
7. **producers** - Produtores de conteúdo
8. **company_users** - Usuários das empresas
9. **courses** - Cursos
10. **course_modules** - Módulos dos cursos
11. **lessons** - Lições
12. **lesson_materials** - Materiais das lições
13. **enrollments** - Matrículas
14. **lesson_progress** - Progresso das lições
15. **quizzes** - Questionários
16. **quiz_attempts** - Tentativas de questionário
17. **student_points** - Pontos dos estudantes
18. **points_history** - Histórico de pontos
19. **student_achievements** - Conquistas dos estudantes
20. **mentorships** - Mentorias
21. **mentorship_sessions** - Sessões de mentoria
22. **mentorship_participants** - Participantes de mentoria
23. **mentorship_attendees** - Participantes de sessões
24. **producer_mentorship_sessions** - Sessões de mentoria do produtor
25. **producer_mentorship_participants** - Participantes das sessões do produtor
26. **community_topics** - Tópicos da comunidade
27. **community_replies** - Respostas da comunidade
28. **community_topic_likes** - Likes dos tópicos
29. **community_reply_likes** - Likes das respostas
30. **discussions** - Discussões
31. **discussion_replies** - Respostas das discussões
32. **learning_paths** - Trilhas de aprendizado
33. **learning_path_courses** - Cursos das trilhas
34. **certificates** - Certificados
35. **calendar_events** - Eventos do calendário
36. **company_messages** - Mensagens da empresa
37. **collaborator_activity_logs** - Logs de atividade dos colaboradores
38. **collaborator_activity_stats** - Estatísticas de atividade
39. **auth_audit_logs** - Logs de auditoria de autenticação
40. **auth_login_attempts** - Tentativas de login
41. **ai_chat_sessions** - Sessões de chat com IA
42. **ai_chat_messages** - Mensagens do chat com IA
43. **notification_logs** - Logs de notificação
44. **notification_queue** - Fila de notificações
45. **stripe_webhook_events** - Eventos do webhook do Stripe
46. **user_daily_gamification_limits** - Limites diários de gamificação

## 🔧 Configurações Especiais

### Row Level Security (RLS)
O script automaticamente:
- Desabilita RLS durante a migração
- Reabilita RLS após a importação
- Mantém todas as políticas de segurança

### Foreign Keys
As tabelas são importadas na ordem correta para respeitar as dependências de foreign keys.

### Extensões e Funções
Certifique-se de que as extensões necessárias estão instaladas no banco de produção:
- `uuid-ossp`
- `pgcrypto`
- `pg_stat_statements`

## ✅ Verificação Pós-Migração

### 1. Verificar Contagem de Registros
```sql
SELECT 
    schemaname,
    tablename,
    n_tup_ins as registros
FROM pg_stat_user_tables 
WHERE schemaname = 'public'
ORDER BY tablename;
```

### 2. Verificar Integridade das Foreign Keys
```sql
SELECT 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_schema='public';
```

### 3. Testes Funcionais
- ✅ Login de usuários
- ✅ Criação de empresas
- ✅ Acesso a cursos
- ✅ Sistema de gamificação
- ✅ Chat com IA
- ✅ Notificações
- ✅ Integração com Stripe

## 🚨 Troubleshooting

### Erro: "permission denied"
```bash
# Verificar permissões
chmod +x script-migracao-automatizada.sh

# Verificar credenciais
psql -h [HOST] -U [USER] -d [DB] -c "SELECT current_user;"
```

### Erro: "connection refused"
- Verificar se o host está correto
- Verificar se as credenciais estão corretas
- Verificar se o banco está acessível

### Erro: "foreign key constraint"
- Verificar se as tabelas foram importadas na ordem correta
- Verificar se todos os dados foram importados

### Erro: "RLS policy"
- Verificar se o RLS foi reabilitado corretamente
- Verificar se as políticas estão ativas

## 🔄 Rollback

Se algo der errado, use o backup criado:

```bash
# Restaurar backup
psql -h [PRODUCTION_HOST] -U [PRODUCTION_USER] -d [PRODUCTION_DB] < backup_producao_[TIMESTAMP].sql
```

## 📞 Suporte

Em caso de problemas:
1. Verifique os logs do script
2. Execute a verificação pós-migração
3. Consulte este guia
4. Use o backup para rollback se necessário

## 📝 Checklist Final

- [ ] Backup do banco de produção criado
- [ ] Script configurado com credenciais corretas
- [ ] Migração executada com sucesso
- [ ] RLS reabilitado
- [ ] Verificação pós-migração executada
- [ ] Testes funcionais realizados
- [ ] Backup mantido em local seguro

---

**⚠️ IMPORTANTE**: Este processo é irreversível. Sempre tenha um backup antes de executar. 