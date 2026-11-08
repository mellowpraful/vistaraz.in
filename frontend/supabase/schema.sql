-- ==============================================================================
-- VISTARAZ SUPABASE DATABASE SCHEMA (ROLE-BASED: SEEKER & PROVIDER)
-- Execute this script in your Supabase SQL Editor (Dashboard > SQL Editor > New Query)
-- ==============================================================================

-- 1. Profiles Table (extends auth.users with Seeker & Counselor metadata)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  nickname TEXT,
  avatar_url TEXT DEFAULT '🦊',
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'counselor', 'admin')),
  plan TEXT DEFAULT 'Free' CHECK (plan IN ('Free', 'Silver', 'Gold', 'VIP')),
  qualification TEXT,
  languages TEXT[] DEFAULT ARRAY['English'],
  specialties TEXT[] DEFAULT ARRAY['General Wellbeing', 'Stress'],
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone" 
  ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile" 
  ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile" 
  ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- 2. Automatic Profile Creation Trigger on Sign Up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id, 
    full_name, 
    nickname, 
    role, 
    avatar_url,
    qualification,
    languages
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'nickname', 'Friend'),
    COALESCE(NEW.raw_user_meta_data->>'role', 'user'),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', '🦊'),
    COALESCE(NEW.raw_user_meta_data->>'qualification', NULL),
    CASE 
      WHEN NEW.raw_user_meta_data ? 'languages' AND jsonb_typeof(NEW.raw_user_meta_data->'languages') = 'array' THEN
        ARRAY(SELECT jsonb_array_elements_text(NEW.raw_user_meta_data->'languages'))
      ELSE
        ARRAY['English']
    END
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. Assessments Table (Stores Check-in & Wellbeing Scores)
CREATE TABLE IF NOT EXISTS public.assessments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  score INTEGER NOT NULL,
  category TEXT NOT NULL,
  answers JSONB,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own assessments" ON public.assessments;
CREATE POLICY "Users can view their own assessments" 
  ON public.assessments FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);

DROP POLICY IF EXISTS "Users can insert assessments" ON public.assessments;
CREATE POLICY "Users can insert assessments" 
  ON public.assessments FOR INSERT WITH CHECK (true);

-- 4. Counselor Availability & Schedules Table
CREATE TABLE IF NOT EXISTS public.counselor_schedules (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  counselor_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  is_online BOOLEAN DEFAULT false,
  start_time TIME DEFAULT '10:00',
  end_time TIME DEFAULT '18:00',
  active_days TEXT[] DEFAULT ARRAY['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
  max_daily_sessions INTEGER DEFAULT 4,
  last_active TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE public.counselor_schedules ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Counselor schedules are viewable by all" ON public.counselor_schedules;
CREATE POLICY "Counselor schedules are viewable by all" 
  ON public.counselor_schedules FOR SELECT USING (true);

DROP POLICY IF EXISTS "Counselors can update their own schedule" ON public.counselor_schedules;
CREATE POLICY "Counselors can update their own schedule" 
  ON public.counselor_schedules FOR ALL USING (auth.uid() = counselor_id);

-- 5. Appointments & Support Sessions
CREATE TABLE IF NOT EXISTS public.appointments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  counselor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  session_type TEXT CHECK (session_type IN ('chat', 'audio', 'video')),
  scheduled_for TIMESTAMPTZ,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users and counselors can view their appointments" ON public.appointments;
CREATE POLICY "Users and counselors can view their appointments" 
  ON public.appointments FOR SELECT USING (auth.uid() = user_id OR auth.uid() = counselor_id);

DROP POLICY IF EXISTS "Users can create appointments" ON public.appointments;
CREATE POLICY "Users can create appointments" 
  ON public.appointments FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 6. Contact & Support Messages
CREATE TABLE IF NOT EXISTS public.contact_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT,
  email TEXT,
  subject TEXT,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can submit a contact message" ON public.contact_messages;
CREATE POLICY "Anyone can submit a contact message" 
  ON public.contact_messages FOR INSERT WITH CHECK (true);
