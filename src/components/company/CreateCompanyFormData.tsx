
import { useState, useEffect } from "react";
import { CompanyData } from "@/hooks/useCompanies";

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

export const useCreateCompanyFormData = (isOpen: boolean) => {
  const [formData, setFormData] = useState<CompanyData>(initialFormData);

  useEffect(() => {
    if (isOpen) {
      setFormData(initialFormData);
    }
  }, [isOpen]);

  return { formData, setFormData };
};
