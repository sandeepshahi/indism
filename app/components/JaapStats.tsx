"use client";

import React, { useMemo } from "react";
import {
  COLOR_MAP,
  type ColorKey,
  type JaapConfig,
  type JaapSession,
} from "../lib/jaap";

interface JaapStatsProps {
  config: JaapConfig;
  session: JaapSession;
  onReset: () => void;
}

function StatBlock({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: string | number;
  sub?: string;
  accent: string;
}) {
  return (
    <div className="glass-card px-4 py-3 flex flex-col gap-0.5">
      <span
        className="text-xs uppercase tracking-widest"
        style={{ color: "rgba(245,232,208,0.4)", letterSpacing: "0.15em" }}
      >
        {label}
      </span>
      <span
        className="text-3xl font-light leading-tight"
        style={{
          color: accent,
          fontFamily: "'Cormorant Garamond', serif",
          textShadow: `0 0 20px ${accent}66`,
        }}
      >
        {value}
      </span>
      {sub && (
        <span className="text-xs" style={{ color: "rgba(245,232,208,0.35)" }}>
          {sub}
        </span>
      )}
    </div>
  );
}

// Mala beads visualisation — 27 dots in a circle
function MalaViz({
  count,
  target,
  color,
}: {
  count: number;
  target: number;
  color: string;
}) {
  const BEADS = Math.min(target, 27);
  const filled = Math.round((count / target) * BEADS);

  return (
    <div className="glass-card p-4 flex flex-col gap-3">
      <span
        className="text-xs uppercase tracking-widest"
        style={{ color: "rgba(245,232,208,0.4)", letterSpacing: "0.15em" }}
      >
        माला progress
      </span>
      <div
        className="relative mx-auto"
        style={{ width: 120, height: 120 }}
        aria-label={`${count} of ${target} jaaps`}
      >
        {Array.from({ length: BEADS }).map((_, i) => {
          const angle = (i / BEADS) * 2 * Math.PI - Math.PI / 2;
          const r = 50;
          const x = 60 + r * Math.cos(angle);
          const y = 60 + r * Math.sin(angle);
          const isFilled = i < filled;
          return (
            <div
              key={i}
              className="absolute rounded-full transition-all duration-200"
              style={{
                width: 7,
                height: 7,
                left: x - 3.5,
                top: y - 3.5,
                background: isFilled ? color : "rgba(255,255,255,0.08)",
                boxShadow: isFilled ? `0 0 6px ${color}` : "none",
                transform: isFilled ? "scale(1.1)" : "scale(1)",
              }}
            />
          );
        })}
        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className="text-xl font-light leading-none"
            style={{ color, fontFamily: "'Cormorant Garamond', serif" }}
          >
            {count}
          </span>
          <span className="text-xs" style={{ color: "rgba(245,232,208,0.3)" }}>
            / {target}
          </span>
        </div>
      </div>
    </div>
  );
}

// Iteration history strip
function IterHistory({
  iterations,
  color,
}: {
  iterations: number;
  color: string;
}) {
  const MAX_DISPLAY = 20;
  const shown = Math.min(iterations, MAX_DISPLAY);
  const overflow = iterations > MAX_DISPLAY ? iterations - MAX_DISPLAY : 0;

  if (iterations === 0) {
    return (
      <div
        className="glass-card px-4 py-3 text-xs"
        style={{ color: "rgba(245,232,208,0.3)" }}
      >
        Complete your first mala to begin.
      </div>
    );
  }

  return (
    <div className="glass-card px-4 py-3 flex flex-col gap-2">
      <span
        className="text-xs uppercase tracking-widest"
        style={{ color: "rgba(245,232,208,0.4)", letterSpacing: "0.15em" }}
      >
        Completed Malas
      </span>
      <div className="flex flex-wrap gap-1.5">
        {Array.from({ length: shown }).map((_, i) => (
          <div
            key={i}
            className="w-4 h-4 rounded-full iter-badge"
            style={{
              background: color,
              boxShadow: `0 0 6px ${color}`,
              animationDelay: `${i * 0.02}s`,
            }}
            title={`Mala ${i + 1}`}
          />
        ))}
        {overflow > 0 && (
          <span
            className="text-xs self-center"
            style={{ color: "rgba(245,232,208,0.5)" }}
          >
            +{overflow} more
          </span>
        )}
      </div>
    </div>
  );
}

export default function JaapStats({
  config,
  session,
  onReset,
}: JaapStatsProps) {
  const colors = COLOR_MAP[config.color as ColorKey] ?? COLOR_MAP.saffron;

  const malas = session.iterations;
  const totalJaaps = session.totalCount;
  const pct = config.target
    ? Math.round((session.count / config.target) * 100)
    : 0;

  // Avoid recalculating every render
  const sessionLabel = useMemo(() => {
    if (malas === 0) return "No malas yet";
    if (malas === 1) return "1 mala complete";
    return `${malas} malas complete`;
  }, [malas]);

  return (
    <aside className="flex flex-col gap-3 w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-1">
        <h2
          className="devanagari text-lg"
          style={{ color: "rgba(245,232,208,0.7)" }}
        >
          सांख्यिकी
        </h2>
        <span
          className="text-xs uppercase tracking-widest"
          style={{ color: "rgba(245,232,208,0.35)", letterSpacing: "0.15em" }}
        >
          Stats
        </span>
      </div>

      {/* Main stats grid */}
      <div className="grid grid-cols-2 gap-2">
        <StatBlock
          label="Iterations"
          value={malas}
          sub={sessionLabel}
          accent={colors.primary}
        />
        <StatBlock
          label="Total Jaaps"
          value={totalJaaps.toLocaleString("en-IN")}
          sub="lifetime"
          accent={colors.primary}
        />
      </div>

      {/* Mala bead viz */}
      <MalaViz
        count={session.count}
        target={config.target}
        color={colors.primary}
      />

      {/* Iteration dots */}
      <IterHistory iterations={malas} color={colors.primary} />

      {/* Divider */}
      <div
        className="border-t mt-1"
        style={{ borderColor: "rgba(255,149,0,0.1)" }}
      />

      {/* Config summary */}
      <div
        className="glass-card px-4 py-3 text-xs flex flex-col gap-1"
        style={{ color: "rgba(245,232,208,0.45)" }}
      >
        <div className="flex justify-between">
          <span>Target per mala</span>
          <span style={{ color: colors.primary }}>{config.target}</span>
        </div>
        <div className="flex justify-between">
          <span>Current progress</span>
          <span style={{ color: colors.primary }}>{pct}%</span>
        </div>
      </div>

      {/* Reset button */}
      <button
        onClick={onReset}
        className="glass-card w-full py-2.5 px-4 text-xs uppercase tracking-widest text-center transition-all duration-200 hover:bg-white/5 active:scale-95"
        style={{
          color: "rgba(192,57,43,0.7)",
          letterSpacing: "0.15em",
          borderColor: "rgba(192,57,43,0.2)",
        }}
      >
        Reset Session
      </button>
    </aside>
  );
}
