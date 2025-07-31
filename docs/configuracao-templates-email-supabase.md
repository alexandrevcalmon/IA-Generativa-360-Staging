# 📧 Guia de Configuração dos Templates de Email no Supabase

## 🎯 **Problema Identificado**

Os templates de email que criamos estão na pasta local `supabase/templates/`, mas o **Supabase não usa automaticamente esses arquivos**. Os templates precisam ser configurados manualmente no **painel de controle do Supabase**.

## 🔧 **Passo a Passo para Configurar**

### **1. Acessar o Painel do Supabase**

1. Vá para [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Faça login na sua conta
3. Selecione o projeto **IA-Generativa-360-Staging**

### **2. Navegar para Email Templates**

1. No menu lateral esquerdo, clique em **Authentication**
2. Clique em **Email Templates**
3. Você verá 4 tipos de templates:
   - **Invite** (Convite)
   - **Confirmation** (Confirmação de email)
   - **Recovery** (Recuperação de senha)
   - **Change Email** (Alteração de email)

### **3. Configurar o Template de Convite (Invite)**

1. Clique em **Invite**
2. No campo **Subject**, coloque:
   ```
   Bem-vindo à Calmon Academy - Ative sua Conta
   ```
3. No campo **Content**, cole o conteúdo do arquivo `supabase/templates/invite.html`
4. Clique em **Save**

### **4. Configurar o Template de Confirmação (Confirmation)**

1. Clique em **Confirmation**
2. No campo **Subject**, coloque:
   ```
   Confirme seu Email - Calmon Academy
   ```
3. No campo **Content**, cole o conteúdo do arquivo `supabase/templates/confirm-email.html`
4. Clique em **Save**

### **5. Configurar o Template de Recuperação (Recovery)**

1. Clique em **Recovery**
2. No campo **Subject**, coloque:
   ```
   Recuperação de Senha - Calmon Academy
   ```
3. No campo **Content**, cole o conteúdo do arquivo `supabase/templates/recovery.html`
4. Clique em **Save**

### **6. Configurar o Template de Alteração de Email (Change Email)**

1. Clique em **Change Email**
2. No campo **Subject**, coloque:
   ```
   Senha Alterada - Calmon Academy
   ```
3. No campo **Content**, cole o conteúdo do arquivo `supabase/templates/change-password.html`
4. Clique em **Save**

## 📋 **Conteúdo dos Templates**

### **Template de Convite (Invite)**
```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bem-vindo à Calmon Academy - Ative sua Conta</title>
    <style>
        /* Reset e configurações base */
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #e2e8f0;
            background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%);
            padding: 20px;
            min-height: 100vh;
        }
        
        /* Container principal */
        .email-container {
            max-width: 600px;
            margin: 0 auto;
            background: #0f172a;
            border-radius: 20px;
            overflow: hidden;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
            border: 1px solid rgba(251, 191, 36, 0.1);
        }
        
        /* Header com gradiente dourado */
        .header {
            background: linear-gradient(135deg, #edb247 0%, #d49c3d 50%, #b17d2f 100%);
            padding: 40px 30px;
            text-align: center;
            position: relative;
            overflow: hidden;
        }
        
        .header::before {
            content: '';
            position: absolute;
            top: -50%;
            left: -50%;
            width: 200%;
            height: 200%;
            background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
            animation: float 6s ease-in-out infinite;
        }
        
        @keyframes float {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(-20px) rotate(180deg); }
        }
        
        .logo-container {
            position: relative;
            z-index: 2;
            margin-bottom: 20px;
        }
        
        .logo {
            width: 120px;
            height: 60px;
            margin: 0 auto;
            display: block;
            filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2)) brightness(0) invert(1);
        }
        
        .header-title {
            color: white;
            font-size: 32px;
            font-weight: 700;
            margin: 0;
            position: relative;
            z-index: 2;
            text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
        }
        
        .header-subtitle {
            color: rgba(255, 255, 255, 0.9);
            font-size: 18px;
            margin: 8px 0 0;
            position: relative;
            z-index: 2;
            font-weight: 300;
        }
        
        /* Conteúdo principal */
        .content {
            padding: 40px 30px;
            background: #0f172a;
        }
        
        .greeting {
            font-size: 24px;
            color: #fbbf24;
            margin-bottom: 25px;
            font-weight: 600;
            text-align: center;
        }
        
        .message {
            font-size: 16px;
            color: #cbd5e1;
            margin-bottom: 30px;
            line-height: 1.8;
            text-align: center;
        }
        
        /* Cards de benefícios */
        .benefits-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin: 30px 0;
        }
        
        .benefit-card {
            background: linear-gradient(135deg, rgba(251, 191, 36, 0.1) 0%, rgba(212, 156, 61, 0.05) 100%);
            border: 1px solid rgba(251, 191, 36, 0.2);
            border-radius: 16px;
            padding: 25px;
            text-align: center;
            transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        
        .benefit-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 25px rgba(251, 191, 36, 0.2);
            border-color: rgba(251, 191, 36, 0.4);
        }
        
        .benefit-icon {
            width: 60px;
            height: 60px;
            background: linear-gradient(135deg, #edb247 0%, #d49c3d 100%);
            border-radius: 50%;
            margin: 0 auto 15px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 24px;
            color: white;
        }
        
        .benefit-title {
            color: #fbbf24;
            font-size: 18px;
            font-weight: 600;
            margin-bottom: 10px;
        }
        
        .benefit-description {
            color: #94a3b8;
            font-size: 14px;
            line-height: 1.6;
        }
        
        /* Botão CTA */
        .cta-container {
            text-align: center;
            margin: 40px 0;
        }
        
        .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, #edb247 0%, #d49c3d 100%);
            color: white;
            text-decoration: none;
            padding: 18px 40px;
            border-radius: 50px;
            font-weight: 600;
            font-size: 18px;
            transition: all 0.3s ease;
            box-shadow: 0 8px 25px rgba(237, 178, 71, 0.3);
            position: relative;
            overflow: hidden;
        }
        
        .cta-button::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
            transition: left 0.5s;
        }
        
        .cta-button:hover::before {
            left: 100%;
        }
        
        .cta-button:hover {
            transform: translateY(-3px);
            box-shadow: 0 12px 35px rgba(237, 178, 71, 0.4);
        }
        
        /* Seção de segurança */
        .security-section {
            background: linear-gradient(135deg, rgba(251, 191, 36, 0.1) 0%, rgba(212, 156, 61, 0.05) 100%);
            border: 1px solid rgba(251, 191, 36, 0.3);
            border-radius: 16px;
            padding: 25px;
            margin: 30px 0;
            text-align: center;
        }
        
        .security-icon {
            font-size: 24px;
            margin-bottom: 10px;
        }
        
        .security-title {
            color: #fbbf24;
            font-size: 18px;
            font-weight: 600;
            margin-bottom: 10px;
        }
        
        .security-text {
            color: #94a3b8;
            font-size: 14px;
            line-height: 1.6;
        }
        
        /* Passos */
        .steps-section {
            background: linear-gradient(135deg, rgba(15, 23, 42, 0.8) 0%, rgba(30, 41, 59, 0.6) 100%);
            border: 1px solid rgba(251, 191, 36, 0.1);
            border-radius: 16px;
            padding: 30px;
            margin: 30px 0;
        }
        
        .steps-title {
            color: #fbbf24;
            font-size: 20px;
            font-weight: 600;
            margin-bottom: 20px;
            text-align: center;
        }
        
        .steps-list {
            list-style: none;
            padding: 0;
        }
        
        .step-item {
            display: flex;
            align-items: center;
            margin-bottom: 15px;
            padding: 15px;
            background: rgba(15, 23, 42, 0.5);
            border: 1px solid rgba(251, 191, 36, 0.1);
            border-radius: 12px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
        
        .step-number {
            width: 40px;
            height: 40px;
            background: linear-gradient(135deg, #edb247 0%, #d49c3d 100%);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
            margin-right: 15px;
            flex-shrink: 0;
        }
        
        .step-text {
            color: #cbd5e1;
            font-size: 14px;
            line-height: 1.6;
        }
        
        /* Footer */
        .footer {
            background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
            color: #64748b;
            padding: 30px;
            text-align: center;
            border-top: 1px solid rgba(251, 191, 36, 0.1);
        }
        
        .footer-content {
            max-width: 400px;
            margin: 0 auto;
        }
        
        .footer-title {
            color: #fbbf24;
            font-size: 18px;
            font-weight: 600;
            margin-bottom: 15px;
        }
        
        .footer-text {
            font-size: 14px;
            line-height: 1.6;
            margin-bottom: 20px;
            color: #94a3b8;
        }
        
        .footer-links {
            display: flex;
            justify-content: center;
            gap: 20px;
            margin-top: 20px;
        }
        
        .footer-link {
            color: #fbbf24;
            text-decoration: none;
            font-size: 14px;
            transition: color 0.3s ease;
        }
        
        .footer-link:hover {
            color: #d49c3d;
        }
        
        /* Responsividade */
        @media (max-width: 600px) {
            body {
                padding: 10px;
            }
            
            .email-container {
                border-radius: 15px;
            }
            
            .header {
                padding: 30px 20px;
            }
            
            .header-title {
                font-size: 24px;
            }
            
            .header-subtitle {
                font-size: 16px;
            }
            
            .content {
                padding: 30px 20px;
            }
            
            .greeting {
                font-size: 20px;
            }
            
            .benefits-grid {
                grid-template-columns: 1fr;
            }
            
            .cta-button {
                padding: 16px 30px;
                font-size: 16px;
            }
            
            .footer {
                padding: 25px 20px;
            }
            
            .footer-links {
                flex-direction: column;
                gap: 10px;
            }
        }
    </style>
</head>
<body>
    <div class="email-container">
        <!-- Header -->
        <div class="header">
            <div class="logo-container">
                <img src="https://academy.grupocalmon.com/Logomarca%20Calmon%20Academy.png" alt="Calmon Academy" class="logo">
            </div>
            <h1 class="header-title">Bem-vindo à Calmon Academy!</h1>
            <p class="header-subtitle">Programa IA Generativa 360°</p>
        </div>

        <!-- Conteúdo Principal -->
        <div class="content">
            <div class="greeting">
                Olá! 👋 Você foi convidado!
            </div>

            <div class="message">
                Parabéns! Você foi convidado para se juntar à nossa plataforma exclusiva de <strong>IA Generativa 360°</strong>. 
                Prepare-se para uma jornada incrível de aprendizado e inovação!
            </div>

            <!-- Benefícios -->
            <div class="benefits-grid">
                <div class="benefit-card">
                    <div class="benefit-icon">🎓</div>
                    <div class="benefit-title">Cursos Exclusivos</div>
                    <div class="benefit-description">Conteúdo especializado em IA Generativa com os melhores especialistas da área</div>
                </div>
                
                <div class="benefit-card">
                    <div class="benefit-icon">🤝</div>
                    <div class="benefit-title">Mentorias Personalizadas</div>
                    <div class="benefit-description">Acompanhamento individual com especialistas para maximizar seu aprendizado</div>
                </div>
                
                <div class="benefit-card">
                    <div class="benefit-icon">👥</div>
                    <div class="benefit-title">Comunidade Ativa</div>
                    <div class="benefit-description">Conecte-se com outros profissionais e compartilhe experiências</div>
                </div>
                
                <div class="benefit-card">
                    <div class="benefit-icon">🏆</div>
                    <div class="benefit-title">Certificados</div>
                    <div class="benefit-description">Receba certificados reconhecidos ao completar os cursos</div>
                </div>
            </div>

            <!-- Botão CTA -->
            <div class="cta-container">
                <a href="{{ .ConfirmationURL }}" class="cta-button">
                    🚀 Ativar Minha Conta Agora
                </a>
            </div>

            <!-- Seção de Segurança -->
            <div class="security-section">
                <div class="security-icon">🔒</div>
                <div class="security-title">Link Seguro e Exclusivo</div>
                <div class="security-text">
                    Este link de ativação é válido por 7 dias e só pode ser usado uma vez. 
                    Após clicar no botão, você poderá definir sua senha pessoal para acessar a plataforma.
                </div>
            </div>

            <!-- Passos -->
            <div class="steps-section">
                <div class="steps-title">📋 Próximos Passos</div>
                <ul class="steps-list">
                    <li class="step-item">
                        <div class="step-number">1</div>
                        <div class="step-text">Clique no botão "Ativar Minha Conta Agora" acima</div>
                    </li>
                    <li class="step-item">
                        <div class="step-number">2</div>
                        <div class="step-text">Defina uma senha segura para sua conta</div>
                    </li>
                    <li class="step-item">
                        <div class="step-number">3</div>
                        <div class="step-text">Complete seu perfil na plataforma</div>
                    </li>
                    <li class="step-item">
                        <div class="step-number">4</div>
                        <div class="step-text">Comece a explorar os conteúdos exclusivos</div>
                    </li>
                </ul>
            </div>
        </div>

        <!-- Footer -->
        <div class="footer">
            <div class="footer-content">
                <div class="footer-title">Calmon Academy</div>
                <div class="footer-text">
                    Este convite foi enviado por <strong>{{ .SiteURL }}</strong><br>
                    Se você não esperava receber este email, pode ignorá-lo com segurança.
                </div>
                <div class="footer-links">
                    <a href="mailto:contato@grupocalmon.com" class="footer-link">📧 Precisa de ajuda?</a>
                    <a href="{{ .SiteURL }}" class="footer-link">🌐 Visite nossa plataforma</a>
                </div>
            </div>
        </div>
    </div>
</body>
</html>
```

## ⚠️ **Importante: Variáveis do Supabase**

O Supabase usa variáveis diferentes dos nossos templates. Você precisa substituir:

- `{{ .ConfirmationURL }}` → `{{ .ConfirmationURL }}` (mantém igual)
- `{{ .SiteURL }}` → `{{ .SiteURL }}` (mantém igual)
- `{{ .Timestamp }}` → `{{ .Timestamp }}` (mantém igual)
- `{{ .IPAddress }}` → `{{ .IPAddress }}` (mantém igual)
- `{{ .UserAgent }}` → `{{ .UserAgent }}` (mantém igual)

## 🧪 **Teste Após Configuração**

1. Após configurar todos os templates, faça um teste:
2. Vá para **Authentication > Users**
3. Clique em **Invite User**
4. Digite um email de teste
5. Clique em **Send Invite**
6. Verifique se o email recebido está formatado corretamente

## 🔄 **Atualizações Futuras**

Para atualizar os templates no futuro:
1. Edite os arquivos locais em `supabase/templates/`
2. Copie o conteúdo atualizado
3. Vá para o painel do Supabase
4. Cole o novo conteúdo no template correspondente
5. Clique em **Save**

## 📞 **Suporte**

Se precisar de ajuda:
- Email: contato@grupocalmon.com
- Documentação: [https://supabase.com/docs/guides/auth/auth-email-templates](https://supabase.com/docs/guides/auth/auth-email-templates) 