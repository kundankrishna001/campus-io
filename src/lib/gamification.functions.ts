import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const XP_RULES = {
  quiz_complete: 30,
  quiz_perfect_bonus: 50,
  topic_complete: 40,
  hr_session: 80,
  resume_generated: 60,
} as const;

type Action = keyof typeof XP_RULES;

function levelFromXp(xp: number) {
  // 100, 250, 450, 700, 1000... each level = 100 + (level-1)*50 cumulative
  let level = 1;
  let need = 100;
  let total = 0;
  while (xp >= total + need) {
    total += need;
    level++;
    need = 100 + (level - 1) * 50;
  }
  return { level, currentLevelXp: xp - total, nextLevelXp: need };
}

export const awardXp = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { action: Action; meta?: Record<string, any> }) => d)
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const today = new Date().toISOString().slice(0, 10);

    let xpDelta: number = XP_RULES[data.action];
    if (data.action === "quiz_complete" && data.meta?.perfect) xpDelta += XP_RULES.quiz_perfect_bonus;

    const { data: stats } = await (supabase as any)
      .from("user_stats").select("*").eq("user_id", userId).maybeSingle();

    // streak
    let current_streak = 1;
    let longest_streak = 1;
    if (stats) {
      const last = stats.last_active_date as string | null;
      if (last === today) {
        current_streak = stats.current_streak;
      } else if (last) {
        const diff = (new Date(today).getTime() - new Date(last).getTime()) / 86400000;
        current_streak = diff === 1 ? stats.current_streak + 1 : 1;
      }
      longest_streak = Math.max(stats.longest_streak ?? 0, current_streak);
    }

    const newXp = (stats?.xp ?? 0) + xpDelta;
    const { level } = levelFromXp(newXp);

    await (supabase as any).from("user_stats").upsert({
      user_id: userId,
      xp: newXp,
      level,
      current_streak,
      longest_streak,
      last_active_date: today,
    });

    // badge checks
    const { data: badges } = await (supabase as any).from("badges").select("id, code");
    const { data: owned } = await (supabase as any).from("user_badges").select("badge_id").eq("user_id", userId);
    const ownedIds = new Set((owned ?? []).map((b: any) => b.badge_id));
    const byCode: Record<string, string> = Object.fromEntries((badges ?? []).map((b: any) => [b.code, b.id]));

    const earnedCodes: string[] = [];
    const tryAward = (code: string) => {
      const id = byCode[code];
      if (id && !ownedIds.has(id)) earnedCodes.push(code);
    };

    if (data.action === "quiz_complete") {
      tryAward("first_quiz");
      if (data.meta?.perfect) tryAward("quiz_master");
    }
    if (data.action === "topic_complete") {
      tryAward("first_topic");
      const { count } = await (supabase as any).from("topic_progress").select("id", { count: "exact", head: true }).eq("user_id", userId).eq("status", "completed");
      if ((count ?? 0) >= 10) tryAward("topic_explorer");
    }
    if (data.action === "resume_generated") tryAward("resume_pro");
    if (data.action === "hr_session" && (data.meta?.score ?? 0) >= 8) tryAward("interview_ace");

    if (current_streak >= 3) tryAward("streak_3");
    if (current_streak >= 7) tryAward("streak_7");
    if (current_streak >= 30) tryAward("streak_30");

    if (earnedCodes.length) {
      const rows = earnedCodes.map((c) => ({ user_id: userId, badge_id: byCode[c] }));
      await (supabase as any).from("user_badges").insert(rows);
    }

    return { xp: newXp, level, current_streak, longest_streak, xpDelta, newBadges: earnedCodes };
  });

export const getMyStats = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const [{ data: stats }, { data: badges }] = await Promise.all([
      (supabase as any).from("user_stats").select("*").eq("user_id", userId).maybeSingle(),
      (supabase as any).from("user_badges").select("earned_at, badges(*)").eq("user_id", userId).order("earned_at", { ascending: false }),
    ]);
    const { data: allBadges } = await (supabase as any).from("badges").select("*").order("xp_reward");
    const xp = stats?.xp ?? 0;
    const { level, currentLevelXp, nextLevelXp } = levelFromXp(xp);
    return {
      xp, level, currentLevelXp, nextLevelXp,
      current_streak: stats?.current_streak ?? 0,
      longest_streak: stats?.longest_streak ?? 0,
      earned: badges ?? [],
      allBadges: allBadges ?? [],
    };
  });
