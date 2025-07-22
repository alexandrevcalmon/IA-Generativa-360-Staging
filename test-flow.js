#!/usr/bin/env node

/**
 * Teste do Fluxo Completo - Executável
 * 
 * Para executar: node test-flow.js
 * 
 * Este script testa todo o fluxo desde a criação da empresa
 * até o acesso aos dados no painel.
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Carregar variáveis de ambiente
dotenv.config()

// Configurações
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://ldlxebhnkayiwksipvyc.supabase.co'
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_SERVICE_KEY) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY não encontrada no .env')
  process.exit(1)
}

// Cliente Supabase
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

// Dados de teste únicos
const TEST_EMAIL = `teste-fluxo-${Date.now()}@exemplo.com`
const TEST_COMPANY = {
  name: 'Empresa Teste Fluxo Completo',
  contact_name: 'João Teste Fluxo',
  contact_email: TEST_EMAIL,
  contact_phone: '(11) 99999-9999',
  cnpj: '12.345.678/0001-90',
  address_street: 'Rua do Teste, 123',
  address_city: 'São Paulo',
  address_state: 'SP',
  address_zip_code: '01234-567',
  stripe_customer_id: `cus_test_${Date.now()}`,
  stripe_subscription_id: `sub_test_${Date.now()}`,
  subscription_status: 'active',
  max_collaborators: 5,
  current_students: 0,
  is_active: true
}

class FlowTest {
  constructor() {
    this.testResults = []
    this.company = null
    this.authUser = null
    this.profile = null
    this.companyUser = null
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString()
    const prefix = type === 'error' ? '❌' : type === 'success' ? '✅' : 'ℹ️'
    console.log(`${prefix} [${timestamp}] ${message}`)
    this.testResults.push({ timestamp, type, message })
  }

  async runTest() {
    console.log('🧪 TESTE DO FLUXO COMPLETO')
    console.log('==========================')
    console.log(`📧 Email de teste: ${TEST_EMAIL}`)
    console.log('')

    this.log('🚀 Iniciando teste do fluxo completo...')
    
    try {
      // 1. Criar empresa
      await this.createCompany()
      
      // 2. Criar usuário de autenticação
      await this.createAuthUser()
      
      // 3. Vincular empresa ao usuário
      await this.linkCompanyToUser()
      
      // 4. Criar perfil
      await this.createProfile()
      
      // 5. Criar company_user
      await this.createCompanyUser()
      
      // 6. Testar acesso aos dados
      await this.testDataAccess()
      
      // 7. Testar funções de validação
      await this.testValidationFunctions()
      
      // 8. Testar webhook functions
      await this.testWebhookFunctions()
      
      // 9. Limpeza
      await this.cleanup()
      
      this.log('🎉 Teste finalizado com sucesso!', 'success')
      this.printSummary()
      
    } catch (error) {
      this.log(`❌ Erro no teste: ${error.message}`, 'error')
      console.error(error)
      await this.cleanup()
      process.exit(1)
    }
  }

  async createCompany() {
    this.log('🏢 Criando empresa...')
    
    try {
      const { data: company, error } = await supabase
        .from('companies')
        .insert(TEST_COMPANY)
        .select()
        .single()

      if (error) throw error

      this.company = company
      this.log(`✅ Empresa criada: ${company.name}`, 'success')
      this.log(`   ID: ${company.id}`, 'info')
      this.log(`   Email: ${company.contact_email}`, 'info')
      
    } catch (error) {
      this.log(`❌ Erro ao criar empresa: ${error.message}`, 'error')
      throw error
    }
  }

  async createAuthUser() {
    this.log('👤 Criando usuário de autenticação...')
    
    try {
      const { data: user, error } = await supabase.auth.admin.createUser({
        email: TEST_EMAIL,
        password: 'Teste123!',
        email_confirm: true,
        user_metadata: {
          role: 'company',
          company_id: this.company.id,
          company_name: this.company.name
        }
      })

      if (error) throw error

      this.authUser = user
      this.log(`✅ Usuário criado: ${user.email}`, 'success')
      this.log(`   ID: ${user.id}`, 'info')
      
    } catch (error) {
      this.log(`❌ Erro ao criar usuário: ${error.message}`, 'error')
      throw error
    }
  }

  async linkCompanyToUser() {
    this.log('🔗 Vinculando empresa ao usuário...')
    
    try {
      const { error } = await supabase
        .from('companies')
        .update({ auth_user_id: this.authUser.id })
        .eq('id', this.company.id)

      if (error) throw error

      this.log('✅ Empresa vinculada ao usuário', 'success')
      
    } catch (error) {
      this.log(`❌ Erro ao vincular empresa: ${error.message}`, 'error')
      throw error
    }
  }

  async createProfile() {
    this.log('📋 Criando perfil...')
    
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .insert({
          id: this.authUser.id,
          role: 'company',
          email: TEST_EMAIL,
          name: TEST_COMPANY.contact_name,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single()

      if (error) throw error

      this.profile = profile
      this.log(`✅ Perfil criado com role: ${profile.role}`, 'success')
      
    } catch (error) {
      this.log(`❌ Erro ao criar perfil: ${error.message}`, 'error')
      throw error
    }
  }

  async createCompanyUser() {
    this.log('👥 Criando company_user...')
    
    try {
      const { data: companyUser, error } = await supabase
        .from('company_users')
        .insert({
          email: TEST_EMAIL,
          company_id: this.company.id,
          auth_user_id: this.authUser.id,
          name: TEST_COMPANY.contact_name,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single()

      if (error) throw error

      this.companyUser = companyUser
      this.log(`✅ Company user criado: ${companyUser.name}`, 'success')
      
    } catch (error) {
      this.log(`❌ Erro ao criar company user: ${error.message}`, 'error')
      throw error
    }
  }

  async testDataAccess() {
    this.log('📊 Testando acesso aos dados...')
    
    try {
      // Testar busca de empresa por auth_user_id
      const { data: companyData, error: companyError } = await supabase
        .from('companies')
        .select('*')
        .eq('auth_user_id', this.authUser.id)
        .single()

      if (companyError) throw companyError

      if (companyData.id !== this.company.id) {
        throw new Error('Dados da empresa não correspondem')
      }

      this.log('✅ Acesso aos dados da empresa confirmado', 'success')

      // Testar busca de company_user
      const { data: companyUserData, error: companyUserError } = await supabase
        .from('company_users')
        .select('*')
        .eq('auth_user_id', this.authUser.id)
        .single()

      if (companyUserError) throw companyUserError

      this.log('✅ Acesso aos dados de company_user confirmado', 'success')
      
    } catch (error) {
      this.log(`❌ Erro ao testar acesso: ${error.message}`, 'error')
      throw error
    }
  }

  async testValidationFunctions() {
    this.log('🔍 Testando funções de validação...')
    
    try {
      // Testar ensure_user_company_linkage
      const { data: linkageResult, error: linkageError } = await supabase.rpc(
        'ensure_user_company_linkage',
        {
          user_id: this.authUser.id,
          company_id: this.company.id,
          user_role: 'company'
        }
      )

      if (linkageError) throw linkageError

      this.log(`✅ ensure_user_company_linkage: ${linkageResult.action}`, 'success')

      // Testar validate_user_access
      const { data: validationResult, error: validationError } = await supabase.rpc(
        'validate_user_access',
        {
          required_role: 'company',
          company_id: this.company.id
        }
      )

      if (validationError) throw validationError

      this.log(`✅ validate_user_access: ${validationResult.access_type}`, 'success')
      
    } catch (error) {
      this.log(`❌ Erro ao testar funções: ${error.message}`, 'error')
      throw error
    }
  }

  async testWebhookFunctions() {
    this.log('🔗 Testando funções de webhook...')
    
    try {
      // Testar create_or_update_company_from_webhook
      const webhookData = {
        name: TEST_COMPANY.name,
        contact_name: TEST_COMPANY.contact_name,
        contact_email: TEST_COMPANY.contact_email,
        contact_phone: TEST_COMPANY.contact_phone,
        cnpj: TEST_COMPANY.cnpj,
        address: TEST_COMPANY.address_street,
        city: TEST_COMPANY.address_city,
        state: TEST_COMPANY.address_state,
        zip_code: TEST_COMPANY.address_zip_code,
        plan_id: null,
        stripe_customer_id: TEST_COMPANY.stripe_customer_id,
        stripe_subscription_id: TEST_COMPANY.stripe_subscription_id,
        subscription_ends_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        max_collaborators: '5'
      }

      const { data: webhookResult, error: webhookError } = await supabase.rpc(
        'create_or_update_company_from_webhook',
        { company_data: webhookData }
      )

      if (webhookError) throw webhookError

      this.log(`✅ create_or_update_company_from_webhook: ${webhookResult.action}`, 'success')

      // Testar sync_company_with_stripe_webhook
      const { data: syncResult, error: syncError } = await supabase.rpc(
        'sync_company_with_stripe_webhook',
        {
          subscription_id: this.company.stripe_subscription_id,
          customer_id: this.company.stripe_customer_id,
          status: 'active'
        }
      )

      if (syncError) throw syncError

      this.log(`✅ sync_company_with_stripe_webhook: ${syncResult.action}`, 'success')
      
    } catch (error) {
      this.log(`❌ Erro ao testar webhook functions: ${error.message}`, 'error')
      throw error
    }
  }

  async cleanup() {
    this.log('🧹 Fazendo limpeza...')
    
    try {
      // Deletar company_user
      if (this.companyUser) {
        await supabase
          .from('company_users')
          .delete()
          .eq('id', this.companyUser.id)
      }

      // Deletar perfil
      if (this.profile) {
        await supabase
          .from('profiles')
          .delete()
          .eq('id', this.profile.id)
      }

      // Deletar empresa
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

      this.log('✅ Limpeza concluída', 'success')
      
    } catch (error) {
      this.log(`⚠️ Erro na limpeza: ${error.message}`, 'error')
    }
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
    
    console.log('\n📊 Dados Testados:')
    console.log(`🏢 Empresa: ${this.company?.name || 'N/A'}`)
    console.log(`👤 Usuário: ${this.authUser?.email || 'N/A'}`)
    console.log(`📋 Perfil: ${this.profile?.role || 'N/A'}`)
    console.log(`👥 Company User: ${this.companyUser?.name || 'N/A'}`)
    
    if (errorCount === 0) {
      console.log('\n🎉 TODOS OS TESTES PASSARAM!')
      console.log('✅ Criação de empresa funcionando')
      console.log('✅ Criação de usuário funcionando')
      console.log('✅ Vinculação empresa-usuário funcionando')
      console.log('✅ Criação de perfil funcionando')
      console.log('✅ Criação de company_user funcionando')
      console.log('✅ Acesso aos dados funcionando')
      console.log('✅ Funções de validação funcionando')
      console.log('✅ Funções de webhook funcionando')
      console.log('\n🚀 Sistema pronto para produção!')
    } else {
      console.log('\n⚠️ ALGUNS TESTES FALHARAM!')
      console.log('Verifique os logs acima para detalhes.')
    }
  }
}

// Executar teste
async function main() {
  const test = new FlowTest()
  await test.runTest()
}

// Executar
main().catch(console.error) 