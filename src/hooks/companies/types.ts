
export interface Company {
  id: string;
  name: string;
  official_name?: string;
  cnpj?: string;
  email?: string;
  phone?: string;
  logo_url?: string;
  address_street?: string;
  address_number?: string;
  address_complement?: string;
  address_district?: string;
  address_city?: string;
  address_state?: string;
  address_zip_code?: string;
  contact_name?: string;
  contact_email?: string;
  contact_phone?: string;
  notes?: string;
  max_students: number;
  current_students: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  subscription_plan_id: string | null;
  billing_period?: 'semester' | 'annual';
  subscription_plan?: {
    id: string;
    name: string;
    price: number;
    annual_price: number;
    semester_price: number;
    max_students: number;
  };
}

export interface CompanyData {
  name: string;
  official_name?: string;
  cnpj?: string;
  email?: string;
  phone?: string;
  address_street?: string;
  address_number?: string;
  address_complement?: string;
  address_district?: string;
  address_city?: string;
  address_state?: string;
  address_zip_code?: string;
  contact_name?: string;
  contact_email?: string;
  contact_phone?: string;
  notes?: string;
  subscription_plan_id: string | null;
  billing_period?: 'semester' | 'annual';
}

export interface UpdateCompanyData extends CompanyData {
  id: string;
}
