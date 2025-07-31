// Configuração do Stripe para frontend - apenas tipos e configurações
// O SDK do Stripe é inicializado apenas no backend (Edge Functions)

// Definição dos planos com IDs do Stripe
export const STRIPE_PLANS = {
  starter_5_semestral: {
    name: 'Starter 5',
    maxCollaborators: 5,
    period: 'semestral',
    displayName: 'Starter 5 (Semestral)',
    price: 99.00,
    currency: 'BRL'
  },
  starter_5_anual: {
    name: 'Starter 5',
    maxCollaborators: 5,
    period: 'anual',
    displayName: 'Starter 5 (Anual)',
    price: 179.00,
    currency: 'BRL'
  },
  starter_10_semestral: {
    name: 'Starter 10',
    maxCollaborators: 10,
    period: 'semestral',
    displayName: 'Starter 10 (Semestral)',
    price: 179.00,
    currency: 'BRL'
  },
  starter_10_anual: {
    name: 'Starter 10',
    maxCollaborators: 10,
    period: 'anual',
    displayName: 'Starter 10 (Anual)',
    price: 299.00,
    currency: 'BRL'
  },
  starter_25_semestral: {
    name: 'Starter 25',
    maxCollaborators: 25,
    period: 'semestral',
    displayName: 'Starter 25 (Semestral)',
    price: 399.00,
    currency: 'BRL'
  },
  starter_25_anual: {
    name: 'Starter 25',
    maxCollaborators: 25,
    period: 'anual',
    displayName: 'Starter 25 (Anual)',
    price: 599.00,
    currency: 'BRL'
  },
  starter_50_semestral: {
    name: 'Starter 50',
    maxCollaborators: 50,
    period: 'semestral',
    displayName: 'Starter 50 (Semestral)',
    price: 699.00,
    currency: 'BRL'
  },
  starter_50_anual: {
    name: 'Starter 50',
    maxCollaborators: 50,
    period: 'anual',
    displayName: 'Starter 50 (Anual)',
    price: 999.00,
    currency: 'BRL'
  },
  starter_100_semestral: {
    name: 'Starter 100',
    maxCollaborators: 100,
    period: 'semestral',
    displayName: 'Starter 100 (Semestral)',
    price: 1299.00,
    currency: 'BRL'
  },
  starter_100_anual: {
    name: 'Starter 100',
    maxCollaborators: 100,
    period: 'anual',
    displayName: 'Starter 100 (Anual)',
    price: 1799.00,
    currency: 'BRL'
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
