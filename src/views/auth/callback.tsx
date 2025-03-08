import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../utils/supabaseClient';
import { STRIPE_PRICE_IDS, redirectToPaymentLink } from '../../utils/stripeClient';

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
        const isNewUser = params.get('new_user') === 'true';
        const fromRegistration = params.get('from_registration') === 'true';
        const basePath = getBasePath();

        console.log('Auth callback params:', { plan, isNewUser, fromRegistration });
        console.log('Full URL:', window.location.href);
        console.log('Search params:', window.location.search);

        // Check for session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) {
          console.error('Session error:', sessionError);
          throw sessionError;
        }

        if (session) {
          console.log('Session found, user ID:', session.user.id);
          
          // If this is a new user or coming from registration, redirect directly to payment link
          if (isNewUser || fromRegistration) {
            const selectedPlan = (plan === 'monthly' || plan === 'yearly') ? plan : 'monthly';
            console.log('New user or from registration, redirecting to payment link for plan:', selectedPlan);
            
            // Redirect directly to the Stripe payment link
            redirectToPaymentLink(selectedPlan, session.user.id, session.user.email);
          } else {
            // For existing users without a plan, go to journal
            console.log('Existing user, no plan specified, redirecting to journal');
            navigate('/journal');
          }
        } else {
          // No session found, redirect to login
          console.log('No session found, redirecting to login');
          navigate('/');
        }
      } catch (error) {
        console.error('Auth callback error:', error);
        navigate('/');
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecting you to payment...</p>
        <p className="text-gray-500 text-sm mt-2">Check the browser console for debugging information</p>
      </div>
    </div>
  );
} 