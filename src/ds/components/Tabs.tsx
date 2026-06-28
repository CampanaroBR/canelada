import React from "react";
import { colors, font, radius, motion } from "../tokens";

export interface TabItem {
  value: string;
  label: string;
}

export interface TabsProps {
  items: TabItem[];
  value: string;
  onChange: (value: string) => void;
  /** fill = pílulas dividindo a largura igualmente · scroll = roláveis */
  layout?: "fill" | "scroll";
}

/** Pílulas de filtro/segmento (ex.: Semanal/Mensal, filtros de badges). */
export function Tabs({ items, value, onChange, layout = "scroll" }: TabsProps) {
  return (
    <div style={{ display: "flex", gap: 8, overflowX: layout === "scroll" ? "auto" : "visible" }}>
      {items.map((it) => {
        const active = it.value === value;
        return (
          <button
            key={it.value}
            onClick={() => onChange(it.value)}
            style={{
              flex: layout === "fill" ? 1 : "0 0 auto",
              background: active ? colors.accent.default : colors.bg.surface,
              border: active ? "none" : `1px solid ${colors.bg.border}`,
              borderRadius: radius.pill,
              padding: "8px 14px",
              fontFamily: font.display,
              fontWeight: active ? 700 : 600,
              fontSize: 13,
              lineHeight: "18px",
              color: active ? colors.text.onAccent : colors.text.secondary,
              cursor: "pointer",
              whiteSpace: "nowrap",
              transition: `background ${motion.duration.fast}ms ${motion.ease.out}`,
              WebkitTapHighlightColor: "transparent",
            }}
          >
            {it.label}
          </button>
        );
      })}
    </div>
  );
}
