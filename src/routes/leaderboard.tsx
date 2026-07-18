import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Nav } from "@/components/nav";
import { LESSONS } from "@/lib/lessons-data";
import { setName, useProgress } from "@/lib/progress-store";
import { Crown, Medal, Trophy, User } from "lucide-react";

export const Route = createFileRoute("/leaderboard")({
  head: () => ({
    meta: [
      { title: "Leaderboard — PyLearn" },
      { name: "description", content: "See how you rank against other Python learners. Earn points from lessons and quizzes to climb the board." },
    ],
  }),
  component: LeaderboardPage,
});

type Row = {
  id: string;
  name: string;
  points: number;
  lessons: number;
  quizzes: number;
  streak: number;
  isYou?: boolean;
};

// Deterministic seeded competitors so the ranking is stable across renders.
const SEED: Row[] = [
  { id: "a", name: "Ananya S.",   points: 320, lessons: 6, quizzes: 6, streak: 9 },
  { id: "b", name: "Rohan K.",    points: 285, lessons: 6, quizzes: 5, streak: 7 },
  { id: "c", name: "Priya M.",    points: 240, lessons: 5, quizzes: 5, streak: 6 },
  { id: "d", name: "Vikram R.",   points: 210, lessons: 5, quizzes: 4, streak: 4 },
  { id: "e", name: "Sara D.",     points: 180, lessons: 4, quizzes: 4, streak: 5 },
  { id: "f", name: "Karan J.",    points: 150, lessons: 4, quizzes: 3, streak: 3 },
  { id: "g", name: "Neha P.",     points: 120, lessons: 3, quizzes: 3, streak: 2 },
  { id: "h", name: "Aditya B.",   points: 90,  lessons: 3, quizzes: 2, streak: 2 },
  { id: "i", name: "Meera T.",    points: 60,  lessons: 2, quizzes: 1, streak: 1 },
  { id: "j", name: "Devansh L.",  points: 30,  lessons: 1, quizzes: 0, streak: 1 },
];

function LeaderboardPage() {
  const p = useProgress();
  const [nameInput, setNameInput] = useState("");
  const [scope, setScope] = useState<"all" | "week">("all");

  useEffect(() => {
    if (p.hydrated) setNameInput(p.name || "");
  }, [p.hydrated, p.name]);

  const rows = useMemo<Row[]>(() => {
    const you: Row = {
      id: "you",
      name: p.name?.trim() || "You",
      points: p.points,
      lessons: p.completedLessons.length,
      quizzes: p.passedQuizzes.length,
      streak: p.streak,
      isYou: true,
    };
    const mult = scope === "week" ? 0.4 : 1;
    const scaled = SEED.map((r) => ({ ...r, points: Math.round(r.points * mult) }));
    return [...scaled, you].sort((a, b) => b.points - a.points || b.lessons - a.lessons);
  }, [p.hydrated, p.name, p.points, p.completedLessons.length, p.passedQuizzes.length, p.streak, scope]);

  const yourRank = rows.findIndex((r) => r.isYou) + 1;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Nav />
      <main className="mx-auto max-w-4xl px-4 py-6 sm:py-10">
        <div className="rounded-3xl border border-border bg-gradient-to-br from-yellow-500/10 via-fuchsia-500/10 to-cyan-500/10 p-5 sm:p-8">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background/60 px-3 py-1 text-xs font-medium backdrop-blur">
            <Trophy className="h-3 w-3 text-yellow-500" /> Leaderboard
          </div>
          <h1 className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">Top Python Learners</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            You are ranked <span className="font-bold text-foreground">#{yourRank}</span> of {rows.length} · {p.hydrated ? p.points : 0} points
          </p>

          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="inline-flex rounded-xl border border-border bg-background/70 p-1 text-xs font-medium">
              <button
                onClick={() => setScope("all")}
                className={`rounded-lg px-3 py-1.5 transition ${scope === "all" ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"}`}
              >
                All time
              </button>
              <button
                onClick={() => setScope("week")}
                className={`rounded-lg px-3 py-1.5 transition ${scope === "week" ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"}`}
              >
                This week
              </button>
            </div>
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <input
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                onBlur={() => setName(nameInput.trim().slice(0, 24))}
                placeholder="Your display name"
                className="w-48 rounded-lg border border-border bg-background px-3 py-1.5 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
          </div>
        </div>

        {/* Podium */}
        <section className="mt-8 grid grid-cols-3 gap-3">
          {[1, 0, 2].map((idx, i) => {
            const r = rows[idx];
            if (!r) return <div key={i} />;
            const heights = ["h-24", "h-32", "h-20"];
            const colors = [
              "from-slate-300 to-slate-400",
              "from-yellow-400 to-amber-500",
              "from-orange-400 to-rose-400",
            ];
            const medals = ["🥈", "🥇", "🥉"];
            return (
              <div key={r.id} className="flex flex-col items-center">
                <div className="text-3xl">{medals[i]}</div>
                <div className={`mt-1 truncate max-w-full text-center text-sm font-bold ${r.isYou ? "text-indigo-600" : ""}`}>
                  {r.name}
                </div>
                <div className="text-xs text-muted-foreground">{r.points} pts</div>
                <div className={`mt-2 w-full rounded-t-xl bg-gradient-to-b ${colors[i]} ${heights[i]}`} />
              </div>
            );
          })}
        </section>

        {/* Full table */}
        <section className="mt-6 overflow-hidden rounded-2xl border border-border">
          <div className="grid grid-cols-[3rem_1fr_auto_auto_auto] items-center gap-2 border-b border-border bg-muted/50 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            <span>#</span>
            <span>Learner</span>
            <span className="hidden sm:inline text-right">Lessons</span>
            <span className="hidden sm:inline text-right">Streak</span>
            <span className="text-right">Points</span>
          </div>
          <ul>
            {rows.map((r, i) => {
              const rank = i + 1;
              return (
                <li
                  key={r.id}
                  className={`grid grid-cols-[3rem_1fr_auto_auto_auto] items-center gap-2 border-b border-border/60 px-4 py-3 text-sm transition last:border-0 ${
                    r.isYou ? "bg-indigo-500/10" : "hover:bg-accent/50"
                  }`}
                >
                  <span className="flex items-center gap-1 font-bold">
                    {rank === 1 && <Crown className="h-4 w-4 text-yellow-500" />}
                    {rank === 2 && <Medal className="h-4 w-4 text-slate-400" />}
                    {rank === 3 && <Medal className="h-4 w-4 text-orange-400" />}
                    {rank > 3 && <span className="text-muted-foreground">{rank}</span>}
                  </span>
                  <span className="flex min-w-0 items-center gap-2">
                    <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-xs font-bold ${r.isYou ? "bg-gradient-to-br from-indigo-600 to-sky-500 text-white" : "bg-accent text-foreground"}`}>
                      {(r.name || "?").slice(0, 1).toUpperCase()}
                    </span>
                    <span className="min-w-0 truncate font-medium">
                      {r.name} {r.isYou && <span className="ml-1 rounded-full bg-indigo-500/10 px-2 py-0.5 text-[10px] font-bold text-indigo-600">YOU</span>}
                    </span>
                  </span>
                  <span className="hidden sm:inline text-right text-muted-foreground">{r.lessons}/{LESSONS.length}</span>
                  <span className="hidden sm:inline text-right text-muted-foreground">🔥 {r.streak}</span>
                  <span className="text-right font-bold">{r.points}</span>
                </li>
              );
            })}
          </ul>
        </section>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Earn 20 points per lesson and 30 per quiz. Climb the ranks!
        </p>
      </main>
    </div>
  );
}
