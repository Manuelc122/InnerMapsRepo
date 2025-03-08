import React from 'react';
import StripeCheckoutDisplay from '../../components/subscription/StripeCheckoutDisplay';

export default function CancelPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
      <StripeCheckoutDisplay />
    </div>
  );
} 