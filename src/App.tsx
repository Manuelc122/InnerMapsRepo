import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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
    <UserNameProvider>
      <Routes>
        <Route path="/health" element={<HealthCheck />} />
        <Route path="/auth-diagnostic" element={<AuthDiagnostic />} />
        <Route path="/diagnostic" element={<AuthDiagnostic />} />
        <Route path="/memory-diagnostic" element={<MemoryDiagnostic />} />
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