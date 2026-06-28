import React from "react";
import { colors, font, radius } from "../tokens";

export type TagTone = "neutral" | "success" | "danger" | "gold" | "new";

const TONES: Record<TagTone, { bg: string; fg: string; border?: string }> = {
  neutral: { bg: colors.bg.surface, fg: colors.text.secondary, border: colors.bg.border },
  success: { bg: colors.semantic.successBg, fg: colors.semantic.success, border: "rgba(159,232,112,0.3)" },
  danger: { bg: colors.semantic.dangerBg, fg: colors.semantic.danger, border: "rgba(229,103,103,0.3)" },
  gold: { bg: colors.semantic.goldBg, fg: colors.semantic.gold, border: "rgba(197,151,58,0.35)" },
  new: { bg: colors.accent.default, fg: colors.text.onAccent },
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
