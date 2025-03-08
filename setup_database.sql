-- Create exempt_users table
CREATE TABLE IF NOT EXISTS public.exempt_users (
  id uuid DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
  email text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on exempt_users
ALTER TABLE public.exempt_users ENABLE ROW LEVEL SECURITY;

-- Create policies for exempt_users
CREATE POLICY "Admins can manage exempt users"
  ON public.exempt_users
  USING (auth.role() = 'service_role' OR auth.email() IN ('admin@innermaps.co', 'test@innermaps.co', 'manueldavic@hotmail.com'));

CREATE POLICY "Anyone can view exempt users"
  ON public.exempt_users
  FOR SELECT
  USING (true);

-- Drop existing subscriptions table if it exists
DROP TABLE IF EXISTS public.subscriptions CASCADE;

-- Create subscriptions table
CREATE TABLE public.subscriptions (
  id uuid DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  stripe_customer_id text,
  stripe_subscription_id text,
  status text NOT NULL CHECK (status IN ('active', 'trialing', 'past_due', 'canceled', 'incomplete', 'incomplete_expired', 'unpaid')),
  price_id text,
  plan_type text NOT NULL CHECK (plan_type IN ('monthly', 'yearly')),
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean DEFAULT false,
  payment_method text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on subscriptions
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Create policies for subscriptions
CREATE POLICY "Users can view their own subscriptions"
  ON public.subscriptions
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage all subscriptions"
  ON public.subscriptions
  USING (auth.role() = 'service_role');

-- Drop existing indexes if they exist
DROP INDEX IF EXISTS idx_subscriptions_user_id;
DROP INDEX IF EXISTS idx_subscriptions_stripe_subscription_id;

-- Create index for faster lookups
CREATE INDEX idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX idx_subscriptions_stripe_subscription_id ON public.subscriptions(stripe_subscription_id);

-- Create or update profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid REFERENCES auth.users(id) PRIMARY KEY,
  email text,
  full_name text,
  is_subscribed boolean DEFAULT false,
  subscription_status text DEFAULT 'inactive',
  subscription_updated_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Users can view their own profile"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Service role can manage all profiles"
  ON public.profiles
  USING (auth.role() = 'service_role');

-- Drop the existing function if it exists
DROP FUNCTION IF EXISTS public.has_active_subscription(uuid);

-- Create function to check if user has active subscription
CREATE OR REPLACE FUNCTION public.has_active_subscription(user_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM public.subscriptions 
    WHERE user_id = $1 
    AND status IN ('active', 'trialing')
    AND (current_period_end > now() OR current_period_end IS NULL)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Insert initial exempt users
INSERT INTO public.exempt_users (email)
VALUES ('admin@innermaps.co'), ('test@innermaps.co'), ('manueldavic@hotmail.com')
ON CONFLICT (email) DO NOTHING; 