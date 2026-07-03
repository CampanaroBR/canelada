import React from "react";
import { colors, font, motion, token } from "../tokens";

export type ProgressTone = "accent" | "gold" | "danger" | "brand";

const TONE: Record<ProgressTone, string> = {
  accent: token("accent-green-default"),
  gold: token("accent-gold-default"),
  danger: token("accent-red-default"),
  brand: colors.brand.primary,
};

export interface ProgressBarProps {
  /** 0 a 100 */
  value: number;
  tone?: ProgressTone;
  size?: "sm" | "md";
  showValue?: boolean;
  label?: string;
}

/** Barra de progresso (usada em badges/ranking). */
export function ProgressBar({ value, tone = "accent", size = "md", showValue, label }: ProgressBarProps) {
  const pct = Math.max(0, Math.min(100, value));
  const h = size === "sm" ? 6 : 8;
  return (
    <div style={{ width: "100%" }}>
      {(label || showValue) && (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
          {label && <span style={{ fontFamily: font.display, fontWeight: 700, fontSize: 13, color: token("text-primary-default") }}>{label}</span>}
          {showValue && <span style={{ fontFamily: font.display, fontWeight: 800, fontSize: 13, color: TONE[tone] }}>{Math.round(pct)}%</span>}
        </div>
      )}
      <div style={{ height: h, width: "100%", background: "rgba(120,120,120,0.2)", borderRadius: 99, overflow: "hidden" }}>
        <div
          style={{
            height: "100%",
            width: `${pct}%`,
            background: TONE[tone],
            borderRadius: 99,
            transition: `width ${motion.duration.slow}ms ${motion.ease.out}`,
          }}
        />
      </div>
    </div>
  );
}
