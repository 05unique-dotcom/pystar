import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { Nav } from "@/components/nav";
import { LESSONS, BADGES } from "@/lib/lessons-data";
import { tickStreak, useProgress } from "@/lib/progress-store";
import { Flame, Trophy, Sparkles, ArrowRight, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "PyLearn — Python Learning, Playful & Fast" },
      {
        name: "description",
        content:
          "Interactive Python lessons, quizzes, badges, and streaks. Learn Python step-by-step in a colorful mobile-first app.",
      },
      { property: "og:title", content: "PyLearn — Learn Python the Fun Way" },
      { property: "og:description", content: "Lessons, quizzes, badges, streaks." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const p = useProgress();
  useEffect(() => {
    tickStreak();
  }, []);

  const total = LESSONS.length;
  const done = p.completedLessons.length;
  const pct = total ? Math.round((done / total) * 100) : 0;

  const earnedBadges = BADGES.filter((b) => {
    if (b.type === "quiz") return p.passedQuizzes.length >= b.need;
    if (b.type === "streak") return p.streak >= b.need;
    return p.completedLessons.length >= b.need;
  });

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Nav />
      <main className="mx-auto max-w-5xl px-4 py-6 sm:py-10">
        {/* Hero */}
        <section className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-fuchsia-500/10 via-purple-500/10 to-cyan-500/10 p-5 sm:p-8">
          <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-fuchsia-500/20 blur-3xl" />
          <div className="absolute -bottom-20 -left-10 h-56 w-56 rounded-full bg-cyan-500/20 blur-3xl" />
          <div className="relative">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background/60 px-3 py-1 text-xs font-medium backdrop-blur">
              <Sparkles className="h-3 w-3 text-fuchsia-500" /> Playful Python
            </div>
            <h1 className="mt-3 text-2xl font-black tracking-tight sm:text-4xl">
              Hello, coder! <span className="bg-gradient-to-r from-fuchsia-500 to-cyan-500 bg-clip-text text-transparent">Let's learn Python.</span>
            </h1>
            <p className="mt-2 max-w-lg text-sm text-muted-foreground sm:text-base">
              Bite-sized lessons, fun quizzes, and a daily streak — all in one place.
            </p>

            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Stat icon="🔥" label="Day streak" value={p.hydrated ? p.streak : 0} tint="from-orange-500 to-rose-500" />
              <Stat icon="⭐" label="Points" value={p.hydrated ? p.points : 0} tint="from-yellow-500 to-amber-500" />
              <Stat icon="📘" label="Lessons" value={`${done}/${total}`} tint="from-indigo-500 to-purple-500" />
              <Stat icon="🏆" label="Badges" value={p.hydrated ? earnedBadges.length : 0} tint="from-emerald-500 to-teal-500" />
            </div>

            <div className="mt-5">
              <div className="mb-1.5 flex items-center justify-between text-xs font-medium text-muted-foreground">
                <span>Overall progress</span>
                <span>{pct}%</span>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-fuchsia-500 to-cyan-500 transition-all duration-700"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Continue */}
        <section className="mt-8">
          <div className="mb-3 flex items-end justify-between">
            <h2 className="text-lg font-bold sm:text-xl">Continue learning</h2>
            <Link to="/lessons" className="text-xs font-semibold text-fuchsia-500 hover:underline">
              See all →
            </Link>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {LESSONS.slice(0, 3).map((l) => {
              const isDone = p.completedLessons.includes(l.slug);
              return (
                <Link
                  key={l.slug}
                  to="/lessons/$slug"
                  params={{ slug: l.slug }}
                  className="group relative overflow-hidden rounded-2xl border border-border bg-card p-4 transition hover:-translate-y-0.5 hover:shadow-xl"
                >
                  <div className={`mb-3 grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br ${l.gradient} text-xl shadow-lg`}>
                    {l.emoji}
                  </div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold">{l.title}</h3>
                    {isDone && <CheckCircle2 className="h-4 w-4 text-emerald-500" />}
                  </div>
                  <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{l.summary}</p>
                  <div className="mt-3 flex items-center justify-between text-xs">
                    <span className="rounded-full bg-accent px-2 py-0.5 font-medium text-muted-foreground">{l.topic}</span>
                    <ArrowRight className="h-4 w-4 opacity-0 transition group-hover:translate-x-1 group-hover:opacity-100" />
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Badges */}
        <section className="mt-8">
          <div className="mb-3 flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            <h2 className="text-lg font-bold sm:text-xl">Your badges</h2>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {BADGES.map((b) => {
              const got = earnedBadges.some((e) => e.id === b.id);
              return (
                <div
                  key={b.id}
                  className={`rounded-2xl border p-3 text-center transition ${
                    got
                      ? "border-transparent bg-gradient-to-br from-yellow-400/20 to-fuchsia-500/20 shadow-inner"
                      : "border-border bg-card opacity-60"
                  }`}
                >
                  <div className={`mx-auto grid h-12 w-12 place-items-center rounded-full text-2xl ${got ? "" : "grayscale"}`}>
                    {b.emoji}
                  </div>
                  <div className="mt-1 text-sm font-bold">{b.name}</div>
                  <div className="text-[11px] text-muted-foreground">{b.desc}</div>
                </div>
              );
            })}
          </div>
        </section>

        <div className="mt-10 flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <Flame className="h-3 w-3 text-orange-500" /> Roz thoda-thoda seekho, badhta jayega.
        </div>
      </main>
    </div>
  );
}

function Stat({ icon, label, value, tint }: { icon: string; label: string; value: string | number; tint: string }) {
  return (
    <div className="rounded-2xl border border-border bg-background/70 p-3 backdrop-blur">
      <div className={`mb-1 inline-grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br ${tint} text-sm`}>{icon}</div>
      <div className="text-lg font-black leading-tight sm:text-xl">{value}</div>
      <div className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{label}</div>
    </div>
  );
}
