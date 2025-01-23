import { initMercadoPago, Wallet } from '@mercadopago/sdk-react';
import { supabase } from './supabase';

class MercadoPagoService {
  private static instance: MercadoPagoService;
  private initialized = false;
  private publicKey = import.meta.env.VITE_MERCADOPAGO_PUBLIC_KEY;

  private constructor() {
    this.initialize();
  }

  public static getInstance(): MercadoPagoService {
    if (!MercadoPagoService.instance) {
      MercadoPagoService.instance = new MercadoPagoService();
    }
    return MercadoPagoService.instance;
  }

  private initialize(): void {
    if (!this.publicKey) {
      console.error('Missing Mercado Pago public key in environment variables');
      return;
    }

    try {
      initMercadoPago(this.publicKey);
      this.initialized = true;
    } catch (err) {
      console.error('Failed to initialize Mercado Pago:', err);
      this.initialized = false;
    }
  }

  public async createPreference(plan: 'monthly' | 'yearly'): Promise<{ id: string }> {
    if (!this.initialized) {
      throw new Error('Mercado Pago is not properly initialized. Please check your configuration.');
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User must be authenticated to create a payment preference');

      const { data, error } = await supabase.functions.invoke('create-preference', {
        body: { 
          plan,
          userId: user.id,
          amount: plan === 'monthly' ? 10 : 100,
          description: `InnerMaps ${plan} subscription`
        }
      });

      if (error) throw error;
      if (!data?.preference?.id) throw new Error('Invalid preference response from server');

      return data.preference;
    } catch (err) {
      console.error('Error creating payment preference:', err);
      throw new Error('Failed to create payment preference. Please try again later.');
    }
  }

  public isInitialized(): boolean {
    return this.initialized;
  }
}

export const mercadoPago = MercadoPagoService.getInstance();
export { Wallet };