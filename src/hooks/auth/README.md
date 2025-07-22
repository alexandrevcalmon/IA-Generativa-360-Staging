# Serviços de Autenticação

Este diretório contém os serviços de autenticação para a plataforma IA Generativa 360º. Os serviços são organizados de forma modular, com responsabilidades claramente separadas.

## Arquitetura

O sistema de autenticação utiliza o padrão de design de serviços, onde cada serviço é criado através de uma função factory. Isso facilita a manutenção, testabilidade e a injeção de dependências.

### Principais Serviços

- **authService**: Serviço principal que coordena os demais serviços de autenticação
- **signInService**: Gerencia o processo de login para diferentes tipos de usuários
- **signUpService**: Gerencia o processo de registro de novos usuários
- **passwordService**: Gerencia operações relacionadas a senhas (redefinição, alteração)
- **signOutService**: Gerencia o processo de logout
- **sessionValidationService**: Valida e gerencia sessões de usuário
- **auditService**: Registra eventos de autenticação para auditoria
- **throttlingService**: Limita tentativas de login para prevenir ataques de força bruta

## Fluxos de Autenticação

### Login de Produtor

```
signInService.signIn(email, password, 'producer')
  ↓
producerSignInService.signInProducer(email, password)
  ↓
Verificação de permissões via is_current_user_producer_enhanced()
  ↓
Atualização de metadados do usuário
```

### Login de Empresa

```
signInService.signIn(email, password, 'company')
  ↓
companySignInService.signInCompany(email, password)
  ↓
Verificação de associação com empresa
  ↓
Atualização de metadados do usuário
```

### Login de Colaborador

```
signInService.signIn(email, password)
  ↓
defaultSignInService.processDefaultSignIn(user, role)
  ↓
Detecção automática de papel de colaborador
  ↓
Atualização de metadados do usuário
```

## Segurança

### Auditoria

O sistema registra eventos de autenticação na tabela `auth_audit_logs`, incluindo:

- Tentativas de login (bem-sucedidas e falhas)
- Logouts
- Redefinições de senha
- Alterações de senha
- Registros de novos usuários

Cada evento inclui informações como:
- Tipo de evento
- ID do usuário (quando disponível)
- Email
- Endereço IP
- User Agent
- Metadados adicionais

### Throttling

O sistema limita tentativas de login para prevenir ataques de força bruta:

- Máximo de 5 tentativas por email em um período de 24 horas
- Bloqueio temporário de 15 minutos após exceder o limite
- Reset automático após 24 horas sem tentativas
- Reset imediato após login bem-sucedido

## Uso dos Serviços

### Exemplo de Login

```typescript
import { createAuthService } from './authService';
import { useToast } from '@/hooks/use-toast';

const { toast } = useToast();
const authService = createAuthService(toast);

// Login de produtor
const result = await authService.signIn(email, password, 'producer');

if (result.error) {
  // Tratar erro
} else {
  // Login bem-sucedido
  const { user, session, needsPasswordChange } = result;
}
```

### Exemplo de Logout

```typescript
import { createAuthService } from './authService';
import { useToast } from '@/hooks/use-toast';

const { toast } = useToast();
const authService = createAuthService(toast);

await authService.signOut();
```

## Tabelas do Banco de Dados

### auth_audit_logs

Armazena registros de eventos de autenticação para auditoria.

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | UUID | Identificador único do registro |
| event_type | TEXT | Tipo de evento (login_success, login_failure, logout, etc.) |
| user_id | UUID | ID do usuário (quando disponível) |
| email | TEXT | Email do usuário |
| ip_address | TEXT | Endereço IP do cliente |
| user_agent | TEXT | User Agent do cliente |
| metadata | JSONB | Metadados adicionais do evento |
| created_at | TIMESTAMPTZ | Data e hora do evento |

### auth_login_attempts

Controla tentativas de login para implementar throttling.

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | UUID | Identificador único do registro |
| email | TEXT | Email do usuário (único) |
| attempt_count | INTEGER | Número de tentativas de login |
| last_attempt | TIMESTAMPTZ | Data e hora da última tentativa |
| locked_until | TIMESTAMPTZ | Data e hora até quando o login está bloqueado |
| created_at | TIMESTAMPTZ | Data e hora de criação do registro |
| updated_at | TIMESTAMPTZ | Data e hora da última atualização |