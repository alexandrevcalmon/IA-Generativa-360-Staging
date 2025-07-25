# Configuração de Email de Bounce no Supabase

## 🎯 Problema Identificado

Você está recebendo emails de "Undeliverable" no email configurado no SMTP do Supabase porque:
- Quando um email não pode ser entregue, o servidor de destino envia uma notificação de bounce
- Essa notificação é enviada para o **remetente** (seu email SMTP)
- Isso pode poluir sua caixa de entrada com notificações técnicas

## ✅ Soluções Implementadas

### **Opção 1: Email de Bounce Dedicado (Recomendado)**

#### **1. Criar Email de Bounce**
- Crie um email específico para receber bounces: `bounces@grupocalmon.com`
- Configure este email para filtrar automaticamente notificações de bounce

#### **2. Configurar no Supabase**
1. Acesse o **Supabase Dashboard**
2. Vá para **Settings > Auth > SMTP Settings**
3. Configure o campo **"From Email"** para usar o email de bounce:
   ```
   From Email: bounces@grupocalmon.com
   From Name: Calmon Academy
   ```

#### **3. Configurar Filtros (Opcional)**
No email de bounce, configure filtros para:
- Mover emails com "Undeliverable" para pasta específica
- Marcar como lidos automaticamente
- Excluir após X dias

### **Opção 2: Usar Email de Suporte**

#### **1. Configurar Email de Suporte**
- Use: `suporte@grupocalmon.com` ou `noreply@grupocalmon.com`
- Configure este email para receber notificações técnicas

#### **2. Configurar no Supabase**
```
From Email: suporte@grupocalmon.com
From Name: Calmon Academy - Suporte
```

### **Opção 3: Configurar Filtros no Email Atual**

#### **1. Filtros do Gmail/Outlook**
- Criar filtro para emails com assunto "Undeliverable"
- Mover para pasta "Bounces" ou "Lixo Eletrônico"
- Marcar como lidos automaticamente

#### **2. Exemplo de Filtro Gmail**
```
De: postmaster@outlook.com
Assunto: Undeliverable
Ação: Mover para pasta "Bounces"
```

## 🔧 **Configuração Atual Recomendada**

### **SMTP Settings no Supabase:**
```
SMTP Host: smtp.gmail.com (ou seu provedor)
SMTP Port: 587
SMTP User: seu-email@gmail.com
SMTP Pass: sua-senha-app
From Email: bounces@grupocalmon.com
From Name: Calmon Academy
```

### **Vantagens do Email de Bounce Dedicado:**
- ✅ Não polui sua caixa principal
- ✅ Fácil de filtrar e gerenciar
- ✅ Permite monitoramento de entregabilidade
- ✅ Mantém separação entre emails de negócio e técnicos

## 📊 **Monitoramento de Bounces**

### **Métricas Importantes:**
- **Taxa de Bounce**: % de emails não entregues
- **Tipos de Bounce**: Caixa cheia, email inválido, domínio inexistente
- **Tendências**: Aumento/diminuição de bounces ao longo do tempo

### **Ações Baseadas em Bounces:**
1. **Bounce Hard** (email inexistente): Remover da lista
2. **Bounce Soft** (caixa cheia): Tentar novamente mais tarde
3. **Muitos Bounces**: Revisar lista de emails

## 🚨 **Caso Específico: Caixa Cheia**

### **O que fazer quando receber bounce de "mailbox full":**
1. **Não reenviar imediatamente** - aguardar algumas horas
2. **Registrar o problema** - para análise futura
3. **Considerar contato alternativo** - se disponível
4. **Monitorar padrões** - se muitos usuários têm caixa cheia

### **Prevenção:**
- Incluir instruções sobre limpeza de caixa de entrada
- Oferecer opção de contato alternativo
- Implementar sistema de notificação por SMS (futuro)

## 📋 **Próximos Passos**

### **Imediato:**
1. ✅ Criar email de bounce dedicado
2. ✅ Configurar no Supabase
3. ✅ Testar envio de email
4. ✅ Verificar se bounces vão para o email correto

### **Futuro:**
1. 🔄 Implementar sistema de monitoramento de bounces
2. 🔄 Criar dashboard de métricas de entregabilidade
3. 🔄 Automatizar limpeza de lista baseada em bounces
4. 🔄 Implementar notificações alternativas (SMS)

## 🔍 **Verificação**

### **Para Testar:**
1. Configure o email de bounce no Supabase
2. Envie um email para um endereço inexistente
3. Verifique se o bounce vai para o email correto
4. Confirme que sua caixa principal não recebe mais bounces

---

**Última atualização:** Janeiro 2025  
**Status:** ✅ Implementado e pronto para configuração 