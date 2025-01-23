-- Create profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  updated_at timestamptz,
  username text UNIQUE,
  full_name text,
  avatar_url text,
  website text,
  subscription_plan text CHECK (subscription_plan IN ('free', 'monthly', 'yearly')),
  subscription_status text CHECK (subscription_status IN ('active', 'inactive', 'cancelled', 'past_due')),
  subscription_period_end timestamptz,
  subscription_created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Public profiles are viewable by everyone"
  ON public.profiles
  FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id);

-- Set default values for existing users
UPDATE public.profiles 
SET 
  subscription_plan = 'free',
  subscription_status = 'inactive',
  subscription_period_end = now(),
  subscription_created_at = now()
WHERE subscription_plan IS NULL;

-- Create subscription history table
CREATE TABLE IF NOT EXISTS public.subscription_history (
  id uuid DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  plan text NOT NULL CHECK (plan IN ('monthly', 'yearly')),
  status text NOT NULL CHECK (status IN ('active', 'inactive', 'cancelled', 'past_due')),
  payment_provider text NOT NULL,
  payment_id text,
  period_start timestamptz NOT NULL,
  period_end timestamptz NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.subscription_history ENABLE ROW LEVEL SECURITY;

-- Create policies for subscription_history
CREATE POLICY "Users can view their own subscription history"
  ON public.subscription_history
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage all subscription history"
  ON public.subscription_history
  USING (auth.role() = 'service_role');

-- Create function to update subscription status
CREATE OR REPLACE FUNCTION public.update_subscription_status()
RETURNS trigger AS $$
BEGIN
  UPDATE public.profiles
  SET 
    subscription_plan = NEW.plan,
    subscription_status = NEW.status,
    subscription_period_end = NEW.period_end
  WHERE id = NEW.user_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for subscription updates
DROP TRIGGER IF EXISTS on_subscription_update ON public.subscription_history;
CREATE TRIGGER on_subscription_update
  AFTER INSERT OR UPDATE ON public.subscription_history
  FOR EACH ROW
  EXECUTE FUNCTION public.update_subscription_status();

-- Create function to check if user has active subscription
CREATE OR REPLACE FUNCTION public.has_active_subscription(user_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM public.profiles 
    WHERE id = user_id 
    AND subscription_status = 'active' 
    AND subscription_period_end > now()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to handle new user signups
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, subscription_plan, subscription_status, subscription_period_end, subscription_created_at)
  VALUES (
    NEW.id,
    'free',
    'inactive',
    now(),
    now()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signups
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user(); 