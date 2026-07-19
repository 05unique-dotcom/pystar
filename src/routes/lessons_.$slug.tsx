import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";
import { ArrowLeft, CheckCircle2, RefreshCw, Copy, Check, ChevronLeft, ChevronRight, Clock, Sparkles } from "lucide-react";
import { Nav } from "@/components/nav";
import { BottomNav } from "@/components/BottomNav";
import { fireConfetti } from "@/components/ConfettiBurst";
import { LESSONS } from "@/lib/lessons-data";
import { completeLesson, passQuiz, useProgress } from "@/lib/progress-store";

export const Route = createFileRoute("/lessons_/$slug")({
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
      : [{ title: "Lesson not found — PyLearn" }, { name: "robots", content: "noindex" }],
  }),
  notFoundComponent: () => (
    <div className="min-h-dvh bg-background">
      <Nav />
      <div className="mx-auto max-w-md p-10 text-center">
        <p className="text-2xl font-bold">Lesson not found</p>
        <Link to="/lessons" className="mt-3 inline-block font-semibold" style={{ color: "var(--brand)" }}>
          ← Back to lessons
        </Link>
      </div>
    </div>
  ),
  errorComponent: () => (
    <div className="min-h-dvh bg-background p-10 text-center">Something went wrong.</div>
  ),
  component: LessonPage,
});

function CodeBlock({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="relative mt-3 overflow-hidden rounded-xl ring-1 ring-slate-800">
      <button
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(code);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
          } catch { /* noop */ }
        }}
        className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-md bg-white/10 px-2 py-1 text-[11px] font-semibold text-slate-100 backdrop-blur transition hover:bg-white/20"
        aria-label="Copy code"
      >
        {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
        {copied ? "Copied" : "Copy"}
      </button>
      <pre className="overflow-auto bg-slate-950 p-4 pr-16 text-xs leading-relaxed text-slate-100">
        <code className="font-mono">{code}</code>
      </pre>
    </div>
  );
}

function LessonPage() {
  const { slug } = Route.useParams();
  const lesson = LESSONS.find((l) => l.slug === slug)!;
  const p = useProgress();
  const nav = useNavigate();

  const [step, setStep] = useState<"read" | "quiz" | "result">("read");
  const [qIdx, setQIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [locked, setLocked] = useState<Record<number, boolean>>({});

  const done = p.completedLessons.includes(lesson.slug);
  const quizDone = p.passedQuizzes.includes(lesson.slug);
  const total = lesson.quiz.length;
  const correct = lesson.quiz.filter((q, i) => answers[i] === q.answer).length;
  const passed = correct / total >= 0.7;
  const minutes = 5 + Math.min(10, lesson.content.length * 2 + Math.floor(total / 2));

  const currentIdx = LESSONS.findIndex((l) => l.slug === lesson.slug);
  const prev = LESSONS[currentIdx - 1];
  const next = LESSONS[currentIdx + 1];

  useEffect(() => {
    if (step === "result" && passed) {
      fireConfetti();
    }
  }, [step, passed]);

  const submitQuiz = () => {
    setStep("result");
    if (!done) {
      completeLesson(lesson.slug);
      toast.success("Lesson complete! +20 XP");
    }
    if (correct / total >= 0.7 && !quizDone) {
      passQuiz(lesson.slug);
      toast.success("Quiz passed! +30 XP");
    }
  };

  const selectAnswer = (oi: number) => {
    if (locked[qIdx]) return;
    setAnswers({ ...answers, [qIdx]: oi });
    setLocked({ ...locked, [qIdx]: true });
  };

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <Nav />
      <main className="mx-auto max-w-3xl px-4 pb-28 pt-6 sm:pb-10 sm:pt-10">
        <Link to="/lessons" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> All lessons
        </Link>

        {/* Header */}
        <header className="mt-4 overflow-hidden rounded-3xl border border-border bg-card p-6 shadow-[var(--shadow-soft)]">
          <div className="flex items-start gap-4">
            <div className={`grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-gradient-to-br ${lesson.gradient} text-3xl text-white shadow-md`}>
              {lesson.emoji}
            </div>
            <div className="min-w-0">
              <h1 className="font-display text-2xl font-black tracking-tight sm:text-3xl">{lesson.title}</h1>
              <p className="mt-1 text-sm text-muted-foreground sm:text-base">{lesson.summary}</p>
              <div className="mt-3 flex flex-wrap gap-2 text-xs">
                <span className="rounded-full border border-border bg-background px-2 py-0.5 font-medium text-muted-foreground">{lesson.topic}</span>
                <span className="inline-flex items-center gap-1 rounded-full border border-border bg-background px-2 py-0.5 font-medium text-muted-foreground"><Clock className="h-3 w-3" /> {minutes} min</span>
                <span className="inline-flex items-center gap-1 rounded-full border border-border bg-background px-2 py-0.5 font-medium text-muted-foreground"><Sparkles className="h-3 w-3" /> +50 XP</span>
                {done && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 font-medium text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="h-3 w-3" /> Completed
                  </span>
                )}
                {quizDone && (
                  <span className="rounded-full px-2 py-0.5 font-medium text-white" style={{ background: "var(--gradient-brand)" }}>Quiz passed</span>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        {step === "read" && (
          <>
            <article className="mt-6 space-y-4">
              {lesson.content.map((s, i) => (
                <motion.section
                  key={i}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: i * 0.05 }}
                  className="rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-soft)]"
                >
                  <h2 className="font-display text-lg font-bold">{s.heading}</h2>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
                  {s.code && <CodeBlock code={s.code} />}
                </motion.section>
              ))}
            </article>
            <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              {prev ? (
                <Link
                  to="/lessons/$slug"
                  params={{ slug: prev.slug }}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-semibold hover:bg-accent"
                >
                  <ChevronLeft className="h-4 w-4" /> {prev.title}
                </Link>
              ) : <span />}
              <button
                onClick={() => { setStep("quiz"); setQIdx(0); }}
                className="inline-flex items-center justify-center gap-1.5 rounded-xl px-5 py-3 text-sm font-bold text-white shadow-[var(--shadow-glow)] transition hover:-translate-y-0.5"
                style={{ background: "var(--gradient-brand)" }}
              >
                Start quiz ({total} questions) <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </>
        )}

        {/* Quiz runner */}
        {step === "quiz" && (
          <section className="mt-6">
            {/* Progress dots */}
            <div className="mb-4 flex items-center gap-1.5">
              {lesson.quiz.map((_, i) => (
                <span
                  key={i}
                  className="h-1.5 flex-1 rounded-full"
                  style={{
                    background: i < qIdx ? "var(--gradient-brand)" : i === qIdx ? "color-mix(in oklab, var(--brand) 40%, var(--color-muted))" : "var(--color-muted)",
                  }}
                />
              ))}
            </div>
            <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
              <span>Question {qIdx + 1} of {total}</span>
              <span>{Object.keys(answers).length}/{total} answered</span>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={qIdx}
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -24 }}
                transition={{ duration: 0.25 }}
                className="rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-soft)] sm:p-6"
              >
                <p className="font-display text-lg font-bold sm:text-xl">{lesson.quiz[qIdx].q}</p>
                <div className="mt-4 grid gap-2">
                  {lesson.quiz[qIdx].options.map((opt, oi) => {
                    const chosen = answers[qIdx] === oi;
                    const isLocked = locked[qIdx];
                    const isCorrect = isLocked && oi === lesson.quiz[qIdx].answer;
                    const isWrongPick = isLocked && chosen && oi !== lesson.quiz[qIdx].answer;
                    return (
                      <motion.button
                        key={oi}
                        whileTap={isLocked ? undefined : { scale: 0.98 }}
                        onClick={() => selectAnswer(oi)}
                        disabled={isLocked}
                        className={`flex items-center justify-between rounded-xl border px-4 py-3 text-left text-sm font-medium transition ${
                          isCorrect
                            ? "border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                            : isWrongPick
                              ? "border-rose-500 bg-rose-500/10 text-rose-700 dark:text-rose-400"
                              : chosen
                                ? "border-transparent text-white"
                                : "border-border hover:border-transparent hover:bg-accent"
                        }`}
                        style={chosen && !isLocked ? { background: "var(--gradient-brand)" } : undefined}
                      >
                        <span>{opt}</span>
                        {isCorrect && <CheckCircle2 className="h-4 w-4" />}
                      </motion.button>
                    );
                  })}
                </div>
                {locked[qIdx] && (
                  <p className={`mt-3 text-sm font-semibold ${answers[qIdx] === lesson.quiz[qIdx].answer ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
                    {answers[qIdx] === lesson.quiz[qIdx].answer ? "Correct — well done!" : `Correct answer: ${lesson.quiz[qIdx].options[lesson.quiz[qIdx].answer]}`}
                  </p>
                )}
              </motion.div>
            </AnimatePresence>

            <div className="mt-4 flex items-center justify-between gap-2">
              <button
                onClick={() => setQIdx((i) => Math.max(0, i - 1))}
                disabled={qIdx === 0}
                className="inline-flex items-center gap-1 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-semibold disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4" /> Prev
              </button>
              {qIdx < total - 1 ? (
                <button
                  onClick={() => setQIdx((i) => Math.min(total - 1, i + 1))}
                  disabled={!locked[qIdx]}
                  className="inline-flex items-center gap-1 rounded-xl px-5 py-2.5 text-sm font-bold text-white shadow-md disabled:opacity-40"
                  style={{ background: "var(--gradient-brand)" }}
                >
                  Next <ChevronRight className="h-4 w-4" />
                </button>
              ) : (
                <button
                  onClick={submitQuiz}
                  disabled={Object.keys(answers).length !== total}
                  className="inline-flex items-center gap-1 rounded-xl px-5 py-2.5 text-sm font-bold text-white shadow-[var(--shadow-glow)] disabled:opacity-40"
                  style={{ background: "var(--gradient-brand)" }}
                >
                  Submit
                </button>
              )}
            </div>
          </section>
        )}

        {step === "result" && (
          <motion.section
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.35 }}
            className={`mt-6 overflow-hidden rounded-3xl border p-6 text-center shadow-[var(--shadow-soft)] sm:p-10 ${
              passed ? "border-emerald-500/30" : "border-rose-500/30"
            }`}
            style={{ background: passed
              ? "linear-gradient(135deg, color-mix(in oklab, oklch(0.7 0.18 155) 15%, var(--color-card)), var(--color-card))"
              : "linear-gradient(135deg, color-mix(in oklab, oklch(0.65 0.2 25) 12%, var(--color-card)), var(--color-card))" }}
          >
            <div className="text-6xl">{passed ? "🎉" : "💪"}</div>
            <h2 className="mt-2 font-display text-2xl font-black sm:text-3xl">
              {passed ? "Amazing work!" : "Almost there!"}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              You scored <b className="text-foreground">{correct}/{total}</b> · {Math.round((correct / total) * 100)}%
            </p>
            {passed ? (
              <p className="mt-2 text-sm font-semibold" style={{ color: "var(--brand)" }}>
                +50 XP earned · Lesson complete
              </p>
            ) : (
              <p className="mt-2 text-sm text-rose-600 dark:text-rose-400">You need 70% to pass. Try again — you've got this!</p>
            )}
            <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
              <button
                onClick={() => {
                  setAnswers({});
                  setLocked({});
                  setQIdx(0);
                  setStep("quiz");
                }}
                className="inline-flex items-center gap-1 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-semibold hover:bg-accent"
              >
                <RefreshCw className="h-3.5 w-3.5" /> Retry quiz
              </button>
              {next ? (
                <Link
                  to="/lessons/$slug"
                  params={{ slug: next.slug }}
                  className="inline-flex items-center gap-1 rounded-xl px-5 py-2.5 text-sm font-bold text-white shadow-[var(--shadow-glow)]"
                  style={{ background: "var(--gradient-brand)" }}
                >
                  Next lesson: {next.title} <ChevronRight className="h-4 w-4" />
                </Link>
              ) : (
                <button
                  onClick={() => nav({ to: "/certificate" })}
                  className="inline-flex items-center gap-1 rounded-xl px-5 py-2.5 text-sm font-bold text-white shadow-[var(--shadow-glow)]"
                  style={{ background: "var(--gradient-brand)" }}
                >
                  View certificate
                </button>
              )}
            </div>
          </motion.section>
        )}
      </main>
      <BottomNav />
    </div>
  );
}
