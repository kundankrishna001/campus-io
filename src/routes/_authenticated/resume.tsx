import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { generateResume, type ResumeContent } from "@/lib/resume.functions";
import { awardXp } from "@/lib/gamification.functions";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Plus, Printer, Sparkles, Trash2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/resume")({
  head: () => ({ meta: [{ title: "Resume Builder — Campus IO" }] }),
  component: ResumePage,
});

const EMPTY: ResumeContent = {
  fullName: "", email: "", phone: "", location: "", linkedin: "", github: "",
  targetRole: "Software Engineer Intern",
  education: [{ college: "", degree: "B.Tech", branch: "Computer Science", cgpa: "", year: "" }],
  skills: [],
  projects: [{ title: "", description: "", tech: "", link: "" }],
  experience: [],
  achievements: [],
};

function ResumePage() {
  const gen = useServerFn(generateResume);
  const award = useServerFn(awardXp);
  const [form, setForm] = useState<ResumeContent>(EMPTY);
  const [skillsText, setSkillsText] = useState("");
  const [achievementsText, setAchievementsText] = useState("");
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<any>(null);

  // Prefill from profile + user_skills
  useEffect(() => {
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return;
      const [{ data: profile }, { data: skills }] = await Promise.all([
        supabase.from("profiles").select("*").maybeSingle(),
        supabase.from("user_skills").select("skill"),
      ]);
      setForm((f) => ({
        ...f,
        fullName: profile?.full_name ?? "",
        email: u.user.email ?? "",
        education: [{ college: profile?.college ?? "", degree: "B.Tech", branch: profile?.branch ?? "CS", cgpa: String(profile?.cgpa ?? ""), year: String(profile?.year ?? "") }],
      }));
      const sk = (skills ?? []).map((s: any) => s.skill);
      setSkillsText(sk.join(", "));
    })();
  }, []);

  const { data: saved, refetch } = useQuery({
    queryKey: ["resumes"],
    queryFn: async () => (await (supabase as any).from("resumes").select("*").order("created_at", { ascending: false })).data ?? [],
  });

  async function handleGenerate() {
    if (!form.fullName || !form.email || !form.targetRole) return toast.error("Name, email and target role are required");
    setGenerating(true);
    try {
      const content: ResumeContent = {
        ...form,
        skills: skillsText.split(",").map((s) => s.trim()).filter(Boolean),
        achievements: achievementsText.split("\n").map((s) => s.trim()).filter(Boolean),
      };
      const r = await gen({ data: { content } });
      setResult(r);
      await award({ data: { action: "resume_generated" } });
      toast.success("Resume generated! +60 XP");
      refetch();
    } catch (e: any) {
      toast.error(e.message || "Failed to generate resume");
    } finally {
      setGenerating(false);
    }
  }

  if (result) return <ResumePreview resume={result} onBack={() => setResult(null)} />;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-2xl font-bold md:text-3xl">AI Resume Builder</h1>
        <p className="text-sm text-muted-foreground">Fill the basics — AI will polish your bullets and tailor them to your target role.</p>
      </div>

      {saved && saved.length > 0 && (
        <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-card">
          <h3 className="mb-2 text-sm font-semibold">Your saved resumes</h3>
          <div className="grid gap-2">
            {saved.map((r: any) => (
              <button key={r.id} onClick={() => setResult(r)} className="flex items-center justify-between rounded-lg border border-border/40 bg-secondary/50 p-2 px-3 text-left text-sm hover:border-primary/40">
                <span className="font-medium">{r.title}</span>
                <span className="text-xs text-muted-foreground">{new Date(r.created_at).toLocaleDateString("en-IN")}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-4 rounded-2xl border border-border/60 bg-card p-5 shadow-card">
        <div className="grid gap-3 md:grid-cols-2">
          <Field label="Full name *" value={form.fullName} onChange={(v) => setForm({ ...form, fullName: v })} />
          <Field label="Email *" value={form.email} onChange={(v) => setForm({ ...form, email: v })} />
          <Field label="Phone" value={form.phone ?? ""} onChange={(v) => setForm({ ...form, phone: v })} placeholder="+91 ..." />
          <Field label="Location" value={form.location ?? ""} onChange={(v) => setForm({ ...form, location: v })} />
          <Field label="LinkedIn URL" value={form.linkedin ?? ""} onChange={(v) => setForm({ ...form, linkedin: v })} />
          <Field label="GitHub URL" value={form.github ?? ""} onChange={(v) => setForm({ ...form, github: v })} />
          <Field label="Target role *" value={form.targetRole} onChange={(v) => setForm({ ...form, targetRole: v })} />
        </div>

        <Section title="Education">
          {form.education.map((e, i) => (
            <div key={i} className="grid gap-2 md:grid-cols-5">
              <Input className="md:col-span-2" placeholder="College" value={e.college} onChange={(ev) => updateAt(form, setForm, "education", i, { ...e, college: ev.target.value })} />
              <Input placeholder="Degree" value={e.degree} onChange={(ev) => updateAt(form, setForm, "education", i, { ...e, degree: ev.target.value })} />
              <Input placeholder="Branch" value={e.branch} onChange={(ev) => updateAt(form, setForm, "education", i, { ...e, branch: ev.target.value })} />
              <Input placeholder="CGPA" value={e.cgpa ?? ""} onChange={(ev) => updateAt(form, setForm, "education", i, { ...e, cgpa: ev.target.value })} />
            </div>
          ))}
        </Section>

        <Section title="Skills (comma-separated)">
          <Textarea value={skillsText} onChange={(e) => setSkillsText(e.target.value)} placeholder="React, Node.js, Python, MongoDB, DSA, ..." rows={2} />
        </Section>

        <Section title="Projects" onAdd={() => setForm({ ...form, projects: [...form.projects, { title: "", description: "", tech: "", link: "" }] })}>
          {form.projects.map((p, i) => (
            <div key={i} className="space-y-2 rounded-lg border border-border/40 p-3">
              <div className="flex items-center gap-2">
                <Input placeholder="Project title" value={p.title} onChange={(e) => updateAt(form, setForm, "projects", i, { ...p, title: e.target.value })} />
                <Button size="icon" variant="ghost" onClick={() => removeAt(form, setForm, "projects", i)}><Trash2 className="h-4 w-4" /></Button>
              </div>
              <Textarea placeholder="Short description of what you built and impact" value={p.description} onChange={(e) => updateAt(form, setForm, "projects", i, { ...p, description: e.target.value })} rows={2} />
              <div className="grid gap-2 md:grid-cols-2">
                <Input placeholder="Tech stack" value={p.tech ?? ""} onChange={(e) => updateAt(form, setForm, "projects", i, { ...p, tech: e.target.value })} />
                <Input placeholder="GitHub / live link" value={p.link ?? ""} onChange={(e) => updateAt(form, setForm, "projects", i, { ...p, link: e.target.value })} />
              </div>
            </div>
          ))}
        </Section>

        <Section title="Experience / internships" onAdd={() => setForm({ ...form, experience: [...form.experience, { role: "", company: "", duration: "", description: "" }] })}>
          {form.experience.map((x, i) => (
            <div key={i} className="space-y-2 rounded-lg border border-border/40 p-3">
              <div className="grid gap-2 md:grid-cols-3">
                <Input placeholder="Role" value={x.role} onChange={(e) => updateAt(form, setForm, "experience", i, { ...x, role: e.target.value })} />
                <Input placeholder="Company" value={x.company} onChange={(e) => updateAt(form, setForm, "experience", i, { ...x, company: e.target.value })} />
                <Input placeholder="Duration (e.g. May–Jul 2025)" value={x.duration} onChange={(e) => updateAt(form, setForm, "experience", i, { ...x, duration: e.target.value })} />
              </div>
              <Textarea placeholder="What you did + impact" value={x.description} onChange={(e) => updateAt(form, setForm, "experience", i, { ...x, description: e.target.value })} rows={2} />
              <Button size="sm" variant="ghost" onClick={() => removeAt(form, setForm, "experience", i)}><Trash2 className="h-3 w-3 mr-1" /> Remove</Button>
            </div>
          ))}
        </Section>

        <Section title="Achievements (one per line)">
          <Textarea value={achievementsText} onChange={(e) => setAchievementsText(e.target.value)} placeholder="Won 2nd prize at Smart India Hackathon...&#10;Codeforces specialist — rating 1450&#10;..." rows={3} />
        </Section>

        <Button onClick={handleGenerate} disabled={generating} className="w-full" size="lg">
          <Sparkles className="mr-2 h-4 w-4" />
          {generating ? "Generating with AI..." : "Generate AI-polished resume"}
        </Button>
      </div>
    </div>
  );
}

function ResumePreview({ resume, onBack }: { resume: any; onBack: () => void }) {
  const c = resume.content;
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between print:hidden">
        <Button variant="ghost" onClick={onBack}>← Back to editor</Button>
        <Button onClick={() => window.print()}><Printer className="mr-2 h-4 w-4" />Print / Save as PDF</Button>
      </div>
      <div className="rounded-2xl border border-border/60 bg-white p-8 text-slate-900 shadow-card print:border-0 print:shadow-none">
        <header className="border-b-2 border-slate-900 pb-3">
          <h1 className="font-display text-2xl font-bold">{c.fullName}</h1>
          <p className="text-sm">{c.targetRole}</p>
          <p className="mt-1 text-xs text-slate-600">
            {[c.email, c.phone, c.location].filter(Boolean).join(" • ")}
            {(c.linkedin || c.github) && <br />}
            {[c.linkedin, c.github].filter(Boolean).join(" • ")}
          </p>
        </header>

        {c.summary && (
          <Block title="Summary">
            <p className="text-sm">{c.summary}</p>
          </Block>
        )}

        <Block title="Education">
          {c.education?.map((e: any, i: number) => (
            <div key={i} className="mb-1 text-sm">
              <div className="font-semibold">{e.college}</div>
              <div className="text-xs">{e.degree} in {e.branch}{e.cgpa && ` • CGPA ${e.cgpa}`}{e.year && ` • Year ${e.year}`}</div>
            </div>
          ))}
        </Block>

        {c.skillCategories ? (
          <Block title="Technical Skills">
            {Object.entries(c.skillCategories).map(([k, v]: any) => (
              <div key={k} className="text-sm"><span className="font-semibold">{k}:</span> {(v as string[]).join(", ")}</div>
            ))}
          </Block>
        ) : c.skills?.length > 0 && (
          <Block title="Skills"><p className="text-sm">{c.skills.join(" • ")}</p></Block>
        )}

        {c.projects?.length > 0 && (
          <Block title="Projects">
            {c.projects.map((p: any, i: number) => (
              <div key={i} className="mb-2">
                <div className="text-sm font-semibold">{p.title}{p.tech && <span className="font-normal text-slate-600"> — {p.tech}</span>}</div>
                {p.bullets ? (
                  <ul className="ml-4 list-disc text-sm">{p.bullets.map((b: string, j: number) => <li key={j}>{b}</li>)}</ul>
                ) : (
                  <p className="text-sm">{p.description}</p>
                )}
              </div>
            ))}
          </Block>
        )}

        {c.experience?.length > 0 && (
          <Block title="Experience">
            {c.experience.map((x: any, i: number) => (
              <div key={i} className="mb-2">
                <div className="flex justify-between text-sm font-semibold"><span>{x.role} • {x.company}</span><span className="text-xs font-normal text-slate-600">{x.duration}</span></div>
                {x.bullets ? (
                  <ul className="ml-4 list-disc text-sm">{x.bullets.map((b: string, j: number) => <li key={j}>{b}</li>)}</ul>
                ) : (
                  <p className="text-sm">{x.description}</p>
                )}
              </div>
            ))}
          </Block>
        )}

        {c.achievements?.length > 0 && (
          <Block title="Achievements">
            <ul className="ml-4 list-disc text-sm">{c.achievements.map((a: string, i: number) => <li key={i}>{a}</li>)}</ul>
          </Block>
        )}
      </div>
    </div>
  );
}

function Block({ title, children }: any) {
  return (
    <section className="mt-4">
      <h2 className="mb-1 text-sm font-bold uppercase tracking-wider text-slate-900">{title}</h2>
      <div className="border-t border-slate-300 pt-2">{children}</div>
    </section>
  );
}

function Field({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div className="space-y-1">
      <Label className="text-xs">{label}</Label>
      <Input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
    </div>
  );
}

function Section({ title, children, onAdd }: { title: string; children: React.ReactNode; onAdd?: () => void }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="text-xs font-semibold">{title}</Label>
        {onAdd && <Button size="sm" variant="ghost" onClick={onAdd}><Plus className="mr-1 h-3 w-3" />Add</Button>}
      </div>
      {children}
    </div>
  );
}

function updateAt<K extends keyof ResumeContent>(form: ResumeContent, setForm: (f: ResumeContent) => void, key: K, idx: number, val: any) {
  const arr = [...(form[key] as any[])];
  arr[idx] = val;
  setForm({ ...form, [key]: arr });
}
function removeAt<K extends keyof ResumeContent>(form: ResumeContent, setForm: (f: ResumeContent) => void, key: K, idx: number) {
  const arr = [...(form[key] as any[])];
  arr.splice(idx, 1);
  setForm({ ...form, [key]: arr });
}
