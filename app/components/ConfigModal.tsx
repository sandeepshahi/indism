"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  COLOR_MAP,
  DEFAULT_CONFIGS,
  type ColorKey,
  type JaapConfig,
} from "../lib/jaap";

const COLOR_OPTIONS: ColorKey[] = ["saffron", "gold", "crimson", "emerald", "violet"];

const COLOR_LABELS: Record<ColorKey, string> = {
  saffron: "केसर",
  gold: "स्वर्ण",
  crimson: "लाल",
  emerald: "हरा",
  violet: "नीलम",
};

interface ConfigModalProps {
  isOpen: boolean;
  configs: JaapConfig[];
  activeId: string;
  onSelect: (id: string) => void;
  onSave: (configs: JaapConfig[]) => void;
  onClose: () => void;
}

function nanToDefault(val: number, def: number): number {
  return isNaN(val) || val <= 0 ? def : val;
}

export default function ConfigModal({
  isOpen,
  configs,
  activeId,
  onSelect,
  onSave,
  onClose,
}: ConfigModalProps) {
  const [mode, setMode] = useState<"list" | "edit" | "add">("list");
  const [editingConfig, setEditingConfig] = useState<JaapConfig | null>(null);
  const [form, setForm] = useState({
    name: "",
    mantra: "",
    target: "108",
    color: "saffron" as ColorKey,
  });
  const backdropRef = useRef<HTMLDivElement>(null);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (mode !== "list") setMode("list");
        else onClose();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, mode, onClose]);

  // Prevent scroll when open
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  const openAdd = useCallback(() => {
    setForm({ name: "", mantra: "", target: "108", color: "saffron" });
    setEditingConfig(null);
    setMode("add");
  }, []);

  const openEdit = useCallback((cfg: JaapConfig) => {
    setEditingConfig(cfg);
    setForm({
      name: cfg.name,
      mantra: cfg.mantra,
      target: String(cfg.target),
      color: cfg.color as ColorKey,
    });
    setMode("edit");
  }, []);

  const handleSave = useCallback(() => {
    const trimName = form.name.trim();
    const trimMantra = form.mantra.trim();
    if (!trimName) return;

    const target = nanToDefault(parseInt(form.target, 10), 108);

    if (mode === "add") {
      const newCfg: JaapConfig = {
        id: `custom_${Date.now()}`,
        name: trimName,
        mantra: trimMantra || trimName,
        target,
        color: form.color,
      };
      const updated = [...configs, newCfg];
      onSave(updated);
      onSelect(newCfg.id);
    } else if (mode === "edit" && editingConfig) {
      const updated = configs.map((c) =>
        c.id === editingConfig.id
          ? { ...c, name: trimName, mantra: trimMantra || trimName, target, color: form.color }
          : c
      );
      onSave(updated);
    }
    setMode("list");
  }, [mode, form, configs, editingConfig, onSave, onSelect]);

  const handleDelete = useCallback(
    (id: string) => {
      if (configs.length <= 1) return; // keep at least one
      const updated = configs.filter((c) => c.id !== id);
      onSave(updated);
      if (activeId === id) onSelect(updated[0].id);
    },
    [configs, activeId, onSave, onSelect]
  );

  const handleReset = useCallback(() => {
    onSave(DEFAULT_CONFIGS);
    onSelect(DEFAULT_CONFIGS[0].id);
    setMode("list");
  }, [onSave, onSelect]);

  if (!isOpen) return null;

  return (
    <div
      ref={backdropRef}
      className="modal-backdrop fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
      onClick={(e) => e.target === backdropRef.current && onClose()}
    >
      <div
        className="glass-card-strong w-full max-w-sm max-h-[85dvh] flex flex-col overflow-hidden"
        style={{ border: "1px solid rgba(255,149,0,0.2)" }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-4 border-b"
          style={{ borderColor: "rgba(255,149,0,0.1)" }}
        >
          <div className="flex items-center gap-2">
            {mode !== "list" && (
              <button
                onClick={() => setMode("list")}
                className="text-xs p-1 rounded-lg hover:bg-white/5 transition-colors"
                style={{ color: "rgba(245,232,208,0.5)" }}
                aria-label="Back"
              >
                ← 
              </button>
            )}
            <h3
              className="devanagari text-lg"
              style={{ color: "rgba(245,232,208,0.9)" }}
            >
              {mode === "list" ? "जाप चुनें" : mode === "add" ? "नया जाप" : "संपादन"}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/5 transition-colors text-lg"
            style={{ color: "rgba(245,232,208,0.5)" }}
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
          {mode === "list" && (
            <>
              {/* Config list */}
              {configs.map((cfg) => {
                const colors = COLOR_MAP[cfg.color as ColorKey] ?? COLOR_MAP.saffron;
                const isActive = cfg.id === activeId;
                return (
                  <div
                    key={cfg.id}
                    className="glass-card flex items-center gap-3 p-3 cursor-pointer hover:bg-white/5 transition-all duration-150 active:scale-98"
                    style={{
                      borderColor: isActive
                        ? `${colors.primary}55`
                        : "rgba(255,149,0,0.1)",
                      boxShadow: isActive ? `0 0 20px ${colors.ring}` : "none",
                    }}
                    onClick={() => { onSelect(cfg.id); onClose(); }}
                  >
                    {/* Color dot */}
                    <div
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ background: colors.primary, boxShadow: `0 0 8px ${colors.primary}` }}
                    />
                    {/* Labels */}
                    <div className="flex-1 min-w-0">
                      <p
                        className="devanagari text-base leading-tight truncate"
                        style={{ color: isActive ? colors.primary : "rgba(245,232,208,0.85)" }}
                      >
                        {cfg.name}
                      </p>
                      <p
                        className="devanagari text-xs truncate"
                        style={{ color: "rgba(245,232,208,0.35)" }}
                      >
                        {cfg.mantra} · {cfg.target}
                      </p>
                    </div>
                    {/* Actions */}
                    <div className="flex gap-1 flex-shrink-0">
                      <button
                        onClick={(e) => { e.stopPropagation(); openEdit(cfg); }}
                        className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-sm"
                        style={{ color: "rgba(245,232,208,0.4)" }}
                        aria-label={`Edit ${cfg.name}`}
                      >
                        ✎
                      </button>
                      {configs.length > 1 && (
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDelete(cfg.id); }}
                          className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-sm"
                          style={{ color: "rgba(192,57,43,0.5)" }}
                          aria-label={`Delete ${cfg.name}`}
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Add new + reset */}
              <button
                onClick={openAdd}
                className="glass-card w-full py-3 px-4 text-sm flex items-center justify-center gap-2 hover:bg-white/5 transition-all duration-150 active:scale-98"
                style={{ color: "rgba(255,149,0,0.8)", borderStyle: "dashed" }}
              >
                <span className="text-lg leading-none">+</span>
                <span>Add Custom Jaap</span>
              </button>

              <button
                onClick={handleReset}
                className="text-xs text-center w-full py-2"
                style={{ color: "rgba(245,232,208,0.25)" }}
              >
                Restore defaults
              </button>
            </>
          )}

          {(mode === "add" || mode === "edit") && (
            <div className="flex flex-col gap-4">
              {/* Name */}
              <div className="flex flex-col gap-1.5">
                <label
                  className="text-xs uppercase tracking-widest"
                  style={{ color: "rgba(245,232,208,0.45)", letterSpacing: "0.15em" }}
                >
                  देवता / Deity Name *
                </label>
                <input
                  className="jaap-input devanagari px-4 py-2.5 text-base w-full"
                  placeholder="e.g. श्री राम"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  autoFocus
                />
              </div>

              {/* Mantra */}
              <div className="flex flex-col gap-1.5">
                <label
                  className="text-xs uppercase tracking-widest"
                  style={{ color: "rgba(245,232,208,0.45)", letterSpacing: "0.15em" }}
                >
                  मंत्र / Mantra
                </label>
                <input
                  className="jaap-input devanagari px-4 py-2.5 text-base w-full"
                  placeholder="e.g. राम राम"
                  value={form.mantra}
                  onChange={(e) => setForm((f) => ({ ...f, mantra: e.target.value }))}
                />
              </div>

              {/* Target */}
              <div className="flex flex-col gap-1.5">
                <label
                  className="text-xs uppercase tracking-widest"
                  style={{ color: "rgba(245,232,208,0.45)", letterSpacing: "0.15em" }}
                >
                  Count per Mala
                </label>
                <div className="flex gap-2 flex-wrap">
                  {[27, 54, 108].map((n) => (
                    <button
                      key={n}
                      onClick={() => setForm((f) => ({ ...f, target: String(n) }))}
                      className="glass-card px-4 py-2 text-sm transition-all duration-150 hover:bg-white/5"
                      style={{
                        color: form.target === String(n) ? "#FF9500" : "rgba(245,232,208,0.5)",
                        borderColor:
                          form.target === String(n)
                            ? "rgba(255,149,0,0.5)"
                            : "rgba(255,149,0,0.1)",
                      }}
                    >
                      {n}
                    </button>
                  ))}
                  <input
                    className="jaap-input px-3 py-2 text-sm w-20"
                    type="number"
                    min="1"
                    max="10000"
                    placeholder="Custom"
                    value={[27, 54, 108].includes(Number(form.target)) ? "" : form.target}
                    onChange={(e) => setForm((f) => ({ ...f, target: e.target.value }))}
                  />
                </div>
              </div>

              {/* Color */}
              <div className="flex flex-col gap-1.5">
                <label
                  className="text-xs uppercase tracking-widest"
                  style={{ color: "rgba(245,232,208,0.45)", letterSpacing: "0.15em" }}
                >
                  रंग / Color
                </label>
                <div className="flex gap-2 flex-wrap">
                  {COLOR_OPTIONS.map((key) => {
                    const c = COLOR_MAP[key];
                    const isSelected = form.color === key;
                    return (
                      <button
                        key={key}
                        onClick={() => setForm((f) => ({ ...f, color: key }))}
                        className="flex items-center gap-2 glass-card px-3 py-1.5 text-xs transition-all duration-150 hover:bg-white/5"
                        style={{
                          borderColor: isSelected ? c.primary : "rgba(255,149,0,0.1)",
                          color: isSelected ? c.primary : "rgba(245,232,208,0.5)",
                        }}
                      >
                        <span
                          className="w-3 h-3 rounded-full inline-block"
                          style={{ background: c.primary }}
                        />
                        <span className="devanagari">{COLOR_LABELS[key]}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Save */}
              <button
                onClick={handleSave}
                disabled={!form.name.trim()}
                className="w-full py-3 rounded-xl text-sm font-medium transition-all duration-200 disabled:opacity-40 active:scale-98"
                style={{
                  background: "linear-gradient(135deg, rgba(255,149,0,0.3), rgba(212,160,23,0.2))",
                  border: "1px solid rgba(255,149,0,0.4)",
                  color: "#FFD580",
                }}
              >
                {mode === "add" ? "जोड़ें · Save" : "अपडेट करें · Update"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
