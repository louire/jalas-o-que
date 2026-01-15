"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { PROMPTS, PromptItem, PromptType } from "./lib/prompts";
import {
  nextPrompt,
  pickNextPlayer,
  haptic,
  sfx,
  startMusic,
  ensureAudioUnlocked,
  isMuted,
  setMuted,
} from "./lib/game";
import { Outfit } from "next/font/google";

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

type Screen = "home" | "players" | "game";
type Phase = "choose" | "reveal";

function cn(...classes: Array<string | false | undefined | null>) {
  return classes.filter(Boolean).join(" ");
}

export default function Page() {
  const [screen, setScreen] = useState<Screen>("home");

  const [nameInput, setNameInput] = useState("");
  const [players, setPlayers] = useState<string[]>([]);
  const canStart = players.length >= 2;

  const [currentPlayer, setCurrentPlayer] = useState<string>("");
  const [lastPlayer, setLastPlayer] = useState<string | null>(null);

  const [phase, setPhase] = useState<Phase>("choose");
  const [choice, setChoice] = useState<PromptType | null>(null);
  const [currentPrompt, setCurrentPrompt] = useState<PromptItem | null>(null);

  const [historyIds, setHistoryIds] = useState<string[]>([]);
  const [showPenalty, setShowPenalty] = useState(false);

  const [mutedUI, setMutedUI] = useState(false);

  // NEW: rounds
  const [round, setRound] = useState(1);

  const promptCount = useMemo(() => PROMPTS.length, []);

  useEffect(() => {
    const raw = localStorage.getItem("joq_players");
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) setPlayers(parsed);
    } catch {}
  }, []);

  useEffect(() => {
    localStorage.setItem("joq_players", JSON.stringify(players));
  }, [players]);

  useEffect(() => {
    setMutedUI(isMuted());
  }, []);

  function onAnyUserTap() {
    ensureAudioUnlocked();
    startMusic();
  }

  function addPlayer() {
    onAnyUserTap();

    const n = nameInput.trim();
    if (!n) return;

    if (players.some(p => p.toLowerCase() === n.toLowerCase())) {
      setNameInput("");
      haptic([10, 30, 10]);
      sfx("bad");
      return;
    }

    setPlayers(prev => [...prev, n]);
    setNameInput("");
    haptic(12);
    sfx("tap");
  }

  function removePlayer(name: string) {
    onAnyUserTap();
    setPlayers(prev => prev.filter(p => p !== name));
    haptic(10);
    sfx("tap");
  }

  function startGame() {
    onAnyUserTap();

    const first = pickNextPlayer(players, null);
    setCurrentPlayer(first);
    setLastPlayer(first);

    setPhase("choose");
    setChoice(null);
    setCurrentPrompt(null);
    setShowPenalty(false);

    setRound(1);

    setScreen("game");
    haptic([12, 18, 12]);
    sfx("reveal");
  }

  function nextTurn() {
    onAnyUserTap();

    const next = pickNextPlayer(players, lastPlayer);
    setLastPlayer(next);
    setCurrentPlayer(next);

    setPhase("choose");
    setChoice(null);
    setCurrentPrompt(null);
    setShowPenalty(false);

    setRound(r => r + 1);

    haptic(15);
    sfx("next");
  }

  function chooseType(type: PromptType) {
    onAnyUserTap();

    const { item, newHistoryIds } = nextPrompt(PROMPTS, type, historyIds);
    setHistoryIds(newHistoryIds);

    setChoice(type);
    setCurrentPrompt(item);
    setPhase("reveal");
    setShowPenalty(false);

    haptic(type === "truth" ? 18 : [10, 20, 10]);
    sfx("reveal");
  }

  function changePrompt() {
    onAnyUserTap();
    if (!choice) return;

    const { item, newHistoryIds } = nextPrompt(PROMPTS, choice, historyIds);
    setHistoryIds(newHistoryIds);
    setCurrentPrompt(item);

    haptic(12);
    sfx("tap");
  }

  function toggleMute() {
    onAnyUserTap();

    const next = !mutedUI;
    setMutedUI(next);
    setMuted(next);

    haptic(10);
    sfx("tap");
  }

  function resetPlayersAndGoHome() {
    onAnyUserTap();

    setPlayers([]);
    setNameInput("");

    setScreen("home");
    setCurrentPlayer("");
    setLastPlayer(null);

    setPhase("choose");
    setChoice(null);
    setCurrentPrompt(null);

    setHistoryIds([]);
    setShowPenalty(false);

    setRound(1);

    localStorage.removeItem("joq_players");
    haptic([10, 25, 10]);
    sfx("bad");
  }

  function goPlayers() {
    onAnyUserTap();
    haptic(10);
    sfx("tap");
    setScreen("players");
  }

  return (
    <main className={cn("min-h-screen text-white", outfit.className)}>
      <SoundwaveBackground />

      {/* Top-right Mute */}
      <button
        onClick={toggleMute}
        className="tap fixed right-4 top-4 z-50 rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm font-semibold text-white/90 backdrop-blur-xl hover:bg-white/15"
        aria-label="Mute"
      >
        {mutedUI ? "🔇" : "🔊"}
      </button>

      {/* Main */}
      <div className="mx-auto w-full max-w-[760px] px-4 pb-12 pt-8 sm:px-6">
        {/* Header + Reset/Back (now back) */}
        <div className="mb-5 flex items-start justify-between gap-3">
          <div className="space-y-2">
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
              Jalas <span className="text-fuchsia-300">o qué</span>?
            </h1>
            <p className="text-base text-white/70 sm:text-lg">
              {promptCount} cartas · 1 modo · puro flow
            </p>
          </div>

          <div className="flex gap-2">
            {screen === "game" && (
              <button
                onClick={goPlayers}
                className="tap rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm font-semibold text-white/90 backdrop-blur-xl hover:bg-white/15"
                aria-label="Volver"
              >
                ↩︎ Volver
              </button>
            )}

            <button
              onClick={resetPlayersAndGoHome}
              className="tap rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm font-semibold text-white/90 backdrop-blur-xl hover:bg-white/15"
              aria-label="Reset"
            >
              ⟲ Reset
            </button>
          </div>
        </div>

        {/* Glass */}
        <div className="neon-float rounded-[34px] border border-white/10 bg-white/[0.07] p-5 shadow-[0_0_0_1px_rgba(255,255,255,.05),0_22px_70px_rgba(0,0,0,.60)] backdrop-blur-xl sm:p-6">
          {screen === "home" && (
            <Home
              onStart={() => {
                onAnyUserTap();
                haptic(10);
                sfx("tap");
                setScreen("players");
              }}
            />
          )}

          {screen === "players" && (
            <Players
              players={players}
              nameInput={nameInput}
              setNameInput={setNameInput}
              addPlayer={addPlayer}
              removePlayer={removePlayer}
              canStart={canStart}
              startGame={startGame}
              goBack={() => {
                onAnyUserTap();
                haptic(10);
                sfx("tap");
                setScreen("home");
              }}
            />
          )}

          {screen === "game" && (
            <Game
              round={round}
              currentPlayer={currentPlayer}
              phase={phase}
              choice={choice}
              currentPrompt={currentPrompt}
              onChoose={chooseType}
              onNextTurn={nextTurn}
              onChangePrompt={changePrompt}
              showPenalty={showPenalty}
              setShowPenalty={(v) => {
                onAnyUserTap();
                setShowPenalty(v);
                haptic(10);
                sfx("tap");
              }}
            />
          )}
        </div>
      </div>
    </main>
  );
}

/* ------------ Background ------------ */

function SoundwaveBackground() {
  return (
    <>
      <div className="pointer-events-none fixed inset-0 z-0 noise" />

      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-0">
        <div className="mx-auto flex max-w-[980px] items-end justify-center gap-[7px] px-6 pb-6 opacity-75">
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className="wavebar w-[10px] bg-gradient-to-t from-cyan-300/70 via-fuchsia-400/60 to-white/30 shadow-[0_0_20px_rgba(34,211,238,.20)]"
              style={{ height: 20 + i * 2 }}
            />
          ))}
        </div>
        <div className="h-12 bg-gradient-to-t from-black/60 to-transparent" />
      </div>
    </>
  );
}

/* ------------ Screens ------------ */

function Home({ onStart }: { onStart: () => void }) {
  return (
    <div className="space-y-5">
      <div className="rounded-[28px] border border-white/10 bg-gradient-to-br from-fuchsia-500/18 via-cyan-400/10 to-purple-500/16 p-6">
        <p className="text-lg font-semibold text-white/85 sm:text-xl">
          El juego de verdad o reto más fluido y épico que jamás hayas jugado. Sin reglas complicadas, sin distracciones, solo puro sexo
        </p>
      </div>

      <button
        onClick={onStart}
        className="tap w-full rounded-[28px] bg-gradient-to-r from-fuchsia-500 to-cyan-400 px-6 py-6 text-xl font-extrabold text-black shadow-[0_0_38px_rgba(34,211,238,.22)] hover:brightness-110 sm:text-2xl"
      >
        Empezar
      </button>

      <div className="grid grid-cols-2 gap-3">
        <Tag text="Divertdo" />
        <Tag text="Swipe" />
        <Tag text="Neón" />
        <Tag text="Rápido" />
      </div>
    </div>
  );
}

function Players(props: {
  players: string[];
  nameInput: string;
  setNameInput: (v: string) => void;
  addPlayer: () => void;
  removePlayer: (name: string) => void;
  canStart: boolean;
  startGame: () => void;
  goBack: () => void;
}) {
  const { players, nameInput, setNameInput, addPlayer, removePlayer, canStart, startGame, goBack } = props;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-extrabold">Jugadores</h2>
        <button
          onClick={goBack}
          className="tap rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm font-semibold text-white/90 hover:bg-white/15"
        >
          ← Volver
        </button>
      </div>

      <div className="flex gap-2">
        <input
          value={nameInput}
          onChange={(e) => setNameInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") addPlayer();
          }}
          placeholder="Nombre"
          className="w-full rounded-[26px] border border-white/10 bg-black/30 px-5 py-4 text-base outline-none placeholder:text-white/35 focus:border-fuchsia-400/45 sm:text-lg"
        />
        <button
          onClick={addPlayer}
          className="tap rounded-[26px] bg-white px-5 py-4 text-base font-extrabold text-black hover:brightness-95 sm:text-lg"
        >
          +
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {players.length === 0 ? (
          <div className="text-base text-white/60">Agrega mínimo 2.</div>
        ) : (
          players.map((p) => (
            <div
              key={p}
              className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-4 py-2"
            >
              <span className="h-2.5 w-2.5 rounded-full bg-cyan-300/80 shadow-[0_0_12px_rgba(34,211,238,.40)]" />
              <span className="text-base font-semibold">{p}</span>
              <button
                onClick={() => removePlayer(p)}
                className="tap ml-1 rounded-full border border-white/10 bg-white/10 px-2 py-1 text-sm text-white/70 hover:bg-white/15"
              >
                ×
              </button>
            </div>
          ))
        )}
      </div>

      <button
        disabled={!canStart}
        onClick={startGame}
        className={cn(
          "tap w-full rounded-[28px] px-6 py-6 text-xl font-extrabold shadow-[0_0_34px_rgba(232,121,249,.18)] sm:text-2xl",
          canStart
            ? "bg-gradient-to-r from-fuchsia-500 to-purple-500 text-black hover:brightness-110"
            : "bg-white/10 text-white/40"
        )}
      >
        Iniciar
      </button>
    </div>
  );
}

/* ------------ Game w/ Swipe + Flip + Confetti ------------ */

function Game(props: {
  round: number;
  currentPlayer: string;
  phase: "choose" | "reveal";
  choice: "truth" | "dare" | null;
  currentPrompt: PromptItem | null;
  onChoose: (t: "truth" | "dare") => void;
  onNextTurn: () => void;
  onChangePrompt: () => void;
  showPenalty: boolean;
  setShowPenalty: (v: boolean) => void;
}) {
  const {
    round,
    currentPlayer,
    phase,
    choice,
    currentPrompt,
    onChoose,
    onNextTurn,
    onChangePrompt,
    showPenalty,
    setShowPenalty,
  } = props;

  // Swipe state
  const [dx, setDx] = useState(0);
  const [dragging, setDragging] = useState(false);
  const startX = useRef<number | null>(null);

  // Confetti
  const [confetti, setConfetti] = useState<Array<{ id: string; x: number; size: number; delay: number }>>([]);

  const swipeThreshold = 90;

  function spawnNeonConfetti() {
    const pieces = Array.from({ length: 26 }).map((_, i) => ({
      id: `${Date.now()}_${i}`,
      x: Math.random() * 100,
      size: 6 + Math.random() * 10,
      delay: Math.random() * 0.15,
    }));
    setConfetti(pieces);
    setTimeout(() => setConfetti([]), 1200);
  }

  function nextWithConfetti() {
    spawnNeonConfetti();
    onNextTurn();
  }

  function settleSwipe(currentDx: number) {
    if (phase !== "choose") return;

    if (currentDx > swipeThreshold) {
      setDragging(false);
      setDx(0);
      onChoose("dare"); // derecha = RETO
      return;
    }
    if (currentDx < -swipeThreshold) {
      setDragging(false);
      setDx(0);
      onChoose("truth"); // izquierda = VERDAD
      return;
    }

    // Snap back
    setDragging(false);
    setDx(0);
  }

  // -------- Pointer (PC / Android Chrome) --------
  function handlePointerDown(e: React.PointerEvent) {
    if (phase !== "choose") return;
    startX.current = e.clientX;
    setDragging(true);
  }

  function handlePointerMove(e: React.PointerEvent) {
    if (!dragging || startX.current == null) return;
    const delta = e.clientX - startX.current;
    setDx(delta);
  }

  function handlePointerUp() {
    settleSwipe(dx);
  }

  // -------- Touch fallback (iOS Safari) --------
  function handleTouchStart(e: React.TouchEvent) {
    if (phase !== "choose") return;
    const t = e.touches[0];
    if (!t) return;
    startX.current = t.clientX;
    setDragging(true);
  }

  function handleTouchMove(e: React.TouchEvent) {
    if (!dragging || startX.current == null) return;

    const t = e.touches[0];
    if (!t) return;

    const delta = t.clientX - startX.current;
    setDx(delta);

    // Evita que Safari se robe el gesto si ya es swipe horizontal
    if (Math.abs(delta) > 6) e.preventDefault();
  }

  function handleTouchEnd() {
    settleSwipe(dx);
  }

  const rotate = Math.max(-10, Math.min(10, dx / 18));
  const opacityHint = Math.min(1, Math.abs(dx) / 120);

  return (
    <div className="relative space-y-5">
      {/* Confetti overlay */}
      {confetti.length > 0 && (
        <div className="pointer-events-none absolute inset-0 z-40 overflow-hidden">
          {confetti.map((p) => (
            <div
              key={p.id}
              className="absolute top-0 rounded-full"
              style={{
                left: `${p.x}%`,
                width: `${p.size}px`,
                height: `${p.size}px`,
                transform: `translateY(-10px)`,
                animation: `confettiFall 1.05s ease-in forwards`,
                animationDelay: `${p.delay}s`,
                background: Math.random() > 0.5 ? "rgba(232,121,249,.85)" : "rgba(34,211,238,.85)",
                boxShadow:
                  Math.random() > 0.5
                    ? "0 0 18px rgba(232,121,249,.45)"
                    : "0 0 18px rgba(34,211,238,.40)",
              }}
            />
          ))}
          <style jsx>{`
            @keyframes confettiFall {
              0% {
                transform: translateY(-10px) translateX(0);
                opacity: 1;
              }
              100% {
                transform: translateY(520px) translateX(40px);
                opacity: 0;
              }
            }
          `}</style>
        </div>
      )}

      {/* HUD */}
      <div className="rounded-[28px] border border-white/10 bg-white/[0.05] p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-white/55">
              Round <span className="text-white/85">{round}</span>
            </p>
            <div className="mt-2 text-3xl font-extrabold sm:text-4xl">{currentPlayer || "—"}</div>
            <p className="mt-1 text-base text-white/70 sm:text-lg">
              {phase === "choose" ? "Swipe o tap para elegir" : "A jugar"}
            </p>
          </div>

          {phase === "choose" && (
            <div className="rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm font-semibold text-white/70">
              ← Verdad · Reto →
            </div>
          )}
        </div>
      </div>

      {/* CHOOSE: one big swipeable card */}
      {phase === "choose" && (
        <div className="space-y-4">
          <div
            className="flip-wrap swipe-zone"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onTouchCancel={handleTouchEnd}
          >
            <div
              className="tap rounded-[34px] border border-white/10 bg-gradient-to-br from-white/[0.10] to-white/[0.04] p-6 shadow-[0_24px_80px_rgba(0,0,0,.45)]"
              style={{
                transform: `translateX(${dx}px) rotate(${rotate}deg)`,
                transition: dragging ? "none" : "transform 220ms ease",
              }}
            >
              <div className="flex items-center justify-between">
                <span className="rounded-full border border-white/10 bg-white/10 px-4 py-2 text-xs font-extrabold tracking-wide text-white/80">
                  DECK
                </span>

                <div className="flex items-center gap-2 text-sm font-semibold text-white/60">
                  <span className="nudge-left">←</span>
                  <span>Swipe</span>
                  <span className="nudge-right">→</span>
                </div>
              </div>

              <div className="mt-5 text-3xl font-extrabold sm:text-4xl">Elige tu carta</div>
              <div className="mt-2 text-base font-semibold text-white/70 sm:text-lg">
                Arrastra o toca un botón abajo
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3">
                <div className="rounded-[26px] border border-white/10 bg-fuchsia-500/14 p-4">
                  <div className="text-xl font-extrabold text-fuchsia-200">VERDAD</div>
                  <div className="mt-1 text-sm text-white/65">Swipe izquierda</div>
                </div>
                <div className="rounded-[26px] border border-white/10 bg-cyan-500/12 p-4">
                  <div className="text-xl font-extrabold text-cyan-200">RETO</div>
                  <div className="mt-1 text-sm text-white/65">Swipe derecha</div>
                </div>
              </div>

              <div className="mt-6 rounded-[26px] border border-white/10 bg-black/25 p-4 text-center">
                <div className="text-base font-extrabold" style={{ opacity: opacityHint }}>
                  {dx < -20 ? "VERDAD" : dx > 20 ? "RETO" : "…"}
                </div>
              </div>
            </div>
          </div>

          {/* Tap buttons (optional) */}
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => onChoose("truth")}
              className="tap rounded-[28px] bg-gradient-to-r from-fuchsia-500 to-purple-500 px-5 py-5 text-lg font-extrabold text-black hover:brightness-110"
            >
              VERDAD
            </button>
            <button
              onClick={() => onChoose("dare")}
              className="tap rounded-[28px] bg-gradient-to-r from-cyan-400 to-fuchsia-400 px-5 py-5 text-lg font-extrabold text-black hover:brightness-110"
            >
              RETO
            </button>
          </div>
        </div>
      )}

      {/* REVEAL: flip card */}
      {phase === "reveal" && currentPrompt && (
        <div className="space-y-5">
          <div className="flip-wrap">
            <div className="flip is-flipped">
              {/* Front face (fake front) */}
              <div className="flip-face">
                <div className="rounded-[34px] border border-white/10 bg-gradient-to-br from-white/[0.10] to-white/[0.04] p-6 shadow-[0_24px_80px_rgba(0,0,0,.45)]">
                  <div className="text-2xl font-extrabold">Cargando carta…</div>
                </div>
              </div>

              {/* Back face (content) */}
              <div className="flip-face flip-back">
                <div className="pop-in relative overflow-hidden rounded-[34px] border border-white/10 bg-gradient-to-br from-white/[0.12] to-white/[0.05] p-6 shadow-[0_24px_80px_rgba(0,0,0,.45)]">
                  <div
                    className={cn(
                      "absolute inset-x-0 top-0 h-1.5",
                      choice === "truth" ? "bg-fuchsia-400/70" : "bg-cyan-300/70"
                    )}
                  />

                  <div className="flex items-center justify-between">
                    <span
                      className={cn(
                        "rounded-full border px-4 py-2 text-sm font-extrabold",
                        choice === "truth"
                          ? "bg-fuchsia-500/20 text-fuchsia-200 border-fuchsia-400/20"
                          : "bg-cyan-500/15 text-cyan-200 border-cyan-400/20"
                      )}
                    >
                      {choice === "truth" ? "VERDAD" : "RETO"}
                    </span>

                    <button
                      onClick={onChangePrompt}
                      className="tap rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm font-semibold text-white/85 hover:bg-white/15"
                    >
                      Cambiar
                    </button>
                  </div>

                  <div className="mt-4 rounded-[28px] border border-white/10 bg-black/25 p-6">
                    <div className="text-2xl font-semibold leading-snug sm:text-3xl">
                      {currentPrompt.text}
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-4">
                    <button
                      onClick={() => setShowPenalty(!showPenalty)}
                      className="tap rounded-[28px] border border-white/10 bg-white/10 px-5 py-5 text-base font-extrabold text-white/90 hover:bg-white/15 sm:text-lg"
                    >
                      {showPenalty ? "Ocultar" : "Castigo"}
                    </button>

                    <button
                      onClick={nextWithConfetti}
                      className="tap pulse-glow rounded-[28px] bg-gradient-to-r from-fuchsia-500 to-cyan-400 px-5 py-5 text-base font-extrabold text-black hover:brightness-110 sm:text-lg"
                    >
                      Siguiente →
                    </button>
                  </div>

                  {showPenalty && (
                    <div className="mt-4 rounded-[28px] border border-white/10 bg-black/30 p-6 text-base text-white/85 sm:text-lg">
                      <div className="font-extrabold">Castigo</div>
                      <div className="mt-1">3 sorbos o brindis dramático + verdad mini.</div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Tag({ text }: { text: string }) {
  return (
    <div className="rounded-[28px] border border-white/10 bg-white/[0.05] px-4 py-4 text-center text-sm font-semibold text-white/70">
      {text}
    </div>
  );
}
