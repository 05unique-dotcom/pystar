import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search, X, BookOpen } from "lucide-react";
import { Nav } from "@/components/nav";
import { BottomNav } from "@/components/BottomNav";
import { LessonCard } from "@/components/LessonCard";
import { LESSONS } from "@/lib/lessons-data";
import { useProgress } from "@/lib/progress-store";

export const Route = createFileRoute("/lessons")({
  head: () => ({
    meta: [
      { title: "Lessons — PyLearn" },
      { name: "description", content: "Browse all Python lessons: basics, control flow, functions, and data structures." },
    ],
  }),
  component: LessonsPage,
});

function LessonsPage() {
  const [q, setQ] = useState("");
  const [topic, setTopic] = useState<string>("All");
  const p = useProgress();

  const topics = useMemo(() => ["All", ...Array.from(new Set(LESSONS.map((l) => l.topic)))], []);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    return LESSONS.filter((l) => {
      if (topic !== "All" && l.topic !== topic) return false;
      if (!s) return true;
      return l.title.toLowerCase().includes(s) || l.topic.toLowerCase().includes(s) || l.summary.toLowerCase().includes(s);
    });
  }, [q, topic]);

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <Nav />
      <main className="mx-auto max-w-6xl px-4 pb-28 pt-6 sm:pb-10 sm:pt-10">
        {/* Header */}
        <section className="relative overflow-hidden rounded-3xl border border-border bg-card p-5 shadow-[var(--shadow-soft)] sm:p-8">
          <div className="pointer-events-none absolute -right-24 -top-24 h-56 w-56 rounded-full opacity-30 blur-3xl" style={{ background: "var(--gradient-brand)" }} />
          <div className="relative flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background/70 px-3 py-1 text-xs font-medium backdrop-blur">
                <BookOpen className="h-3 w-3" style={{ color: "var(--brand)" }} /> Roadmap
              </div>
              <h1 className="mt-2 font-display text-3xl font-black tracking-tight sm:text-4xl">
                Python <span className="gradient-text">Learning Path</span>
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {LESSONS.length} lessons · {p.hydrated ? p.completedLessons.length : 0} complete
              </p>
            </div>
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search lessons…"
                aria-label="Search lessons"
                className="w-full rounded-xl border border-border bg-background/70 py-2.5 pl-9 pr-8 text-sm outline-none transition focus:border-transparent"
                style={{ boxShadow: "none" }}
                onFocus={(e) => (e.currentTarget.style.boxShadow = "var(--ring-brand)")}
                onBlur={(e) => (e.currentTarget.style.boxShadow = "none")}
              />
              {q && (
                <button
                  onClick={() => setQ("")}
                  className="absolute right-2 top-1/2 grid h-6 w-6 -translate-y-1/2 place-items-center rounded-md hover:bg-accent"
                  aria-label="Clear search"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Topic chips */}
          <div className="no-scrollbar mt-4 flex gap-2 overflow-x-auto">
            {topics.map((t) => {
              const active = topic === t;
              return (
                <button
                  key={t}
                  onClick={() => setTopic(t)}
                  className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                    active
                      ? "border-transparent text-white shadow-md"
                      : "border-border bg-background/60 text-muted-foreground hover:text-foreground"
                  }`}
                  style={active ? { background: "var(--gradient-brand)" } : undefined}
                >
                  {t}
                </button>
              );
            })}
          </div>
        </section>

        {filtered.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-dashed border-border p-10 text-center">
            <div className="text-4xl">🔍</div>
            <p className="mt-2 font-semibold">No lessons found</p>
            <p className="text-sm text-muted-foreground">Try a different keyword or topic.</p>
          </div>
        ) : (
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((l, i) => (
              <LessonCard
                key={l.slug}
                lesson={l}
                done={p.completedLessons.includes(l.slug)}
                quizPassed={p.passedQuizzes.includes(l.slug)}
                index={i}
              />
            ))}
          </div>
        )}
      </main>
      <BottomNav />
    </div>
  );
}
