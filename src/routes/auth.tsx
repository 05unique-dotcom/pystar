import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Loader2, Lock, Mail, User as UserIcon } from "lucide-react";
import { Nav } from "@/components/nav";
import { lovable } from "@/integrations/lovable/index";
import { signInWithEmail, signUpWithEmail, useAuth } from "@/lib/auth-store";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in or create your PyLearn account" },
      { name: "description", content: "Create a free PyLearn account to save your Python lessons, XP, badges and streak across every device." },
      { property: "og:title", content: "Sign in to PyLearn" },
      { property: "og:description", content: "Save your Python progress, XP and badges across devices with a free PyLearn account." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [checkEmail, setCheckEmail] = useState(false);

  useEffect(() => {
    if (!loading && user) navigate({ to: "/profile", replace: true });
  }, [loading, user, navigate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signup") {
        const { data, error } = await signUpWithEmail(email.trim(), password, name.trim() || email.split("@")[0]);
        if (error) throw error;
        if (!data.session) {
          setCheckEmail(true);
          toast.success("Almost there — confirm your email to finish signing up.");
          return;
        }
        toast.success("Welcome to PyLearn!");
      } else {
        const { error } = await signInWithEmail(email.trim(), password);
        if (error) throw error;
        toast.success("Welcome back!");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  async function handleGoogle() {
    setBusy(true);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      toast.error("Google sign-in failed. Please try again.");
      setBusy(false);
      return;
    }
    if (result.redirected) return;
  }

  const inputCls =
    "w-full rounded-xl border border-border bg-background py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-transparent focus:ring-2";

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <Nav />
      <main className="mx-auto flex max-w-md flex-col px-4 py-10">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="rounded-3xl border border-border bg-card p-6 shadow-[var(--shadow-soft)]"
        >
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl text-2xl text-white shadow-[var(--shadow-glow)]" style={{ background: "var(--gradient-brand)" }}>
            🐍
          </div>
          <h1 className="mt-4 text-center font-display text-2xl font-black tracking-tight">
            {mode === "signin" ? "Welcome back" : "Create your account"}
          </h1>
          <p className="mt-1 text-center text-sm text-muted-foreground">
            Save your XP, badges and streak on every device.
          </p>

          {checkEmail ? (
            <div className="mt-6 rounded-2xl border border-border bg-accent/40 p-4 text-center text-sm">
              <p className="font-semibold">Check your inbox 📬</p>
              <p className="mt-1 text-muted-foreground">
                We sent a confirmation link to <b>{email}</b>. Click it to activate your account, then sign in.
              </p>
              <button
                onClick={() => {
                  setCheckEmail(false);
                  setMode("signin");
                }}
                className="mt-3 text-xs font-bold"
                style={{ color: "var(--brand)" }}
              >
                Back to sign in
              </button>
            </div>
          ) : (
            <>
              <form onSubmit={handleSubmit} className="mt-6 space-y-3">
                {mode === "signup" && (
                  <div className="relative">
                    <UserIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Display name"
                      autoComplete="name"
                      maxLength={40}
                      className={inputCls}
                    />
                  </div>
                )}
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    autoComplete="email"
                    maxLength={255}
                    className={inputCls}
                  />
                </div>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password (min 6 characters)"
                    autoComplete={mode === "signin" ? "current-password" : "new-password"}
                    className={inputCls}
                  />
                </div>
                <button
                  type="submit"
                  disabled={busy}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold text-white shadow-[var(--shadow-glow)] transition hover:-translate-y-0.5 disabled:opacity-60"
                  style={{ background: "var(--gradient-brand)" }}
                >
                  {busy && <Loader2 className="h-4 w-4 animate-spin" />}
                  {mode === "signin" ? "Sign in" : "Create account"}
                </button>
              </form>

              <div className="my-4 flex items-center gap-3 text-xs text-muted-foreground">
                <span className="h-px flex-1 bg-border" /> or <span className="h-px flex-1 bg-border" />
              </div>

              <button
                onClick={handleGoogle}
                disabled={busy}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-semibold transition hover:bg-accent disabled:opacity-60"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
                  <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.4a5.5 5.5 0 0 1-2.4 3.6v3h3.9c2.3-2.1 3.6-5.2 3.6-8.8z" />
                  <path fill="#34A853" d="M12 24c3.2 0 5.9-1.1 7.9-2.9l-3.9-3a7.2 7.2 0 0 1-10.7-3.8H1.3v3.1A12 12 0 0 0 12 24z" />
                  <path fill="#FBBC05" d="M5.3 14.3a7.2 7.2 0 0 1 0-4.6V6.6H1.3a12 12 0 0 0 0 10.8l4-3.1z" />
                  <path fill="#EA4335" d="M12 4.8c1.8 0 3.4.6 4.6 1.8l3.4-3.4A12 12 0 0 0 1.3 6.6l4 3.1A7.2 7.2 0 0 1 12 4.8z" />
                </svg>
                Continue with Google
              </button>

              <p className="mt-5 text-center text-sm text-muted-foreground">
                {mode === "signin" ? "New to PyLearn?" : "Already have an account?"}{" "}
                <button
                  onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
                  className="font-bold"
                  style={{ color: "var(--brand)" }}
                >
                  {mode === "signin" ? "Create an account" : "Sign in"}
                </button>
              </p>
            </>
          )}
        </motion.div>

        <Link to="/" className="mt-5 text-center text-xs font-semibold text-muted-foreground hover:text-foreground">
          ← Continue without an account
        </Link>
      </main>
    </div>
  );
}
