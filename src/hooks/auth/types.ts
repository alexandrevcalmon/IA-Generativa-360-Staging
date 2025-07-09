
import { User, Session } from '@supabase/supabase-js';

export interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string, role?: string) => Promise<{ error: any; needsPasswordChange?: boolean }>;
  signUp: (email: string, password: string, role?: string) => Promise<{ error: any }>;
  signOut: () => Promise<{ error: any }>;
  changePassword: (newPassword: string) => Promise<{ error: any }>;
  resetPassword: (email: string) => Promise<{ error: any }>;
  userRole: string | null;
  isProducer: boolean;
  isCompany: boolean;
  isStudent: boolean;
  needsPasswordChange: boolean;
  companyUserData: any;
  refreshUserRole: () => Promise<void>;
}

export interface UserRoleData {
  role: string | null;
  needsPasswordChange: boolean;
  companyUserData: any;
}

export interface CompanyData {
  id: string;
  name: string;
  official_name?: string;
  contact_email?: string;
  needs_password_change?: boolean;
  auth_user_id?: string;
}

export interface CompanyUserData {
  id: string;
  auth_user_id: string;
  company_id: string;
  name: string;
  email: string;
  phone?: string;
  position?: string;
  is_active: boolean;
  needs_password_change: boolean;
  created_at: string;
  companies?: CompanyData | null;
}
