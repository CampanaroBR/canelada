import type { CSSProperties } from "react";

/**
 * Bagre Design System — Tokens
 * Arquitetura espelhada do Hive (primitivos → semânticos por papel), com a paleta do Canelada.
 * BRAND = verde (#9fe870). Teal é cor de apoio. Dark-first.
 */

// ── 1. Primitivos (escalas de cor) ────────────────────────────
export const primitives = {
  neutral: {
    0: "#ffffff",
    50: "#f5f5f5", 100: "#e5e5e5", 200: "#cccccc", 300: "#999999", 400: "#666666",
    500: "#424242", 600: "#2c2c2c", 700: "#242424", 800: "#1c1c1c", 850: "#171717",
    900: "#141414", 950: "#0a0e0e", 1000: "#090909",
  },
  brand: { 100: "#d6ffbc", 200: "#b8f592", 300: "#9fe870", 400: "#7ed44e", 500: "#5db82d" }, // verde
  teal: { 100: "#b3e8f0", 200: "#7dd6e5", 300: "#42bace", 400: "#1998ad", 500: "#147787", 600: "#176572", 700: "#0e4a54" },
  gold: { 100: "#f5e0b0", 200: "#e5c073", 300: "#d4a843", 400: "#c5973a", 500: "#5f450f" },
  red: { 100: "#f5b3b3", 200: "#e56767", 300: "#d42020", 400: "#b51a1a", 500: "#5f0005" },
  purple: { 200: "#c9b6fb", 300: "#a78bfa", 400: "#8b5cf6" },
} as const;

// ── 2. Tokens semânticos (por papel) — Dark/Light ─────────────
const p = primitives;
export const semantic = {
  dark: {
    content: {
      brand: p.brand[300], primary: p.neutral[0], secondary: p.neutral[300], tertiary: "#7a7a7a",
      inverse: p.neutral[1000], alwaysLight: p.neutral[0], alwaysDark: p.neutral[1000],
      onBrand: p.neutral[1000], onColor: p.neutral[0], disabled: p.neutral[500], link: p.brand[300],
    },
    background: {
      base: p.neutral[1000], primary: p.neutral[950], secondary: p.neutral[850], tertiary: p.neutral[800],
      brand: p.brand[300], brandLight: "rgba(159,232,112,0.14)", brandSubtle: "rgba(159,232,112,0.08)",
      inverse: p.neutral[0], alwaysLight: p.neutral[0], alwaysDark: p.neutral[1000],
      overlay: "rgba(0,0,0,0.60)", disabled: p.neutral[800],
    },
    border: {
      brand: p.brand[300], primary: p.neutral[600], secondary: p.neutral[500], tertiary: "#383838",
      subtle: p.neutral[800], inverse: p.neutral[0], focus: p.brand[300], disabled: p.neutral[600],
    },
    accent: {
      green: p.brand[300], greenLight: "rgba(159,232,112,0.14)",
      teal: p.teal[400], tealLight: "rgba(25,152,173,0.16)",
      gold: p.gold[400], goldLight: "rgba(197,151,58,0.16)",
      red: p.red[200], redLight: "rgba(229,103,103,0.16)",
      purple: p.purple[300], purpleLight: "rgba(167,139,250,0.16)",
    },
    alert: {
      success: p.brand[300], successLight: "rgba(159,232,112,0.12)", successSolid: p.brand[500],
      warning: p.gold[400], warningLight: "rgba(197,151,58,0.12)", warningSolid: p.gold[300],
      error: p.red[200], errorLight: "rgba(229,103,103,0.12)", errorSolid: p.red[300],
      info: p.teal[300], infoLight: "rgba(66,186,206,0.12)", infoSolid: p.teal[500],
    },
    action: {
      hoverOnLight: "rgba(0,0,0,0.05)", hoverOnDark: "rgba(255,255,255,0.06)", hoverOnColor: "rgba(255,255,255,0.12)",
      disabled: p.neutral[600], active: p.brand[400],
      focusRingBrand: p.brand[300], focusRingNeutral: p.neutral[300], focusRingError: p.red[300],
    },
  },
  light: {
    content: {
      brand: p.brand[500], primary: p.neutral[1000], secondary: p.neutral[600], tertiary: "#7a7a7a",
      inverse: p.neutral[0], alwaysLight: p.neutral[0], alwaysDark: p.neutral[1000],
      onBrand: p.neutral[1000], onColor: p.neutral[0], disabled: p.neutral[300], link: p.brand[500],
    },
    background: {
      base: p.neutral[0], primary: p.neutral[50], secondary: p.neutral[100], tertiary: p.neutral[200],
      brand: p.brand[400], brandLight: "rgba(126,212,78,0.16)", brandSubtle: "rgba(126,212,78,0.08)",
      inverse: p.neutral[1000], alwaysLight: p.neutral[0], alwaysDark: p.neutral[1000],
      overlay: "rgba(0,0,0,0.45)", disabled: p.neutral[100],
    },
    border: {
      brand: p.brand[400], primary: p.neutral[200], secondary: p.neutral[300], tertiary: p.neutral[200],
      subtle: p.neutral[100], inverse: p.neutral[1000], focus: p.brand[400], disabled: p.neutral[200],
    },
    accent: {
      green: p.brand[500], greenLight: "rgba(126,212,78,0.16)",
      teal: p.teal[400], tealLight: "rgba(25,152,173,0.14)",
      gold: p.gold[400], goldLight: "rgba(197,151,58,0.14)",
      red: p.red[300], redLight: "rgba(212,32,32,0.10)",
      purple: p.purple[400], purpleLight: "rgba(139,92,246,0.12)",
    },
    alert: {
      success: p.brand[500], successLight: "rgba(126,212,78,0.16)", successSolid: p.brand[500],
      warning: p.gold[400], warningLight: "rgba(197,151,58,0.16)", warningSolid: p.gold[400],
      error: p.red[300], errorLight: "rgba(212,32,32,0.10)", errorSolid: p.red[400],
      info: p.teal[400], infoLight: "rgba(25,152,173,0.12)", infoSolid: p.teal[500],
    },
    action: {
      hoverOnLight: "rgba(0,0,0,0.05)", hoverOnDark: "rgba(255,255,255,0.06)", hoverOnColor: "rgba(0,0,0,0.08)",
      disabled: p.neutral[200], active: p.brand[500],
      focusRingBrand: p.brand[400], focusRingNeutral: p.neutral[400], focusRingError: p.red[400],
    },
  },
} as const;

/** Paleta de trabalho (dark-first) — chaves curtas mapeadas dos semânticos. BRAND = verde. */
const D = semantic.dark;
export const colors = {
  brand: { primary: p.brand[300], primaryLight: p.brand[100], primaryDark: p.brand[500], primaryGlow: "rgba(159,232,112,0.30)" },
  accent: { default: p.brand[300], light: p.brand[100], strong: p.brand[400], teal: p.teal[400], gold: p.gold[400], red: p.red[200], purple: p.purple[300] },
  bg: {
    base: D.background.base, surface: D.background.primary, card: D.background.secondary, elevated: D.background.tertiary,
    border: D.border.primary, borderStrong: D.border.secondary, borderSubtle: D.border.tertiary,
  },
  text: {
    primary: D.content.primary, secondary: D.content.secondary, muted: D.content.tertiary,
    onAccent: D.content.onBrand, accent: D.content.brand, accentLight: p.brand[100],
  },
  semantic: {
    success: D.alert.success, successSolid: D.alert.successSolid, successBg: D.alert.successLight,
    danger: D.alert.error, dangerSolid: D.alert.errorSolid, dangerBg: D.alert.errorLight,
    gold: D.alert.warning, goldSolid: D.alert.warningSolid, goldBg: D.alert.warningLight,
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
  body: 'var(--font-body, "Google Sans", system-ui, sans-serif)',
  numeric: 'var(--font-numeric, "Google Sans", system-ui, sans-serif)',
} as const;

type RawText = { fontFamily: "display" | "body"; fontWeight: number; fontSize: number; lineHeight: string; letterSpacing?: string; textTransform?: "uppercase" };
/**
 * Escala tipográfica — nomenclatura do Hive (Display/Heading/Paragraph/Label/Overline, sizing L/M/S/XS),
 * com as fontes do Canelada: Display+Heading+Overline = Barlow; Paragraph+Label = Google Sans.
 */
export const text: Record<string, RawText> = {
  // Display — Barlow Black (números/heros)
  "display-l": { fontFamily: "display", fontWeight: 900, fontSize: 48, lineHeight: "52px", letterSpacing: "-1px" },
  "display-m": { fontFamily: "display", fontWeight: 900, fontSize: 36, lineHeight: "40px", letterSpacing: "-0.5px" },
  "display-s": { fontFamily: "display", fontWeight: 900, fontSize: 32, lineHeight: "36px" },
  "display-xs": { fontFamily: "display", fontWeight: 900, fontSize: 28, lineHeight: "32px" },
  // Heading — Barlow ExtraBold (títulos de tela/seção)
  "heading-h1": { fontFamily: "display", fontWeight: 800, fontSize: 28, lineHeight: "32px" },
  "heading-h2": { fontFamily: "display", fontWeight: 800, fontSize: 24, lineHeight: "28px" },
  "heading-h3": { fontFamily: "display", fontWeight: 800, fontSize: 20, lineHeight: "24px" },
  "heading-h4": { fontFamily: "display", fontWeight: 800, fontSize: 18, lineHeight: "22px" },
  "heading-h5": { fontFamily: "display", fontWeight: 800, fontSize: 16, lineHeight: "20px" },
  "heading-h6": { fontFamily: "display", fontWeight: 700, fontSize: 14, lineHeight: "18px" },
  // Paragraph — Google Sans Regular (texto corrido)
  "paragraph-l": { fontFamily: "body", fontWeight: 400, fontSize: 16, lineHeight: "24px" },
  "paragraph-m": { fontFamily: "body", fontWeight: 400, fontSize: 14, lineHeight: "20px" },
  "paragraph-s": { fontFamily: "body", fontWeight: 400, fontSize: 12, lineHeight: "16px" },
  "paragraph-xs": { fontFamily: "body", fontWeight: 400, fontSize: 10, lineHeight: "14px" },
  // Label — Google Sans SemiBold (rótulos de UI)
  "label-l": { fontFamily: "body", fontWeight: 600, fontSize: 16, lineHeight: "24px" },
  "label-m": { fontFamily: "body", fontWeight: 600, fontSize: 14, lineHeight: "20px" },
  "label-s": { fontFamily: "body", fontWeight: 600, fontSize: 12, lineHeight: "16px" },
  "label-xs": { fontFamily: "body", fontWeight: 600, fontSize: 10, lineHeight: "14px" },
  // Overline — Barlow ExtraBold caixa-alta (PRESENÇAS, OVERALL…)
  "overline-m": { fontFamily: "display", fontWeight: 800, fontSize: 11, lineHeight: "14px", letterSpacing: "0.5px", textTransform: "uppercase" },
  "overline-s": { fontFamily: "display", fontWeight: 800, fontSize: 10, lineHeight: "14px", letterSpacing: "1px", textTransform: "uppercase" },
};

export type TextStyle = keyof typeof text;
export function textStyle(name: TextStyle): CSSProperties {
  const t = text[name];
  return { ...t, fontFamily: t.fontFamily === "display" ? font.display : font.body } as CSSProperties;
}

export const tokens = { primitives, semantic, colors, space, radius, shadow, motion, font, text } as const;
