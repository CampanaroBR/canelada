import React from "react";
import { colors, font } from "../tokens";

export interface AvatarProps {
  name?: string;
  src?: string;
  size?: number;
  /** anel verde de destaque (ex.: card do jogador) */
  ring?: boolean;
  /** selo de check verde no canto (ex.: voto confirmado) */
  checked?: boolean;
}

function initials(name = "?") {
  const p = name.trim().split(/\s+/);
  return (p.length >= 2 ? p[0][0] + p[1][0] : name.slice(0, 2)).toUpperCase();
}

/** Avatar do Canelada — foto ou iniciais, com anel/selo opcionais. */
export function Avatar({ name, src, size = 42, ring, checked }: AvatarProps) {
  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <div
        style={{
          width: size,
          height: size,
          borderRadius: "50%",
          overflow: "hidden",
          background: colors.bg.card,
          border: `${ring ? 2 : 1}px solid ${ring ? colors.accent.default : colors.bg.border}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={src} alt={name ?? ""} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <span style={{ fontFamily: font.display, fontWeight: 800, fontSize: Math.round(size * 0.38), color: colors.accent.default }}>
            {initials(name)}
          </span>
        )}
      </div>
      {checked && (
        <div style={{ position: "absolute", right: -2, bottom: -2, width: size * 0.42, height: size * 0.42, borderRadius: "50%", background: colors.accent.default, border: `2px solid ${colors.bg.base}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg width="60%" height="60%" viewBox="0 0 24 24" fill="none" stroke={colors.bg.base} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
        </div>
      )}
    </div>
  );
}
