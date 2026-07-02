import React from "react";
import { font, radius, token } from "../tokens";

export interface ContainerProps {
  title?: string;
  /** elemento à direita do título (ex.: "Ver mais", botão) */
  action?: React.ReactNode;
  tone?: "surface" | "card" | "base";
  padding?: number;
  children: React.ReactNode;
}

const TONE_BG = {
  surface: token("bg-surface-primary-default"),
  card: token("bg-surface-secondary-default"),
  base: token("bg-base-default"),
};

/** Container/seção titulada (header + corpo). Base de seções de tela. */
export function Container({ title, action, tone = "surface", padding = 16, children }: ContainerProps) {
  return (
    <section
      style={{
        background: TONE_BG[tone],
        border: `1px solid ${token("border-primary-default")}`,
        borderRadius: radius.lg,
        padding,
        boxSizing: "border-box",
      }}
    >
      {(title || action) && (
        <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, marginBottom: 12 }}>
          {title && <h3 style={{ margin: 0, fontFamily: font.display, fontWeight: 800, fontSize: 16, lineHeight: "20px", color: token("text-primary-default") }}>{title}</h3>}
          {action}
        </header>
      )}
      {children}
    </section>
  );
}
