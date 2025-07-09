
-- Update the existing user record to include proper position and phone values
UPDATE company_users 
SET 
  position = 'Colaborador',
  phone = NULL
WHERE email = 'daniela@gmail.com' AND name = 'Daniela Oliveira';
