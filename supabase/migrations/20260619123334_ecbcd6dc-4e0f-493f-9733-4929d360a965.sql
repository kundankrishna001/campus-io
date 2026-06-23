
-- ============ UTIL ============
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql SET search_path = public;

-- ============ PROFILES ============
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  college text,
  branch text CHECK (branch IN ('CS','IT','ECE','EEE','MECH','CIVIL','OTHER')),
  year int CHECK (year BETWEEN 1 AND 5),
  semester int CHECK (semester BETWEEN 1 AND 10),
  cgpa numeric(3,2) CHECK (cgpa >= 0 AND cgpa <= 10),
  onboarded boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own profile read"  ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "own profile write" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "own profile insert" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE TRIGGER trg_profiles_updated BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email,'@',1)))
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============ SKILLS ============
CREATE TABLE public.user_skills (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  skill text NOT NULL,
  proficiency text NOT NULL CHECK (proficiency IN ('Beginner','Intermediate','Advanced')),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, skill)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_skills TO authenticated;
GRANT ALL ON public.user_skills TO service_role;
ALTER TABLE public.user_skills ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own skills" ON public.user_skills FOR ALL TO authenticated USING (auth.uid()=user_id) WITH CHECK (auth.uid()=user_id);

-- ============ CURRICULUM ============
CREATE TABLE public.semesters (
  id int PRIMARY KEY,
  name text NOT NULL,
  description text
);
CREATE TABLE public.subjects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  semester_id int NOT NULL REFERENCES public.semesters(id) ON DELETE CASCADE,
  code text,
  name text NOT NULL,
  description text,
  icon text,
  position int NOT NULL DEFAULT 0
);
CREATE TABLE public.units (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id uuid NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  name text NOT NULL,
  position int NOT NULL DEFAULT 0
);
CREATE TABLE public.topics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  unit_id uuid NOT NULL REFERENCES public.units(id) ON DELETE CASCADE,
  name text NOT NULL,
  summary text,
  position int NOT NULL DEFAULT 0
);
CREATE TABLE public.resources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id uuid NOT NULL REFERENCES public.topics(id) ON DELETE CASCADE,
  kind text NOT NULL DEFAULT 'youtube',
  youtube_id text,
  title text NOT NULL,
  channel text,
  language text NOT NULL DEFAULT 'English',
  duration_min int
);
GRANT SELECT ON public.semesters, public.subjects, public.units, public.topics, public.resources TO authenticated;
GRANT ALL ON public.semesters, public.subjects, public.units, public.topics, public.resources TO service_role;
ALTER TABLE public.semesters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.units     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.topics    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read semesters" ON public.semesters FOR SELECT TO authenticated USING (true);
CREATE POLICY "read subjects"  ON public.subjects  FOR SELECT TO authenticated USING (true);
CREATE POLICY "read units"     ON public.units     FOR SELECT TO authenticated USING (true);
CREATE POLICY "read topics"    ON public.topics    FOR SELECT TO authenticated USING (true);
CREATE POLICY "read resources" ON public.resources FOR SELECT TO authenticated USING (true);

-- ============ PROGRESS ============
CREATE TABLE public.topic_progress (
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  topic_id uuid NOT NULL REFERENCES public.topics(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started','in_progress','completed')),
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, topic_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.topic_progress TO authenticated;
GRANT ALL ON public.topic_progress TO service_role;
ALTER TABLE public.topic_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own progress" ON public.topic_progress FOR ALL TO authenticated USING (auth.uid()=user_id) WITH CHECK (auth.uid()=user_id);

-- ============ QUIZ ============
CREATE TABLE public.questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id uuid REFERENCES public.topics(id) ON DELETE CASCADE,
  subject_id uuid REFERENCES public.subjects(id) ON DELETE CASCADE,
  difficulty text NOT NULL CHECK (difficulty IN ('Easy','Medium','Hard')),
  prompt text NOT NULL,
  options jsonb NOT NULL,
  correct_idx int NOT NULL,
  explanation text
);
GRANT SELECT ON public.questions TO authenticated;
GRANT ALL ON public.questions TO service_role;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read questions" ON public.questions FOR SELECT TO authenticated USING (true);

CREATE TABLE public.quiz_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject_id uuid REFERENCES public.subjects(id) ON DELETE SET NULL,
  topic_id uuid REFERENCES public.topics(id) ON DELETE SET NULL,
  started_at timestamptz NOT NULL DEFAULT now(),
  finished_at timestamptz,
  score int,
  total int
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.quiz_sessions TO authenticated;
GRANT ALL ON public.quiz_sessions TO service_role;
ALTER TABLE public.quiz_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own sessions" ON public.quiz_sessions FOR ALL TO authenticated USING (auth.uid()=user_id) WITH CHECK (auth.uid()=user_id);

CREATE TABLE public.quiz_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES public.quiz_sessions(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  question_id uuid NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
  chosen_idx int NOT NULL,
  is_correct boolean NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.quiz_responses TO authenticated;
GRANT ALL ON public.quiz_responses TO service_role;
ALTER TABLE public.quiz_responses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own responses" ON public.quiz_responses FOR ALL TO authenticated USING (auth.uid()=user_id) WITH CHECK (auth.uid()=user_id);

-- ============ INTERNSHIPS ============
CREATE TABLE public.internships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  company text NOT NULL,
  stipend text,
  location text,
  mode text CHECK (mode IN ('remote','onsite','hybrid')),
  skills text[] NOT NULL DEFAULT '{}',
  description text,
  deadline date,
  apply_url text NOT NULL,
  source text DEFAULT 'manual',
  verified boolean NOT NULL DEFAULT true,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.internships TO authenticated;
GRANT ALL ON public.internships TO service_role;
ALTER TABLE public.internships ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read active internships" ON public.internships FOR SELECT TO authenticated USING (active = true);

CREATE TABLE public.student_internships (
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  internship_id uuid NOT NULL REFERENCES public.internships(id) ON DELETE CASCADE,
  bookmarked boolean NOT NULL DEFAULT false,
  status text CHECK (status IN ('applied','interview','selected','rejected')),
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, internship_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.student_internships TO authenticated;
GRANT ALL ON public.student_internships TO service_role;
ALTER TABLE public.student_internships ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own internship state" ON public.student_internships FOR ALL TO authenticated USING (auth.uid()=user_id) WITH CHECK (auth.uid()=user_id);

-- ============ GUIDANCE ============
CREATE TABLE public.interest_responses (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  answers jsonb NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.interest_responses TO authenticated;
GRANT ALL ON public.interest_responses TO service_role;
ALTER TABLE public.interest_responses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own interests" ON public.interest_responses FOR ALL TO authenticated USING (auth.uid()=user_id) WITH CHECK (auth.uid()=user_id);

CREATE TABLE public.guidance_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  scores jsonb NOT NULL,
  recommended text NOT NULL,
  phase int NOT NULL DEFAULT 1,
  roadmap jsonb NOT NULL,
  summary text NOT NULL
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.guidance_reports TO authenticated;
GRANT ALL ON public.guidance_reports TO service_role;
ALTER TABLE public.guidance_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own reports" ON public.guidance_reports FOR ALL TO authenticated USING (auth.uid()=user_id) WITH CHECK (auth.uid()=user_id);

-- ============ SEED CURRICULUM ============
INSERT INTO public.semesters (id,name,description) VALUES
 (3,'Semester 3','Core CS foundations'),
 (4,'Semester 4','Algorithms and systems');

-- Helper local block to seed subjects/units/topics/resources/questions
DO $$
DECLARE
  s_dsa uuid; s_os uuid; s_dbms uuid; s_cn uuid; s_oop uuid; s_web uuid;
  u uuid; t uuid;
BEGIN
  -- Subjects sem 3
  INSERT INTO public.subjects (semester_id,code,name,icon,position) VALUES (3,'CS301','Data Structures & Algorithms','Network',1) RETURNING id INTO s_dsa;
  INSERT INTO public.subjects (semester_id,code,name,icon,position) VALUES (3,'CS302','Object Oriented Programming','Boxes',2) RETURNING id INTO s_oop;
  INSERT INTO public.subjects (semester_id,code,name,icon,position) VALUES (3,'CS303','Database Management Systems','Database',3) RETURNING id INTO s_dbms;
  -- Subjects sem 4
  INSERT INTO public.subjects (semester_id,code,name,icon,position) VALUES (4,'CS401','Operating Systems','Cpu',1) RETURNING id INTO s_os;
  INSERT INTO public.subjects (semester_id,code,name,icon,position) VALUES (4,'CS402','Computer Networks','Wifi',2) RETURNING id INTO s_cn;
  INSERT INTO public.subjects (semester_id,code,name,icon,position) VALUES (4,'CS403','Web Development','Globe',3) RETURNING id INTO s_web;

  -- DSA units & topics
  INSERT INTO public.units (subject_id,name,position) VALUES (s_dsa,'Arrays & Strings',1) RETURNING id INTO u;
  INSERT INTO public.topics (unit_id,name,summary,position) VALUES (u,'Two Pointers','Classic technique for sorted array problems',1) RETURNING id INTO t;
  INSERT INTO public.resources (topic_id,youtube_id,title,channel,language,duration_min) VALUES
    (t,'jzZsG8n2R9A','Two Pointer Technique','take U forward','English',22),
    (t,'On03HWe2tZM','Two Pointer in Hindi','Apna College','Hindi',18);
  INSERT INTO public.questions (topic_id,subject_id,difficulty,prompt,options,correct_idx,explanation) VALUES
    (t,s_dsa,'Easy','Two pointer technique works best on which type of array?','["Sorted","Unsorted","Linked","2D"]'::jsonb,0,'Two pointer relies on monotonic ordering, so sorted arrays are ideal.'),
    (t,s_dsa,'Medium','Time complexity of finding a pair with sum X in sorted array using two pointers?','["O(n^2)","O(n log n)","O(n)","O(1)"]'::jsonb,2,'Each pointer moves at most n times so total O(n).');

  INSERT INTO public.topics (unit_id,name,summary,position) VALUES (u,'Sliding Window','Subarray problems in O(n)',2) RETURNING id INTO t;
  INSERT INTO public.resources (topic_id,youtube_id,title,channel,language,duration_min) VALUES
    (t,'MK-NZ4hN7rs','Sliding Window Pattern','NeetCode','English',26);
  INSERT INTO public.questions (topic_id,subject_id,difficulty,prompt,options,correct_idx,explanation) VALUES
    (t,s_dsa,'Medium','Max sum of subarray of size k can be solved in?','["O(nk)","O(n log k)","O(n)","O(k^2)"]'::jsonb,2,'Sliding window gives linear time by reusing the previous window sum.');

  INSERT INTO public.units (subject_id,name,position) VALUES (s_dsa,'Trees & Graphs',2) RETURNING id INTO u;
  INSERT INTO public.topics (unit_id,name,summary,position) VALUES (u,'Binary Tree Traversal','Inorder, preorder, postorder, level order',1) RETURNING id INTO t;
  INSERT INTO public.resources (topic_id,youtube_id,title,channel,language,duration_min) VALUES
    (t,'76dhtgZt38A','Tree Traversal Explained','take U forward','English',30);
  INSERT INTO public.questions (topic_id,subject_id,difficulty,prompt,options,correct_idx,explanation) VALUES
    (t,s_dsa,'Easy','Which traversal of BST gives sorted order?','["Preorder","Inorder","Postorder","Level order"]'::jsonb,1,'Inorder of a BST visits nodes in ascending order.');

  -- DBMS
  INSERT INTO public.units (subject_id,name,position) VALUES (s_dbms,'Relational Model',1) RETURNING id INTO u;
  INSERT INTO public.topics (unit_id,name,summary,position) VALUES (u,'Normalization','1NF, 2NF, 3NF, BCNF',1) RETURNING id INTO t;
  INSERT INTO public.resources (topic_id,youtube_id,title,channel,language,duration_min) VALUES
    (t,'GFQaEYEc8_8','Normalization Crash Course','Gate Smashers','Hindi',25);
  INSERT INTO public.questions (topic_id,subject_id,difficulty,prompt,options,correct_idx,explanation) VALUES
    (t,s_dbms,'Medium','3NF eliminates which dependency?','["Functional","Transitive","Multi-valued","Trivial"]'::jsonb,1,'3NF removes transitive dependencies on non-prime attributes.');

  -- OS
  INSERT INTO public.units (subject_id,name,position) VALUES (s_os,'Process Management',1) RETURNING id INTO u;
  INSERT INTO public.topics (unit_id,name,summary,position) VALUES (u,'CPU Scheduling','FCFS, SJF, RR, Priority',1) RETURNING id INTO t;
  INSERT INTO public.resources (topic_id,youtube_id,title,channel,language,duration_min) VALUES
    (t,'2h3eJ-vH3iE','CPU Scheduling Algorithms','Neso Academy','English',45);
  INSERT INTO public.questions (topic_id,subject_id,difficulty,prompt,options,correct_idx,explanation) VALUES
    (t,s_os,'Easy','Which scheduling can cause starvation?','["FCFS","Round Robin","Priority","All of these"]'::jsonb,2,'Low priority jobs may wait indefinitely.');

  -- CN
  INSERT INTO public.units (subject_id,name,position) VALUES (s_cn,'TCP/IP Stack',1) RETURNING id INTO u;
  INSERT INTO public.topics (unit_id,name,summary,position) VALUES (u,'OSI vs TCP/IP','Layered model comparison',1) RETURNING id INTO t;
  INSERT INTO public.resources (topic_id,youtube_id,title,channel,language,duration_min) VALUES
    (t,'vv4y_uOneC0','OSI Model','PowerCert Animated','English',12);
  INSERT INTO public.questions (topic_id,subject_id,difficulty,prompt,options,correct_idx,explanation) VALUES
    (t,s_cn,'Easy','How many layers in TCP/IP model?','["4","5","6","7"]'::jsonb,0,'TCP/IP has 4 layers: Link, Internet, Transport, Application.');

  -- Web
  INSERT INTO public.units (subject_id,name,position) VALUES (s_web,'Frontend',1) RETURNING id INTO u;
  INSERT INTO public.topics (unit_id,name,summary,position) VALUES (u,'React Basics','Components, props, state',1) RETURNING id INTO t;
  INSERT INTO public.resources (topic_id,youtube_id,title,channel,language,duration_min) VALUES
    (t,'SqcY0GlETPk','React in 100 minutes','Fireship','English',100);
  INSERT INTO public.questions (topic_id,subject_id,difficulty,prompt,options,correct_idx,explanation) VALUES
    (t,s_web,'Easy','React state updates are?','["Synchronous","Asynchronous","Blocking","None"]'::jsonb,1,'State updates are batched and asynchronous.');

  -- OOP
  INSERT INTO public.units (subject_id,name,position) VALUES (s_oop,'Pillars of OOP',1) RETURNING id INTO u;
  INSERT INTO public.topics (unit_id,name,summary,position) VALUES (u,'Polymorphism','Compile-time and runtime',1) RETURNING id INTO t;
  INSERT INTO public.resources (topic_id,youtube_id,title,channel,language,duration_min) VALUES
    (t,'PFmuCDHHpwk','Polymorphism explained','Telusko','English',15);
  INSERT INTO public.questions (topic_id,subject_id,difficulty,prompt,options,correct_idx,explanation) VALUES
    (t,s_oop,'Medium','Method overloading is which type of polymorphism?','["Runtime","Compile-time","Dynamic","None"]'::jsonb,1,'Overloading is resolved at compile-time.');

END $$;

-- ============ SEED INTERNSHIPS ============
INSERT INTO public.internships (title,company,stipend,location,mode,skills,description,deadline,apply_url) VALUES
 ('SDE Intern','Flipkart','₹60,000/month','Bengaluru','onsite',ARRAY['DSA','Java','System Design'],'6-month SDE internship with PPO potential.', CURRENT_DATE + 30,'https://flipkartcareers.com'),
 ('Frontend Intern','Razorpay','₹40,000/month','Remote','remote',ARRAY['React','TypeScript','CSS'],'Build merchant dashboard components.', CURRENT_DATE + 20,'https://razorpay.com/jobs'),
 ('ML Intern','Swiggy','₹50,000/month','Bengaluru','hybrid',ARRAY['Python','ML','SQL'],'Demand forecasting models.', CURRENT_DATE + 25,'https://careers.swiggy.com'),
 ('Backend Intern','Zoho','₹25,000/month','Chennai','onsite',ARRAY['Java','Spring','MySQL'],'Work on Zoho CRM backend services.', CURRENT_DATE + 40,'https://careers.zohocorp.com'),
 ('DevOps Intern','Freshworks','₹35,000/month','Hyderabad','hybrid',ARRAY['AWS','Docker','Linux'],'Improve CI/CD pipelines.', CURRENT_DATE + 35,'https://freshworks.com/careers'),
 ('Data Science Intern','PhonePe','₹55,000/month','Pune','onsite',ARRAY['Python','SQL','Statistics'],'Fraud detection signals.', CURRENT_DATE + 15,'https://phonepe.com/careers'),
 ('Android Intern','Paytm','₹30,000/month','Noida','onsite',ARRAY['Kotlin','Android','Jetpack'],'Build features for the merchant app.', CURRENT_DATE + 28,'https://paytm.com/careers'),
 ('Full Stack Intern','Zerodha','₹45,000/month','Bengaluru','onsite',ARRAY['React','Node.js','PostgreSQL'],'Work on Kite web platform.', CURRENT_DATE + 22,'https://zerodha.com/careers'),
 ('Cybersecurity Intern','TCS','₹20,000/month','Mumbai','onsite',ARRAY['Networking','Linux','Security'],'SOC operations.', CURRENT_DATE + 45,'https://tcs.com/careers'),
 ('Cloud Intern','Infosys','₹22,000/month','Pune','hybrid',ARRAY['AWS','Azure','Terraform'],'Cloud infra automation.', CURRENT_DATE + 50,'https://infosys.com/careers');
