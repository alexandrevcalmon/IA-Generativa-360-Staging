-- Adicionar campo para indicar se colaborador precisa completar cadastro
ALTER TABLE company_users 
ADD COLUMN IF NOT EXISTS needs_complete_registration BOOLEAN DEFAULT false;

-- Tornar campos de endereço opcionais (alterar de NOT NULL para NULL)
ALTER TABLE company_users 
ALTER COLUMN endereco DROP NOT NULL,
ALTER COLUMN numero DROP NOT NULL,
ALTER COLUMN bairro DROP NOT NULL,
ALTER COLUMN cep DROP NOT NULL;

-- Tornar campos demográficos opcionais inicialmente (serão preenchidos na ativação)
ALTER TABLE company_users 
ALTER COLUMN gender DROP NOT NULL,
ALTER COLUMN birth_date DROP NOT NULL,
ALTER COLUMN cidade DROP NOT NULL,
ALTER COLUMN estado DROP NOT NULL;

-- Comentários para documentar a mudança
COMMENT ON COLUMN company_users.needs_complete_registration IS 'Indica se o colaborador precisa completar o cadastro após ativação';
COMMENT ON COLUMN company_users.endereco IS 'Endereço - opcional para simplificar cadastro';
COMMENT ON COLUMN company_users.numero IS 'Número do endereço - opcional';
COMMENT ON COLUMN company_users.bairro IS 'Bairro - opcional';
COMMENT ON COLUMN company_users.cep IS 'CEP - opcional';
COMMENT ON COLUMN company_users.gender IS 'Sexo - preenchido na ativação';
COMMENT ON COLUMN company_users.birth_date IS 'Data de nascimento - preenchida na ativação';
COMMENT ON COLUMN company_users.cidade IS 'Cidade - preenchida na ativação para análises';
COMMENT ON COLUMN company_users.estado IS 'Estado - preenchido na ativação para análises'; 