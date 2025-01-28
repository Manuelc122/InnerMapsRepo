import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../utils/supabaseClient';

const getBasePath = () => {
  const isDevelopment = import.meta.env.DEV;
  return isDevelopment ? '' : 'https://innermaps.co';
};

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get URL parameters
        const params = new URLSearchParams(window.location.search);
        const plan = params.get('plan');
        const basePath = getBasePath();

        // Check for session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;

        if (session) {
          // If we have a plan, redirect to checkout
          if (plan) {
            window.location.href = `${basePath}/checkout/${plan}`;
          } else {
            // Otherwise go to journal
            window.location.href = `${basePath}/journal`;
          }
        } else {
          // No session found, redirect to login
          window.location.href = basePath || '/';
        }
      } catch (error) {
        console.error('Auth callback error:', error);
        window.location.href = getBasePath() || '/';
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600">Setting up your account...</p>
      </div>
    </div>
  );
} 