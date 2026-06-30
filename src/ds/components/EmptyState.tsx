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
        gap: 4,
        padding: "40px 24px",
        background: tone === "card" ? colors.bg.card : colors.bg.surface,
        border: `1px solid ${colors.bg.border}`,
        borderRadius: radius.xl,
      }}
    >
      {icon && (
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: radius.md,
            background: colors.bg.base,
            border: `1px solid ${colors.bg.border}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 16,
            color: colors.text.muted,
          }}
        >
          {icon}
        </div>
      )}
      <p style={{ margin: 0, fontFamily: font.display, fontWeight: 800, fontSize: 16, lineHeight: "20px", color: colors.text.primary }}>{title}</p>
      {description && (
        <p style={{ margin: 0, fontFamily: font.body, fontWeight: 500, fontSize: 14, lineHeight: "20px", color: colors.text.muted, maxWidth: 320 }}>
          {description}
        </p>
      )}
      {action && <div style={{ display: "flex", gap: 8, marginTop: 16, flexWrap: "wrap", justifyContent: "center" }}>{action}</div>}
      {link && <div style={{ marginTop: 8 }}>{link}</div>}
    </div>
  );
}
