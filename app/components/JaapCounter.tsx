"use client";

import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { COLOR_MAP, type ColorKey, type JaapConfig, type JaapSession } from "../lib/jaap";

// ── Progress SVG arc ────────────────────────────────────────────────────────

const ARC_R = 145;
const ARC_CIRCUMFERENCE = 2 * Math.PI * ARC_R;

function ProgressArc({
  progress,
  color,
}: {
  progress: number;
  color: string;
}) {
  const offset = ARC_CIRCUMFERENCE * (1 - Math.min(1, progress));
  return (
    <svg
      className="absolute inset-0 w-full h-full"
      viewBox="0 0 320 320"
      fill="none"
      aria-hidden
    >
      {/* Track */}
      <circle
        cx="160"
        cy="160"
        r={ARC_R}
        stroke="rgba(255,255,255,0.05)"
        strokeWidth="3"
        fill="none"
      />
      {/* Progress */}
      <circle
        cx="160"
        cy="160"
        r={ARC_R}
        stroke={color}
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
        strokeDasharray={ARC_CIRCUMFERENCE}
        strokeDashoffset={offset}
        className="progress-ring-circle"
        style={{ filter: `drop-shadow(0 0 6px ${color})` }}
      />
      {/* Small tick marks every 10% */}
      {Array.from({ length: 36 }).map((_, i) => {
        const angle = (i * 10 * Math.PI) / 180 - Math.PI / 2;
        const isMajor = i % 9 === 0;
        const r1 = ARC_R - (isMajor ? 8 : 4);
        const r2 = ARC_R + (isMajor ? 2 : 0);
        return (
          <line
            key={i}
            x1={160 + r1 * Math.cos(angle)}
            y1={160 + r1 * Math.sin(angle)}
            x2={160 + r2 * Math.cos(angle)}
            y2={160 + r2 * Math.sin(angle)}
            stroke={isMajor ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.05)"}
            strokeWidth={isMajor ? "1.5" : "1"}
          />
        );
      })}
    </svg>
  );
}

// ── Main Counter ─────────────────────────────────────────────────────────────

interface JaapCounterProps {
  config: JaapConfig;
  session: JaapSession;
  onUpdate: (updated: JaapSession) => void;
  onMilestone: () => void;
}

export default function JaapCounter({
  config,
  session,
  onUpdate,
  onMilestone,
}: JaapCounterProps) {
  const colors = COLOR_MAP[config.color as ColorKey] ?? COLOR_MAP.saffron;

  // Use refs for hot-path values to avoid stale closures without re-renders
  const countRef    = useRef(session.count);
  const iterRef     = useRef(session.iterations);
  const totalRef    = useRef(session.totalCount);
  const tappingRef  = useRef(false);

  // Only the displayed count triggers re-render
  const [displayCount, setDisplayCount] = useState(session.count);
  const [showPulse, setShowPulse]       = useState(false);
  const [isMilestone, setIsMilestone]   = useState(false);
  const popTimer  = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pulseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync from outside when config/session changes
  useEffect(() => {
    countRef.current  = session.count;
    iterRef.current   = session.iterations;
    totalRef.current  = session.totalCount;
    setDisplayCount(session.count);
  }, [session.configId, session.count, session.iterations, session.totalCount]);

  const triggerPulse = useCallback(() => {
    setShowPulse(true);
    if (pulseTimer.current) clearTimeout(pulseTimer.current);
    pulseTimer.current = setTimeout(() => setShowPulse(false), 500);
  }, []);

  const handleTap = useCallback(() => {
    if (tappingRef.current) return; // debounce double-fire
    tappingRef.current = true;

    const newCount = countRef.current + 1;
    countRef.current = newCount;
    totalRef.current += 1;

    if (newCount >= config.target) {
      // Mala complete
      countRef.current = 0;
      iterRef.current += 1;
      setDisplayCount(0);
      setIsMilestone(true);
      setTimeout(() => setIsMilestone(false), 900);
      onMilestone();
    } else {
      setDisplayCount(newCount);
    }

    triggerPulse();

    // Propagate to parent (saves to localStorage)
    onUpdate({
      configId:   config.id,
      count:      countRef.current,
      iterations: iterRef.current,
      totalCount: totalRef.current,
      lastUpdated: Date.now(),
    });

    // Pop animation via class toggling on the DOM directly (zero-cost)
    const el = document.getElementById("count-num");
    if (el) {
      el.classList.remove("pop");
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      el.offsetWidth; // reflow
      el.classList.add("pop");
      if (popTimer.current) clearTimeout(popTimer.current);
      popTimer.current = setTimeout(() => el.classList.remove("pop"), 150);
    }

    setTimeout(() => {
      tappingRef.current = false;
    }, 30);
  }, [config.id, config.target, onUpdate, onMilestone, triggerPulse]);

  const progress = displayCount / config.target;
  const pct      = Math.round(progress * 100);

  return (
    <div className="flex flex-col items-center gap-6 select-none">
      {/* Mantra label */}
      <div className="text-center">
        <p
          className="devanagari shimmer-text text-4xl sm:text-5xl font-normal leading-tight"
          aria-label={config.name}
        >
          {config.name}
        </p>
        <p
          className="devanagari mt-1 text-base sm:text-lg"
          style={{ color: "rgba(245,232,208,0.5)" }}
        >
          {config.mantra}
        </p>
      </div>

      {/* Counter button wrapper — 320px SVG container */}
      <div
        className="relative flex items-center justify-center"
        style={{ width: 320, height: 320 }}
      >
        <ProgressArc progress={progress} color={colors.primary} />

        {/* Outer glow ring */}
        <div
          className="absolute rounded-full pointer-events-none"
          style={{
            inset: 16,
            borderRadius: "50%",
            boxShadow: `0 0 60px ${colors.glow}, 0 0 120px ${colors.ring}`,
            transition: "box-shadow 0.3s ease",
          }}
        />

        {/* Main tap button */}
        <button
          className={`counter-btn flex flex-col items-center justify-center gap-1 focus:outline-none ${
            isMilestone ? "milestone-flash" : ""
          }`}
          style={{
            width: 220,
            height: 220,
            "--btn-glow": colors.glow,
          } as React.CSSProperties}
          onClick={handleTap}
          onKeyDown={(e) => e.key === " " || e.key === "Enter" ? handleTap() : undefined}
          aria-label={`${config.name} counter: ${displayCount} of ${config.target}`}
        >
          {/* Big count */}
          <span
            id="count-num"
            className="count-display font-display text-7xl sm:text-8xl font-light leading-none"
            style={{
              color: colors.primary,
              textShadow: `0 0 30px ${colors.glow}`,
              fontFamily: "'Cormorant Garamond', serif",
            }}
          >
            {displayCount}
          </span>

          {/* Target label */}
          <span
            className="text-xs font-body tracking-widest uppercase"
            style={{ color: "rgba(245,232,208,0.4)", letterSpacing: "0.2em" }}
          >
            of {config.target}
          </span>

          {/* Pct */}
          <span
            className="text-xs font-body mt-0.5"
            style={{ color: "rgba(245,232,208,0.3)" }}
          >
            {pct}%
          </span>
        </button>

        {/* Pulse ring on tap */}
        {showPulse && <span className="pulse-ring" aria-hidden />}
      </div>

      {/* Tap hint */}
      <p
        className="text-xs tracking-widest uppercase"
        style={{ color: "rgba(245,232,208,0.25)", letterSpacing: "0.2em" }}
      >
        tap or press space
      </p>
    </div>
  );
}
