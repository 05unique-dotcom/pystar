export async function fireConfetti() {
  if (typeof window === "undefined") return;
  try {
    const mod = await import("canvas-confetti");
    const confetti = mod.default;
    const end = Date.now() + 600;
    const colors = ["#6366f1", "#8b5cf6", "#facc15", "#22d3ee", "#ec4899"];
    (function frame() {
      confetti({ particleCount: 4, angle: 60, spread: 55, origin: { x: 0 }, colors });
      confetti({ particleCount: 4, angle: 120, spread: 55, origin: { x: 1 }, colors });
      if (Date.now() < end) requestAnimationFrame(frame);
    })();
    confetti({ particleCount: 90, spread: 80, origin: { y: 0.6 }, colors });
  } catch {
    // ignore
  }
}
