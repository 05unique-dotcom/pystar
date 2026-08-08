import { supabase } from "@/integrations/supabase/client";
import { BADGES } from "@/lib/lessons-data";
import type { Progress } from "@/lib/progress-store";

export type CloudProfile = {
  display_name: string;
  avatar_url: string | null;
  streak: number;
  last_active: string | null;
};

/** Compute which badge ids are unlocked for a given progress snapshot (display only). */
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

/**
 * Push only the user-editable profile fields. XP, lesson/quiz progress, badges and
 * streak are written exclusively by server functions after server-side validation,
 * so they are intentionally NOT sent from the browser.
 */
export async function pushCloudProfile(userId: string, p: Pick<Progress, "name" | "avatarUrl">) {
  const patch: { display_name?: string; avatar_url?: string } = {};
  if (p.name) patch.display_name = p.name;
  if (p.avatarUrl) patch.avatar_url = p.avatarUrl;
  if (!Object.keys(patch).length) return;
  await supabase.from("profiles").update(patch).eq("id", userId);
}

export type LeaderboardRow = {
  user_id: string;
  display_name: string;
  avatar_url: string | null;
  total: number;
  streak: number;
};

/** Top-10 by XP. */
export async function fetchLeaderboard(limit = 10): Promise<LeaderboardRow[]> {
  const { data: xp } = await supabase
    .from("xp_points")
    .select("user_id, total")
    .order("total", { ascending: false })
    .limit(limit);

  const rows = xp ?? [];
  if (!rows.length) return [];

  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, display_name, avatar_url, streak")
    .in("id", rows.map((r) => r.user_id));

  const byId = new Map((profiles ?? []).map((p) => [p.id, p]));

  return rows.map((r) => {
    const profile = byId.get(r.user_id);
    return {
      user_id: r.user_id,
      total: r.total,
      display_name: profile?.display_name ?? "Learner",
      avatar_url: profile?.avatar_url ?? null,
      streak: profile?.streak ?? 0,
    };
  });
}
