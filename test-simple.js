#!/usr/bin/env node

/**
 * Teste Simples do Fluxo - Sem Dependências Externas
 * 
 * Para executar: node test-simple.js
 */

// Configurações (ajuste conforme necessário)
const SUPABASE_URL = 'https://ldlxebhnkayiwksipvyc.supabase.co'
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'sua_service_role_key_aqui'

// Dados de teste únicos
const TEST_EMAIL = `teste-simple-${Date.now()}@exemplo.com`
const TEST_COMPANY = {
  name: 'Empresa Teste Simples',
  contact_name: 'João Teste Simples',
  contact_email: TEST_EMAIL,
  contact_phone: '(11) 77777-7777',
  cnpj: '11.222.333/0001-44',
  address_street: 'Rua Simples, 123',
  address_city: 'São Paulo',
  address_state: 'SP',
  address_zip_code: '01234-567',
  stripe_customer_id: `cus_simple_${Date.now()}`,
  stripe_subscription_id: `sub_simple_${Date.now()}`,
  subscription_status: 'active',
  max_collaborators: 3,
  current_students: 0,
  is_active: true
}

class SimpleTest {
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
    console.log('🧪 TESTE SIMPLES DO FLUXO')
    console.log('=========================')
    console.log(`📧 Email de teste: ${TEST_EMAIL}`)
    console.log('')

    this.log('🚀 Iniciando teste simples...')
    
    try {
      // Verificar se temos a service role key
      if (!SUPABASE_SERVICE_KEY || SUPABASE_SERVICE_KEY === 'sua_service_role_key_aqui') {
        throw new Error('SUPABASE_SERVICE_ROLE_KEY não configurada. Configure no arquivo .env')
      }

      // 1. Testar conexão com Supabase
      await this.testConnection()
      
      // 2. Testar criação de empresa
      await this.testCompanyCreation()
      
      // 3. Testar criação de usuário
      await this.testUserCreation()
      
      // 4. Testar vinculação
      await this.testLinking()
      
      // 5. Testar criação de perfil
      await this.testProfileCreation()
      
      // 6. Testar criação de company_user
      await this.testCompanyUserCreation()
      
      // 7. Testar acesso aos dados
      await this.testDataAccess()
      
      // 8. Limpeza
      await this.cleanup()
      
      this.log('🎉 Teste simples finalizado com sucesso!', 'success')
      this.printSummary()
      
    } catch (error) {
      this.log(`❌ Erro no teste: ${error.message}`, 'error')
      console.error(error)
      await this.cleanup()
      process.exit(1)
    }
  }

  async testConnection() {
    this.log('🔌 Testando conexão com Supabase...')
    
    try {
      // Teste simples de conexão
      const response = await fetch(`${SUPABASE_URL}/rest/v1/companies?select=count`, {
        headers: {
          'apikey': SUPABASE_SERVICE_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`
        }
      })

      if (!response.ok) {
        throw new Error(`Erro de conexão: ${response.status} ${response.statusText}`)
      }

      this.log('✅ Conexão com Supabase estabelecida', 'success')
      
    } catch (error) {
      this.log(`❌ Erro de conexão: ${error.message}`, 'error')
      throw error
    }
  }

  async testCompanyCreation() {
    this.log('🏢 Testando criação de empresa...')
    
    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/companies`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_SERVICE_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify(TEST_COMPANY)
      })

      if (!response.ok) {
        const error = await response.text()
        throw new Error(`Erro ao criar empresa: ${error}`)
      }

      const company = await response.json()
      this.company = company[0]
      this.log(`✅ Empresa criada: ${company[0].name}`, 'success')
      this.log(`   ID: ${company[0].id}`, 'info')
      
    } catch (error) {
      this.log(`❌ Erro ao criar empresa: ${error.message}`, 'error')
      throw error
    }
  }

  async testUserCreation() {
    this.log('👤 Testando criação de usuário...')
    
    try {
      const response = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_SERVICE_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: TEST_EMAIL,
          password: 'Teste123!',
          email_confirm: true,
          user_metadata: {
            role: 'company',
            company_id: this.company.id,
            company_name: this.company.name
          }
        })
      })

      if (!response.ok) {
        const error = await response.text()
        throw new Error(`Erro ao criar usuário: ${error}`)
      }

      const user = await response.json()
      this.authUser = user
      this.log(`✅ Usuário criado: ${user.email}`, 'success')
      this.log(`   ID: ${user.id}`, 'info')
      
    } catch (error) {
      this.log(`❌ Erro ao criar usuário: ${error.message}`, 'error')
      throw error
    }
  }

  async testLinking() {
    this.log('🔗 Testando vinculação empresa-usuário...')
    
    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/companies?id=eq.${this.company.id}`, {
        method: 'PATCH',
        headers: {
          'apikey': SUPABASE_SERVICE_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify({ auth_user_id: this.authUser.id })
      })

      if (!response.ok) {
        const error = await response.text()
        throw new Error(`Erro ao vincular empresa: ${error}`)
      }

      this.log('✅ Empresa vinculada ao usuário', 'success')
      
    } catch (error) {
      this.log(`❌ Erro ao vincular empresa: ${error.message}`, 'error')
      throw error
    }
  }

  async testProfileCreation() {
    this.log('📋 Testando criação de perfil...')
    
    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/profiles`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_SERVICE_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify({
          id: this.authUser.id,
          role: 'company',
          email: TEST_EMAIL,
          name: TEST_COMPANY.contact_name,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
      })

      if (!response.ok) {
        const error = await response.text()
        throw new Error(`Erro ao criar perfil: ${error}`)
      }

      const profile = await response.json()
      this.profile = profile[0]
      this.log(`✅ Perfil criado com role: ${profile[0].role}`, 'success')
      
    } catch (error) {
      this.log(`❌ Erro ao criar perfil: ${error.message}`, 'error')
      throw error
    }
  }

  async testCompanyUserCreation() {
    this.log('👥 Testando criação de company_user...')
    
    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/company_users`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_SERVICE_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify({
          email: TEST_EMAIL,
          company_id: this.company.id,
          auth_user_id: this.authUser.id,
          name: TEST_COMPANY.contact_name,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
      })

      if (!response.ok) {
        const error = await response.text()
        throw new Error(`Erro ao criar company user: ${error}`)
      }

      const companyUser = await response.json()
      this.companyUser = companyUser[0]
      this.log(`✅ Company user criado: ${companyUser[0].name}`, 'success')
      
    } catch (error) {
      this.log(`❌ Erro ao criar company user: ${error.message}`, 'error')
      throw error
    }
  }

  async testDataAccess() {
    this.log('📊 Testando acesso aos dados...')
    
    try {
      // Testar busca de empresa por auth_user_id
      const companyResponse = await fetch(`${SUPABASE_URL}/rest/v1/companies?auth_user_id=eq.${this.authUser.id}`, {
        headers: {
          'apikey': SUPABASE_SERVICE_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`
        }
      })

      if (!companyResponse.ok) {
        throw new Error('Erro ao buscar empresa')
      }

      const companyData = await companyResponse.json()
      
      if (companyData.length === 0 || companyData[0].id !== this.company.id) {
        throw new Error('Dados da empresa não correspondem')
      }

      this.log('✅ Acesso aos dados da empresa confirmado', 'success')

      // Testar busca de company_user
      const companyUserResponse = await fetch(`${SUPABASE_URL}/rest/v1/company_users?auth_user_id=eq.${this.authUser.id}`, {
        headers: {
          'apikey': SUPABASE_SERVICE_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`
        }
      })

      if (!companyUserResponse.ok) {
        throw new Error('Erro ao buscar company user')
      }

      const companyUserData = await companyUserResponse.json()
      
      if (companyUserData.length === 0) {
        throw new Error('Company user não encontrado')
      }

      this.log('✅ Acesso aos dados de company_user confirmado', 'success')
      
    } catch (error) {
      this.log(`❌ Erro ao testar acesso: ${error.message}`, 'error')
      throw error
    }
  }

  async cleanup() {
    this.log('🧹 Fazendo limpeza...')
    
    try {
      // Deletar company_user
      if (this.companyUser) {
        await fetch(`${SUPABASE_URL}/rest/v1/company_users?id=eq.${this.companyUser.id}`, {
          method: 'DELETE',
          headers: {
            'apikey': SUPABASE_SERVICE_KEY,
            'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`
          }
        })
      }

      // Deletar perfil
      if (this.profile) {
        await fetch(`${SUPABASE_URL}/rest/v1/profiles?id=eq.${this.profile.id}`, {
          method: 'DELETE',
          headers: {
            'apikey': SUPABASE_SERVICE_KEY,
            'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`
          }
        })
      }

      // Deletar empresa
      if (this.company) {
        await fetch(`${SUPABASE_URL}/rest/v1/companies?id=eq.${this.company.id}`, {
          method: 'DELETE',
          headers: {
            'apikey': SUPABASE_SERVICE_KEY,
            'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`
          }
        })
      }

      // Deletar usuário de autenticação
      if (this.authUser) {
        await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${this.authUser.id}`, {
          method: 'DELETE',
          headers: {
            'apikey': SUPABASE_SERVICE_KEY,
            'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`
          }
        })
      }

      this.log('✅ Limpeza concluída', 'success')
      
    } catch (error) {
      this.log(`⚠️ Erro na limpeza: ${error.message}`, 'error')
    }
  }

  printSummary() {
    console.log('\n📋 RESUMO DO TESTE SIMPLES')
    console.log('==========================')
    
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
      console.log('✅ Conexão com Supabase funcionando')
      console.log('✅ Criação de empresa funcionando')
      console.log('✅ Criação de usuário funcionando')
      console.log('✅ Vinculação empresa-usuário funcionando')
      console.log('✅ Criação de perfil funcionando')
      console.log('✅ Criação de company_user funcionando')
      console.log('✅ Acesso aos dados funcionando')
      console.log('\n🚀 Sistema pronto para produção!')
    } else {
      console.log('\n⚠️ ALGUNS TESTES FALHARAM!')
      console.log('Verifique os logs acima para detalhes.')
    }
  }
}

// Executar teste
async function main() {
  const test = new SimpleTest()
  await test.runTest()
}

// Executar
main().catch(console.error) 