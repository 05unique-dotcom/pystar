import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Flame, Star, BookOpen, Trophy, ArrowRight, Target } from "lucide-react";
import { Nav } from "@/components/nav";
import { BottomNav } from "@/components/BottomNav";
import { Hero } from "@/components/Hero";
import { StatCard } from "@/components/StatCard";
import { LessonCard } from "@/components/LessonCard";
import { LESSONS, BADGES } from "@/lib/lessons-data";
import { useProgress } from "@/lib/progress-store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "PyLearn — Learn Python the Modern Way" },
      { name: "description", content: "Premium interactive Python lessons, quizzes, badges, and streaks. Mobile-first and beautifully designed." },
      { property: "og:title", content: "PyLearn — Learn Python the Modern Way" },
      { property: "og:description", content: "Lessons, quizzes, badges, and streaks." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const p = useProgress();
  const total = LESSONS.length;
  const done = p.completedLessons.length;
  const pct = total ? Math.round((done / total) * 100) : 0;
  const level = Math.floor(p.points / 200) + 1;

  const earnedBadges = BADGES.filter((b) => {
    if (b.type === "quiz") return p.passedQuizzes.length >= b.need;
    if (b.type === "streak") return p.streak >= b.need;
    if (b.type === "points") return p.points >= b.need;
    return p.completedLessons.length >= b.need;
  });

  // "Continue learning": next 3 not-yet-completed, then finish with completed
  const remaining = LESSONS.filter((l) => !p.completedLessons.includes(l.slug));
  const continueList = (remaining.length ? remaining : LESSONS).slice(0, 3);

  const dailyIdx = new Date().getDate() % LESSONS.length;
  const daily = LESSONS[dailyIdx];

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <Nav />
      <main className="mx-auto max-w-6xl px-4 pb-28 pt-6 sm:pb-10 sm:pt-10">
        <Hero
          name={p.hydrated ? p.name : ""}
          points={p.hydrated ? p.points : 0}
          streak={p.hydrated ? p.streak : 0}
          level={p.hydrated ? level : 1}
          completedSlugs={p.completedLessons}
          completionPct={pct}
          hydrated={p.hydrated}
        />

        {/* Stats */}
        <section className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard icon={Flame} label="Streak" value={p.hydrated ? `${p.streak}d` : "0d"} sub="Daily activity" gradient="from-orange-500 to-rose-500" progress={Math.min(100, (p.streak / 7) * 100)} delay={0.02} />
          <StatCard icon={Star} label="XP" value={p.hydrated ? p.points : 0} sub={`Level ${level}`} gradient="from-amber-400 to-yellow-500" progress={((p.points % 200) / 200) * 100} delay={0.06} />
          <StatCard icon={BookOpen} label="Lessons" value={`${done}/${total}`} sub={`${pct}% complete`} gradient="from-indigo-500 to-violet-500" progress={pct} delay={0.1} />
          <StatCard icon={Trophy} label="Badges" value={p.hydrated ? earnedBadges.length : 0} sub={`of ${BADGES.length}`} gradient="from-emerald-500 to-teal-500" progress={(earnedBadges.length / BADGES.length) * 100} delay={0.14} />
        </section>

        {/* Daily Challenge */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="mt-6 overflow-hidden rounded-2xl border border-border p-5 shadow-[var(--shadow-soft)]"
          style={{ background: "linear-gradient(135deg, color-mix(in oklab, var(--brand) 8%, var(--color-card)), var(--color-card))" }}
        >
          <div className="flex items-start gap-4">
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl text-white shadow-md" style={{ background: "var(--gradient-sunrise)" }}>
              <Target className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[11px] font-bold uppercase tracking-widest" style={{ color: "var(--brand)" }}>Daily challenge</div>
              <h3 className="font-display text-lg font-bold">{daily.title}</h3>
              <p className="mt-0.5 line-clamp-2 text-sm text-muted-foreground">{daily.summary}</p>
            </div>
            <Link
              to="/lessons/$slug"
              params={{ slug: daily.slug }}
              className="hidden shrink-0 items-center gap-1 rounded-xl px-3 py-2 text-sm font-semibold text-white shadow-md transition hover:-translate-y-0.5 sm:inline-flex"
              style={{ background: "var(--gradient-brand)" }}
            >
              Take challenge <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <Link
            to="/lessons/$slug"
            params={{ slug: daily.slug }}
            className="mt-3 inline-flex w-full items-center justify-center gap-1 rounded-xl px-3 py-2 text-sm font-semibold text-white shadow-md sm:hidden"
            style={{ background: "var(--gradient-brand)" }}
          >
            Take challenge <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </motion.section>

        {/* Continue learning */}
        <section className="mt-8">
          <div className="mb-3 flex items-end justify-between">
            <h2 className="font-display text-xl font-bold sm:text-2xl">Continue learning</h2>
            <Link to="/lessons" className="text-xs font-bold" style={{ color: "var(--brand)" }}>
              See all →
            </Link>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {continueList.map((l, i) => (
              <LessonCard
                key={l.slug}
                lesson={l}
                done={p.completedLessons.includes(l.slug)}
                quizPassed={p.passedQuizzes.includes(l.slug)}
                index={i}
              />
            ))}
          </div>
        </section>

        {/* Badges strip */}
        <section className="mt-8">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-display text-xl font-bold sm:text-2xl">Recent badges</h2>
            <Link to="/badges" className="text-xs font-bold" style={{ color: "var(--brand)" }}>
              View all →
            </Link>
          </div>
          <div className="no-scrollbar -mx-4 flex gap-3 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-5 sm:overflow-visible sm:px-0">
            {BADGES.slice(0, 5).map((b) => {
              const got = earnedBadges.some((e) => e.id === b.id);
              return (
                <div
                  key={b.id}
                  className={`w-32 shrink-0 rounded-2xl border p-3 text-center transition sm:w-auto ${
                    got ? "border-transparent shadow-[var(--shadow-soft)]" : "border-border bg-card opacity-60"
                  }`}
                  style={got ? { background: "linear-gradient(135deg, color-mix(in oklab, var(--brand-accent) 20%, var(--color-card)), var(--color-card))" } : undefined}
                >
                  <div className={`mx-auto grid h-14 w-14 place-items-center rounded-full text-3xl ${got ? "" : "grayscale"}`} style={got ? { boxShadow: "0 0 32px -4px color-mix(in oklab, var(--brand-accent) 60%, transparent)" } : undefined}>
                    {b.emoji}
                  </div>
                  <div className="mt-1 truncate text-sm font-bold">{b.name}</div>
                  <div className="line-clamp-1 text-[11px] text-muted-foreground">{b.desc}</div>
                </div>
              );
            })}
          </div>
        </section>

        <p className="mt-10 flex items-center justify-center gap-1 text-xs text-muted-foreground">
          <Flame className="h-3 w-3 text-orange-500" /> A little every day goes a long way.
        </p>
      </main>
      <BottomNav />
    </div>
  );
}
