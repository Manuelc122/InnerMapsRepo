import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { v4 as uuidv4 } from 'https://esm.sh/uuid@9.0.0'
import { createHash } from 'https://deno.land/std@0.168.0/node/crypto.ts'

// CORS headers for cross-origin requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Function to generate a unique reference code
function generateReference(userId: string, planType: string): string {
  const timestamp = Date.now();
  const planPrefix = planType.substring(0, 3).toLowerCase();
  return `IM-${userId.split('-')[0]}-${planPrefix}-${timestamp}`;
}

// Function to generate PayU signature
function generateSignature(apiKey: string, merchantId: string, referenceCode: string, amount: number, currency: string): string {
  // Clean all values to ensure no formatting issues
  const cleanApiKey = String(apiKey).trim();
  const cleanMerchantId = String(merchantId).trim();
  const cleanReferenceCode = String(referenceCode).trim();
  
  // Format amount to exactly two decimal places
  const formattedAmount = parseFloat(amount.toString()).toFixed(2);
  const cleanAmount = String(formattedAmount).trim();
  const cleanCurrency = String(currency).trim();

  // Create signature string according to PayU documentation:
  // ApiKey~merchantId~referenceCode~amount~currency
  const signatureString = `${cleanApiKey}~${cleanMerchantId}~${cleanReferenceCode}~${cleanAmount}~${cleanCurrency}`;
  
  // Use crypto to create MD5 hash
  return createHash('md5').update(signatureString).digest('hex');
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    // Verify authentication
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''))
    if (authError || !user) {
      throw new Error('Invalid token')
    }

    // Get request data
    const { planId, amount, currency = 'USD', description } = await req.json()
    if (!planId || !amount) {
      throw new Error('Plan ID and amount are required')
    }

    // Get PayU credentials from environment variables
    const merchantId = Deno.env.get('PAYU_MERCHANT_ID') || '';
    const accountId = Deno.env.get('PAYU_ACCOUNT_ID') || '';
    const apiKey = Deno.env.get('PAYU_API_KEY') || '';
    
    if (!merchantId || !accountId || !apiKey) {
      throw new Error('PayU configuration is missing')
    }

    // Generate a unique reference code
    const referenceCode = generateReference(user.id, planId);
    
    // Generate signature
    const signature = generateSignature(apiKey, merchantId, referenceCode, amount, currency);
    
    // Determine if we're in test mode
    const isTestMode = Deno.env.get('PAYU_TEST_MODE') === 'true';
    
    // Create checkout data
    const checkoutData = {
      merchantId,
      accountId,
      referenceCode,
      description: description || `InnerMaps ${planId} Subscription`,
      amount,
      currency,
      signature,
      test: isTestMode ? '1' : '0',
      buyerEmail: user.email,
      responseUrl: `${req.headers.get('origin')}/payment/result`,
      confirmationUrl: `${req.headers.get('origin')}/api/payment-confirmation`,
      userId: user.id,
    }

    // Store checkout data in database for verification later
    const { error: insertError } = await supabase
      .from('payment_sessions')
      .insert({
        reference_code: referenceCode,
        user_id: user.id,
        amount,
        currency,
        plan_id: planId,
        status: 'PENDING',
        payment_method: 'PAYU',
        metadata: checkoutData
      })

    if (insertError) {
      console.error('Error storing payment session:', insertError)
      // Continue anyway, as this is just for record-keeping
    }

    return new Response(
      JSON.stringify({ checkoutData }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('PayU checkout error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
}) 