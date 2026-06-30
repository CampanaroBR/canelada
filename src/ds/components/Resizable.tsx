import React, { useRef, useState } from "react";
import { colors } from "../tokens";

export interface ResizableProps {
  left: React.ReactNode;
  right: React.ReactNode;
  /** % inicial do painel esquerdo */
  initial?: number;
  min?: number;
  max?: number;
  height?: number | string;
}

/** Dois painéis com divisor arrastável (horizontal). */
export function Resizable({ left, right, initial = 50, min = 20, max = 80, height = 220 }: ResizableProps) {
  const [pct, setPct] = useState(initial);
  const ref = useRef<HTMLDivElement>(null);

  const onDown = (e: React.PointerEvent) => {
    e.preventDefault();
    const move = (ev: PointerEvent) => {
      const r = ref.current?.getBoundingClientRect();
      if (!r) return;
      const p = ((ev.clientX - r.left) / r.width) * 100;
      setPct(Math.max(min, Math.min(max, p)));
    };
    const up = () => { window.removeEventListener("pointermove", move); window.removeEventListener("pointerup", up); };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  };

  return (
    <div ref={ref} style={{ display: "flex", width: "100%", height, border: `1px solid ${colors.bg.border}`, borderRadius: 16, overflow: "hidden", background: colors.bg.card }}>
      <div style={{ width: `${pct}%`, minWidth: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>{left}</div>
      <div
        onPointerDown={onDown}
        role="separator"
        aria-orientation="vertical"
        style={{ width: 10, flexShrink: 0, cursor: "col-resize", background: colors.bg.surface, borderLeft: `1px solid ${colors.bg.border}`, borderRight: `1px solid ${colors.bg.border}`, display: "flex", alignItems: "center", justifyContent: "center", touchAction: "none" }}
      >
        <div style={{ width: 3, height: 22, borderRadius: 99, background: colors.bg.borderStrong }} />
      </div>
      <div style={{ flex: 1, minWidth: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>{right}</div>
    </div>
  );
}
