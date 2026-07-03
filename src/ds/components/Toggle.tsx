import React from "react";
import { motion, token } from "../tokens";

export interface ToggleProps {
  checked: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
}

/** Switch on/off do Canelada (ex.: notificações). */
export function Toggle({ checked, onChange, disabled }: ToggleProps) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange?.(!checked)}
      style={{
        position: "relative",
        width: 40,
        height: 22,
        borderRadius: 9999,
        background: checked ? token("accent-green-default") : "#3a3a3a",
        border: "none",
        flexShrink: 0,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.5 : 1,
        transition: `background ${motion.duration.base}ms ${motion.ease.out}`,
        WebkitTapHighlightColor: "transparent",
      }}
    >
      <span
        style={{
          position: "absolute",
          top: 2,
          left: checked ? 20 : 2,
          width: 18,
          height: 18,
          borderRadius: "50%",
          background: "#fff",
          transition: `left ${motion.duration.base}ms ${motion.ease.out}`,
        }}
      />
    </button>
  );
}
