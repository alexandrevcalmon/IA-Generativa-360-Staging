# 🔧 Solução para Problema "Link Inválido" na Recuperação de Senha

## Problema Identificado

Você está recebendo o erro "Link Inválido" ao tentar recuperar a senha de um colaborador. Este problema pode ter várias causas.

## 🔍 Diagnóstico

### 1. **Verificar se há Colaboradores no Sistema**

Execute o script de teste para verificar se há colaboradores:

```bash
node scripts/test-collaborator-password-recovery.js
```

**Resultado esperado:** Se não há colaboradores, você verá:
```
⚠️ Nenhum colaborador encontrado no sistema
```

### 2. **Possíveis Causas do Problema**

#### **Causa 1: Colaborador não existe no sistema**
- O colaborador não foi criado corretamente
- O email está incorreto
- O colaborador foi deletado

#### **Causa 2: Colaborador sem auth_user_id vinculado**
- O colaborador foi criado na tabela `company_users`
- Mas não tem `auth_user_id` vinculado
- Isso acontece quando o colaborador não ativou a conta

#### **Causa 3: Token de recuperação expirado**
- O link de recuperação expirou
- Muitas tentativas de recuperação

#### **Causa 4: URL de redirecionamento incorreta**
- A URL de redirecionamento não está configurada corretamente
- O servidor local não está rodando

## 🛠️ Soluções

### **Solução 1: Criar um Colaborador para Teste**

1. **Acesse a área de colaboradores** como empresa
2. **Crie um novo colaborador** com um email válido
3. **Aguarde o email de convite**
4. **Ative a conta do colaborador** clicando no link do email
5. **Teste a recuperação de senha**

### **Solução 2: Verificar Colaboradores Existentes**

Execute o script de debug para verificar colaboradores:

```bash
node scripts/debug-collaborator-recovery.js
```

### **Solução 3: Testar com Email Específico**

Edite o arquivo `scripts/test-simple-recovery.js` e substitua:

```javascript
const testEmail = 'teste@exemplo.com'; // ⚠️ SUBSTITUA PELO EMAIL REAL
```

Pelo email real que você está testando, então execute:

```bash
node scripts/test-simple-recovery.js
```

### **Solução 4: Verificar Configuração**

1. **Verifique se o servidor está rodando:**
   ```bash
   npm run dev
   ```

2. **Verifique a URL de redirecionamento:**
   - Deve ser: `http://localhost:8081/reset-password`
   - Ou: `https://staging.grupocalmon.com/reset-password` (em produção)

3. **Verifique as variáveis de ambiente:**
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_FRONTEND_URL`

## 🔄 Fluxo Correto para Testar

### **Passo 1: Criar Colaborador**
1. Faça login como empresa
2. Vá para "Colaboradores"
3. Clique em "Adicionar Colaborador"
4. Preencha os dados (nome, email, cargo)
5. Clique em "Salvar"

### **Passo 2: Ativar Conta do Colaborador**
1. Verifique o email do colaborador
2. Abra o email de convite
3. Clique no link de ativação
4. Defina uma senha inicial
5. Confirme a ativação

### **Passo 3: Testar Recuperação de Senha**
1. Vá para a página de login
2. Clique em "Esqueci minha senha"
3. Digite o email do colaborador
4. Clique em "Enviar email de recuperação"
5. Verifique o email recebido
6. Clique no link de recuperação
7. Verifique se redireciona para `/reset-password`
8. Teste a redefinição da senha

## 🚨 Verificações Importantes

### **1. Verificar Logs do Console**
Abra o console do navegador (F12) e verifique:
- Se há erros JavaScript
- Se há logs de processamento de token
- Se a URL está sendo processada corretamente

### **2. Verificar Logs do Supabase**
No dashboard do Supabase:
- Vá para "Logs" > "Auth"
- Verifique se há erros de autenticação
- Verifique se os emails estão sendo enviados

### **3. Verificar Templates de Email**
No dashboard do Supabase:
- Vá para "Authentication" > "Email Templates"
- Verifique se os templates estão configurados
- Verifique se a URL de redirecionamento está correta

## 🔧 Scripts de Teste Disponíveis

### **1. Teste de Colaboradores**
```bash
node scripts/test-collaborator-password-recovery.js
```

### **2. Teste de Empresas**
```bash
node scripts/test-company-password-recovery.js
```

### **3. Teste Simples**
```bash
node scripts/test-simple-recovery.js
```

### **4. Debug Completo**
```bash
node scripts/debug-collaborator-recovery.js
```

## 📋 Checklist de Resolução

- [ ] Verificar se há colaboradores no sistema
- [ ] Verificar se o colaborador tem auth_user_id vinculado
- [ ] Verificar se o email está correto
- [ ] Verificar se o servidor está rodando
- [ ] Verificar se a URL de redirecionamento está correta
- [ ] Verificar se os templates de email estão configurados
- [ ] Testar com um colaborador válido
- [ ] Verificar logs do console do navegador
- [ ] Verificar logs do Supabase

## 🆘 Se o Problema Persistir

### **1. Teste com Conta de Empresa**
Como sabemos que a recuperação funciona para empresas, teste com uma conta de empresa para confirmar que o sistema está funcionando.

### **2. Verifique a Versão do Supabase**
Certifique-se de que está usando a versão mais recente do Supabase.

### **3. Limpe o Cache**
- Limpe o cache do navegador
- Limpe os cookies
- Tente em uma aba anônima

### **4. Verifique a Rede**
- Verifique se não há bloqueios de firewall
- Verifique se o DNS está funcionando
- Teste em uma rede diferente

## 📞 Suporte

Se o problema persistir após todas essas verificações:

1. **Colete os logs:**
   - Logs do console do navegador
   - Logs do Supabase
   - Resultado dos scripts de teste

2. **Documente o problema:**
   - Email do colaborador testado
   - Passos exatos realizados
   - Mensagens de erro recebidas

3. **Entre em contato:**
   - Forneça todas as informações coletadas
   - Descreva o problema detalhadamente 