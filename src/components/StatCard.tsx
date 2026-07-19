import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";

type Props = {
  icon: LucideIcon;
  label: string;
  value: string | number;
  sub?: string;
  gradient: string; // tailwind gradient classes e.g. "from-indigo-500 to-violet-500"
  progress?: number; // 0..100
  delay?: number;
};

export function StatCard({ icon: Icon, label, value, sub, gradient, progress, delay = 0 }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: [0.2, 0.7, 0.2, 1] }}
      whileHover={{ y: -3 }}
      className="relative overflow-hidden rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-soft)]"
    >
      <div className={`pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-gradient-to-br ${gradient} opacity-20 blur-2xl`} />
      <div className={`mb-3 inline-grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br ${gradient} text-white shadow-md`}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-0.5 font-display text-2xl font-black leading-tight sm:text-3xl">{value}</div>
      {sub && <div className="mt-0.5 text-xs text-muted-foreground">{sub}</div>}
      {typeof progress === "number" && (
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.max(0, Math.min(100, progress))}%` }}
            transition={{ duration: 0.9, delay: delay + 0.1, ease: [0.2, 0.7, 0.2, 1] }}
            className={`h-full rounded-full bg-gradient-to-r ${gradient}`}
          />
        </div>
      )}
    </motion.div>
  );
}
