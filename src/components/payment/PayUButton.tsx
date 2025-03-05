import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '../../state-management/AuthContext';
import { payuService } from '../../utils/payu';

// Interface for component props
interface PayUButtonProps {
  amount: number; // Amount in cents (e.g., 1200 for $12.00)
  reference: string;
  redirectUrl: string;
  buttonText?: string;
  className?: string;
  autoOpen?: boolean; // Prop to control auto-opening
  onPaymentOpen?: () => void; // Callback when payment is opened
  description?: string; // Description of the purchase
  currency: string; // Currency code (e.g., 'USD')
}

// Interface for payment parameters
interface PaymentParams {
  merchantId: string;
  accountId: string;
  description: string;
  referenceCode: string;
  amount: string;
  tax: string;
  taxReturnBase: string;
  currency: string;
  signature: string;
  test: string;
  buyerEmail: string;
  responseUrl: string;
  confirmationUrl: string;
  lng: string;
  payerFullName: string;
}

/**
 * PayU Button Component
 * Renders a button that opens the PayU payment form
 */
export function PayUButton({
  amount,
  reference,
  redirectUrl,
  buttonText = 'Pay Now',
  className = '',
  autoOpen = false,
  onPaymentOpen,
  description = 'InnerMaps Subscription',
  currency
}: PayUButtonProps) {
  const { user } = useAuth();
  const formRef = useRef<HTMLFormElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string>('');
  const [lastError, setLastError] = useState<string | null>(null);
  
  // Format amount for display (convert from cents to dollars)
  const getFormattedAmount = () => {
    return (amount / 100).toFixed(2);
  };

  // Get payment parameters
  const getPaymentParams = (): PaymentParams => {
    try {
      // Use the payuService singleton directly
      const merchantId = payuService.getMerchantId();
      const accountId = payuService.getAccountId();
      
      // Log the cleaned values for debugging
      console.log('Merchant ID (raw):', merchantId);
      console.log('Account ID (raw):', accountId);
      
      // Explicitly remove any commas and convert to string
      const cleanMerchantId = String(merchantId).replace(/,/g, '');
      const cleanAccountId = String(accountId).replace(/,/g, '');
      
      console.log('Merchant ID (clean):', cleanMerchantId);
      console.log('Account ID (clean):', cleanAccountId);
      
      // Format amount to exactly 2 decimal places
      const formattedAmount = getFormattedAmount();
      
      // Generate signature with cleaned values
      const signature = payuService.generateSignature(reference, amount / 100, currency);
      
      return {
        merchantId: cleanMerchantId,
        accountId: cleanAccountId,
        description,
        referenceCode: reference,
        amount: formattedAmount,
        tax: "0.00",
        taxReturnBase: "0.00",
        currency,
        signature,
        test: "0", // 0 for production, 1 for test
        buyerEmail: "customer@example.com", // This should be replaced with actual user email
        responseUrl: redirectUrl,
        confirmationUrl: `${window.location.origin}/api/payment-confirmation`,
        lng: "en",
        payerFullName: "Customer Name" // This should be replaced with actual user name
      };
    } catch (error) {
      console.error('Error getting payment params:', error);
      
      // Return fallback object with all required properties
      return {
        merchantId: String(payuService.getMerchantId()).replace(/,/g, ''),
        accountId: String(payuService.getAccountId()).replace(/,/g, ''),
        description: "",
        referenceCode: "",
        amount: "",
        tax: "0.00",
        taxReturnBase: "0.00",
        currency: "",
        signature: "",
        test: "0",
        buyerEmail: "customer@example.com",
        responseUrl: "",
        confirmationUrl: "",
        lng: "en",
        payerFullName: "Customer Name"
      };
    }
  };
  
  // Handle payment button click
  const handlePayment = () => {
    try {
      if (!payuService.isInitialized()) {
        console.error('[PAYU_BUTTON] PayU service is not initialized');
        return;
      }

      console.log('[PAYU_BUTTON] Starting payment process...');
      
      // Get payment parameters
      const params = getPaymentParams();
      
      // Log all parameters for debugging
      console.log('[PAYU_BUTTON] Payment parameters:');
      Object.entries(params).forEach(([key, value]) => {
        // Don't log sensitive data
        if (key === 'signature') {
          // Removed console.log with sensitive information
        } else {
          console.log(`[PAYU_BUTTON] - ${key}: ${value}`);
        }
      });
      
      // Create a form element
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = payuService.getCheckoutUrl();
      form.style.display = 'none';
      
      // Add all parameters as hidden inputs
      Object.entries(params).forEach(([key, value]) => {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = key;
        input.value = String(value);
        form.appendChild(input);
      });
      
      // Log form details
      console.log('[PAYU_BUTTON] Form created:');
      console.log(`[PAYU_BUTTON] - Action: ${form.action}`);
      console.log(`[PAYU_BUTTON] - Method: ${form.method}`);
      
      // Add form to body and submit
      document.body.appendChild(form);
      
      // Notify that payment is being opened
      if (onPaymentOpen) {
        onPaymentOpen();
      }
      
      // Submit the form after a short delay to ensure DOM is ready
      setTimeout(() => {
        console.log('[PAYU_BUTTON] Submitting form...');
        form.submit();
      }, 100);
      
    } catch (error) {
      console.error('[PAYU_BUTTON] Error during payment process:', error);
      // Clean up the form if it exists
      const forms = document.querySelectorAll('form[action*="payulatam"]');
      forms.forEach(form => {
        try {
          document.body.removeChild(form);
        } catch (e) {
          console.error('[PAYU_BUTTON] Error removing form:', e);
        }
      });
    }
  };
  
  // Auto-open payment if autoOpen is true
  useEffect(() => {
    if (autoOpen && !isSubmitting) {
      // Add a small delay to ensure everything is loaded
      const timer = setTimeout(() => {
        handlePayment();
      }, 1500); // Increased delay to ensure everything is loaded
      
      return () => clearTimeout(timer);
    }
  }, [autoOpen, isSubmitting]);

  // Get payment parameters
  const paymentParams = getPaymentParams();

  return (
    <div className="payu-button-container">
      {/* We don't need the form in the DOM anymore since we're creating it dynamically */}
      <button
        onClick={handlePayment}
        disabled={isSubmitting}
        className={`payu-button ${className}`}
      >
        {isSubmitting ? 'Processing...' : buttonText}
      </button>
      
      {/* Error message if any */}
      {lastError && (
        <div className="error-message mt-2 text-sm text-red-500">
          {lastError}
        </div>
      )}
      
      {/* Debug information */}
      {import.meta.env.DEV && (
        <div className="debug-info mt-4 text-xs text-gray-500">
          <p><strong>Debug Info:</strong></p>
          <p>Amount: {amount} cents (${getFormattedAmount()} USD)</p>
          <p>Reference: {reference}</p>
          <p>Redirect URL: {redirectUrl}</p>
          <p>User ID: {user?.id || 'Not logged in'}</p>
          <p>PayU Initialized: {payuService.isInitialized() ? 'Yes' : 'No'}</p>
          <p>Signature: {paymentParams.signature}</p>
          <p>{debugInfo}</p>
        </div>
      )}
    </div>
  );
} 