import React from "react";
import { colors, font } from "../tokens";

export interface SliderProps {
  value: number;
  min?: number;
  max?: number;
  step?: number;
  onChange?: (value: number) => void;
  label?: string;
  showValue?: boolean;
  disabled?: boolean;
}

/** Slider de valor único. Trilha preenchida em verde até o thumb. */
export function Slider({ value, min = 0, max = 100, step = 1, onChange, label, showValue, disabled }: SliderProps) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div style={{ width: "100%", opacity: disabled ? 0.5 : 1 }}>
      {(label || showValue) && (
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
          {label && <span style={{ fontFamily: font.body, fontWeight: 600, fontSize: 14, color: "#f5f5f5" }}>{label}</span>}
          {showValue && <span style={{ fontFamily: font.display, fontWeight: 800, fontSize: 13, color: colors.accent.default }}>{value}</span>}
        </div>
      )}
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange?.(Number(e.target.value))}
        style={{
          width: "100%",
          height: 6,
          borderRadius: 99,
          appearance: "none",
          WebkitAppearance: "none",
          outline: "none",
          cursor: disabled ? "not-allowed" : "pointer",
          background: `linear-gradient(90deg, ${colors.accent.default} ${pct}%, ${colors.bg.border} ${pct}%)`,
        }}
      />
      <style>{`
        input[type=range]::-webkit-slider-thumb{ -webkit-appearance:none; width:18px; height:18px; border-radius:50%; background:#fff; border:2px solid ${colors.accent.default}; cursor:pointer; }
        input[type=range]::-moz-range-thumb{ width:18px; height:18px; border-radius:50%; background:#fff; border:2px solid ${colors.accent.default}; cursor:pointer; }
      `}</style>
    </div>
  );
}
