-- Create payments table for one-time payments
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    transaction_id TEXT NOT NULL,
    reference TEXT NOT NULL,
    payment_date TIMESTAMP WITH TIME ZONE NOT NULL,
    payment_type TEXT NOT NULL,
    amount INTEGER,
    currency TEXT DEFAULT 'COP',
    status TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Add RLS policies for the payments table
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Allow users to view their own payments
CREATE POLICY "Users can view their own payments"
    ON public.payments
    FOR SELECT
    USING (auth.uid() = user_id);

-- Allow service role to manage all payments
CREATE POLICY "Service role can manage all payments"
    ON public.payments
    USING (auth.role() = 'service_role');

-- Create index on user_id for faster lookups
CREATE INDEX IF NOT EXISTS payments_user_id_idx ON public.payments (user_id);

-- Create index on transaction_id for faster lookups
CREATE INDEX IF NOT EXISTS payments_transaction_id_idx ON public.payments (transaction_id);

-- Add function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger to update updated_at timestamp
CREATE TRIGGER update_payments_updated_at
    BEFORE UPDATE ON public.payments
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column(); 