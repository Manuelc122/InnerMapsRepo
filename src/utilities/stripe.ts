import { loadStripe } from '@stripe/stripe-js';
import { supabase } from './supabase';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

export async function createCheckoutSession(priceId: string) {
  try {
    const { data: { session } } = await supabase.functions.invoke('create-checkout-session', {
      body: { priceId }
    });

    const stripe = await stripePromise;
    if (!stripe) throw new Error('Stripe failed to load');

    const { error } = await stripe.redirectToCheckout({
      sessionId: session.id
    });

    if (error) throw error;
  } catch (err) {
    console.error('Error creating checkout session:', err);
    throw new Error('Failed to initiate checkout');
  }
}

export async function createPortalSession() {
  try {
    const { data: { url } } = await supabase.functions.invoke('create-portal-session');
    window.location.href = url;
  } catch (err) {
    console.error('Error creating portal session:', err);
    throw new Error('Failed to access billing portal');
  }
}