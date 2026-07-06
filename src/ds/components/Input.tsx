import React from "react";
import { font, radius, token } from "../tokens";

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "className"> {
  label?: string;
  required?: boolean;
  hint?: string;
  error?: string;
  leftIcon?: React.ReactNode;
}

/** Campo de texto do Bagre DS — label + field escuro, com ícone e estado de erro. */
export function Input({ label, required, hint, error, leftIcon, disabled, style, ...rest }: InputProps) {
  const borderColor = error ? token("border-danger-default") : token("border-primary-default");
  return (
    <label style={{ display: "block", width: "100%", WebkitTapHighlightColor: "transparent" }}>
      {label && (
        <span style={{ display: "block", marginBottom: 6, fontFamily: font.body, fontWeight: 600, fontSize: 14, lineHeight: "20px", color: "#f5f5f5" }}>
          {label}
          {required && <span style={{ color: token("text-danger-default"), marginLeft: 3 }}>*</span>}
        </span>
      )}
      <div
        className="ds-input-box"
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          height: 48,
          background: disabled ? token("bg-surface-secondary-default") : token("bg-surface-primary-default"),
          border: `1px solid ${borderColor}`,
          borderRadius: radius.lg,
          padding: "0 16px",
          boxSizing: "border-box",
          transition: "border-color 150ms ease, box-shadow 150ms ease",
        }}
      >
        {leftIcon && <span style={{ display: "inline-flex", flexShrink: 0, color: token("text-tertiary-default") }}>{leftIcon}</span>}
        <input
          className="ds-input"
          disabled={disabled}
          style={{
            flex: 1,
            minWidth: 0,
            height: "100%",
            background: "transparent",
            border: "none",
            outline: "none",
            color: disabled ? token("text-tertiary-default") : token("text-primary-default"),
            fontFamily: font.body,
            fontWeight: 600,
            fontSize: 14,
            cursor: disabled ? "not-allowed" : "text",
            ...style,
          }}
          {...rest}
        />
      </div>
      {(error || hint) && (
        <span style={{ display: "block", marginTop: 6, fontFamily: font.body, fontWeight: 500, fontSize: 12, color: error ? token("text-danger-default") : token("text-tertiary-default") }}>
          {error ?? hint}
        </span>
      )}
    </label>
  );
}
