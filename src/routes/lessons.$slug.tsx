import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, CheckCircle2, RefreshCw } from "lucide-react";
import { Nav } from "@/components/nav";
import { LESSONS } from "@/lib/lessons-data";
import { completeLesson, passQuiz, useProgress } from "@/lib/progress-store";

export const Route = createFileRoute("/lessons/$slug")({
  loader: ({ params }) => {
    const lesson = LESSONS.find((l) => l.slug === params.slug);
    if (!lesson) throw notFound();
    return { lesson };
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.lesson.title} — PyLearn` },
          { name: "description", content: loaderData.lesson.summary },
        ]
      : [],
  }),
  notFoundComponent: () => (
    <div className="min-h-screen bg-background">
      <Nav />
      <div className="mx-auto max-w-md p-10 text-center">
        <p className="text-2xl font-bold">Lesson not found</p>
        <Link to="/lessons" className="mt-3 inline-block text-fuchsia-500 hover:underline">
          ← Back to lessons
        </Link>
      </div>
    </div>
  ),
  errorComponent: () => (
    <div className="min-h-screen bg-background p-10 text-center">Something went wrong.</div>
  ),
  component: LessonPage,
});

function LessonPage() {
  const { slug } = Route.useParams();
  const lesson = LESSONS.find((l) => l.slug === slug)!;
  const p = useProgress();
  const nav = useNavigate();
  const [step, setStep] = useState<"read" | "quiz">("read");
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);

  const done = p.completedLessons.includes(lesson.slug);
  const quizDone = p.passedQuizzes.includes(lesson.slug);

  const correct = lesson.quiz.filter((q, i) => answers[i] === q.answer).length;
  const passed = correct / lesson.quiz.length >= 0.7;

  const finishRead = () => {
    completeLesson(lesson.slug);
    setStep("quiz");
  };

  const submitQuiz = () => {
    setSubmitted(true);
    if (correct === lesson.quiz.length) passQuiz(lesson.slug);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Nav />
      <main className="mx-auto max-w-3xl px-4 py-6 sm:py-10">
        <Link to="/lessons" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> All lessons
        </Link>

        <header className={`mt-4 overflow-hidden rounded-3xl bg-gradient-to-br ${lesson.gradient} p-6 text-white shadow-xl`}>
          <div className="text-4xl">{lesson.emoji}</div>
          <h1 className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">{lesson.title}</h1>
          <p className="mt-1 text-sm text-white/85 sm:text-base">{lesson.summary}</p>
          <div className="mt-3 flex flex-wrap gap-2 text-xs">
            <span className="rounded-full bg-white/20 px-2 py-0.5 backdrop-blur">{lesson.topic}</span>
            {done && (
              <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-2 py-0.5 backdrop-blur">
                <CheckCircle2 className="h-3 w-3" /> Completed
              </span>
            )}
            {quizDone && (
              <span className="rounded-full bg-white/20 px-2 py-0.5 backdrop-blur">🧠 Quiz passed</span>
            )}
          </div>
        </header>

        {step === "read" ? (
          <article className="mt-6 space-y-5">
            {lesson.content.map((s, i) => (
              <section key={i} className="rounded-2xl border border-border bg-card p-5">
                <h2 className="text-lg font-bold">{s.heading}</h2>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
                {s.code && (
                  <pre className="mt-3 overflow-auto rounded-xl bg-slate-950 p-4 text-xs leading-relaxed text-slate-100 ring-1 ring-slate-800">
                    <code>{s.code}</code>
                  </pre>
                )}
              </section>
            ))}
            <div className="flex flex-col gap-2 sm:flex-row">
              <button
                onClick={finishRead}
                className="flex-1 rounded-xl bg-gradient-to-r from-fuchsia-500 to-cyan-500 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-fuchsia-500/25 transition hover:opacity-95"
              >
                {done ? "Try the quiz again" : "Mark complete & take quiz"}
              </button>
            </div>
          </article>
        ) : (
          <section className="mt-6 space-y-4">
            {lesson.quiz.map((q, i) => (
              <div key={i} className="rounded-2xl border border-border bg-card p-5">
                <p className="font-semibold">
                  Q{i + 1}. {q.q}
                </p>
                <div className="mt-3 grid gap-2">
                  {q.options.map((opt, oi) => {
                    const selected = answers[i] === oi;
                    const isCorrect = submitted && oi === q.answer;
                    const isWrongSel = submitted && selected && oi !== q.answer;
                    return (
                      <button
                        key={oi}
                        disabled={submitted}
                        onClick={() => setAnswers({ ...answers, [i]: oi })}
                        className={`rounded-xl border px-3 py-2 text-left text-sm transition ${
                          isCorrect
                            ? "border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                            : isWrongSel
                              ? "border-rose-500 bg-rose-500/10 text-rose-600 dark:text-rose-400"
                              : selected
                                ? "border-fuchsia-500 bg-fuchsia-500/10"
                                : "border-border hover:border-fuchsia-400/60 hover:bg-accent"
                        }`}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}

            {!submitted ? (
              <button
                disabled={Object.keys(answers).length !== lesson.quiz.length}
                onClick={submitQuiz}
                className="w-full rounded-xl bg-gradient-to-r from-fuchsia-500 to-cyan-500 px-5 py-3 text-sm font-bold text-white shadow-lg transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Submit answers
              </button>
            ) : (
              <div
                className={`rounded-2xl p-5 text-center ${
                  passed ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                }`}
              >
                <div className="text-3xl">{passed ? "🎉" : "💪"}</div>
                <p className="mt-1 font-bold">
                  {correct} / {lesson.quiz.length} correct
                </p>
                <p className="text-sm opacity-80">
                  {passed ? "Well done! You passed the quiz. +30 points." : "Almost there — give it another try!"}
                </p>
                <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-center">
                  <button
                    onClick={() => {
                      setAnswers({});
                      setSubmitted(false);
                    }}
                    className="inline-flex items-center justify-center gap-1 rounded-lg border border-border bg-background px-4 py-2 text-sm font-semibold text-foreground hover:bg-accent"
                  >
                    <RefreshCw className="h-3.5 w-3.5" /> Retry
                  </button>
                  <button
                    onClick={() => nav({ to: "/lessons" })}
                    className="rounded-lg bg-foreground px-4 py-2 text-sm font-semibold text-background hover:opacity-90"
                  >
                    Back to lessons
                  </button>
                </div>
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  );
}
