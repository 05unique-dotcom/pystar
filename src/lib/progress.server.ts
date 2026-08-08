import { BADGES, LESSONS } from "@/lib/lessons-data";

export const XP_PER_LESSON = 10;
export const XP_PER_QUIZ = 20;
export const QUIZ_PASS_RATIO = 0.7;

export type ServerProgressSnapshot = {
  points: number;
  completedLessons: string[];
  passedQuizzes: string[];
  streak: number;
  lastVisit: string;
  badges: string[];
};

function earnedBadgeIds(input: {
  completedLessons: string[];
  passedQuizzes: string[];
  streak: number;
  points: number;
}) {
  return BADGES.filter((b) => {
    if ("type" in b && b.type === "quiz") return input.passedQuizzes.length >= b.need;
    if ("type" in b && b.type === "streak") return input.streak >= b.need;
    if ("type" in b && b.type === "points") return input.points >= b.need;
    return input.completedLessons.length >= b.need;
  }).map((b) => b.id);
}

/** Grade a quiz submission entirely on the server. Returns correct count / pass state. */
export function gradeQuiz(slug: string, answers: number[]) {
  const lesson = LESSONS.find((l) => l.slug === slug);
  if (!lesson) throw new Error("Unknown lesson");
  const total = lesson.quiz.length;
  const correct = lesson.quiz.reduce((acc, q, i) => acc + (answers[i] === q.answer ? 1 : 0), 0);
  return { total, correct, score: Math.round((correct / total) * 100), passed: correct / total >= QUIZ_PASS_RATIO };
}

export function isKnownLesson(slug: string) {
  return LESSONS.some((l) => l.slug === slug);
}

type AdminClient = Awaited<typeof import("@/integrations/supabase/client.server")>["supabaseAdmin"];

/**
 * Recomputes XP, streak and badges from the persisted progress rows — never from
 * client-submitted totals — and returns the authoritative snapshot.
 */
export async function recomputeUserState(
  supabaseAdmin: AdminClient,
  userId: string,
  { bumpStreak = false }: { bumpStreak?: boolean } = {},
): Promise<ServerProgressSnapshot> {
  const { data: rows, error } = await supabaseAdmin
    .from("progress")
    .select("lesson_id, completed, quiz_passed")
    .eq("user_id", userId);
  if (error) throw error;

  const valid = (rows ?? []).filter((r) => isKnownLesson(r.lesson_id));
  const completedLessons = valid.filter((r) => r.completed).map((r) => r.lesson_id);
  const passedQuizzes = valid.filter((r) => r.quiz_passed).map((r) => r.lesson_id);
  const points = completedLessons.length * XP_PER_LESSON + passedQuizzes.length * XP_PER_QUIZ;

  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("streak, last_active")
    .eq("id", userId)
    .maybeSingle();

  const today = new Date().toISOString().slice(0, 10);
  const yesterday = new Date(Date.now() - 86_400_000).toISOString().slice(0, 10);
  let streak = profile?.streak ?? 0;
  let lastVisit = profile?.last_active ?? "";

  if (bumpStreak && lastVisit !== today) {
    streak = lastVisit === yesterday ? streak + 1 : 1;
    lastVisit = today;
    await supabaseAdmin.from("profiles").update({ streak, last_active: lastVisit }).eq("id", userId);
  }

  await supabaseAdmin
    .from("xp_points")
    .upsert({ user_id: userId, total: points, updated_at: new Date().toISOString() }, { onConflict: "user_id" });

  const badges = earnedBadgeIds({ completedLessons, passedQuizzes, streak, points });
  if (badges.length) {
    await supabaseAdmin
      .from("user_badges")
      .upsert(
        badges.map((badge_id) => ({ user_id: userId, badge_id })),
        { onConflict: "user_id,badge_id" },
      );
  }

  return { points, completedLessons, passedQuizzes, streak, lastVisit, badges };
}
