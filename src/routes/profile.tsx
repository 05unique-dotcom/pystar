import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Award, Flame, LogOut, Sparkles, Star, Trophy } from "lucide-react";
import { Nav } from "@/components/nav";
import { BottomNav } from "@/components/BottomNav";
import { ProgressRing } from "@/components/ProgressRing";
import { signOut, useAuth } from "@/lib/auth-store";
import { BADGES, LESSONS } from "@/lib/lessons-data";
import { setName, useProgress, XP_PER_LEVEL } from "@/lib/progress-store";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Your PyLearn profile & progress dashboard" },
      { name: "description", content: "Track your Python XP, level, badges, streak and lesson completion in one personal dashboard." },
      { property: "og:title", content: "Your PyLearn profile" },
      { property: "og:description", content: "Track your Python XP, level, badges, streak and lesson completion." },
      { property: "og:type", content: "profile" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const p = useProgress();
  const [nameInput, setNameInput] = useState("");

  useEffect(() => {
    if (p.hydrated) setNameInput(p.name || "");
  }, [p.hydrated, p.name]);

  const completionPct = Math.round((p.completedLessons.length / LESSONS.length) * 100);
  const nextLesson = LESSONS.find((l) => !p.completedLessons.includes(l.slug)) ?? LESSONS[0];
  const earned = BADGES.filter((b) => {
    if (b.type === "quiz") return p.passedQuizzes.length >= b.need;
    if (b.type === "streak") return p.streak >= b.need;
    if (b.type === "points") return p.points >= b.need;
    return p.completedLessons.length >= b.need;
  });
  const xpInLevel = p.points % XP_PER_LEVEL;

  async function handleSignOut() {
    await signOut();
    toast.success("Signed out");
    navigate({ to: "/auth", replace: true });
  }

  const displayName = p.name?.trim() || user?.email?.split("@")[0] || "Learner";

  return (
    <div className="min-h-dvh bg-background pb-24 text-foreground sm:pb-0">
      <Nav />
      <main className="mx-auto max-w-4xl px-4 py-6">
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass relative overflow-hidden rounded-3xl border border-border p-6 shadow-[var(--shadow-soft)]"
        >
          <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center">
            <div
              className="grid h-20 w-20 shrink-0 place-items-center rounded-3xl font-display text-3xl font-black text-white shadow-[var(--shadow-glow)]"
              style={{ background: "var(--gradient-brand)" }}
              aria-hidden="true"
            >
              {displayName.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1 text-center sm:text-left">
              <h1 className="font-display text-2xl font-black tracking-tight">{displayName}</h1>
              <p className="truncate text-sm text-muted-foreground">
                {loading ? "…" : user?.email ?? "Guest — progress saved on this device only"}
              </p>
              <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-border bg-background/60 px-3 py-1 text-xs font-bold">
                <Sparkles className="h-3.5 w-3.5" style={{ color: "var(--brand)" }} />
                Level {p.level} · {p.points} XP
              </div>
              <div className="mt-3">
                <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${(xpInLevel / XP_PER_LEVEL) * 100}%`, background: "var(--gradient-brand)" }}
                  />
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {XP_PER_LEVEL - xpInLevel} XP to level {p.level + 1}
                </p>
              </div>
            </div>
            <ProgressRing value={p.hydrated ? completionPct : 0} size={110} stroke={10}>
              <div className="text-center">
                <div className="font-display text-xl font-black leading-none">{p.hydrated ? completionPct : 0}%</div>
                <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Course</div>
              </div>
            </ProgressRing>
          </div>
        </motion.section>

        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat icon={Star} label="XP earned" value={p.points} />
          <Stat icon={Trophy} label="Lessons" value={`${p.completedLessons.length}/${LESSONS.length}`} />
          <Stat icon={Award} label="Badges" value={`${earned.length}/${BADGES.length}`} />
          <Stat icon={Flame} label="Streak" value={`${p.streak}d`} />
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <section className="rounded-3xl border border-border bg-card p-5">
            <h2 className="font-display text-lg font-bold">Keep going</h2>
            <p className="mt-1 text-sm text-muted-foreground">Pick up right where you left off.</p>
            <Link
              to="/lessons/$slug"
              params={{ slug: nextLesson.slug }}
              className="mt-4 inline-flex items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-bold text-white shadow-[var(--shadow-glow)] transition hover:-translate-y-0.5"
              style={{ background: "var(--gradient-brand)" }}
            >
              Continue: {nextLesson.title}
            </Link>
          </section>

          <section className="rounded-3xl border border-border bg-card p-5">
            <h2 className="font-display text-lg font-bold">Display name</h2>
            <p className="mt-1 text-sm text-muted-foreground">Shown on the leaderboard and your certificate.</p>
            <div className="mt-4 flex gap-2">
              <input
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                maxLength={40}
                placeholder="Your name"
                className="min-w-0 flex-1 rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2"
              />
              <button
                onClick={() => {
                  setName(nameInput.trim());
                  toast.success("Name saved");
                }}
                className="rounded-xl border border-border px-4 py-2 text-sm font-bold transition hover:bg-accent"
              >
                Save
              </button>
            </div>
          </section>
        </div>

        <section className="mt-4 rounded-3xl border border-border bg-card p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-bold">Badges</h2>
            <Link to="/badges" className="text-xs font-bold" style={{ color: "var(--brand)" }}>
              View all
            </Link>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {BADGES.map((b) => {
              const has = earned.some((e) => e.id === b.id);
              return (
                <span
                  key={b.id}
                  title={b.desc}
                  className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                    has
                      ? "border-transparent text-white shadow-[var(--shadow-glow)]"
                      : "border-border bg-muted/40 text-muted-foreground grayscale"
                  }`}
                  style={has ? { background: "var(--gradient-brand)" } : undefined}
                >
                  <span aria-hidden="true">{b.emoji}</span> {b.title}
                </span>
              );
            })}
          </div>
        </section>

        {user ? (
          <button
            onClick={handleSignOut}
            className="mt-6 inline-flex items-center gap-2 rounded-2xl border border-border px-4 py-2.5 text-sm font-semibold transition hover:bg-accent"
          >
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        ) : (
          <Link
            to="/auth"
            className="mt-6 inline-flex items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-bold text-white shadow-[var(--shadow-glow)]"
            style={{ background: "var(--gradient-brand)" }}
          >
            Sign in to save progress
          </Link>
        )}
      </main>
      <BottomNav />
    </div>
  );
}

function Stat({ icon: Icon, label, value }: { icon: typeof Star; label: string; value: string | number }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <Icon className="h-4 w-4" style={{ color: "var(--brand)" }} />
      <div className="mt-2 font-display text-xl font-black leading-none">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}
