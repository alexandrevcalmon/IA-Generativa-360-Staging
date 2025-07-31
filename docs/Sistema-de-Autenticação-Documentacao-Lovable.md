 Sistema de Autenticação - Documentação Técnica Completa
🎯 Visão Geral
Este documento descreve em detalhes o funcionamento completo do sistema de autenticação da plataforma, desde a compra de planos até o acesso de empresas e colaboradores, incluindo o fluxo de pagamentos via Stripe, webhooks, e o processo de ativação de contas.

🏗️ Arquitetura do Sistema
Componentes Principais
Frontend React + TypeScript
Supabase (Backend as a Service)
Stripe (Processamento de Pagamentos)
Edge Functions (Lógica Serverless)
Sistema de Autenticação Multi-Role
Tecnologias Utilizadas
Frontend: React, TypeScript, Tailwind CSS, React Query
Backend: Supabase (PostgreSQL + Auth + Storage)
Pagamentos: Stripe Checkout + Subscriptions
Serverless: Deno Edge Functions
Estado: Context API com hooks customizados
💳 1. Fluxo de Compra e Pagamento
1.1 Processo de Compra do Plano

Passo 1: Seleção do Plano

// O usuário acessa /plans e seleciona um plano
// Dados do plano são recuperados da tabela subscription_plans
{
  id: "uuid",
  name: "Pro", 
  price: 199.90,
  max_students: 50,
  description: "Plano profissional..."
}


Passo 2: Preenchimento dos Dados da Empresa

interface CompanyData {
  // Dados básicos
  name: string;           // Nome fantasia
  official_name: string; // Razão social
  cnpj: string;          // CNPJ
  email: string;         // Email principal
  phone: string;         // Telefone
  
  // Endereço
  address_street: string;
  address_number: string;
  address_complement?: string;
  address_district: string;
  address_city: string;
  address_state: string;
  address_zip_code: string;
  
  // Contato responsável
  contact_name: string;
  contact_email: string;
  contact_phone: string;
  
  // Observações
  notes?: string;
}


Passo 3: Criação da Sessão de Checkout

// Frontend chama a Edge Function create-checkout
const response = await supabase.functions.invoke('create-checkout', {
  body: {
    planId: selectedPlan.id,
    companyData: formData,
    email: formData.contact_email
  }
});

// Redirecionamento para Stripe Checkout
window.open(response.data.url, '_blank');


1.2 Edge Function: create-checkout
Localização:

supabase/functions/create-checkout/index.ts

Responsabilidades:
1 - Validação dos dados recebidos
2 - Busca do plano na base de dados
3 - Criação/verificação do cliente no Stripe
4 - Criação da sessão de checkout no Stripe
5 - Configuração dos metadados para posterior processamento


Fluxo Detalhado:

// 1. Validação inicial
const { planId, companyData, email } = await req.json();
if (!planId || !companyData || !email) {
  throw new Error("Missing required fields");
}

// 2. Busca do plano no Supabase
const { data: plan } = await supabaseClient
  .from('subscription_plans')
  .select('*')
  .eq('id', planId)
  .single();

// 3. Verificação/criação do cliente Stripe
const customers = await stripe.customers.list({ email, limit: 1 });
let customerId = customers.data.length > 0 
  ? customers.data[0].id 
  : (await stripe.customers.create({ email, name: companyData.name })).id;

// 4. Criação da sessão de checkout
const session = await stripe.checkout.sessions.create({
  customer: customerId,
  line_items: [{
    price_data: {
      currency: "brl",
      product_data: {
        name: `Plano ${plan.name}`,
        description: plan.description
      },
      unit_amount: Math.round(plan.price * 100), // Centavos
      recurring: { interval: "month" }
    },
    quantity: 1
  }],
  mode: "subscription",
  success_url: `${origin}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
  cancel_url: `${origin}/plans`,
  metadata: {
    plan_id: planId,
    company_data: JSON.stringify(companyData) // ⚠️ Dados para webhook
  }
});


🎉 2. Processamento Pós-Pagamento
2.1 Verificação do Pagamento

Edge Function:
supabase/functions/verify-payment/index.ts


Esta função é chamada na página de sucesso (/payment-success) e processa a criação da empresa e usuário após confirmação do pagamento.

Fluxo Completo:

// 1. Recebimento do sessionId da URL
const { sessionId } = await req.json();

// 2. Recuperação da sessão do Stripe
const session = await stripe.checkout.sessions.retrieve(sessionId);

// 3. Validação do status de pagamento
if (session.payment_status !== 'paid') {
  throw new Error('Payment not completed');
}

// 4. Recuperação da subscription
const subscription = await stripe.subscriptions.retrieve(session.subscription);

// 5. Parse dos dados da empresa dos metadados
const companyData = JSON.parse(session.metadata?.company_data || '{}');
const planId = session.metadata?.plan_id;

// 6. Criação do usuário de autenticação
const { data: authUser, error: authError } = await supabaseClient.auth.admin.createUser({
  email: companyData.email,
  password: companyData.password, // Senha temporária gerada
  email_confirm: true, // Auto-confirmação
  user_metadata: {
    name: companyData.name,
    role: 'company'
  }
});

// 7. Criação do registro da empresa
const companyRecord = {
  auth_user_id: authUser.user?.id,
  name: companyData.name,
  official_name: companyData.official_name,
  email: companyData.email,
  subscription_plan_id: planId,
  stripe_customer_id: session.customer,
  subscription_id: subscription.id,
  subscription_status: subscription.status,
  current_period_end: new Date(subscription.current_period_end * 1000),
  needs_password_change: true, // ⚠️ Força mudança de senha
  is_active: true,
  // ... outros campos
};

// 8. Criação do perfil
await supabaseClient.from('profiles').insert({
  id: authUser.user?.id,
  role: 'company',
  name: companyData.name,
  email: companyData.email
});


2.2 Email de Ativação da Conta
Após a criação bem-sucedida da empresa, o sistema envia automaticamente um email com:

Credenciais temporárias (email + senha padrão)
Link para primeiro acesso
Instruções de ativação
Obrigatoriedade de troca de senha
🔐 3. Sistema de Autenticação
3.1 Arquitetura de Autenticação
O sistema utiliza uma arquitetura em camadas para gerenciar diferentes tipos de usuários:

// Hierarquia de Roles
enum UserRole {
  PRODUCER = 'producer',    // Criador de conteúdo (nível mais alto)
  COMPANY = 'company',      // Empresa (administrador da conta)
  COLLABORATOR = 'collaborator', // Funcionário da empresa  
  STUDENT = 'student'       // Usuário padrão (menor privilégio)
}


3.2 Context de Autenticação
Localização: src/hooks/auth/AuthProvider.tsx

O AuthProvider centraliza todo o estado de autenticação:

interface AuthContextType {
  // Estado básico
  user: User | null;
  session: Session | null;
  loading: boolean;
  isInitialized: boolean;
  
  // Informações de role
  userRole: string;
  isProducer: boolean;
  isCompany: boolean;
  isStudent: boolean;
  isCollaborator: boolean;
  
  // Flags especiais
  needsPasswordChange: boolean;
  companyUserData: any;
  
  // Métodos
  signIn: (email: string, password: string, role?: string) => Promise<any>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<any>;
  changePassword: (newPassword: string) => Promise<any>;
  refreshUserRole: () => Promise<void>;
}


3.3 Inicialização da Autenticação
Processo de Inicialização:

// 1. Setup do listener de mudanças de estado
supabase.auth.onAuthStateChange(async (event, session) => {
  await handleAuthStateChange(event, session);
});

// 2. Verificação de sessão existente
const { data: { session } } = await supabase.auth.getSession();
if (session) {
  await handleAuthStateChange('SIGNED_IN', session);
}

// 3. Monitoramento periódico de sessão
setInterval(() => {
  checkSessionValidity();
}, 30000); // A cada 30 segundos


3.4 Detecção de Role do Usuário
Função: fetchUserRoleAuxiliaryData

Hierarquia de verificação:

// 1ª Prioridade: Verificar se é Producer
const isProducer = await checkProducerStatus(user.id);
if (isProducer) return { role: 'producer', ... };

// 2ª Prioridade: Verificar se é Company Owner
const companyData = await getCompanyByAuthUserId(user.id);
if (companyData) return { role: 'company', needsPasswordChange: true, ... };

// 3ª Prioridade: Verificar tabela profiles
const profileData = await getProfileData(user.id);
if (profileData?.role && profileData.role !== 'student') {
  return { role: profileData.role, ... };
}

// 4ª Prioridade: Verificar se é Collaborator
const collaboratorData = await getCollaboratorData(user.id);
if (collaboratorData) return { role: 'collaborator', ... };

// Padrão: Student
return { role: 'student', ... };


🏢 4. Autenticação de Empresa
4.1 Primeiro Acesso da Empresa
Cenário: Empresa criada via pagamento tenta fazer login pela primeira vez.

Fluxo no Frontend:

// Usuário tenta fazer login em /auth
const result = await signIn(email, password, 'company');

// Se credenciais inválidas, verifica se existe empresa com esse email
if (result.error?.message.includes('Invalid login credentials')) {
  const companies = await checkCompanyByEmail(email);
  
  if (companies.length > 0) {
    // Criar/vincular usuário de auth à empresa
    await createCompanyAuthUser(email, companies[0].id);
    
    // Tentar login novamente
    const retryResult = await signIn(email, password);
    return { ...retryResult, needsPasswordChange: true };
  }
}


// Usuário tenta fazer login em /auth
const result = await signIn(email, password, 'company');

// Se credenciais inválidas, verifica se existe empresa com esse email
if (result.error?.message.includes('Invalid login credentials')) {
  const companies = await checkCompanyByEmail(email);
  
  if (companies.length > 0) {
    // Criar/vincular usuário de auth à empresa
    await createCompanyAuthUser(email, companies[0].id);
    
    // Tentar login novamente
    const retryResult = await signIn(email, password);
    return { ...retryResult, needsPasswordChange: true };
  }
}


Edge Function: create-company-auth-user
Responsabilidades:

Verificar se a empresa existe e se o email confere
Verificar se já existe usuário de auth para esse email
Criar novo usuário ou vincular existente
Atualizar metadados do usuário
Definir flag de troca de senha

// Verificação da empresa
const { data: company } = await supabaseAdmin
  .from('companies')
  .select('*')
  .eq('id', companyId)
  .maybeSingle();

if (company.contact_email !== email) {
  throw new Error('Company found, but contact email does not match');
}

// Verificação de usuário existente
const existingAuthUser = userList?.find(user => user.email === email);

if (existingAuthUser) {
  // Atualizar metadados do usuário existente
  await supabaseAdmin.auth.admin.updateUserById(authUserId, {
    user_metadata: { 
      role: 'company', 
      company_id: companyId, 
      company_name: company.name 
    }
  });
} else {
  // Criar novo usuário
  const { data: newAuthUserData } = await supabaseAdmin.auth.admin.createUser({
    email: email,
    password: 'ia360graus', // Senha padrão
    email_confirm: true,
    user_metadata: { 
      role: 'company', 
      company_id: companyId, 
      company_name: company.name 
    }
  });
}

// Vincular à empresa
await supabaseAdmin
  .from('companies')
  .update({ 
    auth_user_id: authUserId, 
    needs_password_change: true 
  })
  .eq('id', companyId);


4.2 Obrigatoriedade de Troca de Senha
Toda empresa criada via pagamento DEVE trocar a senha no primeiro acesso:

// AuthGuard verifica se precisa trocar senha
if (needsPasswordChange) {
  return <PasswordChangeDialog />;
}

// PasswordChangeDialog força a troca
const handlePasswordChange = async () => {
  const { error } = await changePassword(newPassword);
  
  if (!error) {
    // Atualiza flag na empresa
    await updateCompanyPasswordFlag(false);
    // Atualiza estado global
    await refreshUserRole();
  }
};


// AuthGuard verifica se precisa trocar senha
if (needsPasswordChange) {
  return <PasswordChangeDialog />;
}

// PasswordChangeDialog força a troca
const handlePasswordChange = async () => {
  const { error } = await changePassword(newPassword);
  
  if (!error) {
    // Atualiza flag na empresa
    await updateCompanyPasswordFlag(false);
    // Atualiza estado global
    await refreshUserRole();
  }
};


👥 5. Autenticação de Colaboradores
5.1 Criação de Colaboradores
Processo:

Empresa logada acessa área de colaboradores
Preenche dados do novo colaborador
Sistema cria registro na tabela company_users
Envia email com credenciais temporárias
Colaborador deve trocar senha no primeiro acesso
5.2 Login de Colaborador
Fluxo Similar ao da Empresa:

// 1. Tentativa de login padrão
const { data, error } = await supabase.auth.signInWithPassword({ email, password });

// 2. Se falhar, verificar se existe como colaborador
if (error?.message.includes('Invalid login credentials')) {
  const collaborator = await findCollaboratorByEmail(email);
  
  if (collaborator) {
    // Criar/vincular usuário de auth
    await createCollaboratorAuthUser(email, collaborator.id);
    
    // Tentar login novamente
    const retryResult = await signIn(email, password);
    return { ...retryResult, needsPasswordChange: true };
  }
}

// 3. Se login bem-sucedido, verificar role
const collaboratorData = await getCollaboratorData(user.id);
if (collaboratorData) {
  // Definir role como collaborator
  await updateUserRole('collaborator');
  return { role: 'collaborator', companyData: collaboratorData };
}


🔄 6. Monitoramento de Assinatura
6.1 Verificação Automática
Edge Function: check-subscription

Executada:

No login (toda vez)
Periodicamente (a cada 10 segundos na dashboard)
Manualmente (botão "Verificar Status")
Processo de Verificação:

// 1. Obter dados da empresa
const { data: companyData } = await supabaseClient
  .from('companies')
  .select('*, subscription_plan_data:subscription_plans!companies_subscription_plan_id_fkey(*)')
  .eq('auth_user_id', user.id)
  .single();

// 2. Verificar no Stripe
const subscription = await stripe.subscriptions.retrieve(companyData.subscription_id);

// 3. Verificar mudança de status
const hasStatusChanged = companyData.subscription_status !== subscription.status;

// 4. Atualizar se necessário
if (hasStatusChanged) {
  await supabaseClient
    .from('companies')
    .update({
      subscription_status: subscription.status,
      current_period_end: new Date(subscription.current_period_end * 1000),
      updated_at: new Date()
    })
    .eq('id', companyData.id);
}

// 5. Retornar status atual
return {
  subscribed: subscription.status === 'active',
  subscription_tier: determineTier(subscription),
  subscription_end: new Date(subscription.current_period_end * 1000)
};


6.2 Portal do Cliente
Edge Function: customer-portal

Permite à empresa gerenciar sua assinatura:

// Criar sessão do portal Stripe
const portalSession = await stripe.billingPortal.sessions.create({
  customer: customerId,
  return_url: `${origin}/company-dashboard`
});

// Redirecionar para portal
window.open(portalSession.url, '_blank');


🛡️ 7. Controle de Acesso
7.1 AuthGuard Component
Proteção de Rotas:

<AuthGuard requiredRole="company">
  <CompanyDashboard />
</AuthGuard>

<AuthGuard requiredRole="collaborator">
  <StudentCourses />
</AuthGuard>

<AuthGuard requiredRole="producer">
  <ProducerDashboard />
</AuthGuard>


7.2 Row Level Security (RLS)
Políticas de Segurança no Supabase:

-- Empresas só veem seus próprios dados
CREATE POLICY "Companies can view their own data" 
ON companies FOR SELECT 
USING (auth_user_id = auth.uid());

-- Colaboradores só veem dados da sua empresa
CREATE POLICY "Collaborators can view their company data" 
ON companies FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM company_users 
  WHERE auth_user_id = auth.uid() 
  AND company_id = companies.id
));

-- Produtores veem tudo
CREATE POLICY "Producers can view all companies" 
ON companies FOR SELECT 
USING (is_current_user_producer_enhanced());


📧 8. Sistema de Emails
8.1 Email de Ativação da Empresa
Enviado automaticamente após pagamento bem-sucedido:

<h1>Bem-vindo à Plataforma!</h1>
<p>Sua empresa {{company_name}} foi cadastrada com sucesso.</p>

<h2>Credenciais de Acesso:</h2>
<p><strong>Email:</strong> {{contact_email}}</p>
<p><strong>Senha Temporária:</strong> ia360graus</p>

<p><a href="{{login_url}}">Fazer Login</a></p>

<p><strong>⚠️ IMPORTANTE:</strong> Você deve alterar sua senha no primeiro acesso.</p>


8.2 Email de Convite de Colaborador
Enviado quando empresa adiciona novo colaborador:

<h1>Você foi convidado para {{company_name}}!</h1>
<p>{{company_admin_name}} convidou você para acessar a plataforma.</p>

<h2>Suas Credenciais:</h2>
<p><strong>Email:</strong> {{collaborator_email}}</p>
<p><strong>Senha Temporária:</strong> {{temp_password}}</p>

<p><a href="{{login_url}}">Fazer Login</a></p>


🔧 9. Configurações Técnicas
9.1 Variáveis de Ambiente

# Supabase
SUPABASE_URL=https://swmxqjdvungochdjvtjg.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Stripe
STRIPE_SECRET_KEY=sk_test_... (ou sk_live_... em produção)

# Email
RESEND_API_KEY=re_...

# Senha padrão para novos usuários
NEW_COMPANY_USER_DEFAULT_PASSWORD=ia360graus


9.2 Estrutura do Banco de Dados

-- Tabela de empresas
CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id UUID REFERENCES auth.users(id),
  name VARCHAR NOT NULL,
  email VARCHAR,
  subscription_status TEXT DEFAULT 'inactive',
  needs_password_change BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  -- ... outros campos
);

-- Tabela de colaboradores
CREATE TABLE company_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id),
  auth_user_id UUID REFERENCES auth.users(id),
  needs_password_change BOOLEAN DEFAULT true,
  is_active BOOLEAN DEFAULT true,
  -- ... outros campos
);

-- Tabela de perfis
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  role VARCHAR NOT NULL DEFAULT 'student',
  created_at TIMESTAMPTZ DEFAULT now(),
  -- ... outros campos
);


🚨 10. Troubleshooting
10.1 Problemas Comuns
1. "Invalid login credentials" para empresa existente

Causa: Empresa criada mas usuário de auth não vinculado
Solução: Sistema chama automaticamente create-company-auth-user
2. "User not found" após pagamento

Causa: Falha na edge function verify-payment
Solução: Verificar logs da função e reprocessar pagamento
3. Collaborador não consegue acessar

Causa: Registro criado mas usuário de auth não criado
Solução: Reenviar convite ou criar manualmente
10.2 Logs e Monitoramento

// Todos os serviços incluem logging detalhado
console.log(`[AuthService] User ${email} attempting login...`);
console.log(`[CompanySignIn] Company ${company.name} found`);
console.log(`[VerifyPayment] Payment verified for ${companyData.email}`);


📊 11. Fluxograma Completo

graph TD
    A[Cliente acessa /plans] --> B[Seleciona Plano]
    B --> C[Preenche dados da empresa]
    C --> D[create-checkout Edge Function]
    D --> E[Redirect para Stripe]
    E --> F{Pagamento aprovado?}
    F -->|Não| G[Volta para /plans]
    F -->|Sim| H[/payment-success]
    H --> I[verify-payment Edge Function]
    I --> J[Cria usuário auth]
    J --> K[Cria registro empresa]
    K --> L[Envia email ativação]
    L --> M[Empresa faz primeiro login]
    M --> N{Credenciais válidas?}
    N -->|Não| O[create-company-auth-user]
    O --> P[Retry login]
    N -->|Sim| Q[Verifica necessidade troca senha]
    P --> Q
    Q -->|Precisa| R[PasswordChangeDialog]
    Q -->|Não precisa| S[Acesso liberado]
    R --> T[Troca senha]
    T --> S
    S --> U[Dashboard da empresa]
    U --> V[Adiciona colaboradores]
    V --> W[Colaborador recebe email]
    W --> X[Colaborador faz login]
    X --> Y[Mesmo fluxo de auth]


🎯 Conclusão
Este sistema de autenticação oferece:

✅ Segurança robusta com múltiplas camadas
✅ Escalabilidade via Edge Functions
✅ Flexibilidade para diferentes tipos de usuário
✅ Integração completa com pagamentos
✅ Monitoramento automático de assinaturas
✅ UX otimizada com tratamento de edge cases
O fluxo completo garante que desde a compra até o uso diário da plataforma, todos os processos sejam seguros, automatizados e orientados a uma excelente experiência do usuário.
