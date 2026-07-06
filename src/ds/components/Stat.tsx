import React from "react";
import { font, token } from "../tokens";

export interface StatProps {
  value: React.ReactNode;
  label: string;
  /** stacked = número em cima, label embaixo (grid) · inline = ícone + número + label lado a lado */
  direction?: "stacked" | "inline";
  /** só usado em direction="inline" */
  icon?: React.ReactNode;
  /** cor do valor — default = texto primário */
  color?: string;
}

/** Número + label (ex.: overall do jogador, contagem de badges). Duas formas reais: empilhada (grid) e em linha (com ícone). */
export function Stat({ value, label, direction = "stacked", icon, color }: StatProps) {
  if (direction === "inline") {
    return (
      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        {icon && <span style={{ flexShrink: 0, display: "flex" }}>{icon}</span>}
        <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 4 }}>
          <p style={{ margin: 0, fontFamily: font.display, fontWeight: 800, fontSize: 18, lineHeight: "22px", color: color ?? token("text-primary-default"), whiteSpace: "nowrap" }}>
            {value}
          </p>
          <p style={{ margin: 0, fontFamily: font.body, fontWeight: 600, fontSize: 14, lineHeight: "20px", color: token("text-tertiary-default"), whiteSpace: "nowrap" }}>
            {label}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ flex: "1 0 0", minWidth: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
      <span style={{ fontFamily: font.numeric, fontWeight: 700, fontSize: 22, color: color ?? token("text-primary-default"), fontVariantNumeric: "tabular-nums" }}>
        {value}
      </span>
      <span style={{ fontFamily: font.body, fontWeight: 600, fontSize: 10, lineHeight: "14px", color: token("text-tertiary-default"), textAlign: "center" }}>
        {label}
      </span>
    </div>
  );
}
