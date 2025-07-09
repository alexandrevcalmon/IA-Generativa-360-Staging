
import { useState, useEffect } from "react";
import { Company, CompanyData } from "@/hooks/useCompanies";

export const initialFormData: CompanyData = {
  name: "",
  official_name: "",
  cnpj: "",
  email: "",
  phone: "",
  address_street: "",
  address_number: "",
  address_complement: "",
  address_district: "",
  address_city: "",
  address_state: "",
  address_zip_code: "",
  contact_name: "",
  contact_email: "",
  contact_phone: "",
  notes: "",
  subscription_plan_id: null,
  billing_period: undefined,
};

export const useEditCompanyFormData = (company: Company | null, isOpen: boolean) => {
  const [formData, setFormData] = useState<CompanyData>(initialFormData);

  useEffect(() => {
    if (company && isOpen) {
      setFormData({
        name: company.name || "",
        official_name: company.official_name || "",
        cnpj: company.cnpj || "",
        email: company.email || "",
        phone: company.phone || "",
        address_street: company.address_street || "",
        address_number: company.address_number || "",
        address_complement: company.address_complement || "",
        address_district: company.address_district || "",
        address_city: company.address_city || "",
        address_state: company.address_state || "",
        address_zip_code: company.address_zip_code || "",
        contact_name: company.contact_name || "",
        contact_email: company.contact_email || "",
        contact_phone: company.contact_phone || "",
        notes: company.notes || "",
        subscription_plan_id: company.subscription_plan_id || null,
        billing_period: company.billing_period || undefined,
      });
    } else if (!isOpen) {
      setFormData(initialFormData);
    }
  }, [company, isOpen]);

  return { formData, setFormData };
};
