import React from "react";
import { colors, font, radius } from "../tokens";

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps {
  label?: string;
  required?: boolean;
  options: SelectOption[];
  value: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: boolean;
}

/** Dropdown/Select (field + chevron) usando <select> nativo p/ acessibilidade. */
export function Select({ label, required, options, value, onChange, placeholder = "—", disabled, error }: SelectProps) {
  return (
    <label style={{ display: "block", width: "100%" }}>
      {label && (
        <span style={{ display: "block", marginBottom: 6, fontFamily: font.body, fontWeight: 600, fontSize: 14, lineHeight: "20px", color: "#f5f5f5" }}>
          {label}
          {required && <span style={{ color: colors.semantic.danger, marginLeft: 3 }}>*</span>}
        </span>
      )}
      <div style={{ position: "relative", width: "100%" }}>
        <select
          value={value}
          disabled={disabled}
          onChange={(e) => onChange?.(e.target.value)}
          style={{
            width: "100%",
            height: 48,
            boxSizing: "border-box",
            appearance: "none",
            WebkitAppearance: "none",
            MozAppearance: "none",
            background: disabled ? colors.bg.card : colors.bg.surface,
            border: `1px solid ${error ? colors.semantic.danger : colors.bg.border}`,
            borderRadius: radius.lg,
            padding: "0 38px 0 16px",
            color: value ? colors.text.primary : colors.text.muted,
            fontFamily: font.body,
            fontWeight: 600,
            fontSize: 14,
            outline: "none",
            cursor: disabled ? "not-allowed" : "pointer",
          }}
        >
          <option value="">{placeholder}</option>
          {options.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        <svg
          width="16" height="16" viewBox="0 0 24 24" fill="none"
          stroke={colors.accent.default} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
          style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </div>
    </label>
  );
}
