import React, { useState, useEffect } from 'react';
import { useAuth } from '../../state-management/AuthContext';
import { payuService } from '../../utils/payu';

interface SubscriptionFormProps {
  planAmount: number; // Amount in dollars (e.g., 10 for $10.00)
  planInterval: 'MONTH' | 'YEAR';
  planDescription: string;
  currency?: string;
  onSuccess?: (subscriptionId: string) => void;
  onError?: (error: Error) => void;
}

interface CreditCardFormData {
  cardNumber: string;
  expirationDate: string;
  cardholderName: string;
  cvv: string;
  documentNumber: string;
}

interface AddressFormData {
  street1: string;
  street2: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  phone: string;
}

export function SubscriptionForm({
  planAmount,
  planInterval,
  planDescription,
  currency = 'USD',
  onSuccess,
  onError
}: SubscriptionFormProps) {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<'card' | 'address' | 'confirm' | 'success'>('card');
  const [planCode, setPlanCode] = useState<string>('');
  const [subscriptionId, setSubscriptionId] = useState<string | null>(null);
  
  // Form data
  const [cardData, setCardData] = useState<CreditCardFormData>({
    cardNumber: '',
    expirationDate: '',
    cardholderName: '',
    cvv: '',
    documentNumber: ''
  });
  
  const [addressData, setAddressData] = useState<AddressFormData>({
    street1: '',
    street2: '',
    city: '',
    state: '',
    country: 'US',
    postalCode: '',
    phone: ''
  });
  
  // Success step redirect effect
  useEffect(() => {
    if (step === 'success') {
      // Remove the automatic redirect
      // const redirectTimer = setTimeout(() => {
      //   window.location.href = '/dashboard';
      // }, 5000);
      
      // return () => clearTimeout(redirectTimer);
    }
  }, [step]);
  
  // Create a unique plan code when component mounts
  useEffect(() => {
    const interval = planInterval === 'MONTH' ? 'monthly' : 'yearly';
    const amount = planAmount.toString().replace('.', '');
    const uniquePlanCode = `INNERMAPS_${interval}_${amount}_${Date.now()}`;
    setPlanCode(uniquePlanCode);
  }, [planAmount, planInterval]);
  
  // Handle credit card form input changes
  const handleCardInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCardData(prev => ({ ...prev, [name]: value }));
  };
  
  // Handle address form input changes
  const handleAddressInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setAddressData(prev => ({ ...prev, [name]: value }));
  };
  
  // Format credit card number with spaces
  const formatCardNumber = (value: string) => {
    return value
      .replace(/\s/g, '')
      .replace(/(\d{4})/g, '$1 ')
      .trim();
  };
  
  // Format expiration date (MM/YY)
  const formatExpirationDate = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{2})(\d)/, '$1/$2')
      .substring(0, 5);
  };
  
  // Handle credit card form submission
  const handleCardFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!cardData.cardNumber || !cardData.expirationDate || !cardData.cardholderName || !cardData.cvv) {
      setError('Please fill in all required fields');
      return;
    }
    
    // Credit card number validation (Luhn algorithm check)
    const cardNumberClean = cardData.cardNumber.replace(/\s/g, '');
    if (!isValidCreditCard(cardNumberClean)) {
      setError('Please enter a valid credit card number');
      return;
    }
    
    // CVV validation
    if (!/^\d{3,4}$/.test(cardData.cvv)) {
      setError('Please enter a valid CVV code (3 or 4 digits)');
      return;
    }
    
    // Expiration date validation
    const [month, year] = cardData.expirationDate.split('/');
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear() % 100; // Get last 2 digits
    const currentMonth = currentDate.getMonth() + 1; // January is 0
    
    if (!month || !year || parseInt(year) < currentYear || 
        (parseInt(year) === currentYear && parseInt(month) < currentMonth)) {
      setError('Please enter a valid expiration date');
      return;
    }
    
    // Document number validation
    if (!cardData.documentNumber || cardData.documentNumber.length < 5) {
      setError('Please enter a valid document number');
      return;
    }
    
    // Move to address step
    setError(null);
    setStep('address');
  };
  
  // Credit card validation using Luhn algorithm
  const isValidCreditCard = (cardNumber: string): boolean => {
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
  };
  
  // Handle address form submission
  const handleAddressFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!addressData.street1 || !addressData.city || !addressData.state || !addressData.postalCode) {
      setError('Please fill in all required fields');
      return;
    }
    
    // Move to confirmation step
    setError(null);
    setStep('confirm');
  };
  
  // Handle subscription creation
  const handleCreateSubscription = async () => {
    if (!user) {
      setError('You must be logged in to create a subscription');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Log the subscription attempt for debugging
      console.log('[SUBSCRIPTION] Creating subscription for user:', user.id);
      console.log('[SUBSCRIPTION] Plan details:', {
        planCode,
        planDescription,
        planAmount,
        currency,
        planInterval
      });
      console.log('[SUBSCRIPTION] TEST MODE ACTIVE - No actual charges will be made');
      
      // 1. Create a subscription plan
      const plan = await payuService.createSubscriptionPlan(
        planCode,
        planDescription,
        planAmount,
        currency,
        planInterval
      );
      console.log('[SUBSCRIPTION] Created plan:', plan);
      
      // 2. Create a customer
      const customer = await payuService.createCustomer(
        user.id,
        user.email || 'customer@example.com',
        cardData.cardholderName
      );
      console.log('[SUBSCRIPTION] Created customer:', customer);
      
      // 3. Create a credit card token
      // Convert MM/YY to YYYY/MM format
      const [month, year] = cardData.expirationDate.split('/');
      const formattedExpirationDate = `20${year}/${month}`;
      
      // Clean the card number before sending to PayU
      const cleanCardNumber = cardData.cardNumber.replace(/\s/g, '');
      
      const creditCardToken = await payuService.createCreditCardToken(
        customer.id,
        cleanCardNumber,
        formattedExpirationDate,
        cardData.cardholderName,
        cardData.documentNumber
      );
      // Removed console.log with sensitive information
      
      // 4. Create the subscription
      const deliveryAddress = {
        street1: addressData.street1,
        street2: addressData.street2,
        city: addressData.city,
        state: addressData.state,
        country: addressData.country,
        postalCode: addressData.postalCode,
        phone: addressData.phone
      };
      
      const subscription = await payuService.createSubscription(
        planCode,
        customer.id,
        creditCardToken.creditCardTokenId,
        deliveryAddress
      );
      console.log('[SUBSCRIPTION] Created subscription:', subscription);
      console.log('[SUBSCRIPTION] TEST MODE - No actual charge was made to your card');
      
      // Store the subscription ID
      setSubscriptionId(subscription.id);
      
      // Move to success step
      setStep('success');
      
      // Call onSuccess callback if provided
      if (onSuccess) {
        onSuccess(subscription.id);
      }
    } catch (error) {
      console.error('[SUBSCRIPTION] Error creating subscription:', error);
      
      // Handle specific PayU error codes
      if (error instanceof Error) {
        const errorMessage = error.message;
        
        if (errorMessage.includes('invalid_card')) {
          setError('The credit card information is invalid. Please check your card details and try again.');
        } else if (errorMessage.includes('insufficient_funds')) {
          setError('Your card has insufficient funds. Please use a different card.');
        } else if (errorMessage.includes('card_declined')) {
          setError('Your card was declined. Please use a different card or contact your bank.');
        } else if (errorMessage.includes('expired_card')) {
          setError('Your card has expired. Please use a different card.');
        } else {
          setError(`Failed to create subscription: ${errorMessage}`);
        }
      } else {
        setError('An unexpected error occurred. Please try again later.');
      }
      
      // Call onError callback if provided
      if (onError && error instanceof Error) {
        onError(error);
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  // Render credit card form
  const renderCardForm = () => (
    <form onSubmit={handleCardFormSubmit} className="space-y-4">
      <h2 className="text-xl font-semibold mb-4 bg-gradient-to-r from-[#6C63FF] to-[#9D4EDD] bg-clip-text text-transparent">Payment Information</h2>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Card Number
        </label>
        <input
          type="text"
          name="cardNumber"
          value={formatCardNumber(cardData.cardNumber)}
          onChange={handleCardInputChange}
          placeholder="1234 5678 9012 3456"
          maxLength={19}
          className="w-full p-2 border border-indigo-200 rounded focus:ring-2 focus:ring-indigo-300 focus:border-indigo-500 transition bg-white/80"
          required
        />
        <p className="text-xs text-gray-500 mt-1">
          Enter a valid credit card number. We accept Visa, Mastercard, American Express, and Discover.
        </p>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Expiration Date
          </label>
          <input
            type="text"
            name="expirationDate"
            value={formatExpirationDate(cardData.expirationDate)}
            onChange={handleCardInputChange}
            placeholder="MM/YY"
            maxLength={5}
            className="w-full p-2 border border-indigo-200 rounded focus:ring-2 focus:ring-indigo-300 focus:border-indigo-500 transition bg-white/80"
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            Enter the expiration date in MM/YY format.
          </p>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            CVV
          </label>
          <input
            type="text"
            name="cvv"
            value={cardData.cvv}
            onChange={handleCardInputChange}
            placeholder="123"
            maxLength={4}
            className="w-full p-2 border border-indigo-200 rounded focus:ring-2 focus:ring-indigo-300 focus:border-indigo-500 transition bg-white/80"
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            3-4 digits on the back of your card.
          </p>
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Cardholder Name
        </label>
        <input
          type="text"
          name="cardholderName"
          value={cardData.cardholderName}
          onChange={handleCardInputChange}
          placeholder="John Doe"
          className="w-full p-2 border border-indigo-200 rounded focus:ring-2 focus:ring-indigo-300 focus:border-indigo-500 transition bg-white/80"
          required
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Document Number (ID/Passport)
        </label>
        <input
          type="text"
          name="documentNumber"
          value={cardData.documentNumber}
          onChange={handleCardInputChange}
          placeholder="123456789"
          className="w-full p-2 border border-indigo-200 rounded focus:ring-2 focus:ring-indigo-300 focus:border-indigo-500 transition bg-white/80"
          required
        />
        <p className="text-xs text-gray-500 mt-1">
          Required for payment verification. Your ID or passport number.
        </p>
      </div>
      
      <div className="bg-indigo-50/80 backdrop-blur-sm p-3 rounded-lg mt-4 border border-indigo-100">
        <p className="text-sm text-indigo-700 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span><strong>Secure Payment:</strong> Your payment information is securely processed by PayU. Your credit card details are never stored on our servers.</span>
        </p>
      </div>
      
      <div className="pt-4">
        <button
          type="submit"
          className="w-full bg-gradient-to-r from-[#6C63FF] to-[#9D4EDD] text-white py-2 px-4 rounded-md hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition shadow-sm"
          disabled={isLoading}
        >
          {isLoading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </span>
          ) : (
            'Continue'
          )}
        </button>
      </div>
    </form>
  );
  
  // Render address form
  const renderAddressForm = () => (
    <form onSubmit={handleAddressFormSubmit} className="space-y-4">
      <h2 className="text-xl font-semibold mb-4 bg-gradient-to-r from-[#6C63FF] to-[#9D4EDD] bg-clip-text text-transparent">Billing Address</h2>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Street Address
        </label>
        <input
          type="text"
          name="street1"
          value={addressData.street1}
          onChange={handleAddressInputChange}
          placeholder="123 Main St"
          className="w-full p-2 border border-indigo-200 rounded focus:ring-2 focus:ring-indigo-300 focus:border-indigo-500 transition bg-white/80"
          required
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Apartment, Suite, etc. (optional)
        </label>
        <input
          type="text"
          name="street2"
          value={addressData.street2}
          onChange={handleAddressInputChange}
          placeholder="Apt 4B"
          className="w-full p-2 border border-indigo-200 rounded focus:ring-2 focus:ring-indigo-300 focus:border-indigo-500 transition bg-white/80"
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            City
          </label>
          <input
            type="text"
            name="city"
            value={addressData.city}
            onChange={handleAddressInputChange}
            placeholder="New York"
            className="w-full p-2 border border-indigo-200 rounded focus:ring-2 focus:ring-indigo-300 focus:border-indigo-500 transition bg-white/80"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            State/Province
          </label>
          <input
            type="text"
            name="state"
            value={addressData.state}
            onChange={handleAddressInputChange}
            placeholder="NY"
            className="w-full p-2 border border-indigo-200 rounded focus:ring-2 focus:ring-indigo-300 focus:border-indigo-500 transition bg-white/80"
            required
          />
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Country
          </label>
          <input
            type="text"
            name="country"
            value={addressData.country}
            onChange={handleAddressInputChange}
            placeholder="United States"
            className="w-full p-2 border border-indigo-200 rounded focus:ring-2 focus:ring-indigo-300 focus:border-indigo-500 transition bg-white/80"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Postal Code
          </label>
          <input
            type="text"
            name="postalCode"
            value={addressData.postalCode}
            onChange={handleAddressInputChange}
            placeholder="10001"
            className="w-full p-2 border border-indigo-200 rounded focus:ring-2 focus:ring-indigo-300 focus:border-indigo-500 transition bg-white/80"
            required
          />
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Phone Number
        </label>
        <input
          type="tel"
          name="phone"
          value={addressData.phone}
          onChange={handleAddressInputChange}
          placeholder="+1 (555) 123-4567"
          className="w-full p-2 border border-indigo-200 rounded focus:ring-2 focus:ring-indigo-300 focus:border-indigo-500 transition bg-white/80"
          required
        />
      </div>
      
      <div className="pt-4 flex justify-between">
        <button
          type="button"
          onClick={() => setStep('card')}
          className="px-4 py-2 border border-indigo-200 rounded-md text-gray-700 bg-white/80 hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition"
        >
          Back
        </button>
        
        <button
          type="submit"
          className="bg-gradient-to-r from-[#6C63FF] to-[#9D4EDD] text-white py-2 px-4 rounded-md hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition shadow-sm"
          disabled={isLoading}
        >
          {isLoading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </span>
          ) : (
            'Continue'
          )}
        </button>
      </div>
    </form>
  );
  
  // Render confirmation step
  const renderConfirmation = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold mb-4 bg-gradient-to-r from-[#6C63FF] to-[#9D4EDD] bg-clip-text text-transparent">Confirm Subscription</h2>
      
      <div className="bg-white/90 backdrop-blur-sm p-4 rounded-lg border border-indigo-100 shadow-sm">
        <h3 className="font-medium text-gray-800 mb-2">Subscription Details</h3>
        <p className="text-sm text-gray-700 mb-1"><span className="font-medium">Plan:</span> {planDescription}</p>
        <p className="text-sm text-gray-700 mb-1"><span className="font-medium">Amount:</span> ${planAmount.toFixed(2)} {currency}</p>
        <p className="text-sm text-gray-700 mb-1"><span className="font-medium">Billing Cycle:</span> {planInterval === 'MONTH' ? 'Monthly' : 'Yearly'}</p>
        <p className="text-sm text-gray-700 mb-1"><span className="font-medium">First Billing Date:</span> Today</p>
        <p className="text-sm text-gray-700 mb-1"><span className="font-medium">Next Billing Date:</span> {getNextBillingDate()}</p>
      </div>
      
      <div className="bg-white/90 backdrop-blur-sm p-4 rounded-lg border border-indigo-100 shadow-sm">
        <h3 className="font-medium text-gray-800 mb-2">Payment Method</h3>
        <p className="text-sm text-gray-700 mb-1">
          <span className="font-medium">{getCardType(cardData.cardNumber)}:</span> •••• {cardData.cardNumber.slice(-4)}
        </p>
        <p className="text-sm text-gray-700 mb-1"><span className="font-medium">Expiration Date:</span> {cardData.expirationDate}</p>
        <p className="text-sm text-gray-700 mb-1"><span className="font-medium">Cardholder:</span> {cardData.cardholderName}</p>
      </div>
      
      <div className="bg-white/90 backdrop-blur-sm p-4 rounded-lg border border-indigo-100 shadow-sm">
        <h3 className="font-medium text-gray-800 mb-2">Billing Address</h3>
        <p className="text-sm text-gray-700">{addressData.street1}</p>
        {addressData.street2 && <p className="text-sm text-gray-700">{addressData.street2}</p>}
        <p className="text-sm text-gray-700">{addressData.city}, {addressData.state} {addressData.postalCode}</p>
        <p className="text-sm text-gray-700">{addressData.country}</p>
        <p className="text-sm text-gray-700">{addressData.phone}</p>
      </div>
      
      <div className="bg-indigo-50/80 backdrop-blur-sm p-4 rounded-lg border border-indigo-100">
        <h3 className="font-medium text-indigo-800 mb-2">Subscription Terms</h3>
        <ul className="text-sm text-indigo-700 list-disc pl-5 space-y-1">
          <li>You will be billed ${planAmount.toFixed(2)} {currency} {planInterval === 'MONTH' ? 'monthly' : 'yearly'}.</li>
          <li>Your subscription will automatically renew until you cancel.</li>
          <li>You can cancel your subscription at any time from your account settings.</li>
          <li>No refunds will be issued for partial subscription periods.</li>
        </ul>
      </div>
      
      <div className="pt-4 flex justify-between">
        <button
          type="button"
          onClick={() => setStep('address')}
          className="px-4 py-2 border border-indigo-200 rounded-md text-gray-700 bg-white/80 hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition"
        >
          Back
        </button>
        
        <button
          type="button"
          onClick={handleCreateSubscription}
          className="bg-gradient-to-r from-[#6C63FF] to-[#9D4EDD] text-white py-2 px-4 rounded-md hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition shadow-sm"
          disabled={isLoading}
        >
          {isLoading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </span>
          ) : (
            'Subscribe Now'
          )}
        </button>
      </div>
    </div>
  );
  
  // Get the next billing date
  const getNextBillingDate = (): string => {
    const today = new Date();
    let nextBillingDate: Date;
    
    if (planInterval === 'MONTH') {
      nextBillingDate = new Date(today.getFullYear(), today.getMonth() + 1, today.getDate());
    } else {
      nextBillingDate = new Date(today.getFullYear() + 1, today.getMonth(), today.getDate());
    }
    
    return nextBillingDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  // Get card type based on card number
  const getCardType = (cardNumber: string): string => {
    // Remove all non-digit characters
    const digits = cardNumber.replace(/\s/g, '');
    
    // Check card type based on the first few digits
    if (/^4/.test(digits)) {
      return 'Visa';
    } else if (/^5[1-5]/.test(digits)) {
      return 'Mastercard';
    } else if (/^3[47]/.test(digits)) {
      return 'American Express';
    } else if (/^6(?:011|5)/.test(digits)) {
      return 'Discover';
    } else {
      return 'Card';
    }
  };
  
  // Render success step
  const renderSuccess = () => {
    return (
    <div className="text-center space-y-4">
      <div className="text-green-500 mb-4">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>
      
      <h2 className="text-2xl font-bold bg-gradient-to-r from-[#6C63FF] to-[#9D4EDD] bg-clip-text text-transparent">Subscription Created!</h2>
      
      <p className="text-gray-600">
        Your subscription has been successfully created. You will be charged ${planAmount.toFixed(2)} {currency} {planInterval === 'MONTH' ? 'monthly' : 'yearly'}.
      </p>
      
      <div className="bg-yellow-50/80 backdrop-blur-sm p-4 rounded-lg border border-yellow-100 text-left mt-4">
        <h3 className="font-medium text-yellow-800 mb-2">Test Mode Notice</h3>
        <p className="text-sm text-yellow-700">
          This is running in test mode. No actual charges have been made to your card.
          In production, your card would be charged ${planAmount.toFixed(2)} {currency}.
        </p>
      </div>
      
      <div className="bg-white/90 backdrop-blur-sm p-4 rounded-lg border border-indigo-100 shadow-sm text-left mt-4">
        <h3 className="font-medium text-gray-800 mb-2 bg-gradient-to-r from-[#6C63FF] to-[#9D4EDD] bg-clip-text text-transparent">Subscription Details</h3>
        <p className="text-sm text-gray-700 mb-1"><span className="font-medium">Plan:</span> {planDescription}</p>
        <p className="text-sm text-gray-700 mb-1"><span className="font-medium">Amount:</span> ${planAmount.toFixed(2)} {currency}</p>
        <p className="text-sm text-gray-700 mb-1"><span className="font-medium">Billing Cycle:</span> {planInterval === 'MONTH' ? 'Monthly' : 'Yearly'}</p>
        <p className="text-sm text-gray-700 mb-1"><span className="font-medium">Next Billing Date:</span> {getNextBillingDate()}</p>
        <p className="text-sm text-gray-700 mb-1"><span className="font-medium">Payment Method:</span> {getCardType(cardData.cardNumber)} •••• {cardData.cardNumber.slice(-4)}</p>
        <p className="text-sm text-gray-700 mb-1"><span className="font-medium">Subscription ID:</span> <span className="font-mono">{subscriptionId}</span></p>
      </div>
      
      <div className="bg-indigo-50/80 backdrop-blur-sm p-4 rounded-lg border border-indigo-100 text-left mt-4">
        <h3 className="font-medium text-indigo-800 mb-2">What's Next?</h3>
        <ul className="text-sm text-indigo-700 list-disc pl-5 space-y-1">
          <li>You now have full access to all InnerMaps premium features.</li>
          <li>Your subscription will automatically renew on {getNextBillingDate()}.</li>
          <li>You can manage your subscription from your account settings at any time.</li>
          <li>If you have any questions, please contact our support team at support@innermaps.com.</li>
        </ul>
      </div>
      
      <div className="pt-6">
        <p className="text-sm text-gray-500 mb-3 text-center">Click the button below to start journaling:</p>
        <div className="flex justify-center">
          <button
            type="button"
            onClick={() => {
              // Use navigate instead of window.location to prevent full page reload
              window.location.href = '/journal';
            }}
            className="bg-gradient-to-r from-[#6C63FF] to-[#9D4EDD] text-white py-2 px-6 rounded-md hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition shadow-sm flex items-center justify-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path>
            </svg>
            Start Journaling
          </button>
        </div>
      </div>
    </div>
    );
  };
  
  return (
    <div className="max-w-md mx-auto bg-white/90 backdrop-blur-sm p-6 rounded-lg shadow-md border border-indigo-100">
      {/* Error message */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-600">
          {error}
        </div>
      )}
      
      {/* Progress steps */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div className={`flex flex-col items-center ${step === 'card' ? 'text-indigo-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 flex items-center justify-center rounded-full ${step === 'card' ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
              1
            </div>
            <span className="text-xs mt-1">Payment</span>
          </div>
          
          <div className={`flex-1 h-1 mx-2 ${step === 'card' ? 'bg-gray-200' : 'bg-gradient-to-r from-blue-600 to-indigo-600'}`}></div>
          
          <div className={`flex flex-col items-center ${step === 'address' ? 'text-indigo-600' : (step === 'card' ? 'text-gray-400' : 'text-gray-400')}`}>
            <div className={`w-8 h-8 flex items-center justify-center rounded-full ${step === 'address' ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white' : (step === 'card' ? 'bg-gray-200 text-gray-600' : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white')}`}>
              2
            </div>
            <span className="text-xs mt-1">Address</span>
          </div>
          
          <div className={`flex-1 h-1 mx-2 ${step === 'confirm' || step === 'success' ? 'bg-gradient-to-r from-blue-600 to-indigo-600' : 'bg-gray-200'}`}></div>
          
          <div className={`flex flex-col items-center ${step === 'confirm' || step === 'success' ? 'text-indigo-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 flex items-center justify-center rounded-full ${step === 'confirm' || step === 'success' ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
              3
            </div>
            <span className="text-xs mt-1">Confirm</span>
          </div>
        </div>
      </div>
      
      {/* Form content based on current step */}
      {step === 'card' && renderCardForm()}
      {step === 'address' && renderAddressForm()}
      {step === 'confirm' && renderConfirmation()}
      {step === 'success' && renderSuccess()}
    </div>
  );
} 