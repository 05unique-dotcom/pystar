import { useEffect, useState, useSyncExternalStore } from "react";

const KEY = "pyl:progress:v1";

export type Progress = {
  completedLessons: string[];
  passedQuizzes: string[];
  points: number;
  streak: number;
  lastVisit: string; // yyyy-mm-dd
};

const empty: Progress = {
  completedLessons: [],
  passedQuizzes: [],
  points: 0,
  streak: 0,
  lastVisit: "",
};

const listeners = new Set<() => void>();

function read(): Progress {
  if (typeof window === "undefined") return empty;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return empty;
    return { ...empty, ...JSON.parse(raw) };
  } catch {
    return empty;
  }
}

function write(p: Progress) {
  localStorage.setItem(KEY, JSON.stringify(p));
  listeners.forEach((l) => l());
}

export function useProgress() {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);

  const data = useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => read(),
    () => empty,
  );

  return { ...data, hydrated };
}

export function completeLesson(slug: string) {
  const p = read();
  if (!p.completedLessons.includes(slug)) {
    p.completedLessons.push(slug);
    p.points += 20;
  }
  write(p);
}

export function passQuiz(slug: string) {
  const p = read();
  if (!p.passedQuizzes.includes(slug)) {
    p.passedQuizzes.push(slug);
    p.points += 30;
  }
  write(p);
}

export function tickStreak() {
  if (typeof window === "undefined") return;
  const today = new Date().toISOString().slice(0, 10);
  const p = read();
  if (p.lastVisit === today) return;
  const y = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  p.streak = p.lastVisit === y ? p.streak + 1 : 1;
  p.lastVisit = today;
  write(p);
}

export function resetProgress() {
  write(empty);
}
