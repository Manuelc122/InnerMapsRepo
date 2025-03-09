import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../state-management/AuthContext';

// Admin-only emails that can access this page
const ADMIN_EMAILS = ['admin@innermaps.co', 'test@innermaps.co', 'manueldavic@hotmail.com'];

// TEMPORARY: Set these to false for production deployment
const BYPASS_AUTH_FOR_TESTING = false;
const BYPASS_ADMIN_CHECK = false;

export default function AdminDashboard() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  
  console.log('AdminDashboard - User:', user?.email);
  console.log('AdminDashboard - Loading:', loading);
  console.log('AdminDashboard - BYPASS_AUTH_FOR_TESTING:', BYPASS_AUTH_FOR_TESTING);
  console.log('AdminDashboard - BYPASS_ADMIN_CHECK:', BYPASS_ADMIN_CHECK);
  console.log('AdminDashboard - Admin Emails:', ADMIN_EMAILS);
  
  // Check if current user is an admin
  const userEmailLower = user?.email?.toLowerCase() || '';
  const adminEmailsLower = ADMIN_EMAILS.map(email => email.toLowerCase());
  const isAdmin = BYPASS_AUTH_FOR_TESTING || BYPASS_ADMIN_CHECK || (user?.email && adminEmailsLower.includes(userEmailLower));
  
  console.log('AdminDashboard - User Email (lowercase):', userEmailLower);
  console.log('AdminDashboard - Admin Emails (lowercase):', adminEmailsLower);
  console.log('AdminDashboard - Is Admin:', isAdmin);
  
  useEffect(() => {
    // Skip authentication checks if bypassing auth for testing
    if (BYPASS_AUTH_FOR_TESTING) {
      console.log('AdminDashboard - Bypassing authentication for testing');
      return;
    }
    
    // Redirect to login if not logged in
    if (!loading && !user) {
      console.log('AdminDashboard - Not logged in, redirecting to admin login');
      navigate('/admin/login');
      return;
    }
    
    // Redirect non-admin users
    if (!loading && user && !isAdmin) {
      console.log('AdminDashboard - Not an admin, redirecting to home');
      navigate('/');
    }
  }, [user, isAdmin, navigate, loading]);
  
  if (loading && !BYPASS_AUTH_FOR_TESTING) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-600">Loading authentication...</p>
      </div>
    );
  }
  
  if (!user && !BYPASS_AUTH_FOR_TESTING) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Authentication Required</h1>
          <p className="text-gray-600 mb-4">Please log in to access the admin dashboard.</p>
          <button
            onClick={() => navigate('/admin/login')}
            className="w-full py-2 px-4 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Go to Admin Login
          </button>
        </div>
      </div>
    );
  }
  
  if (!isAdmin && !BYPASS_AUTH_FOR_TESTING) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-4">You do not have permission to access this page.</p>
          <button
            onClick={() => navigate('/')}
            className="w-full py-2 px-4 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }
  
  const adminModules = [
    {
      id: 'exempt-users',
      title: 'Exempt Users Management',
      description: 'Add or remove users from the payment exemption list',
      icon: '👤',
      path: '/admin/exempt-users',
    },
    {
      id: 'analytics',
      title: 'Analytics Dashboard',
      description: 'View subscription and usage analytics',
      icon: '📊',
      path: '/admin/analytics',
      disabled: true,
    },
    {
      id: 'content',
      title: 'Content Management',
      description: 'Manage application content and resources',
      icon: '📝',
      path: '/admin/content',
      disabled: true,
    },
    {
      id: 'settings',
      title: 'System Settings',
      description: 'Configure application settings and preferences',
      icon: '⚙️',
      path: '/admin/settings',
      disabled: true,
    },
  ];
  
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Testing Mode Banner - Always displayed when BYPASS_AUTH_FOR_TESTING is true */}
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-6" role="alert">
          <p className="font-bold">Testing Mode Active</p>
          <p>Authentication is currently bypassed for testing purposes. No login required.</p>
        </div>
        
        <div className="bg-white shadow-md rounded-lg p-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            <button
              onClick={() => navigate('/')}
              className="py-2 px-4 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
            >
              Back to App
            </button>
          </div>
          
          <div className="mb-6">
            <h2 className="text-lg font-medium text-gray-900 mb-2">
              Welcome, {user?.email || 'Admin User'}
            </h2>
            <p className="text-gray-600">
              This is the admin dashboard where you can manage various aspects of the InnerMaps application.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {adminModules.map((module) => (
              <div 
                key={module.id}
                className={`border rounded-lg p-5 hover:shadow-md transition-shadow ${
                  module.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                }`}
                onClick={() => !module.disabled && navigate(module.path)}
              >
                <div className="flex items-start">
                  <div className="text-3xl mr-4">{module.icon}</div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-1">
                      {module.title}
                      {module.disabled && <span className="ml-2 text-xs text-gray-500">(Coming Soon)</span>}
                    </h3>
                    <p className="text-gray-600">{module.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="text-lg font-medium text-yellow-800 mb-2">Admin Access Note</h3>
          <p className="text-sm text-yellow-700">
            This admin dashboard is currently in development mode. In a production environment, 
            it would have additional security measures and more comprehensive functionality.
            Currently, only the Exempt Users Management module is fully functional.
          </p>
        </div>
      </div>
    </div>
  );
} 