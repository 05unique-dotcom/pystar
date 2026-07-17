import { createFileRoute } from "@tanstack/react-router";
import { Nav } from "@/components/nav";
import { BADGES, LESSONS } from "@/lib/lessons-data";
import { useProgress } from "@/lib/progress-store";
import { Trophy, Lock } from "lucide-react";

export const Route = createFileRoute("/badges")({
  head: () => ({
    meta: [
      { title: "Badges — PyLearn" },
      { name: "description", content: "Collect badges by completing lessons, passing quizzes, earning points, and keeping your streak alive." },
    ],
  }),
  component: BadgesPage,
});

function amountFor(type: string | undefined, p: ReturnType<typeof useProgress>) {
  switch (type) {
    case "quiz": return p.passedQuizzes.length;
    case "streak": return p.streak;
    case "points": return p.points;
    default: return p.completedLessons.length;
  }
}

function BadgesPage() {
  const p = useProgress();
  const earned = BADGES.filter((b) => amountFor(b.type, p) >= b.need);
  const totalPct = Math.round((earned.length / BADGES.length) * 100);

  const groups: { label: string; type?: string }[] = [
    { label: "Lesson Milestones", type: undefined },
    { label: "Quiz Mastery", type: "quiz" },
    { label: "Streaks", type: "streak" },
    { label: "Points", type: "points" },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Nav />
      <main className="mx-auto max-w-5xl px-4 py-6 sm:py-10">
        <div className="flex flex-col gap-4 rounded-3xl border border-border bg-gradient-to-br from-yellow-500/10 via-fuchsia-500/10 to-cyan-500/10 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-8">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background/60 px-3 py-1 text-xs font-medium backdrop-blur">
              <Trophy className="h-3 w-3 text-yellow-500" /> Achievements
            </div>
            <h1 className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">Your Badges</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {p.hydrated ? earned.length : 0} of {BADGES.length} unlocked · {p.hydrated ? p.points : 0} points · {p.hydrated ? p.streak : 0}-day streak
            </p>
          </div>
          <div className="w-full sm:w-64">
            <div className="mb-1 flex items-center justify-between text-xs font-medium text-muted-foreground">
              <span>Collection</span>
              <span>{totalPct}%</span>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-gradient-to-r from-yellow-400 via-fuchsia-500 to-cyan-500 transition-all duration-700"
                style={{ width: `${totalPct}%` }}
              />
            </div>
          </div>
        </div>

        {groups.map((g) => {
          const items = BADGES.filter((b) => (b.type ?? undefined) === g.type);
          if (!items.length) return null;
          return (
            <section key={g.label} className="mt-8">
              <h2 className="mb-3 text-lg font-bold sm:text-xl">{g.label}</h2>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((b) => {
                  const have = amountFor(b.type, p);
                  const got = have >= b.need;
                  const pct = Math.min(100, Math.round((have / b.need) * 100));
                  return (
                    <div
                      key={b.id}
                      className={`rounded-2xl border p-5 transition hover:-translate-y-0.5 hover:shadow-xl ${
                        got
                          ? "border-transparent bg-gradient-to-br from-yellow-400/15 via-fuchsia-500/15 to-cyan-500/15 shadow-lg"
                          : "border-border bg-card"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`relative grid h-14 w-14 place-items-center rounded-2xl text-3xl ${got ? "bg-white/70 shadow-inner dark:bg-white/10" : "bg-muted grayscale"}`}>
                          {b.emoji}
                          {!got && (
                            <Lock className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-background p-0.5 text-muted-foreground" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold">{b.name}</div>
                          <div className="text-xs text-muted-foreground">{b.desc}</div>
                        </div>
                      </div>
                      <div className="mt-4">
                        <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
                          <span>{Math.min(have, b.need)} / {b.need}</span>
                          <span>{got ? "Unlocked 🎉" : `${pct}%`}</span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-muted">
                          <div
                            className={`h-full rounded-full transition-all duration-700 ${got ? "bg-gradient-to-r from-yellow-400 to-fuchsia-500" : "bg-gradient-to-r from-fuchsia-500 to-cyan-500"}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })}

        <p className="mt-8 text-center text-xs text-muted-foreground">
          Total {LESSONS.length} lessons available. Keep going!
        </p>
      </main>
    </div>
  );
}
