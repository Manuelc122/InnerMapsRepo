import React, { useState } from 'react';
import { signIn, signUp } from '../../utils/auth';
import { LegalAgreements } from '../auth/LegalAgreements';

export function AuthForm() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [showLegalAgreements, setShowLegalAgreements] = useState(false);
  const [legalAgreementsAccepted, setLegalAgreementsAccepted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      if (isSignUp) {
        if (!legalAgreementsAccepted) {
          setShowLegalAgreements(true);
          return;
        }
        await signUp(email, password);
      } else {
        await signIn(email, password);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed');
    }
  };

  const handleLegalAgreementsComplete = (accepted: boolean) => {
    setLegalAgreementsAccepted(accepted);
    setShowLegalAgreements(false);
    
    if (accepted) {
      // Proceed with signup after agreements are accepted
      signUp(email, password).catch(err => {
        setError(err instanceof Error ? err.message : 'Registration failed');
      });
    }
  };

  if (showLegalAgreements) {
    return (
      <div className="w-full max-w-4xl">
        <LegalAgreements onComplete={handleLegalAgreementsComplete} />
      </div>
    );
  }

  return (
    <div className="w-full max-w-md">
      <form onSubmit={handleSubmit} className="bg-white/90 backdrop-blur-sm rounded-lg border border-indigo-100 px-8 pt-6 pb-8 mb-4 shadow-sm">
        <h2 className="text-2xl font-bold mb-6 text-center bg-gradient-to-r from-[#6C63FF] to-[#9D4EDD] text-transparent bg-clip-text">
          {isSignUp ? 'Create Account' : 'Sign In'}
        </h2>
        
        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-500 rounded">
            {error}
          </div>
        )}

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="shadow appearance-none border border-indigo-100 rounded-md w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-200"
            required
          />
        </div>

        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="shadow appearance-none border border-indigo-100 rounded-md w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-200"
            required
          />
        </div>

        <div className="flex flex-col gap-4">
          <button
            type="submit"
            className="bg-gradient-to-r from-[#6C63FF] to-[#9D4EDD] text-white font-bold py-2 px-4 rounded-md hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-indigo-300 w-full"
          >
            {isSignUp ? 'Sign Up' : 'Sign In'}
          </button>
          
          <button
            type="button"
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-indigo-600 hover:text-indigo-800 text-sm text-center"
          >
            {isSignUp ? 'Already have an account? Sign in' : 'Need an account? Sign up'}
          </button>
        </div>
      </form>
    </div>
  );
}