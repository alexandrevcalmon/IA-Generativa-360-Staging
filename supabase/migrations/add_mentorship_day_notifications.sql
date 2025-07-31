-- Criar tabela para notificações de mentorias do dia
CREATE TABLE IF NOT EXISTS mentorship_day_notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  mentorship_session_id UUID NOT NULL REFERENCES producer_mentorship_sessions(id) ON DELETE CASCADE,
  notification_type TEXT NOT NULL CHECK (notification_type IN ('mentorship_today', 'mentorship_reminder')),
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  scheduled_date DATE NOT NULL,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  user_role TEXT NOT NULL CHECK (user_role IN ('collaborator', 'company', 'producer'))
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_mentorship_day_notifications_user_id ON mentorship_day_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_mentorship_day_notifications_read_at ON mentorship_day_notifications(read_at);
CREATE INDEX IF NOT EXISTS idx_mentorship_day_notifications_scheduled_date ON mentorship_day_notifications(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_mentorship_day_notifications_company_id ON mentorship_day_notifications(company_id);

-- RLS Policies
ALTER TABLE mentorship_day_notifications ENABLE ROW LEVEL SECURITY;

-- Política para colaboradores verem apenas suas notificações
CREATE POLICY "Collaborators can view their own mentorship day notifications" ON mentorship_day_notifications
  FOR SELECT USING (
    auth.uid() = user_id AND user_role = 'collaborator'
  );

-- Política para empresas verem notificações de sua empresa
CREATE POLICY "Companies can view their company mentorship day notifications" ON mentorship_day_notifications
  FOR SELECT USING (
    auth.uid() = user_id AND user_role = 'company' AND company_id IN (
      SELECT id FROM companies WHERE auth_user_id = auth.uid()
    )
  );

-- Política para produtores verem todas as notificações
CREATE POLICY "Producers can view all mentorship day notifications" ON mentorship_day_notifications
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE id = auth.uid() AND raw_user_meta_data->>'role' = 'producer'
    )
  );

-- Política para marcar como lida
CREATE POLICY "Users can update their own mentorship day notifications" ON mentorship_day_notifications
  FOR UPDATE USING (
    auth.uid() = user_id
  );

-- Função para criar notificações de mentoria do dia
CREATE OR REPLACE FUNCTION create_mentorship_day_notifications()
RETURNS TRIGGER AS $$
DECLARE
  today_date DATE := CURRENT_DATE;
  session_date DATE;
  company_record RECORD;
  collaborator_record RECORD;
BEGIN
  -- Verificar se a sessão é para hoje
  session_date := DATE(NEW.scheduled_at);
  
  IF session_date = today_date AND NEW.status = 'scheduled' THEN
    -- Notificar o produtor
    INSERT INTO mentorship_day_notifications (
      user_id, 
      mentorship_session_id, 
      notification_type, 
      scheduled_date, 
      user_role
    ) VALUES (
      NEW.producer_id,
      NEW.id,
      'mentorship_today',
      session_date,
      'producer'
    );
    
    -- Se for uma mentoria exclusiva para uma empresa
    IF NEW.is_collective = false AND NEW.target_company_id IS NOT NULL THEN
      -- Buscar dados da empresa
      SELECT * INTO company_record FROM companies WHERE id = NEW.target_company_id;
      
      IF company_record.id IS NOT NULL THEN
        -- Notificar a empresa
        INSERT INTO mentorship_day_notifications (
          user_id, 
          mentorship_session_id, 
          notification_type, 
          scheduled_date, 
          user_role,
          company_id
        ) VALUES (
          company_record.auth_user_id,
          NEW.id,
          'mentorship_today',
          session_date,
          'company',
          company_record.id
        );
        
        -- Notificar todos os colaboradores da empresa
        FOR collaborator_record IN 
          SELECT c.auth_user_id, c.company_id 
          FROM company_users c 
          WHERE c.company_id = NEW.target_company_id AND c.is_active = true
        LOOP
          INSERT INTO mentorship_day_notifications (
            user_id, 
            mentorship_session_id, 
            notification_type, 
            scheduled_date, 
            user_role,
            company_id
          ) VALUES (
            collaborator_record.auth_user_id,
            NEW.id,
            'mentorship_today',
            session_date,
            'collaborator',
            collaborator_record.company_id
          );
        END LOOP;
      END IF;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para criar notificações automaticamente
CREATE TRIGGER trigger_create_mentorship_day_notifications
  AFTER INSERT OR UPDATE ON producer_mentorship_sessions
  FOR EACH ROW
  EXECUTE FUNCTION create_mentorship_day_notifications();

-- Função para limpar notificações antigas (mais de 7 dias)
CREATE OR REPLACE FUNCTION cleanup_old_mentorship_notifications()
RETURNS void AS $$
BEGIN
  DELETE FROM mentorship_day_notifications 
  WHERE created_at < NOW() - INTERVAL '7 days';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Agendar limpeza automática (executar diariamente)
-- SELECT cron.schedule('cleanup-mentorship-notifications', '0 2 * * *', 'SELECT cleanup_old_mentorship_notifications();'); 