import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Brain, CheckCircle2, Clock, History, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { awardXp } from "@/lib/gamification.functions";
import { DEMO_QUESTIONS, DEMO_SYLLABUS } from "@/lib/demo-data";

export const Route = createFileRoute("/_authenticated/quiz")({
  head: () => ({ meta: [{ title: "Quiz — Campus IO" }] }),
  component: QuizPage,
});

type Q = { id: string; prompt: string; options: any; correct_idx: number; explanation: string | null; subject_id: string | null; difficulty: string };

function QuizPage() {
  const [subject, setSubject] = useState<string>("all");
  const [difficulty, setDifficulty] = useState<string>("all");
  const [active, setActive] = useState<{ questions: Q[]; idx: number; answers: number[]; sessionId: string | null; startedAt: number } | null>(null);
  const [finished, setFinished] = useState<{ score: number; total: number; questions: Q[]; answers: number[] } | null>(null);
  const award = useServerFn(awardXp);

  const { data: subjects } = useQuery({ 
    queryKey: ["subjects"], 
    queryFn: async () => {
      const { data } = await supabase.from("subjects").select("id, name").order("position");
      if (data && data.length > 0) return data;
      // Fallback to demo subjects
      return DEMO_SYLLABUS.flatMap(sem => sem.subjects.map(sub => ({ id: sub.id, name: sub.name })));
    }
  });
  const { data: history, refetch: refetchHistory } = useQuery({
    queryKey: ["quiz-history"],
    queryFn: async () => (await supabase.from("quiz_sessions").select("id, started_at, score, total, subjects(name)").not("finished_at", "is", null).order("started_at", { ascending: false }).limit(8)).data ?? [],
  });

  async function startQuiz() {
    let q = supabase.from("questions").select("*").limit(100);
    if (subject !== "all") q = q.eq("subject_id", subject);
    if (difficulty !== "all") q = q.eq("difficulty", difficulty);
    const { data: questions, error } = await q;
    
    let finalQuestions = questions;
    if (error || !questions?.length) {
      // Fallback to demo questions
      finalQuestions = DEMO_QUESTIONS.filter(q => 
        (subject === "all" || q.subject_id === subject) && 
        (difficulty === "all" || q.difficulty === difficulty)
      );
      if (!finalQuestions.length) {
        return toast.error("No questions found for this filter");
      }
    }
    
    const shuffled = [...finalQuestions].sort(() => Math.random() - 0.5).slice(0, 5) as Q[];
    const { data: u } = await supabase.auth.getUser();
    const { data: session } = await supabase.from("quiz_sessions").insert({
      user_id: u.user!.id,
      subject_id: subject !== "all" ? subject : null,
      total: shuffled.length,
    }).select().single();
    setActive({ questions: shuffled, idx: 0, answers: Array(shuffled.length).fill(-1), sessionId: session?.id ?? null, startedAt: Date.now() });
    setFinished(null);
  }

  async function submitQuiz(answers: number[]) {
    if (!active?.sessionId) return;
    const { data: u } = await supabase.auth.getUser();
    let score = 0;
    const rows = active.questions.map((q, i) => {
      const correct = answers[i] === q.correct_idx; if (correct) score++;
      return { session_id: active.sessionId!, user_id: u.user!.id, question_id: q.id, chosen_idx: answers[i], is_correct: correct };
    });
    await supabase.from("quiz_responses").insert(rows);
    await supabase.from("quiz_sessions").update({ finished_at: new Date().toISOString(), score }).eq("id", active.sessionId);
    setFinished({ score, total: active.questions.length, questions: active.questions, answers });
    setActive(null);
    refetchHistory();
    try {
      const perfect = score === active.questions.length;
      const r = await award({ data: { action: "quiz_complete", meta: { perfect } } });
      toast.success(`+${r.xpDelta} XP${r.newBadges.length ? ` • ${r.newBadges.length} new badge!` : ""}`);
    } catch {}
  }

  if (active) return <QuizPlayer state={active} setState={setActive} onSubmit={submitQuiz} />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Quiz</h1>
        <p className="text-sm text-muted-foreground">Timed MCQs with instant feedback.</p>
      </div>

      {finished && (
        <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-card">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold">Results</h2>
            <span className="font-display text-2xl font-bold">{finished.score}/{finished.total}</span>
          </div>
          <ul className="space-y-3">
            {finished.questions.map((q, i) => {
              const opts = q.options as string[];
              const chosen = finished.answers[i];
              const correct = chosen === q.correct_idx;
              return (
                <li key={q.id} className="rounded-xl border border-border/60 bg-secondary/30 p-3">
                  <div className="flex items-start gap-2">
                    {correct ? <CheckCircle2 className="mt-0.5 h-4 w-4 text-success" /> : <XCircle className="mt-0.5 h-4 w-4 text-destructive" />}
                    <div className="flex-1">
                      <p className="text-sm font-medium">{q.prompt}</p>
                      <p className="mt-1 text-xs text-muted-foreground">Your answer: <span className={correct ? "text-success" : "text-destructive"}>{opts[chosen] ?? "—"}</span></p>
                      {!correct && <p className="text-xs text-muted-foreground">Correct: <span className="text-success">{opts[q.correct_idx]}</span></p>}
                      {q.explanation && <p className="mt-1 text-xs text-muted-foreground">{q.explanation}</p>}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-card">
        <div className="mb-3 flex items-center gap-2">
          <Brain className="h-4 w-4 text-primary" />
          <h2 className="font-display font-semibold">Start a new quiz</h2>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <Select value={subject} onValueChange={setSubject}>
            <SelectTrigger><SelectValue placeholder="Subject" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All subjects</SelectItem>
              {subjects?.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={difficulty} onValueChange={setDifficulty}>
            <SelectTrigger><SelectValue placeholder="Difficulty" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="Easy">Easy</SelectItem>
              <SelectItem value="Medium">Medium</SelectItem>
              <SelectItem value="Hard">Hard</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={startQuiz} className="mt-4 w-full bg-gradient-primary text-primary-foreground shadow-glow">Start 5-question quiz</Button>
      </div>

      <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-card">
        <div className="mb-3 flex items-center gap-2"><History className="h-4 w-4 text-primary" /><h2 className="font-display font-semibold">Recent attempts</h2></div>
        {history?.length ? (
          <ul className="divide-y divide-border/60">
            {history.map((h) => (
              <li key={h.id} className="flex items-center justify-between py-2 text-sm">
                <div>
                  <div className="font-medium">{(h.subjects as any)?.name ?? "Mixed"}</div>
                  <div className="text-xs text-muted-foreground">{new Date(h.started_at).toLocaleString("en-IN")}</div>
                </div>
                <div className="font-display font-bold">{h.score}/{h.total}</div>
              </li>
            ))}
          </ul>
        ) : <p className="text-sm text-muted-foreground">No attempts yet — start your first quiz above.</p>}
      </div>
    </div>
  );
}

function QuizPlayer({ state, setState, onSubmit }: { state: any; setState: any; onSubmit: (answers: number[]) => void }) {
  const q: Q = state.questions[state.idx];
  const opts = q.options as string[];
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => { const t = setInterval(() => setElapsed(Math.floor((Date.now() - state.startedAt) / 1000)), 1000); return () => clearInterval(t); }, [state.startedAt]);
  const pct = useMemo(() => ((state.idx + 1) / state.questions.length) * 100, [state]);

  function choose(i: number) {
    const ans = [...state.answers]; ans[state.idx] = i; setState({ ...state, answers: ans });
  }
  function next() {
    if (state.idx === state.questions.length - 1) onSubmit(state.answers);
    else setState({ ...state, idx: state.idx + 1 });
  }

  return (
    <div className="mx-auto max-w-xl space-y-5">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>Question {state.idx + 1} of {state.questions.length}</span>
        <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" /> {Math.floor(elapsed/60)}:{String(elapsed%60).padStart(2,"0")}</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-secondary"><div className="h-full bg-gradient-primary transition-all" style={{ width: `${pct}%` }} /></div>

      <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-card">
        <p className="font-display text-lg font-semibold leading-snug">{q.prompt}</p>
        <ul className="mt-4 space-y-2">
          {opts.map((o, i) => {
            const sel = state.answers[state.idx] === i;
            return (
              <li key={i}>
                <button onClick={() => choose(i)}
                  className={cn("flex w-full items-center gap-3 rounded-xl border p-3 text-left text-sm transition",
                    sel ? "border-primary bg-primary/10 text-foreground" : "border-border bg-secondary/40 hover:border-primary/50")}>
                  <span className={cn("grid h-6 w-6 place-items-center rounded-full border text-xs font-semibold", sel ? "border-primary bg-primary text-primary-foreground" : "border-border")}>
                    {String.fromCharCode(65 + i)}
                  </span>
                  {o}
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      <Button onClick={next} disabled={state.answers[state.idx] === -1} className="w-full bg-gradient-primary text-primary-foreground shadow-glow">
        {state.idx === state.questions.length - 1 ? "Submit" : "Next"}
      </Button>
    </div>
  );
}
