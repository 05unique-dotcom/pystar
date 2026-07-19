import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { CheckCircle2, Clock, Lock, Sparkles, ArrowRight } from "lucide-react";
import type { Lesson } from "@/lib/lessons-data";

type Props = {
  lesson: Lesson;
  done: boolean;
  quizPassed: boolean;
  locked?: boolean;
  index?: number;
};

function difficultyFor(idx: number): { label: string; color: string } {
  if (idx <= 1) return { label: "Beginner", color: "text-emerald-600 bg-emerald-500/10" };
  if (idx <= 3) return { label: "Intermediate", color: "text-amber-600 bg-amber-500/10" };
  return { label: "Advanced", color: "text-rose-600 bg-rose-500/10" };
}

export function LessonCard({ lesson, done, quizPassed, locked, index = 0 }: Props) {
  const diff = difficultyFor(index);
  const minutes = 5 + Math.min(10, lesson.content.length * 2 + Math.floor(lesson.quiz.length / 2));
  const xp = done ? 20 : 0;

  const inner = (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.04 }}
      whileHover={locked ? undefined : { y: -3 }}
      className={`group relative flex h-full flex-col overflow-hidden rounded-2xl border p-4 transition ${
        locked
          ? "border-border bg-muted/40 opacity-70"
          : done
            ? "border-emerald-500/30 bg-card shadow-[var(--shadow-soft)]"
            : "border-border bg-card shadow-[var(--shadow-soft)] hover:border-transparent"
      }`}
    >
      {!locked && !done && (
        <div className="pointer-events-none absolute inset-0 opacity-0 transition group-hover:opacity-100" style={{ boxShadow: "var(--shadow-glow)" }} />
      )}
      <div className="flex items-start justify-between">
        <div className={`grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br ${lesson.gradient} text-2xl text-white shadow-md`}>
          {lesson.emoji}
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${diff.color}`}>
            {diff.label}
          </span>
          {locked ? (
            <Lock className="h-4 w-4 text-muted-foreground" />
          ) : done ? (
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          ) : null}
        </div>
      </div>

      <h3 className="mt-3 font-display text-base font-bold leading-tight sm:text-lg">{lesson.title}</h3>
      <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{lesson.summary}</p>

      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" /> {minutes} min</span>
        <span className="inline-flex items-center gap-1"><Sparkles className="h-3 w-3" /> +{20 + (quizPassed ? 30 : 0) || 20} XP</span>
        <span className="rounded-full bg-accent px-2 py-0.5 font-medium">{lesson.topic}</span>
      </div>

      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{
            width: `${done && quizPassed ? 100 : done ? 60 : 0}%`,
            background: "var(--gradient-brand)",
          }}
        />
      </div>

      <div className="mt-3 flex items-center justify-between text-xs">
        <span className="font-semibold text-muted-foreground">
          {locked ? "Locked" : done && quizPassed ? "Mastered" : done ? "In review" : "Not started"}
        </span>
        {!locked && (
          <span className="inline-flex items-center gap-1 font-bold" style={{ color: "var(--brand)" }}>
            {done ? "Revisit" : "Start"} <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
          </span>
        )}
      </div>

      {done && xp > 0 && (
        <span className="pointer-events-none absolute right-3 top-3 sr-only">Completed</span>
      )}
    </motion.div>
  );

  if (locked) return inner;
  return (
    <Link to="/lessons/$slug" params={{ slug: lesson.slug }} className="block h-full">
      {inner}
    </Link>
  );
}
