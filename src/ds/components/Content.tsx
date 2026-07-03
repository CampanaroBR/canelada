import React from "react";
import { font, token } from "../tokens";

export interface ContentProps {
  /** elemento à esquerda: ícone, Avatar, Checkbox, Radio, Toggle… */
  leading?: React.ReactNode;
  label: string;
  /** Badge/Tag opcional ao lado do label */
  badge?: React.ReactNode;
  description?: string;
  /** elemento à direita (caret, valor, ação) */
  trailing?: React.ReactNode;
  onClick?: () => void;
  align?: "center" | "start";
}

/** Bloco de conteúdo: leading + (label + badge) + descrição + trailing. Base de listas, seleção e settings. */
export function Content({ leading, label, badge, description, trailing, onClick, align = "center" }: ContentProps) {
  const interactive = !!onClick;
  return (
    <div
      onClick={onClick}
      role={interactive ? "button" : undefined}
      style={{
        display: "flex",
        alignItems: align === "center" ? "center" : "flex-start",
        gap: 12,
        width: "100%",
        cursor: interactive ? "pointer" : "default",
        WebkitTapHighlightColor: "transparent",
      }}
    >
      {leading && <span style={{ flexShrink: 0, display: "inline-flex", marginTop: align === "start" ? 2 : 0 }}>{leading}</span>}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontFamily: font.body, fontWeight: 600, fontSize: 14, lineHeight: "20px", color: token("text-primary-default"), whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {label}
          </span>
          {badge}
        </div>
        {description && (
          <p style={{ margin: "2px 0 0", fontFamily: font.body, fontWeight: 400, fontSize: 12, lineHeight: "16px", color: token("text-tertiary-default") }}>
            {description}
          </p>
        )}
      </div>
      {trailing && <span style={{ flexShrink: 0, display: "inline-flex" }}>{trailing}</span>}
    </div>
  );
}
