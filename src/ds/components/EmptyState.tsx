import React from "react";
import { font, radius, token } from "../tokens";

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
        background: tone === "card" ? token("bg-surface-secondary-default") : token("bg-surface-primary-default"),
        border: `1px solid ${token("border-primary-default")}`,
        borderRadius: radius.xl,
      }}
    >
      {icon && (
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: radius.md,
            background: token("bg-base-default"),
            border: `1px solid ${token("border-primary-default")}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 16,
            color: token("text-tertiary-default"),
          }}
        >
          {icon}
        </div>
      )}
      <p style={{ margin: 0, fontFamily: font.display, fontWeight: 800, fontSize: 16, lineHeight: "20px", color: token("text-primary-default") }}>{title}</p>
      {description && (
        <p style={{ margin: 0, fontFamily: font.body, fontWeight: 500, fontSize: 14, lineHeight: "20px", color: token("text-tertiary-default"), maxWidth: 320 }}>
          {description}
        </p>
      )}
      {action && <div style={{ display: "flex", gap: 8, marginTop: 16, flexWrap: "wrap", justifyContent: "center" }}>{action}</div>}
      {link && <div style={{ marginTop: 8 }}>{link}</div>}
    </div>
  );
}
