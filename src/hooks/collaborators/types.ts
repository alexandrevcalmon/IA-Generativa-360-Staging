
// Interfaces
export interface Collaborator {
  id: string; // UUID from company_users table
  auth_user_id: string; // UUID from auth.users table
  company_id: string; // UUID
  name: string;
  email: string;
  phone?: string | null; // Added phone field
  position: string | null; // Cargo
  is_active: boolean;
  created_at: string;
  updated_at?: string; // Added missing property
  needs_password_change?: boolean; // Optional, as it might not always be present or relevant after first login
}

export interface CreateCollaboratorData {
  company_id: string;
  name: string;
  email: string;
  phone?: string | null; // Added phone field
  position?: string | null;
}

export interface UpdateCollaboratorData {
  name?: string;
  email?: string;
  phone?: string | null; // Added phone field
  position?: string | null;
  is_active?: boolean;
  needs_password_change?: boolean;
}
