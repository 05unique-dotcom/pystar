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
        <Link to="/lessons" className="mt-3 inline-block text-indigo-600 hover:underline">
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
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);

  const done = p.completedLessons.includes(lesson.slug);
  const quizDone = p.passedQuizzes.includes(lesson.slug);

  const correct = lesson.quiz.filter((q, i) => answers[i] === q.answer).length;
  const passed = correct / lesson.quiz.length >= 0.7;
  const allAnswered = Object.keys(answers).length === lesson.quiz.length;

  const submitQuiz = () => {
    setSubmitted(true);
    if (!done) completeLesson(lesson.slug);
    if (correct / lesson.quiz.length >= 0.7) passQuiz(lesson.slug);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Nav />
      <main className="mx-auto max-w-3xl px-4 py-6 sm:py-10">
        <Link to="/lessons" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> All lessons
        </Link>

        <header className="mt-4 overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-sm">
          <div className={`inline-grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br ${lesson.gradient} text-2xl text-white shadow-md`}>
            {lesson.emoji}
          </div>
          <h1 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">{lesson.title}</h1>
          <p className="mt-1 text-sm text-muted-foreground sm:text-base">{lesson.summary}</p>
          <div className="mt-3 flex flex-wrap gap-2 text-xs">
            <span className="rounded-full border border-border bg-background px-2 py-0.5 font-medium text-muted-foreground">{lesson.topic}</span>
            <span className="rounded-full border border-border bg-background px-2 py-0.5 font-medium text-muted-foreground">
              {lesson.quiz.length} questions
            </span>
            {done && (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 font-medium text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="h-3 w-3" /> Completed
              </span>
            )}
            {quizDone && (
              <span className="rounded-full bg-indigo-500/10 px-2 py-0.5 font-medium text-indigo-600">Quiz passed</span>
            )}
          </div>
        </header>

        <article className="mt-6 space-y-4">
          {lesson.content.map((s, i) => (
            <section key={i} className="rounded-2xl border border-border bg-card p-5 shadow-sm">
              <h2 className="text-base font-semibold sm:text-lg">{s.heading}</h2>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
              {s.code && (
                <pre className="mt-3 overflow-auto rounded-lg bg-slate-950 p-4 text-xs leading-relaxed text-slate-100 ring-1 ring-slate-800" style={{ fontFamily: "'JetBrains Mono', ui-monospace, monospace" }}>
                  <code>{s.code}</code>
                </pre>
              )}
            </section>
          ))}
        </article>

        <section className="mt-8">
          <div className="mb-3 flex items-end justify-between">
            <h2 className="text-lg font-bold sm:text-xl">Practice Quiz</h2>
            <span className="text-xs text-muted-foreground">
              {Object.keys(answers).length}/{lesson.quiz.length} answered
            </span>
          </div>
          <div className="space-y-3">
            {lesson.quiz.map((q, i) => (
              <div key={i} className="rounded-2xl border border-border bg-card p-5 shadow-sm">
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
                            ? "border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                            : isWrongSel
                              ? "border-rose-500 bg-rose-500/10 text-rose-700 dark:text-rose-400"
                              : selected
                                ? "border-indigo-500 bg-indigo-500/10"
                                : "border-border hover:border-indigo-400/60 hover:bg-accent"
                        }`}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {!submitted ? (
            <button
              disabled={!allAnswered}
              onClick={submitQuiz}
              className="mt-4 w-full rounded-xl bg-gradient-to-r from-indigo-600 to-sky-500 px-5 py-3 text-sm font-semibold text-white shadow-md shadow-indigo-600/20 transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {allAnswered ? "Submit answers" : `Answer all ${lesson.quiz.length} questions to submit`}
            </button>
          ) : (
            <div
              className={`mt-4 rounded-2xl border p-5 text-center ${
                passed
                  ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                  : "border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-400"
              }`}
            >
              <div className="text-3xl">{passed ? "🎉" : "💪"}</div>
              <p className="mt-1 font-bold">
                {correct} / {lesson.quiz.length} correct
              </p>
              <p className="text-sm opacity-80">
                {passed ? "Well done! Lesson complete. +50 points." : "You need 70% to pass. Give it another try!"}
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
      </main>
    </div>
  );
}

