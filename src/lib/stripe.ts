// Configuração do Stripe para frontend - apenas tipos e configurações
// O SDK do Stripe é inicializado apenas no backend (Edge Functions)

// Definição dos planos com IDs do Stripe
export const STRIPE_PLANS = {
  starter_5_semestral: {
    name: 'Starter 5',
    maxCollaborators: 5,
    period: 'semestral',
    displayName: 'Starter 5 (Semestral)'
  },
  starter_5_anual: {
    name: 'Starter 5',
    maxCollaborators: 5,
    period: 'anual',
    displayName: 'Starter 5 (Anual)'
  },
  starter_10_semestral: {
    name: 'Starter 10',
    maxCollaborators: 10,
    period: 'semestral',
    displayName: 'Starter 10 (Semestral)'
  },
  starter_10_anual: {
    name: 'Starter 10',
    maxCollaborators: 10,
    period: 'anual',
    displayName: 'Starter 10 (Anual)'
  },
  starter_25_semestral: {
    name: 'Starter 25',
    maxCollaborators: 25,
    period: 'semestral',
    displayName: 'Starter 25 (Semestral)'
  },
  starter_25_anual: {
    name: 'Starter 25',
    maxCollaborators: 25,
    period: 'anual',
    displayName: 'Starter 25 (Anual)'
  },
  starter_50_semestral: {
    name: 'Starter 50',
    maxCollaborators: 50,
    period: 'semestral',
    displayName: 'Starter 50 (Semestral)'
  },
  starter_50_anual: {
    name: 'Starter 50',
    maxCollaborators: 50,
    period: 'anual',
    displayName: 'Starter 50 (Anual)'
  },
  starter_100_semestral: {
    name: 'Starter 100',
    maxCollaborators: 100,
    period: 'semestral',
    displayName: 'Starter 100 (Semestral)'
  },
  starter_100_anual: {
    name: 'Starter 100',
    maxCollaborators: 100,
    period: 'anual',
    displayName: 'Starter 100 (Anual)'
  }
} as const;

// Tipagem para IDs dos planos
export type PlanId = keyof typeof STRIPE_PLANS;

// Função para obter informações do plano
export function getPlanInfo(planId: PlanId) {
  return STRIPE_PLANS[planId];
}

// Função para validar ID do plano
export function isValidPlan(planId: string): planId is PlanId {
  return planId in STRIPE_PLANS;
} 