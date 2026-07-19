import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Flame } from "lucide-react";
import { ProgressRing } from "./ProgressRing";
import { LESSONS } from "@/lib/lessons-data";

const QUOTES = [
  "Small daily wins beat rare heroic sprints.",
  "Consistency compounds — one lesson at a time.",
  "The best programmers were once beginners like you.",
  "Read code. Write code. Repeat.",
  "Progress, not perfection.",
  "Every expert started with print('hello').",
  "Ship small. Learn fast.",
];

type Props = {
  name: string;
  points: number;
  streak: number;
  level: number;
  completedSlugs: string[];
  completionPct: number;
  hydrated: boolean;
};

export function Hero({ name, points, streak, level, completedSlugs, completionPct, hydrated }: Props) {
  const nextLesson = LESSONS.find((l) => !completedSlugs.includes(l.slug)) ?? LESSONS[0];
  const quote = QUOTES[new Date().getDate() % QUOTES.length];
  const xpToNext = 200 - (points % 200);

  return (
    <section className="relative overflow-hidden rounded-3xl border border-border bg-card p-5 shadow-[var(--shadow-soft)] sm:p-8">
      {/* Ambient blobs */}
      <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full opacity-40 blur-3xl" style={{ background: "var(--gradient-brand)" }} />
      <div className="pointer-events-none absolute -bottom-24 -left-24 h-64 w-64 rounded-full opacity-30 blur-3xl" style={{ background: "var(--gradient-sunrise)" }} />

      <div className="relative grid gap-6 sm:grid-cols-[1fr_auto] sm:items-center">
        <div className="min-w-0">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background/70 px-3 py-1 text-xs font-medium backdrop-blur"
          >
            <Sparkles className="h-3 w-3" style={{ color: "var(--brand)" }} /> Level {level} · {points} XP
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.05 }}
            className="mt-3 font-display text-3xl font-black tracking-tight sm:text-4xl"
          >
            {name ? <>Welcome back, <span className="gradient-text">{name.split(" ")[0]}</span>.</> : <>Hello, coder. <span className="gradient-text">Let's learn Python.</span></>}
          </motion.h1>
          <p className="mt-2 max-w-lg text-sm text-muted-foreground sm:text-base">"{quote}"</p>

          <div className="mt-5 flex flex-wrap items-center gap-2">
            <Link
              to="/lessons/$slug"
              params={{ slug: nextLesson.slug }}
              className="group inline-flex items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-semibold text-white shadow-[var(--shadow-glow)] transition hover:-translate-y-0.5"
              style={{ background: "var(--gradient-brand)" }}
            >
              Continue: {nextLesson.title}
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
            </Link>
            <Link
              to="/lessons"
              className="inline-flex items-center gap-1.5 rounded-2xl border border-border bg-background/60 px-4 py-2.5 text-sm font-semibold backdrop-blur transition hover:bg-accent"
            >
              Browse lessons
            </Link>
            {hydrated && streak > 0 && (
              <span className="inline-flex items-center gap-1 rounded-full border border-border bg-background/60 px-3 py-1.5 text-xs font-semibold text-orange-600 backdrop-blur dark:text-orange-400">
                <Flame className="h-3.5 w-3.5" /> {streak}-day streak
              </span>
            )}
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex items-center justify-center"
        >
          <ProgressRing value={hydrated ? completionPct : 0} size={140} stroke={12}>
            <div className="text-center">
              <div className="font-display text-2xl font-black leading-none">{hydrated ? completionPct : 0}%</div>
              <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Course</div>
              <div className="mt-1 text-[10px] text-muted-foreground">{xpToNext} XP → Lv {level + 1}</div>
            </div>
          </ProgressRing>
        </motion.div>
      </div>
    </section>
  );
}
