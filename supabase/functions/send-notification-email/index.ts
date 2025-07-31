import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface NotificationData {
  type: 'collaborator_blocked' | 'subscription_expired' | 'payment_due' | 'subscription_canceled';
  companyId: string;
  companyName: string;
  collaboratorEmail?: string;
  collaboratorName?: string;
  subscriptionStatus: string;
  subscriptionEndsAt?: string;
  daysUntilExpiry?: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const notificationData: NotificationData = await req.json()
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Buscar dados da empresa
    const { data: company, error: companyError } = await supabaseClient
      .from('companies')
      .select(`
        id,
        name,
        contact_email,
        contact_name,
        subscription_status,
        subscription_ends_at
      `)
      .eq('id', notificationData.companyId)
      .single()

    if (companyError || !company) {
      throw new Error('Empresa não encontrada')
    }

    // Buscar colaboradores da empresa
    const { data: collaborators, error: collaboratorsError } = await supabaseClient
      .from('company_users')
      .select(`
        id,
        is_active,
        profile:auth_user_id (
          id,
          name,
          email
        )
      `)
      .eq('company_id', notificationData.companyId)

    if (collaboratorsError) {
      console.error('Erro ao buscar colaboradores:', collaboratorsError)
    }

    const blockedCollaborators = collaborators?.filter(c => !c.is_active) || []
    const activeCollaborators = collaborators?.filter(c => c.is_active) || []

    // Gerar conteúdo do e-mail baseado no tipo de notificação
    const emailContent = generateEmailContent(notificationData, company, blockedCollaborators, activeCollaborators)

    let emailResponses = [];

    // Enviar e-mail para a empresa
    const emailResponse = await sendEmail(emailContent)
    emailResponses.push({
      recipient: company.contact_email,
      response: emailResponse
    });

    // Salvar log da notificação para a empresa
    await supabaseClient
      .from('notification_logs')
      .insert({
        company_id: notificationData.companyId,
        notification_type: notificationData.type,
        recipient_email: company.contact_email,
        content: JSON.stringify(emailContent),
        sent_at: new Date().toISOString(),
        status: emailResponse.success ? 'sent' : 'failed'
      })

    // Se for bloqueio de colaborador, enviar para cada colaborador bloqueado
    if (notificationData.type === 'collaborator_blocked' && blockedCollaborators.length > 0) {
      for (const blocked of blockedCollaborators) {
        if (!blocked.profile?.email) continue;
        const collaboratorEmailContent = {
          to: blocked.profile.email,
          subject: `Seu acesso foi bloqueado - ${company.name}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #dc2626;">Acesso Bloqueado</h2>
              <p>Olá ${blocked.profile.name || 'Colaborador'},</p>
              <p>Seu acesso à plataforma da empresa <strong>${company.name}</strong> foi <strong>bloqueado</strong> devido ao status da assinatura da empresa.</p>
              <div style="background: #fef2f2; border: 1px solid #fecaca; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #dc2626; margin-top: 0;">Motivo do Bloqueio:</h3>
                <ul>
                  <li>Assinatura expirada, cancelada ou com pagamento pendente</li>
                </ul>
              </div>
              <div style="background: #f0f9ff; border: 1px solid #bae6fd; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <h4 style="color: #0369a1; margin-top: 0;">O que fazer?</h4>
                <ol>
                  <li>Entre em contato com o responsável da empresa</li>
                  <li>Assim que a situação for regularizada, seu acesso será restaurado automaticamente</li>
                </ol>
              </div>
              <p style="margin-top: 30px; font-size: 12px; color: #6b7280;">
                Esta é uma notificação automática. Para dúvidas, procure o RH ou responsável da empresa.
              </p>
            </div>
          `
        };
        const collaboratorEmailResponse = await sendEmail(collaboratorEmailContent);
        emailResponses.push({
          recipient: blocked.profile.email,
          response: collaboratorEmailResponse
        });
        // Salvar log do envio para colaborador
        await supabaseClient
          .from('notification_logs')
          .insert({
            company_id: notificationData.companyId,
            notification_type: 'collaborator_blocked',
            recipient_email: blocked.profile.email,
            content: JSON.stringify(collaboratorEmailContent),
            sent_at: new Date().toISOString(),
            status: collaboratorEmailResponse.success ? 'sent' : 'failed'
          })
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Notificação(ões) enviada(s) com sucesso',
        emailResponses
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Erro ao enviar notificação:', error)
    
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})

function generateEmailContent(
  notificationData: NotificationData, 
  company: any, 
  blockedCollaborators: any[], 
  activeCollaborators: any[]
) {
  const baseUrl = Deno.env.get('FRONTEND_URL') || 'https://app.calmonacademy.com'
  
  switch (notificationData.type) {
    case 'collaborator_blocked':
      return {
        to: company.contact_email,
        subject: `🚨 Colaboradores Bloqueados - ${company.name}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #dc2626;">⚠️ Colaboradores Bloqueados</h2>
            <p>Olá ${company.contact_name || 'Administrador'},</p>
            <p>Informamos que <strong>${blockedCollaborators.length} colaborador(es)</strong> da sua empresa foram bloqueados automaticamente devido ao status da assinatura.</p>
            
            <div style="background: #fef2f2; border: 1px solid #fecaca; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #dc2626; margin-top: 0;">Status da Assinatura: ${notificationData.subscriptionStatus}</h3>
              ${notificationData.subscriptionEndsAt ? `<p><strong>Vence em:</strong> ${new Date(notificationData.subscriptionEndsAt).toLocaleDateString('pt-BR')}</p>` : ''}
            </div>

            <h3>Colaboradores Bloqueados:</h3>
            <ul>
              ${blockedCollaborators.map(c => `<li>${c.profile.name} (${c.profile.email})</li>`).join('')}
            </ul>

            <h3>Colaboradores Ativos:</h3>
            <p>${activeCollaborators.length} colaborador(es) ainda ativo(s)</p>

            <div style="background: #f0f9ff; border: 1px solid #bae6fd; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <h4 style="color: #0369a1; margin-top: 0;">Como Resolver:</h4>
              <ol>
                <li>Acesse o painel da empresa</li>
                <li>Verifique o status da assinatura</li>
                <li>Regularize o pagamento se necessário</li>
                <li>Os colaboradores serão desbloqueados automaticamente</li>
              </ol>
            </div>

            <a href="${baseUrl}/company/dashboard" style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Acessar Painel da Empresa
            </a>

            <p style="margin-top: 30px; font-size: 12px; color: #6b7280;">
              Esta é uma notificação automática. Para suporte, entre em contato conosco.
            </p>
          </div>
        `
      }

    case 'subscription_expired':
      return {
        to: company.contact_email,
        subject: `⏰ Assinatura Expirada - ${company.name}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #dc2626;">⏰ Assinatura Expirada</h2>
            <p>Olá ${company.contact_name || 'Administrador'},</p>
            <p>Sua assinatura expirou em <strong>${new Date(notificationData.subscriptionEndsAt!).toLocaleDateString('pt-BR')}</strong>.</p>
            
            <div style="background: #fef2f2; border: 1px solid #fecaca; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #dc2626; margin-top: 0;">Impacto:</h3>
              <ul>
                <li>${blockedCollaborators.length} colaborador(es) bloqueado(s)</li>
                <li>Acesso limitado aos recursos da plataforma</li>
                <li>Dados preservados por 30 dias</li>
              </ul>
            </div>

            <div style="background: #f0f9ff; border: 1px solid #bae6fd; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <h4 style="color: #0369a1; margin-top: 0;">Como Renovar:</h4>
              <ol>
                <li>Acesse o painel da empresa</li>
                <li>Clique em "Renovar Assinatura"</li>
                <li>Escolha seu plano</li>
                <li>Complete o pagamento</li>
              </ol>
            </div>

            <a href="${baseUrl}/planos" style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Renovar Assinatura
            </a>
          </div>
        `
      }

    case 'payment_due':
      return {
        to: company.contact_email,
        subject: `💰 Pagamento Pendente - ${company.name}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #f59e0b;">💰 Pagamento Pendente</h2>
            <p>Olá ${company.contact_name || 'Administrador'},</p>
            <p>Sua assinatura está com <strong>pagamento pendente</strong>.</p>
            
            <div style="background: #fffbeb; border: 1px solid #fde68a; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #d97706; margin-top: 0;">Detalhes:</h3>
              <p><strong>Status:</strong> Pagamento Pendente</p>
              ${notificationData.daysUntilExpiry ? `<p><strong>Dias até bloqueio:</strong> ${notificationData.daysUntilExpiry}</p>` : ''}
            </div>

            <div style="background: #f0f9ff; border: 1px solid #bae6fd; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <h4 style="color: #0369a1; margin-top: 0;">Como Regularizar:</h4>
              <ol>
                <li>Verifique seu método de pagamento</li>
                <li>Atualize as informações se necessário</li>
                <li>O pagamento será processado automaticamente</li>
              </ol>
            </div>

            <a href="${baseUrl}/company/dashboard" style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Verificar Pagamento
            </a>
          </div>
        `
      }

    case 'subscription_canceled':
      return {
        to: company.contact_email,
        subject: `❌ Assinatura Cancelada - ${company.name}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #dc2626;">❌ Assinatura Cancelada</h2>
            <p>Olá ${company.contact_name || 'Administrador'},</p>
            <p>Sua assinatura foi <strong>cancelada</strong> conforme solicitado.</p>
            
            <div style="background: #fef2f2; border: 1px solid #fecaca; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #dc2626; margin-top: 0;">Status Atual:</h3>
              <ul>
                <li>${blockedCollaborators.length} colaborador(es) bloqueado(s)</li>
                <li>Acesso suspenso à plataforma</li>
                <li>Dados preservados por 30 dias</li>
              </ul>
            </div>

            <div style="background: #f0f9ff; border: 1px solid #bae6fd; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <h4 style="color: #0369a1; margin-top: 0;">Para Reativar:</h4>
              <p>Se desejar reativar sua assinatura, acesse nossa plataforma e escolha um novo plano.</p>
            </div>

            <a href="${baseUrl}/planos" style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Escolher Novo Plano
            </a>
          </div>
        `
      }

    default:
      throw new Error('Tipo de notificação não suportado')
  }
}

async function sendEmail(emailContent: any) {
  // Simular envio de e-mail (versão temporária)
  // TODO: Implementar envio real via Resend ou outro serviço
  console.log('Simulando envio de e-mail:', {
    to: emailContent.to,
    subject: emailContent.subject,
    content: emailContent.html.substring(0, 100) + '...'
  });
  
  return {
    success: true,
    message: 'E-mail simulado com sucesso (implementação pendente)',
    timestamp: new Date().toISOString()
  };
} 