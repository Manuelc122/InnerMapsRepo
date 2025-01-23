import React from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { handleGoogleLogin } from '../lib/auth';
import { type User } from '../types';

interface LoginButtonProps {
  onLogin: (user: User) => void;
  onError: (error: Error) => void;
}

export function LoginButton({ onLogin, onError }: LoginButtonProps) {
  return (
    <div className="flex justify-center">
      <GoogleLogin
        onSuccess={async (credentialResponse) => {
          try {
            const user = await handleGoogleLogin(credentialResponse);
            onLogin(user);
          } catch (error) {
            onError(error instanceof Error ? error : new Error('Login failed'));
          }
        }}
        onError={() => {
          onError(new Error('Login failed'));
        }}
      />
    </div>
  );
}