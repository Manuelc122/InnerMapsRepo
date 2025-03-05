#!/bin/bash

# Script to set PayU credentials as secrets in Supabase

echo "Setting PayU credentials as secrets in Supabase..."

# Set PayU API credentials
supabase secrets set PAYU_MERCHANT_ID=1021295
supabase secrets set PAYU_ACCOUNT_ID=512321
supabase secrets set PAYU_API_KEY=089b0PdkTc1XtVl7Sx9Bn4LZ7W
supabase secrets set PAYU_API_LOGIN=L6jvV41O6yA545H

# Set environment to development (change to 'production' for production)
supabase secrets set ENVIRONMENT=development

echo "PayU credentials set successfully!"
echo "To deploy the Edge Functions, run:"
echo "supabase functions deploy verify-payu-transaction"
echo "supabase functions deploy process-payment" 