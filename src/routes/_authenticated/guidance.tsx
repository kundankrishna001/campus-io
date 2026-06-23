import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useServerFn } from "@tanstack/react-start";
import { generateGuidanceReport } from "@/lib/guidance.functions";
import { Loader2, RefreshCw, Sparkles, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from "recharts";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/guidance")({
  head: () => ({ meta: [{ title: "Career Guidance — Campus IO" }] }),
  component: GuidancePage,
});

function GuidancePage() {
  const qc = useQueryClient();
  const gen = useServerFn(generateGuidanceReport);

  const { data: reports } = useQuery({
    queryKey: ["guidance"],
    queryFn: async () => (await supabase.from("guidance_reports").select("*").order("created_at", { ascending: false })).data ?? [],
  });

  const { data: interests } = useQuery({
    queryKey: ["interests"],
    queryFn: async () => (await supabase.from("interest_responses").select("answers").maybeSingle()).data,
  });

  const mutate = useMutation({
    mutationFn: async () => await gen(),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["guidance"] }); toast.success("New report generated!"); },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Could not generate report"),
  });

  const latest = reports?.[0];

  if (!interests) {
    return (
      <div className="rounded-2xl border border-border/60 bg-card p-6 text-center">
        <Sparkles className="mx-auto h-8 w-8 text-primary" />
        <h2 className="mt-3 font-display text-xl font-bold">Tell us what you love first</h2>
        <p className="mt-1 text-sm text-muted-foreground">Complete onboarding so your AI mentor can build your roadmap.</p>
        <Link to="/onboarding" className="mt-4 inline-flex rounded-lg bg-gradient-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-glow">Finish onboarding</Link>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-end justify-between gap-2">
        <div>
          <h1 className="font-display text-2xl font-bold">AI career guidance</h1>
          <p className="text-sm text-muted-foreground">Domain fit, recommended next steps and a 6-month roadmap.</p>
        </div>
        <Button onClick={() => mutate.mutate()} disabled={mutate.isPending} className="bg-gradient-primary text-primary-foreground shadow-glow">
          {mutate.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
          {latest ? "Regenerate" : "Generate report"}
        </Button>
      </div>

      {!latest && (
        <div className="rounded-2xl border border-border/60 bg-card p-6 text-center text-sm text-muted-foreground">
          No report yet — hit <span className="text-foreground">Generate report</span> above. AI will analyse your profile in 5–10 seconds.
        </div>
      )}

      {latest && (
        <>
          <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-card">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Recommended domain</p>
                <h2 className="mt-1 font-display text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">{latest.recommended}</h2>
                <p className="mt-1 text-xs text-muted-foreground">Phase {latest.phase} • Generated {new Date(latest.created_at).toLocaleDateString("en-IN", { day:"numeric",month:"short",year:"numeric" })}</p>
              </div>
              <div className="h-48 w-full max-w-xs">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={Object.entries(latest.scores as Record<string, number>).map(([k, v]) => ({ domain: k, score: v }))}>
                    <PolarGrid stroke="var(--color-border)" />
                    <PolarAngleAxis dataKey="domain" tick={{ fill: "var(--color-muted-foreground)", fontSize: 10 }} />
                    <Radar dataKey="score" stroke="var(--color-primary)" fill="var(--color-primary)" fillOpacity={0.3} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <p className="mt-3 text-sm text-foreground/90">{latest.summary}</p>
          </div>

          <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-card">
            <div className="mb-3 flex items-center gap-2"><Target className="h-4 w-4 text-primary" /><h3 className="font-display font-semibold">6-month roadmap</h3></div>
            <ol className="space-y-3">
              {(latest.roadmap as any[]).map((m, i) => (
                <li key={i} className="flex gap-3 rounded-xl border border-border/60 bg-secondary/30 p-3">
                  <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-gradient-primary font-display text-sm font-bold text-primary-foreground">{m.month ?? i + 1}</div>
                  <div>
                    <div className="font-semibold">{m.title}</div>
                    <p className="text-sm text-muted-foreground">{m.focus}</p>
                    {Array.isArray(m.tasks) && (
                      <ul className="mt-1 list-inside list-disc text-xs text-muted-foreground">
                        {m.tasks.map((t: string, j: number) => <li key={j}>{t}</li>)}
                      </ul>
                    )}
                  </div>
                </li>
              ))}
            </ol>
          </div>

          {reports && reports.length > 1 && (
            <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-card">
              <h3 className="font-display font-semibold">History</h3>
              <ul className="mt-2 divide-y divide-border/60 text-sm">
                {reports.slice(1).map((r) => (
                  <li key={r.id} className="flex items-center justify-between py-2">
                    <span>{new Date(r.created_at).toLocaleDateString("en-IN")}</span>
                    <span className="text-muted-foreground">{r.recommended}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </div>
  );
}
