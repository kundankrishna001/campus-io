import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useRef, useState } from "react";
import { startInterview, sendInterviewMessage, endInterview } from "@/lib/interview.functions";
import { awardXp } from "@/lib/gamification.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Mic, Send, Sparkles, StopCircle } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/interview")({
  head: () => ({ meta: [{ title: "Mock HR Interview — Campus IO" }] }),
  component: InterviewPage,
});

type Msg = { role: "user" | "assistant"; content: string };

function InterviewPage() {
  const start = useServerFn(startInterview);
  const send = useServerFn(sendInterviewMessage);
  const end = useServerFn(endInterview);
  const award = useServerFn(awardXp);

  const [role, setRole] = useState("Software Engineer Intern");
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("medium");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  async function handleStart() {
    setBusy(true);
    try {
      const r = await start({ data: { role, difficulty } });
      setSessionId(r.sessionId);
      setMessages([{ role: "assistant", content: r.opener }]);
      setFeedback(null);
    } catch (e: any) {
      toast.error(e.message || "Failed to start");
    } finally { setBusy(false); }
  }

  async function handleSend() {
    if (!input.trim() || !sessionId || busy) return;
    const userMsg = input.trim();
    setMessages((m) => [...m, { role: "user", content: userMsg }]);
    setInput("");
    setBusy(true);
    try {
      const r = await send({ data: { sessionId, message: userMsg } });
      setMessages((m) => [...m, { role: "assistant", content: r.reply }]);
    } catch (e: any) {
      toast.error(e.message || "Send failed");
    } finally { setBusy(false); }
  }

  async function handleEnd() {
    if (!sessionId) return;
    setBusy(true);
    try {
      const fb = await end({ data: { sessionId } });
      setFeedback(fb);
      await award({ data: { action: "hr_session", meta: { score: fb.score } } });
      toast.success(`Interview complete! Score: ${fb.score}/10`);
    } catch (e: any) {
      toast.error(e.message || "End failed");
    } finally { setBusy(false); }
  }

  if (feedback) {
    return (
      <div className="space-y-4">
        <h1 className="font-display text-2xl font-bold">Interview Feedback</h1>
        <div className="rounded-2xl border border-border/60 bg-gradient-primary p-5 text-primary-foreground shadow-glow">
          <div className="text-xs uppercase opacity-80">Overall score</div>
          <div className="font-display text-5xl font-bold">{feedback.score}<span className="text-2xl opacity-80">/10</span></div>
          <p className="mt-2 text-sm">{feedback.verdict}</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <FbCard title="Strengths" items={feedback.strengths} tone="success" />
          <FbCard title="Improve" items={feedback.improvements} tone="warning" />
        </div>
        {feedback.perQuestion && (
          <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-card">
            <h3 className="mb-2 font-display font-semibold">Per-question feedback</h3>
            <div className="space-y-3">
              {feedback.perQuestion.map((q: any, i: number) => (
                <div key={i} className="rounded-lg border border-border/40 bg-secondary/40 p-3">
                  <div className="text-sm font-semibold">Q{i + 1}: {q.question}</div>
                  <div className="mt-1 text-xs text-muted-foreground">{q.feedback}</div>
                </div>
              ))}
            </div>
          </div>
        )}
        <Button onClick={() => { setSessionId(null); setMessages([]); setFeedback(null); }} className="w-full">Start a new interview</Button>
      </div>
    );
  }

  if (!sessionId) {
    return (
      <div className="space-y-5">
        <div>
          <h1 className="font-display text-2xl font-bold md:text-3xl">Mock HR Interview</h1>
          <p className="text-sm text-muted-foreground">Practice with an AI interviewer. 6 questions, then AI-graded feedback.</p>
        </div>
        <div className="space-y-4 rounded-2xl border border-border/60 bg-card p-5 shadow-card">
          <div className="space-y-1">
            <Label>Target role</Label>
            <Input value={role} onChange={(e) => setRole(e.target.value)} placeholder="e.g. SDE Intern, Data Analyst" />
          </div>
          <div className="space-y-1">
            <Label>Difficulty</Label>
            <Select value={difficulty} onValueChange={(v: any) => setDifficulty(v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="easy">Easy — friendly, intro-level</SelectItem>
                <SelectItem value="medium">Medium — campus placement</SelectItem>
                <SelectItem value="hard">Hard — top tech / unicorn</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={handleStart} disabled={busy} size="lg" className="w-full">
            <Mic className="mr-2 h-4 w-4" />{busy ? "Starting..." : "Start interview"}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-10rem)] flex-col gap-3">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-lg font-bold">Interview in progress</h1>
          <p className="text-xs text-muted-foreground">{role} • {difficulty}</p>
        </div>
        <Button variant="outline" size="sm" onClick={handleEnd} disabled={busy}>
          <StopCircle className="mr-1 h-4 w-4" />End & get feedback
        </Button>
      </div>
      <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto rounded-2xl border border-border/60 bg-card p-4 shadow-card">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${m.role === "user" ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground"}`}>
              {m.role === "assistant" && <div className="mb-1 flex items-center gap-1 text-[10px] font-semibold uppercase text-primary"><Sparkles className="h-3 w-3" />Interviewer</div>}
              <div className="whitespace-pre-wrap">{m.content}</div>
            </div>
          </div>
        ))}
        {busy && <div className="text-xs text-muted-foreground">Interviewer is thinking...</div>}
      </div>
      <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex gap-2">
        <Input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Type your answer..." disabled={busy} />
        <Button type="submit" disabled={busy || !input.trim()}><Send className="h-4 w-4" /></Button>
      </form>
    </div>
  );
}

function FbCard({ title, items, tone }: { title: string; items: string[]; tone: "success" | "warning" }) {
  return (
    <div className={`rounded-2xl border p-4 shadow-card ${tone === "success" ? "border-emerald-500/30 bg-emerald-500/5" : "border-amber-500/30 bg-amber-500/5"}`}>
      <h3 className="mb-2 font-display font-semibold">{title}</h3>
      <ul className="ml-4 list-disc space-y-1 text-sm">
        {items?.map((s, i) => <li key={i}>{s}</li>)}
      </ul>
    </div>
  );
}
