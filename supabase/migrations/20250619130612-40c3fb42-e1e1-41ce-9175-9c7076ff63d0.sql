
-- Create AI chat sessions table to store conversation history
CREATE TABLE public.ai_chat_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lesson_id UUID REFERENCES public.lessons(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  ai_configuration_id UUID REFERENCES public.ai_configurations(id) ON DELETE SET NULL,
  session_data JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create AI chat messages table for individual messages
CREATE TABLE public.ai_chat_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES public.ai_chat_sessions(id) ON DELETE CASCADE,
  role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on both tables
ALTER TABLE public.ai_chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_chat_messages ENABLE ROW LEVEL SECURITY;

-- RLS policies for ai_chat_sessions
CREATE POLICY "Users can view their own chat sessions" 
  ON public.ai_chat_sessions FOR SELECT 
  TO authenticated 
  USING (
    user_id = auth.uid() OR
    -- Allow company users to view sessions from their company
    company_id IN (
      SELECT id FROM public.companies 
      WHERE auth_user_id = auth.uid()
    ) OR
    -- Allow producers to view all sessions for analytics
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'producer'
    )
  );

CREATE POLICY "Users can create their own chat sessions" 
  ON public.ai_chat_sessions FOR INSERT 
  TO authenticated 
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own chat sessions" 
  ON public.ai_chat_sessions FOR UPDATE 
  TO authenticated 
  USING (user_id = auth.uid());

-- RLS policies for ai_chat_messages
CREATE POLICY "Users can view messages from their sessions" 
  ON public.ai_chat_messages FOR SELECT 
  TO authenticated 
  USING (
    session_id IN (
      SELECT id FROM public.ai_chat_sessions 
      WHERE user_id = auth.uid() OR
      company_id IN (
        SELECT id FROM public.companies 
        WHERE auth_user_id = auth.uid()
      ) OR
      EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND role = 'producer'
      )
    )
  );

CREATE POLICY "Users can create messages in their sessions" 
  ON public.ai_chat_messages FOR INSERT 
  TO authenticated 
  WITH CHECK (
    session_id IN (
      SELECT id FROM public.ai_chat_sessions 
      WHERE user_id = auth.uid()
    )
  );

-- Add indexes for better performance
CREATE INDEX idx_ai_chat_sessions_lesson_user ON public.ai_chat_sessions(lesson_id, user_id);
CREATE INDEX idx_ai_chat_sessions_company ON public.ai_chat_sessions(company_id);
CREATE INDEX idx_ai_chat_messages_session ON public.ai_chat_messages(session_id);
