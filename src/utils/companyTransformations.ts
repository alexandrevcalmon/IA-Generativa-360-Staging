
import { CompanyWithPlan } from "@/hooks/useCompaniesWithPlans";
import { Company } from "@/hooks/useCompanies";

export const transformCompanyWithPlanToCompany = (companyWithPlan: CompanyWithPlan): Company => {
  return {
    id: companyWithPlan.id,
    name: companyWithPlan.name,
    official_name: companyWithPlan.official_name,
    cnpj: companyWithPlan.cnpj,
    email: companyWithPlan.email,
    phone: companyWithPlan.phone,
    logo_url: companyWithPlan.logo_url,
    address_street: companyWithPlan.address_street,
    address_number: companyWithPlan.address_number,
    address_complement: companyWithPlan.address_complement,
    address_district: companyWithPlan.address_district,
    address_city: companyWithPlan.address_city,
    address_state: companyWithPlan.address_state,
    address_zip_code: companyWithPlan.address_zip_code,
    contact_name: companyWithPlan.contact_name,
    contact_email: companyWithPlan.contact_email,
    contact_phone: companyWithPlan.contact_phone,
    notes: companyWithPlan.notes,
    max_students: companyWithPlan.max_students,
    current_students: companyWithPlan.current_students,
    is_active: companyWithPlan.is_active,
    created_at: companyWithPlan.created_at,
    updated_at: companyWithPlan.updated_at || companyWithPlan.created_at,
    subscription_plan_id: companyWithPlan.subscription_plan_id,
    billing_period: companyWithPlan.billing_period,
    subscription_plan: companyWithPlan.subscription_plan,
  };
};
