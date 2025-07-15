

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE OR REPLACE FUNCTION "public"."ensure_user_profile"("user_id" "uuid", "user_role" character varying DEFAULT 'student'::character varying) RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
    -- Insert profile if it doesn't exist
    INSERT INTO public.profiles (id, role, created_at, updated_at)
    VALUES (
        user_id, 
        COALESCE(user_role, 'student'),
        now(),
        now()
    )
    ON CONFLICT (id) DO UPDATE SET
        updated_at = now(),
        role = CASE 
            WHEN EXCLUDED.role != profiles.role THEN EXCLUDED.role 
            ELSE profiles.role 
        END;
EXCEPTION
    WHEN OTHERS THEN
        -- Log error but don't fail
        RAISE WARNING 'Failed to ensure profile for user %: %', user_id, SQLERRM;
END;
$$;


ALTER FUNCTION "public"."ensure_user_profile"("user_id" "uuid", "user_role" character varying) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."ensure_user_profile_consistency"() RETURNS TABLE("user_id" "uuid", "email" "text", "action_taken" "text")
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
    RETURN QUERY
    WITH missing_profiles AS (
        INSERT INTO public.profiles (id, role, created_at, updated_at)
        SELECT 
            au.id,
            'student'::character varying,
            now(),
            now()
        FROM auth.users au
        LEFT JOIN public.profiles p ON au.id = p.id
        WHERE p.id IS NULL
        ON CONFLICT (id) DO NOTHING
        RETURNING id
    )
    SELECT 
        au.id,
        au.email::text,  -- Cast to text to match expected return type
        CASE 
            WHEN mp.id IS NOT NULL THEN 'Created missing profile'::text
            ELSE 'Profile already exists'::text
        END as action_taken
    FROM auth.users au
    LEFT JOIN missing_profiles mp ON au.id = mp.id;
END;
$$;


ALTER FUNCTION "public"."ensure_user_profile_consistency"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_current_company_id"() RETURNS "uuid"
    LANGUAGE "sql" STABLE SECURITY DEFINER
    AS $$
  SELECT id FROM public.companies 
  WHERE auth_user_id = auth.uid()
  LIMIT 1;
$$;


ALTER FUNCTION "public"."get_current_company_id"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_current_student_id"() RETURNS "uuid"
    LANGUAGE "sql" STABLE SECURITY DEFINER
    AS $$
  SELECT id FROM public.company_users 
  WHERE auth_user_id = auth.uid()
  LIMIT 1;
$$;


ALTER FUNCTION "public"."get_current_student_id"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_user_role"("user_id" "uuid") RETURNS character varying
    LANGUAGE "plpgsql" STABLE SECURITY DEFINER
    AS $$
DECLARE
    user_role character varying;
BEGIN
    -- First check profiles table
    SELECT role INTO user_role
    FROM public.profiles 
    WHERE id = user_id;
    
    IF user_role IS NOT NULL THEN
        RETURN user_role;
    END IF;
    
    -- Check if it's a company user
    IF EXISTS (SELECT 1 FROM public.companies WHERE auth_user_id = user_id) THEN
        RETURN 'company';
    END IF;
    
    -- If not found in profiles, check company_users
    IF EXISTS (SELECT 1 FROM public.company_users WHERE auth_user_id = user_id) THEN
        RETURN 'student';
    END IF;
    
    -- Default fallback
    RETURN 'student';
EXCEPTION
    WHEN OTHERS THEN
        RAISE WARNING 'Error getting user role for %: %', user_id, SQLERRM;
        RETURN 'student';
END;
$$;


ALTER FUNCTION "public"."get_user_role"("user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_user_role_enhanced"("user_id" "uuid") RETURNS character varying
    LANGUAGE "plpgsql" STABLE SECURITY DEFINER
    AS $$
DECLARE
    user_role character varying;
BEGIN
    IF user_id IS NULL THEN
        RETURN 'student';
    END IF;
    
    -- Check if user is a producer first
    IF EXISTS (SELECT 1 FROM public.producers WHERE auth_user_id = user_id AND is_active = true) THEN
        RETURN 'producer';
    END IF;
    
    -- Check if user is a company owner
    IF EXISTS (SELECT 1 FROM public.companies WHERE auth_user_id = user_id) THEN
        RETURN 'company';
    END IF;
    
    -- Check profiles table for explicit role
    SELECT role INTO user_role
    FROM public.profiles 
    WHERE id = user_id;
    
    IF user_role IS NOT NULL AND user_role != 'student' THEN
        RETURN user_role;
    END IF;
    
    -- Check if it's a company collaborator
    IF EXISTS (SELECT 1 FROM public.company_users WHERE auth_user_id = user_id AND is_active = true) THEN
        RETURN 'collaborator';
    END IF;
    
    -- Default to student
    RETURN 'student';
EXCEPTION
    WHEN OTHERS THEN
        RETURN 'student';
END;
$$;


ALTER FUNCTION "public"."get_user_role_enhanced"("user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_user_role_safe"("user_id" "uuid") RETURNS character varying
    LANGUAGE "plpgsql" STABLE SECURITY DEFINER
    AS $$
DECLARE
    user_role character varying;
BEGIN
    -- Direct query without RLS interference
    SELECT role INTO user_role
    FROM public.profiles 
    WHERE id = user_id;
    
    -- Return the role or default to 'student'
    RETURN COALESCE(user_role, 'student');
EXCEPTION
    WHEN OTHERS THEN
        -- On any error, return safe default
        RETURN 'student';
END;
$$;


ALTER FUNCTION "public"."get_user_role_safe"("user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  INSERT INTO public.profiles (id, role)
  VALUES (NEW.id, 'student');
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_company_user"("user_id" "uuid") RETURNS boolean
    LANGUAGE "plpgsql" STABLE SECURITY DEFINER
    AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.companies 
        WHERE auth_user_id = user_id
    );
EXCEPTION
    WHEN OTHERS THEN
        RETURN false;
END;
$$;


ALTER FUNCTION "public"."is_company_user"("user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_current_user_producer"() RETURNS boolean
    LANGUAGE "sql" STABLE SECURITY DEFINER
    AS $$
    -- Check if current user has producer role without RLS interference
    SELECT EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND role = 'producer'
    );
$$;


ALTER FUNCTION "public"."is_current_user_producer"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_current_user_producer_enhanced"() RETURNS boolean
    LANGUAGE "plpgsql" STABLE SECURITY DEFINER
    AS $$
DECLARE
    current_user_id uuid;
BEGIN
    -- Get current user ID safely
    current_user_id := auth.uid();
    
    IF current_user_id IS NULL THEN
        RETURN false;
    END IF;
    
    -- First check producers table
    IF EXISTS (
        SELECT 1 FROM public.producers 
        WHERE auth_user_id = current_user_id AND is_active = true
    ) THEN
        RETURN true;
    END IF;
    
    -- Fallback: check profiles table
    IF EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = current_user_id AND role = 'producer'
    ) THEN
        -- Auto-migrate to producers table
        BEGIN
            INSERT INTO public.producers (auth_user_id, name, email)
            SELECT 
                current_user_id,
                COALESCE(au.raw_user_meta_data->>'name', 'Producer'),
                au.email
            FROM auth.users au 
            WHERE au.id = current_user_id
            ON CONFLICT (auth_user_id) DO NOTHING;
        EXCEPTION
            WHEN OTHERS THEN
                -- Log error but don't fail
                NULL;
        END;
        
        RETURN true;
    END IF;
    
    RETURN false;
EXCEPTION
    WHEN OTHERS THEN
        -- On any error, return false safely
        RETURN false;
END;
$$;


ALTER FUNCTION "public"."is_current_user_producer_enhanced"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_current_user_producer_new"() RETURNS boolean
    LANGUAGE "sql" STABLE SECURITY DEFINER
    AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.producers 
    WHERE auth_user_id = auth.uid() AND is_active = true
  );
$$;


ALTER FUNCTION "public"."is_current_user_producer_new"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_producer"("user_id" "uuid") RETURNS boolean
    LANGUAGE "plpgsql" STABLE SECURITY DEFINER
    AS $$
BEGIN
    -- Verificar se o usuário tem o role de producer na tabela profiles
    RETURN EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = user_id AND role = 'producer'
    );
EXCEPTION
    WHEN OTHERS THEN
        -- Em caso de erro, retornar false como padrão seguro
        RAISE WARNING 'Erro ao verificar role de producer para usuário %: %', user_id, SQLERRM;
        RETURN false;
END;
$$;


ALTER FUNCTION "public"."is_producer"("user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."migrate_existing_producers"() RETURNS TABLE("migrated_count" integer)
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    migration_count integer := 0;
BEGIN
    -- Inserir produtores da tabela profiles que não existem na tabela producers
    INSERT INTO public.producers (auth_user_id, name, email)
    SELECT 
        p.id,
        COALESCE(au.raw_user_meta_data->>'name', 'Producer'),
        au.email
    FROM public.profiles p
    JOIN auth.users au ON p.id = au.id
    WHERE p.role = 'producer'
    AND NOT EXISTS (
        SELECT 1 FROM public.producers pr 
        WHERE pr.auth_user_id = p.id
    )
    ON CONFLICT (auth_user_id) DO NOTHING;
    
    GET DIAGNOSTICS migration_count = ROW_COUNT;
    
    RETURN QUERY SELECT migration_count;
END;
$$;


ALTER FUNCTION "public"."migrate_existing_producers"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."set_course_instructor_id"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
    -- If instructor_id is null and the user is a producer, set it to the current user
    IF NEW.instructor_id IS NULL THEN
        -- Check if the current user is a producer
        IF EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'producer'
        ) THEN
            NEW.instructor_id = auth.uid();
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."set_course_instructor_id"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_collaborator_stats"() RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  -- Atualizar estatísticas baseadas nos dados existentes
  INSERT INTO public.collaborator_activity_stats (
    collaborator_id,
    company_id,
    lessons_completed,
    courses_enrolled,
    total_watch_time_minutes
  )
  SELECT 
    cu.id as collaborator_id,
    cu.company_id,
    COALESCE(lesson_stats.completed_lessons, 0) as lessons_completed,
    COALESCE(enrollment_stats.enrolled_courses, 0) as courses_enrolled,
    COALESCE(lesson_stats.total_watch_time, 0) as total_watch_time_minutes
  FROM public.company_users cu
  LEFT JOIN (
    SELECT 
      lp.user_id,
      COUNT(CASE WHEN lp.completed = true THEN 1 END) as completed_lessons,
      SUM(lp.watch_time_seconds) / 60 as total_watch_time
    FROM public.lesson_progress lp
    GROUP BY lp.user_id
  ) lesson_stats ON cu.auth_user_id = lesson_stats.user_id
  LEFT JOIN (
    SELECT 
      e.user_id,
      COUNT(*) as enrolled_courses
    FROM public.enrollments e
    GROUP BY e.user_id
  ) enrollment_stats ON cu.auth_user_id = enrollment_stats.user_id
  ON CONFLICT (collaborator_id) DO UPDATE SET
    lessons_completed = EXCLUDED.lessons_completed,
    courses_enrolled = EXCLUDED.courses_enrolled,
    total_watch_time_minutes = EXCLUDED.total_watch_time_minutes,
    updated_at = now();
END;
$$;


ALTER FUNCTION "public"."update_collaborator_stats"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_reply_likes_count"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.community_replies 
    SET likes_count = likes_count + 1 
    WHERE id = NEW.reply_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.community_replies 
    SET likes_count = likes_count - 1 
    WHERE id = OLD.reply_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;


ALTER FUNCTION "public"."update_reply_likes_count"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_topic_likes_count"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.community_topics 
    SET likes_count = likes_count + 1 
    WHERE id = NEW.topic_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.community_topics 
    SET likes_count = likes_count - 1 
    WHERE id = OLD.topic_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;


ALTER FUNCTION "public"."update_topic_likes_count"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_topic_replies_count"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.community_topics 
    SET replies_count = replies_count + 1 
    WHERE id = NEW.topic_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.community_topics 
    SET replies_count = replies_count - 1 
    WHERE id = OLD.topic_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;


ALTER FUNCTION "public"."update_topic_replies_count"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."achievements" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" character varying NOT NULL,
    "description" "text",
    "icon" character varying,
    "points_required" integer,
    "badge_color" character varying DEFAULT '#3B82F6'::character varying,
    "type" character varying NOT NULL,
    "criteria" "jsonb",
    "is_active" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "achievements_type_check" CHECK ((("type")::"text" = ANY (ARRAY[('course'::character varying)::"text", ('lesson'::character varying)::"text", ('mentorship'::character varying)::"text", ('streak'::character varying)::"text", ('points'::character varying)::"text", ('special'::character varying)::"text"])))
);


ALTER TABLE "public"."achievements" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."ai_chat_messages" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "session_id" "uuid",
    "role" character varying(20) NOT NULL,
    "content" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "ai_chat_messages_role_check" CHECK ((("role")::"text" = ANY (ARRAY[('user'::character varying)::"text", ('assistant'::character varying)::"text", ('system'::character varying)::"text"])))
);


ALTER TABLE "public"."ai_chat_messages" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."ai_chat_sessions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "lesson_id" "uuid",
    "user_id" "uuid" NOT NULL,
    "company_id" "uuid",
    "ai_configuration_id" "uuid",
    "session_data" "jsonb" DEFAULT '[]'::"jsonb" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."ai_chat_sessions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."ai_configurations" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "company_id" "uuid",
    "provider_id" "uuid",
    "model_name" character varying(100) NOT NULL,
    "api_key_encrypted" "text",
    "system_prompt" "text" DEFAULT 'Você é um assistente especializado em responder perguntas sobre o conteúdo das lições. Use apenas as informações fornecidas no contexto para responder.'::"text" NOT NULL,
    "temperature" numeric(3,2) DEFAULT 0.7 NOT NULL,
    "max_tokens" integer DEFAULT 1000 NOT NULL,
    "is_active" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "ai_configurations_max_tokens_check" CHECK ((("max_tokens" > 0) AND ("max_tokens" <= 8000))),
    CONSTRAINT "ai_configurations_temperature_check" CHECK ((("temperature" >= (0)::numeric) AND ("temperature" <= (2)::numeric)))
);


ALTER TABLE "public"."ai_configurations" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."ai_providers" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" character varying(50) NOT NULL,
    "display_name" character varying(100) NOT NULL,
    "api_endpoint" character varying(255) NOT NULL,
    "requires_api_key" boolean DEFAULT true NOT NULL,
    "supported_models" "jsonb" DEFAULT '[]'::"jsonb" NOT NULL,
    "default_model" character varying(100),
    "is_active" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."ai_providers" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."calendar_events" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "company_id" "uuid" NOT NULL,
    "title" character varying NOT NULL,
    "description" "text",
    "event_type" character varying NOT NULL,
    "start_date" timestamp with time zone NOT NULL,
    "end_date" timestamp with time zone NOT NULL,
    "all_day" boolean DEFAULT false NOT NULL,
    "location" character varying,
    "meet_url" character varying,
    "reference_id" "uuid",
    "color" character varying DEFAULT '#3B82F6'::character varying,
    "is_recurring" boolean DEFAULT false NOT NULL,
    "recurrence_rule" "jsonb",
    "created_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "calendar_events_event_type_check" CHECK ((("event_type")::"text" = ANY (ARRAY[('mentorship'::character varying)::"text", ('course_deadline'::character varying)::"text", ('company_meeting'::character varying)::"text", ('holiday'::character varying)::"text", ('training'::character varying)::"text"])))
);


ALTER TABLE "public"."calendar_events" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."certificates" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid",
    "course_id" "uuid",
    "certificate_url" character varying(500),
    "verification_code" character varying(100),
    "issued_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."certificates" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."collaborator_activity_logs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "collaborator_id" "uuid" NOT NULL,
    "company_id" "uuid" NOT NULL,
    "activity_type" character varying NOT NULL,
    "activity_data" "jsonb",
    "ip_address" "inet",
    "user_agent" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."collaborator_activity_logs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."collaborator_activity_stats" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "collaborator_id" "uuid" NOT NULL,
    "company_id" "uuid" NOT NULL,
    "last_login_at" timestamp with time zone,
    "total_login_count" integer DEFAULT 0,
    "total_watch_time_minutes" integer DEFAULT 0,
    "lessons_completed" integer DEFAULT 0,
    "lessons_started" integer DEFAULT 0,
    "courses_enrolled" integer DEFAULT 0,
    "courses_completed" integer DEFAULT 0,
    "quiz_attempts" integer DEFAULT 0,
    "quiz_passed" integer DEFAULT 0,
    "average_quiz_score" numeric(5,2) DEFAULT 0,
    "streak_days" integer DEFAULT 0,
    "total_points" integer DEFAULT 0,
    "current_level" integer DEFAULT 1,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."collaborator_activity_stats" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."community_replies" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "topic_id" "uuid" NOT NULL,
    "content" "text" NOT NULL,
    "author_id" "uuid" NOT NULL,
    "author_name" character varying NOT NULL,
    "author_email" character varying NOT NULL,
    "company_name" character varying,
    "likes_count" integer DEFAULT 0 NOT NULL,
    "is_solution" boolean DEFAULT false NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."community_replies" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."community_reply_likes" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "reply_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."community_reply_likes" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."community_topic_likes" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "topic_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."community_topic_likes" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."community_topics" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "title" character varying NOT NULL,
    "content" "text" NOT NULL,
    "author_id" "uuid" NOT NULL,
    "author_name" character varying NOT NULL,
    "author_email" character varying NOT NULL,
    "company_name" character varying,
    "category" character varying DEFAULT 'general'::character varying,
    "is_pinned" boolean DEFAULT false NOT NULL,
    "is_locked" boolean DEFAULT false NOT NULL,
    "likes_count" integer DEFAULT 0 NOT NULL,
    "replies_count" integer DEFAULT 0 NOT NULL,
    "views_count" integer DEFAULT 0 NOT NULL,
    "tags" "text"[],
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."community_topics" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."companies" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" character varying(255) NOT NULL,
    "logo_url" character varying(500),
    "max_students" integer DEFAULT 50,
    "current_students" integer DEFAULT 0,
    "subscription_plan" character varying(50) DEFAULT 'basic'::character varying,
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "subscription_plan_id" "uuid",
    "official_name" character varying(255),
    "cnpj" character varying(18),
    "email" character varying(255),
    "phone" character varying(20),
    "address_street" character varying(255),
    "address_number" character varying(10),
    "address_complement" character varying(100),
    "address_district" character varying(100),
    "address_city" character varying(100),
    "address_state" character varying(2),
    "address_zip_code" character varying(10),
    "contact_name" character varying(255),
    "contact_email" character varying(255),
    "contact_phone" character varying(20),
    "notes" "text",
    "auth_user_id" "uuid",
    "billing_period" character varying,
    "stripe_customer_id" "text",
    "stripe_subscription_id" "text",
    "subscription_status" "text" DEFAULT 'inactive'::"text",
    "stripe_plan_id" "text",
    "max_collaborators" integer DEFAULT 0,
    "subscription_period" "text",
    "subscription_ends_at" timestamp with time zone,
    "created_via_stripe" boolean DEFAULT false,
    CONSTRAINT "companies_billing_period_check" CHECK ((("billing_period")::"text" = ANY (ARRAY[('semester'::character varying)::"text", ('annual'::character varying)::"text"])))
);


ALTER TABLE "public"."companies" OWNER TO "postgres";


COMMENT ON COLUMN "public"."companies"."stripe_customer_id" IS 'ID do cliente no Stripe';



COMMENT ON COLUMN "public"."companies"."stripe_subscription_id" IS 'ID da assinatura no Stripe';



COMMENT ON COLUMN "public"."companies"."subscription_status" IS 'Status da assinatura: active, canceled, past_due, etc';



COMMENT ON COLUMN "public"."companies"."stripe_plan_id" IS 'ID do produto/plano no Stripe';



COMMENT ON COLUMN "public"."companies"."max_collaborators" IS 'Limite máximo de colaboradores conforme plano';



COMMENT ON COLUMN "public"."companies"."subscription_period" IS 'Período da assinatura: semestral, anual';



COMMENT ON COLUMN "public"."companies"."subscription_ends_at" IS 'Data de término da assinatura';



COMMENT ON COLUMN "public"."companies"."created_via_stripe" IS 'Indica se a empresa foi criada via fluxo Stripe';



CREATE TABLE IF NOT EXISTS "public"."company_messages" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "company_id" "uuid" NOT NULL,
    "sender_auth_user_id" "uuid" NOT NULL,
    "recipient_student_id" "uuid",
    "recipient_scope" character varying(50) DEFAULT 'INDIVIDUAL'::character varying NOT NULL,
    "subject" character varying(255) NOT NULL,
    "body" "text" NOT NULL,
    "read_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "company_messages_recipient_scope_check" CHECK ((("recipient_scope")::"text" = ANY (ARRAY[('INDIVIDUAL'::character varying)::"text", ('ALL_COMPANY_USERS'::character varying)::"text"])))
);


ALTER TABLE "public"."company_messages" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."company_users" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "auth_user_id" "uuid" NOT NULL,
    "company_id" "uuid" NOT NULL,
    "name" character varying(255) NOT NULL,
    "email" character varying(255) NOT NULL,
    "position" character varying(255),
    "is_active" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "phone" character varying(20),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "address" "text",
    "gender" character varying(20),
    "birth_date" "date",
    "city" character varying(255),
    "state" character varying(255),
    "country" character varying(255) DEFAULT 'Brasil'::character varying,
    "endereco" character varying(255),
    "numero" character varying(20),
    "complemento" character varying(100),
    "bairro" character varying(100),
    "cidade" character varying(100),
    "estado" character varying(50),
    "pais" character varying(50) DEFAULT 'Brasil'::character varying,
    "cep" character varying(10),
    "needs_complete_registration" boolean DEFAULT false,
    CONSTRAINT "company_users_gender_check" CHECK ((("gender")::"text" = ANY (ARRAY[('masculino'::character varying)::"text", ('feminino'::character varying)::"text", ('outro'::character varying)::"text", ('prefiro_nao_informar'::character varying)::"text"])))
);


ALTER TABLE "public"."company_users" OWNER TO "postgres";


COMMENT ON COLUMN "public"."company_users"."address" IS 'Endereço completo do colaborador';



COMMENT ON COLUMN "public"."company_users"."gender" IS 'Sexo - preenchido na ativação';



COMMENT ON COLUMN "public"."company_users"."birth_date" IS 'Data de nascimento - preenchida na ativação';



COMMENT ON COLUMN "public"."company_users"."city" IS 'Cidade do colaborador';



COMMENT ON COLUMN "public"."company_users"."state" IS 'Estado do colaborador';



COMMENT ON COLUMN "public"."company_users"."country" IS 'País do colaborador (padrão: Brasil)';



COMMENT ON COLUMN "public"."company_users"."endereco" IS 'Endereço - opcional para simplificar cadastro';



COMMENT ON COLUMN "public"."company_users"."numero" IS 'Número do endereço - opcional';



COMMENT ON COLUMN "public"."company_users"."bairro" IS 'Bairro - opcional';



COMMENT ON COLUMN "public"."company_users"."cidade" IS 'Cidade - preenchida na ativação para análises';



COMMENT ON COLUMN "public"."company_users"."estado" IS 'Estado - preenchido na ativação para análises';



COMMENT ON COLUMN "public"."company_users"."cep" IS 'CEP - opcional';



COMMENT ON COLUMN "public"."company_users"."needs_complete_registration" IS 'Indica se o colaborador precisa completar o cadastro após ativação';



CREATE TABLE IF NOT EXISTS "public"."course_modules" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "course_id" "uuid",
    "title" character varying(255) NOT NULL,
    "description" "text",
    "order_index" integer NOT NULL,
    "is_published" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "image_url" "text"
);


ALTER TABLE "public"."course_modules" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."courses" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "title" character varying(255) NOT NULL,
    "description" "text",
    "instructor_id" "uuid",
    "thumbnail_url" character varying(500),
    "category" character varying(100),
    "difficulty_level" character varying(50) DEFAULT 'beginner'::character varying,
    "estimated_hours" integer,
    "price" numeric(10,2) DEFAULT 0,
    "is_published" boolean DEFAULT false,
    "tags" "text"[],
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "is_sequential" boolean DEFAULT false NOT NULL,
    CONSTRAINT "courses_difficulty_level_check" CHECK ((("difficulty_level")::"text" = ANY (ARRAY[('beginner'::character varying)::"text", ('intermediate'::character varying)::"text", ('advanced'::character varying)::"text"])))
);


ALTER TABLE "public"."courses" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."discussion_replies" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "discussion_id" "uuid",
    "user_id" "uuid",
    "content" "text" NOT NULL,
    "likes_count" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."discussion_replies" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."discussions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "course_id" "uuid",
    "user_id" "uuid",
    "title" character varying(255) NOT NULL,
    "content" "text" NOT NULL,
    "likes_count" integer DEFAULT 0,
    "replies_count" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."discussions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."enrollments" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid",
    "course_id" "uuid",
    "enrolled_at" timestamp with time zone DEFAULT "now"(),
    "completed_at" timestamp with time zone,
    "progress_percentage" numeric(5,2) DEFAULT 0
);


ALTER TABLE "public"."enrollments" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."student_points" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "student_id" "uuid" NOT NULL,
    "points" integer DEFAULT 0 NOT NULL,
    "total_points" integer DEFAULT 0 NOT NULL,
    "level" integer DEFAULT 1 NOT NULL,
    "streak_days" integer DEFAULT 0 NOT NULL,
    "last_activity_date" "date",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."student_points" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."global_collaborator_ranking" AS
 SELECT "cu"."id" AS "collaborator_id",
    "cu"."name" AS "collaborator_name",
    "cu"."email" AS "collaborator_email",
    "cu"."company_id",
    "c"."name" AS "company_name",
    "sp"."total_points",
    "row_number"() OVER (ORDER BY "sp"."total_points" DESC, "cu"."name") AS "position"
   FROM (("public"."company_users" "cu"
     JOIN "public"."student_points" "sp" ON (("sp"."student_id" = "cu"."id")))
     JOIN "public"."companies" "c" ON (("c"."id" = "cu"."company_id")))
  WHERE ("cu"."is_active" = true)
  ORDER BY "sp"."total_points" DESC, "cu"."name";


ALTER VIEW "public"."global_collaborator_ranking" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."learning_path_courses" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "learning_path_id" "uuid" NOT NULL,
    "course_id" "uuid" NOT NULL,
    "order_index" integer NOT NULL,
    "is_required" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."learning_path_courses" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."learning_paths" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "company_id" "uuid" NOT NULL,
    "title" character varying(255) NOT NULL,
    "description" "text",
    "is_active" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."learning_paths" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."lesson_materials" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "lesson_id" "uuid",
    "company_id" "uuid",
    "file_name" character varying(255) NOT NULL,
    "file_url" "text" NOT NULL,
    "file_type" character varying(50) NOT NULL,
    "extracted_content" "text",
    "file_size_bytes" integer,
    "uploaded_by" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."lesson_materials" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."lesson_progress" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid",
    "lesson_id" "uuid",
    "completed" boolean DEFAULT false,
    "watch_time_seconds" integer DEFAULT 0,
    "last_watched_at" timestamp with time zone,
    "completed_at" timestamp with time zone
);


ALTER TABLE "public"."lesson_progress" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."lessons" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "module_id" "uuid",
    "title" character varying(255) NOT NULL,
    "content" "text",
    "video_url" character varying(500),
    "duration_minutes" integer,
    "order_index" integer NOT NULL,
    "is_free" boolean DEFAULT false,
    "resources" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "image_url" "text",
    "video_file_url" "text",
    "material_url" "text",
    "is_optional" boolean DEFAULT false NOT NULL
);


ALTER TABLE "public"."lessons" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."mentorship_attendees" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "mentorship_session_id" "uuid" NOT NULL,
    "student_id" "uuid" NOT NULL,
    "registered_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "attended" boolean,
    "joined_at" timestamp with time zone,
    "left_at" timestamp with time zone
);


ALTER TABLE "public"."mentorship_attendees" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."mentorship_participants" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "mentorship_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "registered_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "attended" boolean
);


ALTER TABLE "public"."mentorship_participants" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."mentorship_sessions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "company_id" "uuid" NOT NULL,
    "title" character varying NOT NULL,
    "description" "text",
    "scheduled_at" timestamp with time zone NOT NULL,
    "duration_minutes" integer DEFAULT 60 NOT NULL,
    "meet_url" character varying,
    "meet_id" character varying,
    "status" character varying DEFAULT 'scheduled'::character varying NOT NULL,
    "max_participants" integer DEFAULT 100,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "mentorship_sessions_status_check" CHECK ((("status")::"text" = ANY (ARRAY[('scheduled'::character varying)::"text", ('live'::character varying)::"text", ('completed'::character varying)::"text", ('cancelled'::character varying)::"text"])))
);


ALTER TABLE "public"."mentorship_sessions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."mentorships" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "company_id" "uuid" NOT NULL,
    "mentor_id" "uuid",
    "title" character varying(255) NOT NULL,
    "description" "text",
    "scheduled_at" timestamp with time zone NOT NULL,
    "duration_minutes" integer DEFAULT 60 NOT NULL,
    "max_participants" integer DEFAULT 10 NOT NULL,
    "meeting_url" character varying(500),
    "status" character varying(50) DEFAULT 'scheduled'::character varying NOT NULL,
    "is_active" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "mentorships_status_check" CHECK ((("status")::"text" = ANY (ARRAY[('scheduled'::character varying)::"text", ('in_progress'::character varying)::"text", ('completed'::character varying)::"text", ('cancelled'::character varying)::"text"])))
);


ALTER TABLE "public"."mentorships" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."points_history" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "student_id" "uuid" NOT NULL,
    "points" integer NOT NULL,
    "action_type" character varying NOT NULL,
    "description" "text",
    "reference_id" "uuid",
    "earned_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "points_history_action_type_check" CHECK ((("action_type")::"text" = ANY (ARRAY[('lesson_completed'::character varying)::"text", ('quiz_passed'::character varying)::"text", ('course_completed'::character varying)::"text", ('mentorship_attended'::character varying)::"text", ('daily_login'::character varying)::"text", ('achievement_unlocked'::character varying)::"text"])))
);


ALTER TABLE "public"."points_history" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."producer_mentorship_participants" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "session_id" "uuid" NOT NULL,
    "participant_id" "uuid" NOT NULL,
    "participant_name" character varying NOT NULL,
    "participant_email" character varying NOT NULL,
    "company_name" character varying,
    "registered_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "attended" boolean,
    "joined_at" timestamp with time zone,
    "left_at" timestamp with time zone
);


ALTER TABLE "public"."producer_mentorship_participants" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."producer_mentorship_sessions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "producer_id" "uuid" NOT NULL,
    "title" character varying NOT NULL,
    "description" "text",
    "scheduled_at" timestamp with time zone NOT NULL,
    "duration_minutes" integer DEFAULT 60 NOT NULL,
    "max_participants" integer DEFAULT 100,
    "google_meet_url" character varying,
    "google_meet_id" character varying,
    "status" character varying DEFAULT 'scheduled'::character varying NOT NULL,
    "is_active" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."producer_mentorship_sessions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."producers" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "auth_user_id" "uuid" NOT NULL,
    "name" character varying NOT NULL,
    "email" character varying NOT NULL,
    "is_active" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."producers" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" "uuid" NOT NULL,
    "role" character varying(50) DEFAULT 'student'::character varying NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "email" "text",
    "name" "text",
    CONSTRAINT "profiles_role_check" CHECK ((("role")::"text" = ANY (ARRAY[('student'::character varying)::"text", ('producer'::character varying)::"text", ('company'::character varying)::"text", ('collaborator'::character varying)::"text"])))
);


ALTER TABLE "public"."profiles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."quiz_attempts" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "quiz_id" "uuid" NOT NULL,
    "answers" "jsonb" NOT NULL,
    "score" numeric NOT NULL,
    "passed" boolean DEFAULT false,
    "attempt_number" integer DEFAULT 1,
    "completed_at" timestamp with time zone DEFAULT "now"(),
    "lesson_id" "uuid",
    "total_questions" integer,
    "correct_answers" integer
);


ALTER TABLE "public"."quiz_attempts" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."quizzes" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "lesson_id" "uuid",
    "title" character varying(255) NOT NULL,
    "description" "text",
    "questions" "jsonb" NOT NULL,
    "passing_score" integer DEFAULT 70,
    "max_attempts" integer DEFAULT 3,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "module_id" "uuid",
    "user_id" "uuid" NOT NULL,
    "status" "text" DEFAULT 'Aprovado'::"text"
);


ALTER TABLE "public"."quizzes" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."student_achievements" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "student_id" "uuid" NOT NULL,
    "achievement_id" "uuid" NOT NULL,
    "unlocked_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."student_achievements" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."subscription_plans" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" character varying NOT NULL,
    "description" "text",
    "price" numeric(10,2) NOT NULL,
    "max_students" integer NOT NULL,
    "features" "jsonb" DEFAULT '[]'::"jsonb" NOT NULL,
    "is_active" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "semester_price" numeric(10,2),
    "annual_price" numeric(10,2)
);


ALTER TABLE "public"."subscription_plans" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."users" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "email" character varying(255) NOT NULL,
    "name" character varying(255) NOT NULL,
    "avatar_url" character varying(500),
    "role" character varying(50) DEFAULT 'student'::character varying,
    "company_id" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "users_role_check" CHECK ((("role")::"text" = ANY (ARRAY[('student'::character varying)::"text", ('instructor'::character varying)::"text", ('admin'::character varying)::"text"])))
);


ALTER TABLE "public"."users" OWNER TO "postgres";


ALTER TABLE ONLY "public"."achievements"
    ADD CONSTRAINT "achievements_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."ai_chat_messages"
    ADD CONSTRAINT "ai_chat_messages_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."ai_chat_sessions"
    ADD CONSTRAINT "ai_chat_sessions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."ai_configurations"
    ADD CONSTRAINT "ai_configurations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."ai_providers"
    ADD CONSTRAINT "ai_providers_name_key" UNIQUE ("name");



ALTER TABLE ONLY "public"."ai_providers"
    ADD CONSTRAINT "ai_providers_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."calendar_events"
    ADD CONSTRAINT "calendar_events_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."certificates"
    ADD CONSTRAINT "certificates_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."certificates"
    ADD CONSTRAINT "certificates_verification_code_key" UNIQUE ("verification_code");



ALTER TABLE ONLY "public"."collaborator_activity_logs"
    ADD CONSTRAINT "collaborator_activity_logs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."collaborator_activity_stats"
    ADD CONSTRAINT "collaborator_activity_stats_collaborator_id_key" UNIQUE ("collaborator_id");



ALTER TABLE ONLY "public"."collaborator_activity_stats"
    ADD CONSTRAINT "collaborator_activity_stats_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."community_replies"
    ADD CONSTRAINT "community_replies_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."community_reply_likes"
    ADD CONSTRAINT "community_reply_likes_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."community_reply_likes"
    ADD CONSTRAINT "community_reply_likes_reply_id_user_id_key" UNIQUE ("reply_id", "user_id");



ALTER TABLE ONLY "public"."community_topic_likes"
    ADD CONSTRAINT "community_topic_likes_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."community_topic_likes"
    ADD CONSTRAINT "community_topic_likes_topic_id_user_id_key" UNIQUE ("topic_id", "user_id");



ALTER TABLE ONLY "public"."community_topics"
    ADD CONSTRAINT "community_topics_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."companies"
    ADD CONSTRAINT "companies_auth_user_id_key" UNIQUE ("auth_user_id");



ALTER TABLE ONLY "public"."companies"
    ADD CONSTRAINT "companies_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."company_messages"
    ADD CONSTRAINT "company_messages_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."company_users"
    ADD CONSTRAINT "company_users_auth_user_id_company_id_key" UNIQUE ("auth_user_id", "company_id");



ALTER TABLE ONLY "public"."company_users"
    ADD CONSTRAINT "company_users_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."course_modules"
    ADD CONSTRAINT "course_modules_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."courses"
    ADD CONSTRAINT "courses_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."discussion_replies"
    ADD CONSTRAINT "discussion_replies_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."discussions"
    ADD CONSTRAINT "discussions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."enrollments"
    ADD CONSTRAINT "enrollments_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."enrollments"
    ADD CONSTRAINT "enrollments_user_id_course_id_key" UNIQUE ("user_id", "course_id");



ALTER TABLE ONLY "public"."learning_path_courses"
    ADD CONSTRAINT "learning_path_courses_learning_path_id_course_id_key" UNIQUE ("learning_path_id", "course_id");



ALTER TABLE ONLY "public"."learning_path_courses"
    ADD CONSTRAINT "learning_path_courses_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."learning_paths"
    ADD CONSTRAINT "learning_paths_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."lesson_materials"
    ADD CONSTRAINT "lesson_materials_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."lesson_progress"
    ADD CONSTRAINT "lesson_progress_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."lesson_progress"
    ADD CONSTRAINT "lesson_progress_user_id_lesson_id_key" UNIQUE ("user_id", "lesson_id");



ALTER TABLE ONLY "public"."lessons"
    ADD CONSTRAINT "lessons_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."mentorship_attendees"
    ADD CONSTRAINT "mentorship_attendees_mentorship_session_id_student_id_key" UNIQUE ("mentorship_session_id", "student_id");



ALTER TABLE ONLY "public"."mentorship_attendees"
    ADD CONSTRAINT "mentorship_attendees_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."mentorship_participants"
    ADD CONSTRAINT "mentorship_participants_mentorship_id_user_id_key" UNIQUE ("mentorship_id", "user_id");



ALTER TABLE ONLY "public"."mentorship_participants"
    ADD CONSTRAINT "mentorship_participants_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."mentorship_sessions"
    ADD CONSTRAINT "mentorship_sessions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."mentorships"
    ADD CONSTRAINT "mentorships_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."points_history"
    ADD CONSTRAINT "points_history_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."producer_mentorship_participants"
    ADD CONSTRAINT "producer_mentorship_participants_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."producer_mentorship_sessions"
    ADD CONSTRAINT "producer_mentorship_sessions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."producers"
    ADD CONSTRAINT "producers_auth_user_id_key" UNIQUE ("auth_user_id");



ALTER TABLE ONLY "public"."producers"
    ADD CONSTRAINT "producers_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."quiz_attempts"
    ADD CONSTRAINT "quiz_attempts_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."quizzes"
    ADD CONSTRAINT "quizzes_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."student_achievements"
    ADD CONSTRAINT "student_achievements_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."student_achievements"
    ADD CONSTRAINT "student_achievements_student_id_achievement_id_key" UNIQUE ("student_id", "achievement_id");



ALTER TABLE ONLY "public"."student_points"
    ADD CONSTRAINT "student_points_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."student_points"
    ADD CONSTRAINT "student_points_student_id_key" UNIQUE ("student_id");



ALTER TABLE ONLY "public"."subscription_plans"
    ADD CONSTRAINT "subscription_plans_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_email_key" UNIQUE ("email");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_pkey" PRIMARY KEY ("id");



CREATE UNIQUE INDEX "ai_configurations_unique_company" ON "public"."ai_configurations" USING "btree" ("company_id", "provider_id") WHERE ("company_id" IS NOT NULL);



CREATE UNIQUE INDEX "ai_configurations_unique_global" ON "public"."ai_configurations" USING "btree" ("provider_id") WHERE ("company_id" IS NULL);



CREATE INDEX "idx_ai_chat_messages_session" ON "public"."ai_chat_messages" USING "btree" ("session_id");



CREATE INDEX "idx_ai_chat_sessions_company" ON "public"."ai_chat_sessions" USING "btree" ("company_id");



CREATE INDEX "idx_ai_chat_sessions_lesson_user" ON "public"."ai_chat_sessions" USING "btree" ("lesson_id", "user_id");



CREATE INDEX "idx_calendar_events_company_date" ON "public"."calendar_events" USING "btree" ("company_id", "start_date");



CREATE INDEX "idx_calendar_events_type" ON "public"."calendar_events" USING "btree" ("event_type");



CREATE INDEX "idx_collaborator_activity_logs_collaborator" ON "public"."collaborator_activity_logs" USING "btree" ("collaborator_id");



CREATE INDEX "idx_collaborator_activity_logs_company" ON "public"."collaborator_activity_logs" USING "btree" ("company_id");



CREATE INDEX "idx_collaborator_activity_logs_created_at" ON "public"."collaborator_activity_logs" USING "btree" ("created_at");



CREATE INDEX "idx_collaborator_activity_stats_collaborator" ON "public"."collaborator_activity_stats" USING "btree" ("collaborator_id");



CREATE INDEX "idx_collaborator_activity_stats_company" ON "public"."collaborator_activity_stats" USING "btree" ("company_id");



CREATE INDEX "idx_companies_auth_user_id" ON "public"."companies" USING "btree" ("auth_user_id");



CREATE INDEX "idx_companies_stripe_customer_id" ON "public"."companies" USING "btree" ("stripe_customer_id");



CREATE INDEX "idx_companies_stripe_subscription_id" ON "public"."companies" USING "btree" ("stripe_subscription_id");



CREATE INDEX "idx_companies_subscription_status" ON "public"."companies" USING "btree" ("subscription_status");



CREATE INDEX "idx_company_messages_company_id" ON "public"."company_messages" USING "btree" ("company_id");



CREATE INDEX "idx_company_messages_recipient" ON "public"."company_messages" USING "btree" ("recipient_student_id");



CREATE INDEX "idx_company_users_auth_user_id" ON "public"."company_users" USING "btree" ("auth_user_id");



CREATE INDEX "idx_company_users_birth_date" ON "public"."company_users" USING "btree" ("birth_date");



CREATE INDEX "idx_company_users_city" ON "public"."company_users" USING "btree" ("city");



CREATE INDEX "idx_company_users_company_id" ON "public"."company_users" USING "btree" ("company_id");



CREATE INDEX "idx_company_users_state" ON "public"."company_users" USING "btree" ("state");



CREATE INDEX "idx_courses_instructor_id" ON "public"."courses" USING "btree" ("instructor_id");



CREATE INDEX "idx_discussions_course_id" ON "public"."discussions" USING "btree" ("course_id");



CREATE INDEX "idx_enrollments_course_id" ON "public"."enrollments" USING "btree" ("course_id");



CREATE INDEX "idx_enrollments_user_id" ON "public"."enrollments" USING "btree" ("user_id");



CREATE INDEX "idx_learning_path_courses_learning_path_id" ON "public"."learning_path_courses" USING "btree" ("learning_path_id");



CREATE INDEX "idx_learning_paths_company_id" ON "public"."learning_paths" USING "btree" ("company_id");



CREATE INDEX "idx_lesson_progress_user_id" ON "public"."lesson_progress" USING "btree" ("user_id");



CREATE INDEX "idx_mentorship_attendees_session" ON "public"."mentorship_attendees" USING "btree" ("mentorship_session_id");



CREATE INDEX "idx_mentorship_attendees_student" ON "public"."mentorship_attendees" USING "btree" ("student_id");



CREATE INDEX "idx_mentorship_participants_mentorship_id" ON "public"."mentorship_participants" USING "btree" ("mentorship_id");



CREATE INDEX "idx_mentorship_participants_user_id" ON "public"."mentorship_participants" USING "btree" ("user_id");



CREATE INDEX "idx_mentorship_sessions_company_scheduled" ON "public"."mentorship_sessions" USING "btree" ("company_id", "scheduled_at");



CREATE INDEX "idx_mentorship_sessions_status" ON "public"."mentorship_sessions" USING "btree" ("status");



CREATE INDEX "idx_mentorships_company_id" ON "public"."mentorships" USING "btree" ("company_id");



CREATE INDEX "idx_mentorships_scheduled_at" ON "public"."mentorships" USING "btree" ("scheduled_at");



CREATE INDEX "idx_points_history_earned_at" ON "public"."points_history" USING "btree" ("earned_at");



CREATE INDEX "idx_points_history_student" ON "public"."points_history" USING "btree" ("student_id");



CREATE INDEX "idx_producer_mentorship_participants_participant_id" ON "public"."producer_mentorship_participants" USING "btree" ("participant_id");



CREATE INDEX "idx_producer_mentorship_participants_session_id" ON "public"."producer_mentorship_participants" USING "btree" ("session_id");



CREATE INDEX "idx_producer_mentorship_sessions_producer_id" ON "public"."producer_mentorship_sessions" USING "btree" ("producer_id");



CREATE INDEX "idx_producer_mentorship_sessions_scheduled_at" ON "public"."producer_mentorship_sessions" USING "btree" ("scheduled_at");



CREATE INDEX "idx_profiles_role" ON "public"."profiles" USING "btree" ("role");



CREATE INDEX "idx_student_achievements_student" ON "public"."student_achievements" USING "btree" ("student_id");



CREATE INDEX "idx_student_points_student" ON "public"."student_points" USING "btree" ("student_id");



CREATE OR REPLACE TRIGGER "reply_likes_count_trigger" AFTER INSERT OR DELETE ON "public"."community_reply_likes" FOR EACH ROW EXECUTE FUNCTION "public"."update_reply_likes_count"();



CREATE OR REPLACE TRIGGER "set_course_instructor_trigger" BEFORE INSERT ON "public"."courses" FOR EACH ROW EXECUTE FUNCTION "public"."set_course_instructor_id"();



CREATE OR REPLACE TRIGGER "topic_likes_count_trigger" AFTER INSERT OR DELETE ON "public"."community_topic_likes" FOR EACH ROW EXECUTE FUNCTION "public"."update_topic_likes_count"();



CREATE OR REPLACE TRIGGER "topic_replies_count_trigger" AFTER INSERT OR DELETE ON "public"."community_replies" FOR EACH ROW EXECUTE FUNCTION "public"."update_topic_replies_count"();



ALTER TABLE ONLY "public"."ai_chat_messages"
    ADD CONSTRAINT "ai_chat_messages_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "public"."ai_chat_sessions"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."ai_chat_sessions"
    ADD CONSTRAINT "ai_chat_sessions_ai_configuration_id_fkey" FOREIGN KEY ("ai_configuration_id") REFERENCES "public"."ai_configurations"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."ai_chat_sessions"
    ADD CONSTRAINT "ai_chat_sessions_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."ai_chat_sessions"
    ADD CONSTRAINT "ai_chat_sessions_lesson_id_fkey" FOREIGN KEY ("lesson_id") REFERENCES "public"."lessons"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."ai_configurations"
    ADD CONSTRAINT "ai_configurations_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."ai_configurations"
    ADD CONSTRAINT "ai_configurations_provider_id_fkey" FOREIGN KEY ("provider_id") REFERENCES "public"."ai_providers"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."calendar_events"
    ADD CONSTRAINT "calendar_events_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."calendar_events"
    ADD CONSTRAINT "calendar_events_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."company_users"("id");



ALTER TABLE ONLY "public"."certificates"
    ADD CONSTRAINT "certificates_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."certificates"
    ADD CONSTRAINT "certificates_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."collaborator_activity_logs"
    ADD CONSTRAINT "collaborator_activity_logs_collaborator_id_fkey" FOREIGN KEY ("collaborator_id") REFERENCES "public"."company_users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."collaborator_activity_logs"
    ADD CONSTRAINT "collaborator_activity_logs_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."collaborator_activity_stats"
    ADD CONSTRAINT "collaborator_activity_stats_collaborator_id_fkey" FOREIGN KEY ("collaborator_id") REFERENCES "public"."company_users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."collaborator_activity_stats"
    ADD CONSTRAINT "collaborator_activity_stats_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."community_replies"
    ADD CONSTRAINT "community_replies_topic_id_fkey" FOREIGN KEY ("topic_id") REFERENCES "public"."community_topics"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."community_reply_likes"
    ADD CONSTRAINT "community_reply_likes_reply_id_fkey" FOREIGN KEY ("reply_id") REFERENCES "public"."community_replies"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."community_topic_likes"
    ADD CONSTRAINT "community_topic_likes_topic_id_fkey" FOREIGN KEY ("topic_id") REFERENCES "public"."community_topics"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."companies"
    ADD CONSTRAINT "companies_auth_user_id_fkey" FOREIGN KEY ("auth_user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."companies"
    ADD CONSTRAINT "companies_subscription_plan_id_fkey" FOREIGN KEY ("subscription_plan_id") REFERENCES "public"."subscription_plans"("id");



ALTER TABLE ONLY "public"."company_messages"
    ADD CONSTRAINT "company_messages_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."company_messages"
    ADD CONSTRAINT "company_messages_recipient_student_id_fkey" FOREIGN KEY ("recipient_student_id") REFERENCES "public"."company_users"("id");



ALTER TABLE ONLY "public"."company_messages"
    ADD CONSTRAINT "company_messages_sender_auth_user_id_fkey" FOREIGN KEY ("sender_auth_user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."company_users"
    ADD CONSTRAINT "company_users_auth_user_id_fkey" FOREIGN KEY ("auth_user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."company_users"
    ADD CONSTRAINT "company_users_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."course_modules"
    ADD CONSTRAINT "course_modules_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."courses"
    ADD CONSTRAINT "courses_instructor_id_fkey" FOREIGN KEY ("instructor_id") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."discussion_replies"
    ADD CONSTRAINT "discussion_replies_discussion_id_fkey" FOREIGN KEY ("discussion_id") REFERENCES "public"."discussions"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."discussion_replies"
    ADD CONSTRAINT "discussion_replies_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."discussions"
    ADD CONSTRAINT "discussions_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."discussions"
    ADD CONSTRAINT "discussions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."enrollments"
    ADD CONSTRAINT "enrollments_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."enrollments"
    ADD CONSTRAINT "enrollments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "fk_users_company" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id");



ALTER TABLE ONLY "public"."learning_path_courses"
    ADD CONSTRAINT "learning_path_courses_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."learning_path_courses"
    ADD CONSTRAINT "learning_path_courses_learning_path_id_fkey" FOREIGN KEY ("learning_path_id") REFERENCES "public"."learning_paths"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."learning_paths"
    ADD CONSTRAINT "learning_paths_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."lesson_materials"
    ADD CONSTRAINT "lesson_materials_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."lesson_materials"
    ADD CONSTRAINT "lesson_materials_lesson_id_fkey" FOREIGN KEY ("lesson_id") REFERENCES "public"."lessons"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."lesson_progress"
    ADD CONSTRAINT "lesson_progress_lesson_id_fkey" FOREIGN KEY ("lesson_id") REFERENCES "public"."lessons"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."lesson_progress"
    ADD CONSTRAINT "lesson_progress_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."lessons"
    ADD CONSTRAINT "lessons_module_id_fkey" FOREIGN KEY ("module_id") REFERENCES "public"."course_modules"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."mentorship_attendees"
    ADD CONSTRAINT "mentorship_attendees_mentorship_session_id_fkey" FOREIGN KEY ("mentorship_session_id") REFERENCES "public"."mentorship_sessions"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."mentorship_attendees"
    ADD CONSTRAINT "mentorship_attendees_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "public"."company_users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."mentorship_participants"
    ADD CONSTRAINT "mentorship_participants_mentorship_id_fkey" FOREIGN KEY ("mentorship_id") REFERENCES "public"."mentorships"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."mentorship_participants"
    ADD CONSTRAINT "mentorship_participants_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."mentorship_sessions"
    ADD CONSTRAINT "mentorship_sessions_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."mentorships"
    ADD CONSTRAINT "mentorships_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."mentorships"
    ADD CONSTRAINT "mentorships_mentor_id_fkey" FOREIGN KEY ("mentor_id") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."points_history"
    ADD CONSTRAINT "points_history_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "public"."company_users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."producer_mentorship_participants"
    ADD CONSTRAINT "producer_mentorship_participants_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "public"."producer_mentorship_sessions"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."producers"
    ADD CONSTRAINT "producers_auth_user_id_fkey" FOREIGN KEY ("auth_user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."quiz_attempts"
    ADD CONSTRAINT "quiz_attempts_lesson_id_fkey" FOREIGN KEY ("lesson_id") REFERENCES "public"."lessons"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."quiz_attempts"
    ADD CONSTRAINT "quiz_attempts_quiz_id_fkey" FOREIGN KEY ("quiz_id") REFERENCES "public"."quizzes"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."quiz_attempts"
    ADD CONSTRAINT "quiz_attempts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."quizzes"
    ADD CONSTRAINT "quizzes_lesson_id_fkey" FOREIGN KEY ("lesson_id") REFERENCES "public"."lessons"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."quizzes"
    ADD CONSTRAINT "quizzes_module_id_fkey" FOREIGN KEY ("module_id") REFERENCES "public"."course_modules"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."student_achievements"
    ADD CONSTRAINT "student_achievements_achievement_id_fkey" FOREIGN KEY ("achievement_id") REFERENCES "public"."achievements"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."student_achievements"
    ADD CONSTRAINT "student_achievements_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "public"."company_users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."student_points"
    ADD CONSTRAINT "student_points_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "public"."company_users"("id") ON DELETE CASCADE;



CREATE POLICY "AI providers are viewable by authenticated users" ON "public"."ai_providers" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Allow delete own quiz attempts" ON "public"."quiz_attempts" FOR DELETE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Allow insert for authenticated" ON "public"."quizzes" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Allow insert own quiz attempts" ON "public"."quiz_attempts" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Allow select for authenticated" ON "public"."quizzes" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Allow select own quiz attempts" ON "public"."quiz_attempts" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Allow update own quiz attempts" ON "public"."quiz_attempts" FOR UPDATE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Anyone can check producer status" ON "public"."producers" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Anyone can view active plans" ON "public"."subscription_plans" FOR SELECT USING (("is_active" = true));



CREATE POLICY "Anyone can view active subscription plans" ON "public"."subscription_plans" FOR SELECT USING (("is_active" = true));



CREATE POLICY "Authenticated users can check roles" ON "public"."profiles" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Authenticated users can create replies" ON "public"."community_replies" FOR INSERT WITH CHECK (("auth"."uid"() = "author_id"));



CREATE POLICY "Authenticated users can create topics" ON "public"."community_topics" FOR INSERT WITH CHECK (("auth"."uid"() = "author_id"));



CREATE POLICY "Authors and producers can delete replies" ON "public"."community_replies" FOR DELETE USING ((("auth"."uid"() = "author_id") OR (EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND (("profiles"."role")::"text" = 'producer'::"text"))))));



CREATE POLICY "Authors and producers can delete topics" ON "public"."community_topics" FOR DELETE USING ((("auth"."uid"() = "author_id") OR (EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND (("profiles"."role")::"text" = 'producer'::"text"))))));



CREATE POLICY "Authors and producers can update replies" ON "public"."community_replies" FOR UPDATE USING ((("auth"."uid"() = "author_id") OR (EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND (("profiles"."role")::"text" = 'producer'::"text"))))));



CREATE POLICY "Authors and producers can update topics" ON "public"."community_topics" FOR UPDATE USING ((("auth"."uid"() = "author_id") OR (EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND (("profiles"."role")::"text" = 'producer'::"text"))))));



CREATE POLICY "Collaborators and students can view lessons from published modu" ON "public"."lessons" FOR SELECT USING (((EXISTS ( SELECT 1
   FROM "public"."course_modules" "cm"
  WHERE (("cm"."id" = "lessons"."module_id") AND ("cm"."is_published" = true)))) AND ((("public"."get_user_role_safe"("auth"."uid"()))::"text" = ANY (ARRAY[('student'::character varying)::"text", ('collaborator'::character varying)::"text"])) OR (EXISTS ( SELECT 1
   FROM "public"."company_users"
  WHERE (("company_users"."auth_user_id" = "auth"."uid"()) AND ("company_users"."is_active" = true)))))));



CREATE POLICY "Collaborators and students can view published course modules" ON "public"."course_modules" FOR SELECT USING ((("is_published" = true) AND ((("public"."get_user_role_safe"("auth"."uid"()))::"text" = ANY (ARRAY[('student'::character varying)::"text", ('collaborator'::character varying)::"text"])) OR (EXISTS ( SELECT 1
   FROM "public"."company_users"
  WHERE (("company_users"."auth_user_id" = "auth"."uid"()) AND ("company_users"."is_active" = true)))))));



CREATE POLICY "Collaborators and students can view published courses" ON "public"."courses" FOR SELECT USING ((("is_published" = true) AND ((("public"."get_user_role_safe"("auth"."uid"()))::"text" = ANY (ARRAY[('student'::character varying)::"text", ('collaborator'::character varying)::"text"])) OR (EXISTS ( SELECT 1
   FROM "public"."company_users"
  WHERE (("company_users"."auth_user_id" = "auth"."uid"()) AND ("company_users"."is_active" = true)))))));



CREATE POLICY "Collaborators can view their company data" ON "public"."companies" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."company_users"
  WHERE (("company_users"."auth_user_id" = "auth"."uid"()) AND ("company_users"."company_id" = "companies"."id") AND ("company_users"."is_active" = true)))));



CREATE POLICY "Collaborators view company data" ON "public"."companies" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."company_users"
  WHERE (("company_users"."auth_user_id" = "auth"."uid"()) AND ("company_users"."company_id" = "companies"."id")))));



CREATE POLICY "Companies can delete their own AI configurations" ON "public"."ai_configurations" FOR DELETE TO "authenticated" USING (("company_id" IN ( SELECT "companies"."id"
   FROM "public"."companies"
  WHERE ("companies"."auth_user_id" = "auth"."uid"()))));



CREATE POLICY "Companies can delete their own lesson materials" ON "public"."lesson_materials" FOR DELETE TO "authenticated" USING (("company_id" IN ( SELECT "companies"."id"
   FROM "public"."companies"
  WHERE ("companies"."auth_user_id" = "auth"."uid"()))));



CREATE POLICY "Companies can insert messages for their users" ON "public"."company_messages" FOR INSERT WITH CHECK (("company_id" = "public"."get_current_company_id"()));



CREATE POLICY "Companies can insert their own AI configurations" ON "public"."ai_configurations" FOR INSERT TO "authenticated" WITH CHECK (("company_id" IN ( SELECT "companies"."id"
   FROM "public"."companies"
  WHERE ("companies"."auth_user_id" = "auth"."uid"()))));



CREATE POLICY "Companies can insert their own lesson materials" ON "public"."lesson_materials" FOR INSERT TO "authenticated" WITH CHECK (("company_id" IN ( SELECT "companies"."id"
   FROM "public"."companies"
  WHERE ("companies"."auth_user_id" = "auth"."uid"()))));



CREATE POLICY "Companies can manage their own mentorship sessions" ON "public"."mentorship_sessions" USING (("company_id" IN ( SELECT "companies"."id"
   FROM "public"."companies"
  WHERE ("companies"."auth_user_id" = "auth"."uid"())))) WITH CHECK (("company_id" IN ( SELECT "companies"."id"
   FROM "public"."companies"
  WHERE ("companies"."auth_user_id" = "auth"."uid"()))));



CREATE POLICY "Companies can update their own AI configurations" ON "public"."ai_configurations" FOR UPDATE TO "authenticated" USING (("company_id" IN ( SELECT "companies"."id"
   FROM "public"."companies"
  WHERE ("companies"."auth_user_id" = "auth"."uid"()))));



CREATE POLICY "Companies can update their own data" ON "public"."companies" FOR UPDATE USING (("auth_user_id" = "auth"."uid"())) WITH CHECK (("auth_user_id" = "auth"."uid"()));



CREATE POLICY "Companies can update their own lesson materials" ON "public"."lesson_materials" FOR UPDATE TO "authenticated" USING (("company_id" IN ( SELECT "companies"."id"
   FROM "public"."companies"
  WHERE ("companies"."auth_user_id" = "auth"."uid"()))));



CREATE POLICY "Companies can view collaborator enrollments simple" ON "public"."enrollments" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM ("public"."company_users" "cu"
     JOIN "public"."companies" "c" ON (("cu"."company_id" = "c"."id")))
  WHERE (("cu"."auth_user_id" = "enrollments"."user_id") AND ("c"."auth_user_id" = "auth"."uid"())))));



CREATE POLICY "Companies can view their collaborators" ON "public"."company_users" FOR SELECT USING (("company_id" = "public"."get_current_company_id"()));



CREATE POLICY "Companies can view their collaborators progress" ON "public"."lesson_progress" FOR SELECT USING (("user_id" IN ( SELECT "company_users"."auth_user_id"
   FROM "public"."company_users"
  WHERE ("company_users"."company_id" = "public"."get_current_company_id"()))));



CREATE POLICY "Companies can view their learning path courses" ON "public"."learning_path_courses" FOR SELECT USING (("learning_path_id" IN ( SELECT "learning_paths"."id"
   FROM "public"."learning_paths")));



CREATE POLICY "Companies can view their learning paths" ON "public"."learning_paths" FOR SELECT USING (("company_id" IN ( SELECT "companies"."id"
   FROM "public"."companies")));



CREATE POLICY "Companies can view their mentorships" ON "public"."mentorships" FOR SELECT USING (("company_id" IN ( SELECT "companies"."id"
   FROM "public"."companies")));



CREATE POLICY "Companies can view their own AI configurations" ON "public"."ai_configurations" FOR SELECT TO "authenticated" USING (("company_id" IN ( SELECT "companies"."id"
   FROM "public"."companies"
  WHERE ("companies"."auth_user_id" = "auth"."uid"()))));



CREATE POLICY "Companies can view their own data" ON "public"."companies" FOR SELECT USING (("auth_user_id" = "auth"."uid"()));



CREATE POLICY "Companies can view their own lesson materials" ON "public"."lesson_materials" FOR SELECT TO "authenticated" USING (("company_id" IN ( SELECT "companies"."id"
   FROM "public"."companies"
  WHERE ("companies"."auth_user_id" = "auth"."uid"()))));



CREATE POLICY "Companies can view their own mentorship sessions" ON "public"."mentorship_sessions" FOR SELECT USING (("company_id" IN ( SELECT "companies"."id"
   FROM "public"."companies"
  WHERE ("companies"."auth_user_id" = "auth"."uid"()))));



CREATE POLICY "Companies can view their sent messages" ON "public"."company_messages" FOR SELECT USING (("company_id" = "public"."get_current_company_id"()));



CREATE POLICY "Companies update own data" ON "public"."companies" FOR UPDATE USING (("auth_user_id" = "auth"."uid"())) WITH CHECK (("auth_user_id" = "auth"."uid"()));



CREATE POLICY "Companies view own data" ON "public"."companies" FOR SELECT USING (("auth_user_id" = "auth"."uid"()));



CREATE POLICY "Company users can update their own data" ON "public"."company_users" FOR UPDATE USING (("auth_user_id" = "auth"."uid"()));



CREATE POLICY "Company users can view their own data" ON "public"."company_users" FOR SELECT USING (("auth_user_id" = "auth"."uid"()));



CREATE POLICY "Enable delete for users based on user_id" ON "public"."quizzes" FOR DELETE USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Enable update for users based on user_id" ON "public"."quizzes" FOR UPDATE USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Everyone can view achievements" ON "public"."achievements" FOR SELECT USING (("is_active" = true));



CREATE POLICY "Everyone can view community replies" ON "public"."community_replies" FOR SELECT USING (true);



CREATE POLICY "Everyone can view community topics" ON "public"."community_topics" FOR SELECT USING (true);



CREATE POLICY "Participants can view their own registrations" ON "public"."producer_mentorship_participants" FOR SELECT USING (("participant_id" = "auth"."uid"()));



CREATE POLICY "Producers can create course modules" ON "public"."course_modules" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND (("profiles"."role")::"text" = 'producer'::"text")))));



CREATE POLICY "Producers can create courses" ON "public"."courses" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND (("profiles"."role")::"text" = 'producer'::"text")))));



CREATE POLICY "Producers can create global AI configurations" ON "public"."ai_configurations" FOR INSERT TO "authenticated" WITH CHECK ((("company_id" IS NULL) AND (EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND (("profiles"."role")::"text" = 'producer'::"text"))))));



CREATE POLICY "Producers can create lessons" ON "public"."lessons" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND (("profiles"."role")::"text" = 'producer'::"text")))));



CREATE POLICY "Producers can delete AI configurations" ON "public"."ai_configurations" FOR DELETE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."producers"
  WHERE (("producers"."auth_user_id" = "auth"."uid"()) AND ("producers"."is_active" = true)))));



CREATE POLICY "Producers can delete companies" ON "public"."companies" FOR DELETE USING ("public"."is_current_user_producer_enhanced"());



CREATE POLICY "Producers can delete company users" ON "public"."company_users" FOR DELETE USING ((("public"."get_user_role_safe"("auth"."uid"()))::"text" = 'producer'::"text"));



CREATE POLICY "Producers can delete course modules" ON "public"."course_modules" FOR DELETE USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND (("profiles"."role")::"text" = 'producer'::"text")))));



CREATE POLICY "Producers can delete courses" ON "public"."courses" FOR DELETE USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND (("profiles"."role")::"text" = 'producer'::"text")))));



CREATE POLICY "Producers can delete global AI configurations" ON "public"."ai_configurations" FOR DELETE TO "authenticated" USING ((("company_id" IS NULL) AND (EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND (("profiles"."role")::"text" = 'producer'::"text"))))));



CREATE POLICY "Producers can delete lessons" ON "public"."lessons" FOR DELETE USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND (("profiles"."role")::"text" = 'producer'::"text")))));



CREATE POLICY "Producers can insert AI configurations" ON "public"."ai_configurations" FOR INSERT TO "authenticated" WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."producers"
  WHERE (("producers"."auth_user_id" = "auth"."uid"()) AND ("producers"."is_active" = true)))));



CREATE POLICY "Producers can insert activity logs" ON "public"."collaborator_activity_logs" FOR INSERT WITH CHECK ("public"."is_producer"("auth"."uid"()));



CREATE POLICY "Producers can insert collaborator stats" ON "public"."collaborator_activity_stats" FOR INSERT WITH CHECK ("public"."is_producer"("auth"."uid"()));



CREATE POLICY "Producers can insert companies" ON "public"."companies" FOR INSERT WITH CHECK ("public"."is_current_user_producer_enhanced"());



CREATE POLICY "Producers can insert company users" ON "public"."company_users" FOR INSERT WITH CHECK ((("public"."get_user_role_safe"("auth"."uid"()))::"text" = 'producer'::"text"));



CREATE POLICY "Producers can manage all learning path courses" ON "public"."learning_path_courses" USING (true) WITH CHECK (true);



CREATE POLICY "Producers can manage all learning paths" ON "public"."learning_paths" USING (true) WITH CHECK (true);



CREATE POLICY "Producers can manage all mentorship participants" ON "public"."mentorship_participants" USING (true) WITH CHECK (true);



CREATE POLICY "Producers can manage all mentorships" ON "public"."mentorships" USING (true) WITH CHECK (true);



CREATE POLICY "Producers can manage all plans" ON "public"."subscription_plans" USING (true) WITH CHECK (true);



CREATE POLICY "Producers can manage courses" ON "public"."courses" USING (("instructor_id" = "auth"."uid"()));



CREATE POLICY "Producers can manage subscription plans" ON "public"."subscription_plans" USING ("public"."is_current_user_producer_enhanced"()) WITH CHECK ("public"."is_current_user_producer_enhanced"());



CREATE POLICY "Producers can manage their own mentorship sessions" ON "public"."producer_mentorship_sessions" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND (("profiles"."role")::"text" = 'producer'::"text") AND ("producer_mentorship_sessions"."producer_id" = "auth"."uid"()))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND (("profiles"."role")::"text" = 'producer'::"text") AND ("producer_mentorship_sessions"."producer_id" = "auth"."uid"())))));



CREATE POLICY "Producers can manage their own sessions" ON "public"."producer_mentorship_sessions" USING (("producer_id" = "auth"."uid"())) WITH CHECK (("producer_id" = "auth"."uid"()));



CREATE POLICY "Producers can update AI configurations" ON "public"."ai_configurations" FOR UPDATE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."producers"
  WHERE (("producers"."auth_user_id" = "auth"."uid"()) AND ("producers"."is_active" = true)))));



CREATE POLICY "Producers can update collaborator stats" ON "public"."collaborator_activity_stats" FOR UPDATE USING ("public"."is_producer"("auth"."uid"()));



CREATE POLICY "Producers can update companies" ON "public"."companies" FOR UPDATE USING ("public"."is_current_user_producer_enhanced"());



CREATE POLICY "Producers can update company users" ON "public"."company_users" FOR UPDATE USING ((("public"."get_user_role_safe"("auth"."uid"()))::"text" = 'producer'::"text"));



CREATE POLICY "Producers can update course modules" ON "public"."course_modules" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND (("profiles"."role")::"text" = 'producer'::"text")))));



CREATE POLICY "Producers can update courses" ON "public"."courses" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND (("profiles"."role")::"text" = 'producer'::"text")))));



CREATE POLICY "Producers can update global AI configurations" ON "public"."ai_configurations" FOR UPDATE TO "authenticated" USING ((("company_id" IS NULL) AND (EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND (("profiles"."role")::"text" = 'producer'::"text"))))));



CREATE POLICY "Producers can update lessons" ON "public"."lessons" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND (("profiles"."role")::"text" = 'producer'::"text")))));



CREATE POLICY "Producers can update their own data" ON "public"."producers" FOR UPDATE USING (("auth_user_id" = "auth"."uid"())) WITH CHECK (("auth_user_id" = "auth"."uid"()));



CREATE POLICY "Producers can view all AI configurations" ON "public"."ai_configurations" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND (("profiles"."role")::"text" = 'producer'::"text")))));



CREATE POLICY "Producers can view all activity logs" ON "public"."collaborator_activity_logs" FOR SELECT USING ("public"."is_producer"("auth"."uid"()));



CREATE POLICY "Producers can view all collaborator stats" ON "public"."collaborator_activity_stats" FOR SELECT USING ("public"."is_producer"("auth"."uid"()));



CREATE POLICY "Producers can view all companies" ON "public"."companies" FOR SELECT USING ("public"."is_current_user_producer_enhanced"());



CREATE POLICY "Producers can view all course modules" ON "public"."course_modules" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND (("profiles"."role")::"text" = 'producer'::"text")))));



CREATE POLICY "Producers can view all courses" ON "public"."courses" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND (("profiles"."role")::"text" = 'producer'::"text")))));



CREATE POLICY "Producers can view all lesson materials" ON "public"."lesson_materials" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND (("profiles"."role")::"text" = 'producer'::"text")))));



CREATE POLICY "Producers can view all lessons" ON "public"."lessons" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND (("profiles"."role")::"text" = 'producer'::"text")))));



CREATE POLICY "Producers can view participants for their sessions" ON "public"."producer_mentorship_participants" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM ("public"."producer_mentorship_sessions" "pms"
     JOIN "public"."profiles" "p" ON (("p"."id" = "pms"."producer_id")))
  WHERE (("pms"."id" = "producer_mentorship_participants"."session_id") AND ("p"."id" = "auth"."uid"()) AND (("p"."role")::"text" = 'producer'::"text")))));



CREATE POLICY "Producers can view participants in their sessions" ON "public"."producer_mentorship_participants" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."producer_mentorship_sessions" "pms"
  WHERE (("pms"."id" = "producer_mentorship_participants"."session_id") AND ("pms"."producer_id" = "auth"."uid"())))));



CREATE POLICY "Producers can view their own data" ON "public"."producers" FOR SELECT USING (("auth_user_id" = "auth"."uid"()));



CREATE POLICY "Producers manage companies" ON "public"."companies" USING ((("public"."get_user_role_safe"("auth"."uid"()))::"text" = 'producer'::"text"));



CREATE POLICY "Producers manage company_users" ON "public"."company_users" USING ((("public"."get_user_role_safe"("auth"."uid"()))::"text" = 'producer'::"text")) WITH CHECK ((("public"."get_user_role_safe"("auth"."uid"()))::"text" = 'producer'::"text"));



CREATE POLICY "Students can create lesson progress" ON "public"."lesson_progress" FOR INSERT WITH CHECK ((("user_id" = "auth"."uid"()) AND (EXISTS ( SELECT 1
   FROM "public"."company_users"
  WHERE (("company_users"."auth_user_id" = "auth"."uid"()) AND ("company_users"."is_active" = true))))));



CREATE POLICY "Students can insert their own points" ON "public"."student_points" FOR INSERT TO "authenticated" WITH CHECK (("student_id" IN ( SELECT "company_users"."id"
   FROM "public"."company_users"
  WHERE ("company_users"."auth_user_id" = "auth"."uid"()))));



CREATE POLICY "Students can insert their own points history" ON "public"."points_history" FOR INSERT TO "authenticated" WITH CHECK (("student_id" IN ( SELECT "company_users"."id"
   FROM "public"."company_users"
  WHERE ("company_users"."auth_user_id" = "auth"."uid"()))));



CREATE POLICY "Students can register for mentorship sessions" ON "public"."producer_mentorship_participants" FOR INSERT WITH CHECK (("participant_id" = "auth"."uid"()));



CREATE POLICY "Students can register for mentorships" ON "public"."mentorship_attendees" FOR INSERT WITH CHECK (("student_id" IN ( SELECT "company_users"."id"
   FROM "public"."company_users"
  WHERE ("company_users"."auth_user_id" = "auth"."uid"()))));



CREATE POLICY "Students can update lesson progress" ON "public"."lesson_progress" FOR UPDATE USING ((("user_id" = "auth"."uid"()) AND (EXISTS ( SELECT 1
   FROM "public"."company_users"
  WHERE (("company_users"."auth_user_id" = "auth"."uid"()) AND ("company_users"."is_active" = true))))));



CREATE POLICY "Students can update read status of their messages" ON "public"."company_messages" FOR UPDATE USING ((("recipient_student_id" = "public"."get_current_student_id"()) OR ((("recipient_scope")::"text" = 'ALL_COMPANY_USERS'::"text") AND ("company_id" = ( SELECT "company_users"."company_id"
   FROM "public"."company_users"
  WHERE ("company_users"."auth_user_id" = "auth"."uid"())))))) WITH CHECK ((("recipient_student_id" = "public"."get_current_student_id"()) OR ((("recipient_scope")::"text" = 'ALL_COMPANY_USERS'::"text") AND ("company_id" = ( SELECT "company_users"."company_id"
   FROM "public"."company_users"
  WHERE ("company_users"."auth_user_id" = "auth"."uid"()))))));



CREATE POLICY "Students can update their own data" ON "public"."company_users" FOR UPDATE USING (("auth_user_id" = "auth"."uid"()));



CREATE POLICY "Students can update their own points" ON "public"."student_points" FOR UPDATE TO "authenticated" USING (("student_id" IN ( SELECT "company_users"."id"
   FROM "public"."company_users"
  WHERE ("company_users"."auth_user_id" = "auth"."uid"()))));



CREATE POLICY "Students can view active mentorship sessions" ON "public"."producer_mentorship_sessions" FOR SELECT USING ((("is_active" = true) AND (("status")::"text" = ANY (ARRAY[('scheduled'::character varying)::"text", ('live'::character varying)::"text"]))));



CREATE POLICY "Students can view company calendar events" ON "public"."calendar_events" FOR SELECT USING (("company_id" IN ( SELECT "company_users"."company_id"
   FROM "public"."company_users"
  WHERE ("company_users"."auth_user_id" = "auth"."uid"()))));



CREATE POLICY "Students can view company mentorship sessions" ON "public"."mentorship_sessions" FOR SELECT USING (("company_id" IN ( SELECT "company_users"."company_id"
   FROM "public"."company_users"
  WHERE ("company_users"."auth_user_id" = "auth"."uid"()))));



CREATE POLICY "Students can view lesson progress" ON "public"."lesson_progress" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."company_users"
  WHERE (("company_users"."auth_user_id" = "auth"."uid"()) AND ("company_users"."is_active" = true)))));



CREATE POLICY "Students can view messages sent to them" ON "public"."company_messages" FOR SELECT USING ((("recipient_student_id" = "public"."get_current_student_id"()) OR ((("recipient_scope")::"text" = 'ALL_COMPANY_USERS'::"text") AND ("company_id" = ( SELECT "company_users"."company_id"
   FROM "public"."company_users"
  WHERE ("company_users"."auth_user_id" = "auth"."uid"()))))));



CREATE POLICY "Students can view their achievements" ON "public"."student_achievements" FOR SELECT USING (("student_id" IN ( SELECT "company_users"."id"
   FROM "public"."company_users"
  WHERE ("company_users"."auth_user_id" = "auth"."uid"()))));



CREATE POLICY "Students can view their mentorship attendance" ON "public"."mentorship_attendees" FOR SELECT USING (("student_id" IN ( SELECT "company_users"."id"
   FROM "public"."company_users"
  WHERE ("company_users"."auth_user_id" = "auth"."uid"()))));



CREATE POLICY "Students can view their own data" ON "public"."company_users" FOR SELECT USING (("auth_user_id" = "auth"."uid"()));



CREATE POLICY "Students can view their own mentorship registrations" ON "public"."producer_mentorship_participants" FOR SELECT USING (("participant_id" = "auth"."uid"()));



CREATE POLICY "Students can view their own points" ON "public"."student_points" FOR SELECT USING (("student_id" IN ( SELECT "company_users"."id"
   FROM "public"."company_users"
  WHERE ("company_users"."auth_user_id" = "auth"."uid"()))));



CREATE POLICY "Students can view their points history" ON "public"."points_history" FOR SELECT USING (("student_id" IN ( SELECT "company_users"."id"
   FROM "public"."company_users"
  WHERE ("company_users"."auth_user_id" = "auth"."uid"()))));



CREATE POLICY "Users can create messages in their sessions" ON "public"."ai_chat_messages" FOR INSERT TO "authenticated" WITH CHECK (("session_id" IN ( SELECT "ai_chat_sessions"."id"
   FROM "public"."ai_chat_sessions"
  WHERE ("ai_chat_sessions"."user_id" = "auth"."uid"()))));



CREATE POLICY "Users can create own profile" ON "public"."profiles" FOR INSERT WITH CHECK (("id" = "auth"."uid"()));



CREATE POLICY "Users can create their own chat sessions" ON "public"."ai_chat_sessions" FOR INSERT TO "authenticated" WITH CHECK (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can create their own enrollments" ON "public"."enrollments" FOR INSERT WITH CHECK ((("auth"."uid"() IS NOT NULL) AND ("auth"."uid"() = "user_id")));



CREATE POLICY "Users can create their own lesson progress" ON "public"."lesson_progress" FOR INSERT WITH CHECK ((("auth"."uid"() IS NOT NULL) AND ("auth"."uid"() = "user_id")));



CREATE POLICY "Users can manage their reply likes" ON "public"."community_reply_likes" USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can manage their topic likes" ON "public"."community_topic_likes" USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can register for mentorships" ON "public"."mentorship_participants" FOR INSERT WITH CHECK (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can update own company data" ON "public"."company_users" FOR UPDATE USING (("auth_user_id" = "auth"."uid"()));



CREATE POLICY "Users can update own profile" ON "public"."profiles" FOR UPDATE USING (("id" = "auth"."uid"())) WITH CHECK (("id" = "auth"."uid"()));



CREATE POLICY "Users can update their own chat sessions" ON "public"."ai_chat_sessions" FOR UPDATE TO "authenticated" USING (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can update their own enrollments" ON "public"."enrollments" FOR UPDATE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update their own lesson progress" ON "public"."lesson_progress" FOR UPDATE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update their own profile" ON "public"."profiles" FOR UPDATE USING (("id" = "auth"."uid"())) WITH CHECK (("id" = "auth"."uid"()));



CREATE POLICY "Users can view messages from their sessions" ON "public"."ai_chat_messages" FOR SELECT TO "authenticated" USING (("session_id" IN ( SELECT "ai_chat_sessions"."id"
   FROM "public"."ai_chat_sessions"
  WHERE (("ai_chat_sessions"."user_id" = "auth"."uid"()) OR ("ai_chat_sessions"."company_id" IN ( SELECT "companies"."id"
           FROM "public"."companies"
          WHERE ("companies"."auth_user_id" = "auth"."uid"()))) OR (EXISTS ( SELECT 1
           FROM "public"."profiles"
          WHERE (("profiles"."id" = "auth"."uid"()) AND (("profiles"."role")::"text" = 'producer'::"text"))))))));



CREATE POLICY "Users can view own company data" ON "public"."company_users" FOR SELECT USING (("auth_user_id" = "auth"."uid"()));



CREATE POLICY "Users can view own profile" ON "public"."profiles" FOR SELECT USING (("id" = "auth"."uid"()));



CREATE POLICY "Users can view published courses" ON "public"."courses" FOR SELECT USING (("is_published" = true));



CREATE POLICY "Users can view their mentorship participations" ON "public"."mentorship_participants" FOR SELECT USING (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can view their own chat sessions" ON "public"."ai_chat_sessions" FOR SELECT TO "authenticated" USING ((("user_id" = "auth"."uid"()) OR ("company_id" IN ( SELECT "companies"."id"
   FROM "public"."companies"
  WHERE ("companies"."auth_user_id" = "auth"."uid"()))) OR (EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND (("profiles"."role")::"text" = 'producer'::"text"))))));



CREATE POLICY "Users can view their own enrollments" ON "public"."enrollments" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view their own enrollments simple" ON "public"."enrollments" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view their own lesson progress" ON "public"."lesson_progress" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view their own profile" ON "public"."profiles" FOR SELECT USING (("id" = "auth"."uid"()));



CREATE POLICY "Users update own company data" ON "public"."company_users" FOR UPDATE USING (("auth_user_id" = "auth"."uid"())) WITH CHECK (("auth_user_id" = "auth"."uid"()));



CREATE POLICY "Users view own company data" ON "public"."company_users" FOR SELECT USING (("auth_user_id" = "auth"."uid"()));



ALTER TABLE "public"."achievements" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."ai_chat_messages" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."ai_chat_sessions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."ai_configurations" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."ai_providers" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."calendar_events" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."certificates" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."collaborator_activity_logs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."collaborator_activity_stats" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."community_replies" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."community_reply_likes" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."community_topic_likes" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."community_topics" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."companies" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."company_messages" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."company_users" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."course_modules" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."courses" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."discussion_replies" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."discussions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."enrollments" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."learning_path_courses" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."learning_paths" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."lesson_materials" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."lesson_progress" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."lessons" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."mentorship_attendees" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."mentorship_participants" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."mentorship_sessions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."mentorships" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."points_history" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."producer_mentorship_participants" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."producer_mentorship_sessions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."producers" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."quiz_attempts" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."quizzes" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."student_achievements" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."student_points" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."subscription_plans" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."users" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


REVOKE USAGE ON SCHEMA "public" FROM PUBLIC;
GRANT ALL ON SCHEMA "public" TO PUBLIC;
GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";

























































































































































GRANT ALL ON FUNCTION "public"."ensure_user_profile"("user_id" "uuid", "user_role" character varying) TO "anon";
GRANT ALL ON FUNCTION "public"."ensure_user_profile"("user_id" "uuid", "user_role" character varying) TO "authenticated";
GRANT ALL ON FUNCTION "public"."ensure_user_profile"("user_id" "uuid", "user_role" character varying) TO "service_role";



GRANT ALL ON FUNCTION "public"."ensure_user_profile_consistency"() TO "anon";
GRANT ALL ON FUNCTION "public"."ensure_user_profile_consistency"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."ensure_user_profile_consistency"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_current_company_id"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_current_company_id"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_current_company_id"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_current_student_id"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_current_student_id"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_current_student_id"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_user_role"("user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_user_role"("user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_user_role"("user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_user_role_enhanced"("user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_user_role_enhanced"("user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_user_role_enhanced"("user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_user_role_safe"("user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_user_role_safe"("user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_user_role_safe"("user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";



GRANT ALL ON FUNCTION "public"."is_company_user"("user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."is_company_user"("user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_company_user"("user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."is_current_user_producer"() TO "anon";
GRANT ALL ON FUNCTION "public"."is_current_user_producer"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_current_user_producer"() TO "service_role";



GRANT ALL ON FUNCTION "public"."is_current_user_producer_enhanced"() TO "anon";
GRANT ALL ON FUNCTION "public"."is_current_user_producer_enhanced"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_current_user_producer_enhanced"() TO "service_role";



GRANT ALL ON FUNCTION "public"."is_current_user_producer_new"() TO "anon";
GRANT ALL ON FUNCTION "public"."is_current_user_producer_new"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_current_user_producer_new"() TO "service_role";



GRANT ALL ON FUNCTION "public"."is_producer"("user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."is_producer"("user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_producer"("user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."migrate_existing_producers"() TO "anon";
GRANT ALL ON FUNCTION "public"."migrate_existing_producers"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."migrate_existing_producers"() TO "service_role";



GRANT ALL ON FUNCTION "public"."set_course_instructor_id"() TO "anon";
GRANT ALL ON FUNCTION "public"."set_course_instructor_id"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_course_instructor_id"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_collaborator_stats"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_collaborator_stats"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_collaborator_stats"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_reply_likes_count"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_reply_likes_count"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_reply_likes_count"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_topic_likes_count"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_topic_likes_count"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_topic_likes_count"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_topic_replies_count"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_topic_replies_count"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_topic_replies_count"() TO "service_role";


















GRANT ALL ON TABLE "public"."achievements" TO "anon";
GRANT ALL ON TABLE "public"."achievements" TO "authenticated";
GRANT ALL ON TABLE "public"."achievements" TO "service_role";



GRANT ALL ON TABLE "public"."ai_chat_messages" TO "anon";
GRANT ALL ON TABLE "public"."ai_chat_messages" TO "authenticated";
GRANT ALL ON TABLE "public"."ai_chat_messages" TO "service_role";



GRANT ALL ON TABLE "public"."ai_chat_sessions" TO "anon";
GRANT ALL ON TABLE "public"."ai_chat_sessions" TO "authenticated";
GRANT ALL ON TABLE "public"."ai_chat_sessions" TO "service_role";



GRANT ALL ON TABLE "public"."ai_configurations" TO "anon";
GRANT ALL ON TABLE "public"."ai_configurations" TO "authenticated";
GRANT ALL ON TABLE "public"."ai_configurations" TO "service_role";



GRANT ALL ON TABLE "public"."ai_providers" TO "anon";
GRANT ALL ON TABLE "public"."ai_providers" TO "authenticated";
GRANT ALL ON TABLE "public"."ai_providers" TO "service_role";



GRANT ALL ON TABLE "public"."calendar_events" TO "anon";
GRANT ALL ON TABLE "public"."calendar_events" TO "authenticated";
GRANT ALL ON TABLE "public"."calendar_events" TO "service_role";



GRANT ALL ON TABLE "public"."certificates" TO "anon";
GRANT ALL ON TABLE "public"."certificates" TO "authenticated";
GRANT ALL ON TABLE "public"."certificates" TO "service_role";



GRANT ALL ON TABLE "public"."collaborator_activity_logs" TO "anon";
GRANT ALL ON TABLE "public"."collaborator_activity_logs" TO "authenticated";
GRANT ALL ON TABLE "public"."collaborator_activity_logs" TO "service_role";



GRANT ALL ON TABLE "public"."collaborator_activity_stats" TO "anon";
GRANT ALL ON TABLE "public"."collaborator_activity_stats" TO "authenticated";
GRANT ALL ON TABLE "public"."collaborator_activity_stats" TO "service_role";



GRANT ALL ON TABLE "public"."community_replies" TO "anon";
GRANT ALL ON TABLE "public"."community_replies" TO "authenticated";
GRANT ALL ON TABLE "public"."community_replies" TO "service_role";



GRANT ALL ON TABLE "public"."community_reply_likes" TO "anon";
GRANT ALL ON TABLE "public"."community_reply_likes" TO "authenticated";
GRANT ALL ON TABLE "public"."community_reply_likes" TO "service_role";



GRANT ALL ON TABLE "public"."community_topic_likes" TO "anon";
GRANT ALL ON TABLE "public"."community_topic_likes" TO "authenticated";
GRANT ALL ON TABLE "public"."community_topic_likes" TO "service_role";



GRANT ALL ON TABLE "public"."community_topics" TO "anon";
GRANT ALL ON TABLE "public"."community_topics" TO "authenticated";
GRANT ALL ON TABLE "public"."community_topics" TO "service_role";



GRANT ALL ON TABLE "public"."companies" TO "anon";
GRANT ALL ON TABLE "public"."companies" TO "authenticated";
GRANT ALL ON TABLE "public"."companies" TO "service_role";



GRANT ALL ON TABLE "public"."company_messages" TO "anon";
GRANT ALL ON TABLE "public"."company_messages" TO "authenticated";
GRANT ALL ON TABLE "public"."company_messages" TO "service_role";



GRANT ALL ON TABLE "public"."company_users" TO "anon";
GRANT ALL ON TABLE "public"."company_users" TO "authenticated";
GRANT ALL ON TABLE "public"."company_users" TO "service_role";



GRANT ALL ON TABLE "public"."course_modules" TO "anon";
GRANT ALL ON TABLE "public"."course_modules" TO "authenticated";
GRANT ALL ON TABLE "public"."course_modules" TO "service_role";



GRANT ALL ON TABLE "public"."courses" TO "anon";
GRANT ALL ON TABLE "public"."courses" TO "authenticated";
GRANT ALL ON TABLE "public"."courses" TO "service_role";



GRANT ALL ON TABLE "public"."discussion_replies" TO "anon";
GRANT ALL ON TABLE "public"."discussion_replies" TO "authenticated";
GRANT ALL ON TABLE "public"."discussion_replies" TO "service_role";



GRANT ALL ON TABLE "public"."discussions" TO "anon";
GRANT ALL ON TABLE "public"."discussions" TO "authenticated";
GRANT ALL ON TABLE "public"."discussions" TO "service_role";



GRANT ALL ON TABLE "public"."enrollments" TO "anon";
GRANT ALL ON TABLE "public"."enrollments" TO "authenticated";
GRANT ALL ON TABLE "public"."enrollments" TO "service_role";



GRANT ALL ON TABLE "public"."student_points" TO "anon";
GRANT ALL ON TABLE "public"."student_points" TO "authenticated";
GRANT ALL ON TABLE "public"."student_points" TO "service_role";



GRANT ALL ON TABLE "public"."global_collaborator_ranking" TO "anon";
GRANT ALL ON TABLE "public"."global_collaborator_ranking" TO "authenticated";
GRANT ALL ON TABLE "public"."global_collaborator_ranking" TO "service_role";



GRANT ALL ON TABLE "public"."learning_path_courses" TO "anon";
GRANT ALL ON TABLE "public"."learning_path_courses" TO "authenticated";
GRANT ALL ON TABLE "public"."learning_path_courses" TO "service_role";



GRANT ALL ON TABLE "public"."learning_paths" TO "anon";
GRANT ALL ON TABLE "public"."learning_paths" TO "authenticated";
GRANT ALL ON TABLE "public"."learning_paths" TO "service_role";



GRANT ALL ON TABLE "public"."lesson_materials" TO "anon";
GRANT ALL ON TABLE "public"."lesson_materials" TO "authenticated";
GRANT ALL ON TABLE "public"."lesson_materials" TO "service_role";



GRANT ALL ON TABLE "public"."lesson_progress" TO "anon";
GRANT ALL ON TABLE "public"."lesson_progress" TO "authenticated";
GRANT ALL ON TABLE "public"."lesson_progress" TO "service_role";



GRANT ALL ON TABLE "public"."lessons" TO "anon";
GRANT ALL ON TABLE "public"."lessons" TO "authenticated";
GRANT ALL ON TABLE "public"."lessons" TO "service_role";



GRANT ALL ON TABLE "public"."mentorship_attendees" TO "anon";
GRANT ALL ON TABLE "public"."mentorship_attendees" TO "authenticated";
GRANT ALL ON TABLE "public"."mentorship_attendees" TO "service_role";



GRANT ALL ON TABLE "public"."mentorship_participants" TO "anon";
GRANT ALL ON TABLE "public"."mentorship_participants" TO "authenticated";
GRANT ALL ON TABLE "public"."mentorship_participants" TO "service_role";



GRANT ALL ON TABLE "public"."mentorship_sessions" TO "anon";
GRANT ALL ON TABLE "public"."mentorship_sessions" TO "authenticated";
GRANT ALL ON TABLE "public"."mentorship_sessions" TO "service_role";



GRANT ALL ON TABLE "public"."mentorships" TO "anon";
GRANT ALL ON TABLE "public"."mentorships" TO "authenticated";
GRANT ALL ON TABLE "public"."mentorships" TO "service_role";



GRANT ALL ON TABLE "public"."points_history" TO "anon";
GRANT ALL ON TABLE "public"."points_history" TO "authenticated";
GRANT ALL ON TABLE "public"."points_history" TO "service_role";



GRANT ALL ON TABLE "public"."producer_mentorship_participants" TO "anon";
GRANT ALL ON TABLE "public"."producer_mentorship_participants" TO "authenticated";
GRANT ALL ON TABLE "public"."producer_mentorship_participants" TO "service_role";



GRANT ALL ON TABLE "public"."producer_mentorship_sessions" TO "anon";
GRANT ALL ON TABLE "public"."producer_mentorship_sessions" TO "authenticated";
GRANT ALL ON TABLE "public"."producer_mentorship_sessions" TO "service_role";



GRANT ALL ON TABLE "public"."producers" TO "anon";
GRANT ALL ON TABLE "public"."producers" TO "authenticated";
GRANT ALL ON TABLE "public"."producers" TO "service_role";



GRANT ALL ON TABLE "public"."profiles" TO "anon";
GRANT ALL ON TABLE "public"."profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles" TO "service_role";



GRANT ALL ON TABLE "public"."quiz_attempts" TO "anon";
GRANT ALL ON TABLE "public"."quiz_attempts" TO "authenticated";
GRANT ALL ON TABLE "public"."quiz_attempts" TO "service_role";



GRANT ALL ON TABLE "public"."quizzes" TO "anon";
GRANT ALL ON TABLE "public"."quizzes" TO "authenticated";
GRANT ALL ON TABLE "public"."quizzes" TO "service_role";



GRANT ALL ON TABLE "public"."student_achievements" TO "anon";
GRANT ALL ON TABLE "public"."student_achievements" TO "authenticated";
GRANT ALL ON TABLE "public"."student_achievements" TO "service_role";



GRANT ALL ON TABLE "public"."subscription_plans" TO "anon";
GRANT ALL ON TABLE "public"."subscription_plans" TO "authenticated";
GRANT ALL ON TABLE "public"."subscription_plans" TO "service_role";



GRANT ALL ON TABLE "public"."users" TO "anon";
GRANT ALL ON TABLE "public"."users" TO "authenticated";
GRANT ALL ON TABLE "public"."users" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";



ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";



ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";



























RESET ALL;
