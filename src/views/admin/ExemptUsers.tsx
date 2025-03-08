import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../state-management/AuthContext';
import { supabase } from '../../utils/supabaseClient';
import {
  getExemptUsers,
  addExemptUser,
  removeExemptUser,
  grantFreeSubscription,
  hasActiveSubscription
} from '../../utils/exemptUsers';

// Admin-only emails that can access this page
const ADMIN_EMAILS = ['admin@innermaps.co', 'test@innermaps.co', 'manueldavic@hotmail.com'];

// TEMPORARY: Set these to true to bypass authentication for testing
const BYPASS_AUTH_FOR_TESTING = true;
const BYPASS_ADMIN_CHECK = true;

export const ExemptUsersAdmin: React.FC = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [exemptUsers, setExemptUsers] = useState<string[]>([]);
  const [newExemptUser, setNewExemptUser] = useState('');
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [addingUser, setAddingUser] = useState(false);
  const [removingUser, setRemovingUser] = useState<string | null>(null);
  const [testingSubscription, setTestingSubscription] = useState(false);
  const [checkingSubscription, setCheckingSubscription] = useState(false);
  const [subscriptionStatus, setSubscriptionStatus] = useState<boolean | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Check if current user is an admin
  const userEmailLower = user?.email?.toLowerCase() || '';
  const adminEmailsLower = ADMIN_EMAILS.map(email => email.toLowerCase());
  const isAdmin = BYPASS_AUTH_FOR_TESTING || BYPASS_ADMIN_CHECK || (user?.email && adminEmailsLower.includes(userEmailLower));
  
  console.log('ExemptUsersAdmin - User:', user?.email);
  console.log('ExemptUsersAdmin - Loading:', loading);
  console.log('ExemptUsersAdmin - BYPASS_AUTH_FOR_TESTING:', BYPASS_AUTH_FOR_TESTING);
  console.log('ExemptUsersAdmin - BYPASS_ADMIN_CHECK:', BYPASS_ADMIN_CHECK);
  console.log('ExemptUsersAdmin - Admin Emails:', ADMIN_EMAILS);
  console.log('ExemptUsersAdmin - User Email (lowercase):', userEmailLower);
  console.log('ExemptUsersAdmin - Admin Emails (lowercase):', adminEmailsLower);
  console.log('ExemptUsersAdmin - Is Admin:', isAdmin);

  useEffect(() => {
    // Skip authentication checks if bypassing auth for testing
    if (BYPASS_AUTH_FOR_TESTING) {
      console.log('ExemptUsersAdmin - Bypassing authentication for testing');
      loadExemptUsers();
      return;
    }
    
    // Redirect to login if not logged in
    if (!loading && !user) {
      console.log('ExemptUsersAdmin - Not logged in, redirecting to admin login');
      navigate('/admin/login');
      return;
    }
    
    // Redirect non-admin users
    if (!loading && user && !isAdmin) {
      console.log('ExemptUsersAdmin - Not an admin, redirecting to home');
      navigate('/');
      return;
    }
    
    // Load exempt users if user is admin
    if (!loading && user && isAdmin) {
      console.log('ExemptUsersAdmin - User is admin, loading exempt users');
      loadExemptUsers();
    }
  }, [user, isAdmin, navigate, loading]);

  const loadExemptUsers = async () => {
    try {
      setLoadingUsers(true);
      setMessage(null); // Clear any previous messages
      const users = await getExemptUsers();
      setExemptUsers(users);
    } catch (error) {
      console.error('Error loading exempt users:', error);
      setMessage({
        type: 'error',
        text: 'Failed to load exempt users. Please try again.'
      });
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleAddExemptUser = async () => {
    if (!newExemptUser || !newExemptUser.includes('@')) {
      setMessage({
        type: 'error',
        text: 'Please enter a valid email address.'
      });
      return;
    }

    try {
      setAddingUser(true);
      setMessage(null); // Clear any previous messages
      
      await addExemptUser(newExemptUser);
      
      // Update the local state to include the new user
      setExemptUsers(prev => [...prev, newExemptUser]);
      
      setMessage({
        type: 'success',
        text: `${newExemptUser} has been added to exempt users.`
      });
      
      setNewExemptUser(''); // Clear the input field
    } catch (error) {
      console.error('Error adding exempt user:', error);
      setMessage({
        type: 'error',
        text: `Failed to add ${newExemptUser} to exempt users. Please try again.`
      });
    } finally {
      setAddingUser(false);
    }
  };

  const handleRemoveExemptUser = async (email: string) => {
    try {
      setRemovingUser(email);
      setMessage(null); // Clear any previous messages
      
      await removeExemptUser(email);
      
      // Update the local state to remove the user
      setExemptUsers(prev => prev.filter(user => user !== email));
      
      setMessage({
        type: 'success',
        text: `${email} has been removed from exempt users.`
      });
    } catch (error) {
      console.error('Error removing exempt user:', error);
      setMessage({
        type: 'error',
        text: `Failed to remove ${email} from exempt users. Please try again.`
      });
    } finally {
      setRemovingUser(null);
    }
  };

  const handleTestSubscription = async () => {
    if (!user) {
      setMessage({
        type: 'error',
        text: 'You must be logged in to test subscription.'
      });
      return;
    }

    try {
      setTestingSubscription(true);
      setMessage(null); // Clear any previous messages
      
      console.log(`Creating test subscription for current user: ${user.email}`);
      const result = await grantFreeSubscription(user.email!, 'yearly');
      
      if (result) {
        setMessage({
          type: 'success',
          text: 'Test subscription has been created successfully. You now have access to premium features.'
        });
      } else {
        setMessage({
          type: 'error',
          text: 'Failed to create test subscription. Please check the console for details.'
        });
      }
    } catch (error) {
      console.error('Error creating test subscription:', error);
      setMessage({
        type: 'error',
        text: 'An error occurred while creating the test subscription. Please try again.'
      });
    } finally {
      setTestingSubscription(false);
    }
  };

  const checkSubscriptionStatus = async () => {
    if (!user) {
      setMessage({
        type: 'error',
        text: 'You must be logged in to check subscription status.'
      });
      return;
    }

    try {
      setCheckingSubscription(true);
      setMessage(null); // Clear any previous messages
      
      console.log('Checking subscription status for user ID:', user.id);
      
      try {
        const hasSubscription = await hasActiveSubscription(user.id);
        console.log('Subscription check result:', hasSubscription);
        setSubscriptionStatus(hasSubscription);
        
        setMessage({
          type: 'success',
          text: hasSubscription 
            ? 'You have an active subscription.' 
            : 'You do not have an active subscription.'
        });
      } catch (subError) {
        console.error('Error in subscription check:', subError);
        setMessage({
          type: 'error',
          text: 'Error checking subscription status. See console for details.'
        });
        setSubscriptionStatus(null);
      }
    } catch (error) {
      console.error('Error checking subscription status:', error);
      setMessage({
        type: 'error',
        text: 'Failed to check subscription status. Please try again.'
      });
      setSubscriptionStatus(null);
    } finally {
      setCheckingSubscription(false);
    }
  };

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
          <p className="text-gray-600 mb-4">Please log in to access this page.</p>
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
            <h1 className="text-2xl font-bold text-gray-900">Exempt Users Management</h1>
            <button
              onClick={() => navigate('/admin')}
              className="py-2 px-4 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
            >
              Back to Admin
            </button>
          </div>
          
          <p className="text-gray-600 mb-8">
            Manage users who are exempt from payment requirements. These users will have access to premium features without needing to pay.
          </p>
          
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Current Exempt Users</h2>
            {loadingUsers ? (
              <p className="text-gray-600">Loading exempt users...</p>
            ) : exemptUsers.length === 0 ? (
              <p className="text-gray-600">No exempt users found.</p>
            ) : (
              <ul className="border rounded divide-y">
                {exemptUsers.map((email) => (
                  <li key={email} className="p-4 flex justify-between items-center">
                    <span className="text-gray-800">{email}</span>
                    <button
                      onClick={() => handleRemoveExemptUser(email)}
                      disabled={removingUser === email}
                      className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 disabled:bg-red-300"
                    >
                      {removingUser === email ? 'Removing...' : 'Remove'}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
        
        {message && (
          <div 
            className={`mb-8 p-4 rounded ${
              message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}
          >
            {message.text}
          </div>
        )}
        
        <div className="mb-8 p-4 border rounded bg-gray-50">
          <h2 className="text-xl font-semibold mb-4">Add Exempt User</h2>
          <div className="flex">
            <input
              type="email"
              value={newExemptUser}
              onChange={(e) => setNewExemptUser(e.target.value)}
              placeholder="Enter email address"
              className="flex-grow p-2 border rounded mr-2"
              disabled={addingUser}
            />
            <button
              onClick={handleAddExemptUser}
              disabled={addingUser}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-blue-300"
            >
              {addingUser ? 'Adding...' : 'Add User'}
            </button>
          </div>
        </div>
        
        <div className="mb-8 p-4 border rounded bg-gray-50">
          <h2 className="text-xl font-semibold mb-4">Test Subscription</h2>
          <p className="mb-4">Create a test subscription for your current account.</p>
          <div className="flex flex-col sm:flex-row gap-2">
            <button
              onClick={handleTestSubscription}
              disabled={testingSubscription}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-green-300"
            >
              {testingSubscription ? 'Creating...' : 'Create Test Subscription'}
            </button>
            
            <button
              onClick={checkSubscriptionStatus}
              disabled={checkingSubscription}
              className="px-4 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600 disabled:bg-indigo-300"
            >
              {checkingSubscription ? 'Checking...' : 'Check Subscription Status'}
            </button>
          </div>
          
          {subscriptionStatus !== null && (
            <div className={`mt-4 p-3 rounded ${
              subscriptionStatus ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
            }`}>
              {subscriptionStatus 
                ? 'You currently have an active subscription.' 
                : 'You do not have an active subscription.'}
            </div>
          )}
        </div>
        
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="text-lg font-medium text-yellow-800 mb-2">Admin Access Note</h3>
          <p className="text-sm text-yellow-700">
            This admin functionality is for testing and development purposes. In a production environment, 
            it would have additional security measures and more comprehensive functionality.
          </p>
        </div>
      </div>
    </div>
  );
}; 