import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../state-management/AuthContext';

// Admin-only emails that can access this page
const ADMIN_EMAILS = ['admin@innermaps.co', 'test@innermaps.co', 'manueldavic@hotmail.com'];

// TEMPORARY: Set this to false for production deployment
const BYPASS_ADMIN_CHECK = false;

export default function AdminLogin() {
  const { user, loading, signInWithEmail, error: authError } = useAuth();
  const navigate = useNavigate();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  console.log('AdminLogin - User:', user?.email);
  console.log('AdminLogin - Loading:', loading);
  console.log('AdminLogin - Admin Emails:', ADMIN_EMAILS);
  console.log('AdminLogin - BYPASS_ADMIN_CHECK:', BYPASS_ADMIN_CHECK);
  
  // Check if current user is already logged in and is an admin
  useEffect(() => {
    if (user && (BYPASS_ADMIN_CHECK || ADMIN_EMAILS.includes(user.email?.toLowerCase() || ''))) {
      console.log('AdminLogin - User is admin, redirecting to admin dashboard');
      navigate('/admin');
    }
  }, [user, navigate]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }
    
    const normalizedEmail = email.toLowerCase().trim();
    console.log('Checking admin access for:', normalizedEmail);
    console.log('Admin emails (lowercase):', ADMIN_EMAILS.map(e => e.toLowerCase()));
    
    // Skip admin email check if BYPASS_ADMIN_CHECK is true
    if (!BYPASS_ADMIN_CHECK && !ADMIN_EMAILS.map(e => e.toLowerCase()).includes(normalizedEmail)) {
      setError('This email does not have admin access');
      return;
    }
    
    setError(null);
    setIsSubmitting(true);
    
    try {
      await signInWithEmail(email, password);
      // The useEffect above will handle redirection if login is successful
    } catch (err) {
      console.error('Login error:', err);
      setError(authError || 'Failed to log in. Please check your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Admin Login
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Please sign in with your admin credentials
          </p>
        </div>
        
        {(error || authError) && (
          <div className="rounded-md bg-red-50 p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  {error || authError}
                </h3>
              </div>
            </div>
          </div>
        )}
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email-address" className="sr-only">
                Email address
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>
          
          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400"
            >
              {isSubmitting ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
          
          <div className="text-center">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="font-medium text-indigo-600 hover:text-indigo-500"
            >
              Return to Home
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 