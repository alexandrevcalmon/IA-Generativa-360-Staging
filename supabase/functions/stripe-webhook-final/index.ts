// Edge Function para processar webhooks do Stripe
// IMPORTANTE: Esta função NÃO deve ter verify_jwt habilitado
// pois o Stripe não envia tokens de autorização do Supabase
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const body = await req.text()
    const signature = req.headers.get('stripe-signature')
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')

    if (!signature || !webhookSecret) {
      return new Response(
        JSON.stringify({ error: 'Missing signature or webhook secret' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Log request details para diagnóstico
    console.log('Received webhook request')
    console.log('Has signature:', !!signature)
    console.log('Has webhook secret:', !!webhookSecret)
    console.log('Body length:', body.length)

    // Initialize Stripe com versão mais recente
    const stripeModule = await import('https://esm.sh/stripe@15.0.0')
    const stripe = new stripeModule.default(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2025-06-30.basil',
    })

    // Verify webhook signature
    let event
    try {
      // Usar constructEvent com await para garantir que funcione corretamente
      event = await stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err) {
      console.error('Webhook signature verification failed:', err)
      return new Response(
        JSON.stringify({ error: `Webhook signature verification failed: ${err.message}` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object
        
        // Parse company data from metadata
        const companyData = {
          name: session.metadata?.company_name || '',
          contact_name: session.metadata?.contact_name || '',
          contact_email: session.metadata?.contact_email || '',
          contact_phone: session.metadata?.contact_phone || '',
          cnpj: session.metadata?.cnpj || '',
          address: session.metadata?.address || '',
          city: session.metadata?.city || '',
          state: session.metadata?.state || '',
          zip_code: session.metadata?.zip_code || '',
          plan_id: session.metadata?.plan_id || '',
          stripe_customer_id: session.customer as string,
          stripe_subscription_id: session.subscription as string,
        }

        // Get plan information
        const planId = session.metadata?.plan_id
        const maxCollaborators = parseInt(session.metadata?.max_collaborators || '0')
        const subscriptionPeriod = parseInt(session.metadata?.subscription_period || '30')

        // Calculate subscription dates
        const now = new Date()
        const subscriptionEndsAt = new Date(now.getTime() + (subscriptionPeriod * 24 * 60 * 60 * 1000))

        // Prepare data for the robust function
        const webhookCompanyData = {
          ...companyData,
          subscription_starts_at: now.toISOString(),
          subscription_ends_at: subscriptionEndsAt.toISOString(),
          max_collaborators: maxCollaborators.toString()
        }

        console.log(`[stripe-webhook] Processing checkout.session.completed for email: ${companyData.contact_email}`)
        
        // Use the robust function to create or update company
        const { data: companyResult, error: companyError } = await supabase.rpc(
          'create_or_update_company_from_webhook',
          { company_data: webhookCompanyData }
        )

        if (companyError) {
          console.error('Error in create_or_update_company_from_webhook:', companyError)
          return new Response(
            JSON.stringify({ 
              error: 'Failed to create or update company',
              details: companyError.message 
            }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        if (!companyResult.success) {
          console.error('Company creation/update failed:', companyResult.error)
          return new Response(
            JSON.stringify({ 
              error: companyResult.error,
              details: companyResult.details 
            }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        console.log(`[stripe-webhook] Company ${companyResult.action}: ${companyResult.company_name} (${companyResult.company_id})`)

        // Get the company record for further processing
        const { data: company, error: getCompanyError } = await supabase
          .from('companies')
          .select('*')
          .eq('id', companyResult.company_id)
          .single()

        if (getCompanyError) {
          console.error('Error getting company after creation/update:', getCompanyError)
          // Continue anyway as the company was created/updated successfully
        }

        // Check if auth user already exists for this company
        let authUserExists = false
        if (company?.auth_user_id) {
          console.log(`[stripe-webhook] Company already has auth_user_id: ${company.auth_user_id}`)
          authUserExists = true
        } else {
          // Check if there's an existing auth user with this email
          console.log(`[stripe-webhook] Checking for existing auth user with email: ${companyData.contact_email}`)
          const { data: { users: userList }, error: listUsersError } = await supabase.auth.admin.listUsers()
          
          if (!listUsersError && userList) {
            const existingUser = userList.find(user => user.email === companyData.contact_email)
            if (existingUser) {
              console.log(`[stripe-webhook] Found existing auth user: ${existingUser.id}`)
              // Link existing user to company
              const { error: linkError } = await supabase
                .from('companies')
                .update({ 
                  auth_user_id: existingUser.id,
                  updated_at: new Date().toISOString()
                })
                .eq('id', companyResult.company_id)

              if (linkError) {
                console.error('Error linking existing user to company:', linkError)
              } else {
                console.log(`[stripe-webhook] Successfully linked existing user to company`)
                authUserExists = true
              }
            }
          }
        }

        // Create auth user if it doesn't exist
        if (!authUserExists) {
          console.log(`[stripe-webhook] Creating new auth user for company: ${companyResult.company_id}`)
          const { data: inviteResult, error: inviteError } = await supabase.auth.admin.inviteUserByEmail(
            companyData.contact_email,
            {
              data: {
                role: 'company',
                company_id: companyResult.company_id,
                company_name: companyData.name,
                contact_name: companyData.contact_name,
              }
            }
          )

          if (inviteError) {
            console.error('Error inviting company admin:', inviteError)
            // Continue anyway as the company was created/updated successfully
          } else if (inviteResult?.user) {
            // Link the auth_user_id to the company
            console.log(`[stripe-webhook] Linking new auth user ${inviteResult.user.id} to company ${companyResult.company_id}`)
            const { error: updateError } = await supabase
              .from('companies')
              .update({ 
                auth_user_id: inviteResult.user.id,
                updated_at: new Date().toISOString()
              })
              .eq('id', companyResult.company_id)

            if (updateError) {
              console.error('Error linking auth user to company:', updateError)
            } else {
              console.log(`[stripe-webhook] Successfully linked new auth user to company`)
            }

            // Create profile for the user
            const { error: profileError } = await supabase
              .from('profiles')
              .upsert({
                id: inviteResult.user.id,
                role: 'company',
                email: companyData.contact_email,
                name: companyData.contact_name || companyData.name,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              }, { onConflict: 'id' })

            if (profileError) {
              console.error('Error creating profile:', profileError)
            }
          }
        }

        break

      case 'invoice.payment_succeeded':
        const invoice = event.data.object
        console.log(`[stripe-webhook] Processing invoice.payment_succeeded for subscription: ${invoice.subscription}`)
        
        // Use the sync function to handle the update safely
        const { data: syncResult, error: syncError } = await supabase.rpc(
          'sync_company_with_stripe_webhook',
          {
            subscription_id: invoice.subscription,
            customer_id: invoice.customer,
            status: 'active'
          }
        )

        if (syncError) {
          console.error('Error syncing company with webhook:', syncError)
          return new Response(
            JSON.stringify({ 
              error: 'Failed to sync company from invoice',
              details: syncError.message 
            }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        if (!syncResult.success) {
          console.error('Sync failed:', syncResult.error)
          return new Response(
            JSON.stringify({ 
              error: syncResult.error,
              details: syncResult.details 
            }),
            { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        console.log(`[stripe-webhook] Successfully synced company: ${syncResult.company_name} (${syncResult.company_id})`)
        break

      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
        const subscription = event.data.object
        const status = subscription.status

        // Update subscription status in database
        const { error: updateError } = await supabase
          .from('companies')
          .update({
            subscription_status: status,
            updated_at: new Date().toISOString(),
          })
          .eq('stripe_subscription_id', subscription.id)

        if (updateError) {
          console.error('Error updating subscription:', updateError)
          return new Response(
            JSON.stringify({ error: 'Failed to update subscription' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        break

      default:
        // Unhandled event type
        console.log(`[stripe-webhook] Unhandled event type: ${event.type}`)
        break
    }

    return new Response(
      JSON.stringify({ received: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Webhook error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})