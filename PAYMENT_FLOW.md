# Payment Flow Documentation

This document outlines the payment flow in the InnerMaps application, including recent changes and improvements.

## Overview

The payment system in InnerMaps supports two main payment flows:

1. **Subscription Flow** - For recurring payments, where users enter their credit card details directly in the application
2. **Direct Payment Flow** - For one-time payments, where users are redirected to the PayU payment gateway

## User Journey

### New User Registration and Payment

1. User signs up with email and password
2. User accepts Terms of Service and Privacy Policy
3. User is redirected to the Subscription page
4. User enters payment details and completes the subscription
5. User is redirected to the dashboard upon successful payment

### Payment Processing

The application uses PayU as the payment processor, with the following components:

- `PayUService` utility (`src/utils/payu.ts`) - Handles all interactions with the PayU API
- `SubscriptionForm` component - Collects and processes subscription payments
- `DirectPaymentRedirect` component - Handles one-time payments via PayU redirect
- `PaymentResultPage` - Processes payment results and displays status to users

## Recent Changes

1. **Redirect Flow Improvement**: Changed the redirect after signup from `/payment/direct` to `/subscription` to provide a better user experience
2. **Security Enhancements**: Removed sensitive information from console logs
3. **Error Handling**: Improved error handling in payment processing
4. **Code Quality**: Fixed syntax errors and improved code structure

## Environment Variables

The following environment variables are required for the payment system:

```
VITE_PAYU_PUBLIC_KEY=<your_public_key>
VITE_PAYU_MERCHANT_ID=<your_merchant_id>
VITE_PAYU_ACCOUNT_ID=<your_account_id>
VITE_PAYU_API_KEY=<your_api_key>
VITE_PAYU_API_LOGIN=<your_api_login>
```

## Testing the Payment Flow

To test the payment flow:

1. Register a new user
2. Accept the Terms of Service
3. Verify you're redirected to the subscription page
4. Enter test payment details:
   - Card Number: 4111111111111111
   - Expiration Date: Any future date
   - CVV: Any 3 digits
   - Name: Any name
5. Complete the payment process
6. Verify the payment result page shows the correct status

## Troubleshooting

If you encounter issues with the payment flow:

- Check browser console for errors (non-sensitive information only)
- Verify all required environment variables are set
- Ensure the PayU account is properly configured
- Check the network tab for API call failures

## Future Improvements

- Add support for additional payment methods
- Implement better error recovery mechanisms
- Add comprehensive payment analytics
- Improve the mobile payment experience 