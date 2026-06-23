import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getMyStats } from "@/lib/gamification.functions";
import { Flame, Star, Trophy } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export const Route = createFileRoute("/_authenticated/achievements")({
  head: () => ({ meta: [{ title: "Achievements — Campus IO" }] }),
  component: AchievementsPage,
});

function AchievementsPage() {
  const fetchStats = useServerFn(getMyStats);
  const { data } = useQuery({ queryKey: ["my-stats"], queryFn: () => fetchStats() });

  if (!data) return <div className="h-40 animate-pulse rounded-2xl bg-card" />;
  const ownedIds = new Set(data.earned.map((e: any) => e.badges?.id));
  const xpPct = Math.round((data.currentLevelXp / data.nextLevelXp) * 100);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-2xl font-bold md:text-3xl">Achievements</h1>
        <p className="text-sm text-muted-foreground">XP, streaks and badges from your learning journey.</p>
      </div>

      <div className="rounded-2xl border border-border/60 bg-gradient-primary p-5 text-primary-foreground shadow-glow">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs uppercase tracking-wider opacity-80">Level</div>
            <div className="font-display text-4xl font-bold">{data.level}</div>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-1 text-sm font-semibold"><Star className="h-4 w-4" />{data.xp} XP</div>
            <div className="text-xs opacity-80">{data.currentLevelXp}/{data.nextLevelXp} to next level</div>
          </div>
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/20">
          <div className="h-full rounded-full bg-white transition-all" style={{ width: `${xpPct}%` }} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-card">
          <div className="mb-1 flex items-center gap-2 text-sm text-muted-foreground"><Flame className="h-4 w-4 text-primary" /> Current streak</div>
          <div className="font-display text-2xl font-bold">{data.current_streak} <span className="text-sm font-medium text-muted-foreground">days</span></div>
        </div>
        <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-card">
          <div className="mb-1 flex items-center gap-2 text-sm text-muted-foreground"><Trophy className="h-4 w-4 text-primary" /> Longest streak</div>
          <div className="font-display text-2xl font-bold">{data.longest_streak} <span className="text-sm font-medium text-muted-foreground">days</span></div>
        </div>
      </div>

      <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-card">
        <h3 className="mb-3 font-display font-semibold">Badges</h3>
        <div className="grid grid-cols-3 gap-3 md:grid-cols-4">
          {data.allBadges.map((b: any) => {
            const owned = ownedIds.has(b.id);
            return (
              <div key={b.id} className={`rounded-xl border p-3 text-center transition ${owned ? "border-primary/40 bg-primary/10" : "border-border/60 bg-secondary/50 opacity-60"}`}>
                <div className="text-3xl">{b.icon}</div>
                <div className="mt-1 text-xs font-semibold">{b.name}</div>
                <div className="mt-0.5 text-[10px] text-muted-foreground">{b.description}</div>
                <div className="mt-1 text-[10px] font-semibold text-primary">+{b.xp_reward} XP</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
