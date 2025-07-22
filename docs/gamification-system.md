# Sistema de Gamificação - IA Generativa 360º

Este documento descreve o sistema de gamificação implementado na plataforma IA Generativa 360º, incluindo sua arquitetura, regras e componentes.

## Visão Geral

O sistema de gamificação foi projetado para aumentar o engajamento dos usuários na plataforma, recompensando-os por ações positivas como completar lições, passar em quizzes, participar de mentorias e interagir na comunidade.

## Componentes Principais

### 1. Pontuação

Os usuários ganham pontos por diversas ações na plataforma:

- **Lições**: 5 pontos por lição concluída
- **Módulos**: 20 pontos por módulo concluído
- **Cursos**: 50 pontos por curso concluído
- **Quizzes**: 20 pontos por quiz aprovado
- **Mentorias**: 10 pontos por participação em mentoria
- **Comunidade**: 
  - 10 pontos por criar um tópico
  - 10 pontos por criar uma resposta
  - 1 ponto por curtir ou receber curtida (limitado a 20 por dia)

### 2. Níveis

Os usuários sobem de nível a cada 100 pontos acumulados:
- Nível 1: 0-99 pontos
- Nível 2: 100-199 pontos
- Nível 3: 200-299 pontos
- E assim por diante...

### 3. Conquistas (Achievements)

Conquistas são desbloqueadas quando o usuário atinge certos marcos:

- **Primeira Lição**: Concluir a primeira lição
- **Primeiro Curso**: Concluir o primeiro curso
- **Primeira Mentoria**: Participar de uma mentoria
- **7 Dias de Streak**: Acessar a plataforma por 7 dias seguidos
- **10 Cursos Concluídos**: Concluir 10 cursos
- **100 Lições Concluídas**: Concluir 100 lições
- **Participação Ativa**: Fazer 10 postagens na comunidade

Cada conquista desbloqueada concede 20 pontos adicionais ao usuário.

### 4. Streak (Sequência de Dias)

O sistema rastreia quantos dias consecutivos o usuário acessa a plataforma:
- 3 dias consecutivos: +5 pontos de bônus
- 7 dias consecutivos: +10 pontos de bônus
- 30 dias consecutivos: +20 pontos de bônus

Se o usuário não acessar por um dia, o contador de streak é reiniciado.

### 5. Ranking

O sistema inclui um ranking global que mostra os usuários com mais pontos. O ranking pode ser filtrado por diferentes períodos:
- Hoje
- Semana
- Mês
- 6 meses
- Ano
- Geral (todos os pontos)

## Arquitetura Técnica

### Tabelas do Banco de Dados

1. **student_points**: Armazena os pontos e níveis dos usuários
   - `student_id`: ID do estudante (referência a company_users.id)
   - `points`: Pontos atuais
   - `total_points`: Total de pontos acumulados
   - `level`: Nível atual
   - `streak_days`: Dias consecutivos de acesso
   - `last_activity_date`: Última data de atividade

2. **points_history**: Histórico de pontos ganhos
   - `student_id`: ID do estudante
   - `points`: Pontos ganhos/perdidos na ação
   - `action_type`: Tipo de ação (lesson_completed, quiz_passed, etc.)
   - `description`: Descrição da ação
   - `reference_id`: ID de referência (opcional)
   - `earned_at`: Data/hora em que os pontos foram ganhos

3. **achievements**: Conquistas disponíveis
   - `name`: Nome da conquista
   - `description`: Descrição da conquista
   - `icon`: Ícone da conquista
   - `badge_color`: Cor do badge da conquista
   - `type`: Tipo de conquista (lesson, course, mentorship, etc.)
   - `points_required`: Pontos necessários para desbloquear

4. **student_achievements**: Conquistas desbloqueadas pelos usuários
   - `student_id`: ID do estudante
   - `achievement_id`: ID da conquista
   - `unlocked_at`: Data/hora em que a conquista foi desbloqueada

5. **user_daily_gamification_limits**: Limites diários para ações de gamificação
   - `user_id`: ID do usuário
   - `action_type`: Tipo de ação
   - `action_date`: Data da ação
   - `count`: Contador de ações realizadas no dia

### Views

1. **global_collaborator_ranking_new**: Ranking global de colaboradores
   - Mostra todos os colaboradores ordenados por pontos totais

2. **global_collaborator_ranking_period_v2**: Ranking por período (versão segura)
   - Inclui colunas para pontos ganhos em diferentes períodos (hoje, semana, mês, etc.)

### Funções e Triggers

1. **check_and_unlock_achievements()**: Verifica e desbloqueia conquistas automaticamente
   - Acionada quando os pontos do usuário são atualizados

2. **update_streak_days()**: Atualiza o contador de dias consecutivos
   - Acionada quando há uma nova entrada no histórico de pontos

## Implementação Frontend

O sistema de gamificação é implementado no frontend usando React e React Query:

1. **useStudentPoints**: Hook para gerenciar os pontos do usuário
2. **useStudentAchievements**: Hook para gerenciar as conquistas do usuário
3. **useAvailableAchievements**: Hook para buscar conquistas disponíveis
4. **usePointsHistory**: Hook para buscar o histórico de pontos

A interface do usuário inclui:
- Página de Gamificação com visão geral de pontos, nível e conquistas
- Componente de Ranking para visualizar a posição do usuário em relação aos outros
- Notificações quando o usuário ganha pontos ou desbloqueia conquistas

## Limitações e Proteções

Para evitar abusos, o sistema inclui:
- Limites diários para certas ações (curtidas, respostas, etc.)
- Verificação de unicidade para evitar pontos duplicados (ex: passar no mesmo quiz várias vezes)
- Proteção contra manipulação direta dos pontos através de políticas RLS no banco de dados

## Manutenção e Monitoramento

Para garantir o funcionamento correto do sistema de gamificação:
1. Monitore regularmente o histórico de pontos para detectar anomalias
2. Verifique se as conquistas estão sendo desbloqueadas corretamente
3. Ajuste os valores de pontos e limites conforme necessário para manter o equilíbrio
4. Considere adicionar novas conquistas periodicamente para manter o interesse dos usuários