-- Script para configurar URLs de redirecionamento permitidas
-- Execute este script no SQL Editor do Supabase Dashboard

-- Verificar configurações atuais
SELECT 
  id,
  instance_id,
  key,
  value,
  created_at,
  updated_at
FROM auth.config 
WHERE key LIKE '%redirect%' OR key LIKE '%url%';

-- Configurar URLs de redirecionamento permitidas
-- Substitua as URLs abaixo pelas suas URLs reais
INSERT INTO auth.config (instance_id, key, value, created_at, updated_at)
VALUES 
  (
    (SELECT id FROM auth.instances LIMIT 1),
    'SITE_URL',
    'https://staging.grupocalmon.com',
    NOW(),
    NOW()
  ),
  (
    (SELECT id FROM auth.instances LIMIT 1),
    'URI_ALLOW_LIST',
    'https://staging.grupocalmon.com/activate-account,https://staging.grupocalmon.com/auth,https://staging.grupocalmon.com/dashboard',
    NOW(),
    NOW()
  )
ON CONFLICT (instance_id, key) 
DO UPDATE SET 
  value = EXCLUDED.value,
  updated_at = NOW();

-- Verificar se as configurações foram aplicadas
SELECT 
  id,
  instance_id,
  key,
  value,
  created_at,
  updated_at
FROM auth.config 
WHERE key IN ('SITE_URL', 'URI_ALLOW_LIST'); 