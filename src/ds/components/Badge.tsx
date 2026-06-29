import React from "react";
import { colors, font, radius } from "../tokens";

export type BadgeTone = "accent" | "brand" | "neutral" | "success" | "danger" | "gold";
export type BadgeVariant = "solid" | "soft" | "outline";
export type BadgeSize = "sm" | "md";

const TONE: Record<BadgeTone, { base: string; onSolid: string }> = {
  accent: { base: colors.accent.default, onSolid: colors.text.onAccent },
  brand: { base: colors.brand.primary, onSolid: "#ffffff" },
  neutral: { base: colors.text.secondary, onSolid: "#ffffff" },
  success: { base: colors.semantic.success, onSolid: colors.text.onAccent },
  danger: { base: colors.semantic.danger, onSolid: "#1a0606" },
  gold: { base: colors.semantic.gold, onSolid: "#090909" },
};

function hexA(hex: string, a: number) {
  const h = hex.replace("#", "");
  const n = parseInt(h.length === 3 ? h.split("").map((c) => c + c).join("") : h, 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
}

export interface BadgeProps {
  children?: React.ReactNode;
  tone?: BadgeTone;
  variant?: BadgeVariant;
  size?: BadgeSize;
  icon?: React.ReactNode;
  /** ponto colorido à esquerda (status) */
  dot?: boolean;
}

/** Badge/pílula (solid/soft/outline) nos tons do Canelada. */
export function Badge({ children, tone = "accent", variant = "soft", size = "md", icon, dot }: BadgeProps) {
  const t = TONE[tone];
  const sz = size === "sm" ? { fs: 11, py: 2, px: 8, gap: 4 } : { fs: 12, py: 4, px: 10, gap: 6 };
  let style: React.CSSProperties;
  if (variant === "solid") style = { background: t.base, color: t.onSolid, border: "none" };
  else if (variant === "outline") style = { background: "transparent", color: t.base, border: `1px solid ${hexA(t.base, 0.55)}` };
  else style = { background: hexA(t.base, 0.14), color: t.base, border: `1px solid ${hexA(t.base, 0.3)}` };

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: sz.gap,
        padding: `${sz.py}px ${sz.px}px`,
        borderRadius: radius.pill,
        fontFamily: font.display,
        fontWeight: 700,
        fontSize: sz.fs,
        lineHeight: "16px",
        whiteSpace: "nowrap",
        ...style,
      }}
    >
      {dot && <span style={{ width: 6, height: 6, borderRadius: "50%", background: variant === "solid" ? t.onSolid : t.base, flexShrink: 0 }} />}
      {icon}
      {children}
    </span>
  );
}
