-- Add subscription fields to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS subscription_tier text DEFAULT 'monthly' CHECK (subscription_tier IN ('monthly')),
ADD COLUMN IF NOT EXISTS entry_count integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS subscription_updated_at timestamp with time zone DEFAULT timezone('utc'::text, now());

-- Update RLS policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id); 