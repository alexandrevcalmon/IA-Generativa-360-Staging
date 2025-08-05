// @ts-ignore
// Edge Function para processar webhooks do Stripe
// IMPORTANTE: Esta função NÃO deve ter verify_jwt habilitado
// pois o Stripe não envia tokens de autorização do Supabase
// @ts-ignore
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
// @ts-ignore
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// @ts-ignore
serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const body = await req.text()
    const signature = req.headers.get('stripe-signature')
    // @ts-ignore
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')
    
    console.log('[stripe-webhook] Received webhook request')
    console.log('[stripe-webhook] Content-Type:', req.headers.get('content-type'))
    console.log('[stripe-webhook] User-Agent:', req.headers.get('user-agent'))
    console.log('[stripe-webhook] Body length:', body.length)

    if (!signature || !webhookSecret) {
      return new Response(
        JSON.stringify({ error: 'Missing signature or webhook secret' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Initialize Stripe
    // @ts-ignore
    const Stripe = (await import('https://esm.sh/stripe@14.21.0')).default
    // @ts-ignore
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2025-06-30.basil',
      httpClient: Stripe.createFetchHttpClient(),
    })

              // Verify webhook signature
          let event
          try {
            console.log('[stripe-webhook] Verifying signature...')
            console.log('[stripe-webhook] Webhook secret exists:', !!webhookSecret)
            console.log('[stripe-webhook] Signature exists:', !!signature)
            console.log('[stripe-webhook] Body length:', body.length)
            
            event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret)
            console.log('[stripe-webhook] Signature verification successful')
          } catch (err: any) {
            console.error('[stripe-webhook] Signature verification failed:', err.message)
            console.error('[stripe-webhook] Error type:', err.type)
            console.error('[stripe-webhook] Error code:', err.code)
            console.error('[stripe-webhook] Full error:', err)
            
            // Log signature details for debugging
            console.log('[stripe-webhook] Signature header:', signature)
            console.log('[stripe-webhook] Webhook secret (first 10 chars):', webhookSecret?.substring(0, 10))
            
            // Try to parse the event directly as a fallback for debugging
            try {
              console.log('[stripe-webhook] Attempting to parse event directly for debugging...')
              const parsedEvent = JSON.parse(body)
              
              // Only process if it's a valid Stripe event structure
              if (parsedEvent.type && parsedEvent.data && parsedEvent.data.object) {
                console.log('[stripe-webhook] Valid Stripe event structure detected, processing as fallback')
                console.log('[stripe-webhook] Event type:', parsedEvent.type)
                console.log('[stripe-webhook] Event ID:', parsedEvent.id)
                
                // Set the event for processing
                event = parsedEvent
              } else {
                throw new Error('Invalid event structure')
              }
            } catch (parseErr) {
              console.error('[stripe-webhook] Failed to parse event directly:', parseErr)
              return new Response(
                JSON.stringify({ 
                  error: `Webhook signature verification failed: ${err.message}`,
                  errorType: err.type,
                  errorCode: err.code,
                  suggestion: 'Check webhook secret configuration in Stripe dashboard'
                }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
              )
            }
          }

    // Initialize Supabase client
    // @ts-ignore
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    // @ts-ignore
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

            console.log(`[stripe-webhook] Processing event type: ${event.type}`)
        console.log(`[stripe-webhook] Event data:`, JSON.stringify(event.data, null, 2))
        
                // Handle the event
        try {
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
          address: session.metadata?.address_street || session.metadata?.address || '',
          city: session.metadata?.address_city || session.metadata?.city || '',
          state: session.metadata?.address_state || session.metadata?.state || '',
          zip_code: session.metadata?.address_zip_code || session.metadata?.zip_code || '',
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
            const existingUser = userList.find((user: any) => user.email === companyData.contact_email)
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
              },
              options: { expiresIn: 7 * 24 * 60 * 60 }
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
        
        // Chama a nova função robusta que lida com o evento de pagamento bem-sucedido
        const { error: syncError } = await supabase.rpc(
          'handle_invoice_payment_succeeded',
          { event_payload: event }
        )

        if (syncError) {
          console.error('[stripe-webhook] Error processing invoice payment:', syncError)
          return new Response(
            JSON.stringify({ 
              error: 'Failed to process invoice payment',
              details: syncError.message 
            }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        console.log(`[stripe-webhook] Successfully processed invoice payment for subscription: ${invoice.subscription}`)
        break

      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
        const subscription = event.data.object
        const status = subscription.status

        console.log(`[stripe-webhook] Processing ${event.type} for subscription: ${subscription.id}, status: ${status}`)

        // Update subscription status in database
        const { error: updateError } = await supabase
          .from('companies')
          .update({
            subscription_status: status,
            updated_at: new Date().toISOString(),
          })
          .eq('stripe_subscription_id', subscription.id)

        if (updateError) {
          console.error('[stripe-webhook] Error updating subscription:', updateError)
          return new Response(
            JSON.stringify({ error: 'Failed to update subscription' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        console.log(`[stripe-webhook] Successfully updated subscription status to: ${status}`)
        break

              default:
          // Unhandled event type
          console.log(`[stripe-webhook] Unhandled event type: ${event.type}`)
          break
      }
    } catch (eventError) {
      console.error(`[stripe-webhook] Error processing event ${event.type}:`, eventError)
      console.error(`[stripe-webhook] Event error stack:`, eventError.stack)
      
      // Return success to Stripe even if event processing fails
      // This prevents Stripe from retrying the webhook indefinitely
      return new Response(
        JSON.stringify({ 
          received: true,
          warning: `Event ${event.type} processing failed: ${eventError.message}`
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ received: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('[stripe-webhook] Webhook error:', error)
    console.error('[stripe-webhook] Error stack:', error.stack)
    console.error('[stripe-webhook] Error message:', error.message)
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error.message,
        stack: error.stack
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
}) 