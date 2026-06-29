import React from "react";
import { colors, font, radius } from "../tokens";

export interface TableColumn<T> {
  key: keyof T & string;
  label: string;
  align?: "left" | "right" | "center";
  width?: number | string;
}

export interface TableProps<T extends Record<string, React.ReactNode>> {
  columns: TableColumn<T>[];
  rows: T[];
  height?: "narrow" | "tall"; // 48 | 56
}

/** Tabela (header + células, hover). */
export function Table<T extends Record<string, React.ReactNode>>({ columns, rows, height = "narrow" }: TableProps<T>) {
  const rowH = height === "narrow" ? 48 : 56;
  return (
    <div style={{ border: `1px solid ${colors.bg.border}`, borderRadius: radius.lg, overflow: "hidden", width: "100%" }}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ background: colors.bg.surface }}>
            {columns.map((c) => (
              <th
                key={c.key}
                style={{
                  textAlign: c.align ?? "left",
                  padding: "0 14px",
                  height: 44,
                  width: c.width,
                  fontFamily: font.display,
                  fontWeight: 600,
                  fontSize: 12,
                  letterSpacing: "0.04em",
                  textTransform: "uppercase",
                  color: colors.text.secondary,
                  borderBottom: `1px solid ${colors.bg.border}`,
                }}
              >
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr
              key={ri}
              style={{ background: colors.bg.card }}
              onMouseEnter={(e) => (e.currentTarget.style.background = colors.bg.elevated)}
              onMouseLeave={(e) => (e.currentTarget.style.background = colors.bg.card)}
            >
              {columns.map((c) => (
                <td
                  key={c.key}
                  style={{
                    textAlign: c.align ?? "left",
                    padding: "0 14px",
                    height: rowH,
                    fontFamily: font.body,
                    fontWeight: 500,
                    fontSize: 14,
                    color: colors.text.primary,
                    borderTop: ri === 0 ? "none" : `1px solid ${colors.bg.border}`,
                  }}
                >
                  {row[c.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
