import { supabase } from "@/integrations/supabase/client";
import { BADGES } from "@/lib/lessons-data";
import type { Progress } from "@/lib/progress-store";

export type CloudProfile = {
  display_name: string;
  avatar_url: string | null;
  streak: number;
  last_active: string | null;
};

/** Compute which badge ids are unlocked for a given progress snapshot. */
export function earnedBadgeIds(p: Pick<Progress, "completedLessons" | "passedQuizzes" | "streak" | "points">) {
  return BADGES.filter((b) => {
    if (b.type === "quiz") return p.passedQuizzes.length >= b.need;
    if (b.type === "streak") return p.streak >= b.need;
    if (b.type === "points") return p.points >= b.need;
    return p.completedLessons.length >= b.need;
  }).map((b) => b.id);
}

/** Load everything we track for a user. */
export async function loadCloudProgress(userId: string) {
  const [profileRes, xpRes, progressRes, badgeRes] = await Promise.all([
    supabase.from("profiles").select("display_name, avatar_url, streak, last_active").eq("id", userId).maybeSingle(),
    supabase.from("xp_points").select("total").eq("user_id", userId).maybeSingle(),
    supabase.from("progress").select("lesson_id, completed, quiz_passed, score").eq("user_id", userId),
    supabase.from("user_badges").select("badge_id").eq("user_id", userId),
  ]);

  return {
    profile: profileRes.data as CloudProfile | null,
    points: xpRes.data?.total ?? 0,
    completedLessons: (progressRes.data ?? []).filter((r) => r.completed).map((r) => r.lesson_id),
    passedQuizzes: (progressRes.data ?? []).filter((r) => r.quiz_passed).map((r) => r.lesson_id),
    badges: (badgeRes.data ?? []).map((r) => r.badge_id),
  };
}

/** Push the full snapshot for a user. Idempotent — safe to call after every change. */
export async function pushCloudProgress(userId: string, p: Progress, scores: Record<string, number> = {}) {
  const lessonIds = Array.from(new Set([...p.completedLessons, ...p.passedQuizzes]));

  const rows = lessonIds.map((lesson_id) => ({
    user_id: userId,
    lesson_id,
    completed: p.completedLessons.includes(lesson_id),
    quiz_passed: p.passedQuizzes.includes(lesson_id),
    score: scores[lesson_id] ?? null,
    updated_at: new Date().toISOString(),
  }));

  const badgeRows = earnedBadgeIds(p).map((badge_id) => ({ user_id: userId, badge_id }));

  await Promise.all([
    rows.length
      ? supabase.from("progress").upsert(rows, { onConflict: "user_id,lesson_id" })
      : Promise.resolve(),
    supabase.from("xp_points").upsert(
      { user_id: userId, total: p.points, updated_at: new Date().toISOString() },
      { onConflict: "user_id" },
    ),
    supabase
      .from("profiles")
      .update({
        streak: p.streak,
        last_active: p.lastVisit || null,
        ...(p.name ? { display_name: p.name } : {}),
      })
      .eq("id", userId),
    badgeRows.length
      ? supabase.from("user_badges").upsert(badgeRows, { onConflict: "user_id,badge_id" })
      : Promise.resolve(),
  ]);
}

export type LeaderboardRow = {
  user_id: string;
  display_name: string;
  avatar_url: string | null;
  total: number;
  streak: number;
};

/** Public top-10 by XP. Readable without signing in. */
export async function fetchLeaderboard(limit = 10): Promise<LeaderboardRow[]> {
  const { data } = await supabase
    .from("xp_points")
    .select("user_id, total, profiles!inner(display_name, avatar_url, streak)")
    .order("total", { ascending: false })
    .limit(limit);

  return (data ?? []).map((r) => {
    const profile = r.profiles as unknown as { display_name: string; avatar_url: string | null; streak: number };
    return {
      user_id: r.user_id,
      total: r.total,
      display_name: profile?.display_name ?? "Learner",
      avatar_url: profile?.avatar_url ?? null,
      streak: profile?.streak ?? 0,
    };
  });
}
