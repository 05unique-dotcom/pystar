import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search, CheckCircle2, X } from "lucide-react";
import { Nav } from "@/components/nav";
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
  const p = useProgress();

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return LESSONS;
    return LESSONS.filter(
      (l) => l.title.toLowerCase().includes(s) || l.topic.toLowerCase().includes(s) || l.summary.toLowerCase().includes(s),
    );
  }, [q]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Nav />
      <main className="mx-auto max-w-5xl px-4 py-6 sm:py-10">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-black tracking-tight sm:text-3xl">All Lessons</h1>
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
              className="w-full rounded-xl border border-border bg-card py-2 pl-9 pr-8 text-sm outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20"
            />
            {q && (
              <button
                onClick={() => setQ("")}
                className="absolute right-2 top-1/2 grid h-6 w-6 -translate-y-1/2 place-items-center rounded-md hover:bg-accent"
                aria-label="Clear"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-dashed border-border p-10 text-center">
            <div className="text-4xl">🔍</div>
            <p className="mt-2 font-semibold">No lessons found</p>
            <p className="text-sm text-muted-foreground">Try a different keyword.</p>
          </div>
        ) : (
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((l, i) => {
              const done = p.completedLessons.includes(l.slug);
              return (
                <Link
                  key={l.slug}
                  to="/lessons/$slug"
                  params={{ slug: l.slug }}
                  className="group animate-fade-in relative overflow-hidden rounded-2xl border border-border bg-card p-4 transition hover:-translate-y-0.5 hover:border-indigo-400/40 hover:shadow-xl"
                  style={{ animationDelay: `${i * 40}ms` }}
                >
                  <div className={`mb-3 grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br ${l.gradient} text-xl shadow-lg`}>
                    {l.emoji}
                  </div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold">{l.title}</h3>
                    {done && <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />}
                  </div>
                  <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{l.summary}</p>
                  <div className="mt-3 flex items-center justify-between text-xs">
                    <span className="rounded-full bg-accent px-2 py-0.5 font-medium text-muted-foreground">{l.topic}</span>
                    {done ? (
                      <span className="font-semibold text-emerald-500">Completed</span>
                    ) : (
                      <span className="font-semibold text-indigo-600">Start →</span>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
