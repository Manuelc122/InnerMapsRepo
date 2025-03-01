import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';
import { useAuth } from '../state-management/AuthContext';
import { Shield, AlertCircle, CheckCircle, XCircle, RefreshCw, LogIn, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export function AuthDiagnostic() {
  const { user, loading: authLoading, signOut } = useAuth();
  const [diagnosticResults, setDiagnosticResults] = useState<{
    sessionValid: boolean | null;
    supabaseConnection: boolean | null;
    profileAccess: boolean | null;
    sessionDetails: any | null;
    error: string | null;
  }>({
    sessionValid: null,
    supabaseConnection: null,
    profileAccess: null,
    sessionDetails: null,
    error: null
  });
  const [isRunning, setIsRunning] = useState(false);

  const runDiagnostic = async () => {
    setIsRunning(true);
    setDiagnosticResults({
      sessionValid: null,
      supabaseConnection: null,
      profileAccess: null,
      sessionDetails: null,
      error: null
    });

    try {
      // Step 1: Check if session is valid
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      const sessionValid = !!sessionData.session;
      
      // Step 2: Test Supabase connection
      let supabaseConnection = false;
      try {
        const { data, error } = await supabase.from('profiles').select('count').limit(1);
        supabaseConnection = !error;
      } catch (e) {
        console.error('Supabase connection test failed:', e);
      }
      
      // Step 3: Test profile access
      let profileAccess = false;
      let profileError = null;
      
      if (sessionValid && sessionData.session) {
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', sessionData.session.user.id)
            .single();
          
          profileAccess = !error && !!data;
          if (error) profileError = error.message;
        } catch (e) {
          console.error('Profile access test failed:', e);
          if (e instanceof Error) profileError = e.message;
        }
      }
      
      setDiagnosticResults({
        sessionValid,
        supabaseConnection,
        profileAccess,
        sessionDetails: sessionData.session,
        error: sessionError?.message || profileError
      });
    } catch (error) {
      console.error('Diagnostic failed:', error);
      setDiagnosticResults({
        sessionValid: false,
        supabaseConnection: false,
        profileAccess: false,
        sessionDetails: null,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      });
    } finally {
      setIsRunning(false);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      runDiagnostic();
    }
  }, [authLoading]);

  const handleRefreshSession = async () => {
    try {
      const { error } = await supabase.auth.refreshSession();
      if (error) throw error;
      runDiagnostic();
    } catch (error) {
      console.error('Session refresh failed:', error);
      if (error instanceof Error) {
        setDiagnosticResults(prev => ({
          ...prev,
          error: `Session refresh failed: ${error.message}`
        }));
      }
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      window.location.href = '/';
    } catch (error) {
      console.error('Sign out failed:', error);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2.5 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Authentication Diagnostic</h1>
        </div>
        <p className="text-gray-600 ml-11">
          Troubleshoot authentication issues with your InnerMaps account
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6">
        <div className="border-b border-gray-100 bg-gray-50 px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Authentication Status</span>
          </div>
          <button
            onClick={runDiagnostic}
            disabled={isRunning}
            className="inline-flex items-center px-3 py-1.5 text-sm bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isRunning ? 'animate-spin' : ''}`} />
            <span>Run Diagnostic</span>
          </button>
        </div>
        
        <div className="p-6 space-y-6">
          {isRunning ? (
            <div className="flex flex-col items-center justify-center py-8">
              <RefreshCw className="w-8 h-8 text-blue-500 animate-spin mb-3" />
              <p className="text-gray-600">Running diagnostic checks...</p>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  {diagnosticResults.sessionValid === null ? (
                    <div className="w-5 h-5 bg-gray-200 rounded-full mt-0.5 flex-shrink-0" />
                  ) : diagnosticResults.sessionValid ? (
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                  )}
                  <div>
                    <h3 className="font-medium text-gray-800">Session Status</h3>
                    <p className="text-gray-600 text-sm mt-0.5">
                      {diagnosticResults.sessionValid === null
                        ? 'Checking session validity...'
                        : diagnosticResults.sessionValid
                        ? 'Your session is valid and active'
                        : 'Your session is invalid or expired'}
                    </p>
                    {!diagnosticResults.sessionValid && diagnosticResults.sessionValid !== null && (
                      <div className="mt-2 flex space-x-3">
                        <button
                          onClick={handleRefreshSession}
                          className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
                        >
                          <RefreshCw className="w-3.5 h-3.5 mr-1" />
                          <span>Refresh Session</span>
                        </button>
                        <Link
                          to="/"
                          className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
                        >
                          <LogIn className="w-3.5 h-3.5 mr-1" />
                          <span>Sign In Again</span>
                        </Link>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  {diagnosticResults.supabaseConnection === null ? (
                    <div className="w-5 h-5 bg-gray-200 rounded-full mt-0.5 flex-shrink-0" />
                  ) : diagnosticResults.supabaseConnection ? (
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                  )}
                  <div>
                    <h3 className="font-medium text-gray-800">Database Connection</h3>
                    <p className="text-gray-600 text-sm mt-0.5">
                      {diagnosticResults.supabaseConnection === null
                        ? 'Testing connection to Supabase...'
                        : diagnosticResults.supabaseConnection
                        ? 'Successfully connected to Supabase'
                        : 'Failed to connect to Supabase'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  {diagnosticResults.profileAccess === null ? (
                    <div className="w-5 h-5 bg-gray-200 rounded-full mt-0.5 flex-shrink-0" />
                  ) : diagnosticResults.profileAccess ? (
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                  )}
                  <div>
                    <h3 className="font-medium text-gray-800">Profile Access</h3>
                    <p className="text-gray-600 text-sm mt-0.5">
                      {diagnosticResults.profileAccess === null
                        ? 'Checking profile access...'
                        : diagnosticResults.profileAccess
                        ? 'Successfully accessed your profile'
                        : 'Failed to access your profile'}
                    </p>
                  </div>
                </div>
              </div>

              {diagnosticResults.error && (
                <div className="mt-4 p-4 bg-red-50 border border-red-100 text-red-700 rounded-lg flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold">Error Details</h3>
                    <p className="text-sm">{diagnosticResults.error}</p>
                  </div>
                </div>
              )}

              {diagnosticResults.sessionDetails && (
                <div className="mt-4">
                  <h3 className="font-medium text-gray-800 mb-2">Session Details</h3>
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 overflow-auto">
                    <pre className="text-xs text-gray-700 whitespace-pre-wrap">
                      {JSON.stringify({
                        user: {
                          id: diagnosticResults.sessionDetails.user.id,
                          email: diagnosticResults.sessionDetails.user.email,
                          role: diagnosticResults.sessionDetails.user.role,
                          aud: diagnosticResults.sessionDetails.user.aud,
                        },
                        expires_at: new Date(diagnosticResults.sessionDetails.expires_at * 1000).toLocaleString(),
                        created_at: new Date(diagnosticResults.sessionDetails.created_at * 1000).toLocaleString(),
                      }, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <div className="flex justify-between">
        <Link
          to="/profile"
          className="inline-flex items-center px-4 py-2 text-gray-600 hover:text-gray-800"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          <span>Back to Profile</span>
        </Link>

        {user && (
          <button
            onClick={handleSignOut}
            className="inline-flex items-center px-4 py-2 bg-red-50 text-red-700 rounded-md hover:bg-red-100 transition-colors"
          >
            <LogIn className="w-4 h-4 mr-2 transform rotate-180" />
            <span>Sign Out</span>
          </button>
        )}
      </div>
    </div>
  );
}

export default AuthDiagnostic; 