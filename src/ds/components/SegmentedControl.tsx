"use client";

import React, { useLayoutEffect, useRef, useState } from "react";
import { font, radius, motion, token } from "../tokens";

export interface SegmentedItem {
  value: string;
  label: string;
}

export interface SegmentedControlProps {
  items: SegmentedItem[];
  value: string;
  onChange: (value: string) => void;
  /** ocupa 100% da largura dividindo igualmente entre os itens */
  fullWidth?: boolean;
}

const EASE = "cubic-bezier(0.32, 0.72, 0, 1)";

/**
 * Pill única com indicador deslizante atrás do item ativo (desliza e redimensiona
 * suavemente entre as opções, com física de pressão no toque).
 */
export function SegmentedControl({ items, value, onChange, fullWidth }: SegmentedControlProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const refs = useRef<Record<string, HTMLButtonElement | null>>({});
  const [rect, setRect] = useState<{ left: number; width: number } | null>(null);

  useLayoutEffect(() => {
    const track = trackRef.current;
    const el = refs.current[value];
    if (!track || !el) return;
    const trackBox = track.getBoundingClientRect();
    const elBox = el.getBoundingClientRect();
    setRect({ left: elBox.left - trackBox.left, width: elBox.width });
  }, [value, items, fullWidth]);

  return (
    <div
      ref={trackRef}
      style={{
        position: "relative",
        display: "flex",
        width: fullWidth ? "100%" : "max-content",
        flexShrink: 0,
        background: token("bg-surface-secondary-default"),
        border: `1px solid ${token("border-primary-default")}`,
        borderRadius: radius.pill,
        padding: 4,
        boxSizing: "border-box",
      }}
    >
      {/* indicador deslizante */}
      {rect && (
        <div
          aria-hidden
          style={{
            position: "absolute",
            top: 4,
            bottom: 4,
            left: rect.left,
            width: rect.width,
            background: token("accent-green-default"),
            borderRadius: radius.pill,
            transition: `left ${motion.duration.slow}ms ${EASE}, width ${motion.duration.slow}ms ${EASE}`,
          }}
        />
      )}

      {items.map((item) => {
        const active = item.value === value;
        return (
          <button
            key={item.value}
            ref={(el) => { refs.current[item.value] = el; }}
            onClick={() => onChange(item.value)}
            style={{
              position: "relative",
              zIndex: 1,
              flex: fullWidth ? 1 : "0 0 auto",
              height: 36,
              padding: "0 20px",
              border: "none",
              background: "transparent",
              borderRadius: radius.pill,
              cursor: "pointer",
              fontFamily: font.display,
              fontWeight: 700,
              fontSize: 14,
              color: active ? token("text-on-fill-default") : token("text-tertiary-default"),
              transition: `color ${motion.duration.base}ms ${EASE}, transform 180ms ${EASE}`,
              WebkitTapHighlightColor: "transparent",
              whiteSpace: "nowrap",
            }}
            onPointerDown={(e) => { e.currentTarget.style.transform = "scale(0.96)"; }}
            onPointerUp={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
            onPointerLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
