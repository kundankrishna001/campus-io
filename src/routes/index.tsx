import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { ArrowRight, BookOpen, Brain, Briefcase, Compass, Github, GraduationCap, Heart, Linkedin, Mail, Sparkles, Trophy, CheckCircle2, UserCircle2 } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

export const Route = createFileRoute("/")({
  ssr: false,
  beforeLoad: async () => {
    const { supabase } = await import("@/integrations/supabase/client");
    const { data } = await supabase.auth.getUser();
    if (data.user) throw redirect({ to: "/dashboard" });
  },
  head: () => ({
    meta: [
      { title: "Campus IO — Learn, Prep & Place for Indian CS/IT students" },
      { name: "description", content: "Syllabus, quizzes, curated YouTube resources, internships and AI career guidance — built for Indian engineering students." },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen bg-hero">
      {/* Header */}
      <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5">
        <div className="flex items-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-primary shadow-glow">
            <GraduationCap className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-display text-xl font-bold">Campus IO</span>
        </div>
        <nav className="hidden items-center gap-6 md:flex">
          <a href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Features</a>
          <a href="#about" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">About</a>
          <a href="#developer" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Developer</a>
        </nav>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Link to="/auth" className="rounded-full bg-gradient-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-glow">
            Sign in
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="mx-auto max-w-4xl px-4 pb-16 pt-12 text-center md:pt-20">
        <h1 className="text-balance font-display text-4xl font-extrabold leading-[1.1] md:text-6xl">
          Your Complete{" "}
          <span className="bg-gradient-primary bg-clip-text text-transparent">Campus Placement</span>{" "}
          Companion
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-balance text-base text-muted-foreground md:text-lg">
          Curated YouTube lessons in English &amp; Hindi, MCQ quizzes, internships from top Indian companies, and a
          personal AI career mentor — free for students.
        </p>
        <div className="mt-7 flex justify-center gap-3">
          <Link to="/auth" className="inline-flex items-center gap-2 rounded-xl bg-gradient-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-glow transition-transform hover:scale-[1.02]">
            Get started free <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">No credit card • 10,000+ students preparing daily</p>
      </section>

      {/* Features Grid */}
      <section id="features" className="mx-auto grid max-w-5xl grid-cols-1 gap-4 px-4 pb-20 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((f) => (
          <div key={f.title} className="rounded-2xl border border-border/60 bg-card/60 p-5 shadow-card backdrop-blur">
            <div className="mb-3 grid h-10 w-10 place-items-center rounded-lg bg-primary/10 text-primary">
              <f.icon className="h-5 w-5" />
            </div>
            <h3 className="font-display text-base font-semibold">{f.title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{f.desc}</p>
          </div>
        ))}
      </section>

      {/* About Section */}
      <section id="about" className="mx-auto max-w-4xl px-4 pb-24">
        <div className="rounded-3xl border border-border/60 bg-card/60 p-8 shadow-card backdrop-blur md:p-12">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            <Heart className="h-3.5 w-3.5" /> About the Project
          </div>
          <h2 className="font-display text-3xl font-extrabold md:text-4xl">
            Empowering the next generation of <span className="bg-gradient-primary bg-clip-text text-transparent">Engineers</span>
          </h2>
          
          <div className="mt-8 grid gap-8 md:grid-cols-2">
            <div>
              <h3 className="font-display text-xl font-bold text-foreground">Usage & Purpose</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                Campus IO is a centralized EdTech portal designed specifically for Computer Science and IT students. It bridges the gap between academic learning and industry requirements by providing a single platform for curated syllabus videos, interactive quizzes, internship tracking, and AI-driven career guidance.
              </p>
            </div>
            
            <div>
              <h3 className="font-display text-xl font-bold text-foreground">Tech Stack & Languages</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                Built using modern, scalable web technologies:
              </p>
              <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                <li className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-primary" /> <strong>Frontend:</strong> React 19, TypeScript, Tailwind CSS v4</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-primary" /> <strong>Backend & DB:</strong> Supabase (PostgreSQL)</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-primary" /> <strong>AI Integration:</strong> Google Gemini API</li>
              </ul>
            </div>

            <div>
              <h3 className="font-display text-xl font-bold text-foreground">Domain</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                <strong>Educational Technology (EdTech) & Career Development.</strong> The platform focuses on the higher education sector, specifically targeting engineering students who need structured preparation for campus placements and off-campus tech roles.
              </p>
            </div>

            <div>
              <h3 className="font-display text-xl font-bold text-foreground">Real-World Practical Use</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                In the real world, students often struggle to find structured resources and track their placement readiness. Campus IO solves this by giving them a personalized 6-month roadmap, conducting mock HR interviews using AI, generating ATS-friendly resumes, and curating active internships from top companies like Flipkart and Razorpay.
              </p>
            </div>
          </div>

          <div className="mt-10 flex flex-wrap gap-3 border-t border-border/60 pt-6">
            <a href="https://www.linkedin.com/in/kundan-krishna-1810b811a" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-xl border border-border/60 bg-background/60 px-4 py-2 text-sm font-semibold transition hover:border-primary hover:text-primary">
              <Linkedin className="h-4 w-4" /> Contact Us
            </a>
            <a href="https://github.com/kundankrishna001" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-xl border border-border/60 bg-background/60 px-4 py-2 text-sm font-semibold transition hover:border-primary hover:text-primary">
              <Github className="h-4 w-4" /> GitHub Repository
            </a>
          </div>
        </div>
      </section>

      {/* Developer Section */}
      <section id="developer" className="mx-auto max-w-4xl px-4 pb-24">
        <div className="rounded-3xl border border-border/60 bg-card/60 p-8 shadow-card backdrop-blur md:p-12">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            <UserCircle2 className="h-3.5 w-3.5" /> Meet the Developer
          </div>
          <h2 className="font-display text-3xl font-extrabold md:text-4xl">
            Built with passion for <span className="bg-gradient-primary bg-clip-text text-transparent">EdTech</span> and accessible design
          </h2>
          
          <div className="mt-8 flex flex-col gap-8 md:flex-row md:items-start">
            <div className="flex-1">
              <h3 className="font-display text-2xl font-bold text-foreground">Kundan Krishna</h3>
              <p className="text-sm font-medium text-primary">Computer Science & Engineering Student</p>
              <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
                Kundan Krishna is a Computer Science & Engineering student passionate about software development, artificial intelligence, full-stack web development, and building impactful technology solutions. Campus IO was developed as a modern EdTech platform that combines academic learning with placement preparation and AI-driven career guidance to create a smarter path to success for engineering students.
              </p>
              
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">University</p>
                  <p className="mt-1 text-sm font-medium text-foreground">Sathyabama Institute of Science and Technology, Chennai</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Focus</p>
                  <p className="mt-1 text-sm font-medium text-foreground">AI • Full-stack • EdTech</p>
                </div>
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                <a href="https://github.com/kundankrishna001" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-xl border border-border/60 bg-background/60 px-4 py-2 text-sm font-semibold transition hover:border-primary hover:text-primary">
                  <Github className="h-4 w-4" /> GitHub
                </a>
                <a href="https://www.linkedin.com/in/kundan-krishna-1810b811a" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-xl border border-border/60 bg-background/60 px-4 py-2 text-sm font-semibold transition hover:border-primary hover:text-primary">
                  <Linkedin className="h-4 w-4" /> LinkedIn
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

const FEATURES = [
  { icon: BookOpen, title: "Syllabus-mapped learning", desc: "Sem-wise units and topics with curated YouTube videos in English and Hindi." },
  { icon: Brain, title: "Quiz engine", desc: "Timed MCQs by topic and difficulty. Wrong answers come with clear explanations." },
  { icon: Briefcase, title: "Internships", desc: "Listings from Flipkart, Razorpay, Swiggy, Zoho and more — with skill-match %." },
  { icon: Compass, title: "AI career guidance", desc: "Your interests + grades → a 6-month domain roadmap, refreshed monthly." },
  { icon: Trophy, title: "Placement readiness", desc: "Live score from your DSA, core subjects, aptitude and mocks." },
  { icon: Sparkles, title: "Built for India", desc: "Indian colleges, companies, rupee stipends and regional resources." },
];
