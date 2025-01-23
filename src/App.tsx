import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './state-management/AuthContext';
import { LandingPage } from './views/LandingPage';
import { Dashboard } from './views/Dashboard';
import { LoadingSpinner } from './components/shared/LoadingSpinner';
import { useAuth } from './state-management/AuthContext';
import { AnalysisPage } from './views/AnalysisPage';
import { ChatPage } from './views/ChatPage';
import { AppLayout } from './components/Layout/AppLayout';
import AuthCallback from './views/auth/callback';

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

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <Routes>
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
        path="/analysis"
        element={
          <RequireAuth>
            <AnalysisPage />
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
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}