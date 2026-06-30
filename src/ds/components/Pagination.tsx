import React from "react";
import { colors, font, radius } from "../tokens";

export interface PaginationProps {
  page: number; // 1-based
  total: number; // total de páginas
  onChange?: (page: number) => void;
  /** quantos vizinhos mostrar ao redor da página atual */
  siblings?: number;
}

function range(a: number, b: number) {
  return Array.from({ length: b - a + 1 }, (_, i) => a + i);
}

/** Lista de páginas com Previous/Next, números e reticências. */
export function Pagination({ page, total, onChange, siblings = 1 }: PaginationProps) {
  const items: (number | "…")[] = [];
  const left = Math.max(2, page - siblings);
  const right = Math.min(total - 1, page + siblings);
  items.push(1);
  if (left > 2) items.push("…");
  range(left, right).forEach((p) => items.push(p));
  if (right < total - 1) items.push("…");
  if (total > 1) items.push(total);

  const navBtn = (label: string, to: number, disabled: boolean) => (
    <button
      onClick={() => !disabled && onChange?.(to)}
      disabled={disabled}
      style={{
        height: 36, padding: "0 12px", borderRadius: radius.md,
        background: "transparent", border: `1px solid ${colors.bg.border}`,
        color: disabled ? colors.text.muted : colors.text.primary,
        fontFamily: font.display, fontWeight: 700, fontSize: 13,
        cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.5 : 1,
        WebkitTapHighlightColor: "transparent",
      }}
    >
      {label}
    </button>
  );

  return (
    <nav style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
      {navBtn("Anterior", page - 1, page <= 1)}
      {items.map((it, i) =>
        it === "…" ? (
          <span key={`e${i}`} style={{ width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", color: colors.text.muted, fontFamily: font.display, fontWeight: 700 }}>…</span>
        ) : (
          <button
            key={it}
            onClick={() => onChange?.(it)}
            aria-current={it === page}
            style={{
              minWidth: 36, height: 36, padding: "0 8px", borderRadius: radius.md,
              background: it === page ? colors.accent.default : "transparent",
              border: `1px solid ${it === page ? colors.accent.default : colors.bg.border}`,
              color: it === page ? colors.text.onAccent : colors.text.primary,
              fontFamily: font.display, fontWeight: it === page ? 800 : 600, fontSize: 14,
              cursor: "pointer", WebkitTapHighlightColor: "transparent",
            }}
          >
            {it}
          </button>
        )
      )}
      {navBtn("Próxima", page + 1, page >= total)}
    </nav>
  );
}
