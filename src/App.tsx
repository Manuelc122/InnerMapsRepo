import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store/store';
import './styles/markdown.css';
import { LandingPage } from './views/LandingPage';
import { Dashboard } from './views/Dashboard';
import { LoadingSpinner } from './components/shared/LoadingSpinner';
import { useAuth } from './state-management/AuthContext';
import { ChatPage } from './views/ChatPage';
import { AppLayout } from './components/Layout/AppLayout';
import { HealthCheck } from './views/HealthCheck';
import AuthCallback from './views/auth/callback';
import { Toaster } from 'react-hot-toast';
import { checkSupabaseConnection } from './utils/supabaseClient';

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <Navigate to="/" />;
  }

  return <AppLayout>{children}</AppLayout>;
}

function AppRoutes() {
  const { user, loading } = useAuth();

  useEffect(() => {
    const verifyConnection = async () => {
      try {
        console.log('Verifying database connection...');
        const isConnected = await checkSupabaseConnection();
        if (!isConnected) {
          console.error('Failed to connect to database');
          return;
        }
      } catch (error) {
        console.error('Error during database verification:', error);
      }
    };

    verifyConnection();
  }, []);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <Routes>
      <Route path="/health" element={<HealthCheck />} />
      <Route path="/" element={user ? <Navigate to="/journal" /> : <LandingPage />} />
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
        path="/chat"
        element={
          <RequireAuth>
            <ChatPage />
          </RequireAuth>
        }
      />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
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