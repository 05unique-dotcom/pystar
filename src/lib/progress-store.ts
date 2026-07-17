import { useEffect, useState, useSyncExternalStore } from "react";

const KEY = "pyl:progress:v1";

export type Progress = {
  name: string;
  completedLessons: string[];
  passedQuizzes: string[];
  points: number;
  streak: number;
  lastVisit: string; // yyyy-mm-dd
  certificateIssuedAt: string; // ISO date, empty if not issued
};

const empty: Progress = {
  name: "",
  completedLessons: [],
  passedQuizzes: [],
  points: 0,
  streak: 0,
  lastVisit: "",
  certificateIssuedAt: "",
};

const listeners = new Set<() => void>();
let cache: Progress = empty;
let initialized = false;

function readFromStorage(): Progress {
  if (typeof window === "undefined") return empty;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return empty;
    return { ...empty, ...JSON.parse(raw) };
  } catch {
    return empty;
  }
}

function ensureInit() {
  if (initialized || typeof window === "undefined") return;
  cache = readFromStorage();
  initialized = true;
}

function getSnapshot(): Progress {
  ensureInit();
  return cache;
}

function getServerSnapshot(): Progress {
  return empty;
}

function write(p: Progress) {
  cache = p;
  initialized = true;
  try {
    localStorage.setItem(KEY, JSON.stringify(p));
  } catch {
    // ignore
  }
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
    getSnapshot,
    getServerSnapshot,
  );

  return { ...data, hydrated };
}

export function completeLesson(slug: string) {
  ensureInit();
  const p = { ...cache, completedLessons: [...cache.completedLessons] };
  if (!p.completedLessons.includes(slug)) {
    p.completedLessons.push(slug);
    p.points = cache.points + 20;
  }
  write(p);
}

export function passQuiz(slug: string) {
  ensureInit();
  const p = { ...cache, passedQuizzes: [...cache.passedQuizzes] };
  if (!p.passedQuizzes.includes(slug)) {
    p.passedQuizzes.push(slug);
    p.points = cache.points + 30;
  }
  write(p);
}

export function tickStreak() {
  if (typeof window === "undefined") return;
  ensureInit();
  const today = new Date().toISOString().slice(0, 10);
  if (cache.lastVisit === today) return;
  const y = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  const streak = cache.lastVisit === y ? cache.streak + 1 : 1;
  write({ ...cache, streak, lastVisit: today });
}

export function setName(name: string) {
  ensureInit();
  write({ ...cache, name });
}

export function issueCertificate() {
  ensureInit();
  if (cache.certificateIssuedAt) return;
  write({ ...cache, certificateIssuedAt: new Date().toISOString() });
}

export function resetProgress() {
  write(empty);
}
