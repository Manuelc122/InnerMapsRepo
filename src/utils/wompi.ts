import { supabase } from './supabase';
import { v4 as uuidv4 } from 'uuid';

class WompiService {
  private static instance: WompiService;
  private initialized = false;
  private publicKey = import.meta.env.VITE_WOMPI_PUBLIC_KEY || 'pub_prod_7JHIbZu0Hm0WR7RVdgXJiNQtLwAaWwXo';
  private apiUrl = 'https://api.wompi.co/v1';

  private constructor() {
    this.initialize();
  }

  public static getInstance(): WompiService {
    if (!WompiService.instance) {
      WompiService.instance = new WompiService();
    }
    return WompiService.instance;
  }

  private initialize(): void {
    if (!this.publicKey) {
      console.error('Missing Wompi public key in environment variables');
      return;
    }

    this.initialized = true;
  }

  /**
   * Generate a unique reference for a transaction
   * @param userId The user ID to include in the reference
   * @param plan The subscription plan
   * @returns A unique reference string
   */
  public generateReference(userId: string, plan: string): string {
    const timestamp = Date.now();
    const shortUuid = uuidv4().split('-')[0];
    return `${plan}-${userId.substring(0, 8)}-${timestamp}-${shortUuid}`;
  }

  /**
   * Get the redirect URL for the payment result
   * @returns The full URL to redirect to after payment
   */
  public getRedirectUrl(): string {
    const baseUrl = window.location.origin;
    return `${baseUrl}/payment/result`;
  }

  /**
   * Verify a transaction with the Wompi API
   * @param transactionId The transaction ID from Wompi
   * @returns The transaction details
   */
  public async verifyTransaction(transactionId: string): Promise<any> {
    try {
      // This should be called from your backend to keep your private key secure
      // Here we're using Supabase Edge Functions as a secure backend
      const { data, error } = await supabase.functions.invoke('verify-wompi-transaction', {
        body: { transactionId }
      });

      if (error) throw error;
      return data;
    } catch (err) {
      console.error('Error verifying transaction:', err);
      throw new Error('Failed to verify transaction. Please contact support.');
    }
  }

  /**
   * Process a successful payment
   * @param transactionId The transaction ID from Wompi
   * @param reference The reference used for the payment
   * @returns The result of the payment processing
   */
  public async processSuccessfulPayment(transactionId: string, reference: string): Promise<any> {
    try {
      // Extract plan and user info from reference
      const parts = reference.split('-');
      const plan = parts[0];
      
      // Call backend to process the payment
      const { data, error } = await supabase.functions.invoke('process-payment', {
        body: { 
          transactionId,
          reference,
          plan
        }
      });

      if (error) throw error;
      return data;
    } catch (err) {
      console.error('Error processing payment:', err);
      throw new Error('Failed to process payment. Please contact support.');
    }
  }

  public isInitialized(): boolean {
    return this.initialized;
  }
}

export const wompiService = WompiService.getInstance(); 