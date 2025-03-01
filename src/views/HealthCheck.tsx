import React from 'react';
import { useAuth } from '../state-management/AuthContext';
import { supabase } from '../utils/supabaseClient';
import { Link } from 'react-router-dom';
import { useUserName } from '../custom-hooks/useUserName';

export function HealthCheck() {
  const [supabaseStatus, setSupabaseStatus] = React.useState<'checking' | 'ok' | 'error'>('checking');
  const [error, setError] = React.useState<string | null>(null);
  const { user } = useAuth();
  const { firstName, isLoading: nameLoading } = useUserName();

  React.useEffect(() => {
    async function checkSupabase() {
      try {
        const { data, error } = await supabase.from('chat_sessions').select('count').limit(1);
        if (error) throw error;
        setSupabaseStatus('ok');
      } catch (err) {
        console.error('Supabase health check failed:', err);
        setSupabaseStatus('error');
        setError(err instanceof Error ? err.message : JSON.stringify(err));
      }
    }

    checkSupabase();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            {user && firstName && !nameLoading 
              ? `Hello, ${firstName}!` 
              : 'System Health Check'}
          </h2>
          {user && firstName && !nameLoading && (
            <p className="mt-2 text-sm text-gray-600">
              Welcome to your system health dashboard
            </p>
          )}
        </div>

        <div className="mt-8 bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900">Environment Variables</h3>
              <div className="mt-2">
                <p className="text-sm text-gray-500">
                  SUPABASE_URL: {import.meta.env.VITE_SUPABASE_URL ? '✅' : '❌'}
                </p>
                <p className="text-sm text-gray-500">
                  SUPABASE_ANON_KEY: {import.meta.env.VITE_SUPABASE_ANON_KEY ? '✅' : '❌'}
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900">Supabase Connection</h3>
              <div className="mt-2">
                <p className="text-sm text-gray-500">
                  Status: {' '}
                  {supabaseStatus === 'checking' && '🔄 Checking...'}
                  {supabaseStatus === 'ok' && '✅ Connected'}
                  {supabaseStatus === 'error' && '❌ Error'}
                </p>
                {error && (
                  <p className="mt-2 text-sm text-red-600">
                    Error: {error}
                  </p>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900">Authentication</h3>
              <div className="mt-2">
                <p className="text-sm text-gray-500">
                  Auth Status: {user ? '✅ Authenticated' : '➖ Not authenticated'}
                </p>
                {user && (
                  <p className="mt-1 text-sm text-gray-500">
                    User ID: {user.id}
                  </p>
                )}
                {user && firstName && (
                  <p className="mt-1 text-sm text-gray-500">
                    Profile: {firstName ? `✅ Found (${firstName})` : '❌ Not found'}
                  </p>
                )}
              </div>
            </div>

            <div className="mt-6 text-center">
              <p className="mb-4 text-red-600 font-medium">
                Authentication issues detected. Use the diagnostic tool to fix them:
              </p>
              <Link 
                to="/auth-diagnostic" 
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Run Authentication Diagnostic
              </Link>
              <p className="mt-4 text-sm text-gray-500">
                Or navigate directly to: <code className="bg-gray-100 px-1 py-0.5 rounded">http://localhost:5173/auth-diagnostic</code>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 