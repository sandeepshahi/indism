// ── Types ────────────────────────────────────────────────────────────────────

export interface JaapConfig {
  id: string;
  name: string;          // Display name (can be Hindi/Sanskrit/English)
  mantra: string;        // The mantra text shown on the button
  target: number;        // Jaaps per mala (e.g. 108)
  color: string;         // Accent color key
}

export interface JaapSession {
  configId: string;
  count: number;          // Current count in this mala
  iterations: number;     // Completed malas
  totalCount: number;     // Grand total across all malas
  lastUpdated: number;    // timestamp
}

export type ColorKey = "saffron" | "gold" | "crimson" | "emerald" | "violet";

// ── Constants ────────────────────────────────────────────────────────────────

export const COLOR_MAP: Record<ColorKey, { primary: string; glow: string; ring: string }> = {
  saffron: {
    primary: "#FF9500",
    glow: "rgba(255,149,0,0.45)",
    ring: "rgba(255,149,0,0.3)",
  },
  gold: {
    primary: "#D4A017",
    glow: "rgba(212,160,23,0.45)",
    ring: "rgba(212,160,23,0.3)",
  },
  crimson: {
    primary: "#C0392B",
    glow: "rgba(192,57,43,0.45)",
    ring: "rgba(192,57,43,0.3)",
  },
  emerald: {
    primary: "#1A7A4A",
    glow: "rgba(26,122,74,0.45)",
    ring: "rgba(26,122,74,0.3)",
  },
  violet: {
    primary: "#6B3FA0",
    glow: "rgba(107,63,160,0.45)",
    ring: "rgba(107,63,160,0.3)",
  },
};

export const DEFAULT_CONFIGS: JaapConfig[] = [
  { id: "ram",     name: "श्री राम",   mantra: "राम राम",      target: 108, color: "saffron" },
  { id: "om",      name: "ॐ",          mantra: "ॐ नमः शिवाय", target: 108, color: "gold"    },
  { id: "hanuman", name: "हनुमान",     mantra: "जय हनुमान",   target: 108, color: "crimson" },
  { id: "krishna", name: "श्री कृष्ण", mantra: "हरे कृष्ण",   target: 108, color: "violet"  },
  { id: "durga",   name: "दुर्गा माँ", mantra: "जय माँ दुर्गा", target: 108, color: "emerald" },
];

// ── Storage helpers ──────────────────────────────────────────────────────────

const STORAGE_KEY_CONFIGS  = "nj_configs";
const STORAGE_KEY_SESSIONS = "nj_sessions";
const STORAGE_KEY_ACTIVE   = "nj_active_config";

function safeRead<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function safeWrite(key: string, value: unknown): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // storage quota — silently fail
  }
}

export function loadConfigs(): JaapConfig[] {
  return safeRead<JaapConfig[]>(STORAGE_KEY_CONFIGS, DEFAULT_CONFIGS);
}

export function saveConfigs(configs: JaapConfig[]): void {
  safeWrite(STORAGE_KEY_CONFIGS, configs);
}

export function loadSession(configId: string): JaapSession {
  const all = safeRead<Record<string, JaapSession>>(STORAGE_KEY_SESSIONS, {});
  return (
    all[configId] ?? {
      configId,
      count: 0,
      iterations: 0,
      totalCount: 0,
      lastUpdated: Date.now(),
    }
  );
}

export function saveSession(session: JaapSession): void {
  const all = safeRead<Record<string, JaapSession>>(STORAGE_KEY_SESSIONS, {});
  all[session.configId] = { ...session, lastUpdated: Date.now() };
  safeWrite(STORAGE_KEY_SESSIONS, all);
}

export function loadActiveConfigId(): string {
  return safeRead<string>(STORAGE_KEY_ACTIVE, DEFAULT_CONFIGS[0].id);
}

export function saveActiveConfigId(id: string): void {
  safeWrite(STORAGE_KEY_ACTIVE, id);
}

export function resetSession(configId: string): void {
  const all = safeRead<Record<string, JaapSession>>(STORAGE_KEY_SESSIONS, {});
  delete all[configId];
  safeWrite(STORAGE_KEY_SESSIONS, all);
}
