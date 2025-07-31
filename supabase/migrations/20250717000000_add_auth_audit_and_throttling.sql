-- Tabela para registro de auditoria de autenticação
CREATE TABLE IF NOT EXISTS auth_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  user_id UUID,
  email TEXT,
  ip_address TEXT,
  user_agent TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  
  -- Índices para consultas comuns
  CONSTRAINT valid_event_type CHECK (
    event_type IN (
      'login_success', 
      'login_failure', 
      'logout', 
      'password_reset', 
      'password_change', 
      'signup'
    )
  )
);

-- Índices para melhorar performance de consultas
CREATE INDEX IF NOT EXISTS idx_auth_audit_logs_user_id ON auth_audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_auth_audit_logs_email ON auth_audit_logs(email);
CREATE INDEX IF NOT EXISTS idx_auth_audit_logs_event_type ON auth_audit_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_auth_audit_logs_created_at ON auth_audit_logs(created_at);

-- Tabela para controle de tentativas de login (throttling)
CREATE TABLE IF NOT EXISTS auth_login_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  attempt_count INTEGER DEFAULT 0 NOT NULL,
  last_attempt TIMESTAMPTZ DEFAULT now() NOT NULL,
  locked_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Índice para consultas por email
CREATE INDEX IF NOT EXISTS idx_auth_login_attempts_email ON auth_login_attempts(email);

-- Função para limpar registros antigos de auditoria (manter apenas 90 dias)
CREATE OR REPLACE FUNCTION cleanup_old_auth_audit_logs()
RETURNS void AS $$
BEGIN
  DELETE FROM auth_audit_logs
  WHERE created_at < NOW() - INTERVAL '90 days';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Configurar política RLS para auth_audit_logs
ALTER TABLE auth_audit_logs ENABLE ROW LEVEL SECURITY;

-- Apenas administradores podem ver todos os logs
CREATE POLICY admin_all_auth_audit_logs ON auth_audit_logs
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'producer'
    )
  );

-- Usuários podem ver apenas seus próprios logs
CREATE POLICY user_own_auth_audit_logs ON auth_audit_logs
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Configurar política RLS para auth_login_attempts
ALTER TABLE auth_login_attempts ENABLE ROW LEVEL SECURITY;

-- Apenas administradores podem ver e gerenciar tentativas de login
CREATE POLICY admin_all_auth_login_attempts ON auth_login_attempts
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'producer'
    )
  );

-- Função para resetar tentativas de login após login bem-sucedido
CREATE OR REPLACE FUNCTION reset_login_attempts(p_email TEXT)
RETURNS void AS $$
BEGIN
  UPDATE auth_login_attempts
  SET 
    attempt_count = 0,
    last_attempt = NOW(),
    locked_until = NULL,
    updated_at = NOW()
  WHERE email = p_email;
  
  -- Se não existir, criar um registro
  IF NOT FOUND THEN
    INSERT INTO auth_login_attempts (email, attempt_count, last_attempt)
    VALUES (p_email, 0, NOW());
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para incrementar tentativas de login após falha
CREATE OR REPLACE FUNCTION increment_login_attempts(p_email TEXT)
RETURNS JSONB AS $$
DECLARE
  v_current_attempts INTEGER;
  v_max_attempts INTEGER := 5;
  v_lockout_minutes INTEGER := 15;
  v_result JSONB;
BEGIN
  -- Verificar se já existe um registro para este email
  SELECT attempt_count INTO v_current_attempts
  FROM auth_login_attempts
  WHERE email = p_email;
  
  -- Se não existir, criar um registro
  IF v_current_attempts IS NULL THEN
    INSERT INTO auth_login_attempts (email, attempt_count, last_attempt)
    VALUES (p_email, 1, NOW())
    RETURNING attempt_count INTO v_current_attempts;
    
    v_result := json_build_object(
      'allowed', true,
      'remaining_attempts', v_max_attempts - v_current_attempts,
      'locked_until', null
    )::jsonb;
  ELSE
    -- Incrementar tentativas
    UPDATE auth_login_attempts
    SET 
      attempt_count = attempt_count + 1,
      last_attempt = NOW(),
      locked_until = CASE 
        WHEN attempt_count + 1 >= v_max_attempts THEN NOW() + (v_lockout_minutes * INTERVAL '1 minute')
        ELSE locked_until
      END,
      updated_at = NOW()
    WHERE email = p_email
    RETURNING 
      attempt_count, 
      locked_until,
      (attempt_count >= v_max_attempts) as is_locked,
      (v_max_attempts - attempt_count) as remaining_attempts
    INTO v_result;
  END IF;
  
  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para verificar status de throttling
CREATE OR REPLACE FUNCTION check_login_throttling(p_email TEXT)
RETURNS JSONB AS $$
DECLARE
  v_record auth_login_attempts%ROWTYPE;
  v_max_attempts INTEGER := 5;
  v_result JSONB;
BEGIN
  -- Verificar se existe um registro para este email
  SELECT * INTO v_record
  FROM auth_login_attempts
  WHERE email = p_email;
  
  -- Se não existir, criar um registro
  IF v_record IS NULL THEN
    INSERT INTO auth_login_attempts (email, attempt_count, last_attempt)
    VALUES (p_email, 0, NOW());
    
    v_result := json_build_object(
      'allowed', true,
      'remaining_attempts', v_max_attempts,
      'locked_until', null
    )::jsonb;
  ELSE
    -- Verificar se está bloqueado
    IF v_record.locked_until IS NOT NULL AND v_record.locked_until > NOW() THEN
      v_result := json_build_object(
        'allowed', false,
        'remaining_attempts', 0,
        'locked_until', v_record.locked_until
      )::jsonb;
    -- Verificar se deve resetar tentativas (24h desde última tentativa)
    ELSIF v_record.last_attempt < NOW() - INTERVAL '24 hours' THEN
      UPDATE auth_login_attempts
      SET 
        attempt_count = 0,
        last_attempt = NOW(),
        updated_at = NOW()
      WHERE email = p_email;
      
      v_result := json_build_object(
        'allowed', true,
        'remaining_attempts', v_max_attempts,
        'locked_until', null
      )::jsonb;
    ELSE
      v_result := json_build_object(
        'allowed', true,
        'remaining_attempts', v_max_attempts - v_record.attempt_count,
        'locked_until', v_record.locked_until
      )::jsonb;
    END IF;
  END IF;
  
  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;