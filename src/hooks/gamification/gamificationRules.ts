// Regras de pontuação para eventos
export const GAMIFICATION_RULES = {
  lesson_completed: 5,
  module_completed: 20,
  course_completed: 50,
  mentorship_participation: 10,
  community_post: 2,
  streak_bonus: [5, 10, 20], // Exemplo: 3, 7, 30 dias
  achievement_unlocked: 20,
};

// Conquistas iniciais
export const INITIAL_ACHIEVEMENTS = [
  {
    name: 'Primeira Lição',
    description: 'Conclua sua primeira lição',
    type: 'lesson',
    points_required: 5,
    icon: '📘',
    badge_color: 'blue',
  },
  {
    name: 'Primeiro Curso',
    description: 'Conclua seu primeiro curso',
    type: 'course',
    points_required: 50,
    icon: '🎓',
    badge_color: 'green',
  },
  {
    name: 'Primeira Mentoria',
    description: 'Participe de uma mentoria',
    type: 'mentorship',
    points_required: 10,
    icon: '🤝',
    badge_color: 'purple',
  },
  {
    name: '7 Dias de Streak',
    description: 'Acesse a plataforma por 7 dias seguidos',
    type: 'streak',
    points_required: 7,
    icon: '🔥',
    badge_color: 'orange',
  },
  {
    name: '10 Cursos Concluídos',
    description: 'Conclua 10 cursos',
    type: 'course',
    points_required: 500,
    icon: '🏆',
    badge_color: 'gold',
  },
  {
    name: '100 Lições Concluídas',
    description: 'Conclua 100 lições',
    type: 'lesson',
    points_required: 500,
    icon: '📚',
    badge_color: 'teal',
  },
  {
    name: 'Participação Ativa',
    description: 'Faça 10 postagens na comunidade',
    type: 'community',
    points_required: 20,
    icon: '💬',
    badge_color: 'cyan',
  },
];

export function getPointsForEvent(eventType, streakDays = 0) {
  if (eventType === 'streak') {
    if (streakDays >= 30) return GAMIFICATION_RULES.streak_bonus[2];
    if (streakDays >= 7) return GAMIFICATION_RULES.streak_bonus[1];
    if (streakDays >= 3) return GAMIFICATION_RULES.streak_bonus[0];
    return 0;
  }
  return GAMIFICATION_RULES[eventType] || 0;
} 