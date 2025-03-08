import React, { useEffect, useState, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
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
import { supabase } from './utils/supabaseClient';
import AdminDashboard from './views/admin/AdminDashboard';
import { ExemptUsersAdmin } from './views/admin/ExemptUsers';
import PaymentSuccessPage from './views/payment/success';
import PaymentCancelPage from './views/payment/cancel';
import { SubscriptionProvider, useSubscription } from './state-management/SubscriptionContext';
import AdminLogin from './views/admin/AdminLogin';

// Lazy load the checkout components
const CheckoutPage = lazy(() => import('./views/checkout/[plan]'));
const SuccessPage = lazy(() => import('./views/checkout/success'));
const CancelPage = lazy(() => import('./views/checkout/cancel'));

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const { hasActiveSubscription, isLoading: subscriptionLoading } = useSubscription();
  const navigate = useNavigate();

  // Restore the redirection to subscription page for users without active subscriptions
  useEffect(() => {
    // If user is logged in but hasn't made a payment, redirect to subscription page
    if (user && hasActiveSubscription === false && !subscriptionLoading) {
      console.log('User has no active subscription, redirecting to subscription page');
      navigate('/subscription');
    }
  }, [user, hasActiveSubscription, subscriptionLoading, navigate]);

  if (authLoading || subscriptionLoading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <Navigate to="/" />;
  }

  // Only render children if user has an active subscription
  if (hasActiveSubscription) {
    return <AppLayout>{children}</AppLayout>;
  }
  
  // If user hasn't made a payment, show loading while redirecting
  return <LoadingSpinner />;
}

function AppRoutes() {
  const { user, loading } = useAuth();
  const { hasActiveSubscription, isLoading: subscriptionLoading } = useSubscription();

  if (loading || subscriptionLoading) {
    return <LoadingSpinner />;
  }

  return (
    <UserNameProvider>
      <Routes>
        <Route path="/health" element={<HealthCheck />} />
        <Route path="/auth-diagnostic" element={<AuthDiagnostic />} />
        <Route path="/diagnostic" element={<AuthDiagnostic />} />
        <Route path="/memory-diagnostic" element={<MemoryDiagnostic />} />
        <Route 
          path="/" 
          element={
            user 
              ? (hasActiveSubscription 
                  ? <Navigate to="/journal" /> 
                  : <Navigate to="/subscription" />)
              : <LandingPage />
          } 
        />
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
        {/* Admin Routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={user ? <AdminDashboard /> : <Navigate to="/admin/login" />} />
        <Route path="/admin/exempt-users" element={user ? <ExemptUsersAdmin /> : <Navigate to="/admin/login" />} />
        
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
        <Route 
          path="/checkout/:plan" 
          element={
            user ? (
              <Suspense fallback={<LoadingSpinner />}>
                <CheckoutPage />
              </Suspense>
            ) : <Navigate to="/" />
          } 
        />
        <Route 
          path="/success" 
          element={
            user ? (
              <Suspense fallback={<LoadingSpinner />}>
                <SuccessPage />
              </Suspense>
            ) : <Navigate to="/" />
          } 
        />
        <Route 
          path="/cancel" 
          element={
            <Suspense fallback={<LoadingSpinner />}>
              <CancelPage />
            </Suspense>
          } 
        />
        <Route path="/payment/success" element={<PaymentSuccessPage />} />
        <Route path="/payment/cancel" element={<PaymentCancelPage />} />
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
        <SubscriptionProvider>
          <AppRoutes />
        </SubscriptionProvider>
      </Router>
    </Provider>
  );
}