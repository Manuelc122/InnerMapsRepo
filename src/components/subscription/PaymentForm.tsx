import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { SUBSCRIPTION_PLANS } from '../types/database';

interface PaymentFormProps {
  planId: 'monthly' | 'yearly';
}

export function PaymentForm({ planId }: PaymentFormProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const plan = SUBSCRIPTION_PLANS[planId];

  // Initialize Wompi checkout when component mounts
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.wompi.co/widget.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const checkout = new (window as any).WidgetCheckout({
        currency: 'COP',
        amountInCents: planId === 'monthly' ? 1000000 : 10000000, // $10 or $100
        reference: `${Date.now()}`,
        publicKey: process.env.NEXT_PUBLIC_WOMPI_PUBLIC_KEY!,
        redirectUrl: `${window.location.origin}/subscription/callback`,
      });

      checkout.open((result: any) => {
        const { transaction } = result;
        if (transaction.status === 'APPROVED') {
          router.push('/subscription/success');
        } else {
          router.push('/subscription/error');
        }
      });
    } catch (error) {
      console.error('Payment error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="bg-white p-6 rounded-lg">
        <h2 className="text-xl font-bold mb-4">Complete Your Purchase</h2>
        <div className="mb-4">
          <p className="text-lg font-medium">Plan: {plan.name}</p>
          <p className="text-gray-600">Amount: {plan.price} {plan.period}</p>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-500 text-white rounded-lg px-4 py-2 hover:bg-blue-600 transition-colors disabled:opacity-50"
        >
          {loading ? 'Processing...' : 'Proceed to Payment'}
        </button>
      </div>
    </form>
  );
} 