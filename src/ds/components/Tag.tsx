import React from "react";
import { colors, font, radius, token } from "../tokens";

export type TagTone = "neutral" | "success" | "danger" | "gold" | "new";

const TONES: Record<TagTone, { bg: string; fg: string; border?: string }> = {
  neutral: { bg: token("bg-surface-primary-default"), fg: token("text-secondary-default"), border: token("border-primary-default") },
  success: { bg: colors.semantic.successBg, fg: token("accent-green-default"), border: "rgba(159,232,112,0.3)" },
  danger: { bg: colors.semantic.dangerBg, fg: token("accent-red-default"), border: "rgba(229,103,103,0.3)" },
  gold: { bg: colors.semantic.goldBg, fg: token("accent-gold-default"), border: "rgba(197,151,58,0.35)" },
  new: { bg: token("bg-fill-primary-default"), fg: token("text-on-fill-default") },
};

/** Chip/etiqueta — status, raridade, "NOVO". */
export function Tag({ children, tone = "neutral", dot }: { children: React.ReactNode; tone?: TagTone; dot?: string }) {
  const t = TONES[tone];
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        background: t.bg,
        color: t.fg,
        border: t.border ? `1px solid ${t.border}` : "none",
        borderRadius: radius.pill,
        padding: "4px 10px",
        fontFamily: font.display,
        fontWeight: 700,
        fontSize: 12,
        lineHeight: "16px",
        whiteSpace: "nowrap",
      }}
    >
      {dot && <span style={{ width: 6, height: 6, borderRadius: "50%", background: dot, flexShrink: 0 }} />}
      {children}
    </span>
  );
}
