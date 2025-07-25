# Tradução de Mensagens de Erro para Português Brasileiro

## 🎯 Problema Identificado

O usuário reportou que estava recebendo mensagens de erro em inglês, especificamente:
- "New password should be different" (A nova senha deve ser diferente)
- Outras mensagens de erro do Supabase em inglês

## ✅ Solução Implementada

### 1. **Função de Tradução Genérica** (`formatErrorMessage`)
Localização: `src/hooks/auth/commonAuthUtils.ts`

**Mapeamentos principais:**
- `New password should be different` → `A nova senha deve ser diferente da atual.`
- `Password should be at least` → `A senha deve ter pelo menos 6 caracteres.`
- `Invalid login credentials` → `Email ou senha incorretos.`
- `Email not confirmed` → `Email não confirmado. Verifique sua caixa de entrada.`
- `User not found` → `Usuário não encontrado.`
- `For security purposes` → `Por segurança, aguarde alguns minutos antes de solicitar outro email.`
- `Too many requests` → `Muitas tentativas. Aguarde alguns minutos antes de tentar novamente.`
- `JWT expired` → `Sua sessão expirou. Faça login novamente.`
- `Invalid JWT` → `Sessão inválida. Faça login novamente.`

### 2. **Função Específica para Supabase** (`translateSupabaseError`)
Localização: `src/hooks/auth/commonAuthUtils.ts`

**Categorias de erro traduzidas:**

#### 🔐 **Erros de Autenticação**
- `Invalid login credentials` → `Email ou senha incorretos.`
- `Email not confirmed` → `Email não confirmado. Verifique sua caixa de entrada.`
- `User already registered` → `Este email já está em uso. Tente fazer login.`
- `User not found` → `Usuário não encontrado.`

#### 🔑 **Erros de Senha**
- `New password should be different` → `A nova senha deve ser diferente da atual.`
- `Password should be at least` → `A senha deve ter pelo menos 6 caracteres.`
- `Password is too weak` → `Senha muito fraca. Use uma senha mais forte.`
- `Password must contain at least one letter and one number` → `A senha deve conter pelo menos uma letra e um número.`

#### 🎫 **Erros de Tokens**
- `Invalid recovery token` → `Token de recuperação inválido.`
- `Recovery token expired` → `Token de recuperação expirado.`
- `Invalid confirmation token` → `Token de confirmação inválido.`
- `Invalid JWT` → `Sessão inválida. Faça login novamente.`
- `JWT expired` → `Sua sessão expirou. Faça login novamente.`

#### 🌐 **Erros de Rede**
- `fetch failed` → `Erro de conexão. Verifique sua internet.`
- `network error` → `Erro de rede. Verifique sua conexão.`
- `timeout` → `Tempo limite excedido. Tente novamente.`

#### 🚫 **Erros de Rate Limiting**
- `Too many requests` → `Muitas tentativas. Aguarde alguns minutos antes de tentar novamente.`
- `Rate limit exceeded` → `Limite de taxa excedido. Aguarde alguns minutos.`

## 📁 **Arquivos Modificados**

### 1. **Páginas de Autenticação**
- `src/pages/ResetPassword.tsx` - Tradução de erros na redefinição de senha
- `src/components/PasswordChangeDialog.tsx` - Tradução de erros na alteração de senha

### 2. **Serviços de Autenticação**
- `src/hooks/auth/passwordService.ts` - Tradução de erros de senha
- `src/hooks/auth/signUpService.ts` - Tradução de erros de cadastro
- `src/hooks/auth/producerSignInService.ts` - Tradução de erros de login

### 3. **Utilitários**
- `src/hooks/auth/commonAuthUtils.ts` - Funções de tradução implementadas

## 🔧 **Como Usar**

### **Importar a função:**
```typescript
import { translateSupabaseError } from '@/hooks/auth/commonAuthUtils';
```

### **Aplicar em toasts de erro:**
```typescript
// Antes
toast({
  title: "Erro ao atualizar senha",
  description: error.message, // Mensagem em inglês
  variant: "destructive",
});

// Depois
toast({
  title: "Erro ao atualizar senha",
  description: translateSupabaseError(error), // Mensagem em português
  variant: "destructive",
});
```

### **Aplicar em outros componentes:**
```typescript
// Para qualquer erro do Supabase
const errorMessage = translateSupabaseError(error);
```

## 🧪 **Testes Implementados**

### **Script de Teste:**
- `scripts/test-error-translations.js` - Testa todas as traduções

### **Casos de Teste Cobertos:**
1. ✅ Senha igual à anterior
2. ✅ Senha muito fraca
3. ✅ Credenciais inválidas
4. ✅ Email não confirmado
5. ✅ Usuário não encontrado
6. ✅ Muitas tentativas
7. ✅ JWT expirado
8. ✅ Erros de rede
9. ✅ Erros internos

## 🎯 **Resultado Esperado**

Após a implementação:

1. **Mensagens em Português**: Todas as mensagens de erro do Supabase serão exibidas em português brasileiro
2. **Experiência do Usuário**: Interface mais amigável e compreensível
3. **Consistência**: Padrão uniforme de mensagens em todo o sistema
4. **Manutenibilidade**: Fácil adição de novas traduções

## 📋 **Próximos Passos**

### **Para Testar:**
1. Teste o fluxo de recuperação de senha
2. Teste o fluxo de alteração de senha
3. Teste login com credenciais inválidas
4. Verifique se não há mais mensagens em inglês

### **Para Manter:**
1. Sempre usar `translateSupabaseError()` para erros do Supabase
2. Adicionar novas traduções no mapeamento quando necessário
3. Executar testes de tradução periodicamente

## 🔍 **Verificação Manual**

### **Cenários para Testar:**

#### **1. Recuperação de Senha**
- Solicitar recuperação com email inexistente
- Tentar recuperação múltiplas vezes (rate limit)
- Usar token expirado

#### **2. Alteração de Senha**
- Tentar usar a mesma senha atual
- Usar senha muito fraca
- Usar senha sem números/letras

#### **3. Login**
- Usar credenciais incorretas
- Tentar login com email não confirmado
- Fazer muitas tentativas (rate limit)

#### **4. Cadastro**
- Tentar cadastrar email já existente
- Usar formato de email inválido
- Usar senha muito fraca

## ✅ **Status**

- ✅ **Implementado**: Funções de tradução
- ✅ **Implementado**: Aplicação nos principais componentes
- ✅ **Implementado**: Testes de validação
- ✅ **Pronto para Teste**: Sistema completo de tradução

---

**Última atualização:** Janeiro 2025  
**Versão:** 1.0  
**Status:** ✅ Implementado e pronto para teste 