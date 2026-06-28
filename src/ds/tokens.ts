import type { CSSProperties } from "react";

/**
 * Bagre Design System — Tokens
 * Arquitetura inspirada no Hive (primitivos → semânticos por papel), com a paleta do Canelada.
 * BRAND = verde (#9fe870). Teal é cor de apoio (logo/personagem). Dark-first.
 */

// ── 1. Primitivos (escalas de cor) ────────────────────────────
export const primitives = {
  neutral: {
    0: "#ffffff",
    50: "#f5f5f5", 100: "#e5e5e5", 200: "#cccccc", 300: "#999999", 400: "#666666",
    500: "#424242", 600: "#2c2c2c", 700: "#242424", 800: "#1c1c1c", 850: "#171717",
    900: "#141414", 950: "#0a0e0e", 1000: "#090909",
  },
  // brand = verde
  brand: { 100: "#d6ffbc", 200: "#b8f592", 300: "#9fe870", 400: "#7ed44e", 500: "#5db82d" },
  teal: { 100: "#b3e8f0", 200: "#7dd6e5", 300: "#42bace", 400: "#1998ad", 500: "#147787", 600: "#176572", 700: "#0e4a54" },
  gold: { 100: "#f5e0b0", 200: "#e5c073", 300: "#d4a843", 400: "#c5973a", 500: "#5f450f" },
  red: { 100: "#f5b3b3", 200: "#e56767", 300: "#d42020", 400: "#b51a1a", 500: "#5f0005" },
  purple: { 200: "#c9b6fb", 300: "#a78bfa", 400: "#8b5cf6" },
} as const;

// ── 2. Tokens semânticos (por papel, à la Hive) — Dark/Light ──
const p = primitives;
export const semantic = {
  dark: {
    content: { brand: p.brand[300], primary: p.neutral[0], secondary: p.neutral[300], tertiary: "#7a7a7a", inverse: p.neutral[1000], onBrand: p.neutral[1000], onColor: p.neutral[1000] },
    background: { base: p.neutral[1000], primary: p.neutral[950], secondary: p.neutral[850], tertiary: p.neutral[800], brand: p.brand[300], brandSubtle: "rgba(159,232,112,0.12)", inverse: p.neutral[0] },
    border: { brand: p.brand[300], primary: p.neutral[600], secondary: p.neutral[500], subtle: "#383838", inverse: p.neutral[0] },
    accent: { green: p.brand[300], teal: p.teal[400], gold: p.gold[400], red: p.red[200], purple: p.purple[300] },
    alert: {
      success: p.brand[300], successSubtle: "rgba(159,232,112,0.12)",
      warning: p.gold[400], warningSubtle: "rgba(197,151,58,0.12)",
      error: p.red[200], errorSubtle: "rgba(229,103,103,0.12)",
      info: p.teal[300], infoSubtle: "rgba(66,186,206,0.12)",
    },
    action: { hover: "rgba(255,255,255,0.06)", disabled: p.neutral[600], active: p.brand[400], focusRing: p.brand[300] },
  },
  light: {
    content: { brand: p.brand[500], primary: p.neutral[1000], secondary: p.neutral[600], tertiary: "#7a7a7a", inverse: p.neutral[0], onBrand: p.neutral[1000], onColor: p.neutral[0] },
    background: { base: p.neutral[0], primary: p.neutral[50], secondary: p.neutral[100], tertiary: p.neutral[200], brand: p.brand[400], brandSubtle: "rgba(126,212,78,0.14)", inverse: p.neutral[1000] },
    border: { brand: p.brand[400], primary: p.neutral[200], secondary: p.neutral[300], subtle: p.neutral[200], inverse: p.neutral[1000] },
    accent: { green: p.brand[500], teal: p.teal[400], gold: p.gold[400], red: p.red[300], purple: p.purple[400] },
    alert: {
      success: p.brand[500], successSubtle: "rgba(126,212,78,0.14)",
      warning: p.gold[400], warningSubtle: "rgba(197,151,58,0.14)",
      error: p.red[300], errorSubtle: "rgba(212,32,32,0.10)",
      info: p.teal[400], infoSubtle: "rgba(25,152,173,0.12)",
    },
    action: { hover: "rgba(0,0,0,0.05)", disabled: p.neutral[200], active: p.brand[500], focusRing: p.brand[400] },
  },
} as const;

/**
 * Paleta de trabalho dos componentes (dark-first). Mapeia os tokens semânticos
 * para chaves curtas usadas no código. BRAND = verde.
 */
const D = semantic.dark;
export const colors = {
  brand: { primary: p.brand[300], primaryLight: p.brand[100], primaryDark: p.brand[500], primaryGlow: "rgba(159,232,112,0.30)" },
  accent: { default: p.brand[300], light: p.brand[100], strong: p.brand[400], teal: p.teal[400], purple: p.purple[300] },
  bg: {
    base: D.background.base, surface: D.background.primary, card: D.background.secondary, elevated: D.background.tertiary,
    border: D.border.primary, borderStrong: D.border.secondary, borderSubtle: D.border.subtle,
  },
  text: {
    primary: D.content.primary, secondary: D.content.secondary, muted: D.content.tertiary,
    onAccent: D.content.onBrand, accent: D.content.brand, accentLight: p.brand[100],
  },
  semantic: {
    success: D.alert.success, successSolid: p.brand[500], successBg: D.alert.successSubtle,
    danger: D.alert.error, dangerSolid: p.red[300], dangerBg: D.alert.errorSubtle,
    gold: D.alert.warning, goldSolid: p.gold[300], goldBg: D.alert.warningSubtle,
  },
  character: { matador: p.teal[400], categoria: p.gold[400], paredao: p.red[300] },
} as const;

// ── 3. Espaço / Raios / Sombras / Motion ──────────────────────
export const space = { 1: 4, 2: 8, 3: 12, 4: 16, 5: 20, 6: 24, 8: 32, 10: 40, 12: 48 } as const;
export const radius = { sm: 8, md: 12, lg: 16, xl: 20, "2xl": 24, "3xl": 32, "4xl": 48, pill: 9999 } as const;
export const shadow = {
  sm: "0px 1px 2px rgba(0,0,0,0.20)",
  md: "0px 4px 4px rgba(0,0,0,0.25)",
  lg: "0px 12px 28px rgba(0,0,0,0.45)",
  sheet: "0px 2px 8px rgba(40,41,61,0.16), 0px 16px 24px rgba(96,97,112,0.16)",
  glow: "0px 0px 64px 6px rgba(159,232,112,0.35)",
} as const;
export const motion = {
  ease: {
    out: "cubic-bezier(0.23, 1, 0.32, 1)",
    inOut: "cubic-bezier(0.77, 0, 0.175, 1)",
    drawer: "cubic-bezier(0.32, 0.72, 0, 1)",
    spring: "cubic-bezier(0.34, 1.56, 0.64, 1)",
  },
  duration: { fast: 150, base: 250, slow: 380 },
} as const;

// ── 4. Tipografia (escala completa do Figma) ──────────────────
export const font = {
  display: 'var(--font-display, "Barlow", system-ui, sans-serif)',
  body: 'var(--font-body, "Inter", system-ui, sans-serif)',
} as const;

type RawText = { fontFamily: "display" | "body"; fontWeight: number; fontSize: number; lineHeight: string; letterSpacing?: string };
export const text: Record<string, RawText> = {
  "display-hero": { fontFamily: "display", fontWeight: 900, fontSize: 48, lineHeight: "48px" },
  "display-h1": { fontFamily: "display", fontWeight: 900, fontSize: 32, lineHeight: "36px" },
  "display-h2": { fontFamily: "display", fontWeight: 900, fontSize: 28, lineHeight: "32px" },
  "title-lg": { fontFamily: "display", fontWeight: 800, fontSize: 18, lineHeight: "22px" },
  "title-player": { fontFamily: "display", fontWeight: 600, fontSize: 18, lineHeight: "22px" },
  "title-md": { fontFamily: "display", fontWeight: 700, fontSize: 16, lineHeight: "20px" },
  "heading-section": { fontFamily: "display", fontWeight: 800, fontSize: 16, lineHeight: "20px" },
  "stat-lg": { fontFamily: "display", fontWeight: 800, fontSize: 19, lineHeight: "22px" },
  "label-lg": { fontFamily: "display", fontWeight: 800, fontSize: 12, lineHeight: "16px" },
  "label-md": { fontFamily: "display", fontWeight: 700, fontSize: 12, lineHeight: "16px" },
  "label-sm": { fontFamily: "display", fontWeight: 600, fontSize: 12, lineHeight: "16px" },
  "overline-lg": { fontFamily: "display", fontWeight: 800, fontSize: 11, lineHeight: "14px", letterSpacing: "0.5px" },
  "overline-sm": { fontFamily: "display", fontWeight: 800, fontSize: 10, lineHeight: "14px", letterSpacing: "1px" },
  "body-xl": { fontFamily: "body", fontWeight: 400, fontSize: 25, lineHeight: "32px" },
  "body-lg": { fontFamily: "body", fontWeight: 400, fontSize: 16, lineHeight: "22px" },
  "body-md": { fontFamily: "body", fontWeight: 500, fontSize: 16, lineHeight: "22px" },
  "body-base": { fontFamily: "body", fontWeight: 400, fontSize: 14, lineHeight: "18px" },
  "label": { fontFamily: "body", fontWeight: 600, fontSize: 14, lineHeight: "20px" },
  "caption": { fontFamily: "body", fontWeight: 500, fontSize: 12, lineHeight: "16px" },
  "caption-strong": { fontFamily: "body", fontWeight: 600, fontSize: 12, lineHeight: "16px" },
  "overline": { fontFamily: "body", fontWeight: 600, fontSize: 10, lineHeight: "14px", letterSpacing: "1px" },
};

export type TextStyle = keyof typeof text;
export function textStyle(name: TextStyle): CSSProperties {
  const t = text[name];
  return { ...t, fontFamily: t.fontFamily === "display" ? font.display : font.body } as CSSProperties;
}

export const tokens = { primitives, semantic, colors, space, radius, shadow, motion, font, text } as const;
