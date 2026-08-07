import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Crown, Flame, Medal, Trophy, User } from "lucide-react";
import { Nav } from "@/components/nav";
import { BottomNav } from "@/components/BottomNav";
import { fetchLeaderboard } from "@/lib/cloud-sync";
import { useAuth } from "@/lib/auth-store";
import { levelFor, useProgress } from "@/lib/progress-store";

export const Route = createFileRoute("/leaderboard")({
  head: () => ({
    meta: [
      { title: "Python learners leaderboard — top 10 by XP" },
      { name: "description", content: "See the top 10 PyLearn learners ranked by XP. Complete lessons and pass quizzes to climb the leaderboard." },
      { property: "og:title", content: "PyLearn leaderboard — top 10 by XP" },
      { property: "og:description", content: "See the top PyLearn learners ranked by XP and daily streaks." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LeaderboardPage,
});

function LeaderboardPage() {
  const { user } = useAuth();
  const p = useProgress();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["leaderboard"],
    queryFn: () => fetchLeaderboard(10),
    refetchInterval: 30_000,
  });

  const rows = data ?? [];
  const youIndex = rows.findIndex((r) => r.user_id === user?.id);

  return (
    <div className="min-h-dvh bg-background pb-24 text-foreground sm:pb-0">
      <Nav />
      <main className="mx-auto max-w-3xl px-4 py-6">
        <header>
          <h1 className="font-display text-2xl font-black tracking-tight sm:text-3xl">Leaderboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Top 10 learners by XP. Lessons are worth 10 XP and quizzes 20 XP.
          </p>
        </header>

        {!user && (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-accent/40 p-4 text-sm">
            <span>
              You have <b>{p.points} XP</b> saved on this device. Sign in to appear on the leaderboard.
            </span>
            <Link
              to="/auth"
              className="rounded-xl px-3 py-1.5 text-xs font-bold text-white shadow-[var(--shadow-glow)]"
              style={{ background: "var(--gradient-brand)" }}
            >
              Sign in
            </Link>
          </div>
        )}

        {isLoading && (
          <ul className="mt-6 space-y-2" aria-busy="true">
            {Array.from({ length: 6 }).map((_, i) => (
              <li key={i} className="h-16 animate-pulse rounded-2xl border border-border bg-muted/40" />
            ))}
          </ul>
        )}

        {isError && (
          <p className="mt-6 rounded-2xl border border-border bg-card p-4 text-sm text-muted-foreground">
            Couldn't load the leaderboard right now. Please try again in a moment.
          </p>
        )}

        {!isLoading && !isError && rows.length === 0 && (
          <p className="mt-6 rounded-2xl border border-border bg-card p-6 text-center text-sm text-muted-foreground">
            No ranked learners yet — finish a lesson to claim the #1 spot. 🏆
          </p>
        )}

        {rows.length > 0 && (
          <ol className="mt-6 space-y-2">
            {rows.map((r, i) => {
              const isYou = r.user_id === user?.id;
              const medal = i === 0 ? Crown : i === 1 ? Trophy : i === 2 ? Medal : null;
              const Icon = medal ?? User;
              return (
                <motion.li
                  key={r.user_id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className={`flex items-center gap-3 rounded-2xl border p-3 ${
                    isYou ? "border-transparent ring-2" : "border-border bg-card"
                  }`}
                  style={isYou ? { background: "color-mix(in oklab, var(--brand) 10%, transparent)" } : undefined}
                >
                  <span className="w-7 shrink-0 text-center font-display text-lg font-black text-muted-foreground">
                    {i + 1}
                  </span>
                  <span
                    className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl text-white"
                    style={{ background: i < 3 ? "var(--gradient-brand)" : "var(--color-muted)" }}
                  >
                    <Icon className={`h-4 w-4 ${i < 3 ? "" : "text-muted-foreground"}`} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold">
                      {r.display_name} {isYou && <span className="text-xs font-semibold text-muted-foreground">(you)</span>}
                    </p>
                    <p className="text-xs text-muted-foreground">Level {levelFor(r.total)}</p>
                  </div>
                  {r.streak > 0 && (
                    <span className="hidden items-center gap-1 text-xs font-semibold text-orange-600 sm:inline-flex dark:text-orange-400">
                      <Flame className="h-3.5 w-3.5" /> {r.streak}d
                    </span>
                  )}
                  <span className="font-display text-base font-black">{r.total} XP</span>
                </motion.li>
              );
            })}
          </ol>
        )}

        {user && youIndex === -1 && !isLoading && (
          <p className="mt-4 text-center text-sm text-muted-foreground">
            You have <b>{p.points} XP</b> — keep learning to break into the top 10!
          </p>
        )}
      </main>
      <BottomNav />
    </div>
  );
}
