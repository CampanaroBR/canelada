import React, { useState } from "react";
import { font, radius, token } from "../tokens";

export interface PasswordInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "className" | "type"> {
  label?: string;
  required?: boolean;
  hint?: string;
  error?: string;
  /** mostra a barra de força da senha */
  strength?: boolean;
}

function score(v: string): number {
  let s = 0;
  if (v.length >= 8) s++;
  if (/[A-Z]/.test(v) && /[a-z]/.test(v)) s++;
  if (/\d/.test(v)) s++;
  if (/[^A-Za-z0-9]/.test(v)) s++;
  return Math.min(s, 3); // 0..3
}
const STRENGTH = [
  { label: "", color: token("border-primary-default") },
  { label: "Fraca", color: token("accent-red-default") },
  { label: "Média", color: token("accent-gold-default") },
  { label: "Forte", color: token("accent-green-default") },
];

const Eye = ({ off }: { off?: boolean }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    {off ? (
      <>
        <path d="M17.94 17.94A10.07 10.07 0 0112 20C5 20 1 12 1 12a18.5 18.5 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
        <line x1="1" y1="1" x2="23" y2="23" />
      </>
    ) : (
      <>
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
      </>
    )}
  </svg>
);

/** Campo de senha: mostrar/ocultar + medidor de força opcional. */
export function PasswordInput({ label, required, hint, error, strength, disabled, value, onChange, style, ...rest }: PasswordInputProps) {
  const [show, setShow] = useState(false);
  const v = typeof value === "string" ? value : "";
  const sc = score(v);
  const borderColor = error ? token("accent-red-default") : token("border-primary-default");

  return (
    <label style={{ display: "block", width: "100%" }}>
      {label && (
        <span style={{ display: "block", marginBottom: 6, fontFamily: font.body, fontWeight: 600, fontSize: 14, lineHeight: "20px", color: "#f5f5f5" }}>
          {label}
          {required && <span style={{ color: token("accent-red-default"), marginLeft: 3 }}>*</span>}
        </span>
      )}
      <div style={{ display: "flex", alignItems: "center", gap: 8, height: 48, background: disabled ? token("bg-surface-secondary-default") : token("bg-surface-primary-default"), border: `1px solid ${borderColor}`, borderRadius: radius.lg, padding: "0 12px 0 16px", boxSizing: "border-box" }}>
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={onChange}
          disabled={disabled}
          style={{ flex: 1, minWidth: 0, height: "100%", background: "transparent", border: "none", outline: "none", color: token("text-primary-default"), fontFamily: font.body, fontWeight: 600, fontSize: 14, letterSpacing: show ? 0 : "0.06em", ...style }}
          {...rest}
        />
        <button type="button" onClick={() => setShow((s) => !s)} aria-label={show ? "Ocultar senha" : "Mostrar senha"} style={{ background: "none", border: "none", cursor: "pointer", color: token("text-tertiary-default"), display: "inline-flex", padding: 4, flexShrink: 0 }}>
          <Eye off={show} />
        </button>
      </div>

      {strength && v.length > 0 && (
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8 }}>
          <div style={{ display: "flex", gap: 4, flex: 1 }}>
            {[1, 2, 3].map((i) => (
              <span key={i} style={{ flex: 1, height: 4, borderRadius: 99, background: i <= sc ? STRENGTH[sc].color : token("border-primary-default"), transition: "background 150ms" }} />
            ))}
          </div>
          <span style={{ fontFamily: font.display, fontWeight: 700, fontSize: 11, color: STRENGTH[sc].color, minWidth: 38, textAlign: "right" }}>{STRENGTH[sc].label}</span>
        </div>
      )}

      {(error || hint) && (
        <span style={{ display: "block", marginTop: 6, fontFamily: font.body, fontWeight: 500, fontSize: 12, color: error ? token("accent-red-default") : token("text-tertiary-default") }}>
          {error ?? hint}
        </span>
      )}
    </label>
  );
}
