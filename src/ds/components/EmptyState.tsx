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

/**
 * Estado vazio — anatomia shadcn/Empty: media (ícone em caixa com halo) + título +
 * descrição + content (ações) + link. Dark-first, ícone no verde da marca.
 */
export function EmptyState({ icon, title, description, action, link, tone = "surface" }: EmptyStateProps) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
        padding: "48px 24px",
        background: tone === "card" ? token("bg-surface-secondary-default") : token("bg-surface-primary-default"),
        border: `1px dashed ${token("border-secondary-default")}`,
        borderRadius: radius["2xl"],
      }}
    >
      {icon && (
        <div style={{ position: "relative", marginBottom: 18 }}>
          {/* halo suave atrás da caixa do ícone */}
          <div
            aria-hidden
            style={{
              position: "absolute", inset: -14, borderRadius: "50%",
              background: "radial-gradient(closest-side, rgba(159,232,112,0.10), transparent)",
              pointerEvents: "none",
            }}
          />
          <div
            style={{
              position: "relative",
              width: 52,
              height: 52,
              borderRadius: 14,
              background: token("bg-surface-tertiary-default"),
              border: `1px solid ${token("border-primary-default")}`,
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: token("icon-brand-default"),
            }}
          >
            {icon}
          </div>
        </div>
      )}
      <p style={{ margin: 0, fontFamily: font.display, fontWeight: 800, fontSize: 17, lineHeight: "22px", color: token("text-primary-default") }}>{title}</p>
      {description && (
        <p style={{ margin: "6px 0 0", fontFamily: font.body, fontWeight: 500, fontSize: 14, lineHeight: "21px", color: token("text-tertiary-default"), maxWidth: 300 }}>
          {description}
        </p>
      )}
      {action && <div style={{ display: "flex", gap: 8, marginTop: 20, flexWrap: "wrap", justifyContent: "center" }}>{action}</div>}
      {link && <div style={{ marginTop: 10 }}>{link}</div>}
    </div>
  );
}
