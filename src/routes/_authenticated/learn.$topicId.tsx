import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, CheckCircle2, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { awardXp } from "@/lib/gamification.functions";
import { DEMO_RESOURCES, DEMO_SYLLABUS } from "@/lib/demo-data";

export const Route = createFileRoute("/_authenticated/learn/$topicId")({
  head: () => ({ meta: [{ title: "Topic — Campus IO" }] }),
  component: TopicPage,
});

function TopicPage() {
  const { topicId } = Route.useParams();
  const qc = useQueryClient();
  const [lang, setLang] = useState<string>("All");

  const { data } = useQuery({
    queryKey: ["topic", topicId],
    queryFn: async () => {
      const [{ data: topic }, { data: resources }, { data: prog }] = await Promise.all([
        supabase.from("topics").select("*, units(name, subjects(name))").eq("id", topicId).maybeSingle(),
        supabase.from("resources").select("*").eq("topic_id", topicId),
        supabase.from("topic_progress").select("status").eq("topic_id", topicId).maybeSingle(),
      ]);
      
      let finalTopic = topic;
      let finalResources = resources;
      
      if (!topic) {
        // Find topic in demo data
        for (const sem of DEMO_SYLLABUS) {
          for (const sub of sem.subjects) {
            for (const unit of sub.units) {
              const t = unit.topics.find(t => t.id === topicId);
              if (t) {
                finalTopic = { ...t, units: { name: unit.name, subjects: { name: sub.name } } };
                finalResources = (DEMO_RESOURCES as any)[topicId] || [];
                break;
              }
            }
          }
        }
      }
      
      return { topic: finalTopic, resources: finalResources ?? [], status: prog?.status ?? "not_started" };
    },
  });

  const award = useServerFn(awardXp);
  const setStatus = useMutation({
    mutationFn: async (status: "in_progress" | "completed") => {
      const { data: u } = await supabase.auth.getUser();
      const { error } = await supabase.from("topic_progress").upsert({ user_id: u.user!.id, topic_id: topicId, status });
      if (error) throw error;
      if (status === "completed") {
        try {
          const r = await award({ data: { action: "topic_complete" } });
          if (r.newBadges.length) toast.success(`+${r.xpDelta} XP • ${r.newBadges.length} new badge!`);
          else toast.success(`+${r.xpDelta} XP`);
          return;
        } catch {}
      }
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["topic", topicId] }); qc.invalidateQueries({ queryKey: ["syllabus"] }); toast.success("Progress saved"); },
  });

  if (!data) return <div className="h-64 animate-pulse rounded-2xl bg-card" />;

  const languages = ["All", ...Array.from(new Set(data.resources.map((r) => r.language)))];
  const filtered = lang === "All" ? data.resources : data.resources.filter((r) => r.language === lang);

  return (
    <div className="space-y-5">
      <Link to="/learn" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4" /> Back to syllabus</Link>

      <div>
        <p className="text-xs uppercase tracking-wider text-muted-foreground">
          {(data.topic as any)?.units?.subjects?.name} • {(data.topic as any)?.units?.name}
        </p>
        <h1 className="mt-1 font-display text-2xl font-bold md:text-3xl">{data.topic?.name}</h1>
        {data.topic?.summary && <p className="mt-2 text-muted-foreground">{data.topic.summary}</p>}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-muted-foreground"><Globe className="mr-1 inline h-3 w-3" /> Language:</span>
        {languages.map((l) => (
          <button key={l} onClick={() => setLang(l)}
            className={`rounded-full border px-3 py-1 text-xs ${lang === l ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:text-foreground"}`}>
            {l}
          </button>
        ))}
        <div className="ml-auto flex gap-2">
          <Button size="sm" variant="secondary" onClick={() => setStatus.mutate("in_progress")}>Mark in progress</Button>
          <Button size="sm" className="bg-gradient-primary text-primary-foreground" onClick={() => setStatus.mutate("completed")}>
            <CheckCircle2 className="mr-1 h-4 w-4" /> Mark complete
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {filtered.map((r) => (
          <div key={r.id} className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-card">
            <div className="aspect-video bg-black">
              <iframe className="h-full w-full" src={`https://www.youtube.com/embed/${r.youtube_id}`} title={r.title} loading="lazy" allowFullScreen />
            </div>
            <div className="p-4">
              <div className="text-sm font-semibold">{r.title}</div>
              <div className="mt-1 text-xs text-muted-foreground">{r.channel} • {r.language}{r.duration_min ? ` • ${r.duration_min} min` : ""}</div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && <p className="text-sm text-muted-foreground">No resources in this language yet.</p>}
      </div>

      <div className="rounded-2xl border border-border/60 bg-card p-4">
        <h3 className="font-display font-semibold">Test yourself</h3>
        <p className="mt-1 text-sm text-muted-foreground">Quick MCQ quiz on this topic.</p>
        <Link to="/quiz" className="mt-3 inline-flex rounded-lg bg-gradient-accent px-4 py-2 text-sm font-semibold text-accent-foreground shadow-accent">
          Take a quiz →
        </Link>
      </div>
    </div>
  );
}
