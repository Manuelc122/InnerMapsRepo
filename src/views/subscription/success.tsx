import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { CheckCircle } from 'lucide-react';

export default function SubscriptionSuccessPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to dashboard after 5 seconds
    const timeout = setTimeout(() => {
      router.push('/app');
    }, 5000);

    return () => clearTimeout(timeout);
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="flex justify-center mb-6">
            <CheckCircle className="w-16 h-16 text-green-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Payment Successful!
          </h1>
          <p className="text-gray-600 mb-6">
            Thank you for subscribing. Your payment has been processed successfully.
          </p>
          <p className="text-sm text-gray-500 mb-6">
            You will be redirected to the dashboard in a few seconds...
          </p>
          <button
            onClick={() => router.push('/app')}
            className="w-full bg-blue-500 text-white rounded-lg px-4 py-2 hover:bg-blue-600 transition-colors"
          >
            Go to Dashboard Now
          </button>
        </div>
      </div>
    </div>
  );
} 