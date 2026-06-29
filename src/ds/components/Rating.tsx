import React from "react";
import { colors, font } from "../tokens";

const PATHS = {
  star: "M12 2l2.9 6.3 6.9.7-5.1 4.6 1.4 6.8L12 17.8 5.9 20.4l1.4-6.8L2.2 9l6.9-.7z",
  heart: "M12 21s-7.5-4.7-10-9.3C.5 8.6 2 5 5.4 5c2 0 3.3 1 4.6 2.6C11.3 6 12.6 5 14.6 5 18 5 19.5 8.6 22 11.7 19.5 16.3 12 21 12 21z",
};

export interface RatingProps {
  value: number; // 0..max, aceita .5
  max?: number;
  size?: "sm" | "xs"; // 20 | 16
  icon?: "star" | "heart";
  count?: number;
  onChange?: (value: number) => void;
}

function Glyph({ ratio, px, color, path }: { ratio: number; px: number; color: string; path: string }) {
  const id = React.useId();
  return (
    <svg width={px} height={px} viewBox="0 0 24 24">
      <defs>
        <clipPath id={id}><rect x="0" y="0" width={24 * ratio} height="24" /></clipPath>
      </defs>
      <path d={path} fill="none" stroke={colors.bg.borderStrong} strokeWidth="1.5" />
      <path d={path} fill={color} clipPath={`url(#${id})`} />
    </svg>
  );
}

/** Rating (estrelas/corações + meio-preenchimento + contador). */
export function Rating({ value, max = 5, size = "sm", icon = "star", count, onChange }: RatingProps) {
  const px = size === "sm" ? 20 : 16;
  const color = icon === "heart" ? colors.semantic.danger : colors.semantic.gold;
  const path = PATHS[icon];
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
      <span style={{ display: "inline-flex", gap: 2 }}>
        {Array.from({ length: max }).map((_, i) => {
          const ratio = Math.max(0, Math.min(1, value - i));
          const node = <Glyph key={i} ratio={ratio} px={px} color={color} path={path} />;
          return onChange ? (
            <button key={i} onClick={() => onChange(i + 1)} aria-label={`${i + 1}`} style={{ background: "none", border: "none", padding: 0, cursor: "pointer", display: "inline-flex", lineHeight: 0 }}>
              {node}
            </button>
          ) : node;
        })}
      </span>
      {count != null && (
        <span style={{ fontFamily: font.body, fontWeight: 500, fontSize: 12, color: colors.text.muted }}>{count}</span>
      )}
    </span>
  );
}
