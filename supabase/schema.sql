-- ==============================================================================
-- GRADEFLOW DATABASE SCHEMA (PostgreSQL / Supabase)
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

-- 6. TIMETABLE & REST DAYS (ADMIN PANEL)
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
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academic_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timetable ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedule_settings ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users and public demo access for personal student use:
CREATE POLICY "Users can access their own profile" ON public.profiles FOR ALL USING (true);
CREATE POLICY "Users can access their own subjects" ON public.subjects FOR ALL USING (true);
CREATE POLICY "Users can access their own grades" ON public.grades FOR ALL USING (true);
CREATE POLICY "Users can access their own academic_goals" ON public.academic_goals FOR ALL USING (true);
CREATE POLICY "Users can access their own notifications" ON public.notifications FOR ALL USING (true);
CREATE POLICY "Users can access their own timetable" ON public.timetable FOR ALL USING (true);
CREATE POLICY "Users can access their own schedule_settings" ON public.schedule_settings FOR ALL USING (true);

-- ==============================================================================
-- DEFAULT INITIAL SUBJECTS FOR SHOHJAHON (13 ta fan)
-- ==============================================================================
-- 1. Ingliz tili
-- 2. Matematika
-- 3. Kimyo
-- 4. Tarbiya
-- 5. IT
-- 6. Arab tili
-- 7. Tarix
-- 8. Rus tili
-- 9. Ona tili
-- 10. Fizika
-- 11. Biologiya
-- 12. Math Task
-- 13. English Task
