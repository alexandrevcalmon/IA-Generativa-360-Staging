-- Corrigir warnings de "Function Search Path Mutable" adicionando search_path explícito
-- Data: 2025-01-15

-- 1. Corrigir cleanup_old_mentorship_notifications
CREATE OR REPLACE FUNCTION cleanup_old_mentorship_notifications()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM mentorship_day_notifications 
  WHERE created_at < NOW() - INTERVAL '7 days';
END;
$$;

-- 2. Corrigir create_mentorship_day_notifications
CREATE OR REPLACE FUNCTION create_mentorship_day_notifications()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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

    -- Se for uma mentoria coletiva, notificar todas as empresas e colaboradores
    IF NEW.is_collective = true THEN
      -- Notificar todas as empresas ativas
      FOR company_record IN
        SELECT id, auth_user_id
        FROM companies
        WHERE is_active = true
      LOOP
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
          WHERE c.company_id = company_record.id AND c.is_active = true
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
      END LOOP;
    END IF;

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
$$;

-- 3. Corrigir update_updated_at_column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

-- 4. Corrigir create_ticket_notification
CREATE OR REPLACE FUNCTION create_ticket_notification()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Notificar produtores sobre novo ticket
  INSERT INTO support_ticket_notifications (ticket_id, user_id, notification_type)
  SELECT 
    NEW.id,
    p.auth_user_id,
    'new_ticket'
  FROM producers p
  WHERE p.is_active = true;
  
  RETURN NEW;
END;
$$;

-- 5. Corrigir create_reply_notification
CREATE OR REPLACE FUNCTION create_reply_notification()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Notificar o criador do ticket se a resposta não for dele
    -- Usar SECURITY DEFINER para executar com privilégios elevados
    INSERT INTO support_ticket_notifications (ticket_id, user_id, notification_type)
    SELECT NEW.ticket_id, st.created_by_user_id, 'ticket_reply'
    FROM support_tickets st
    WHERE st.id = NEW.ticket_id 
    AND st.created_by_user_id != NEW.author_user_id
    ON CONFLICT (ticket_id, user_id, notification_type) DO NOTHING;
    
    RETURN NEW;
END;
$$;

-- 6. Corrigir update_ticket_status_on_reply
CREATE OR REPLACE FUNCTION update_ticket_status_on_reply()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Se for a primeira resposta e o ticket ainda estiver 'open', mudar para 'in_progress'
  IF (SELECT status FROM support_tickets WHERE id = NEW.ticket_id) = 'open' THEN
    UPDATE support_tickets 
    SET 
      status = 'in_progress',
      updated_at = NOW()
    WHERE id = NEW.ticket_id;
    
    RAISE LOG 'Ticket % status updated to in_progress due to first reply', NEW.ticket_id;
  END IF;
  
  RETURN NEW;
END;
$$;

-- 7. Corrigir count_ticket_replies
CREATE OR REPLACE FUNCTION count_ticket_replies(ticket_id_param UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)::INTEGER 
    FROM support_ticket_replies 
    WHERE ticket_id = ticket_id_param
  );
END;
$$;

-- 8. Corrigir count_ticket_notifications
CREATE OR REPLACE FUNCTION count_ticket_notifications(ticket_id_param UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)::INTEGER 
    FROM support_ticket_notifications 
    WHERE ticket_id = ticket_id_param
  );
END;
$$; 