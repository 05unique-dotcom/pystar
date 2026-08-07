import { useEffect, useState, useSyncExternalStore } from "react";

const KEY = "pyl:progress:v3";

export const XP_PER_LESSON = 10;
export const XP_PER_QUIZ = 20;
export const XP_PER_LEVEL = 100;

export type Progress = {
  name: string;
  avatarUrl: string;
  completedLessons: string[];
  passedQuizzes: string[];
  points: number;
  streak: number;
  lastVisit: string; // yyyy-mm-dd
  certificateIssuedAt: string; // ISO date, empty if not issued
};

const empty: Progress = {
  name: "",
  avatarUrl: "",
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
let cloudUserId: string | null = null;
let syncing = false;

export function levelFor(points: number) {
  return Math.floor(points / XP_PER_LEVEL) + 1;
}

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

function recalcPoints(p: Progress) {
  return p.completedLessons.length * XP_PER_LESSON + p.passedQuizzes.length * XP_PER_QUIZ;
}

function write(p: Progress, { push = true } = {}) {
  cache = p;
  initialized = true;
  try {
    localStorage.setItem(KEY, JSON.stringify(p));
  } catch {
    // ignore
  }
  listeners.forEach((l) => l());
  if (push && cloudUserId) void pushToCloud();
}

async function pushToCloud() {
  if (!cloudUserId || syncing) return;
  const { pushCloudProgress } = await import("@/lib/cloud-sync");
  try {
    await pushCloudProgress(cloudUserId, cache);
  } catch (err) {
    console.error("Failed to save progress to the cloud", err);
  }
}

/**
 * Called once the auth session is known. Merges local guest progress with the
 * saved cloud record (union of both), then keeps the cloud in sync.
 */
export async function attachCloudUser(userId: string | null) {
  if (userId === cloudUserId) return;
  cloudUserId = userId;

  if (!userId) {
    write(readFromStorage(), { push: false });
    return;
  }

  ensureInit();
  syncing = true;
  try {
    const { loadCloudProgress } = await import("@/lib/cloud-sync");
    const remote = await loadCloudProgress(userId);
    const merged: Progress = {
      ...cache,
      name: remote.profile?.display_name || cache.name,
      avatarUrl: remote.profile?.avatar_url || cache.avatarUrl,
      completedLessons: Array.from(new Set([...cache.completedLessons, ...remote.completedLessons])),
      passedQuizzes: Array.from(new Set([...cache.passedQuizzes, ...remote.passedQuizzes])),
      streak: Math.max(cache.streak, remote.profile?.streak ?? 0),
      lastVisit: remote.profile?.last_active || cache.lastVisit,
      points: 0,
    };
    merged.points = Math.max(recalcPoints(merged), remote.points);
    write(merged, { push: false });
  } catch (err) {
    console.error("Failed to load cloud progress", err);
  } finally {
    syncing = false;
  }
  void pushToCloud();
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

  return { ...data, hydrated, level: levelFor(data.points) };
}

export function completeLesson(slug: string) {
  ensureInit();
  const p = { ...cache, completedLessons: [...cache.completedLessons] };
  if (!p.completedLessons.includes(slug)) {
    p.completedLessons.push(slug);
    p.points = cache.points + XP_PER_LESSON;
  }
  write(p);
  tickStreak();
}

export function passQuiz(slug: string) {
  ensureInit();
  const p = { ...cache, passedQuizzes: [...cache.passedQuizzes] };
  if (!p.passedQuizzes.includes(slug)) {
    p.passedQuizzes.push(slug);
    p.points = cache.points + XP_PER_QUIZ;
  }
  write(p);
  tickStreak();
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

export function setAvatarUrl(avatarUrl: string) {
  ensureInit();
  write({ ...cache, avatarUrl });
}

export function issueCertificate() {
  ensureInit();
  if (cache.certificateIssuedAt) return;
  write({ ...cache, certificateIssuedAt: new Date().toISOString() });
}

export function resetProgress() {
  write(empty);
}
