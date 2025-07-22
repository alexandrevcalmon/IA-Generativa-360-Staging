# ⚠️ IMPORTANTE: FLUXO DE ATIVAÇÃO DE CONTA

## Problema Documentado

Identificamos um problema crítico no fluxo de ativação de conta onde usuários que clicavam no link de ativação enviado por e-mail eram redirecionados para a página principal (`/`) em vez de serem direcionados para a página de ativação (`/activate-account`) onde deveriam definir sua senha.

## Causa Raiz

A causa raiz do problema foi identificada como a configuração `detectSessionInUrl: true` no cliente Supabase (`src/integrations/supabase/client.ts`). Esta configuração faz com que o Supabase automaticamente:

1. Detecte tokens de autenticação na URL
2. Processe esses tokens e estabeleça uma sessão
3. Redirecione o usuário para a página principal

Este comportamento automático interfere com o fluxo de ativação de conta, pois não permite que o usuário chegue à página de ativação para definir sua senha.

## Solução Implementada

Para resolver este problema, implementamos as seguintes alterações:

1. **Desativamos o `detectSessionInUrl` no cliente Supabase**:
   ```typescript
   export const supabase = createClient<ExtendedDatabase>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
     auth: {
       storage: typeof window !== 'undefined' ? window.localStorage : undefined,
       persistSession: true,
       autoRefreshToken: true,
       detectSessionInUrl: false, // CRÍTICO: Deve ser false para o fluxo de ativação funcionar
       // Removed flowType: 'pkce' to use default implicit flow which is more stable
     },
     global: {
       headers: {
         'X-Client-Info': 'lovable-auth-client'
       }
     }
   });
   ```

2. **Adicionamos verificação de redirecionamento incorreto na página `ActivateAccount.tsx`**:
   ```typescript
   // Verificar se há um redirecionamento automático em andamento
   if (window.location.pathname === '/' && (token || hash)) {
     console.log('⚠️ Detectado redirecionamento incorreto para a página principal com token presente');
     console.log('🔄 Redirecionando para a página de ativação...');
     
     // Construir URL de ativação correta
     const redirectUrl = `/activate-account${token ? `?token=${token}&type=${type || 'invite'}` : ''}${hash || ''}`;
     navigate(redirectUrl, { replace: true });
     return;
   }
   ```

3. **Adicionamos verificação global no `App.tsx`**:
   ```typescript
   // Função para verificar se há um token de ativação na URL
   const checkActivationToken = () => {
     const url = window.location.href;
     const isRootPath = window.location.pathname === '/';
     
     // Verificar se estamos na página principal mas com parâmetros de ativação
     if (isRootPath) {
       // Verificar token no formato ?token=xxx&type=invite
       const urlParams = new URLSearchParams(window.location.search);
       const token = urlParams.get('token');
       const type = urlParams.get('type');
       
       // Verificar hash no formato #access_token=xxx
       const hash = window.location.hash;
       const hasActivationParams = (token && (type === 'invite' || type === 'recovery')) || 
                                  (hash && hash.includes('access_token'));
       
       if (hasActivationParams) {
         console.log('🔄 Detectado token de ativação na página principal, redirecionando...');
         // Construir URL de ativação
         const redirectUrl = `/activate-account${token ? `?token=${token}&type=${type || 'invite'}` : ''}${hash || ''}`;
         window.location.href = redirectUrl;
         return true;
       }
     }
     return false;
   };
   ```

## ⚠️ REGRAS CRÍTICAS PARA MANUTENÇÃO

1. **NUNCA altere a configuração `detectSessionInUrl` para `true`** no cliente Supabase sem testar completamente o fluxo de ativação de conta.

2. **SEMPRE teste o fluxo de ativação completo** após qualquer alteração relacionada à autenticação, especialmente:
   - Alterações no cliente Supabase
   - Alterações na página `ActivateAccount.tsx`
   - Alterações nas Edge Functions que enviam emails de convite
   - Alterações nos templates de email

3. **MANTENHA as verificações de redirecionamento** em `ActivateAccount.tsx` e `App.tsx` para garantir que o fluxo de ativação funcione mesmo se houver problemas com a configuração do Supabase.

4. **VERIFIQUE os logs do console** ao testar o fluxo de ativação para identificar possíveis problemas.

## Como Testar o Fluxo de Ativação

1. Envie um novo convite para um usuário (empresa ou colaborador)
2. Verifique o email recebido e confirme que o link de ativação está correto
3. Clique no link de ativação
4. Verifique se o usuário é direcionado para `/activate-account`
5. Verifique se o formulário de ativação é exibido
6. Complete o processo de ativação definindo uma senha
7. Verifique se o usuário é redirecionado para o dashboard apropriado

## Logs para Verificar

- Console do navegador: deve mostrar o processamento do token
- URL após clicar no link: deve conter `/activate-account`
- Logs das Edge Functions: verificar se o `redirectTo` está configurado corretamente

## Troubleshooting

Se o problema persistir:

1. Verifique se as alterações foram aplicadas corretamente
2. Limpe o cache do navegador e cookies
3. Verifique se há outros redirecionamentos configurados
4. Verifique os logs do Supabase para erros de autenticação
5. Verifique se o template de email está usando `{{ .ConfirmationURL }}` corretamente
6. Verifique se a variável de ambiente `SUPABASE_ACTIVATION_REDIRECT_URL` está configurada corretamente

## Referências

- [Documentação do Supabase Auth](https://supabase.com/docs/reference/javascript/auth-signinwithotp)
- [Documentação do Sistema de Autenticação](./SISTEMA-AUTENTICACAO-COMPLETO.md)
- [Arquivo de teste de ativação](../test-activation-fix.js)