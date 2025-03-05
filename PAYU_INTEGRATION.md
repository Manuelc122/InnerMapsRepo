# PayU Latam Integration Guide

This guide explains how to set up and use the PayU Latam integration for InnerMaps.

## Overview

The PayU integration allows users to make payments in USD using credit cards. The integration includes:

- A PayU service utility (`src/utils/payu.ts`)
- A PayU Button component (`src/components/payment/PayUButton.tsx`)
- Supabase Edge Functions for transaction verification and payment processing

## Setup Instructions

### 1. Environment Variables

The following environment variables need to be set in your `.env` file:

```
VITE_PAYU_PUBLIC_KEY=PK7h8978X7Dn04rD61Lg0fbc9y
VITE_PAYU_MERCHANT_ID=1021295
VITE_PAYU_ACCOUNT_ID=512321
VITE_PAYU_API_KEY=089b0PdkTc1XtVl7Sx9Bn4LZ7W
VITE_PAYU_API_LOGIN=L6jvV41O6yA545H
```

### 2. Supabase Edge Functions

Deploy the Edge Functions to Supabase:

```bash
# Set the PayU credentials as secrets in Supabase
./setup-payu-secrets.sh

# Deploy the Edge Functions
supabase functions deploy verify-payu-transaction
supabase functions deploy process-payment
```

### 3. Database Setup

Ensure you have a `payments` table in your Supabase database with the following schema:

```sql
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  transaction_id TEXT NOT NULL,
  reference TEXT NOT NULL,
  amount INTEGER NOT NULL,
  currency TEXT NOT NULL,
  status TEXT NOT NULL,
  provider TEXT NOT NULL,
  plan TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Usage

### Direct Payment Redirect

The `DirectPaymentRedirect` component handles the payment flow:

```jsx
<DirectPaymentRedirect 
  amount={1200} // $12.00 USD in cents
  autoOpen={true} // Automatically open the payment widget
/>
```

### Payment Result Page

The `PaymentResultPage` component handles the payment result:

```jsx
<PaymentResultPage />
```

## Testing

To test the integration:

1. Register a new user or log in
2. Complete the payment process
3. Verify that the transaction is processed correctly

## Troubleshooting

If you encounter issues:

- Check the browser console for errors
- Verify that the PayU credentials are set correctly
- Ensure the Edge Functions are deployed and have the correct secrets
- Check the Supabase logs for any errors in the Edge Functions

### Common Errors

- **"The payment request could not be created"**: This usually means there's an issue with the merchant ID or account ID. Make sure they are correct.
- **"Invalid parameter"**: Check that all required parameters are being sent correctly.
- **Content Security Policy errors**: These are related to the PayU checkout page and don't affect the functionality.

## PayU Documentation

For more information, refer to the [PayU Latam API Documentation](https://developers.payulatam.com/latam/en/docs/getting-started.html). 