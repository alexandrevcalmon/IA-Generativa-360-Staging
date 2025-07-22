-- Script para limpar metadados de usuários quando uma empresa é deletada
-- Execute este script APÓS deletar a empresa do banco de dados

-- Substitua 'COMPANY_ID_AQUI' pelo ID da empresa que foi deletada
DO $$
DECLARE
    company_id_to_clean UUID := 'COMPANY_ID_AQUI'::UUID; -- SUBSTITUA AQUI
    user_record RECORD;
BEGIN
    -- Log inicial
    RAISE NOTICE 'Iniciando limpeza de metadados para empresa: %', company_id_to_clean;
    
    -- Buscar todos os usuários associados à empresa
    FOR user_record IN 
        SELECT cu.auth_user_id, cu.id as company_user_id
        FROM company_users cu
        WHERE cu.company_id = company_id_to_clean
    LOOP
        -- Log do usuário sendo processado
        RAISE NOTICE 'Processando usuário: %', user_record.auth_user_id;
        
        -- Atualizar tabela profiles (role para 'student')
        UPDATE profiles 
        SET 
            role = 'student',
            updated_at = NOW()
        WHERE id = user_record.auth_user_id;
        
        -- Log da atualização do profile
        IF FOUND THEN
            RAISE NOTICE 'Profile atualizado para usuário: %', user_record.auth_user_id;
        ELSE
            RAISE NOTICE 'Profile não encontrado para usuário: %', user_record.auth_user_id;
        END IF;
        
        -- Deletar registro da company_users
        DELETE FROM company_users 
        WHERE id = user_record.company_user_id;
        
        -- Log da deleção do company_user
        IF FOUND THEN
            RAISE NOTICE 'Company user deletado: %', user_record.company_user_id;
        ELSE
            RAISE NOTICE 'Company user não encontrado: %', user_record.company_user_id;
        END IF;
        
    END LOOP;
    
    -- Log final
    RAISE NOTICE 'Limpeza concluída para empresa: %', company_id_to_clean;
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Erro durante a limpeza: %', SQLERRM;
        RAISE;
END $$;

-- Verificar se a limpeza foi bem-sucedida
SELECT 
    'Verificação pós-limpeza' as status,
    COUNT(*) as total_company_users_restantes
FROM company_users 
WHERE company_id = 'COMPANY_ID_AQUI'::UUID; -- SUBSTITUA AQUI

-- Verificar usuários com role 'company' que podem ter ficado órfãos
SELECT 
    p.id,
    p.email,
    p.role,
    p.updated_at
FROM profiles p
WHERE p.role = 'company'
AND NOT EXISTS (
    SELECT 1 FROM company_users cu 
    WHERE cu.auth_user_id = p.id
)
ORDER BY p.updated_at DESC; 