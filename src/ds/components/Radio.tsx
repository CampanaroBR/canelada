import React from "react";
import { colors, font } from "../tokens";

export interface RadioProps {
  checked?: boolean;
  size?: "sm" | "xs"; // 20 | 16
  disabled?: boolean;
  label?: React.ReactNode;
  onChange?: () => void;
}

/** Radio — porte do Hive, recolorido pros tokens do Canelada. */
export function Radio({ checked = false, size = "sm", disabled, label, onChange }: RadioProps) {
  const px = size === "sm" ? 20 : 16;
  const dot = px * 0.5;
  const circle = (
    <span
      style={{
        width: px,
        height: px,
        flexShrink: 0,
        borderRadius: "50%",
        background: "transparent",
        border: `1.5px solid ${checked ? colors.accent.default : colors.bg.borderStrong}`,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "border-color 120ms",
      }}
    >
      {checked && <span style={{ width: dot, height: dot, borderRadius: "50%", background: colors.accent.default }} />}
    </span>
  );

  return (
    <button
      role="radio"
      aria-checked={checked}
      disabled={disabled}
      onClick={onChange}
      style={{
        background: "none",
        border: "none",
        padding: 0,
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.5 : 1,
        WebkitTapHighlightColor: "transparent",
      }}
    >
      {circle}
      {label && <span style={{ fontFamily: font.body, fontWeight: 500, fontSize: 14, color: colors.text.primary }}>{label}</span>}
    </button>
  );
}
