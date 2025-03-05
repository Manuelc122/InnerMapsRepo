import { supabase } from './supabaseClient';
import { v4 as uuidv4 } from 'uuid';
import CryptoJS from 'crypto-js';
import MD5 from 'crypto-js/md5';
import crypto from 'crypto-js';

class PayUService {
  private static instance: PayUService;
  private initialized = false;
  
  // API credentials
  private publicKey = import.meta.env.VITE_PAYU_PUBLIC_KEY || '';
  private merchantId = import.meta.env.VITE_PAYU_MERCHANT_ID || '';
  private accountId = import.meta.env.VITE_PAYU_ACCOUNT_ID || '';
  private apiKey = import.meta.env.VITE_PAYU_API_KEY || '';
  private apiLogin = import.meta.env.VITE_PAYU_API_LOGIN || '';
  
  // API URLs
  private isProduction = false; // Force sandbox mode for testing
  private apiUrl = this.isProduction 
    ? 'https://api.payulatam.com/payments-api/4.0/service.cgi'
    : 'https://sandbox.api.payulatam.com/payments-api/4.0/service.cgi';
  
  private checkoutUrl = this.isProduction
    ? 'https://checkout.payulatam.com/ppp-web-gateway-payu/'
    : 'https://checkout.payulatam.com/ppp-web-gateway-payu/'; // Fixed URL - PayU sandbox uses the same checkout URL
  
  // Subscription API URLs
  private subscriptionApiUrl = this.isProduction
    ? 'https://api.payulatam.com/payments-api/rest/v4.3/'
    : 'https://sandbox.api.payulatam.com/payments-api/rest/v4.3/';
  
  // Helper method to clean any string value (remove commas, spaces, etc.)
  private cleanValue(value: string | number | undefined): string {
    if (value === undefined) {
      console.log(`[PAYU_SERVICE] Warning: Cleaning undefined value, returning empty string`);
      return '';
    }
    
    const stringValue = String(value);
    // Remove commas, spaces, and any other non-alphanumeric characters except dots for decimals
    // Also remove quotes that might be present from .env file
    const cleaned = stringValue.replace(/[,\s"']/g, '');
    
    if (stringValue !== cleaned) {
      console.log(`[PAYU_SERVICE] Cleaned value: "${stringValue}" -> "${cleaned}"`);
    }
    
    return cleaned;
  }
  
  private constructor() {
    this.initialize();
  }
  
  public static getInstance(): PayUService {
    if (!PayUService.instance) {
      PayUService.instance = new PayUService();
    }
    return PayUService.instance;
  }
  
  /**
   * Initialize the PayU service
   */
  private initialize(): void {
    try {
      // Store original values for logging
      const rawMerchantId = this.merchantId;
      const rawAccountId = this.accountId;
      const rawApiKey = this.apiKey;
      const rawApiLogin = this.apiLogin;
      const rawPublicKey = this.publicKey;
      
      // Clean all credentials when initializing
      this.merchantId = this.cleanValue(this.merchantId);
      this.accountId = this.cleanValue(this.accountId);
      this.publicKey = this.cleanValue(this.publicKey);
      this.apiKey = this.cleanValue(this.apiKey);
      this.apiLogin = this.cleanValue(this.apiLogin);
      
      // Ensure merchantId and accountId are strings without any formatting
      this.merchantId = String(this.merchantId);
      this.accountId = String(this.accountId);
      
      // Log both raw and cleaned values for debugging
      console.log('[PAYU_SERVICE] Merchant ID: Raw="%s", Cleaned="%s"', rawMerchantId, this.merchantId);
      console.log('[PAYU_SERVICE] Account ID: Raw="%s", Cleaned="%s"', rawAccountId, this.accountId);
      console.log('[PAYU_SERVICE] Public Key: Raw="%s", Cleaned="%s"', rawPublicKey, this.publicKey);
      console.log('[PAYU_SERVICE] Environment: %s', this.isProduction ? 'PRODUCTION' : 'SANDBOX');
      
      this.initialized = true;
      console.log('[PAYU_SERVICE] Service initialized successfully');
    } catch (error) {
      console.error('[PAYU_SERVICE] Error initializing PayU service:', error);
      this.initialized = false;
    }
  }

  /**
   * Generate a unique reference for a transaction
   * @param userId The user ID to include in the reference
   * @param plan The subscription plan
   * @returns A unique reference string
   */
  public generateReference(userId: string, plan: string): string {
    const timestamp = Date.now();
    const planPrefix = plan.substring(0, 3).toLowerCase();
    return `IM-${userId.split('-')[0]}-${planPrefix}-${timestamp}-${Math.floor(Math.random() * 1000)}`;
  }

  /**
   * Generate a signature for PayU API
   * @param referenceCode The reference code for the transaction
   * @param amount The amount to charge
   * @param currency The currency code (USD)
   * @returns The MD5 signature required by PayU
   */
  public generateSignature(referenceCode: string, amount: number, currency: string): string {
    try {
      // Clean all values to ensure no formatting issues
      const cleanApiKey = String(this.cleanValue(this.apiKey));
      const cleanMerchantId = String(this.cleanValue(this.merchantId));
      const cleanReferenceCode = String(this.cleanValue(referenceCode));
      
      // Format amount to exactly two decimal places
      const formattedAmount = parseFloat(amount.toString()).toFixed(2);
      const cleanAmount = String(this.cleanValue(formattedAmount));
      const cleanCurrency = String(this.cleanValue(currency));

      // Create signature string according to PayU documentation:
      // ApiKey~merchantId~referenceCode~amount~currency
      const signatureString = `${cleanApiKey}~${cleanMerchantId}~${cleanReferenceCode}~${cleanAmount}~${cleanCurrency}`;
      
      // Log the components used for signature (hiding API key for security)
      console.log('[PAYU_SERVICE] Generating signature with components:');
      console.log(`[PAYU_SERVICE] MerchantId: ${cleanMerchantId}`);
      console.log(`[PAYU_SERVICE] ReferenceCode: ${cleanReferenceCode}`);
      console.log(`[PAYU_SERVICE] Amount: ${cleanAmount}`);
      console.log(`[PAYU_SERVICE] Currency: ${cleanCurrency}`);
      
      // Use crypto-js for browser compatibility
      const md5Hash = crypto.MD5(signatureString).toString();
      console.log(`[PAYU_SERVICE] Generated signature (MD5): ${md5Hash}`);
      
      return md5Hash;
    } catch (error) {
      console.error('[PAYU_SERVICE] Error generating signature:', error);
      return '';
    }
  }

  /**
   * Get the redirect URL for the payment result
   * @returns The full URL to redirect to after payment
   */
  public getRedirectUrl(): string {
    const origin = window.location.origin;
    return `${origin}/payment/result`;
  }

  /**
   * Verify a transaction with the PayU API
   * @param transactionId The transaction ID from PayU
   * @returns The transaction details
   */
  public async verifyTransaction(transactionId: string): Promise<any> {
    console.log('Verifying transaction:', transactionId);
    return {
      status: 'PENDING',
      message: 'Transaction verification not implemented yet'
    };
  }

  /**
   * Process a successful payment
   * @param transactionId The transaction ID from PayU
   * @param reference The reference used for the payment
   * @returns The result of the payment processing
   */
  public async processSuccessfulPayment(transactionId: string, reference: string): Promise<any> {
    try {
      console.log('Processing successful payment:', transactionId, reference);
      
      // In a production environment, you would verify the transaction with PayU API
      // For now, we'll just return a success response
      
      return {
        status: 'SUCCESS',
        message: 'Payment processed successfully',
        transactionId,
        reference
      };
    } catch (error) {
      console.error('Error processing payment:', error);
      throw error;
    }
  }

  /**
   * Get PayU checkout URL
   * @returns The PayU checkout URL
   */
  public getCheckoutUrl(): string {
    return this.checkoutUrl;
  }

  /**
   * Get PayU merchant ID
   * @returns The PayU merchant ID
   */
  public getMerchantId(): string {
    const cleanId = String(this.cleanValue(this.merchantId));
    console.log(`[PAYU_SERVICE] Getting merchant ID: "${this.merchantId}" -> "${cleanId}"`);
    return cleanId;
  }

  /**
   * Get PayU account ID
   * @returns The PayU account ID
   */
  public getAccountId(): string {
    const cleanId = String(this.cleanValue(this.accountId));
    console.log(`[PAYU_SERVICE] Getting account ID: "${this.accountId}" -> "${cleanId}"`);
    return cleanId;
  }

  /**
   * Get PayU public key
   * @returns The PayU public key
   */
  public getPublicKey(): string {
    return this.cleanValue(this.publicKey);
  }

  public isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Create a subscription plan in PayU
   * @param planCode Unique code for the plan
   * @param description Description of the plan
   * @param amount Amount to charge (in dollars)
   * @param currency Currency code (USD)
   * @param interval Billing interval (MONTH)
   * @returns The created plan details
   */
  public async createSubscriptionPlan(
    planCode: string,
    description: string,
    amount: number,
    currency: string = 'USD',
    interval: 'MONTH' | 'YEAR' = 'MONTH'
  ): Promise<any> {
    try {
      console.log('[PAYU_SERVICE] Creating subscription plan:', planCode);
      
      // Format amount to exactly two decimal places
      const formattedAmount = parseFloat(amount.toString()).toFixed(2);
      
      // Create the plan request payload
      const planData = {
        planCode,
        description,
        accountId: this.getAccountId(),
        intervalCount: 1,
        interval,
        maxPaymentsAllowed: 0, // 0 means unlimited
        maxPaymentAttempts: 3,
        paymentAttemptsDelay: 1,
        maxPendingPayments: 0,
        trialDays: 0,
        additionalValues: [
          {
            name: "PLAN_VALUE",
            value: formattedAmount,
            currency
          }
        ]
      };
      
      // In a real implementation, you would make an API call to PayU here
      // For now, we'll just log the plan data and return a mock response
      console.log('[PAYU_SERVICE] Plan data:', JSON.stringify(planData, null, 2));
      
      // Mock response
      return {
        id: `PLAN_${Date.now()}`,
        planCode,
        description,
        accountId: this.getAccountId(),
        intervalCount: 1,
        interval,
        maxPaymentsAllowed: 0,
        maxPaymentAttempts: 3,
        paymentAttemptsDelay: 1,
        maxPendingPayments: 0,
        trialDays: 0,
        additionalValues: [
          {
            name: "PLAN_VALUE",
            value: formattedAmount,
            currency
          }
        ],
        status: "ACTIVE"
      };
    } catch (error) {
      console.error('[PAYU_SERVICE] Error creating subscription plan:', error);
      throw error;
    }
  }
  
  /**
   * Create a customer in PayU
   * @param customerId Unique ID for the customer
   * @param email Customer's email
   * @param fullName Customer's full name
   * @returns The created customer details
   */
  public async createCustomer(
    customerId: string,
    email: string,
    fullName: string
  ): Promise<any> {
    try {
      console.log('[PAYU_SERVICE] Creating customer:', customerId);
      
      // Create the customer request payload
      const customerData = {
        fullName,
        email
      };
      
      // In a real implementation, you would make an API call to PayU here
      // For now, we'll just log the customer data and return a mock response
      console.log('[PAYU_SERVICE] Customer data:', JSON.stringify(customerData, null, 2));
      
      // Mock response
      return {
        id: `CUSTOMER_${Date.now()}`,
        fullName,
        email,
        creditCards: []
      };
    } catch (error) {
      console.error('[PAYU_SERVICE] Error creating customer:', error);
      throw error;
    }
  }
  
  /**
   * Create a credit card token in PayU
   * @param customerId Customer ID
   * @param creditCardNumber Credit card number
   * @param expirationDate Expiration date (YYYY/MM)
   * @param name Name on the card
   * @param document Document number
   * @returns The created credit card token
   */
  public async createCreditCardToken(
    customerId: string,
    creditCardNumber: string,
    expirationDate: string,
    name: string,
    document: string
  ): Promise<any> {
    try {
      // Removed console.log with sensitive information
      
      // Validate credit card number (basic check)
      if (!this.isValidCreditCardNumber(creditCardNumber)) {
        throw new Error('invalid_card: Credit card number is invalid');
      }
      
      // Validate expiration date
      if (!this.isValidExpirationDate(expirationDate)) {
        throw new Error('expired_card: Credit card expiration date is invalid');
      }
      
      // Create the credit card token request payload
      const creditCardData = {
        name,
        document,
        number: creditCardNumber,
        expirationDate
      };
      
      // In a real implementation, you would make an API call to PayU here
      // For now, we'll just log the credit card data and return a mock response
      // Removed console.log with sensitive information
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simulate card validation
      // In a real implementation, PayU would validate the card
      this.simulateCardValidation(creditCardNumber);
      
      // Mock response
      return {
        creditCardTokenId: `TOKEN_${Date.now()}`,
        name,
        payerId: customerId,
        identificationNumber: document,
        method: this.getCardType(creditCardNumber),
        number: `****${creditCardNumber.slice(-4)}`,
        expirationDate
      };
    } catch (error) {
      console.error('[PAYU_SERVICE] Error creating credit card token:', error);
      throw error;
    }
  }
  
  /**
   * Validate credit card number using Luhn algorithm
   * @param cardNumber Credit card number
   * @returns Whether the card number is valid
   */
  private isValidCreditCardNumber(cardNumber: string): boolean {
    // Remove all non-digit characters
    const digits = cardNumber.replace(/\D/g, '');
    
    // Check if the card number has a valid length
    if (digits.length < 13 || digits.length > 19) {
      return false;
    }
    
    // Luhn algorithm implementation
    let sum = 0;
    let shouldDouble = false;
    
    // Loop through the digits in reverse order
    for (let i = digits.length - 1; i >= 0; i--) {
      let digit = parseInt(digits.charAt(i));
      
      if (shouldDouble) {
        digit *= 2;
        if (digit > 9) {
          digit -= 9;
        }
      }
      
      sum += digit;
      shouldDouble = !shouldDouble;
    }
    
    return sum % 10 === 0;
  }
  
  /**
   * Validate credit card expiration date
   * @param expirationDate Expiration date (YYYY/MM)
   * @returns Whether the expiration date is valid
   */
  private isValidExpirationDate(expirationDate: string): boolean {
    // Check format
    if (!/^\d{4}\/\d{2}$/.test(expirationDate)) {
      return false;
    }
    
    const [yearStr, monthStr] = expirationDate.split('/');
    const year = parseInt(yearStr);
    const month = parseInt(monthStr);
    
    // Check if month is valid
    if (month < 1 || month > 12) {
      return false;
    }
    
    // Check if the date is in the future
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1; // January is 0
    
    return (year > currentYear) || (year === currentYear && month >= currentMonth);
  }
  
  /**
   * Get credit card type based on the card number
   * @param cardNumber Credit card number
   * @returns The card type (VISA, MASTERCARD, etc.)
   */
  private getCardType(cardNumber: string): string {
    // Remove all non-digit characters
    const digits = cardNumber.replace(/\D/g, '');
    
    // Check card type based on the first few digits
    if (/^4/.test(digits)) {
      return 'VISA';
    } else if (/^5[1-5]/.test(digits)) {
      return 'MASTERCARD';
    } else if (/^3[47]/.test(digits)) {
      return 'AMEX';
    } else if (/^6(?:011|5)/.test(digits)) {
      return 'DISCOVER';
    } else {
      return 'UNKNOWN';
    }
  }
  
  /**
   * Simulate credit card validation
   * @param cardNumber Credit card number
   */
  private simulateCardValidation(cardNumber: string): void {
    // Remove all non-digit characters
    const digits = cardNumber.replace(/\D/g, '');
    
    // Simulate card validation based on the last digit
    const lastDigit = parseInt(digits.slice(-1));
    
    // Simulate different error scenarios for testing
    if (lastDigit === 1) {
      throw new Error('card_declined: Card was declined');
    } else if (lastDigit === 2) {
      throw new Error('insufficient_funds: Insufficient funds');
    } else if (lastDigit === 3) {
      throw new Error('expired_card: Card has expired');
    } else if (lastDigit === 4) {
      throw new Error('invalid_card: Card is invalid');
    }
    
    // For all other cases, the card is valid
  }
  
  /**
   * Create a subscription in PayU
   * @param planCode Plan code
   * @param customerId Customer ID
   * @param creditCardTokenId Credit card token ID
   * @param deliveryAddress Delivery address
   * @returns The created subscription details
   */
  public async createSubscription(
    planCode: string,
    customerId: string,
    creditCardTokenId: string,
    deliveryAddress: any
  ): Promise<any> {
    try {
      console.log('[PAYU_SERVICE] Creating subscription for plan:', planCode);
      
      // Generate a unique reference for this subscription
      const reference = `SUB-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      
      // Create the subscription request payload
      const subscriptionData = {
        quantity: 1,
        installments: 1,
        trialDays: 0,
        customer: {
          id: customerId
        },
        creditCardToken: {
          id: creditCardTokenId
        },
        plan: {
          planCode
        },
        deliveryAddress
      };
      
      // In a real implementation, you would make an API call to PayU here
      // For now, we'll just log the subscription data and return a mock response
      console.log('[PAYU_SERVICE] Subscription data:', JSON.stringify(subscriptionData, null, 2));
      
      // Mock response
      return {
        id: `SUBSCRIPTION_${Date.now()}`,
        plan: {
          id: `PLAN_ID`,
          planCode,
          description: "Monthly Subscription",
          accountId: this.getAccountId()
        },
        customer: {
          id: customerId
        },
        creditCardToken: {
          id: creditCardTokenId
        },
        deliveryAddress,
        quantity: 1,
        installments: 1,
        currentPeriodStart: new Date().toISOString(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        status: "ACTIVE"
      };
    } catch (error) {
      console.error('[PAYU_SERVICE] Error creating subscription:', error);
      throw error;
    }
  }
  
  /**
   * Cancel a subscription in PayU
   * @param subscriptionId Subscription ID
   * @returns The cancellation result
   */
  public async cancelSubscription(subscriptionId: string): Promise<any> {
    try {
      console.log('[PAYU_SERVICE] Cancelling subscription:', subscriptionId);
      
      // In a real implementation, you would make an API call to PayU here
      // For now, we'll just log the cancellation and return a mock response
      
      // Mock response
      return {
        id: subscriptionId,
        status: "CANCELLED"
      };
    } catch (error) {
      console.error('[PAYU_SERVICE] Error cancelling subscription:', error);
      throw error;
    }
  }
  
  /**
   * Get subscription details from PayU
   * @param subscriptionId Subscription ID
   * @returns The subscription details
   */
  public async getSubscription(subscriptionId: string): Promise<any> {
    try {
      console.log('[PAYU_SERVICE] Getting subscription details:', subscriptionId);
      
      // In a real implementation, you would make an API call to PayU here
      // For now, we'll just log the request and return a mock response
      
      // Mock response
      return {
        id: subscriptionId,
        plan: {
          id: `PLAN_ID`,
          planCode: "MONTHLY_PLAN",
          description: "Monthly Subscription",
          accountId: this.getAccountId()
        },
        customer: {
          id: `CUSTOMER_ID`
        },
        creditCardToken: {
          id: `TOKEN_ID`
        },
        quantity: 1,
        installments: 1,
        currentPeriodStart: new Date().toISOString(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        status: "ACTIVE"
      };
    } catch (error) {
      console.error('[PAYU_SERVICE] Error getting subscription details:', error);
      throw error;
    }
  }
}

// Export a singleton instance
const payuService = PayUService.getInstance();
export { payuService }; 