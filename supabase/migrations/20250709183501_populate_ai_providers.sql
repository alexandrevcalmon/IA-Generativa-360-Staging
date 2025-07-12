-- Popular a tabela ai_providers com provedores padrão
-- Este script é idempotente - não duplicará dados se já existirem

-- Inserir provedor OpenAI
INSERT INTO ai_providers (name, display_name, api_endpoint, requires_api_key, supported_models, default_model, is_active)
SELECT 
    'openai',
    'OpenAI',
    'https://api.openai.com/v1/chat/completions',
    true,
    '["gpt-4o", "gpt-4o-mini", "gpt-4", "gpt-3.5-turbo"]'::jsonb,
    'gpt-4o',
    true
WHERE NOT EXISTS (
    SELECT 1 FROM ai_providers WHERE name = 'openai'
);

-- Inserir provedor Google Gemini
INSERT INTO ai_providers (name, display_name, api_endpoint, requires_api_key, supported_models, default_model, is_active)
SELECT 
    'gemini',
    'Google Gemini',
    'https://generativelanguage.googleapis.com/v1/models/',
    true,
    '["gemini-2.0-flash-exp", "gemini-1.5-pro", "gemini-1.5-flash", "gemini-pro"]'::jsonb,
    'gemini-1.5-pro',
    true
WHERE NOT EXISTS (
    SELECT 1 FROM ai_providers WHERE name = 'gemini'
);

-- Inserir provedor DeepSeek
INSERT INTO ai_providers (name, display_name, api_endpoint, requires_api_key, supported_models, default_model, is_active)
SELECT 
    'deepseek',
    'DeepSeek',
    'https://api.deepseek.com/v1/chat/completions',
    true,
    '["deepseek-chat", "deepseek-coder"]'::jsonb,
    'deepseek-chat',
    true
WHERE NOT EXISTS (
    SELECT 1 FROM ai_providers WHERE name = 'deepseek'
);

-- Comentário: Estes provedores são necessários para o funcionamento do sistema de chat com IA
-- nas aulas. Cada empresa pode configurar suas próprias chaves de API. 