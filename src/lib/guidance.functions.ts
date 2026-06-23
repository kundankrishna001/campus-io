import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { lovableChat } from "@/lib/ai.server";

const DOMAINS = ["Web Dev", "ML / AI", "Backend", "DevOps", "Android", "Cybersecurity", "Data Engineering", "Research"];

export const generateGuidanceReport = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;

    const [{ data: profile }, { data: skills }, { data: interests }, { data: sessions }] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", userId).maybeSingle(),
      supabase.from("user_skills").select("skill, proficiency").eq("user_id", userId),
      supabase.from("interest_responses").select("answers").eq("user_id", userId).maybeSingle(),
      supabase.from("quiz_sessions").select("score, total, subjects(name)").eq("user_id", userId).not("finished_at", "is", null).limit(20),
    ]);

    if (!interests) throw new Error("Please complete the onboarding interest questionnaire first.");

    const subjectAvg: Record<string, { c: number; t: number }> = {};
    for (const s of sessions ?? []) {
      const name = (s.subjects as any)?.name ?? "Other";
      subjectAvg[name] = subjectAvg[name] ?? { c: 0, t: 0 };
      subjectAvg[name].c += s.score ?? 0;
      subjectAvg[name].t += s.total ?? 0;
    }
    const subjectPct = Object.fromEntries(Object.entries(subjectAvg).map(([k, v]) => [k, v.t ? Math.round((v.c / v.t) * 100) : 0]));

    const prompt = `You are an expert career mentor for Indian CS/IT engineering students. Analyse this student and produce a domain-fit report.

STUDENT PROFILE
- Name: ${profile?.full_name ?? "Student"}
- College: ${profile?.college ?? "—"}
- Branch: ${profile?.branch ?? "CS"} | Year: ${profile?.year ?? "?"} | Sem: ${profile?.semester ?? "?"} | CGPA: ${profile?.cgpa ?? "—"}/10
- Skills: ${(skills ?? []).map((s) => `${s.skill} (${s.proficiency})`).join(", ") || "none yet"}
- Quiz performance: ${JSON.stringify(subjectPct)}
- Stated interests: ${JSON.stringify((interests.answers as any).interests ?? [])}
- Goal: ${(interests.answers as any).goal ?? "—"}

TASK
Score the student 0-100 on EACH of these 8 domains: ${DOMAINS.join(", ")}.
Then pick the single best recommended domain, decide their current phase (1=foundation, 2=building, 3=specialising), and produce a 6-month month-by-month roadmap tailored to Indian campus placement timelines.

OUTPUT
Return ONLY valid JSON, no prose, matching this exact shape:
{
  "scores": { "Web Dev": int, "ML / AI": int, "Backend": int, "DevOps": int, "Android": int, "Cybersecurity": int, "Data Engineering": int, "Research": int },
  "recommended": "<one of the 8 domain names>",
  "phase": 1 | 2 | 3,
  "summary": "<2-3 sentence personal note, mention CGPA and a concrete strength>",
  "roadmap": [
    { "month": 1, "title": "string", "focus": "string", "tasks": ["..","..","..","..","..","..","..","..","..","..", ".."] }
  ]
}
The roadmap MUST have exactly 6 items (month 1-6). Each "tasks" list should have 3-6 concrete, actionable items naming Indian-relevant resources where helpful (NPTEL, Apna College, take U forward, GeeksforGeeks, LeetCode, Internshala, Unstop).`;

    const text = await lovableChat([{ role: "user", content: prompt }], { maxTokens: 2500 });
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("Could not parse AI response");
    const parsed = JSON.parse(match[0]);

    const { data: saved, error } = await supabase.from("guidance_reports").insert({
      user_id: userId,
      scores: parsed.scores,
      recommended: parsed.recommended,
      phase: parsed.phase ?? 1,
      summary: parsed.summary ?? "",
      roadmap: parsed.roadmap ?? [],
    }).select().single();
    if (error) throw error;
    return saved;
  });
