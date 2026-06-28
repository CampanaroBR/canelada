import type { CSSProperties } from "react";

/**
 * Bagre Design System — Tokens
 * Fonte da verdade: variáveis do Figma do Canelada (Primitives, Tokens [Dark/Light], Spacing, Radius, Motion)
 * + estilos de texto do Figma. Dark-first.
 */

// ── Primitives (escalas) ──────────────────────────────────────
export const primitives = {
  neutral: {
    white: "#ffffff",
    50: "#f5f5f5", 100: "#e5e5e5", 200: "#cccccc", 300: "#999999", 400: "#666666",
    500: "#424242", 600: "#2c2c2c", 700: "#242424", 800: "#1c1c1c", 850: "#171717",
    900: "#141414", 950: "#0a0e0e", 1000: "#090909",
  },
  teal: { 100: "#b3e8f0", 200: "#7dd6e5", 300: "#42bace", 400: "#1998ad", 500: "#147787", 600: "#176572", 700: "#0e4a54" },
  green: { 100: "#d6ffbc", 200: "#b8f592", 300: "#9fe870", 400: "#7ed44e", 500: "#5db82d" },
  gold: { 100: "#f5e0b0", 200: "#e5c073", 300: "#d4a843", 400: "#c5973a", 500: "#5f450f" },
  red: { 100: "#f5b3b3", 200: "#e56767", 300: "#d42020", 400: "#b51a1a", 500: "#5f0005" },
} as const;

// ── Temas (tokens semânticos resolvidos do Figma) ─────────────
export const theme = {
  dark: {
    brand: { primary: "#1998ad", primaryLight: "#42bace", primaryDark: "#176572", primaryGlow: "#147787" },
    accent: { default: "#9fe870", light: "#d6ffbc", strong: "#7ed44e" },
    bg: { base: "#090909", surface: "#0a0e0e", card: "#171717", elevated: "#1c1c1c", border: "#424242" },
    text: { primary: "#ffffff", secondary: "#999999", muted: "#7a7a7a", onAccent: "#ffffff", accent: "#9fe870", accentLight: "#d6ffbc" },
    semantic: { success: "#9fe870", successBg: "#5db82d", danger: "#d42020", dangerBg: "#5f0005", gold: "#c5973a", goldBg: "#5f450f" },
    character: { matador: "#1998ad", categoria: "#c5973a", paredao: "#d42020" },
  },
  light: {
    brand: { primary: "#1998ad", primaryLight: "#42bace", primaryDark: "#176572", primaryGlow: "#147787" },
    accent: { default: "#7ed44e", light: "#9fe870", strong: "#5db82d" },
    bg: { base: "#ffffff", surface: "#f5f5f5", card: "#e5e5e5", elevated: "#cccccc", border: "#999999" },
    text: { primary: "#090909", secondary: "#2c2c2c", muted: "#7a7a7a", onAccent: "#ffffff", accent: "#5db82d", accentLight: "#7ed44e" },
    semantic: { success: "#7ed44e", successBg: "#d6ffbc", danger: "#d42020", dangerBg: "#f5b3b3", gold: "#c5973a", goldBg: "#f5e0b0" },
    character: { matador: "#1998ad", categoria: "#c5973a", paredao: "#d42020" },
  },
} as const;

/**
 * Paleta de trabalho dos componentes (dark-first).
 * Espelha theme.dark, com 2 ajustes de contraste pro dark do Canelada:
 *  - text.onAccent = #090909 (texto escuro sobre o verde, como nas telas reais)
 *  - bordas: border = #2c2c2c (a mais usada nas telas) + borderStrong = #424242 (token bg/border)
 *  - *Bg semânticos como tint (rgba) p/ badges "soft"; versões sólidas ficam em theme.
 */
export const colors = {
  brand: theme.dark.brand,
  accent: theme.dark.accent,
  bg: {
    base: "#090909", surface: "#0a0e0e", card: "#171717", elevated: "#1c1c1c",
    border: "#2c2c2c", borderStrong: "#424242", borderSubtle: "#383838",
  },
  text: {
    primary: "#ffffff", secondary: "#999999", muted: "#7a7a7a",
    onAccent: "#090909", accent: "#9fe870", accentLight: "#d6ffbc",
  },
  semantic: {
    success: "#9fe870", successSolid: "#5db82d", successBg: "rgba(159,232,112,0.12)",
    danger: "#e56767", dangerSolid: "#d42020", dangerBg: "rgba(229,103,103,0.12)",
    gold: "#c5973a", goldSolid: "#d4a843", goldBg: "rgba(197,151,58,0.12)",
  },
  character: theme.dark.character,
} as const;

// ── Espaçamento / Raios / Motion ──────────────────────────────
export const space = { 1: 4, 2: 8, 3: 12, 4: 16, 5: 20, 6: 24, 8: 32, 10: 40, 12: 48 } as const;
export const radius = { sm: 8, md: 12, lg: 16, xl: 20, "2xl": 24, "3xl": 32, "4xl": 48, pill: 9999 } as const;

export const shadow = {
  sm: "0px 1px 2px rgba(0,0,0,0.20)",
  md: "0px 4px 4px rgba(0,0,0,0.25)",
  lg: "0px 12px 28px rgba(0,0,0,0.45)",
  sheet: "0px 2px 8px rgba(40,41,61,0.16), 0px 16px 24px rgba(96,97,112,0.16)",
  glow: "0px 0px 64px 6px rgba(226,196,133,0.45)",
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

// ── Tipografia (escala completa do Figma) ─────────────────────
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

/** Resolve um estilo de texto para CSSProperties. */
export function textStyle(name: TextStyle): CSSProperties {
  const t = text[name];
  return { ...t, fontFamily: t.fontFamily === "display" ? font.display : font.body } as CSSProperties;
}

export const tokens = { primitives, theme, colors, space, radius, shadow, motion, font, text } as const;
