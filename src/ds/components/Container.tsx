import React from "react";
import { colors, font, radius } from "../tokens";

export interface ContainerProps {
  title?: string;
  /** elemento à direita do título (ex.: "Ver mais", botão) */
  action?: React.ReactNode;
  tone?: "surface" | "card" | "base";
  padding?: number;
  children: React.ReactNode;
}

const TONE_BG = { surface: colors.bg.surface, card: colors.bg.card, base: colors.bg.base };

/** Container/seção titulada (header + corpo). Base de seções de tela. */
export function Container({ title, action, tone = "surface", padding = 16, children }: ContainerProps) {
  return (
    <section
      style={{
        background: TONE_BG[tone],
        border: `1px solid ${colors.bg.border}`,
        borderRadius: radius.lg,
        padding,
        boxSizing: "border-box",
      }}
    >
      {(title || action) && (
        <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, marginBottom: 12 }}>
          {title && <h3 style={{ margin: 0, fontFamily: font.display, fontWeight: 800, fontSize: 16, lineHeight: "20px", color: colors.text.primary }}>{title}</h3>}
          {action}
        </header>
      )}
      {children}
    </section>
  );
}
