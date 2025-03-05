import React, { useEffect, useState } from 'react';
import { useAuth } from '../../state-management/AuthContext';

interface WompiButtonProps {
  amount: number; // Amount in cents (e.g., 1200 for $12.00)
  reference: string;
  redirectUrl: string;
  buttonText?: string;
  className?: string;
  autoOpen?: boolean; // New prop to control auto-opening
  onPaymentOpen?: () => void; // Callback when payment is opened
}

declare global {
  interface Window {
    WompiWidget?: {
      render: (element: HTMLElement, options: any) => void;
      open: (options: any) => void;
    };
    WidgetCheckout?: any;
  }
}

export function WompiButton({
  amount,
  reference,
  redirectUrl,
  buttonText = 'Pay Now',
  className = '',
  autoOpen = false,
  onPaymentOpen
}: WompiButtonProps) {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [hasAttemptedPayment, setHasAttemptedPayment] = useState(false);
  const publicKey = import.meta.env.VITE_WOMPI_PUBLIC_KEY || 'pub_prod_7JHIbZu0Hm0WR7RVdgXJiNQtLwAaWwXo';

  // Direct form submission to Wompi
  const handlePayment = () => {
    if (isLoading) return;
    
    console.log('Initiating payment with reference:', reference);
    setIsLoading(true);
    setHasAttemptedPayment(true);
    
    // Call the onPaymentOpen callback if provided
    if (onPaymentOpen) {
      console.log('Calling onPaymentOpen callback');
      onPaymentOpen();
    }
    
    try {
      // Create a form element
      const form = document.createElement('form');
      form.method = 'GET';
      form.action = 'https://checkout.wompi.co/p/';
      
      // Add the necessary fields
      const addField = (name: string, value: string) => {
        const field = document.createElement('input');
        field.type = 'hidden';
        field.name = name;
        field.value = value;
        form.appendChild(field);
      };
      
      // Add all required fields
      addField('public-key', publicKey);
      addField('currency', 'COP'); // Keep using COP as the currency
      addField('amount-in-cents', amount.toString());
      addField('reference', reference);
      addField('redirect-url', redirectUrl);
      
      // Set language to English
      addField('lang', 'en');
      
      // Only allow card payments
      addField('payment-methods-enabled', 'CARD');
      
      if (user) {
        addField('customer-data:email', user.email || '');
        addField('customer-data:full-name', user.user_metadata?.full_name || '');
      }
      
      console.log('Submitting payment form to Wompi with COP amount:', amount);
      
      // Append the form to the body and submit it
      document.body.appendChild(form);
      form.submit();
      
      // Remove the form after submission
      setTimeout(() => {
        document.body.removeChild(form);
        setIsLoading(false);
      }, 100);
    } catch (error) {
      console.error('Error submitting payment form:', error);
      setIsLoading(false);
    }
  };
  
  // Auto-open the payment if requested
  useEffect(() => {
    if (autoOpen && !hasAttemptedPayment) {
      console.log('Auto-opening payment...');
      // Add a small delay to ensure everything is loaded
      const timer = setTimeout(() => {
        handlePayment();
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [autoOpen, hasAttemptedPayment]);
  
  return (
    <div className={`wompi-button-container ${className}`} data-testid="wompi-button">
      <button 
        onClick={handlePayment}
        disabled={isLoading}
        className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
      >
        {isLoading ? 'Opening Payment...' : buttonText}
      </button>
    </div>
  );
} 