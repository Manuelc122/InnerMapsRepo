import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@12.0.0'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
  httpClient: Stripe.createFetchHttpClient(),
})

const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET') || ''

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
)

serve(async (req) => {
  const signature = req.headers.get('stripe-signature')

  if (!signature) {
    console.error('Missing stripe-signature header')
    return new Response('Missing stripe-signature header', { status: 400 })
  }

  try {
    const body = await req.text()
    let event

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
      console.log(`Webhook received: ${event.type}`)
    } catch (err) {
      console.error(`Webhook signature verification failed: ${err.message}`)
      return new Response(`Webhook signature verification failed: ${err.message}`, { status: 400 })
    }

    // Handle the event based on its type
    let subscription
    let session
    
    switch (event.type) {
      // Checkout session completed - initial subscription
      case 'checkout.session.completed':
        session = event.data.object as Stripe.Checkout.Session
        console.log('Checkout session completed:', session.id)
        
        // Extract customer information
        const customerId = session.customer as string
        const userId = session.client_reference_id || session.metadata?.userId
        
        if (!userId) {
          console.error('No user ID found in session metadata or client_reference_id')
          return new Response('No user ID found in session metadata or client_reference_id', { status: 400 })
        }
        
        console.log(`Processing checkout for user: ${userId}, customer: ${customerId}`)
        
        // Determine the plan type from the session
        let planType = 'monthly'
        if (session.metadata?.planType) {
          planType = session.metadata.planType
        } else if (session.metadata?.plan) {
          planType = session.metadata.plan
        } else {
          // Try to determine from the URL
          const successUrl = session.success_url || ''
          if (successUrl.includes('plan=yearly')) {
            planType = 'yearly'
          }
        }
        
        console.log(`Determined plan type: ${planType}`)
        
        // Calculate subscription end date based on plan type
        const startDate = new Date()
        const endDate = new Date(startDate)
        
        if (planType === 'yearly') {
          endDate.setFullYear(endDate.getFullYear() + 1) // Add 1 year
        } else {
          endDate.setMonth(endDate.getMonth() + 1) // Add 1 month
        }
        
        console.log(`Subscription period: ${startDate.toISOString()} to ${endDate.toISOString()}`)
        
        // Store subscription information in your database
        const { error: subscriptionError } = await supabase
          .from('subscriptions')
          .upsert({
            user_id: userId,
            stripe_customer_id: customerId,
            stripe_subscription_id: session.subscription as string || `sub_${Math.random().toString(36).substring(2, 15)}`,
            status: 'active',
            plan_type: planType,
            current_period_start: startDate.toISOString(),
            current_period_end: endDate.toISOString(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
        
        if (subscriptionError) {
          console.error('Error storing subscription:', subscriptionError)
          return new Response(`Error storing subscription: ${subscriptionError.message}`, { status: 500 })
        }
        
        // Update user's subscription status
        const { error: userUpdateError } = await supabase
          .from('profiles')
          .update({ 
            is_subscribed: true,
            subscription_status: 'active',
            subscription_updated_at: new Date().toISOString()
          })
          .eq('id', userId)
        
        if (userUpdateError) {
          console.error('Error updating user profile:', userUpdateError)
          return new Response(`Error updating user profile: ${userUpdateError.message}`, { status: 500 })
        }
        
        console.log('🔔 Subscription payment succeeded!')
        break
      
      // Subscription updated
      case 'customer.subscription.updated':
        subscription = event.data.object as Stripe.Subscription
        console.log('Subscription updated:', subscription.id)
        
        // Find the user associated with this subscription
        const { data: subscriptionData, error: subscriptionQueryError } = await supabase
          .from('subscriptions')
          .select('user_id, plan_type')
          .eq('stripe_subscription_id', subscription.id)
          .single()
        
        if (subscriptionQueryError || !subscriptionData) {
          console.error('Error finding subscription:', subscriptionQueryError)
          
          // Try to find by customer ID instead
          const { data: customerData, error: customerQueryError } = await supabase
            .from('subscriptions')
            .select('user_id, plan_type')
            .eq('stripe_customer_id', subscription.customer as string)
            .order('created_at', { ascending: false })
            .limit(1)
            .single()
          
          if (customerQueryError || !customerData) {
            console.error('Error finding subscription by customer ID:', customerQueryError)
            return new Response(`Error finding subscription: ${subscriptionQueryError?.message}`, { status: 500 })
          }
          
          subscriptionData.user_id = customerData.user_id
          subscriptionData.plan_type = customerData.plan_type
        }
        
        const userIdForUpdate = subscriptionData.user_id
        const planTypeForUpdate = subscriptionData.plan_type
        
        // Calculate new end date based on current date and plan type
        const updateStartDate = new Date()
        const updateEndDate = new Date(updateStartDate)
        
        if (planTypeForUpdate === 'yearly') {
          updateEndDate.setFullYear(updateEndDate.getFullYear() + 1) // Add 1 year
        } else {
          updateEndDate.setMonth(updateEndDate.getMonth() + 1) // Add 1 month
        }
        
        // Update subscription status
        const { error: updateError } = await supabase
          .from('subscriptions')
          .update({
            status: subscription.status,
            current_period_start: updateStartDate.toISOString(),
            current_period_end: updateEndDate.toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('stripe_subscription_id', subscription.id)
        
        if (updateError) {
          console.error('Error updating subscription:', updateError)
          return new Response(`Error updating subscription: ${updateError.message}`, { status: 500 })
        }
        
        // Update user's subscription status
        const { error: profileUpdateError } = await supabase
          .from('profiles')
          .update({ 
            is_subscribed: subscription.status === 'active',
            subscription_status: subscription.status,
            subscription_updated_at: new Date().toISOString()
          })
          .eq('id', userIdForUpdate)
        
        if (profileUpdateError) {
          console.error('Error updating user profile:', profileUpdateError)
          return new Response(`Error updating user profile: ${profileUpdateError.message}`, { status: 500 })
        }
        
        console.log('Subscription updated successfully:', subscription.id)
        break
      
      // Subscription deleted/canceled
      case 'customer.subscription.deleted':
        subscription = event.data.object as Stripe.Subscription
        console.log('Subscription canceled:', subscription.id)
        
        // Find the user associated with this subscription
        const { data: canceledSubData, error: canceledSubError } = await supabase
          .from('subscriptions')
          .select('user_id')
          .eq('stripe_subscription_id', subscription.id)
          .single()
        
        if (canceledSubError || !canceledSubData) {
          console.error('Error finding subscription:', canceledSubError)
          
          // Try to find by customer ID instead
          const { data: canceledCustomerData, error: canceledCustomerError } = await supabase
            .from('subscriptions')
            .select('user_id')
            .eq('stripe_customer_id', subscription.customer as string)
            .order('created_at', { ascending: false })
            .limit(1)
            .single()
          
          if (canceledCustomerError || !canceledCustomerData) {
            console.error('Error finding subscription by customer ID:', canceledCustomerError)
            return new Response(`Error finding subscription: ${canceledSubError?.message}`, { status: 500 })
          }
          
          canceledSubData.user_id = canceledCustomerData.user_id
        }
        
        const userIdForCancel = canceledSubData.user_id
        
        // Update subscription status
        const { error: cancelError } = await supabase
          .from('subscriptions')
          .update({
            status: 'canceled',
            updated_at: new Date().toISOString(),
          })
          .eq('stripe_subscription_id', subscription.id)
        
        if (cancelError) {
          console.error('Error updating subscription:', cancelError)
          return new Response(`Error updating subscription: ${cancelError.message}`, { status: 500 })
        }
        
        // Update user's subscription status
        const { error: cancelProfileError } = await supabase
          .from('profiles')
          .update({ 
            is_subscribed: false,
            subscription_status: 'canceled',
            subscription_updated_at: new Date().toISOString()
          })
          .eq('id', userIdForCancel)
        
        if (cancelProfileError) {
          console.error('Error updating user profile:', cancelProfileError)
          return new Response(`Error updating user profile: ${cancelProfileError.message}`, { status: 500 })
        }
        
        console.log('Subscription canceled successfully:', subscription.id)
        break
      
      // Subscription trial ending
      case 'customer.subscription.trial_will_end':
        subscription = event.data.object as Stripe.Subscription
        console.log('Subscription trial will end:', subscription.id)
        // Notify the user that their trial is ending
        break
      
      // Entitlements updated
      case 'entitlements.active_entitlement_summary.updated':
        console.log('Active entitlement summary updated:', event.id)
        // Handle entitlement updates
        break
      
      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    console.error(`Error processing webhook: ${error.message}`)
    return new Response(`Error processing webhook: ${error.message}`, { status: 500 })
  }
}) 