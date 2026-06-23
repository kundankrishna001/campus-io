import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { lovableChat } from "@/lib/ai.server";

async function claude(messages: { role: "user" | "assistant"; content: string }[], system: string, maxTokens = 800) {
  return lovableChat([{ role: "system", content: system }, ...messages], { maxTokens });
}

const SYSTEM = (role: string, difficulty: string) => `You are an experienced HR interviewer at a top Indian tech company (think Flipkart, Razorpay, Infosys, TCS) conducting a behavioral / HR round interview.

ROLE TARGET: ${role}
DIFFICULTY: ${difficulty}

Rules:
- Ask ONE question at a time. Wait for the candidate's reply before asking the next.
- Start with an introduction question, then mix: motivation, strengths/weaknesses, conflict, leadership, situational ("tell me about a time"), and one curveball.
- Keep questions concise (1-2 sentences). Be warm but professional.
- After exactly 6 questions, end with: "Thanks, that's all from my side. You can end the interview now to get feedback."
- Never give feedback during the interview — only ask next question or end.`;

export const startInterview = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { role: string; difficulty?: "easy" | "medium" | "hard" }) => d)
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: session, error } = await (supabase as any).from("hr_interview_sessions").insert({
      user_id: userId,
      role_target: data.role,
      difficulty: data.difficulty ?? "medium",
    }).select().single();
    if (error) throw error;

    const opener = await claude(
      [{ role: "user", content: "Begin the interview with your first question." }],
      SYSTEM(data.role, data.difficulty ?? "medium"),
      400,
    );
    await (supabase as any).from("hr_interview_messages").insert({
      session_id: session.id, role: "assistant", content: opener,
    });
    return { sessionId: session.id, opener };
  });

export const sendInterviewMessage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { sessionId: string; message: string }) => d)
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: session } = await (supabase as any)
      .from("hr_interview_sessions").select("*").eq("id", data.sessionId).eq("user_id", userId).maybeSingle();
    if (!session) throw new Error("Session not found");

    await (supabase as any).from("hr_interview_messages").insert({
      session_id: data.sessionId, role: "user", content: data.message,
    });

    const { data: msgs } = await (supabase as any)
      .from("hr_interview_messages").select("role, content").eq("session_id", data.sessionId).order("created_at");

    const reply = await claude(
      (msgs ?? []).map((m: any) => ({ role: m.role, content: m.content })),
      SYSTEM(session.role_target, session.difficulty),
      400,
    );
    await (supabase as any).from("hr_interview_messages").insert({
      session_id: data.sessionId, role: "assistant", content: reply,
    });
    return { reply };
  });

export const endInterview = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { sessionId: string }) => d)
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: session } = await (supabase as any)
      .from("hr_interview_sessions").select("*").eq("id", data.sessionId).eq("user_id", userId).maybeSingle();
    if (!session) throw new Error("Session not found");

    const { data: msgs } = await (supabase as any)
      .from("hr_interview_messages").select("role, content").eq("session_id", data.sessionId).order("created_at");

    const transcript = (msgs ?? []).map((m: any) => `${m.role === "user" ? "Candidate" : "Interviewer"}: ${m.content}`).join("\n\n");
    const feedbackPrompt = `You evaluated this HR interview for an Indian campus candidate targeting "${session.role_target}".

TRANSCRIPT:
${transcript}

Return ONLY valid JSON:
{
  "score": <0-10 integer>,
  "strengths": ["bullet", "bullet", "bullet"],
  "improvements": ["bullet", "bullet", "bullet"],
  "verdict": "1-2 sentence overall assessment",
  "perQuestion": [ { "question": "summary", "feedback": "specific feedback in 1-2 lines" } ]
}`;

    const text = await claude([{ role: "user", content: feedbackPrompt }], "You are a strict but constructive interview coach.", 1500);
    const m = text.match(/\{[\s\S]*\}/);
    if (!m) throw new Error("Could not parse feedback");
    const feedback = JSON.parse(m[0]);

    await (supabase as any).from("hr_interview_sessions").update({
      status: "completed",
      feedback,
      score: feedback.score ?? 0,
      ended_at: new Date().toISOString(),
    }).eq("id", data.sessionId);

    return feedback;
  });
