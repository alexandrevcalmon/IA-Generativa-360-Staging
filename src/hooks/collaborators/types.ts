
// Interfaces
export interface Collaborator {
  id: string; // UUID from company_users table
  auth_user_id: string; // UUID from auth.users table
  company_id: string; // UUID
  name: string;
  email: string;
  phone?: string | null;
  position: string | null; // Cargo
  endereco?: string | null;
  numero?: string | null;
  complemento?: string | null;
  bairro?: string | null;
  cidade?: string | null;
  estado?: string | null;
  pais?: string | null;
  cep?: string | null;
  gender?: string | null; // Sexo
  birth_date?: string | null; // Data de nascimento
  is_active: boolean;
  needs_complete_registration?: boolean;
  created_at: string;
  updated_at?: string;
  needs_password_change?: boolean;
}

export interface CreateCollaboratorData {
  company_id: string;
  name: string;
  email: string;
  phone?: string | null;
  position?: string | null;
  endereco?: string | null;
  numero?: string | null;
  complemento?: string | null;
  bairro?: string | null;
  cidade?: string | null;
  estado?: string | null;
  pais?: string | null;
  cep?: string | null;
  gender?: string | null;
  birth_date?: string | null;
  needs_complete_registration?: boolean;
}

export interface UpdateCollaboratorData {
  name?: string;
  email?: string; // Só pode ser alterado antes da ativação
  phone?: string | null;
  position?: string | null;
  endereco?: string;
  numero?: string;
  complemento?: string | null;
  bairro?: string;
  cidade?: string;
  estado?: string;
  pais?: string;
  cep?: string;
  gender?: string;
  birth_date?: string;
  needs_complete_registration?: boolean;
}

export interface BulkCollaboratorData {
  nome: string;
  email: string;
  cargo: string;
  telefone?: string;
}

// Enum para gênero
export const GenderOptions = {
  masculino: 'Masculino',
  feminino: 'Feminino',
  outro: 'Outro',
  prefiro_nao_informar: 'Prefiro não informar'
} as const;

export type GenderType = keyof typeof GenderOptions;
