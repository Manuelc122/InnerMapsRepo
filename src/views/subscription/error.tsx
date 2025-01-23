import { useRouter } from 'next/router';
import { AlertCircle } from 'lucide-react';

export default function SubscriptionErrorPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="flex justify-center mb-6">
            <AlertCircle className="w-16 h-16 text-red-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Payment Failed
          </h1>
          <p className="text-gray-600 mb-6">
            We were unable to process your payment. Please try again or contact support if the problem persists.
          </p>
          <div className="space-y-4">
            <button
              onClick={() => router.back()}
              className="w-full bg-blue-500 text-white rounded-lg px-4 py-2 hover:bg-blue-600 transition-colors"
            >
              Try Again
            </button>
            <button
              onClick={() => router.push('/support')}
              className="w-full border-2 border-gray-300 text-gray-700 rounded-lg px-4 py-2 hover:bg-gray-50 transition-colors"
            >
              Contact Support
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 