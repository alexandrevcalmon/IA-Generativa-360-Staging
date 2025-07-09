
-- Insert a new company record for the admin-empresa@calmonacademy.com user
INSERT INTO public.companies (
  id,
  name,
  official_name,
  contact_email,
  contact_name,
  auth_user_id,
  max_students,
  current_students,
  is_active,
  needs_password_change,
  subscription_plan,
  billing_period,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  'Empresa Admin Calmon',
  'Empresa Admin Calmon Academy Ltda',
  'admin-empresa@calmonacademy.com',
  'Administrador da Empresa',
  'bac073b3-2587-4b75-8f97-4bbfef261383',
  100,
  0,
  true,
  false,
  'enterprise',
  'annual',
  now(),
  now()
);
