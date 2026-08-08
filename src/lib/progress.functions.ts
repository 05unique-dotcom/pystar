import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const lessonInput = z.object({ slug: z.string().trim().min(1).max(64) });

const quizInput = z.object({
  slug: z.string().trim().min(1).max(64),
  answers: z.array(z.number().int().min(-1).max(20)).max(50),
});

/** Records a lesson as read. XP is recomputed server-side, never accepted from the client. */
export const recordLessonComplete = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => lessonInput.parse(data))
  .handler(async ({ data, context }) => {
    const { isKnownLesson, recomputeUserState } = await import("@/lib/progress.server");
    if (!isKnownLesson(data.slug)) throw new Error("Unknown lesson");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { error } = await supabaseAdmin
      .from("progress")
      .upsert(
        { user_id: context.userId, lesson_id: data.slug, completed: true, updated_at: new Date().toISOString() },
        { onConflict: "user_id,lesson_id" },
      );
    if (error) throw error;

    return recomputeUserState(supabaseAdmin, context.userId, { bumpStreak: true });
  });

/** Grades the quiz server-side and only then credits XP / marks it passed. */
export const submitQuizAttempt = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => quizInput.parse(data))
  .handler(async ({ data, context }) => {
    const { gradeQuiz, recomputeUserState } = await import("@/lib/progress.server");
    const result = gradeQuiz(data.slug, data.answers);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: existing } = await supabaseAdmin
      .from("progress")
      .select("quiz_passed, score")
      .eq("user_id", context.userId)
      .eq("lesson_id", data.slug)
      .maybeSingle();

    const { error } = await supabaseAdmin.from("progress").upsert(
      {
        user_id: context.userId,
        lesson_id: data.slug,
        completed: true,
        quiz_passed: existing?.quiz_passed || result.passed,
        score: Math.max(existing?.score ?? 0, result.score),
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id,lesson_id" },
    );
    if (error) throw error;

    const state = await recomputeUserState(supabaseAdmin, context.userId, { bumpStreak: true });
    return { ...state, correct: result.correct, total: result.total, passed: result.passed, score: result.score };
  });

/** Authoritative snapshot for the signed-in user. */
export const getMyProgress = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { recomputeUserState } = await import("@/lib/progress.server");
    return recomputeUserState(supabaseAdmin, context.userId);
  });
