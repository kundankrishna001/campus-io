import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Bookmark, BookmarkCheck, Briefcase, ExternalLink, MapPin, Wallet } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { DEMO_INTERNSHIPS } from "@/lib/demo-data";

export const Route = createFileRoute("/_authenticated/internships")({
  head: () => ({ meta: [{ title: "Internships — Campus IO" }] }),
  component: InternshipsPage,
});

const STATUSES = ["applied", "interview", "selected", "rejected"] as const;

function InternshipsPage() {
  const qc = useQueryClient();
  const [mode, setMode] = useState<string>("all");
  const [q, setQ] = useState("");

  const { data } = useQuery({
    queryKey: ["internships"],
    queryFn: async () => {
      const [{ data: list }, { data: my }, { data: skills }] = await Promise.all([
        supabase.from("internships").select("*").eq("active", true).order("created_at", { ascending: false }),
        supabase.from("student_internships").select("*"),
        supabase.from("user_skills").select("skill"),
      ]);
      const internshipsList = list && list.length > 0 ? list : DEMO_INTERNSHIPS;
      const myMap = new Map((my ?? []).map((m) => [m.internship_id, m]));
      const userSkills = new Set((skills ?? []).map((s) => s.skill.toLowerCase()));
      const enriched = internshipsList.map((i) => {
        const reqd = i.skills ?? [];
        const matched = reqd.filter((s: string) => userSkills.has(s.toLowerCase())).length;
        const pct = reqd.length ? Math.round((matched / reqd.length) * 100) : 0;
        return { ...i, match: pct, mine: myMap.get(i.id) };
      });
      return enriched.sort((a, b) => b.match - a.match);
    },
  });

  const toggleBookmark = useMutation({
    mutationFn: async ({ id, on }: { id: string; on: boolean }) => {
      const { data: u } = await supabase.auth.getUser();
      const { error } = await supabase.from("student_internships").upsert({ user_id: u.user!.id, internship_id: id, bookmarked: on });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["internships"] }),
  });

  const setStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { data: u } = await supabase.auth.getUser();
      const { error } = await supabase.from("student_internships").upsert({ user_id: u.user!.id, internship_id: id, status: status as any });
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["internships"] }); toast.success("Status updated"); },
  });

  const filtered = (data ?? []).filter((i) => (mode === "all" || i.mode === mode) && (q === "" || i.title.toLowerCase().includes(q.toLowerCase()) || i.company.toLowerCase().includes(q.toLowerCase())));

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-2xl font-bold">Internships</h1>
        <p className="text-sm text-muted-foreground">Sorted by how well they match your skills.</p>
      </div>

      <div className="flex flex-wrap gap-2">
        <Input placeholder="Search role or company…" value={q} onChange={(e) => setQ(e.target.value)} className="max-w-xs" />
        <Select value={mode} onValueChange={setMode}>
          <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All modes</SelectItem>
            <SelectItem value="remote">Remote</SelectItem>
            <SelectItem value="onsite">Onsite</SelectItem>
            <SelectItem value="hybrid">Hybrid</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {filtered.map((i) => (
          <div key={i.id} className="rounded-2xl border border-border/60 bg-card p-4 shadow-card">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-2"><Briefcase className="h-4 w-4 text-primary" /><span className="text-xs text-muted-foreground">{i.company}</span></div>
                <h3 className="mt-1 font-display text-base font-bold">{i.title}</h3>
              </div>
              <button onClick={() => toggleBookmark.mutate({ id: i.id, on: !i.mine?.bookmarked })} className="rounded-full p-1.5 hover:bg-secondary">
                {i.mine?.bookmarked ? <BookmarkCheck className="h-4 w-4 text-accent" /> : <Bookmark className="h-4 w-4 text-muted-foreground" />}
              </button>
            </div>

            <div className="mt-2 flex flex-wrap gap-2 text-xs text-muted-foreground">
              {i.stipend && <span className="inline-flex items-center gap-1"><Wallet className="h-3 w-3" /> {i.stipend}</span>}
              {i.location && <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" /> {i.location}</span>}
              {i.mode && <Badge variant="secondary" className="text-[10px] uppercase">{i.mode}</Badge>}
            </div>

            <div className="mt-3 flex flex-wrap gap-1">{(i.skills ?? []).map((s: string) => <Badge key={s} variant="outline" className="text-[10px]">{s}</Badge>)}</div>

            <div className="mt-3 flex items-center gap-2">
              <div className="flex-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Skill match</span>
                  <span className={cn("font-semibold", i.match >= 70 ? "text-success" : i.match >= 40 ? "text-accent" : "text-muted-foreground")}>{i.match}%</span>
                </div>
                <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-secondary"><div className={cn("h-full", i.match >= 70 ? "bg-success" : i.match >= 40 ? "bg-gradient-accent" : "bg-muted-foreground/40")} style={{ width: `${i.match}%` }} /></div>
              </div>
            </div>

            <div className="mt-3 flex items-center gap-2">
              <Select value={i.mine?.status ?? ""} onValueChange={(v) => setStatus.mutate({ id: i.id, status: v })}>
                <SelectTrigger className="h-9 w-[140px] text-xs"><SelectValue placeholder="Track status" /></SelectTrigger>
                <SelectContent>{STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
              <a href={i.apply_url} target="_blank" rel="noreferrer" className="ml-auto">
                <Button size="sm" className="bg-gradient-primary text-primary-foreground">Apply <ExternalLink className="ml-1 h-3 w-3" /></Button>
              </a>
            </div>
            {i.deadline && <p className="mt-2 text-[11px] text-muted-foreground">Apply by {new Date(i.deadline).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</p>}
          </div>
        ))}
        {filtered.length === 0 && <p className="text-sm text-muted-foreground">No internships match these filters.</p>}
      </div>
    </div>
  );
}
