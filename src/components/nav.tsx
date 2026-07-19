import { Link } from "@tanstack/react-router";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/lib/theme";

const items = [
  { to: "/", label: "Dashboard" },
  { to: "/lessons", label: "Lessons" },
  { to: "/badges", label: "Badges" },
  { to: "/leaderboard", label: "Leaderboard" },
  { to: "/certificate", label: "Certificate" },
];

export function Nav() {
  const { theme, toggle } = useTheme();

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 backdrop-blur-xl" style={{ background: "color-mix(in oklab, var(--color-background) 78%, transparent)" }}>
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link to="/" className="flex items-center gap-2 font-display text-lg font-black tracking-tight">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-2xl text-white shadow-[var(--shadow-glow)]" style={{ background: "var(--gradient-brand)" }}>
            🐍
          </span>
          <span className="gradient-text">PyLearn</span>
        </Link>

        <nav className="hidden items-center gap-1 sm:flex">
          {items.map((it) => (
            <Link
              key={it.to}
              to={it.to}
              className="rounded-xl px-3 py-1.5 text-sm font-medium text-muted-foreground transition hover:bg-accent hover:text-foreground [&.active]:bg-accent [&.active]:text-foreground"
              activeOptions={{ exact: it.to === "/" }}
            >
              {it.label}
            </Link>
          ))}
          <button
            onClick={toggle}
            aria-label="Toggle theme"
            className="ml-2 grid h-9 w-9 place-items-center rounded-xl border border-border transition hover:bg-accent"
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
        </nav>

        <div className="flex items-center gap-1 sm:hidden">
          <button
            onClick={toggle}
            aria-label="Toggle theme"
            className="grid h-9 w-9 place-items-center rounded-xl border border-border"
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
        </div>
      </div>
    </header>
  );
}
