
-- ============ GAMIFICATION ============
CREATE TABLE public.user_stats (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  xp integer NOT NULL DEFAULT 0,
  level integer NOT NULL DEFAULT 1,
  current_streak integer NOT NULL DEFAULT 0,
  longest_streak integer NOT NULL DEFAULT 0,
  last_active_date date,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.user_stats TO authenticated;
GRANT ALL ON public.user_stats TO service_role;
ALTER TABLE public.user_stats ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own stats select" ON public.user_stats FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "own stats insert" ON public.user_stats FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own stats update" ON public.user_stats FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE TRIGGER trg_user_stats_updated BEFORE UPDATE ON public.user_stats FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  name text NOT NULL,
  description text NOT NULL,
  icon text NOT NULL,
  xp_reward integer NOT NULL DEFAULT 50,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.badges TO authenticated, anon;
GRANT ALL ON public.badges TO service_role;
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "badges public read" ON public.badges FOR SELECT TO authenticated, anon USING (true);

CREATE TABLE public.user_badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  badge_id uuid NOT NULL REFERENCES public.badges(id) ON DELETE CASCADE,
  earned_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, badge_id)
);
GRANT SELECT, INSERT ON public.user_badges TO authenticated;
GRANT ALL ON public.user_badges TO service_role;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own badges select" ON public.user_badges FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "own badges insert" ON public.user_badges FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- ============ HACKATHONS ============
CREATE TABLE public.hackathons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  organizer text NOT NULL,
  url text NOT NULL,
  prize text,
  mode text NOT NULL DEFAULT 'online',
  location text,
  registration_deadline date,
  event_start_date date,
  event_end_date date,
  tags text[] NOT NULL DEFAULT '{}',
  description text,
  source text NOT NULL DEFAULT 'manual',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.hackathons TO authenticated, anon;
GRANT ALL ON public.hackathons TO service_role;
ALTER TABLE public.hackathons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "hackathons public read" ON public.hackathons FOR SELECT TO authenticated, anon USING (is_active = true);
CREATE TRIGGER trg_hackathons_updated BEFORE UPDATE ON public.hackathons FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ HR INTERVIEW ============
CREATE TABLE public.hr_interview_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role_target text NOT NULL,
  difficulty text NOT NULL DEFAULT 'medium',
  status text NOT NULL DEFAULT 'in_progress',
  feedback jsonb,
  score integer,
  started_at timestamptz NOT NULL DEFAULT now(),
  ended_at timestamptz
);
GRANT SELECT, INSERT, UPDATE ON public.hr_interview_sessions TO authenticated;
GRANT ALL ON public.hr_interview_sessions TO service_role;
ALTER TABLE public.hr_interview_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own sessions select" ON public.hr_interview_sessions FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "own sessions insert" ON public.hr_interview_sessions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own sessions update" ON public.hr_interview_sessions FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE TABLE public.hr_interview_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES public.hr_interview_sessions(id) ON DELETE CASCADE,
  role text NOT NULL,
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.hr_interview_messages TO authenticated;
GRANT ALL ON public.hr_interview_messages TO service_role;
ALTER TABLE public.hr_interview_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own messages select" ON public.hr_interview_messages FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.hr_interview_sessions s WHERE s.id = session_id AND s.user_id = auth.uid()));
CREATE POLICY "own messages insert" ON public.hr_interview_messages FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.hr_interview_sessions s WHERE s.id = session_id AND s.user_id = auth.uid()));

-- ============ RESUMES ============
CREATE TABLE public.resumes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL DEFAULT 'My Resume',
  target_role text,
  content jsonb NOT NULL DEFAULT '{}'::jsonb,
  ai_summary text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.resumes TO authenticated;
GRANT ALL ON public.resumes TO service_role;
ALTER TABLE public.resumes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own resumes all" ON public.resumes FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER trg_resumes_updated BEFORE UPDATE ON public.resumes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
