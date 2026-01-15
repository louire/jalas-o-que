"use client";

import React, { useEffect, useMemo, useState } from "react";
import { PROMPTS, PromptItem, PromptType } from "./lib/prompts";
import { nextPrompt, pickNextPlayer, haptic, sfx } from "./lib/game";

type Screen = "home" | "players" | "game";
type Phase = "choose" | "reveal";

function cn(...classes: Array<string | false | undefined | null>) {
  return classes.filter(Boolean).join(" ");
}

export default function Page() {
  const [screen, setScreen] = useState<Screen>("home");

  // Players
  const [nameInput, setNameInput] = useState("");
  const [players, setPlayers] = useState<string[]>([]);
  const canStart = players.length >= 2;

  // Game state
  const [currentPlayer, setCurrentPlayer] = useState<string>("");
  const [lastPlayer, setLastPlayer] = useState<string | null>(null);

  const [phase, setPhase] = useState<Phase>("choose");
  const [choice, setChoice] = useState<PromptType | null>(null);
  const [currentPrompt, setCurrentPrompt] = useState<PromptItem | null>(null);

  // History (no repetir prompts)
  const [historyIds, setHistoryIds] = useState<string[]>([]);

  // UX extra
  const [showPenalty, setShowPenalty] = useState(false);

  // Persist simple (sin DB)
  useEffect(() => {
    const raw = localStorage.getItem("joq_demo");
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed.players)) setPlayers(parsed.players);
    } catch {}
  }, []);

  useEffect(() => {
    localStorage.setItem("joq_demo", JSON.stringify({ players }));
  }, [players]);

  const promptCount = useMemo(() => PROMPTS.length, []);

  function addPlayer() {
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
    setPlayers(prev => prev.filter(p => p !== name));
    haptic(10);
    sfx("tap");
  }

  function startGame() {
    const first = pickNextPlayer(players, null);
    setCurrentPlayer(first);
    setLastPlayer(first);
    setPhase("choose");
    setChoice(null);
    setCurrentPrompt(null);
    setShowPenalty(false);
    setScreen("game");
    haptic([12, 18, 12]);
    sfx("reveal");
  }

  function nextTurn() {
    const next = pickNextPlayer(players, lastPlayer);
    setLastPlayer(next);
    setCurrentPlayer(next);
    setPhase("choose");
    setChoice(null);
    setCurrentPrompt(null);
    setShowPenalty(false);
    haptic(15);
    sfx("next");
  }

  function chooseType(type: PromptType) {
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
    if (!choice) return;
    const { item, newHistoryIds } = nextPrompt(PROMPTS, choice, historyIds);
    setHistoryIds(newHistoryIds);
    setCurrentPrompt(item);
    haptic(12);
    sfx("tap");
  }

  function resetAll() {
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
    localStorage.removeItem("joq_demo");
    haptic([10, 25, 10]);
    sfx("bad");
  }

  return (
    <main className="min-h-screen text-white">
      {/* Mobile-first container */}
      <div className="mx-auto w-full max-w-[520px] px-4 pb-10 pt-6">
        {/* Top Bar */}
        <div className="mb-4 flex items-start justify-between">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] text-white/80">
              <span className="h-2 w-2 rounded-full bg-fuchsia-400 shadow-[0_0_12px_rgba(232,121,249,.9)]" />
              Demo · Modo Antro
            </div>

            <h1 className="text-3xl font-semibold tracking-tight">
              Jalas <span className="text-fuchsia-300">o qué</span>?
            </h1>

            <p className="text-sm text-white/65">
              Deck de cards · {promptCount} prompts · 1 modo
            </p>
          </div>

          <button
            onClick={resetAll}
            className="tap rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/80 hover:bg-white/10"
          >
            Reset
          </button>
        </div>

        {/* Main Card (glass) */}
        <div className="neon-float rounded-[28px] border border-white/10 bg-white/[0.06] p-4 shadow-[0_0_0_1px_rgba(255,255,255,.04),0_18px_60px_rgba(0,0,0,.55)] backdrop-blur-xl">
          {screen === "home" && (
            <Home
              onQuickPlay={() => {
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
                haptic(10);
                sfx("tap");
                setScreen("home");
              }}
            />
          )}

          {screen === "game" && (
            <Game
              currentPlayer={currentPlayer}
              phase={phase}
              choice={choice}
              currentPrompt={currentPrompt}
              onChoose={chooseType}
              onNextTurn={nextTurn}
              onChangePrompt={changePrompt}
              showPenalty={showPenalty}
              setShowPenalty={(v) => {
                setShowPenalty(v);
                haptic(10);
                sfx("tap");
              }}
            />
          )}
        </div>

        <p className="mt-5 text-center text-xs text-white/45">
          Tip: Pruébalo en móvil. Todo está pensado para tap rápido.
        </p>
      </div>
    </main>
  );
}

function Home({ onQuickPlay }: { onQuickPlay: () => void }) {
  return (
    <div className="space-y-4">
      {/* “Game banner” */}
      <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-fuchsia-500/15 via-cyan-400/8 to-purple-500/12 p-4">
        <p className="text-sm text-white/80">
          Turnos rápidos. Elige{" "}
          <span className="font-semibold text-fuchsia-200">VERDAD</span> o{" "}
          <span className="font-semibold text-cyan-200">RETO</span>.
          <span className="block pt-1 text-xs text-white/60">
            (Sin DB · sin registro · listo para demo)
          </span>
        </p>
      </div>

      {/* Primary CTA */}
      <button
        onClick={onQuickPlay}
        className="tap w-full rounded-3xl bg-gradient-to-r from-fuchsia-500 to-cyan-400 px-5 py-4 text-base font-semibold text-black shadow-[0_0_30px_rgba(34,211,238,.25)] hover:brightness-110"
      >
        Empezar
      </button>

      <div className="grid grid-cols-2 gap-3">
        <Tag text="Mobile-first" />
        <Tag text="Haptics + SFX" />
        <Tag text="Deck de cards" />
        <Tag text="UX rápido" />
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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Jugadores</h2>
        <button
          onClick={goBack}
          className="tap rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/80 hover:bg-white/10"
        >
          ← Inicio
        </button>
      </div>

      <div className="flex gap-2">
        <input
          value={nameInput}
          onChange={(e) => setNameInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") addPlayer();
          }}
          placeholder="Nombre (ej: Loui)"
          className="w-full rounded-3xl border border-white/10 bg-black/30 px-4 py-3 text-sm outline-none placeholder:text-white/30 focus:border-fuchsia-400/40"
        />
        <button
          onClick={addPlayer}
          className="tap rounded-3xl bg-white px-4 py-3 text-sm font-semibold text-black hover:brightness-95"
        >
          +
        </button>
      </div>

      {/* Player chips */}
      <div className="flex flex-wrap gap-2">
        {players.length === 0 ? (
          <div className="text-sm text-white/60">Agrega mínimo 2 jugadores.</div>
        ) : (
          players.map((p) => (
            <div
              key={p}
              className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-2"
            >
              <span className="h-2 w-2 rounded-full bg-cyan-300/80 shadow-[0_0_10px_rgba(34,211,238,.35)]" />
              <span className="text-sm">{p}</span>
              <button
                onClick={() => removePlayer(p)}
                className="tap ml-1 rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[11px] text-white/70 hover:bg-white/10"
              >
                x
              </button>
            </div>
          ))
        )}
      </div>

      <button
        disabled={!canStart}
        onClick={startGame}
        className={cn(
          "tap w-full rounded-3xl px-5 py-4 text-base font-semibold shadow-[0_0_30px_rgba(232,121,249,.18)]",
          canStart
            ? "bg-gradient-to-r from-fuchsia-500 to-purple-500 text-black hover:brightness-110"
            : "bg-white/10 text-white/40"
        )}
      >
        Iniciar juego
      </button>
    </div>
  );
}

function Game(props: {
  currentPlayer: string;
  phase: Phase;
  choice: PromptType | null;
  currentPrompt: PromptItem | null;
  onChoose: (t: PromptType) => void;
  onNextTurn: () => void;
  onChangePrompt: () => void;
  showPenalty: boolean;
  setShowPenalty: (v: boolean) => void;
}) {
  const {
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

  return (
    <div className="space-y-4">
      {/* “HUD” mini */}
      <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] uppercase tracking-widest text-white/50">Turno</p>
            <div className="mt-1 text-2xl font-semibold">{currentPlayer || "—"}</div>
            <p className="mt-1 text-sm text-white/65">Elige una carta 👇</p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/25 px-3 py-2 text-[11px] text-white/60">
            Modo: <span className="text-white/85">Classic</span>
          </div>
        </div>
      </div>

      {/* Deck */}
      {phase === "choose" && (
        <div className="grid grid-cols-2 gap-3">
          <ChoiceCard
            title="VERDAD"
            subtitle="Confiesa algo leve"
            accent="truth"
            onClick={() => onChoose("truth")}
          />
          <ChoiceCard
            title="RETO"
            subtitle="Haz algo rápido"
            accent="dare"
            onClick={() => onChoose("dare")}
          />
        </div>
      )}

      {/* Reveal Card */}
      {phase === "reveal" && currentPrompt && (
        <div className="pop-in relative overflow-hidden rounded-[28px] border border-white/10 bg-gradient-to-br from-white/[0.09] to-white/[0.03] p-4">
          {/* top glow strip */}
          <div
            className={cn(
              "absolute inset-x-0 top-0 h-1",
              choice === "truth" ? "bg-fuchsia-400/70" : "bg-cyan-300/70"
            )}
          />

          <div className="flex items-center justify-between">
            <span
              className={cn(
                "rounded-full px-3 py-1 text-xs font-semibold",
                choice === "truth"
                  ? "bg-fuchsia-500/20 text-fuchsia-200 border border-fuchsia-400/20"
                  : "bg-cyan-500/15 text-cyan-200 border border-cyan-400/20"
              )}
            >
              {choice === "truth" ? "VERDAD" : "RETO"}
            </span>

            <button
              onClick={onChangePrompt}
              className="tap rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/80 hover:bg-white/10"
            >
              Cambiar
            </button>
          </div>

          {/* “Card content” */}
          <div className="mt-4 rounded-3xl border border-white/10 bg-black/25 p-4">
            <div className="text-lg leading-snug">{currentPrompt.text}</div>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-3">
            <button
              onClick={() => setShowPenalty(!showPenalty)}
              className="tap rounded-3xl border border-white/10 bg-white/5 px-4 py-4 text-sm font-semibold text-white/85 hover:bg-white/10"
            >
              {showPenalty ? "Ocultar castigo" : "Castigo"}
            </button>

            <button
              onClick={onNextTurn}
              className="tap pulse-glow rounded-3xl bg-gradient-to-r from-fuchsia-500 to-cyan-400 px-4 py-4 text-sm font-semibold text-black hover:brightness-110"
            >
              Siguiente →
            </button>
          </div>

          {showPenalty && (
            <div className="mt-3 rounded-3xl border border-white/10 bg-black/30 p-4 text-sm text-white/80">
              <div className="font-semibold">Castigo (demo)</div>
              <div className="mt-1">
                3 sorbos o “brindis dramático” + una verdad mini.
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ChoiceCard(props: {
  title: string;
  subtitle: string;
  accent: "truth" | "dare";
  onClick: () => void;
}) {
  const { title, subtitle, accent, onClick } = props;

  const accentClasses =
    accent === "truth"
      ? "from-fuchsia-500/26 via-white/[0.06] to-white/[0.03] hover:from-fuchsia-500/32"
      : "from-cyan-400/22 via-white/[0.06] to-white/[0.03] hover:from-cyan-400/28";

  const badge =
    accent === "truth"
      ? "bg-fuchsia-400/15 text-fuchsia-200 border-fuchsia-400/20"
      : "bg-cyan-300/12 text-cyan-200 border-cyan-300/20";

  return (
    <button
      onClick={onClick}
      className={cn(
        "tap relative overflow-hidden rounded-[28px] border border-white/10 bg-gradient-to-br p-5 text-left shadow-[0_20px_60px_rgba(0,0,0,.35)]",
        accentClasses
      )}
    >
      {/* faint “party lights” dots */}
      <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-white/5 blur-2xl" />
      <div className="absolute -left-10 -bottom-10 h-32 w-32 rounded-full bg-white/5 blur-2xl" />

      <div className={cn("inline-flex rounded-full border px-3 py-1 text-[11px] font-semibold", badge)}>
        CARD
      </div>

      <div className="mt-3 text-2xl font-semibold">{title}</div>
      <div className="mt-1 text-sm text-white/70">{subtitle}</div>

      <div className="mt-5 flex items-center gap-2 text-xs text-white/55">
        <span className="h-2 w-2 rounded-full bg-white/35" />
        Tap para revelar
      </div>
    </button>
  );
}

function Tag({ text }: { text: string }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.04] px-3 py-3 text-center text-xs text-white/70">
      {text}
    </div>
  );
}
