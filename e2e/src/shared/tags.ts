/** Enterprise tag taxonomy — single source of truth for all test annotations. */

export const Tag = {
  // ── Execution (set by fixtures, not manually) ──
  MOCK: "@mock",
  REAL: "@real",

  // ── Priority ──
  /** Minimal check that app works — run on every save. */
  SMOKE: "@smoke",
  /** Key business flow — run pre-commit. */
  CRITICAL: "@critical",
  /** Normal behavior coverage — run pre-merge. */
  REGRESSION: "@regression",

  // ── Domain ──
  AUTH: "@auth",
  DASHBOARD: "@dashboard",
  SERVICES: "@services",
  CLIENTS: "@clients",
  APPOINTMENTS: "@appointments",
  FINANCES: "@finances",
  SETTINGS: "@settings",
  NAVIGATION: "@navigation",

  // ── Scenario ──
  HAPPY_PATH: "@happy-path",
  EMPTY_STATE: "@empty-state",
  ERROR_STATE: "@error-state",
  EDGE_CASE: "@edge-case",
} as const;

export type Tag = (typeof Tag)[keyof typeof Tag];
