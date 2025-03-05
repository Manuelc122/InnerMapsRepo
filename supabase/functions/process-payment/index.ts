import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { transactionId, reference, plan, provider = 'wompi' } = await req.json();

    if (!transactionId || !reference || !plan) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Extract user ID from reference
    const parts = reference.split('-');
    if (parts.length < 2) {
      return new Response(
        JSON.stringify({ error: 'Invalid reference format' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }
    
    const userId = parts[1];
    
    // Create a Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Handle different payment types
    let subscriptionEndDate;
    if (plan === 'monthly') {
      // Set subscription end date to 1 month from now
      subscriptionEndDate = new Date();
      subscriptionEndDate.setMonth(subscriptionEndDate.getMonth() + 1);
    } else if (plan === 'yearly') {
      // Set subscription end date to 1 year from now
      subscriptionEndDate = new Date();
      subscriptionEndDate.setFullYear(subscriptionEndDate.getFullYear() + 1);
    } else if (plan === 'onetime') {
      // Set subscription end date to 1 month from now for one-time payments
      subscriptionEndDate = new Date();
      subscriptionEndDate.setMonth(subscriptionEndDate.getMonth() + 1);
    } else {
      return new Response(
        JSON.stringify({ error: 'Invalid plan type' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Update user profile with subscription information
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .update({
        subscription_status: 'active',
        subscription_plan: plan,
        subscription_end_date: subscriptionEndDate.toISOString()
      })
      .eq('id', userId);

    if (profileError) {
      console.error('Error updating profile:', profileError);
      return new Response(
        JSON.stringify({ error: 'Failed to update user profile' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    // Try to insert payment record if the payments table exists
    try {
      const { data: paymentData, error: paymentError } = await supabase
        .from('payments')
        .insert({
          user_id: userId,
          transaction_id: transactionId,
          reference: reference,
          plan: plan,
          provider: provider,
          status: 'completed'
        });

      if (paymentError) {
        console.warn('Error inserting payment record:', paymentError);
        // Continue even if this fails (table might not exist yet)
      }
    } catch (err) {
      console.warn('Failed to insert payment record, table might not exist:', err);
      // Continue even if this fails
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Payment processed successfully',
        subscription: {
          status: 'active',
          plan: plan,
          end_date: subscriptionEndDate.toISOString()
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (error) {
    console.error('Error:', error.message);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
}); 