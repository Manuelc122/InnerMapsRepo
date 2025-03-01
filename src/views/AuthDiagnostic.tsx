import React, { useState } from 'react';
import { supabase } from '../utils/supabaseClient';
import { useNavigate } from 'react-router-dom';
import { useUserName } from '../custom-hooks/useUserName';
import { useAuth } from '../state-management/AuthContext';

export function AuthDiagnostic() {
  const [result, setResult] = useState<string | null>(null);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { firstName } = useUserName();

  // Simple function to check auth state
  const checkAuth = async () => {
    try {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        const greeting = firstName ? `Hello, ${firstName}! You are authenticated as: ${data.session.user.email}` : `Authenticated as: ${data.session.user.email}`;
        setResult(greeting);
      } else {
        setResult('Not authenticated');
      }
    } catch (error) {
      setResult(`Error: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  // Clear all Supabase auth data from localStorage
  const clearAuth = () => {
    try {
      // Find all keys that start with the Supabase prefix
      const supabasePrefix = 'sb-';
      const keysToRemove = [];
      
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(supabasePrefix)) {
          keysToRemove.push(key);
        }
      }
      
      // Remove all found keys
      keysToRemove.forEach(key => {
        localStorage.removeItem(key);
      });
      
      setResult(`Cleared ${keysToRemove.length} auth items`);
    } catch (error) {
      setResult(`Error clearing auth: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  // Sign out
  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setResult('Signed out successfully');
    } catch (error) {
      setResult(`Error signing out: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold mb-4 text-center">
          {user && firstName ? `${firstName}'s Auth Diagnostic` : 'Auth Diagnostic'}
        </h1>
        
        {result && (
          <div className="mb-4 p-3 bg-blue-50 text-blue-700 rounded">
            {result}
          </div>
        )}
        
        <div className="space-y-4">
          <button
            onClick={checkAuth}
            className="w-full bg-blue-500 text-white p-2 rounded"
          >
            Check Auth Status
          </button>
          
          <button
            onClick={clearAuth}
            className="w-full bg-red-500 text-white p-2 rounded"
          >
            Clear Auth Data
          </button>
          
          <button
            onClick={signOut}
            className="w-full bg-gray-500 text-white p-2 rounded"
          >
            Sign Out
          </button>
          
          <button
            onClick={() => navigate('/')}
            className="w-full bg-green-500 text-white p-2 rounded"
          >
            Go to Login
          </button>
        </div>
      </div>
    </div>
  );
} 