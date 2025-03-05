import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store/store';
import './styles/markdown.css';
import { LandingPage } from './views/LandingPage';
import { Dashboard } from './views/Dashboard';
import { CoachChat } from './views/CoachChat';
import { LoadingSpinner } from './components/shared/LoadingSpinner';
import { useAuth } from './state-management/AuthContext';
import { AppLayout } from './components/Layout/AppLayout';
import { HealthCheck } from './views/HealthCheck';
import { AuthDiagnostic } from './views/AuthDiagnostic';
import { MemoryDiagnostic } from './views/MemoryDiagnostic';
import AuthCallback from './views/auth/callback';
import { Toaster } from 'react-hot-toast';
import { MemoryManager } from './components/Memory/MemoryManager';
import { ProfileSection } from './components/Profile/ProfileSection';
import { UserNameProvider } from './state-management/UserNameContext';
import PaymentResultPage from './pages/PaymentResultPage';
import DirectPaymentPage from './views/payment/DirectPaymentPage';
import SubscriptionPage from './views/payment/SubscriptionPage';
import SubscriptionManagementPage from './views/account/SubscriptionManagementPage';
import { supabase } from './utils/supabase';

// Check if user has made a payment
const useHasPayment = (userId: string | undefined) => {
  const [hasPayment, setHasPayment] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkPayment = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }

      try {
        // Check if the user has an active subscription
        const { data, error } = await supabase
          .rpc('has_active_subscription', {
            user_id: userId
          });
        
        if (error) {
          console.error('Error checking subscription status:', error);
          setHasPayment(false);
        } else {
          setHasPayment(!!data); // Convert to boolean
        }
      } catch (error) {
        console.error('Error checking payment status:', error);
        setHasPayment(false);
      } finally {
        setLoading(false);
      }
    };

    checkPayment();
  }, [userId]);

  return { hasPayment, loading };
};

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const { hasPayment, loading: paymentLoading } = useHasPayment(user?.id);
  const navigate = useNavigate();

  useEffect(() => {
    // If user is logged in but hasn't made a payment, redirect to subscription page
    // Temporarily commented out for testing
    /*
    if (user && hasPayment === false && !paymentLoading) {
      navigate('/subscription');
    }
    */
  }, [user, hasPayment, paymentLoading, navigate]);

  if (authLoading || paymentLoading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <Navigate to="/" />;
  }

  // Always render children for testing purposes
  return <AppLayout>{children}</AppLayout>;

  // Original code:
  // // If user has made a payment or we're still checking, render the children
  // if (hasPayment === true || hasPayment === null) {
  //   return <AppLayout>{children}</AppLayout>;
  // }
  //
  // // If user hasn't made a payment, show loading while redirecting
  // return <LoadingSpinner />;
}

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <UserNameProvider>
      <Routes>
        <Route path="/health" element={<HealthCheck />} />
        <Route path="/auth-diagnostic" element={<AuthDiagnostic />} />
        <Route path="/diagnostic" element={<AuthDiagnostic />} />
        <Route path="/memory-diagnostic" element={<MemoryDiagnostic />} />
        <Route path="/" element={user ? <Navigate to="/journal" /> : <LandingPage />} />
        <Route path="/landing" element={<LandingPage />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route
          path="/journal"
          element={
            <RequireAuth>
              <Dashboard />
            </RequireAuth>
          }
        />
        <Route
          path="/coach"
          element={
            <RequireAuth>
              <CoachChat />
            </RequireAuth>
          }
        />
        <Route
          path="/memory"
          element={
            <RequireAuth>
              <MemoryManager />
            </RequireAuth>
          }
        />
        <Route
          path="/profile"
          element={
            <RequireAuth>
              <div className="container mx-auto p-4 max-w-3xl">
                <ProfileSection />
              </div>
            </RequireAuth>
          }
        />
        <Route path="/payment/result" element={<PaymentResultPage />} />
        <Route 
          path="/payment/direct" 
          element={
            user ? <DirectPaymentPage /> : <Navigate to="/" />
          } 
        />
        <Route 
          path="/subscription" 
          element={
            user ? <SubscriptionPage /> : <Navigate to="/" />
          } 
        />
        <Route 
          path="/account/subscription" 
          element={
            user ? <SubscriptionManagementPage /> : <Navigate to="/" />
          } 
        />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </UserNameProvider>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <Router>
        <Toaster position="top-right" />
        <AppRoutes />
      </Router>
    </Provider>
  );
}