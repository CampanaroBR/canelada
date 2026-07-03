import React from "react";
import { colors, font, token } from "../tokens";

export interface CheckboxProps {
  checked?: boolean;
  indeterminate?: boolean;
  size?: "sm" | "xs"; // 20 | 16
  disabled?: boolean;
  label?: React.ReactNode;
  onChange?: (checked: boolean) => void;
}

/** Checkbox (accent verde). */
export function Checkbox({ checked = false, indeterminate, size = "sm", disabled, label, onChange }: CheckboxProps) {
  const px = size === "sm" ? 20 : 16;
  const r = size === "sm" ? 6 : 5;
  const on = checked || indeterminate;
  const box = (
    <span
      style={{
        width: px,
        height: px,
        flexShrink: 0,
        borderRadius: r,
        background: on ? token("accent-green-default") : "transparent",
        border: on ? "none" : `1.5px solid ${token("border-secondary-default")}`,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "background 120ms, border-color 120ms",
      }}
    >
      {indeterminate ? (
        <svg width={px * 0.6} height={px * 0.6} viewBox="0 0 24 24" stroke={colors.text.onAccent} strokeWidth="4" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12" /></svg>
      ) : checked ? (
        <svg width={px * 0.62} height={px * 0.62} viewBox="0 0 24 24" fill="none" stroke={colors.text.onAccent} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
      ) : null}
    </span>
  );

  const content = label ? (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
      {box}
      <span style={{ fontFamily: font.body, fontWeight: 500, fontSize: 14, color: token("text-primary-default") }}>{label}</span>
    </span>
  ) : (
    box
  );

  return (
    <button
      role="checkbox"
      aria-checked={indeterminate ? "mixed" : checked}
      disabled={disabled}
      onClick={() => onChange?.(!checked)}
      style={{
        background: "none",
        border: "none",
        padding: 0,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.5 : 1,
        WebkitTapHighlightColor: "transparent",
      }}
    >
      {content}
    </button>
  );
}
