import { Link, useRouterState } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Home, BookOpen, Trophy, Medal, Award } from "lucide-react";

const items: { to: "/" | "/lessons" | "/badges" | "/leaderboard" | "/certificate"; label: string; icon: typeof Home; exact?: boolean }[] = [
  { to: "/", label: "Home", icon: Home, exact: true },
  { to: "/lessons", label: "Lessons", icon: BookOpen },
  { to: "/badges", label: "Badges", icon: Trophy },
  { to: "/leaderboard", label: "Ranks", icon: Medal },
  { to: "/certificate", label: "Cert", icon: Award },
];

export function BottomNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border/60 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl sm:hidden"
      style={{ background: "color-mix(in oklab, var(--color-background) 80%, transparent)" }}
    >
      <ul className="mx-auto grid max-w-md grid-cols-5">
        {items.map((it) => {
          const active = it.exact ? pathname === it.to : pathname.startsWith(it.to);
          const Icon = it.icon;
          return (
            <li key={it.to} className="relative">
              <Link
                to={it.to}
                className="flex min-h-[52px] flex-col items-center justify-center gap-0.5 px-2 py-1.5 text-[10px] font-semibold"
                style={{ color: active ? "var(--brand)" : "var(--color-muted-foreground)" }}
              >
                {active && (
                  <motion.span
                    layoutId="bnav-pill"
                    className="absolute inset-x-3 top-1 h-0.5 rounded-full"
                    style={{ background: "var(--gradient-brand)" }}
                    transition={{ type: "spring", stiffness: 500, damping: 40 }}
                  />
                )}
                <Icon className="h-5 w-5" />
                <span>{it.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
