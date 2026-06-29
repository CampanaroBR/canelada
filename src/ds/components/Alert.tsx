import React from "react";
import { colors, font, radius } from "../tokens";

export type AlertTone = "info" | "success" | "warning" | "danger";

const TONE: Record<AlertTone, { base: string; bg: string; icon: string }> = {
  info: { base: colors.brand.primaryLight, bg: "rgba(66,186,206,0.10)", icon: "ℹ" },
  success: { base: colors.semantic.success, bg: colors.semantic.successBg, icon: "✓" },
  warning: { base: colors.semantic.gold, bg: colors.semantic.goldBg, icon: "!" },
  danger: { base: colors.semantic.danger, bg: colors.semantic.dangerBg, icon: "!" },
};

export interface AlertProps {
  tone?: AlertTone;
  title?: string;
  children?: React.ReactNode;
  onClose?: () => void;
  icon?: React.ReactNode;
}

/** Alerta/notificação nos tons semânticos do Canelada. */
export function Alert({ tone = "info", title, children, onClose, icon }: AlertProps) {
  const t = TONE[tone];
  return (
    <div
      role="alert"
      style={{
        display: "flex",
        gap: 12,
        alignItems: "flex-start",
        background: t.bg,
        border: `1px solid ${t.base}40`,
        borderRadius: radius.lg,
        padding: "12px 14px",
        width: "100%",
        boxSizing: "border-box",
      }}
    >
      <div style={{ width: 22, height: 22, borderRadius: "50%", background: t.base, color: "#0a0e0e", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: font.display, fontWeight: 800, fontSize: 13 }}>
        {icon ?? t.icon}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        {title && <p style={{ margin: 0, fontFamily: font.display, fontWeight: 700, fontSize: 14, lineHeight: "18px", color: colors.text.primary }}>{title}</p>}
        {children && <p style={{ margin: title ? "2px 0 0" : 0, fontFamily: font.body, fontWeight: 500, fontSize: 13, lineHeight: "18px", color: colors.text.secondary }}>{children}</p>}
      </div>
      {onClose && (
        <button onClick={onClose} aria-label="Fechar" style={{ background: "none", border: "none", cursor: "pointer", color: colors.text.muted, fontSize: 18, lineHeight: 1, flexShrink: 0, padding: 0 }}>
          ×
        </button>
      )}
    </div>
  );
}
