import { createFileRoute } from "@tanstack/react-router";
import { Nav } from "@/components/nav";
import { BADGES, LESSONS } from "@/lib/lessons-data";
import { useProgress } from "@/lib/progress-store";

export const Route = createFileRoute("/badges")({
  head: () => ({
    meta: [
      { title: "Badges — PyLearn" },
      { name: "description", content: "Collect badges by completing lessons, passing quizzes, and keeping your streak alive." },
    ],
  }),
  component: BadgesPage,
});

function BadgesPage() {
  const p = useProgress();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Nav />
      <main className="mx-auto max-w-4xl px-4 py-6 sm:py-10">
        <h1 className="text-2xl font-black tracking-tight sm:text-3xl">Your Badges</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {p.hydrated ? p.points : 0} points earned · {p.hydrated ? p.streak : 0} day streak
        </p>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {BADGES.map((b) => {
            const have =
              b.type === "quiz"
                ? p.passedQuizzes.length
                : b.type === "streak"
                  ? p.streak
                  : p.completedLessons.length;
            const got = have >= b.need;
            const pct = Math.min(100, Math.round((have / b.need) * 100));
            return (
              <div
                key={b.id}
                className={`rounded-2xl border p-5 transition ${
                  got
                    ? "border-transparent bg-gradient-to-br from-yellow-400/15 via-fuchsia-500/15 to-cyan-500/15 shadow-lg"
                    : "border-border bg-card"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`grid h-14 w-14 place-items-center rounded-2xl text-3xl ${got ? "bg-white/70 shadow-inner dark:bg-white/10" : "bg-muted grayscale"}`}>
                    {b.emoji}
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

        <p className="mt-8 text-center text-xs text-muted-foreground">
          Total {LESSONS.length} lessons available. Keep going!
        </p>
      </main>
    </div>
  );
}
