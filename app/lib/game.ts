import type { PromptItem, PromptType } from "./prompts";

export function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function pickNextPlayer(players: string[], lastPlayer: string | null): string {
  if (players.length <= 1) return players[0] ?? "";
  const pool = players.filter(p => p !== lastPlayer);
  return pickRandom(pool.length ? pool : players);
}

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

  return { item: chosen, newHistoryIds: [...baseHistory, chosen.id] };
}

/** Haptics */
export function haptic(pattern: number | number[] = 15) {
  try {
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      // @ts-ignore
      navigator.vibrate(pattern);
    }
  } catch {}
}

/* ------------------ Audio Engine (Music + SFX) ------------------ */

let audioCtx: AudioContext | null = null;
let masterGain: GainNode | null = null;

let musicGain: GainNode | null = null;
let musicFilter: BiquadFilterNode | null = null;
let musicOscA: OscillatorNode | null = null;
let musicOscB: OscillatorNode | null = null;
let musicLFO: OscillatorNode | null = null;
let musicLFOGain: GainNode | null = null;

let muted = false;
let musicStarted = false;

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

function ensureMaster(): void {
  const ctx = getCtx();
  if (!ctx) return;

  if (!masterGain) {
    masterGain = ctx.createGain();
    masterGain.gain.value = muted ? 0 : 1;
    masterGain.connect(ctx.destination);
  }
}

/**
 * Llamar esto en el primer tap (o en cualquier tap) para “desbloquear” audio.
 */
export function ensureAudioUnlocked() {
  const ctx = getCtx();
  if (!ctx) return;
  ensureMaster();
  if (ctx.state === "suspended") ctx.resume().catch(() => {});
}

/** Mute global */
export function setMuted(next: boolean) {
  muted = next;
  ensureMaster();
  if (masterGain) masterGain.gain.value = muted ? 0 : 1;
}

export function isMuted() {
  return muted;
}

export function startMusic() {
  const ctx = getCtx();
  if (!ctx) return;

  ensureAudioUnlocked();
  ensureMaster();

  if (musicStarted) return;
  musicStarted = true;

  // Gains
  musicGain = ctx.createGain();
  musicGain.gain.value = 0.13;
  musicGain.connect(masterGain!);

  // Filter para vibra “club”
  musicFilter = ctx.createBiquadFilter();
  musicFilter.type = "lowpass";
  musicFilter.frequency.value = 900;
  musicFilter.Q.value = 0.9;
  musicFilter.connect(musicGain);

  // Oscillators (dos notas)
  musicOscA = ctx.createOscillator();
  musicOscA.type = "sawtooth";
  musicOscA.frequency.value = 110; // base

  musicOscB = ctx.createOscillator();
  musicOscB.type = "triangle";
  musicOscB.frequency.value = 165; // quinta-ish

  // Slight detune for width
  musicOscA.detune.value = -8;
  musicOscB.detune.value = 9;

  // LFO (movimiento tipo “soundwave”)
  musicLFO = ctx.createOscillator();
  musicLFO.type = "sine";
  musicLFO.frequency.value = 2.2; // velocidad “bombeo”

  musicLFOGain = ctx.createGain();
  musicLFOGain.gain.value = 280; // profundidad del filtro

  // Conexiones
  musicOscA.connect(musicFilter);
  musicOscB.connect(musicFilter);

  musicLFO.connect(musicLFOGain);
  musicLFOGain.connect(musicFilter.frequency);

  const now = ctx.currentTime;

  // Fade in suave
  musicGain.gain.setValueAtTime(0.0001, now);
  musicGain.gain.exponentialRampToValueAtTime(0.13, now + 0.6);

  musicOscA.start(now);
  musicOscB.start(now);
  musicLFO.start(now);

  scheduleToneMotion();
}

function scheduleToneMotion() {
  const ctx = getCtx();
  if (!ctx || !musicOscA || !musicOscB) return;

  const now = ctx.currentTime;
  const steps = [
    [110, 165],
    [98, 147],
    [110, 165],
    [123, 184],
  ] as const;

  for (let i = 0; i < 32; i++) {
    const t = now + i * 0.9;
    const [a, b] = steps[i % steps.length];
    musicOscA.frequency.setTargetAtTime(a, t, 0.05);
    musicOscB.frequency.setTargetAtTime(b, t, 0.05);
  }

  setTimeout(() => scheduleToneMotion(), 28_000);
}

export function sfx(kind: "tap" | "reveal" | "next" | "bad") {
  const ctx = getCtx();
  if (!ctx) return;

  ensureAudioUnlocked();
  ensureMaster();

  if (ctx.state === "suspended") ctx.resume().catch(() => {});

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  const now = ctx.currentTime;

  const cfg = {
    tap:    { f1: 520, f2: 840, dur: 0.06, g: 0.11 },
    reveal: { f1: 280, f2: 620, dur: 0.14, g: 0.14 },
    next:   { f1: 720, f2: 980, dur: 0.09, g: 0.12 },
    bad:    { f1: 220, f2: 140, dur: 0.14, g: 0.13 },
  }[kind];

  osc.type = "sine";
  osc.frequency.setValueAtTime(cfg.f1, now);
  osc.frequency.exponentialRampToValueAtTime(cfg.f2, now + cfg.dur);

  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(cfg.g, now + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + cfg.dur);

  osc.connect(gain);
  gain.connect(masterGain!);

  osc.start(now);
  osc.stop(now + cfg.dur);
}
