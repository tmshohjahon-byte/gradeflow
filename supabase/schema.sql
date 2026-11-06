-- ==============================================================================
-- GRADEFLOW DATABASE SCHEMA (PostgreSQL / Supabase)
-- ==============================================================================

-- 1. PROFILES TABLE (Linked with Supabase Auth)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  avatar_url TEXT,
  grade_level TEXT DEFAULT '10-sinf',
  school_name TEXT DEFAULT 'Prezident Maktabi',
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
  grade_value SMALLINT NOT NULL CHECK (grade_value BETWEEN 2 AND 5),
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
  target_grade NUMERIC(3, 2) NOT NULL CHECK (target_grade BETWEEN 2.0 AND 5.0),
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
  type TEXT NOT NULL CHECK (type IN ('warning', 'danger', 'info', 'success')),
  subject_id UUID REFERENCES public.subjects(id) ON DELETE SET NULL,
  is_read BOOLEAN DEFAULT FALSE,
  dedup_key TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- INDEXES FOR MAXIMUM QUERY PERFORMANCE
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_subjects_user ON public.subjects(user_id);
CREATE INDEX IF NOT EXISTS idx_grades_user_subject ON public.grades(user_id, subject_id);
CREATE INDEX IF NOT EXISTS idx_grades_date ON public.grades(date DESC);
CREATE INDEX IF NOT EXISTS idx_academic_goals_user ON public.academic_goals(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON public.notifications(user_id, is_read, created_at DESC);
CREATE UNIQUE INDEX IF NOT EXISTS idx_notifications_dedup ON public.notifications(user_id, dedup_key) WHERE dedup_key IS NOT NULL;

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academic_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Subjects Policies
CREATE POLICY "Users can manage their own subjects"
  ON public.subjects FOR ALL
  USING (auth.uid() = user_id);

-- Grades Policies
CREATE POLICY "Users can manage their own grades"
  ON public.grades FOR ALL
  USING (auth.uid() = user_id);

-- Academic Goals Policies
CREATE POLICY "Users can manage their own academic goals"
  ON public.academic_goals FOR ALL
  USING (auth.uid() = user_id);

-- Notifications Policies
CREATE POLICY "Users can manage their own notifications"
  ON public.notifications FOR ALL
  USING (auth.uid() = user_id);

-- ==============================================================================
-- AUTOMATIC PROFILE CREATION TRIGGER
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    COALESCE(new.raw_user_meta_data->>'avatar_url', '')
  );

  -- Insert default subjects for new student
  INSERT INTO public.subjects (user_id, name, code, color, icon)
  VALUES 
    (new.id, 'Matematika (Algebra & Geometriya)', 'MATH', '#6366F1', 'Calculator'),
    (new.id, 'Ingliz tili (Academic English)', 'ENG', '#3B82F6', 'Languages'),
    (new.id, 'Fizika', 'PHYS', '#EC4899', 'Atom'),
    (new.id, 'Informatika & Dasturlash', 'CS', '#10B981', 'Code'),
    (new.id, 'Kimyo', 'CHEM', '#F59E0B', 'FlaskConical'),
    (new.id, 'Tarix', 'HIST', '#8B5CF6', 'History'),
    (new.id, 'Biologiya', 'BIO', '#14B8A6', 'Dna');

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
