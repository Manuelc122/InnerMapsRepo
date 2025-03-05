import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../state-management/AuthContext';
import { payuService } from '../utils/payu';
import { supabase } from '../utils/supabaseClient';

// Payment status types
type PaymentStatus = 'loading' | 'success' | 'error' | 'pending';

export default function PaymentResultPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [status, setStatus] = useState<PaymentStatus>('loading');
  const [message, setMessage] = useState<string>('');
  const [transactionId, setTransactionId] = useState<string>('');
  const [reference, setReference] = useState<string>('');

  useEffect(() => {
    processPaymentResult();
  }, [location.search]);

  const processPaymentResult = async () => {
    try {
      // Get URL parameters
      const params = new URLSearchParams(location.search);
      
      // Check for PayU parameters
      const lapTransactionState = params.get('lapTransactionState');
      const referenceCode = params.get('referenceCode');
      const transactionId = params.get('transactionId');
      const lapResponseCode = params.get('lapResponseCode');
      
      console.log('Payment result parameters:', {
        lapTransactionState,
        referenceCode,
        transactionId,
        lapResponseCode
      });
      
      // If we don't have the necessary parameters, check session storage
      if (!referenceCode && !transactionId) {
        const storedReference = sessionStorage.getItem('paymentReference');
        if (storedReference) {
          setReference(storedReference);
          setMessage('Payment status is being verified...');
          setStatus('pending');
          return;
        }
        
        setStatus('error');
        setMessage('No payment information found. Please try again.');
        return;
      }
      
      // Set transaction details
      if (referenceCode) setReference(referenceCode);
      if (transactionId) setTransactionId(transactionId);
      
      // Process based on transaction state
      if (lapTransactionState === 'APPROVED') {
        // Payment was successful
        setStatus('success');
        setMessage('Your payment was successful! Thank you for your purchase.');
        
        // Process the successful payment
        if (transactionId && referenceCode && user) {
          try {
            // First, call the PayU service to process the payment
            await payuService.processSuccessfulPayment(transactionId, referenceCode);
            
            // Extract plan information from reference code (assuming format like SUB-PLAN_TYPE-TIMESTAMP)
            const planMatch = referenceCode.match(/SUB-(monthly|yearly)/i);
            const planType = planMatch ? planMatch[1].toLowerCase() : 'monthly';
            
            // Update the user's subscription status in the database
            const { error: subscriptionError } = await supabase
              .from('subscription_history')
              .insert({
                user_id: user.id,
                plan: planType,
                status: 'active',
                payment_provider: 'payu',
                payment_id: transactionId,
                period_start: new Date().toISOString(),
                period_end: new Date(
                  Date.now() + (planType === 'yearly' ? 365 : 30) * 24 * 60 * 60 * 1000
                ).toISOString()
              });
            
            if (subscriptionError) {
              console.error('Error updating subscription status:', subscriptionError);
            } else {
              console.log('Subscription status updated successfully');
            }
          } catch (error) {
            console.error('Error processing successful payment:', error);
          }
        }
      } else if (lapTransactionState === 'PENDING') {
        // Payment is pending
        setStatus('pending');
        setMessage('Your payment is being processed. We will notify you once it is complete.');
      } else if (lapTransactionState === 'DECLINED' || lapTransactionState === 'ERROR') {
        // Payment failed
        setStatus('error');
        setMessage('Your payment was declined. Please try again with a different payment method.');
      } else {
        // Unknown status
        setStatus('error');
        setMessage('We could not determine the status of your payment. Please contact support.');
      }
    } catch (error) {
      console.error('Error processing payment result:', error);
      setStatus('error');
      setMessage('An error occurred while processing your payment. Please try again.');
    }
  };

  const getStatusContent = () => {
    switch (status) {
      case 'loading':
        return (
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-lg">Processing your payment...</p>
          </div>
        );
        
      case 'success':
        return (
          <div className="text-center">
            <div className="bg-green-100 text-green-800 p-4 rounded-lg mb-6">
              <svg className="w-12 h-12 text-green-500 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
              <h3 className="text-xl font-bold mb-2">Payment Successful!</h3>
              <p>{message}</p>
            </div>
            
            <div className="mb-6">
              <p className="text-sm text-gray-500 mb-1">Transaction Reference:</p>
              <p className="font-mono text-xs bg-gray-100 p-2 rounded">{reference}</p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={() => navigate('/journal')} 
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path>
                </svg>
                Start Journaling
              </button>
            </div>
          </div>
        );
        
      case 'error':
        return (
          <div className="text-center">
            <div className="bg-red-100 text-red-800 p-4 rounded-lg mb-6">
              <svg className="w-12 h-12 text-red-500 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
              <h3 className="text-xl font-bold mb-2">Payment Failed</h3>
              <p>{message}</p>
            </div>
            
            <button 
              onClick={() => navigate('/payment')} 
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        );
        
      case 'pending':
        return (
          <div className="text-center">
            <div className="bg-yellow-100 text-yellow-800 p-4 rounded-lg mb-6">
              <svg className="w-12 h-12 text-yellow-500 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <h3 className="text-xl font-bold mb-2">Payment Pending</h3>
              <p>{message}</p>
            </div>
            
            <div className="mb-6">
              <p className="text-sm text-gray-500 mb-1">Transaction Reference:</p>
              <p className="font-mono text-xs bg-gray-100 p-2 rounded">{reference}</p>
            </div>
            
            <button 
              onClick={() => navigate('/dashboard')} 
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Go to Dashboard
            </button>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
        <h1 className="text-2xl font-bold text-center mb-6">Payment Result</h1>
        {getStatusContent()}
      </div>
    </div>
  );
} 