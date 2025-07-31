import { Database } from './types';
import { Json } from './types';

// Estender o tipo Database para incluir as novas tabelas
export interface ExtendedDatabase extends Omit<Database, 'public'> {
  public: {
    Tables: {
      // Incluir todas as tabelas existentes da Database original
      achievements: Database['public']['Tables']['achievements'];
      ai_chat_messages: Database['public']['Tables']['ai_chat_messages'];
      ai_chat_sessions: Database['public']['Tables']['ai_chat_sessions'];
      ai_configurations: Database['public']['Tables']['ai_configurations'];
      ai_providers: Database['public']['Tables']['ai_providers'];
      calendar_events: Database['public']['Tables']['calendar_events'];
      certificates: Database['public']['Tables']['certificates'];
      collaborator_activity_logs: Database['public']['Tables']['collaborator_activity_logs'];
      collaborator_activity_stats: Database['public']['Tables']['collaborator_activity_stats'];
      community_replies: Database['public']['Tables']['community_replies'];
      community_reply_likes: Database['public']['Tables']['community_reply_likes'];
      community_topic_likes: Database['public']['Tables']['community_topic_likes'];
      community_topics: Database['public']['Tables']['community_topics'];
      companies: Database['public']['Tables']['companies'];
      company_messages: Database['public']['Tables']['company_messages'];
      company_users: Database['public']['Tables']['company_users'];
      course_modules: Database['public']['Tables']['course_modules'];
      courses: Database['public']['Tables']['courses'];
      discussion_replies: Database['public']['Tables']['discussion_replies'];
      enrollments: Database['public']['Tables']['enrollments'];
      lessons: Database['public']['Tables']['lessons'];
      lesson_progress: Database['public']['Tables']['lesson_progress'];
      producers: Database['public']['Tables']['producers'];
      producer_mentorship_sessions: Database['public']['Tables']['producer_mentorship_sessions'];
      producer_mentorship_participants: Database['public']['Tables']['producer_mentorship_participants'];
      profiles: Database['public']['Tables']['profiles'];
      quizzes: Database['public']['Tables']['quizzes'];
      quiz_attempts: Database['public']['Tables']['quiz_attempts'];
      subscription_plans: Database['public']['Tables']['subscription_plans'];
      
      // Definição manual da tabela quiz_generation_logs que não existe no tipo original
      quiz_generation_logs: {
        Row: {
          id: string;
          lesson_id: string | null;
          module_id: string | null;
          provider: string | null;
          model: string | null;
          num_questions: number;
          success: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          lesson_id?: string | null;
          module_id?: string | null;
          provider?: string | null;
          model?: string | null;
          num_questions: number;
          success: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          lesson_id?: string | null;
          module_id?: string | null;
          provider?: string | null;
          model?: string | null;
          num_questions?: number;
          success?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      
      // Adicionar as novas tabelas
      auth_audit_logs: {
        Row: {
          id: string;
          event_type: string;
          user_id: string | null;
          email: string | null;
          ip_address: string | null;
          user_agent: string | null;
          metadata: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          event_type: string;
          user_id?: string | null;
          email?: string | null;
          ip_address?: string | null;
          user_agent?: string | null;
          metadata?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          event_type?: string;
          user_id?: string | null;
          email?: string | null;
          ip_address?: string | null;
          user_agent?: string | null;
          metadata?: Json;
          created_at?: string;
        };
        Relationships: [];
      };
      
      auth_login_attempts: {
        Row: {
          id: string;
          email: string;
          attempt_count: number;
          last_attempt: string;
          locked_until: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          attempt_count?: number;
          last_attempt?: string;
          locked_until?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          attempt_count?: number;
          last_attempt?: string;
          locked_until?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Database['public']['Views'];
    Functions: Database['public']['Functions'];
    Enums: Database['public']['Enums'];
    CompositeTypes: Database['public']['CompositeTypes'];
  };
}
