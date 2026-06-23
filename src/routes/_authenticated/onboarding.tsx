import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, X, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/onboarding")({
  head: () => ({ meta: [{ title: "Set up your profile — Campus IO" }] }),
  component: Onboarding,
});

const INTEREST_AREAS = ["Web Dev", "ML / AI", "Backend", "DevOps", "Android", "Cybersecurity", "Data Engineering", "Research"];

function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState({ full_name: "", college: "", branch: "CS", year: "2", semester: "3", cgpa: "8.0" });
  const [skills, setSkills] = useState<{ skill: string; proficiency: string }[]>([]);
  const [skillInput, setSkillInput] = useState("");
  const [interests, setInterests] = useState<string[]>([]);
  const [goal, setGoal] = useState("Get a placement at a top product company");

  useEffect(() => {
    supabase.from("profiles").select("*").maybeSingle().then(({ data }) => {
      if (data) setProfile((p) => ({
        ...p, full_name: data.full_name ?? "", college: data.college ?? "",
        branch: data.branch ?? "CS", year: String(data.year ?? 2),
        semester: String(data.semester ?? 3), cgpa: String(data.cgpa ?? 8.0),
      }));
    });
  }, []);

  function addSkill() {
    const s = skillInput.trim(); if (!s) return;
    if (skills.find((x) => x.skill.toLowerCase() === s.toLowerCase())) return;
    setSkills([...skills, { skill: s, proficiency: "Intermediate" }]);
    setSkillInput("");
  }
  function toggleInterest(x: string) {
    setInterests((arr) => arr.includes(x) ? arr.filter((y) => y !== x) : [...arr, x]);
  }

  async function finish() {
    setLoading(true);
    try {
      const { data: u } = await supabase.auth.getUser();
      const uid = u.user!.id;
      const { error: pErr } = await supabase.from("profiles").upsert({
        id: uid,
        full_name: profile.full_name,
        college: profile.college,
        branch: profile.branch as any,
        year: parseInt(profile.year),
        semester: parseInt(profile.semester),
        cgpa: parseFloat(profile.cgpa),
        onboarded: true,
      });
      if (pErr) throw pErr;

      await supabase.from("user_skills").delete().eq("user_id", uid);
      if (skills.length) {
        await supabase.from("user_skills").insert(skills.map((s) => ({ ...s, user_id: uid })));
      }
      await supabase.from("interest_responses").upsert({ user_id: uid, answers: { interests, goal } });
      toast.success("Profile saved!");
      navigate({ to: "/dashboard" });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not save profile");
    } finally { setLoading(false); }
  }

  const steps = ["Profile", "Skills", "Interests"];

  return (
    <div className="mx-auto max-w-xl">
      <div className="mb-6 flex items-center gap-2">
        {steps.map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`grid h-7 w-7 place-items-center rounded-full text-xs font-semibold ${i <= step ? "bg-gradient-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}>{i + 1}</div>
            <span className={`text-sm ${i === step ? "text-foreground" : "text-muted-foreground"}`}>{s}</span>
            {i < steps.length - 1 && <div className="mx-2 h-px w-6 bg-border" />}
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-card">
        {step === 0 && (
          <div className="space-y-4">
            <h2 className="font-display text-xl font-bold">Tell us about yourself</h2>
            <div><Label>Full name</Label><Input value={profile.full_name} onChange={(e) => setProfile({ ...profile, full_name: e.target.value })} placeholder="Aarav Sharma" /></div>
            <div><Label>College</Label><Input value={profile.college} onChange={(e) => setProfile({ ...profile, college: e.target.value })} placeholder="IIT Bombay" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Branch</Label>
                <Select value={profile.branch} onValueChange={(v) => setProfile({ ...profile, branch: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{["CS","IT","ECE","EEE","MECH","CIVIL","OTHER"].map((b) => <SelectItem key={b} value={b}>{b}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>CGPA</Label><Input type="number" step="0.01" min="0" max="10" value={profile.cgpa} onChange={(e) => setProfile({ ...profile, cgpa: e.target.value })} /></div>
              <div><Label>Year</Label>
                <Select value={profile.year} onValueChange={(v) => setProfile({ ...profile, year: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{[1,2,3,4,5].map((y) => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Semester</Label>
                <Select value={profile.semester} onValueChange={(v) => setProfile({ ...profile, semester: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{[1,2,3,4,5,6,7,8,9,10].map((y) => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <h2 className="font-display text-xl font-bold">What can you code in?</h2>
            <p className="text-sm text-muted-foreground">Add languages, frameworks or tools. We use these to match internships.</p>
            <div className="flex gap-2">
              <Input value={skillInput} onChange={(e) => setSkillInput(e.target.value)} placeholder="e.g. React" onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())} />
              <Button type="button" onClick={addSkill}><Plus className="h-4 w-4" /></Button>
            </div>
            <div className="space-y-2">
              {skills.map((s, i) => (
                <div key={s.skill} className="flex items-center justify-between gap-2 rounded-lg border border-border/60 bg-secondary/40 p-2">
                  <Badge variant="secondary">{s.skill}</Badge>
                  <div className="flex items-center gap-2">
                    <Select value={s.proficiency} onValueChange={(v) => setSkills(skills.map((x, j) => j === i ? { ...x, proficiency: v } : x))}>
                      <SelectTrigger className="h-8 w-[140px]"><SelectValue /></SelectTrigger>
                      <SelectContent>{["Beginner","Intermediate","Advanced"].map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                    </Select>
                    <Button size="icon" variant="ghost" onClick={() => setSkills(skills.filter((_, j) => j !== i))}><X className="h-4 w-4" /></Button>
                  </div>
                </div>
              ))}
              {!skills.length && <p className="text-sm text-muted-foreground">No skills yet. Try: <span className="text-foreground">React, Python, DSA, SQL</span></p>}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h2 className="font-display text-xl font-bold">Where do you want to go?</h2>
            <p className="text-sm text-muted-foreground">Pick the areas that excite you. Your AI mentor uses this to build a roadmap.</p>
            <div className="flex flex-wrap gap-2">
              {INTEREST_AREAS.map((x) => {
                const on = interests.includes(x);
                return (
                  <button key={x} type="button" onClick={() => toggleInterest(x)}
                    className={`rounded-full border px-3 py-1.5 text-sm transition ${on ? "border-transparent bg-gradient-primary text-primary-foreground shadow-glow" : "border-border bg-card text-muted-foreground hover:text-foreground"}`}>
                    {x}
                  </button>
                );
              })}
            </div>
            <div><Label>Your main goal</Label><Input value={goal} onChange={(e) => setGoal(e.target.value)} /></div>
          </div>
        )}

        <div className="mt-6 flex justify-between">
          <Button variant="ghost" disabled={step === 0} onClick={() => setStep(step - 1)}>Back</Button>
          {step < 2 ? (
            <Button onClick={() => setStep(step + 1)} className="bg-gradient-primary text-primary-foreground">Continue</Button>
          ) : (
            <Button onClick={finish} disabled={loading} className="bg-gradient-primary text-primary-foreground shadow-glow">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Finish
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
