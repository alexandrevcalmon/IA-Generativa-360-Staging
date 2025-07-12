-- Remove a coluna needs_password_change da tabela companies
ALTER TABLE companies DROP COLUMN IF EXISTS needs_password_change;

-- Remove a coluna needs_password_change da tabela company_users
ALTER TABLE company_users DROP COLUMN IF EXISTS needs_password_change;

-- Remover a função RPC que não é mais necessária
DROP FUNCTION IF EXISTS public.update_user_password_change_status(UUID, BOOLEAN);

-- Comentário: Com o novo sistema de convite por email, os usuários definem suas próprias senhas
-- na primeira ativação, eliminando a necessidade de forçar mudança de senha padrão. 