import React from "react";
import { colors, font, radius } from "../tokens";

export interface NavItem {
  value: string;
  label: string;
  icon: React.ReactNode;
}

export interface BottomNavProps {
  items: NavItem[];
  value: string;
  onChange?: (value: string) => void;
}

/** Navegação inferior do Canelada — pílula flutuante; item ativo vira pílula verde. */
export function BottomNav({ items, value, onChange }: BottomNavProps) {
  return (
    <nav
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 12,
        background: "rgba(0,0,0,0.6)",
        border: `1px solid #393939`,
        borderRadius: radius["3xl"],
        padding: "8px 8px",
        backdropFilter: "blur(8px)",
      }}
    >
      {items.map((it) => {
        const active = it.value === value;
        return (
          <button
            key={it.value}
            onClick={() => onChange?.(it.value)}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 2,
              padding: active ? "4px 12px" : 8,
              minWidth: 56,
              borderRadius: active ? radius.pill : 12,
              background: active ? colors.accent.default : "transparent",
              border: "none",
              cursor: "pointer",
              color: active ? colors.text.onAccent : colors.text.primary,
              WebkitTapHighlightColor: "transparent",
            }}
          >
            <span style={{ display: "inline-flex", lineHeight: 0, color: active ? colors.text.onAccent : colors.text.primary }}>{it.icon}</span>
            <span style={{ fontFamily: font.display, fontWeight: 800, fontSize: 10, lineHeight: "14px" }}>{it.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
