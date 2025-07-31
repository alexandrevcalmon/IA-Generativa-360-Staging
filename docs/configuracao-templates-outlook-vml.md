# Configuração de Templates de Email para Outlook com Botões VML

## Problema Resolvido

Os botões não apareciam no Outlook porque o Outlook usa o motor de renderização do Microsoft Word, que não suporta CSS moderno para botões. A solução foi implementar **VML (Vector Markup Language)** para renderizar botões corretamente no Outlook.

## Solução Implementada

### Estrutura VML para Botões

Cada template agora usa uma estrutura híbrida:

```html
<!--[if mso]>
<v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" 
             href="{{ .ConfirmationURL }}" style="height:50px;v-text-anchor:middle;width:250px;" 
             arcsize="16%" stroke="f" fillcolor="#d49c3d">
<w:anchorlock/>
<center style="color:#ffffff;font-family:Arial,sans-serif;font-size:16px;font-weight:bold;">
    Ativar Minha Conta
</center>
</v:roundrect>
<![endif]-->
<!--[if !mso]><!-->
<a href="{{ .ConfirmationURL }}" class="cta-button" style="mso-hide:all;">
    Ativar Minha Conta
</a>
<!--<![endif]-->
```

### Templates Atualizados

1. **`invite-outlook-final.html`** - Convite para ativação de conta
2. **`recovery-outlook-final.html`** - Recuperação de senha
3. **`confirm-email-outlook-final.html`** - Confirmação de email
4. **`change-password-outlook-final.html`** - Confirmação de alteração de senha

## Configuração no Supabase

### Passo a Passo

1. **Acesse o Supabase Dashboard**
   - Vá para [supabase.com](https://supabase.com)
   - Faça login na sua conta
   - Selecione seu projeto

2. **Navegue para Authentication**
   - No menu lateral, clique em "Authentication"
   - Clique em "Email Templates"

3. **Configure cada template:**

#### Template de Convite (Invite)
- **Assunto:** `Bem-vindo à Calmon Academy - Ative sua Conta`
- **Conteúdo:** Copie o conteúdo de `test-outlook-buttons-outputs/invite-outlook-final.html`

#### Template de Recuperação (Recovery)
- **Assunto:** `Recuperação de Senha - Calmon Academy`
- **Conteúdo:** Copie o conteúdo de `test-outlook-buttons-outputs/recovery-outlook-final.html`

#### Template de Confirmação (Confirmation)
- **Assunto:** `Confirme seu Email - Calmon Academy`
- **Conteúdo:** Copie o conteúdo de `test-outlook-buttons-outputs/confirm-email-outlook-final.html`

#### Template de Alteração de Senha (Change Email)
- **Assunto:** `Senha Alterada - Calmon Academy`
- **Conteúdo:** Copie o conteúdo de `test-outlook-buttons-outputs/change-password-outlook-final.html`

## Testando os Templates

### 1. Teste Automatizado
Execute o script de validação:
```bash
node scripts/test-outlook-buttons.js
```

Este script irá:
- Validar se todos os elementos VML estão presentes
- Verificar se os botões têm a estrutura correta
- Gerar arquivos de teste em `test-outlook-buttons-outputs/`

### 2. Teste Manual no Outlook

1. **Envie um email de teste** para uma conta Outlook
2. **Verifique se o botão aparece** corretamente
3. **Teste o clique** no botão para confirmar que o link funciona
4. **Verifique em diferentes versões** do Outlook (2016, 2019, 365)

### 3. Verificações Importantes

- ✅ Botão aparece com cor de fundo
- ✅ Texto está centralizado e legível
- ✅ Link funciona corretamente
- ✅ Design responsivo em diferentes tamanhos de tela
- ✅ Compatível com versões antigas do Outlook

## Características dos Botões VML

### Estrutura Técnica
- **VML roundrect:** Cria um retângulo arredondado
- **Anchor lock:** Mantém o link ativo
- **Text anchor:** Centraliza o texto
- **Fill color:** Define a cor de fundo
- **Stroke:** Remove a borda

### Cores Utilizadas
- **Convite/Recuperação:** `#d49c3d` (dourado)
- **Confirmação:** `#edb247` (dourado claro)
- **Alteração de Senha:** `#edb247` (dourado claro)

### Responsividade
- **Desktop:** 250-300px de largura
- **Mobile:** 90% da largura do container
- **Altura:** 50-54px para boa usabilidade

## Troubleshooting

### Botão não aparece
1. Verifique se o VML está presente no código
2. Confirme se os comentários MSO estão corretos
3. Teste em diferentes versões do Outlook

### Link não funciona
1. Verifique se o `href` está correto
2. Confirme se as variáveis Supabase estão sendo substituídas
3. Teste o link em um navegador

### Design quebrado
1. Verifique se o CSS inline está presente
2. Confirme se as media queries estão corretas
3. Teste em diferentes resoluções

## Próximos Passos

1. **Configure os templates** no Supabase Dashboard
2. **Execute o teste automatizado** para validar
3. **Envie emails de teste** para contas Outlook
4. **Monitore os logs** do Supabase para erros
5. **Colete feedback** dos usuários sobre a aparência

## Suporte

Se encontrar problemas:
1. Verifique os logs do Supabase
2. Teste com o script de validação
3. Compare com os templates de exemplo
4. Consulte a documentação do Supabase sobre email templates

---

**Nota:** Os templates foram otimizados especificamente para o Outlook, mas também funcionam bem em outros clientes de email como Gmail, Apple Mail e Thunderbird. 