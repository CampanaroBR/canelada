import type { CSSProperties } from "react";

/**
 * Bagre Design System — Tokens
 * Fonte da verdade: variáveis do Figma do Canelada (coleções Primitives, Tokens, Spacing, Radius, Motion).
 * Tema padrão: Dark (o Canelada é dark-first).
 */

// ── Primitives ────────────────────────────────────────────────
export const primitives = {
  neutral: {
    white: "#ffffff",
    50: "#f5f5f5",
    100: "#e5e5e5",
    200: "#cccccc",
    300: "#999999",
    400: "#666666",
    500: "#424242",
    600: "#2c2c2c",
    700: "#242424",
    800: "#1c1c1c",
    850: "#171717",
    900: "#141414",
    950: "#0a0e0e",
    1000: "#090909",
  },
  teal: { 100: "#b3e8f0", 200: "#7dd6e5", 300: "#42bace", 400: "#1998ad", 500: "#147787", 600: "#176572", 700: "#0e4a54" },
  green: { 100: "#d6ffbc", 200: "#b8f592", 300: "#9fe870", 400: "#7ed44e", 500: "#5db82d" },
  gold: { 100: "#f5e0b0", 200: "#e5c073", 300: "#d4a843", 400: "#c5973a", 500: "#5f450f" },
  red: { 100: "#f5b3b3", 200: "#e56767", 300: "#d42020", 400: "#b51a1a", 500: "#5f0005" },
} as const;

// ── Tokens semânticos (tema Dark) ─────────────────────────────
export const colors = {
  brand: {
    primary: primitives.teal[400],
    primaryLight: primitives.teal[300],
    primaryDark: primitives.teal[700],
    primaryGlow: "rgba(25,152,173,0.35)",
  },
  accent: {
    default: primitives.green[300], // #9fe870
    light: primitives.green[200],
    strong: primitives.green[400],
  },
  bg: {
    base: primitives.neutral[1000], // #090909
    surface: primitives.neutral[950], // #0a0e0e
    card: primitives.neutral[850], // #171717
    elevated: primitives.neutral[800], // #1c1c1c
    border: primitives.neutral[600], // #2c2c2c
    borderStrong: primitives.neutral[500], // #424242
    borderSubtle: "#383838",
  },
  text: {
    primary: primitives.neutral.white,
    secondary: primitives.neutral[300], // #999
    muted: "#7a7a7a",
    onAccent: primitives.neutral[1000], // texto escuro sobre verde
    accent: primitives.green[300],
    accentLight: primitives.green[200],
  },
  semantic: {
    success: primitives.green[300],
    successBg: "rgba(159,232,112,0.08)",
    danger: primitives.red[200], // #e56767
    dangerBg: "rgba(229,103,103,0.10)",
    gold: primitives.gold[400],
    goldBg: "rgba(197,151,58,0.10)",
  },
} as const;

// ── Espaçamento ───────────────────────────────────────────────
export const space = { 1: 4, 2: 8, 3: 12, 4: 16, 5: 20, 6: 24, 8: 32, 10: 40, 12: 48 } as const;

// ── Raios ─────────────────────────────────────────────────────
export const radius = { sm: 8, md: 12, lg: 16, xl: 20, "2xl": 24, "3xl": 32, "4xl": 48, pill: 9999 } as const;

// ── Movimento ─────────────────────────────────────────────────
export const motion = {
  ease: {
    out: "cubic-bezier(0.23, 1, 0.32, 1)",
    inOut: "cubic-bezier(0.77, 0, 0.175, 1)",
    drawer: "cubic-bezier(0.32, 0.72, 0, 1)",
    spring: "cubic-bezier(0.34, 1.56, 0.64, 1)",
  },
  duration: { fast: 150, base: 250, slow: 380 },
} as const;

// ── Tipografia ────────────────────────────────────────────────
// Display = Barlow, Body = Inter. (No app via var(--font-display)/var(--font-body).)
export const font = {
  display: 'var(--font-display, "Barlow", system-ui, sans-serif)',
  body: 'var(--font-body, "Inter", system-ui, sans-serif)',
} as const;

export const text = {
  // Display (Barlow)
  "display-h1": { fontFamily: "display", fontWeight: 900, fontSize: 32, lineHeight: "32px" },
  "display-h2": { fontFamily: "display", fontWeight: 900, fontSize: 28, lineHeight: "32px" },
  "title-lg": { fontFamily: "display", fontWeight: 800, fontSize: 18, lineHeight: "22px" },
  "title-md": { fontFamily: "display", fontWeight: 700, fontSize: 16, lineHeight: "20px" },
  "heading-section": { fontFamily: "display", fontWeight: 800, fontSize: 16, lineHeight: "20px" },
  "label-sm": { fontFamily: "display", fontWeight: 600, fontSize: 12, lineHeight: "16px" },
  "overline": { fontFamily: "display", fontWeight: 600, fontSize: 10, lineHeight: "14px", letterSpacing: "1px" },
  // Body (Inter)
  "body-lg": { fontFamily: "body", fontWeight: 500, fontSize: 16, lineHeight: "22px" },
  "body-base": { fontFamily: "body", fontWeight: 400, fontSize: 14, lineHeight: "18px" },
  "label": { fontFamily: "body", fontWeight: 600, fontSize: 14, lineHeight: "20px" },
  "caption": { fontFamily: "body", fontWeight: 500, fontSize: 12, lineHeight: "16px" },
} as const;

export type TextStyle = keyof typeof text;

/** Resolve um estilo de texto para CSSProperties. */
export function textStyle(name: TextStyle): CSSProperties {
  const t = text[name] as Record<string, unknown>;
  const fam = t.fontFamily === "display" ? font.display : font.body;
  return { ...t, fontFamily: fam } as CSSProperties;
}

export const tokens = { primitives, colors, space, radius, motion, font, text } as const;
