import React, { useEffect, useRef, useState } from "react";
import { colors, font, radius, shadow, motion, token } from "../tokens";

export interface DropdownOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
}

export interface DropdownProps {
  label?: string;
  required?: boolean;
  options: DropdownOption[];
  value: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  leftIcon?: React.ReactNode;
  disabled?: boolean;
  error?: boolean;
}

/** Dropdown (select custom): trigger com ícone + popover de opções, com check no selecionado e estados. */
export function Dropdown({ label, required, options, value, onChange, placeholder = "Selecione", leftIcon, disabled, error }: DropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selected = options.find((o) => o.value === value);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  const borderColor = error ? token("accent-red-default") : open ? token("accent-green-default") : token("border-primary-default");

  return (
    <div style={{ width: "100%" }}>
      {label && (
        <span style={{ display: "block", marginBottom: 6, fontFamily: font.body, fontWeight: 600, fontSize: 14, lineHeight: "20px", color: "#f5f5f5" }}>
          {label}
          {required && <span style={{ color: token("accent-red-default"), marginLeft: 3 }}>*</span>}
        </span>
      )}
      <div ref={ref} style={{ position: "relative", width: "100%" }}>
        <button
          type="button"
          disabled={disabled}
          onClick={() => setOpen((v) => !v)}
          style={{
            display: "flex", alignItems: "center", gap: 8, width: "100%", height: 48, boxSizing: "border-box",
            background: disabled ? token("bg-surface-secondary-default") : token("bg-surface-primary-default"),
            border: `1px solid ${borderColor}`, borderRadius: radius.lg, padding: "0 12px 0 16px",
            cursor: disabled ? "not-allowed" : "pointer", WebkitTapHighlightColor: "transparent",
            transition: `border-color ${motion.duration.fast}ms`,
          }}
        >
          {leftIcon && <span style={{ display: "inline-flex", flexShrink: 0, color: token("text-tertiary-default") }}>{leftIcon}</span>}
          <span style={{ flex: 1, minWidth: 0, textAlign: "left", fontFamily: font.body, fontWeight: 600, fontSize: 14, color: selected ? token("text-primary-default") : token("text-tertiary-default"), whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {selected?.label ?? placeholder}
          </span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={colors.accent.default} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, transform: open ? "rotate(180deg)" : "none", transition: `transform ${motion.duration.fast}ms` }}>
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>

        {open && (
          <div
            role="listbox"
            style={{
              position: "absolute", top: "calc(100% + 6px)", left: 0, right: 0, zIndex: 50,
              background: token("bg-surface-tertiary-default"), border: `1px solid ${token("border-primary-default")}`, borderRadius: radius.md,
              padding: 4, boxShadow: shadow.lg, maxHeight: 260, overflowY: "auto",
              animation: `bagre-dd ${motion.duration.fast}ms ${motion.ease.out}`,
            }}
          >
            {options.map((o) => {
              const active = o.value === value;
              return (
                <button
                  key={o.value}
                  role="option"
                  aria-selected={active}
                  onClick={() => { onChange?.(o.value); setOpen(false); }}
                  style={{
                    display: "flex", alignItems: "center", gap: 10, width: "100%",
                    background: active ? token("bg-surface-primary-default") : "none", border: "none", borderRadius: radius.sm,
                    padding: "10px 10px", cursor: "pointer", textAlign: "left",
                    fontFamily: font.body, fontWeight: 600, fontSize: 14, color: token("text-primary-default"),
                    WebkitTapHighlightColor: "transparent",
                  }}
                  onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = token("bg-surface-primary-default"); }}
                  onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = "none"; }}
                >
                  {o.icon && <span style={{ display: "inline-flex", flexShrink: 0 }}>{o.icon}</span>}
                  <span style={{ flex: 1 }}>{o.label}</span>
                  {active && (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={colors.accent.default} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                  )}
                </button>
              );
            })}
            <style>{`@keyframes bagre-dd{from{opacity:0;transform:translateY(-4px)}to{opacity:1;transform:translateY(0)}}`}</style>
          </div>
        )}
      </div>
    </div>
  );
}
