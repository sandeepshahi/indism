"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import JaapCounter from "./components/JaapCounter";
import JaapStats from "./components/JaapStats";
import ConfigModal from "./components/ConfigModal";
import {
  loadActiveConfigId,
  loadConfigs,
  loadSession,
  resetSession,
  saveActiveConfigId,
  saveConfigs,
  saveSession,
  type JaapConfig,
  type JaapSession,
} from "./lib/jaap";

// ── Milestone Toast ──────────────────────────────────────────────────────────

function MilestoneToast({
  show,
  iterations,
  mantra,
}: {
  show: boolean;
  iterations: number;
  mantra: string;
}) {
  return (
    <div
      aria-live="assertive"
      aria-atomic="true"
      className="fixed top-6 left-1/2 -translate-x-1/2 z-40 pointer-events-none transition-all duration-500"
      style={{
        opacity: show ? 1 : 0,
        transform: `translate(-50%, ${show ? "0" : "-20px"})`,
      }}
    >
      <div
        className="glass-card-strong px-6 py-3 text-center"
        style={{ borderColor: "rgba(255,200,0,0.4)" }}
      >
        <p className="devanagari text-lg" style={{ color: "#FFD580" }}>
          🙏 माला पूर्ण हुई
        </p>
        <p
          className="text-xs mt-0.5"
          style={{ color: "rgba(245,232,208,0.6)" }}
        >
          {iterations} mala{iterations !== 1 ? "s" : ""} complete · {mantra}
        </p>
      </div>
    </div>
  );
}

// ── App ──────────────────────────────────────────────────────────────────────

export default function HomePage() {
  const [configs, setConfigs] = useState<JaapConfig[]>([]);
  const [activeId, setActiveId] = useState<string>("");
  const [session, setSession] = useState<JaapSession | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const [toastShow, setToastShow] = useState(false);
  const [toastIter, setToastIter] = useState(0);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Initialise from localStorage (client-only)
  useEffect(() => {
    const cfgs = loadConfigs();
    const aid = loadActiveConfigId();
    const validId = cfgs.find((c) => c.id === aid) ? aid : cfgs[0].id;
    setConfigs(cfgs);
    setActiveId(validId);
    setSession(loadSession(validId));
  }, []);

  const activeConfig = configs.find((c) => c.id === activeId) ?? null;

  // ── Debounced persist ──────────────────────────────────────────────────────
  const persistSession = useCallback((s: JaapSession) => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => saveSession(s), 300);
  }, []);

  const handleSessionUpdate = useCallback(
    (updated: JaapSession) => {
      setSession(updated);
      persistSession(updated);
    },
    [persistSession],
  );

  // ── Milestone ──────────────────────────────────────────────────────────────
  const handleMilestone = useCallback(() => {
    setToastIter((prev) => {
      const next = prev + 1;
      setToastShow(true);
      if (toastTimer.current) clearTimeout(toastTimer.current);
      toastTimer.current = setTimeout(() => setToastShow(false), 3000);
      return next;
    });
  }, []);

  // ── Config changes ─────────────────────────────────────────────────────────
  const handleSelectConfig = useCallback((id: string) => {
    // Flush any pending save
    if (saveTimer.current) clearTimeout(saveTimer.current);
    setActiveId(id);
    saveActiveConfigId(id);
    setSession(loadSession(id));
  }, []);

  const handleSaveConfigs = useCallback((updated: JaapConfig[]) => {
    setConfigs(updated);
    saveConfigs(updated);
  }, []);

  const handleReset = useCallback(() => {
    if (!activeId) return;
    if (
      !confirm(
        "Reset this session? Your iteration count and progress will be cleared.",
      )
    )
      return;
    resetSession(activeId);
    setSession(loadSession(activeId));
  }, [activeId]);

  // ── Loading state ──────────────────────────────────────────────────────────
  if (!activeConfig || !session) {
    return (
      <div className="min-h-dvh flex items-center justify-center">
        <div
          className="devanagari text-2xl animate-pulse"
          style={{ color: "rgba(255,149,0,0.6)" }}
        >
          ॐ
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Decorative background */}
      <div className="bg-mandala" aria-hidden />
      <div className="grain-overlay" aria-hidden />
      {/* Colour blobs */}
      <div
        className="glow-blob"
        style={{
          width: 400,
          height: 400,
          top: "-10%",
          left: "-5%",
          background:
            "radial-gradient(circle, rgba(192,57,43,0.08) 0%, transparent 70%)",
        }}
        aria-hidden
      />
      <div
        className="glow-blob"
        style={{
          width: 500,
          height: 500,
          bottom: "-15%",
          right: "-10%",
          background:
            "radial-gradient(circle, rgba(255,149,0,0.07) 0%, transparent 70%)",
        }}
        aria-hidden
      />

      {/* ── Layout ──────────────────────────────────────────────────────── */}
      <div className="relative z-10 min-h-dvh flex flex-col">
        {/* Top nav */}
        <header
          className="flex items-center justify-between px-4 sm:px-8 py-4 border-b"
          style={{ borderColor: "rgba(255,149,0,0.08)" }}
        >
          <div className="flex items-center gap-3">
            <span
              className="devanagari text-2xl"
              style={{ color: "rgba(255,149,0,0.9)" }}
              aria-hidden
            >
              ॐ
            </span>
            <div>
              <h1
                className="font-display text-lg sm:text-xl font-light leading-none"
                style={{
                  color: "rgba(245,232,208,0.9)",
                  fontFamily: "'Cormorant Garamond', serif",
                }}
              >
                Naam Jaap
              </h1>
              <p
                className="devanagari text-xs"
                style={{ color: "rgba(245,232,208,0.35)" }}
              >
                नाम जाप
              </p>
            </div>
          </div>

          {/* Config button */}
          <button
            className="glass-card px-3 py-1.5 text-xs uppercase tracking-widest transition-all hover:bg-white/5"
            style={{
              color: "rgba(245,232,208,0.6)",
              letterSpacing: "0.15em",
            }}
            onClick={() => setModalOpen(true)}
            aria-label="Configure jaap"
          >
            ⚙ Config
          </button>
        </header>

        {/* Main content */}
        <main className="flex-1 flex items-start justify-center px-4 sm:px-8 py-6 sm:py-10">
          <div className="w-full max-w-4xl flex flex-col lg:flex-row gap-8 lg:gap-12 items-center lg:items-start justify-center">
            {/* Counter */}
            <div className="w-full flex justify-center">
              <JaapCounter
                config={activeConfig}
                session={session}
                onUpdate={handleSessionUpdate}
                onMilestone={handleMilestone}
              />
            </div>

            {/* Stats — below counter on mobile, sidebar on desktop */}
            <div className="w-full lg:w-72 xl:w-80 flex-shrink-0 flex flex-col">
              <JaapStats
                config={activeConfig}
                session={session}
                onReset={handleReset}
              />
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer
          className="text-center py-4 px-4 text-xs border-t"
          style={{
            borderColor: "rgba(255,149,0,0.06)",
            color: "rgba(245,232,208,0.2)",
          }}
        >
          <span className="devanagari">हरि ॐ</span>
          {" · "}
          Naam Jaap — Stored locally on your device
        </footer>
      </div>

      {/* ── Modals & Overlays ────────────────────────────────────────────── */}
      <ConfigModal
        isOpen={modalOpen}
        configs={configs}
        activeId={activeId}
        onSelect={handleSelectConfig}
        onSave={handleSaveConfigs}
        onClose={() => setModalOpen(false)}
      />

      <MilestoneToast
        show={toastShow}
        iterations={toastIter}
        mantra={activeConfig.name}
      />
    </>
  );
}
