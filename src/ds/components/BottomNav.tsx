import React from "react";
import { font, radius, token } from "../tokens";

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
        gap: 6,
        background: "rgba(28,28,30,0.5)",
        border: "1px solid rgba(255,255,255,0.14)",
        borderRadius: 28,
        padding: "5px 10px",
        backdropFilter: "blur(44px) saturate(200%) brightness(1.12)",
        WebkitBackdropFilter: "blur(44px) saturate(200%) brightness(1.12)",
        boxShadow: "0 8px 40px rgba(0,0,0,0.5), inset 0 1.5px 0 rgba(255,255,255,0.25)",
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
              padding: active ? "4px 10px" : 5,
              minWidth: 48,
              borderRadius: active ? radius.pill : 12,
              background: active ? token("accent-green-default") : "transparent",
              border: "none",
              cursor: "pointer",
              color: active ? token("text-on-fill-default") : token("text-primary-default"),
              WebkitTapHighlightColor: "transparent",
            }}
          >
            <span style={{ display: "inline-flex", lineHeight: 0, color: active ? token("text-on-fill-default") : token("text-primary-default") }}>{it.icon}</span>
            <span style={{ fontFamily: font.display, fontWeight: 800, fontSize: 9.5, lineHeight: "13px" }}>{it.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
