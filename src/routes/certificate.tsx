import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Nav } from "@/components/nav";
import { LESSONS } from "@/lib/lessons-data";
import { issueCertificate, setName, useProgress } from "@/lib/progress-store";
import { Award, Download, Lock, Printer } from "lucide-react";

export const Route = createFileRoute("/certificate")({
  head: () => ({
    meta: [
      { title: "Certificate of Completion — PyLearn" },
      { name: "description", content: "Earn your PyLearn Python Basics certificate by completing every lesson and passing every quiz." },
    ],
  }),
  component: CertificatePage,
});

function CertificatePage() {
  const p = useProgress();
  const [nameInput, setNameInput] = useState("");

  const totalLessons = LESSONS.length;
  const lessonsDone = p.completedLessons.length;
  const quizzesDone = p.passedQuizzes.length;
  const complete = lessonsDone >= totalLessons && quizzesDone >= totalLessons;
  const pct = Math.round(((lessonsDone + quizzesDone) / (totalLessons * 2)) * 100);

  useEffect(() => {
    if (p.hydrated) setNameInput(p.name || "");
  }, [p.hydrated, p.name]);

  useEffect(() => {
    if (complete && p.name && !p.certificateIssuedAt) issueCertificate();
  }, [complete, p.name, p.certificateIssuedAt]);

  const issuedDate = p.certificateIssuedAt
    ? new Date(p.certificateIssuedAt).toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : new Date().toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });

  const certId = "PYL-" + (p.certificateIssuedAt || "PENDING").replace(/[^0-9]/g, "").slice(0, 10);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Nav />
      <main className="mx-auto max-w-4xl px-4 py-6 sm:py-10 print:p-0">
        <div className="print:hidden">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background/60 px-3 py-1 text-xs font-medium">
            <Award className="h-3 w-3 text-indigo-600" /> Certificate
          </div>
          <h1 className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">Certificate of Completion</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Finish every lesson and pass every quiz to unlock and download your certificate.
          </p>

          <div className="mt-4 rounded-2xl border border-border bg-card p-4">
            <div className="mb-2 flex items-center justify-between text-xs font-medium text-muted-foreground">
              <span>Progress · {lessonsDone}/{totalLessons} lessons · {quizzesDone}/{totalLessons} quizzes</span>
              <span>{pct}%</span>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-gradient-to-r from-indigo-600 to-sky-500 transition-all duration-700"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <label className="flex flex-1 items-center gap-2">
              <span className="text-sm font-medium">Name on certificate:</span>
              <input
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                onBlur={() => setName(nameInput.trim().slice(0, 40))}
                placeholder="Your full name"
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20"
              />
            </label>
            <div className="flex gap-2">
              <button
                disabled={!complete || !p.name}
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-indigo-600 to-sky-500 px-4 py-2 text-sm font-bold text-white shadow-lg transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {complete ? <Download className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                {complete ? "Download / Print" : "Locked"}
              </button>
            </div>
          </div>
          {!complete && (
            <p className="mt-3 text-xs text-muted-foreground">
              You still have {Math.max(0, totalLessons - lessonsDone)} lesson(s) and {Math.max(0, totalLessons - quizzesDone)} quiz(zes) left.{" "}
              <Link to="/lessons" className="font-semibold text-indigo-600 hover:underline">Continue learning →</Link>
            </p>
          )}
        </div>

        {/* Certificate card (also the print target) */}
        <div className="mt-6 print:mt-0">
          <div
            className={`relative mx-auto overflow-hidden rounded-3xl border-4 bg-white p-6 text-slate-900 shadow-2xl sm:p-12 print:shadow-none ${
              complete ? "border-yellow-400" : "border-slate-200"
            }`}
            style={{ aspectRatio: "1.414 / 1" }}
          >
            {/* Decorative gradient corners */}
            <div className="pointer-events-none absolute -left-24 -top-24 h-64 w-64 rounded-full bg-gradient-to-br from-fuchsia-500/20 to-cyan-500/20 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-24 -right-24 h-64 w-64 rounded-full bg-gradient-to-br from-yellow-400/25 to-fuchsia-500/20 blur-3xl" />

            <div className="relative flex h-full flex-col items-center justify-between text-center">
              <div>
                <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-indigo-600 to-sky-500 text-2xl text-white shadow-lg">
                  🐍
                </div>
                <p className="mt-3 text-xs font-bold uppercase tracking-[0.3em] text-slate-500">PyLearn Academy</p>
                <h2 className="mt-2 text-2xl font-black tracking-tight sm:text-4xl">Certificate of Completion</h2>
                <p className="mt-1 text-xs text-slate-500 sm:text-sm">This certificate is proudly presented to</p>
              </div>

              <div className="my-4">
                <p className="bg-gradient-to-r from-fuchsia-600 to-cyan-600 bg-clip-text text-3xl font-black text-transparent sm:text-5xl">
                  {p.name?.trim() || "Your Name Here"}
                </p>
                <div className="mx-auto mt-2 h-0.5 w-40 bg-slate-300" />
                <p className="mt-3 max-w-lg text-xs leading-relaxed text-slate-600 sm:text-sm">
                  for successfully completing all <b>{totalLessons}</b> lessons and passing every quiz in the
                  <b> Python Basics</b> course on PyLearn, demonstrating solid foundational knowledge of Python programming.
                </p>
              </div>

              <div className="grid w-full grid-cols-3 gap-4 text-left text-[10px] sm:text-xs">
                <div>
                  <div className="font-bold uppercase tracking-widest text-slate-500">Date</div>
                  <div className="mt-0.5 font-semibold text-slate-800">{issuedDate}</div>
                </div>
                <div className="text-center">
                  <div className="font-serif text-lg italic text-slate-800 sm:text-2xl">PyLearn</div>
                  <div className="mx-auto h-px w-24 bg-slate-400" />
                  <div className="mt-0.5 text-[9px] uppercase tracking-widest text-slate-500">Instructor</div>
                </div>
                <div className="text-right">
                  <div className="font-bold uppercase tracking-widest text-slate-500">Certificate ID</div>
                  <div className="mt-0.5 font-mono text-slate-800">{certId}</div>
                </div>
              </div>

              {!complete && (
                <div className="pointer-events-none absolute inset-0 grid place-items-center">
                  <div className="rotate-[-18deg] rounded-2xl border-4 border-rose-400/60 px-8 py-3 text-3xl font-black uppercase tracking-widest text-rose-500/70 sm:text-5xl">
                    Locked
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-center gap-2 text-xs text-muted-foreground print:hidden">
          <Printer className="h-3 w-3" /> Tip: Use your browser's "Save as PDF" option for a shareable file.
        </div>
      </main>

      <style>{`
        @media print {
          @page { size: A4 landscape; margin: 0; }
          body { background: white; }
          header, nav, .print\\:hidden { display: none !important; }
        }
      `}</style>
    </div>
  );
}
