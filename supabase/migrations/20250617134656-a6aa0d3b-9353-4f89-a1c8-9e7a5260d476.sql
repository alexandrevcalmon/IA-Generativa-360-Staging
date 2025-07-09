
-- Habilitar RLS na tabela courses
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

-- Política para permitir que produtores vejam todos os cursos
CREATE POLICY "Producers can view all courses" ON public.courses
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'producer'
  )
);

-- Política para permitir que produtores criem cursos
CREATE POLICY "Producers can create courses" ON public.courses
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'producer'
  )
);

-- Política para permitir que produtores atualizem cursos
CREATE POLICY "Producers can update courses" ON public.courses
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'producer'
  )
);

-- Política para permitir que produtores excluam cursos
CREATE POLICY "Producers can delete courses" ON public.courses
FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'producer'
  )
);
