import type { PromptItem, PromptType } from "./prompts";

/** random básico */
export function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Elige jugador evitando repetir el último.
 * Si solo hay 1 jugador, devuelve ese.
 */
export function pickNextPlayer(players: string[], lastPlayer: string | null): string {
  if (players.length <= 1) return players[0] ?? "";
  const pool = players.filter(p => p !== lastPlayer);
  return pickRandom(pool.length ? pool : players);
}

/**
 * Saca prompt aleatorio por tipo sin repetir hasta agotar.
 */
export function nextPrompt(
  all: PromptItem[],
  type: PromptType,
  historyIds: string[]
): { item: PromptItem; newHistoryIds: string[] } {
  const pool = all.filter(p => p.type === type);
  const available = pool.filter(p => !historyIds.includes(p.id));

  const chosen = available.length > 0 ? pickRandom(available) : pickRandom(pool);

  const reset = available.length === 0;
  const baseHistory = reset ? historyIds.filter(id => !pool.some(p => p.id === id)) : historyIds;

  return {
    item: chosen,
    newHistoryIds: [...baseHistory, chosen.id],
  };
}

/** Haptics: vibra si existe (Android/Chrome). iOS Safari normalmente no vibra. */
export function haptic(pattern: number | number[] = 15) {
  try {
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      // @ts-ignore
      navigator.vibrate(pattern);
    }
  } catch {}
}

/**
 * Soniditos sin archivos: WebAudio con oscilador.
 * iOS requiere interacción del usuario antes de permitir audio (aquí siempre se llama desde taps).
 */
let audioCtx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  try {
    if (typeof window === "undefined") return null;
    const Ctx = (window.AudioContext || (window as any).webkitAudioContext) as typeof AudioContext | undefined;
    if (!Ctx) return null;
    if (!audioCtx) audioCtx = new Ctx();
    return audioCtx;
  } catch {
    return null;
  }
}

export function sfx(kind: "tap" | "reveal" | "next" | "bad") {
  const ctx = getCtx();
  if (!ctx) return;

  // Asegura que esté corriendo (algunos browsers lo suspenden)
  if (ctx.state === "suspended") ctx.resume().catch(() => {});

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  const now = ctx.currentTime;

  const cfg = {
    tap:    { f1: 420, f2: 620, dur: 0.05, g: 0.06 },
    reveal: { f1: 260, f2: 520, dur: 0.11, g: 0.08 },
    next:   { f1: 520, f2: 740, dur: 0.08, g: 0.07 },
    bad:    { f1: 180, f2: 120, dur: 0.12, g: 0.08 },
  }[kind];

  osc.type = "sine";
  osc.frequency.setValueAtTime(cfg.f1, now);
  osc.frequency.exponentialRampToValueAtTime(cfg.f2, now + cfg.dur);

  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(cfg.g, now + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + cfg.dur);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + cfg.dur);
}
