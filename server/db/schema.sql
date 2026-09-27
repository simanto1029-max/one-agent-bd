-- ============================================================================
-- ONE AGENT BD: SUPABASE POSTGRESQL SCHEMA WITH CLOUD STATE SYNC & RLS
-- WhatsApp + Messenger + Instagram AI Auto-Reply & E-Commerce SaaS Platform
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ----------------------------------------------------------------------------
-- 0. CLOUD APP STATE TABLE (Powers Instant Real-Time Sync on Vercel + Supabase)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.app_state (
  id TEXT PRIMARY KEY,
  state_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.app_state ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow full access to app_state for backend sync" ON public.app_state;
CREATE POLICY "Allow full access to app_state for backend sync"
  ON public.app_state FOR ALL
  USING (true)
  WITH CHECK (true);

-- ----------------------------------------------------------------------------
-- 1. PROFILES TABLE (Linked with auth.users)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  is_suspended BOOLEAN NOT NULL DEFAULT false,
  llm_provider TEXT NOT NULL DEFAULT 'gemini' CHECK (llm_provider IN ('gemini', 'openai', 'anthropic')),
  llm_api_key TEXT,
  system_prompt TEXT NOT NULL DEFAULT 'You are a warm, professional customer support AI agent for our business. Reply politely, accurately, and concisely. Keep answers under 3 sentences unless details are requested.',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index on email & role
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

-- ----------------------------------------------------------------------------
-- 2. PLANS TABLE (Dynamically powers pricing table and trial days)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.plans (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  price NUMERIC(10, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'BDT',
  duration_days INTEGER NOT NULL DEFAULT 30,
  trial_days INTEGER NOT NULL DEFAULT 2,
  is_active BOOLEAN NOT NULL DEFAULT true,
  features JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed Default Plans
INSERT INTO public.plans (id, name, price, currency, duration_days, trial_days, is_active, features)
VALUES 
  ('plan_standard', 'All-in-One Plan', 1450.00, 'BDT', 30, 2, true, '["WhatsApp Business Cloud API", "Facebook Messenger Page", "Instagram Business Messaging", "Website AI Chatbot", "Unlimited Bengali & English AI Replies", "Voice AI Engine", "Orders Hub & 1-Click WhatsApp Broadcast", "Courier Booking"]'::jsonb),
  ('plan_pro', 'All-in-One Annual', 14500.00, 'BDT', 365, 2, true, '["All-in-One Plan Features Included", "12 Months Access (2 Months Free)", "Priority High-Speed LLM Inference", "Dedicated Priority Support"]'::jsonb)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  price = EXCLUDED.price,
  duration_days = EXCLUDED.duration_days,
  trial_days = EXCLUDED.trial_days;

-- ----------------------------------------------------------------------------
-- 3. SUBSCRIPTIONS TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  plan_id TEXT NOT NULL REFERENCES public.plans(id) ON DELETE RESTRICT,
  status TEXT NOT NULL DEFAULT 'trialing' CHECK (status IN ('trialing', 'active', 'expired', 'pending_approval')),
  start_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  end_date TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_user ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON public.subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_end_date ON public.subscriptions(end_date);

-- ----------------------------------------------------------------------------
-- 4. PAYMENTS TABLE (Manual bKash / Nagad payment verification)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  plan_id TEXT NOT NULL REFERENCES public.plans(id) ON DELETE RESTRICT,
  amount NUMERIC(10, 2) NOT NULL,
  method TEXT NOT NULL CHECK (method IN ('bkash', 'nagad', 'manual', 'stripe')),
  transaction_reference TEXT NOT NULL UNIQUE,
  sender_number TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  admin_notes TEXT,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES public.profiles(id)
);

CREATE INDEX IF NOT EXISTS idx_payments_user ON public.payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON public.payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_tx_ref ON public.payments(transaction_reference);

-- ----------------------------------------------------------------------------
-- 5. CHANNELS TABLE (WhatsApp Cloud API & Messenger Page credentials)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.channels (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  platform TEXT NOT NULL CHECK (platform IN ('whatsapp', 'messenger')),
  name TEXT NOT NULL,
  identifier TEXT NOT NULL, -- phone_number_id for WhatsApp, page_id for Messenger
  access_token TEXT NOT NULL,
  app_secret TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT unique_channel_identifier_per_user UNIQUE(user_id, platform, identifier)
);

CREATE INDEX IF NOT EXISTS idx_channels_user ON public.channels(user_id);
CREATE INDEX IF NOT EXISTS idx_channels_identifier ON public.channels(identifier);

-- ----------------------------------------------------------------------------
-- 6. MESSAGES TABLE (Unified Inbox logs)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  channel_id UUID REFERENCES public.channels(id) ON DELETE SET NULL,
  platform TEXT NOT NULL CHECK (platform IN ('whatsapp', 'messenger')),
  customer_id TEXT NOT NULL, -- Phone number or Messenger PSID
  customer_name TEXT,
  direction TEXT NOT NULL CHECK (direction IN ('inbound', 'outbound')),
  message_text TEXT NOT NULL,
  is_ai_reply BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL DEFAULT 'delivered',
  raw_payload JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_messages_user ON public.messages(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_customer ON public.messages(customer_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages(created_at DESC);

-- ----------------------------------------------------------------------------
-- 7. SYSTEM SETTINGS TABLE (Logo, site name, SEO, bKash numbers, cron status)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.system_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO public.system_settings (key, value)
VALUES 
  ('site_config', '{"site_name": "Replay Agent", "site_tagline": "AI Auto-Reply for WhatsApp & Messenger", "logo_url": "/logo.svg", "bkash_number": "+8801700123456", "nagad_number": "+8801800123456", "support_email": "support@replayagent.com"}'::jsonb),
  ('cron_status', '{"last_expiry_run": "2026-09-11T12:00:00Z", "status": "healthy", "expired_count_last_run": 0}'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Helper: check if current user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Users can view own profile or admins view all" 
  ON public.profiles FOR SELECT 
  USING (auth.uid() = id OR public.is_admin());

CREATE POLICY "Users can update own profile or admins update all" 
  ON public.profiles FOR UPDATE 
  USING (auth.uid() = id OR public.is_admin());

CREATE POLICY "Admins can insert profiles" 
  ON public.profiles FOR INSERT 
  WITH CHECK (auth.uid() = id OR public.is_admin());

-- Plans Policies
CREATE POLICY "Anyone can view active plans" 
  ON public.plans FOR SELECT 
  USING (is_active = true OR public.is_admin());

CREATE POLICY "Only admins can insert plans" 
  ON public.plans FOR INSERT 
  WITH CHECK (public.is_admin());

CREATE POLICY "Only admins can update plans" 
  ON public.plans FOR UPDATE 
  USING (public.is_admin());

CREATE POLICY "Only admins can delete plans" 
  ON public.plans FOR DELETE 
  USING (public.is_admin());

-- Subscriptions Policies
CREATE POLICY "Users view own subscriptions or admins view all" 
  ON public.subscriptions FOR SELECT 
  USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Admins manage subscriptions" 
  ON public.subscriptions FOR ALL 
  USING (public.is_admin());

-- Payments Policies
CREATE POLICY "Users can view own payments or admins view all" 
  ON public.payments FOR SELECT 
  USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Users can submit own payments" 
  ON public.payments FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Only admins can review/update payments" 
  ON public.payments FOR UPDATE 
  USING (public.is_admin());

-- Channels Policies
CREATE POLICY "Users manage own channels or admins view all" 
  ON public.channels FOR ALL 
  USING (auth.uid() = user_id OR public.is_admin());

-- Messages Policies
CREATE POLICY "Users view own messages or admins view all" 
  ON public.messages FOR ALL 
  USING (auth.uid() = user_id OR public.is_admin());

-- System Settings Policies
CREATE POLICY "Anyone can view system settings" 
  ON public.system_settings FOR SELECT 
  USING (true);

CREATE POLICY "Only admins can update system settings" 
  ON public.system_settings FOR ALL 
  USING (public.is_admin());

-- ----------------------------------------------------------------------------
-- TRIGGER: Auto-create profile & start free trial on auth.users insert
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  default_plan RECORD;
  trial_days_count INT;
BEGIN
  -- 1. Create profile
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'role', 'user')
  );

  -- 2. Fetch default plan to dynamically calculate trial_days (not hardcoded)
  SELECT id, trial_days INTO default_plan 
  FROM public.plans 
  WHERE is_active = true 
  ORDER BY price ASC 
  LIMIT 1;

  trial_days_count := COALESCE(default_plan.trial_days, 2);

  -- 3. Automatically start free trial subscription
  IF default_plan.id IS NOT NULL THEN
    INSERT INTO public.subscriptions (user_id, plan_id, status, start_date, end_date)
    VALUES (
      NEW.id,
      default_plan.id,
      'trialing',
      NOW(),
      NOW() + (trial_days_count || ' days')::INTERVAL
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
