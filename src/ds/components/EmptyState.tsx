import React from "react";
import { colors, font, radius } from "../tokens";

export interface EmptyStateProps {
  /** ícone (Phosphor regular) — renderizado dentro de um badge */
  icon?: React.ReactNode;
  title: string;
  description?: string;
  /** ações (ex.: 1–2 Buttons) */
  action?: React.ReactNode;
  /** link textual abaixo das ações */
  link?: React.ReactNode;
  tone?: "surface" | "card";
}

/** Estado vazio — badge de ícone + título + descrição + ações + link (adaptado do padrão Obra/shadcn). */
export function EmptyState({ icon, title, description, action, link, tone = "surface" }: EmptyStateProps) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
        gap: 6,
        padding: "40px 24px",
        background: tone === "card" ? colors.bg.card : colors.bg.surface,
        border: `1px solid ${colors.bg.border}`,
        borderRadius: radius.xl,
      }}
    >
      {icon && (
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: radius.lg,
            background: colors.bg.base,
            border: `1px solid ${colors.bg.border}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 10,
            color: colors.text.muted,
          }}
        >
          {icon}
        </div>
      )}
      <p style={{ margin: 0, fontFamily: font.display, fontWeight: 800, fontSize: 16, lineHeight: "20px", color: colors.text.primary }}>{title}</p>
      {description && (
        <p style={{ margin: 0, fontFamily: font.body, fontWeight: 500, fontSize: 13, lineHeight: "18px", color: colors.text.muted, maxWidth: 300 }}>
          {description}
        </p>
      )}
      {action && <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap", justifyContent: "center" }}>{action}</div>}
      {link && <div style={{ marginTop: 6 }}>{link}</div>}
    </div>
  );
}
