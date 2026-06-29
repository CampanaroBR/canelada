import React from "react";
import { colors, font, radius } from "../tokens";

export interface SlotProps {
  /** rótulo do espaço (ex.: "Conteúdo", "Ícone") */
  label?: string;
  width?: number | string;
  height?: number | string;
  children?: React.ReactNode;
}

/**
 * Slot — região de composição/placeholder.
 * Mostra um espaço tracejado quando vazio (útil pra montar layouts e empty states).
 */
export function Slot({ label = "slot", width = "100%", height = 44, children }: SlotProps) {
  if (children) return <>{children}</>;
  return (
    <div
      style={{
        width,
        height,
        borderRadius: radius.md,
        border: `1.5px dashed ${colors.bg.borderStrong}`,
        background: "rgba(255,255,255,0.02)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: font.body,
        fontWeight: 500,
        fontSize: 12,
        color: colors.text.muted,
      }}
    >
      {label}
    </div>
  );
}
