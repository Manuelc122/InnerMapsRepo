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
    const { transactionId } = await req.json();

    if (!transactionId) {
      return new Response(
        JSON.stringify({ error: 'Missing transaction ID' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Create a Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get the PayU API credentials from environment variables
    const payuApiLogin = Deno.env.get('PAYU_API_LOGIN') || '';
    const payuApiKey = Deno.env.get('PAYU_API_KEY') || '';
    const isProduction = Deno.env.get('ENVIRONMENT') === 'production';
    
    // PayU API URL
    const apiUrl = isProduction
      ? 'https://api.payulatam.com/payments-api/4.0/service.cgi'
      : 'https://sandbox.api.payulatam.com/payments-api/4.0/service.cgi';

    // Call the PayU API to verify the transaction
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        language: 'en',
        command: 'ORDER_DETAIL',
        merchant: {
          apiLogin: payuApiLogin,
          apiKey: payuApiKey
        },
        details: {
          transactionId: transactionId
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('PayU API error:', errorText);
      return new Response(
        JSON.stringify({ error: 'Failed to verify transaction with PayU' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    const data = await response.json();
    
    return new Response(
      JSON.stringify(data),
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