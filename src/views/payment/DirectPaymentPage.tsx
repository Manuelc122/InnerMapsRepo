import React, { useState, useRef, useEffect } from 'react';
import { DirectPaymentRedirect } from '../../components/payment/DirectPaymentRedirect';
import { payuService } from '../../utils/payu';
import { useAuth } from '../../state-management/AuthContext';

export default function DirectPaymentPage() {
  const { user } = useAuth();
  const [showDirectForm, setShowDirectForm] = useState(false);
  const [payuStatus, setPayuStatus] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [debugInfo, setDebugInfo] = useState('');
  const [lastError, setLastError] = useState<string | null>(null);
  
  useEffect(() => {
    // Check PayU service status
    const status = payuService.isInitialized() 
      ? 'PayU service initialized' 
      : 'PayU service not initialized';
    setPayuStatus(status);
    
    // Log PayU credentials for debugging
    console.log('PayU Merchant ID:', payuService.getMerchantId());
    console.log('PayU Account ID:', payuService.getAccountId());
  }, []);

  const handleDirectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSubmitting) {
      return;
    }
    
    setIsSubmitting(true);
    setLastError(null);
    setDebugInfo('Preparing direct form submission...');
    
    try {
      // Get test parameters
      const params = getTestParams();
      console.log('[DIRECT_SUBMIT] Form parameters before cleaning:', params);
      
      // Create a new form element
      const form = document.createElement('form');
      form.method = 'post';
      form.action = payuService.getCheckoutUrl();
      console.log('[DIRECT_SUBMIT] Form action URL:', payuService.getCheckoutUrl());
      
      // Important: Don't use target="_blank" as it can cause issues with PayU's JavaScript
      // Instead, use a regular form submission
      
      // Add all parameters to the form
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          const input = document.createElement('input');
          input.type = 'hidden';
          input.name = key;
          // Ensure all values are clean (no commas or spaces)
          const cleanValue = String(value).replace(/[,\s]/g, '');
          input.value = cleanValue;
          
          // Special logging for critical fields
          if (key === 'merchantId' || key === 'accountId') {
            console.log(`[DIRECT_SUBMIT] Critical field ${key}: "${value}" -> "${cleanValue}"`);
          } else {
            console.log(`[DIRECT_SUBMIT] Form field ${key}: "${value}" -> "${cleanValue}"`);
          }
          
          form.appendChild(input);
        }
      });
      
      // Append form to body
      document.body.appendChild(form);
      
      // Use a short timeout to ensure the DOM is ready
      setTimeout(() => {
        try {
          console.log('[DIRECT_SUBMIT] Submitting form now...');
          form.submit();
          setDebugInfo('Direct form submitted successfully');
          
          // Don't remove the form immediately as it might interfere with PayU's JavaScript
          // Let PayU handle the form submission completely
        } catch (submitError) {
          console.error('[DIRECT_SUBMIT] Error submitting form:', submitError);
          const errorMsg = `Error: ${submitError instanceof Error ? submitError.message : String(submitError)}`;
          setDebugInfo(errorMsg);
          setLastError(errorMsg);
          setIsSubmitting(false);
          
          // Clean up the form on error
          document.body.removeChild(form);
        }
      }, 100);
    } catch (error) {
      console.error('[DIRECT_SUBMIT] Error in form preparation:', error);
      const errorMsg = `Error: ${error instanceof Error ? error.message : String(error)}`;
      setDebugInfo(errorMsg);
      setLastError(errorMsg);
      setIsSubmitting(false);
    }
  };

  const toggleDirectForm = () => {
    setShowDirectForm(!showDirectForm);
  };

  const getTestParams = () => {
    try {
      // Generate a unique reference code
      const referenceCode = `test-${Date.now()}`;
      console.log('[DIRECT_PAGE] Using reference code:', referenceCode);
      
      // Format amount to exactly two decimal places
      const amount = 12.00;
      const formattedAmount = amount.toFixed(2);
      console.log('[DIRECT_PAGE] Formatted amount for payment:', formattedAmount);
      
      // Get merchant and account IDs directly from the service
      // The service already cleans these values
      const merchantId = payuService.getMerchantId();
      const accountId = payuService.getAccountId();
      
      // Explicitly remove any commas to ensure clean values
      const cleanMerchantId = String(merchantId).replace(/,/g, '');
      const cleanAccountId = String(accountId).replace(/,/g, '');
      
      console.log('[DIRECT_PAGE] Using Merchant ID (raw):', merchantId);
      console.log('[DIRECT_PAGE] Using Merchant ID (clean):', cleanMerchantId);
      console.log('[DIRECT_PAGE] Using Account ID (raw):', accountId);
      console.log('[DIRECT_PAGE] Using Account ID (clean):', cleanAccountId);
      
      // Generate signature using the formatted amount
      const signature = payuService.generateSignature(referenceCode, parseFloat(formattedAmount), 'USD');
      console.log('[DIRECT_PAGE] Generated signature:', signature);
      
      return {
        merchantId: cleanMerchantId,
        accountId: cleanAccountId,
        referenceCode,
        description: 'Test Payment',
        amount: formattedAmount,
        tax: '0',
        taxReturnBase: '0',
        currency: 'USD',
        signature,
        test: '1',
        responseUrl: window.location.origin + '/payment-result',
        confirmationUrl: window.location.origin + '/api/payment-confirmation',
      };
    } catch (error) {
      console.error('[DIRECT_PAGE] Error generating test parameters:', error);
      // Return fallback parameters with clean IDs
      const cleanMerchantId = String(payuService.getMerchantId()).replace(/,/g, '');
      const cleanAccountId = String(payuService.getAccountId()).replace(/,/g, '');
      
      return {
        merchantId: cleanMerchantId,
        accountId: cleanAccountId,
        referenceCode: `fallback-${Date.now()}`,
        description: 'Fallback Test Payment',
        amount: '12.00',
        tax: '0',
        taxReturnBase: '0',
        currency: 'USD',
        signature: '',
        test: '1',
        responseUrl: window.location.origin + '/payment-result',
        confirmationUrl: window.location.origin + '/api/payment-confirmation',
      };
    }
  };

  const params = getTestParams();

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Direct Payment Test</h1>
      
      <div className="mb-4">
        <p className="text-sm text-gray-600 mb-2">PayU Service Status: {payuStatus}</p>
        <p className="text-sm text-gray-600 mb-2">Merchant ID: {params.merchantId}</p>
        <p className="text-sm text-gray-600 mb-2">Account ID: {params.accountId}</p>
        <p className="text-sm text-gray-600 mb-2">Reference: {params.referenceCode}</p>
        <p className="text-sm text-gray-600 mb-2">Signature: {params.signature}</p>
      </div>
      
      <div className="mb-4">
        <button
          onClick={toggleDirectForm}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          {showDirectForm ? 'Hide Direct Form' : 'Show Direct Form'}
        </button>
      </div>
      
      {showDirectForm && (
        <div className="border p-4 rounded mb-4">
          <h2 className="text-xl font-bold mb-2">Direct Form Submission</h2>
          
          <div className="space-y-4">
            {Object.entries(params).map(([key, value]) => (
              value !== undefined && (
                <div key={key} className="flex items-center">
                  <label className="w-1/3 text-sm font-medium">{key}:</label>
                  <input
                    type="text"
                    value={String(value).replace(/[,\s]/g, '')}
                    readOnly
                    className="w-2/3 p-2 border rounded"
                  />
                </div>
              )
            ))}
            
            <div className="flex justify-end">
              <button
                onClick={handleDirectSubmit}
                disabled={isSubmitting}
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:bg-gray-400"
              >
                {isSubmitting ? 'Processing...' : 'Submit Direct Form'}
              </button>
            </div>
            
            {lastError && (
              <div className="mt-4 p-2 bg-red-50 border border-red-200 rounded text-red-500">
                <p className="text-sm">{lastError}</p>
              </div>
            )}
            
            {debugInfo && !lastError && (
              <div className="mt-4 p-2 bg-gray-100 rounded">
                <p className="text-sm">{debugInfo}</p>
              </div>
            )}
          </div>
        </div>
      )}
      
      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">PayU Button Test</h2>
        <DirectPaymentRedirect amount={1200} autoOpen={false} />
      </div>
    </div>
  );
} 