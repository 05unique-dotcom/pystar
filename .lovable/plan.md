# PyLearn Premium Redesign Plan

Keep all current functionality (lessons, quizzes, progress store, streak, badges, leaderboard, certificate) and rebuild the presentation layer into a premium mobile-first experience. No data model or business logic changes.

## 1. Design System (src/styles.css, __root.tsx)

- Fonts: Inter (body/UI) + Sora (display headings), JetBrains Mono for code. Load via `<link>` in root head.
- Palette (light-first, dark supported):
  - Primary indigo `#4F46E5`, secondary violet `#7C3AED`, accent yellow `#FACC15`, success emerald, danger rose.
  - Add semantic tokens: `--brand`, `--brand-2`, `--accent`, `--surface`, `--surface-elev`, `--ring-brand`.
- Add gradient + shadow tokens: `--gradient-brand`, `--gradient-sunrise`, `--shadow-soft`, `--shadow-glow`.
- Radii scale bumped: cards 20px, hero 28px.
- Utilities: `.glass` (backdrop-blur + translucent surface + hairline border), `.card-hover` (lift + shadow), `.ring-focus`.
- Motion: install `framer-motion` for entrance, hover, tap, page transitions, confetti trigger; install `canvas-confetti` for lesson-complete celebration.

## 2. Reusable Components (src/components/)

- `Hero.tsx` — greeting, level, XP, streak, animated Python-glyph illustration (inline SVG with floating shapes), motivational quote (rotating daily), primary "Continue Learning" CTA linking to next incomplete lesson.
- `StatCard.tsx` — icon, gradient bg, value, label, mini progress ring or bar; four variants (streak/xp/lessons/badges).
- `ProgressRing.tsx` — SVG circular progress used in hero and stats.
- `LessonCard.tsx` — thumbnail emoji tile, difficulty badge, duration, XP reward chip, progress bar, lock/complete state, motion hover.
- `RoadmapPath.tsx` — vertical connected path for `/lessons` with alternating nodes and connector lines; locked nodes below first incomplete.
- `BadgeTile.tsx` — collectible look, glow ring when unlocked, grayscale + progress-to-next when locked.
- `WeeklyChart.tsx` — 7-day bars from a derived visits array (stored in progress store as `weeklyActivity: number[]`).
- `SkillMastery.tsx` — horizontal bars per topic (derived from completed lessons grouped by `topic`).
- `BottomNav.tsx` — sticky mobile-only bottom tab bar with 5 tabs (Home, Lessons, Badges, Leaderboard, Profile/Certificate); animated active pill using `layoutId`. Existing top `Nav` stays for `sm:` and up.
- `QuizRunner.tsx` — extracted quiz UI with animated question transitions (AnimatePresence slide/fade), progress dots, instant correctness feedback, XP reward animation, confetti on pass.
- `ConfettiBurst.tsx` — canvas-confetti wrapper.
- `Skeleton.tsx` — loading skeletons for lists.

## 3. Route updates (presentation only)

- `src/routes/index.tsx` — new Hero + 4 StatCards + weekly chart + skill mastery + "Continue Learning" carousel of next 3 lessons + earned badges strip.
- `src/routes/lessons.tsx` — search bar (kept), filter chips by topic/difficulty, then RoadmapPath layout instead of flat grid.
- `src/routes/lessons_.$slug.tsx` — polished lesson header, sticky progress indicator, use QuizRunner; on pass trigger confetti + achievement toast.
- `src/routes/badges.tsx` — collectible grid using BadgeTile with glow.
- `src/routes/leaderboard.tsx` — restyle podium with gradients and motion.
- `src/routes/certificate.tsx` — restyle only; keep print logic.
- `src/components/nav.tsx` — keep top nav for desktop; hide on mobile in favor of BottomNav. Add profile shortcut icon.

## 4. Gamification additions (light-touch, no backend)

- Level derived from XP (`level = floor(xp / 200) + 1`), shown in Hero and BottomNav profile.
- Daily challenge card on dashboard (deterministic pick from lessons by date).
- Achievement toast via `sonner` when badge unlocked (diff against previous earned set stored in a ref).
- Confetti after lesson complete and quiz pass.

## 5. Progress store additions (additive, backwards-compatible)

- Add optional `weeklyActivity: Record<string, number>` (date → xp earned) written inside `completeLesson`/`passQuiz`.
- Bump storage key to `pyl:progress:v3` with migration from v2 (spread + defaults).
- No changes to existing exports; new selectors added.

## 6. Accessibility & performance

- Semantic landmarks, one `<main>` per route, `aria-label` on icon buttons, focus-visible rings using `--ring-brand`.
- `prefers-reduced-motion` disables non-essential motion in a small hook `useReducedMotion` (framer built-in).
- Lazy-load heavy routes with `React.lazy` where safe (lesson detail, certificate).
- Use `h-dvh` for full-height sections; ensure 44px tap targets on bottom nav.

## 7. Dependencies to add

- `framer-motion`
- `canvas-confetti` + `@types/canvas-confetti`
- `sonner` (if not present) for toasts

## 8. Out of scope (unchanged)

- Lesson content, quiz questions, scoring thresholds, certificate issuance rules, leaderboard seeding, auth (none).

## Technical notes

- All colors go through CSS variables in `src/styles.css`; no hardcoded hex in components.
- Framer Motion imports are client-safe; route components already render on client after hydration — no SSR-only concerns.
- BottomNav uses `useIsMobile` hook already present.
- Confetti dynamically imported to keep initial bundle small.

## Deliverable order

1. Design tokens + fonts + deps
2. Shared components (Hero, StatCard, ProgressRing, LessonCard, BottomNav, QuizRunner, BadgeTile, WeeklyChart, SkillMastery, ConfettiBurst)
3. Route refactors (index → lessons → lesson detail → badges → leaderboard → certificate)
4. Progress store migration to v3 + weekly activity
5. Polish pass: reduced motion, a11y labels, skeletons
