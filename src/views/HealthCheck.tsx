import React from 'react';
import { useAuth } from '../state-management/AuthContext';
import { supabase } from '../utils/supabaseClient';

export function HealthCheck() {
  const [supabaseStatus, setSupabaseStatus] = React.useState<'checking' | 'ok' | 'error'>('checking');
  const [error, setError] = React.useState<string | null>(null);
  const { user } = useAuth();

  React.useEffect(() => {
    async function checkSupabase() {
      try {
        const { data, error } = await supabase.from('health_check').select('*').limit(1);
        if (error) throw error;
        setSupabaseStatus('ok');
      } catch (err) {
        console.error('Supabase health check failed:', err);
        setSupabaseStatus('error');
        setError(err instanceof Error ? err.message : 'Failed to connect to Supabase');
      }
    }

    checkSupabase();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            System Health Check
          </h2>
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
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 