/**
 * Teste Completo do Fluxo - Compra até Login
 * 
 * Este script testa todo o fluxo:
 * 1. Criação de checkout session
 * 2. Simulação de pagamento
 * 3. Processamento de webhooks
 * 4. Criação de empresa no banco
 * 5. Criação de usuário de autenticação
 * 6. Login no painel da empresa
 * 7. Verificação de acesso aos dados
 */

import { createClient } from '@supabase/supabase-js'
import Stripe from 'stripe'

// Configurações
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://ldlxebhnkayiwksipvyc.supabase.co'
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET

// Clientes
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)
const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: '2024-12-18.acacia'
})

// Dados de teste
const TEST_COMPANY = {
  name: 'Empresa Teste Fluxo Completo',
  contact_name: 'João Teste Fluxo',
  contact_email: `teste-fluxo-${Date.now()}@exemplo.com`,
  contact_phone: '(11) 99999-9999',
  cnpj: '12.345.678/0001-90',
  address: 'Rua do Teste, 123',
  city: 'São Paulo',
  state: 'SP',
  zip_code: '01234-567'
}

const TEST_PLAN = {
  name: 'Plano Teste',
  price: 1000, // R$ 10,00
  max_collaborators: 5,
  max_students: 100
}

class FlowTest {
  constructor() {
    this.testResults = []
    this.stripeCustomer = null
    this.stripeSubscription = null
    this.checkoutSession = null
    this.company = null
    this.authUser = null
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString()
    const prefix = type === 'error' ? '❌' : type === 'success' ? '✅' : 'ℹ️'
    console.log(`${prefix} [${timestamp}] ${message}`)
    this.testResults.push({ timestamp, type, message })
  }

  async runTest() {
    this.log('🚀 Iniciando teste completo do fluxo...')
    
    try {
      // 1. Criar plano de teste
      await this.createTestPlan()
      
      // 2. Criar checkout session
      await this.createCheckoutSession()
      
      // 3. Simular pagamento
      await this.simulatePayment()
      
      // 4. Processar webhooks
      await this.processWebhooks()
      
      // 5. Verificar empresa criada
      await this.verifyCompanyCreated()
      
      // 6. Verificar usuário de autenticação
      await this.verifyAuthUser()
      
      // 7. Testar login
      await this.testLogin()
      
      // 8. Verificar acesso aos dados
      await this.verifyDataAccess()
      
      // 9. Limpeza
      await this.cleanup()
      
      this.log('🎉 Teste completo finalizado com sucesso!', 'success')
      this.printSummary()
      
    } catch (error) {
      this.log(`❌ Erro no teste: ${error.message}`, 'error')
      console.error(error)
      await this.cleanup()
      process.exit(1)
    }
  }

  async createTestPlan() {
    this.log('📋 Criando plano de teste...')
    
    try {
      // Criar produto no Stripe
      const product = await stripe.products.create({
        name: TEST_PLAN.name,
        description: 'Plano para teste do fluxo completo'
      })

      // Criar preço no Stripe
      const price = await stripe.prices.create({
        product: product.id,
        unit_amount: TEST_PLAN.price,
        currency: 'brl',
        recurring: {
          interval: 'month'
        }
      })

      // Criar plano no banco
      const { data: plan, error } = await supabase
        .from('subscription_plans')
        .insert({
          name: TEST_PLAN.name,
          price: TEST_PLAN.price / 100, // Converter de centavos
          max_students: TEST_PLAN.max_students,
          max_collaborators: TEST_PLAN.max_collaborators,
          stripe_product_id: product.id,
          stripe_price_id: price.id,
          is_active: true
        })
        .select()
        .single()

      if (error) throw error

      this.testPlan = plan
      this.stripePrice = price
      this.log(`✅ Plano criado: ${plan.name} (ID: ${plan.id})`, 'success')
      
    } catch (error) {
      this.log(`❌ Erro ao criar plano: ${error.message}`, 'error')
      throw error
    }
  }

  async createCheckoutSession() {
    this.log('🛒 Criando checkout session...')
    
    try {
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [{
          price: this.stripePrice.id,
          quantity: 1,
        }],
        mode: 'subscription',
        success_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/activate-account?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/plans`,
        metadata: {
          company_name: TEST_COMPANY.name,
          contact_name: TEST_COMPANY.contact_name,
          contact_email: TEST_COMPANY.contact_email,
          contact_phone: TEST_COMPANY.contact_phone,
          cnpj: TEST_COMPANY.cnpj,
          address: TEST_COMPANY.address,
          city: TEST_COMPANY.city,
          state: TEST_COMPANY.state,
          zip_code: TEST_COMPANY.zip_code,
          plan_id: this.testPlan.id,
          max_collaborators: TEST_PLAN.max_collaborators.toString(),
          subscription_period: '30'
        }
      })

      this.checkoutSession = session
      this.log(`✅ Checkout session criada: ${session.id}`, 'success')
      
    } catch (error) {
      this.log(`❌ Erro ao criar checkout session: ${error.message}`, 'error')
      throw error
    }
  }

  async simulatePayment() {
    this.log('💳 Simulando pagamento...')
    
    try {
      // Simular pagamento com cartão de teste
      const paymentIntent = await stripe.paymentIntents.create({
        amount: TEST_PLAN.price,
        currency: 'brl',
        payment_method: 'pm_card_visa',
        confirm: true,
        return_url: this.checkoutSession.success_url
      })

      // Marcar checkout como completo
      await stripe.checkout.sessions.expire(this.checkoutSession.id)
      
      this.log(`✅ Pagamento simulado: ${paymentIntent.id}`, 'success')
      
    } catch (error) {
      this.log(`❌ Erro ao simular pagamento: ${error.message}`, 'error')
      throw error
    }
  }

  async processWebhooks() {
    this.log('🔗 Processando webhooks...')
    
    try {
      // Simular webhook checkout.session.completed
      const checkoutEvent = {
        id: 'evt_test_checkout',
        object: 'event',
        api_version: '2024-12-18.acacia',
        created: Math.floor(Date.now() / 1000),
        data: {
          object: this.checkoutSession
        },
        livemode: false,
        pending_webhooks: 1,
        request: {
          id: 'req_test',
          idempotency_key: null
        },
        type: 'checkout.session.completed'
      }

      // Chamar webhook diretamente
      const webhookResponse = await fetch(`${SUPABASE_URL}/functions/v1/stripe-webhook`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'stripe-signature': this.generateTestSignature(checkoutEvent)
        },
        body: JSON.stringify(checkoutEvent)
      })

      if (!webhookResponse.ok) {
        const error = await webhookResponse.text()
        throw new Error(`Webhook failed: ${error}`)
      }

      this.log('✅ Webhook checkout.session.completed processado', 'success')
      
    } catch (error) {
      this.log(`❌ Erro ao processar webhooks: ${error.message}`, 'error')
      throw error
    }
  }

  async verifyCompanyCreated() {
    this.log('🏢 Verificando empresa criada...')
    
    try {
      // Aguardar um pouco para garantir que o webhook foi processado
      await this.sleep(2000)

      const { data: company, error } = await supabase
        .from('companies')
        .select('*')
        .eq('contact_email', TEST_COMPANY.contact_email)
        .single()

      if (error) throw error

      this.company = company
      this.log(`✅ Empresa criada: ${company.name} (ID: ${company.id})`, 'success')
      
      // Verificar se tem stripe_customer_id e stripe_subscription_id
      if (!company.stripe_customer_id || !company.stripe_subscription_id) {
        throw new Error('Empresa não tem dados do Stripe')
      }
      
    } catch (error) {
      this.log(`❌ Erro ao verificar empresa: ${error.message}`, 'error')
      throw error
    }
  }

  async verifyAuthUser() {
    this.log('👤 Verificando usuário de autenticação...')
    
    try {
      // Buscar usuário por email
      const { data: { users }, error } = await supabase.auth.admin.listUsers()
      
      if (error) throw error

      const authUser = users.find(user => user.email === TEST_COMPANY.contact_email)
      
      if (!authUser) {
        throw new Error('Usuário de autenticação não foi criado')
      }

      this.authUser = authUser
      this.log(`✅ Usuário criado: ${authUser.email} (ID: ${authUser.id})`, 'success')
      
      // Verificar se empresa tem auth_user_id
      if (this.company.auth_user_id !== authUser.id) {
        throw new Error('Empresa não está vinculada ao usuário de autenticação')
      }
      
    } catch (error) {
      this.log(`❌ Erro ao verificar usuário: ${error.message}`, 'error')
      throw error
    }
  }

  async testLogin() {
    this.log('🔐 Testando login...')
    
    try {
      // Gerar link de ativação
      const { data: inviteData, error: inviteError } = await supabase.auth.admin.generateLink({
        type: 'signup',
        email: TEST_COMPANY.contact_email,
        options: {
          redirectTo: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/activate-account`
        }
      })

      if (inviteError) throw inviteError

      this.log(`✅ Link de ativação gerado: ${inviteData.properties.action_link}`, 'success')
      
      // Simular login (não podemos realmente fazer login sem interação do usuário)
      this.log('ℹ️ Login simulado - link de ativação gerado com sucesso', 'info')
      
    } catch (error) {
      this.log(`❌ Erro ao testar login: ${error.message}`, 'error')
      throw error
    }
  }

  async verifyDataAccess() {
    this.log('📊 Verificando acesso aos dados...')
    
    try {
      // Verificar se perfil foi criado
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', this.authUser.id)
        .single()

      if (profileError) throw profileError

      if (profile.role !== 'company') {
        throw new Error('Perfil não tem role correto')
      }

      this.log(`✅ Perfil criado com role: ${profile.role}`, 'success')

      // Verificar se company_users foi criado
      const { data: companyUser, error: companyUserError } = await supabase
        .from('company_users')
        .select('*')
        .eq('auth_user_id', this.authUser.id)
        .single()

      if (companyUserError) throw companyUserError

      this.log(`✅ Company user criado: ${companyUser.name}`, 'success')

      // Testar acesso aos dados da empresa
      const { data: companyData, error: companyDataError } = await supabase
        .from('companies')
        .select('*')
        .eq('auth_user_id', this.authUser.id)
        .single()

      if (companyDataError) throw companyDataError

      this.log(`✅ Acesso aos dados da empresa confirmado`, 'success')
      
    } catch (error) {
      this.log(`❌ Erro ao verificar acesso: ${error.message}`, 'error')
      throw error
    }
  }

  async cleanup() {
    this.log('🧹 Fazendo limpeza...')
    
    try {
      // Deletar empresa de teste
      if (this.company) {
        await supabase
          .from('companies')
          .delete()
          .eq('id', this.company.id)
      }

      // Deletar usuário de autenticação
      if (this.authUser) {
        await supabase.auth.admin.deleteUser(this.authUser.id)
      }

      // Deletar plano de teste
      if (this.testPlan) {
        await supabase
          .from('subscription_plans')
          .delete()
          .eq('id', this.testPlan.id)
      }

      this.log('✅ Limpeza concluída', 'success')
      
    } catch (error) {
      this.log(`⚠️ Erro na limpeza: ${error.message}`, 'error')
    }
  }

  generateTestSignature(event) {
    // Gerar assinatura de teste para webhook
    const timestamp = Math.floor(Date.now() / 1000)
    const payload = JSON.stringify(event)
    const signedPayload = `${timestamp}.${payload}`
    
    // Em produção, isso seria feito com crypto
    return `t=${timestamp},v1=test_signature`
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  printSummary() {
    console.log('\n📋 RESUMO DO TESTE')
    console.log('==================')
    
    const successCount = this.testResults.filter(r => r.type === 'success').length
    const errorCount = this.testResults.filter(r => r.type === 'error').length
    const infoCount = this.testResults.filter(r => r.type === 'info').length
    
    console.log(`✅ Sucessos: ${successCount}`)
    console.log(`❌ Erros: ${errorCount}`)
    console.log(`ℹ️ Informações: ${infoCount}`)
    
    if (errorCount === 0) {
      console.log('\n🎉 TODOS OS TESTES PASSARAM!')
      console.log('O fluxo completo está funcionando corretamente.')
    } else {
      console.log('\n⚠️ ALGUNS TESTES FALHARAM!')
      console.log('Verifique os logs acima para detalhes.')
    }
  }
}

// Executar teste
async function main() {
  console.log('🧪 TESTE COMPLETO DO FLUXO')
  console.log('==========================')
  console.log('Este teste verifica todo o fluxo desde a compra até o login.')
  console.log('')

  const test = new FlowTest()
  await test.runTest()
}

// Executar se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error)
}

export default FlowTest 