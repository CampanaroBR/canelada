import React from "react";
import { colors, font, radius } from "../tokens";

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "className"> {
  label?: string;
  required?: boolean;
  hint?: string;
}

/** Campo de texto do Bagre DS — label + field escuro. */
export function Input({ label, required, hint, disabled, style, ...rest }: InputProps) {
  return (
    <label style={{ display: "block", width: "100%" }}>
      {label && (
        <span style={{ display: "block", marginBottom: 6, fontFamily: font.body, fontWeight: 600, fontSize: 14, lineHeight: "20px", color: colors.text.primary === "#ffffff" ? "#f5f5f5" : colors.text.primary }}>
          {label}
          {required && <span style={{ color: colors.semantic.danger, marginLeft: 3 }}>*</span>}
        </span>
      )}
      <input
        disabled={disabled}
        style={{
          width: "100%",
          height: 48,
          boxSizing: "border-box",
          background: disabled ? colors.bg.card : colors.bg.surface,
          border: `1px solid ${colors.bg.border}`,
          borderRadius: radius.lg,
          padding: "0 16px",
          color: disabled ? colors.text.muted : colors.text.primary,
          fontFamily: font.body,
          fontWeight: 600,
          fontSize: 14,
          outline: "none",
          cursor: disabled ? "not-allowed" : "text",
          ...style,
        }}
        {...rest}
      />
      {hint && <span style={{ display: "block", marginTop: 6, fontFamily: font.body, fontWeight: 500, fontSize: 12, color: colors.text.muted }}>{hint}</span>}
    </label>
  );
}
