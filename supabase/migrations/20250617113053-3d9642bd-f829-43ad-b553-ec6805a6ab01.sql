
-- Remover políticas existentes se já existirem (para evitar conflitos)
DROP POLICY IF EXISTS "Producers can manage company users" ON public.company_users;
DROP POLICY IF EXISTS "Producers can manage all data" ON public.companies;
DROP POLICY IF EXISTS "Companies can view their own data" ON public.companies;
DROP POLICY IF EXISTS "Companies can update their own data" ON public.companies;
DROP POLICY IF EXISTS "Companies can view their collaborators" ON public.company_users;
DROP POLICY IF EXISTS "Students can view their own data" ON public.company_users;
DROP POLICY IF EXISTS "Students can update their own data" ON public.company_users;

-- Adicionar colunas necessárias à tabela companies para vincular ao auth.users
ALTER TABLE public.companies 
ADD COLUMN IF NOT EXISTS auth_user_id UUID UNIQUE REFERENCES auth.users(id);

-- Criar tabela para perfis de usuários (para produtores)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  role VARCHAR(50) NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'producer', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS na tabela profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Função para verificar se é produtor (SECURITY DEFINER para evitar recursão)
CREATE OR REPLACE FUNCTION public.is_producer(user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = user_id AND role = 'producer'
  );
$$;

-- Função para obter company_id do usuário logado
CREATE OR REPLACE FUNCTION public.get_current_company_id()
RETURNS UUID
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT id FROM public.companies 
  WHERE auth_user_id = auth.uid()
  LIMIT 1;
$$;

-- Função para obter student_id do usuário logado
CREATE OR REPLACE FUNCTION public.get_current_student_id()
RETURNS UUID
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT id FROM public.company_users 
  WHERE auth_user_id = auth.uid()
  LIMIT 1;
$$;

-- Criar tabela para mensagens da empresa
CREATE TABLE IF NOT EXISTS public.company_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  sender_auth_user_id UUID NOT NULL REFERENCES auth.users(id),
  recipient_student_id UUID REFERENCES public.company_users(id),
  recipient_scope VARCHAR(50) NOT NULL DEFAULT 'INDIVIDUAL' CHECK (recipient_scope IN ('INDIVIDUAL', 'ALL_COMPANY_USERS')),
  subject VARCHAR(255) NOT NULL,
  body TEXT NOT NULL,
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS na tabela company_messages
ALTER TABLE public.company_messages ENABLE ROW LEVEL SECURITY;

-- RLS para profiles - usuários podem ver/editar seu próprio perfil
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile" 
  ON public.profiles 
  FOR SELECT 
  USING (id = auth.uid());

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile" 
  ON public.profiles 
  FOR UPDATE 
  USING (id = auth.uid());

-- RLS para produtores - podem gerenciar tudo
CREATE POLICY "Producers can manage all data" 
  ON public.companies 
  FOR ALL 
  USING (public.is_producer(auth.uid()));

CREATE POLICY "Producers can manage company users" 
  ON public.company_users 
  FOR ALL 
  USING (public.is_producer(auth.uid()));

-- RLS para empresas - podem ver seus próprios dados
CREATE POLICY "Companies can view their own data" 
  ON public.companies 
  FOR SELECT 
  USING (auth_user_id = auth.uid());

CREATE POLICY "Companies can update their own data" 
  ON public.companies 
  FOR UPDATE 
  USING (auth_user_id = auth.uid());

-- RLS para empresas verem seus colaboradores
CREATE POLICY "Companies can view their collaborators" 
  ON public.company_users 
  FOR SELECT 
  USING (company_id = public.get_current_company_id());

-- RLS para alunos verem seus próprios dados
CREATE POLICY "Students can view their own data" 
  ON public.company_users 
  FOR SELECT 
  USING (auth_user_id = auth.uid());

CREATE POLICY "Students can update their own data" 
  ON public.company_users 
  FOR UPDATE 
  USING (auth_user_id = auth.uid());

-- RLS para mensagens da empresa
DROP POLICY IF EXISTS "Companies can insert messages for their users" ON public.company_messages;
CREATE POLICY "Companies can insert messages for their users" 
  ON public.company_messages 
  FOR INSERT 
  WITH CHECK (company_id = public.get_current_company_id());

DROP POLICY IF EXISTS "Companies can view their sent messages" ON public.company_messages;
CREATE POLICY "Companies can view their sent messages" 
  ON public.company_messages 
  FOR SELECT 
  USING (company_id = public.get_current_company_id());

DROP POLICY IF EXISTS "Students can view messages sent to them" ON public.company_messages;
CREATE POLICY "Students can view messages sent to them" 
  ON public.company_messages 
  FOR SELECT 
  USING (
    recipient_student_id = public.get_current_student_id() 
    OR (recipient_scope = 'ALL_COMPANY_USERS' AND company_id = (
      SELECT company_id FROM public.company_users WHERE auth_user_id = auth.uid()
    ))
  );

DROP POLICY IF EXISTS "Students can update read status of their messages" ON public.company_messages;
CREATE POLICY "Students can update read status of their messages" 
  ON public.company_messages 
  FOR UPDATE 
  USING (
    recipient_student_id = public.get_current_student_id() 
    OR (recipient_scope = 'ALL_COMPANY_USERS' AND company_id = (
      SELECT company_id FROM public.company_users WHERE auth_user_id = auth.uid()
    ))
  )
  WITH CHECK (
    recipient_student_id = public.get_current_student_id() 
    OR (recipient_scope = 'ALL_COMPANY_USERS' AND company_id = (
      SELECT company_id FROM public.company_users WHERE auth_user_id = auth.uid()
    ))
  );

-- RLS para matrículas - alunos podem ver suas próprias matrículas
DROP POLICY IF EXISTS "Students can view their own enrollments" ON public.enrollments;
CREATE POLICY "Students can view their own enrollments" 
  ON public.enrollments 
  FOR SELECT 
  USING (user_id IN (
    SELECT auth_user_id FROM public.company_users WHERE id = public.get_current_student_id()
  ));

-- RLS para progresso das aulas - alunos podem ver/atualizar seu próprio progresso
DROP POLICY IF EXISTS "Students can view their own lesson progress" ON public.lesson_progress;
CREATE POLICY "Students can view their own lesson progress" 
  ON public.lesson_progress 
  FOR SELECT 
  USING (user_id IN (
    SELECT auth_user_id FROM public.company_users WHERE id = public.get_current_student_id()
  ));

DROP POLICY IF EXISTS "Students can update their own lesson progress" ON public.lesson_progress;
CREATE POLICY "Students can update their own lesson progress" 
  ON public.lesson_progress 
  FOR UPDATE 
  USING (user_id IN (
    SELECT auth_user_id FROM public.company_users WHERE id = public.get_current_student_id()
  ));

-- Empresas podem ver progresso de seus colaboradores
DROP POLICY IF EXISTS "Companies can view their collaborators progress" ON public.lesson_progress;
CREATE POLICY "Companies can view their collaborators progress" 
  ON public.lesson_progress 
  FOR SELECT 
  USING (user_id IN (
    SELECT auth_user_id FROM public.company_users 
    WHERE company_id = public.get_current_company_id()
  ));

DROP POLICY IF EXISTS "Companies can view their collaborators enrollments" ON public.enrollments;
CREATE POLICY "Companies can view their collaborators enrollments" 
  ON public.enrollments 
  FOR SELECT 
  USING (user_id IN (
    SELECT auth_user_id FROM public.company_users 
    WHERE company_id = public.get_current_company_id()
  ));

-- Trigger para criar perfil automaticamente quando um usuário se registra
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, role)
  VALUES (NEW.id, 'student');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_companies_auth_user_id ON public.companies(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_company_messages_company_id ON public.company_messages(company_id);
CREATE INDEX IF NOT EXISTS idx_company_messages_recipient ON public.company_messages(recipient_student_id);
