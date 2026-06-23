import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Cell } from "recharts";
import { ArrowRight, BookOpen, Brain, Briefcase, Compass, Flame, Star, Target, TrendingUp } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { getMyStats } from "@/lib/gamification.functions";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — Campus IO" }] }),
  component: Dashboard,
});

function Dashboard() {
  const { user } = useAuth();
  const fetchStats = useServerFn(getMyStats);
  const { data: stats } = useQuery({ queryKey: ["my-stats"], queryFn: () => fetchStats(), enabled: !!user });


  const { data: dash } = useQuery({
    queryKey: ["dashboard", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const [{ data: profile }, { data: progress }, { data: sessions }, { data: skills }, { data: bookmarks }] = await Promise.all([
        supabase.from("profiles").select("*").maybeSingle(),
        supabase.from("topic_progress").select("status, topic_id, updated_at"),
        supabase.from("quiz_sessions").select("id, started_at, score, total, subject_id, subjects(name)").not("finished_at", "is", null).order("started_at", { ascending: false }).limit(20),
        supabase.from("user_skills").select("skill"),
        supabase.from("student_internships").select("internship_id").eq("bookmarked", true),
      ]);

      const completed = (progress ?? []).filter((p) => p.status === "completed").length;
      const inProgress = (progress ?? []).filter((p) => p.status === "in_progress").length;

      // weekly progress = completed topics per week (last 6 weeks)
      const now = Date.now();
      const weeks: { week: string; topics: number }[] = [];
      for (let i = 5; i >= 0; i--) {
        const end = now - i * 7 * 86400000;
        const start = end - 7 * 86400000;
        const label = new Date(end).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
        const count = (progress ?? []).filter((p) => {
          const t = new Date(p.updated_at).getTime();
          return p.status === "completed" && t >= start && t < end;
        }).length;
        weeks.push({ week: label, topics: count });
      }

      // subject performance from quiz sessions
      const bySubject: Record<string, { name: string; pct: number; n: number; correct: number }> = {};
      for (const s of sessions ?? []) {
        if (!s.subject_id || !s.subjects) continue;
        const name = (s.subjects as any).name as string;
        const k = s.subject_id;
        bySubject[k] = bySubject[k] ?? { name, pct: 0, n: 0, correct: 0 };
        bySubject[k].n += s.total ?? 0;
        bySubject[k].correct += s.score ?? 0;
      }
      const subjectPerf = Object.values(bySubject).map((s) => ({ name: s.name, score: s.n ? Math.round((s.correct / s.n) * 100) : 0 })).slice(0, 6);

      const totalScore = (sessions ?? []).reduce((a, s) => a + (s.score ?? 0), 0);
      const totalQ = (sessions ?? []).reduce((a, s) => a + (s.total ?? 0), 0);
      const quizAvg = totalQ ? Math.round((totalScore / totalQ) * 100) : 0;

      // Placement readiness (simplified MVP formula)
      const profileScore = profile?.onboarded ? 100 : 40;
      const skillsScore = Math.min(100, (skills?.length ?? 0) * 15);
      const coreScore = quizAvg;
      const readiness = Math.round(
        coreScore * 0.4 + skillsScore * 0.25 + (completed > 0 ? Math.min(100, completed * 8) : 0) * 0.2 + profileScore * 0.15
      );

      return {
        profile, completed, inProgress, weeks, subjectPerf, quizAvg,
        readiness, sessions: sessions ?? [], bookmarks: bookmarks?.length ?? 0,
      };
    },
  });

  if (!dash) return <SkeletonDash />;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold md:text-3xl">
            Hi {dash.profile?.full_name?.split(" ")[0] || "there"} 👋
          </h1>
          <p className="text-sm text-muted-foreground">
            {dash.profile?.onboarded
              ? `Sem ${dash.profile.semester} • ${dash.profile.branch} • CGPA ${dash.profile.cgpa ?? "—"}`
              : <Link to="/onboarding" className="text-primary hover:underline">Finish setting up your profile →</Link>}
          </p>
        </div>
        {stats && (
          <Link to="/achievements" className="flex items-center gap-2 rounded-full border border-border/60 bg-card px-3 py-1.5 text-xs font-semibold shadow-card transition hover:border-primary/50">
            <span className="flex items-center gap-1 text-primary"><Star className="h-3.5 w-3.5" />Lv {stats.level} • {stats.xp} XP</span>
            <span className="h-3 w-px bg-border" />
            <span className="flex items-center gap-1 text-accent"><Flame className="h-3.5 w-3.5" />{stats.current_streak}d</span>
          </Link>
        )}
      </div>


      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat icon={Target} label="Placement readiness" value={`${dash.readiness}%`} hint="Score 0–100" tone="primary" />
        <Stat icon={BookOpen} label="Topics completed" value={dash.completed} hint={`${dash.inProgress} in progress`} />
        <Stat icon={Brain} label="Quiz accuracy" value={`${dash.quizAvg}%`} hint={`${dash.sessions.length} sessions`} />
        <Stat icon={Briefcase} label="Saved internships" value={dash.bookmarks} hint="Bookmarked roles" />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card title="Weekly progress" subtitle="Topics completed in the last 6 weeks">
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dash.weeks}>
                <XAxis dataKey="week" stroke="var(--color-muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--color-muted-foreground)" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 12, color: "var(--color-foreground)" }} />
                <Bar dataKey="topics" fill="var(--color-primary)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Subject performance" subtitle="Quiz accuracy per subject">
          <div className="h-48">
            {dash.subjectPerf.length === 0 ? (
              <EmptyChart label="Take a quiz to see your stats" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dash.subjectPerf} layout="vertical" margin={{ left: 8, right: 8 }}>
                  <XAxis type="number" domain={[0, 100]} hide />
                  <YAxis type="category" dataKey="name" stroke="var(--color-muted-foreground)" fontSize={11} width={120} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 12, color: "var(--color-foreground)" }} />
                  <Bar dataKey="score" radius={[0, 6, 6, 0]}>
                    {dash.subjectPerf.map((d, i) => (
                      <Cell key={i} fill={d.score >= 70 ? "#22c55e" : d.score >= 50 ? "#f59e0b" : "#ef4444"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <NextAction to="/learn" icon={BookOpen} title="Continue learning" desc="Pick up where you left off." />
        <NextAction to="/quiz" icon={Brain} title="Take a quiz" desc="5-question warm-up." />
        <NextAction to="/guidance" icon={Compass} title="Get your AI roadmap" desc="Personalised 6-month plan." />
      </div>

      <Card title="Placement readiness" subtitle={`${dash.readiness}/100 • keep going`}>
        <Progress value={dash.readiness} className="h-3" />
        <p className="mt-2 text-xs text-muted-foreground">
          Quizzes contribute 40%, skills 25%, learning 20%, profile 15%. Take more quizzes and add skills to climb.
        </p>
      </Card>
    </div>
  );
}

function Stat({ icon: Icon, label, value, hint, tone }: { icon: any; label: string; value: any; hint?: string; tone?: "primary" }) {
  return (
    <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-card">
      <div className={`mb-2 inline-grid h-8 w-8 place-items-center rounded-lg ${tone === "primary" ? "bg-gradient-primary text-primary-foreground" : "bg-secondary text-primary"}`}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="font-display text-2xl font-bold leading-none">{value}</div>
      <div className="mt-1 text-xs font-medium text-muted-foreground">{label}</div>
      {hint && <div className="mt-1 text-[11px] text-muted-foreground/70">{hint}</div>}
    </div>
  );
}

function Card({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-card">
      <div className="mb-3"><h3 className="font-display font-semibold">{title}</h3>{subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}</div>
      {children}
    </div>
  );
}

function NextAction({ to, icon: Icon, title, desc }: any) {
  return (
    <Link to={to} className="group rounded-2xl border border-border/60 bg-card p-4 shadow-card transition hover:border-primary/50 hover:shadow-glow">
      <div className="flex items-start gap-3">
        <div className="grid h-9 w-9 place-items-center rounded-lg bg-secondary text-primary"><Icon className="h-4 w-4" /></div>
        <div className="flex-1">
          <div className="flex items-center justify-between gap-2">
            <div className="font-display font-semibold">{title}</div>
            <ArrowRight className="h-4 w-4 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-primary" />
          </div>
          <div className="text-xs text-muted-foreground">{desc}</div>
        </div>
      </div>
    </Link>
  );
}

function EmptyChart({ label }: { label: string }) {
  return (
    <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
      <TrendingUp className="mr-2 h-4 w-4" /> {label}
    </div>
  );
}

function SkeletonDash() {
  return (
    <div className="space-y-4">
      <div className="h-24 animate-pulse rounded-2xl bg-card" />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-24 animate-pulse rounded-2xl bg-card" />)}</div>
      <div className="grid gap-4 md:grid-cols-2"><div className="h-64 animate-pulse rounded-2xl bg-card" /><div className="h-64 animate-pulse rounded-2xl bg-card" /></div>
    </div>
  );
}
