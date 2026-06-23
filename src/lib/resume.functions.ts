import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { lovableChat } from "@/lib/ai.server";

export type ResumeContent = {
  fullName: string;
  email: string;
  phone?: string;
  location?: string;
  linkedin?: string;
  github?: string;
  targetRole: string;
  education: { college: string; degree: string; branch: string; cgpa?: string; year?: string }[];
  skills: string[];
  projects: { title: string; description: string; tech?: string; link?: string }[];
  experience: { role: string; company: string; duration: string; description: string }[];
  achievements: string[];
};

export const generateResume = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { content: ResumeContent; title?: string }) => d)
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const c = data.content;

    const prompt = `You are an expert resume writer for Indian engineering students targeting campus placements at companies like Flipkart, Razorpay, Infosys, TCS, Microsoft India.

Polish the following resume content. Return ONLY a JSON object (no prose) with this shape:
{
  "summary": "2-3 sentence professional summary tailored to ${c.targetRole}",
  "projects": [ { "title": "...", "bullets": ["impact-focused bullet with metric", "..."] } ],
  "experience": [ { "role": "...", "company": "...", "duration": "...", "bullets": ["..."] } ],
  "skillCategories": { "Languages": ["..."], "Frameworks": ["..."], "Tools": ["..."], "Concepts": ["..."] }
}

Use STAR/action-verb style for bullets. 2-4 bullets each. Quantify with realistic metrics where possible.

STUDENT:
${JSON.stringify(c, null, 2)}`;

    const text = await lovableChat([{ role: "user", content: prompt }], { maxTokens: 2500 });
    const m = text.match(/\{[\s\S]*\}/);
    if (!m) throw new Error("Could not parse AI response");
    const enhanced = JSON.parse(m[0]);

    const fullContent = { ...c, ...enhanced };

    const { data: saved, error } = await (supabase as any).from("resumes").insert({
      user_id: userId,
      title: data.title ?? `${c.targetRole} Resume`,
      target_role: c.targetRole,
      content: fullContent,
      ai_summary: enhanced.summary ?? "",
    }).select().single();
    if (error) throw error;
    return saved;
  });
