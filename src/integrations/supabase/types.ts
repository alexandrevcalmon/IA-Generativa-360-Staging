export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      achievements: {
        Row: {
          badge_color: string | null
          created_at: string
          criteria: Json | null
          description: string | null
          icon: string | null
          id: string
          is_active: boolean
          name: string
          points_required: number | null
          type: string
        }
        Insert: {
          badge_color?: string | null
          created_at?: string
          criteria?: Json | null
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean
          name: string
          points_required?: number | null
          type: string
        }
        Update: {
          badge_color?: string | null
          created_at?: string
          criteria?: Json | null
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean
          name?: string
          points_required?: number | null
          type?: string
        }
        Relationships: []
      }
      ai_chat_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          role: string
          session_id: string | null
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          role: string
          session_id?: string | null
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          role?: string
          session_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_chat_messages_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "ai_chat_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_chat_sessions: {
        Row: {
          ai_configuration_id: string | null
          company_id: string | null
          created_at: string
          id: string
          lesson_id: string | null
          session_data: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          ai_configuration_id?: string | null
          company_id?: string | null
          created_at?: string
          id?: string
          lesson_id?: string | null
          session_data?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          ai_configuration_id?: string | null
          company_id?: string | null
          created_at?: string
          id?: string
          lesson_id?: string | null
          session_data?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_chat_sessions_ai_configuration_id_fkey"
            columns: ["ai_configuration_id"]
            isOneToOne: false
            referencedRelation: "ai_configurations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_chat_sessions_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_chat_sessions_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_configurations: {
        Row: {
          api_key_encrypted: string | null
          company_id: string | null
          created_at: string
          id: string
          is_active: boolean
          max_tokens: number
          model_name: string
          provider_id: string | null
          system_prompt: string
          temperature: number
          updated_at: string
        }
        Insert: {
          api_key_encrypted?: string | null
          company_id?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          max_tokens?: number
          model_name: string
          provider_id?: string | null
          system_prompt?: string
          temperature?: number
          updated_at?: string
        }
        Update: {
          api_key_encrypted?: string | null
          company_id?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          max_tokens?: number
          model_name?: string
          provider_id?: string | null
          system_prompt?: string
          temperature?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_configurations_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_configurations_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "ai_providers"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_providers: {
        Row: {
          api_endpoint: string
          created_at: string
          default_model: string | null
          display_name: string
          id: string
          is_active: boolean
          name: string
          requires_api_key: boolean
          supported_models: Json
          updated_at: string
        }
        Insert: {
          api_endpoint: string
          created_at?: string
          default_model?: string | null
          display_name: string
          id?: string
          is_active?: boolean
          name: string
          requires_api_key?: boolean
          supported_models?: Json
          updated_at?: string
        }
        Update: {
          api_endpoint?: string
          created_at?: string
          default_model?: string | null
          display_name?: string
          id?: string
          is_active?: boolean
          name?: string
          requires_api_key?: boolean
          supported_models?: Json
          updated_at?: string
        }
        Relationships: []
      }
      calendar_events: {
        Row: {
          all_day: boolean
          color: string | null
          company_id: string
          created_at: string
          created_by: string | null
          description: string | null
          end_date: string
          event_type: string
          id: string
          is_recurring: boolean
          location: string | null
          meet_url: string | null
          recurrence_rule: Json | null
          reference_id: string | null
          start_date: string
          title: string
          updated_at: string
        }
        Insert: {
          all_day?: boolean
          color?: string | null
          company_id: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          end_date: string
          event_type: string
          id?: string
          is_recurring?: boolean
          location?: string | null
          meet_url?: string | null
          recurrence_rule?: Json | null
          reference_id?: string | null
          start_date: string
          title: string
          updated_at?: string
        }
        Update: {
          all_day?: boolean
          color?: string | null
          company_id?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          end_date?: string
          event_type?: string
          id?: string
          is_recurring?: boolean
          location?: string | null
          meet_url?: string | null
          recurrence_rule?: Json | null
          reference_id?: string | null
          start_date?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "calendar_events_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "calendar_events_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "company_users"
            referencedColumns: ["id"]
          },
        ]
      }
      certificates: {
        Row: {
          certificate_url: string | null
          course_id: string | null
          id: string
          issued_at: string | null
          user_id: string | null
          verification_code: string | null
        }
        Insert: {
          certificate_url?: string | null
          course_id?: string | null
          id?: string
          issued_at?: string | null
          user_id?: string | null
          verification_code?: string | null
        }
        Update: {
          certificate_url?: string | null
          course_id?: string | null
          id?: string
          issued_at?: string | null
          user_id?: string | null
          verification_code?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "certificates_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "certificates_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "company_users"
            referencedColumns: ["id"]
          },
        ]
      }
      collaborator_activity_logs: {
        Row: {
          activity_data: Json | null
          activity_type: string
          collaborator_id: string
          company_id: string
          created_at: string
          id: string
          ip_address: unknown | null
          user_agent: string | null
        }
        Insert: {
          activity_data?: Json | null
          activity_type: string
          collaborator_id: string
          company_id: string
          created_at?: string
          id?: string
          ip_address?: unknown | null
          user_agent?: string | null
        }
        Update: {
          activity_data?: Json | null
          activity_type?: string
          collaborator_id?: string
          company_id?: string
          created_at?: string
          id?: string
          ip_address?: unknown | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "collaborator_activity_logs_collaborator_id_fkey"
            columns: ["collaborator_id"]
            isOneToOne: false
            referencedRelation: "company_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "collaborator_activity_logs_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      collaborator_activity_stats: {
        Row: {
          average_quiz_score: number | null
          collaborator_id: string
          company_id: string
          courses_completed: number | null
          courses_enrolled: number | null
          created_at: string
          current_level: number | null
          id: string
          last_login_at: string | null
          lessons_completed: number | null
          lessons_started: number | null
          quiz_attempts: number | null
          quiz_passed: number | null
          streak_days: number | null
          total_login_count: number | null
          total_points: number | null
          total_watch_time_minutes: number | null
          updated_at: string
        }
        Insert: {
          average_quiz_score?: number | null
          collaborator_id: string
          company_id: string
          courses_completed?: number | null
          courses_enrolled?: number | null
          created_at?: string
          current_level?: number | null
          id?: string
          last_login_at?: string | null
          lessons_completed?: number | null
          lessons_started?: number | null
          quiz_attempts?: number | null
          quiz_passed?: number | null
          streak_days?: number | null
          total_login_count?: number | null
          total_points?: number | null
          total_watch_time_minutes?: number | null
          updated_at?: string
        }
        Update: {
          average_quiz_score?: number | null
          collaborator_id?: string
          company_id?: string
          courses_completed?: number | null
          courses_enrolled?: number | null
          created_at?: string
          current_level?: number | null
          id?: string
          last_login_at?: string | null
          lessons_completed?: number | null
          lessons_started?: number | null
          quiz_attempts?: number | null
          quiz_passed?: number | null
          streak_days?: number | null
          total_login_count?: number | null
          total_points?: number | null
          total_watch_time_minutes?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "collaborator_activity_stats_collaborator_id_fkey"
            columns: ["collaborator_id"]
            isOneToOne: true
            referencedRelation: "company_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "collaborator_activity_stats_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      community_replies: {
        Row: {
          author_email: string
          author_id: string
          author_name: string
          company_name: string | null
          content: string
          created_at: string
          id: string
          is_solution: boolean
          likes_count: number
          topic_id: string
          updated_at: string
        }
        Insert: {
          author_email: string
          author_id: string
          author_name: string
          company_name?: string | null
          content: string
          created_at?: string
          id?: string
          is_solution?: boolean
          likes_count?: number
          topic_id: string
          updated_at?: string
        }
        Update: {
          author_email?: string
          author_id?: string
          author_name?: string
          company_name?: string | null
          content?: string
          created_at?: string
          id?: string
          is_solution?: boolean
          likes_count?: number
          topic_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_replies_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "community_topics"
            referencedColumns: ["id"]
          },
        ]
      }
      community_reply_likes: {
        Row: {
          created_at: string
          id: string
          reply_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          reply_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          reply_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_reply_likes_reply_id_fkey"
            columns: ["reply_id"]
            isOneToOne: false
            referencedRelation: "community_replies"
            referencedColumns: ["id"]
          },
        ]
      }
      community_topic_likes: {
        Row: {
          created_at: string
          id: string
          topic_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          topic_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          topic_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_topic_likes_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "community_topics"
            referencedColumns: ["id"]
          },
        ]
      }
      community_topics: {
        Row: {
          author_email: string
          author_id: string
          author_name: string
          category: string | null
          company_name: string | null
          content: string
          created_at: string
          id: string
          is_locked: boolean
          is_pinned: boolean
          likes_count: number
          replies_count: number
          tags: string[] | null
          title: string
          updated_at: string
          views_count: number
        }
        Insert: {
          author_email: string
          author_id: string
          author_name: string
          category?: string | null
          company_name?: string | null
          content: string
          created_at?: string
          id?: string
          is_locked?: boolean
          is_pinned?: boolean
          likes_count?: number
          replies_count?: number
          tags?: string[] | null
          title: string
          updated_at?: string
          views_count?: number
        }
        Update: {
          author_email?: string
          author_id?: string
          author_name?: string
          category?: string | null
          company_name?: string | null
          content?: string
          created_at?: string
          id?: string
          is_locked?: boolean
          is_pinned?: boolean
          likes_count?: number
          replies_count?: number
          tags?: string[] | null
          title?: string
          updated_at?: string
          views_count?: number
        }
        Relationships: []
      }
      companies: {
        Row: {
          address_city: string | null
          address_complement: string | null
          address_district: string | null
          address_number: string | null
          address_state: string | null
          address_street: string | null
          address_zip_code: string | null
          auth_user_id: string | null
          billing_period: string | null
          cnpj: string | null
          contact_email: string | null
          contact_name: string | null
          contact_phone: string | null
          created_at: string | null
          created_via_stripe: boolean | null
          current_students: number | null
          email: string | null
          id: string
          is_active: boolean | null
          logo_url: string | null
          max_collaborators: number | null
          max_students: number | null
          name: string
          needs_password_change: boolean
          notes: string | null
          official_name: string | null
          phone: string | null
          stripe_customer_id: string | null
          stripe_plan_id: string | null
          stripe_subscription_id: string | null
          subscription_ends_at: string | null
          subscription_period: string | null
          subscription_plan: string | null
          subscription_plan_id: string | null
          subscription_status: string | null
          updated_at: string | null
        }
        Insert: {
          address_city?: string | null
          address_complement?: string | null
          address_district?: string | null
          address_number?: string | null
          address_state?: string | null
          address_street?: string | null
          address_zip_code?: string | null
          auth_user_id?: string | null
          billing_period?: string | null
          cnpj?: string | null
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string | null
          created_via_stripe?: boolean | null
          current_students?: number | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          max_collaborators?: number | null
          max_students?: number | null
          name: string
          needs_password_change?: boolean
          notes?: string | null
          official_name?: string | null
          phone?: string | null
          stripe_customer_id?: string | null
          stripe_plan_id?: string | null
          stripe_subscription_id?: string | null
          subscription_ends_at?: string | null
          subscription_period?: string | null
          subscription_plan?: string | null
          subscription_plan_id?: string | null
          subscription_status?: string | null
          updated_at?: string | null
        }
        Update: {
          address_city?: string | null
          address_complement?: string | null
          address_district?: string | null
          address_number?: string | null
          address_state?: string | null
          address_street?: string | null
          address_zip_code?: string | null
          auth_user_id?: string | null
          billing_period?: string | null
          cnpj?: string | null
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string | null
          created_via_stripe?: boolean | null
          current_students?: number | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          max_collaborators?: number | null
          max_students?: number | null
          name?: string
          needs_password_change?: boolean
          notes?: string | null
          official_name?: string | null
          phone?: string | null
          stripe_customer_id?: string | null
          stripe_plan_id?: string | null
          stripe_subscription_id?: string | null
          subscription_ends_at?: string | null
          subscription_period?: string | null
          subscription_plan?: string | null
          subscription_plan_id?: string | null
          subscription_status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "companies_subscription_plan_id_fkey"
            columns: ["subscription_plan_id"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      company_messages: {
        Row: {
          body: string
          company_id: string
          created_at: string
          id: string
          read_at: string | null
          recipient_scope: string
          recipient_student_id: string | null
          sender_auth_user_id: string
          subject: string
        }
        Insert: {
          body: string
          company_id: string
          created_at?: string
          id?: string
          read_at?: string | null
          recipient_scope?: string
          recipient_student_id?: string | null
          sender_auth_user_id: string
          subject: string
        }
        Update: {
          body?: string
          company_id?: string
          created_at?: string
          id?: string
          read_at?: string | null
          recipient_scope?: string
          recipient_student_id?: string | null
          sender_auth_user_id?: string
          subject?: string
        }
        Relationships: [
          {
            foreignKeyName: "company_messages_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "company_messages_recipient_student_id_fkey"
            columns: ["recipient_student_id"]
            isOneToOne: false
            referencedRelation: "company_users"
            referencedColumns: ["id"]
          },
        ]
      }
      company_users: {
        Row: {
          auth_user_id: string
          company_id: string
          created_at: string
          email: string
          id: string
          is_active: boolean
          name: string
          needs_password_change: boolean
          phone: string | null
          position: string | null
          updated_at: string | null
        }
        Insert: {
          auth_user_id: string
          company_id: string
          created_at?: string
          email: string
          id?: string
          is_active?: boolean
          name: string
          needs_password_change?: boolean
          phone?: string | null
          position?: string | null
          updated_at?: string | null
        }
        Update: {
          auth_user_id?: string
          company_id?: string
          created_at?: string
          email?: string
          id?: string
          is_active?: boolean
          name?: string
          needs_password_change?: boolean
          phone?: string | null
          position?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "company_users_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      course_modules: {
        Row: {
          course_id: string | null
          created_at: string | null
          description: string | null
          id: string
          image_url: string | null
          is_published: boolean | null
          order_index: number
          title: string
        }
        Insert: {
          course_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_published?: boolean | null
          order_index: number
          title: string
        }
        Update: {
          course_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_published?: boolean | null
          order_index?: number
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_modules_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      courses: {
        Row: {
          category: string | null
          created_at: string | null
          description: string | null
          difficulty_level: string | null
          estimated_hours: number | null
          id: string
          instructor_id: string | null
          is_published: boolean | null
          price: number | null
          tags: string[] | null
          thumbnail_url: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          difficulty_level?: string | null
          estimated_hours?: number | null
          id?: string
          instructor_id?: string | null
          is_published?: boolean | null
          price?: number | null
          tags?: string[] | null
          thumbnail_url?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          difficulty_level?: string | null
          estimated_hours?: number | null
          id?: string
          instructor_id?: string | null
          is_published?: boolean | null
          price?: number | null
          tags?: string[] | null
          thumbnail_url?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "courses_instructor_id_fkey"
            columns: ["instructor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      discussion_replies: {
        Row: {
          content: string
          created_at: string | null
          discussion_id: string | null
          id: string
          likes_count: number | null
          user_id: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          discussion_id?: string | null
          id?: string
          likes_count?: number | null
          user_id?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          discussion_id?: string | null
          id?: string
          likes_count?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "discussion_replies_discussion_id_fkey"
            columns: ["discussion_id"]
            isOneToOne: false
            referencedRelation: "discussions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "discussion_replies_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "company_users"
            referencedColumns: ["id"]
          },
        ]
      }
      discussions: {
        Row: {
          content: string
          course_id: string | null
          created_at: string | null
          id: string
          likes_count: number | null
          replies_count: number | null
          title: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          content: string
          course_id?: string | null
          created_at?: string | null
          id?: string
          likes_count?: number | null
          replies_count?: number | null
          title: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          content?: string
          course_id?: string | null
          created_at?: string | null
          id?: string
          likes_count?: number | null
          replies_count?: number | null
          title?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "discussions_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "discussions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "company_users"
            referencedColumns: ["id"]
          },
        ]
      }
      enrollments: {
        Row: {
          completed_at: string | null
          course_id: string | null
          enrolled_at: string | null
          id: string
          progress_percentage: number | null
          user_id: string | null
        }
        Insert: {
          completed_at?: string | null
          course_id?: string | null
          enrolled_at?: string | null
          id?: string
          progress_percentage?: number | null
          user_id?: string | null
        }
        Update: {
          completed_at?: string | null
          course_id?: string | null
          enrolled_at?: string | null
          id?: string
          progress_percentage?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "enrollments_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      learning_path_courses: {
        Row: {
          course_id: string
          created_at: string
          id: string
          is_required: boolean
          learning_path_id: string
          order_index: number
        }
        Insert: {
          course_id: string
          created_at?: string
          id?: string
          is_required?: boolean
          learning_path_id: string
          order_index: number
        }
        Update: {
          course_id?: string
          created_at?: string
          id?: string
          is_required?: boolean
          learning_path_id?: string
          order_index?: number
        }
        Relationships: [
          {
            foreignKeyName: "learning_path_courses_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "learning_path_courses_learning_path_id_fkey"
            columns: ["learning_path_id"]
            isOneToOne: false
            referencedRelation: "learning_paths"
            referencedColumns: ["id"]
          },
        ]
      }
      learning_paths: {
        Row: {
          company_id: string
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          title: string
          updated_at: string
        }
        Insert: {
          company_id: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          title: string
          updated_at?: string
        }
        Update: {
          company_id?: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "learning_paths_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      lesson_materials: {
        Row: {
          company_id: string | null
          created_at: string
          extracted_content: string | null
          file_name: string
          file_size_bytes: number | null
          file_type: string
          file_url: string
          id: string
          lesson_id: string | null
          uploaded_by: string
        }
        Insert: {
          company_id?: string | null
          created_at?: string
          extracted_content?: string | null
          file_name: string
          file_size_bytes?: number | null
          file_type: string
          file_url: string
          id?: string
          lesson_id?: string | null
          uploaded_by: string
        }
        Update: {
          company_id?: string | null
          created_at?: string
          extracted_content?: string | null
          file_name?: string
          file_size_bytes?: number | null
          file_type?: string
          file_url?: string
          id?: string
          lesson_id?: string | null
          uploaded_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "lesson_materials_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lesson_materials_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      lesson_progress: {
        Row: {
          completed: boolean | null
          completed_at: string | null
          id: string
          last_watched_at: string | null
          lesson_id: string | null
          user_id: string | null
          watch_time_seconds: number | null
        }
        Insert: {
          completed?: boolean | null
          completed_at?: string | null
          id?: string
          last_watched_at?: string | null
          lesson_id?: string | null
          user_id?: string | null
          watch_time_seconds?: number | null
        }
        Update: {
          completed?: boolean | null
          completed_at?: string | null
          id?: string
          last_watched_at?: string | null
          lesson_id?: string | null
          user_id?: string | null
          watch_time_seconds?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "lesson_progress_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      lessons: {
        Row: {
          content: string | null
          created_at: string | null
          duration_minutes: number | null
          id: string
          image_url: string | null
          is_free: boolean | null
          material_url: string | null
          module_id: string | null
          order_index: number
          resources: Json | null
          title: string
          video_file_url: string | null
          video_url: string | null
        }
        Insert: {
          content?: string | null
          created_at?: string | null
          duration_minutes?: number | null
          id?: string
          image_url?: string | null
          is_free?: boolean | null
          material_url?: string | null
          module_id?: string | null
          order_index: number
          resources?: Json | null
          title: string
          video_file_url?: string | null
          video_url?: string | null
        }
        Update: {
          content?: string | null
          created_at?: string | null
          duration_minutes?: number | null
          id?: string
          image_url?: string | null
          is_free?: boolean | null
          material_url?: string | null
          module_id?: string | null
          order_index?: number
          resources?: Json | null
          title?: string
          video_file_url?: string | null
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lessons_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "course_modules"
            referencedColumns: ["id"]
          },
        ]
      }
      mentorship_attendees: {
        Row: {
          attended: boolean | null
          id: string
          joined_at: string | null
          left_at: string | null
          mentorship_session_id: string
          registered_at: string
          student_id: string
        }
        Insert: {
          attended?: boolean | null
          id?: string
          joined_at?: string | null
          left_at?: string | null
          mentorship_session_id: string
          registered_at?: string
          student_id: string
        }
        Update: {
          attended?: boolean | null
          id?: string
          joined_at?: string | null
          left_at?: string | null
          mentorship_session_id?: string
          registered_at?: string
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "mentorship_attendees_mentorship_session_id_fkey"
            columns: ["mentorship_session_id"]
            isOneToOne: false
            referencedRelation: "mentorship_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mentorship_attendees_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "company_users"
            referencedColumns: ["id"]
          },
        ]
      }
      mentorship_participants: {
        Row: {
          attended: boolean | null
          id: string
          mentorship_id: string
          registered_at: string
          user_id: string
        }
        Insert: {
          attended?: boolean | null
          id?: string
          mentorship_id: string
          registered_at?: string
          user_id: string
        }
        Update: {
          attended?: boolean | null
          id?: string
          mentorship_id?: string
          registered_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "mentorship_participants_mentorship_id_fkey"
            columns: ["mentorship_id"]
            isOneToOne: false
            referencedRelation: "mentorships"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mentorship_participants_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "company_users"
            referencedColumns: ["id"]
          },
        ]
      }
      mentorship_notifications: {
        Row: {
          id: string
          mentorship_session_id: string
          company_id: string | null
          notification_type: string
          title: string
          message: string
          is_read: boolean
          created_at: string
          read_at: string | null
        }
        Insert: {
          id?: string
          mentorship_session_id: string
          company_id?: string | null
          notification_type?: string
          title: string
          message: string
          is_read?: boolean
          created_at?: string
          read_at?: string | null
        }
        Update: {
          id?: string
          mentorship_session_id?: string
          company_id?: string | null
          notification_type?: string
          title?: string
          message?: string
          is_read?: boolean
          created_at?: string
          read_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "mentorship_notifications_mentorship_session_id_fkey"
            columns: ["mentorship_session_id"]
            isOneToOne: false
            referencedRelation: "producer_mentorship_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mentorship_notifications_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          }
        ]
      }
      mentorship_day_notifications: {
        Row: {
          id: string
          user_id: string
          mentorship_session_id: string
          notification_type: string
          read_at: string | null
          created_at: string
          scheduled_date: string
          company_id: string | null
          user_role: string
        }
        Insert: {
          id?: string
          user_id: string
          mentorship_session_id: string
          notification_type: string
          read_at?: string | null
          created_at?: string
          scheduled_date: string
          company_id?: string | null
          user_role: string
        }
        Update: {
          id?: string
          user_id?: string
          mentorship_session_id?: string
          notification_type?: string
          read_at?: string | null
          created_at?: string
          scheduled_date?: string
          company_id?: string | null
          user_role?: string
        }
        Relationships: [
          {
            foreignKeyName: "mentorship_day_notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mentorship_day_notifications_mentorship_session_id_fkey"
            columns: ["mentorship_session_id"]
            isOneToOne: false
            referencedRelation: "producer_mentorship_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mentorship_day_notifications_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          }
        ]
      }
      mentorship_sessions: {
        Row: {
          company_id: string
          created_at: string
          description: string | null
          duration_minutes: number
          id: string
          max_participants: number | null
          meet_id: string | null
          meet_url: string | null
          scheduled_at: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          company_id: string
          created_at?: string
          description?: string | null
          duration_minutes?: number
          id?: string
          max_participants?: number | null
          meet_id?: string | null
          meet_url?: string | null
          scheduled_at: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          company_id?: string
          created_at?: string
          description?: string | null
          duration_minutes?: number
          id?: string
          max_participants?: number | null
          meet_id?: string | null
          meet_url?: string | null
          scheduled_at?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "mentorship_sessions_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      mentorships: {
        Row: {
          company_id: string
          created_at: string
          description: string | null
          duration_minutes: number
          id: string
          is_active: boolean
          max_participants: number
          meeting_url: string | null
          mentor_id: string | null
          scheduled_at: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          company_id: string
          created_at?: string
          description?: string | null
          duration_minutes?: number
          id?: string
          is_active?: boolean
          max_participants?: number
          meeting_url?: string | null
          mentor_id?: string | null
          scheduled_at: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          company_id?: string
          created_at?: string
          description?: string | null
          duration_minutes?: number
          id?: string
          is_active?: boolean
          max_participants?: number
          meeting_url?: string | null
          mentor_id?: string | null
          scheduled_at?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "mentorships_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mentorships_mentor_id_fkey"
            columns: ["mentor_id"]
            isOneToOne: false
            referencedRelation: "company_users"
            referencedColumns: ["id"]
          },
        ]
      }
      points_history: {
        Row: {
          action_type: string
          description: string | null
          earned_at: string
          id: string
          points: number
          reference_id: string | null
          student_id: string
        }
        Insert: {
          action_type: string
          description?: string | null
          earned_at?: string
          id?: string
          points: number
          reference_id?: string | null
          student_id: string
        }
        Update: {
          action_type?: string
          description?: string | null
          earned_at?: string
          id?: string
          points?: number
          reference_id?: string | null
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "points_history_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "company_users"
            referencedColumns: ["id"]
          },
        ]
      }
      producer_mentorship_participants: {
        Row: {
          attended: boolean | null
          company_name: string | null
          id: string
          joined_at: string | null
          left_at: string | null
          participant_email: string
          participant_id: string
          participant_name: string
          registered_at: string
          session_id: string
        }
        Insert: {
          attended?: boolean | null
          company_name?: string | null
          id?: string
          joined_at?: string | null
          left_at?: string | null
          participant_email: string
          participant_id: string
          participant_name: string
          registered_at?: string
          session_id: string
        }
        Update: {
          attended?: boolean | null
          company_name?: string | null
          id?: string
          joined_at?: string | null
          left_at?: string | null
          participant_email?: string
          participant_id?: string
          participant_name?: string
          registered_at?: string
          session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "producer_mentorship_participants_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "producer_mentorship_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      producer_mentorship_sessions: {
        Row: {
          created_at: string
          description: string | null
          duration_minutes: number
          google_meet_id: string | null
          google_meet_url: string | null
          id: string
          is_active: boolean
          is_collective: boolean
          max_participants: number | null
          producer_id: string
          scheduled_at: string
          status: string
          target_company_id: string | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          duration_minutes?: number
          google_meet_id?: string | null
          google_meet_url?: string | null
          id?: string
          is_active?: boolean
          is_collective?: boolean
          max_participants?: number | null
          producer_id: string
          scheduled_at: string
          status?: string
          target_company_id?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          duration_minutes?: number
          google_meet_id?: string | null
          google_meet_url?: string | null
          id?: string
          is_active?: boolean
          is_collective?: boolean
          max_participants?: number | null
          producer_id?: string
          scheduled_at?: string
          status?: string
          target_company_id?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "producer_mentorship_sessions_target_company_id_fkey"
            columns: ["target_company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          }
        ]
      }
      producers: {
        Row: {
          auth_user_id: string
          created_at: string
          email: string
          id: string
          is_active: boolean
          name: string
          updated_at: string
        }
        Insert: {
          auth_user_id: string
          created_at?: string
          email: string
          id?: string
          is_active?: boolean
          name: string
          updated_at?: string
        }
        Update: {
          auth_user_id?: string
          created_at?: string
          email?: string
          id?: string
          is_active?: boolean
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          id: string
          role: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id: string
          role?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: string
          updated_at?: string
        }
        Relationships: []
      }
      quiz_attempts: {
        Row: {
          answers: Json
          attempt_number: number | null
          completed_at: string | null
          id: string
          passed: boolean | null
          quiz_id: string | null
          score: number
          user_id: string | null
        }
        Insert: {
          answers: Json
          attempt_number?: number | null
          completed_at?: string | null
          id?: string
          passed?: boolean | null
          quiz_id?: string | null
          score: number
          user_id?: string | null
        }
        Update: {
          answers?: Json
          attempt_number?: number | null
          completed_at?: string | null
          id?: string
          passed?: boolean | null
          quiz_id?: string | null
          score?: number
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quiz_attempts_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "quizzes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quiz_attempts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "company_users"
            referencedColumns: ["id"]
          },
        ]
      }
      quizzes: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          lesson_id: string | null
          max_attempts: number | null
          passing_score: number | null
          questions: Json
          title: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          lesson_id?: string | null
          max_attempts?: number | null
          passing_score?: number | null
          questions: Json
          title: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          lesson_id?: string | null
          max_attempts?: number | null
          passing_score?: number | null
          questions?: Json
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "quizzes_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      student_achievements: {
        Row: {
          achievement_id: string
          id: string
          student_id: string
          unlocked_at: string
        }
        Insert: {
          achievement_id: string
          id?: string
          student_id: string
          unlocked_at?: string
        }
        Update: {
          achievement_id?: string
          id?: string
          student_id?: string
          unlocked_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_achievements_achievement_id_fkey"
            columns: ["achievement_id"]
            isOneToOne: false
            referencedRelation: "achievements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_achievements_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "company_users"
            referencedColumns: ["id"]
          },
        ]
      }
      student_points: {
        Row: {
          created_at: string
          id: string
          last_activity_date: string | null
          level: number
          points: number
          streak_days: number
          student_id: string
          total_points: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          last_activity_date?: string | null
          level?: number
          points?: number
          streak_days?: number
          student_id: string
          total_points?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          last_activity_date?: string | null
          level?: number
          points?: number
          streak_days?: number
          student_id?: string
          total_points?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_points_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: true
            referencedRelation: "company_users"
            referencedColumns: ["id"]
          },
        ]
      }
      subscription_plans: {
        Row: {
          annual_price: number | null
          created_at: string
          description: string | null
          features: Json
          id: string
          is_active: boolean
          max_students: number
          name: string
          price: number
          semester_price: number | null
          updated_at: string
        }
        Insert: {
          annual_price?: number | null
          created_at?: string
          description?: string | null
          features?: Json
          id?: string
          is_active?: boolean
          max_students: number
          name: string
          price: number
          semester_price?: number | null
          updated_at?: string
        }
        Update: {
          annual_price?: number | null
          created_at?: string
          description?: string | null
          features?: Json
          id?: string
          is_active?: boolean
          max_students?: number
          name?: string
          price?: number
          semester_price?: number | null
          updated_at?: string
        }
        Relationships: []
      }

    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      ensure_user_profile: {
        Args: { user_id: string; user_role?: string }
        Returns: undefined
      }
      ensure_user_profile_consistency: {
        Args: Record<PropertyKey, never>
        Returns: {
          user_id: string
          email: string
          action_taken: string
        }[]
      }
      get_current_company_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_current_student_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_user_role: {
        Args: { user_id: string }
        Returns: string
      }
      get_user_role_enhanced: {
        Args: { user_id: string }
        Returns: string
      }
      get_user_role_safe: {
        Args: { user_id: string }
        Returns: string
      }
      is_company_user: {
        Args: { user_id: string }
        Returns: boolean
      }
      is_current_user_producer: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_current_user_producer_enhanced: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_current_user_producer_new: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_producer: {
        Args: { user_id: string }
        Returns: boolean
      }
      migrate_existing_producers: {
        Args: Record<PropertyKey, never>
        Returns: {
          migrated_count: number
        }[]
      }
      update_collaborator_stats: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
