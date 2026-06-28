import React from "react";
import { colors, font } from "../tokens";

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

/** Estado vazio — ícone + título + descrição + ação opcional (ex.: "Sem classificação ainda"). */
export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
        gap: 8,
        padding: "40px 24px",
        background: colors.bg.surface,
        border: `1px solid ${colors.bg.border}`,
        borderRadius: 20,
      }}
    >
      {icon && <div style={{ marginBottom: 4, opacity: 0.9 }}>{icon}</div>}
      <p style={{ margin: 0, fontFamily: font.display, fontWeight: 800, fontSize: 16, color: colors.text.primary }}>{title}</p>
      {description && (
        <p style={{ margin: 0, fontFamily: font.body, fontWeight: 500, fontSize: 13, lineHeight: "18px", color: colors.text.muted, maxWidth: 280 }}>
          {description}
        </p>
      )}
      {action && <div style={{ marginTop: 8 }}>{action}</div>}
    </div>
  );
}
