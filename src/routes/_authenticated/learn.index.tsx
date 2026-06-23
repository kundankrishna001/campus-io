import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ChevronDown, ChevronRight, CheckCircle2, Circle, PlayCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { DEMO_SYLLABUS } from "@/lib/demo-data";

export const Route = createFileRoute("/_authenticated/learn/")({
  head: () => ({ meta: [{ title: "Learn — Campus IO" }] }),
  component: LearnPage,
});

type Topic = { id: string; name: string; summary: string | null };
type Unit = { id: string; name: string; topics: Topic[] };
type Subject = { id: string; name: string; code: string | null; icon: string | null; units: Unit[] };
type Sem = { id: number; name: string; subjects: Subject[] };

function LearnPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["syllabus"],
    queryFn: async (): Promise<Sem[]> => {
      const [{ data: sems }, { data: subjects }, { data: units }, { data: topics }, { data: progress }] = await Promise.all([
        supabase.from("semesters").select("*").order("id"),
        supabase.from("subjects").select("*").order("position"),
        supabase.from("units").select("*").order("position"),
        supabase.from("topics").select("*").order("position"),
        supabase.from("topic_progress").select("topic_id, status"),
      ]);
      
      if (!sems || sems.length === 0) {
        return DEMO_SYLLABUS as Sem[];
      }
      
      const progMap = new Map((progress ?? []).map((p) => [p.topic_id, p.status]));
      (window as any).__progress = progMap;
      const out: Sem[] = (sems ?? []).map((s) => ({
        id: s.id, name: s.name,
        subjects: (subjects ?? []).filter((su) => su.semester_id === s.id).map((su) => ({
          id: su.id, name: su.name, code: su.code, icon: su.icon,
          units: (units ?? []).filter((u) => u.subject_id === su.id).map((u) => ({
            id: u.id, name: u.name,
            topics: (topics ?? []).filter((t) => t.unit_id === u.id),
          })),
        })),
      }));
      return out;
    },
  });

  if (isLoading || !data) return <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-32 animate-pulse rounded-2xl bg-card" />)}</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Academic learning</h1>
        <p className="text-sm text-muted-foreground">Semester-wise syllabus with curated videos.</p>
      </div>

      {data.map((sem) => (
        <section key={sem.id} className="space-y-3">
          <h2 className="font-display text-lg font-semibold text-muted-foreground">{sem.name}</h2>
          <div className="grid gap-3 md:grid-cols-2">
            {sem.subjects.map((su) => <SubjectCard key={su.id} subject={su} />)}
          </div>
        </section>
      ))}
    </div>
  );
}

function SubjectCard({ subject }: { subject: Subject }) {
  const [open, setOpen] = useState(true);
  const total = subject.units.reduce((a, u) => a + u.topics.length, 0);
  const progress: Map<string, string> = (window as any).__progress ?? new Map();
  const completed = subject.units.flatMap((u) => u.topics).filter((t) => progress.get(t.id) === "completed").length;
  const pct = total ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="rounded-2xl border border-border/60 bg-card shadow-card">
      <button onClick={() => setOpen(!open)} className="flex w-full items-center justify-between gap-3 p-4 text-left">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-display font-semibold">{subject.name}</span>
            {subject.code && <span className="text-xs text-muted-foreground">{subject.code}</span>}
          </div>
          <div className="mt-1.5 flex items-center gap-2">
            <div className="h-1.5 w-32 overflow-hidden rounded-full bg-secondary"><div className="h-full bg-gradient-primary" style={{ width: `${pct}%` }} /></div>
            <span className="text-[11px] text-muted-foreground">{completed}/{total}</span>
          </div>
        </div>
        {open ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
      </button>
      {open && (
        <div className="border-t border-border/60 p-2">
          {subject.units.map((u) => (
            <div key={u.id} className="px-2 py-2">
              <div className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{u.name}</div>
              <ul className="space-y-1">
                {u.topics.map((t) => {
                  const status = progress.get(t.id) ?? "not_started";
                  const Icon = status === "completed" ? CheckCircle2 : status === "in_progress" ? PlayCircle : Circle;
                  return (
                    <li key={t.id}>
                      <Link to="/learn/$topicId" params={{ topicId: t.id }}
                        className="flex items-center gap-2 rounded-lg p-2 text-sm transition hover:bg-secondary/60">
                        <Icon className={cn("h-4 w-4 shrink-0", status === "completed" ? "text-success" : status === "in_progress" ? "text-accent" : "text-muted-foreground")} />
                        <span className="flex-1">{t.name}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
