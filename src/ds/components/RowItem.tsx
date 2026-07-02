import React from "react";
import { font, token } from "../tokens";

export interface RowItemProps {
  icon?: React.ReactNode;
  label: string;
  sub?: string;
  /** elemento à direita (caret, toggle, valor, botão…) */
  trailing?: React.ReactNode;
  onClick?: () => void;
}

const Caret = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#7a7a7a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

/** Linha de lista (conta, membros, menu) — ícone + título/sub + trailing. */
export function RowItem({ icon, label, sub, trailing, onClick }: RowItemProps) {
  const interactive = !!onClick;
  return (
    <div
      onClick={onClick}
      role={interactive ? "button" : undefined}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "14px 16px",
        cursor: interactive ? "pointer" : "default",
        WebkitTapHighlightColor: "transparent",
      }}
    >
      {icon}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: font.body, fontWeight: 600, fontSize: 15, color: token("text-primary-default"), whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {label}
        </div>
        {sub && (
          <div style={{ fontFamily: font.body, fontWeight: 500, fontSize: 12, color: token("text-tertiary-default") }}>{sub}</div>
        )}
      </div>
      {trailing !== undefined ? trailing : interactive ? <Caret /> : null}
    </div>
  );
}
