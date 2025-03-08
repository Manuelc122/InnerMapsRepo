import { supabase } from './supabaseClient';

// Define the subscription plans with their Stripe product IDs and payment links
export const STRIPE_PLANS = {
  monthly: {
    id: 'prod_Ru3vsbRTxvgUbx', 
    name: 'Monthly Plan',
    price: 12,
    period: 'month',
    paymentLink: 'https://buy.stripe.com/test_4gw3eM5zGelAfRe5km', // Monthly payment link
    features: [
      'Unlimited journaling entries',
      'AI coach chat with personalized guidance and memory integration',
      'Automatic memory extraction and organization from your entries',
      'Semantic search to find relevant memories and insights',
      'Voice-to-text transcription for natural expression'
    ]
  },
  yearly: {
    id: 'prod_Ru3xvv1SfquYMY', 
    name: 'Yearly Plan',
    price: 120,
    period: 'year',
    paymentLink: 'https://buy.stripe.com/test_00g16EaU05P4bAYeUV', // Yearly payment link
    features: [
      'All monthly features',
      'Priority support',
      'Early access to new features',
      '2 months free compared to monthly plan'
    ],
    badge: 'Best Value - 2 Months Free!'
  }
};

// For backward compatibility
export const STRIPE_PRICE_IDS = {
  monthly: STRIPE_PLANS.monthly.id,
  yearly: STRIPE_PLANS.yearly.id
};

/**
 * Redirects the user to the appropriate Stripe payment link
 * @param planType The type of plan ('monthly' or 'yearly')
 * @param userId Optional user ID to include as metadata
 * @param userEmail Optional user email to include as metadata
 */
export const redirectToPaymentLink = (
  planType: 'monthly' | 'yearly',
  userId?: string | null,
  userEmail?: string | null
) => {
  console.log(`redirectToPaymentLink called with planType: ${planType}`);
  
  // Get the payment link from the STRIPE_PLANS object
  const plan = STRIPE_PLANS[planType];
  
  if (!plan) {
    console.error('Invalid plan type:', planType);
    throw new Error(`Invalid plan type: ${planType}`);
  }
  
  console.log(`Using payment link for ${planType} plan:`, plan.paymentLink);
  
  // Construct the URL with optional query parameters for tracking
  let url = plan.paymentLink;
  const params = new URLSearchParams();
  
  // Add user information as query parameters if available
  if (userId) params.set('client_reference_id', userId);
  if (userEmail) params.set('prefilled_email', userEmail);
  
  // Add a return URL to redirect back to the application after payment
  params.set('success_url', `${window.location.origin}/payment/success?plan=${planType}`);
  params.set('cancel_url', `${window.location.origin}/payment/cancel?plan=${planType}`);
  
  // Append parameters if any exist
  const queryString = params.toString();
  if (queryString) {
    // Check if the payment link already has query parameters
    url += url.includes('?') ? `&${queryString}` : `?${queryString}`;
  }
  
  console.log(`Final redirect URL: ${url}`);
  console.log(`Redirecting to ${planType} plan payment link...`);
  
  // Redirect to the payment link
  window.location.href = url;
  
  return true;
};

/**
 * Updates the user's profile with subscription information
 * @param userId The user ID
 * @param planType The type of plan ('monthly' or 'yearly')
 */
export const updateUserSubscription = async (
  userId: string,
  planType: 'monthly' | 'yearly'
) => {
  console.log(`Starting updateUserSubscription for user ${userId} with plan ${planType}`);
  
  try {
    // Calculate subscription end date based on plan type
    const startDate = new Date();
    const endDate = new Date(startDate);
    
    if (planType === 'yearly') {
      endDate.setFullYear(endDate.getFullYear() + 1); // Add 1 year
    } else {
      endDate.setMonth(endDate.getMonth() + 1); // Add 1 month
    }
    
    console.log(`Subscription period: ${startDate.toISOString()} to ${endDate.toISOString()}`);
    
    // Create a unique subscription ID for tracking
    const subscriptionId = `sub_${Math.random().toString(36).substring(2, 15)}`;
    console.log(`Generated subscription ID: ${subscriptionId}`);
    
    // First check if user exists in profiles
    const { data: profileData, error: profileCheckError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .single();
    
    if (profileCheckError) {
      console.error('Error checking user profile:', profileCheckError);
      // If the user doesn't exist in profiles, create a profile
      if (profileCheckError.code === 'PGRST116') {
        console.log('User profile not found, creating profile...');
        const { error: createProfileError } = await supabase
          .from('profiles')
          .insert({
            id: userId,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
        
        if (createProfileError) {
          console.error('Error creating user profile:', createProfileError);
          return false;
        }
        console.log('Created new profile for user:', userId);
      } else {
        return false;
      }
    }
    
    // Create a subscription record in the subscriptions table
    console.log('Creating subscription record...');
    const { data: subscriptionData, error: subscriptionError } = await supabase
      .from('subscriptions')
      .upsert({
        user_id: userId,
        stripe_subscription_id: subscriptionId,
        status: 'active',
        plan_type: planType,
        current_period_start: startDate.toISOString(),
        current_period_end: endDate.toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    
    if (subscriptionError) {
      console.error('Error creating subscription record:', subscriptionError);
      console.error('Error details:', {
        message: subscriptionError.message,
        code: subscriptionError.code,
        details: subscriptionError.details,
        hint: subscriptionError.hint
      });
      return false;
    }
    
    console.log('Subscription record created successfully');
    
    // Update the profiles table in Supabase with subscription information
    console.log('Updating user profile with subscription information...');
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        is_subscribed: true,
        subscription_status: 'active',
        subscription_updated_at: new Date().toISOString()
      })
      .eq('id', userId);
    
    if (profileError) {
      console.error('Error updating profile with subscription data:', profileError);
      console.error('Error details:', {
        message: profileError.message,
        code: profileError.code,
        details: profileError.details,
        hint: profileError.hint
      });
      return false;
    }
    
    console.log('Successfully updated subscription data for user:', userId);
    return true;
  } catch (error) {
    console.error('Exception updating subscription data:', error);
    return false;
  }
}; 