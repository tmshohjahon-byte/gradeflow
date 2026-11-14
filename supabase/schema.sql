-- ==============================================================================
-- GRADEFLOW ENTERPRISE DATABASE SCHEMA (PostgreSQL / Supabase)
-- Hardened with Strict Row-Level Security (RLS) & Performance Indexes
-- ==============================================================================

-- 1. PROFILES TABLE (Linked with Supabase Auth)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL DEFAULT 'Shohjahon',
  avatar_url TEXT,
  grade_level TEXT DEFAULT 'Talaba / O''quvchi',
  school_name TEXT DEFAULT 'Akademik Ta''lim',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. SUBJECTS TABLE
CREATE TABLE IF NOT EXISTS public.subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  code TEXT,
  color TEXT NOT NULL DEFAULT '#6366F1',
  icon TEXT DEFAULT 'BookOpen',
  teacher_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. GRADES TABLE
CREATE TABLE IF NOT EXISTS public.grades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  grade SMALLINT NOT NULL CHECK (grade BETWEEN 2 AND 5),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  comment TEXT,
  type TEXT DEFAULT 'classwork',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. ACADEMIC GOALS TABLE
CREATE TABLE IF NOT EXISTS public.academic_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  target_average NUMERIC(3, 2) NOT NULL CHECK (target_average BETWEEN 2.0 AND 5.0),
  target_date DATE,
  status TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'achieved', 'at_risk')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, subject_id)
);

-- 5. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info',
  subject_id UUID REFERENCES public.subjects(id) ON DELETE SET NULL,
  is_read BOOLEAN DEFAULT FALSE,
  dedup_key TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. TIMETABLE & REST DAYS
CREATE TABLE IF NOT EXISTS public.timetable (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  day TEXT NOT NULL CHECK (day IN ('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday')),
  subject_ids JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, day)
);

CREATE TABLE IF NOT EXISTS public.schedule_settings (
  user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  rest_days JSONB DEFAULT '["sunday"]'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- INDEXES FOR MAXIMUM QUERY PERFORMANCE
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_subjects_user ON public.subjects(user_id);
CREATE INDEX IF NOT EXISTS idx_grades_user_subject ON public.grades(user_id, subject_id);
CREATE INDEX IF NOT EXISTS idx_grades_date ON public.grades(date DESC);
CREATE INDEX IF NOT EXISTS idx_academic_goals_user ON public.academic_goals(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON public.notifications(user_id, is_read, created_at DESC);

-- ==============================================================================
-- HARDENED ROW LEVEL SECURITY (RLS) POLICIES
-- Strict Isolation: Users can ONLY read, insert, update and delete THEIR OWN DATA
-- ==============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academic_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timetable ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedule_settings ENABLE ROW LEVEL SECURITY;

-- 1. Profiles Isolation
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
CREATE POLICY "Users can read own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- 2. Subjects Isolation
DROP POLICY IF EXISTS "Users can view own subjects" ON public.subjects;
CREATE POLICY "Users can view own subjects" ON public.subjects
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own subjects" ON public.subjects;
CREATE POLICY "Users can insert own subjects" ON public.subjects
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own subjects" ON public.subjects;
CREATE POLICY "Users can update own subjects" ON public.subjects
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own subjects" ON public.subjects;
CREATE POLICY "Users can delete own subjects" ON public.subjects
  FOR DELETE USING (auth.uid() = user_id);

-- 3. Grades Isolation
DROP POLICY IF EXISTS "Users can view own grades" ON public.grades;
CREATE POLICY "Users can view own grades" ON public.grades
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own grades" ON public.grades;
CREATE POLICY "Users can insert own grades" ON public.grades
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own grades" ON public.grades;
CREATE POLICY "Users can update own grades" ON public.grades
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own grades" ON public.grades;
CREATE POLICY "Users can delete own grades" ON public.grades
  FOR DELETE USING (auth.uid() = user_id);

-- 4. Academic Goals Isolation
DROP POLICY IF EXISTS "Users can view own goals" ON public.academic_goals;
CREATE POLICY "Users can view own goals" ON public.academic_goals
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own goals" ON public.academic_goals;
CREATE POLICY "Users can insert own goals" ON public.academic_goals
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own goals" ON public.academic_goals;
CREATE POLICY "Users can update own goals" ON public.academic_goals
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own goals" ON public.academic_goals;
CREATE POLICY "Users can delete own goals" ON public.academic_goals
  FOR DELETE USING (auth.uid() = user_id);

-- 5. Notifications Isolation
DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
CREATE POLICY "Users can view own notifications" ON public.notifications
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;
CREATE POLICY "Users can update own notifications" ON public.notifications
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own notifications" ON public.notifications;
CREATE POLICY "Users can delete own notifications" ON public.notifications
  FOR DELETE USING (auth.uid() = user_id);

-- 6. Timetable & Schedule Isolation
DROP POLICY IF EXISTS "Users can manage own timetable" ON public.timetable;
CREATE POLICY "Users can manage own timetable" ON public.timetable
  FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage own schedule_settings" ON public.schedule_settings;
CREATE POLICY "Users can manage own schedule_settings" ON public.schedule_settings
  FOR ALL USING (auth.uid() = user_id);

-- ==============================================================================
-- AUTOMATIC PROFILE CREATION TRIGGER (PostgreSQL Function)
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, school_name, grade_level)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    COALESCE(new.raw_user_meta_data->>'school_name', 'Akademik Ta''lim'),
    COALESCE(new.raw_user_meta_data->>'grade_level', 'Talaba / O''quvchi')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
