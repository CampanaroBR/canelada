import React from "react";
import { colors, font } from "../tokens";

export interface SeparatorProps {
  orientation?: "horizontal" | "vertical";
  /** rótulo no meio (só horizontal), ex.: "ou" */
  label?: string;
  spacing?: number;
}

/** Separador — linha que divide conteúdo; horizontal/vertical e com rótulo opcional. */
export function Separator({ orientation = "horizontal", label, spacing = 16 }: SeparatorProps) {
  if (orientation === "vertical") {
    return <div role="separator" aria-orientation="vertical" style={{ width: 1, alignSelf: "stretch", background: colors.bg.border, marginLeft: spacing, marginRight: spacing }} />;
  }
  if (label) {
    return (
      <div role="separator" style={{ display: "flex", alignItems: "center", gap: 12, margin: `${spacing}px 0` }}>
        <div style={{ flex: 1, height: 1, background: colors.bg.border }} />
        <span style={{ fontFamily: font.body, fontWeight: 500, fontSize: 12, color: colors.text.muted, whiteSpace: "nowrap" }}>{label}</span>
        <div style={{ flex: 1, height: 1, background: colors.bg.border }} />
      </div>
    );
  }
  return <div role="separator" style={{ height: 1, width: "100%", background: colors.bg.border, margin: `${spacing}px 0` }} />;
}
