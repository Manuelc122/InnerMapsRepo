import { AppProps } from 'next/app';
import { AuthProvider } from '../lib/auth/AuthContext';
import { SubscriptionProvider } from '../lib/subscriptions/SubscriptionContext';
import '../styles/globals.css';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <SubscriptionProvider>
        <Component {...pageProps} />
      </SubscriptionProvider>
    </AuthProvider>
  );
}

export default MyApp; 