import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from '../state-management/AuthContext';
import { SubscriptionProvider } from '../utils/subscriptions/SubscriptionContext';
import '../styles/globals.css';

function App({ children }: { children: React.ReactNode }) {
  return (
    <Router>
      <AuthProvider>
        <SubscriptionProvider>
          {children}
        </SubscriptionProvider>
      </AuthProvider>
    </Router>
  );
}

export default App; 