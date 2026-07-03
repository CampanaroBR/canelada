import React, { useState } from "react";
import { font, radius, token } from "../tokens";

export interface TooltipProps {
  label: string;
  placement?: "top" | "bottom";
  children: React.ReactNode;
}

/** Tooltip (bolha escura + seta). Aparece no hover/focus. */
export function Tooltip({ label, placement = "top", children }: TooltipProps) {
  const [open, setOpen] = useState(false);
  const top = placement === "top";
  return (
    <span
      style={{ position: "relative", display: "inline-flex" }}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
    >
      {children}
      {open && (
        <span
          role="tooltip"
          style={{
            position: "absolute",
            left: "50%",
            transform: "translateX(-50%)",
            [top ? "bottom" : "top"]: "calc(100% + 8px)",
            background: token("bg-surface-tertiary-default"),
            color: token("text-primary-default"),
            border: `1px solid ${token("border-primary-default")}`,
            borderRadius: radius.md,
            padding: "6px 10px",
            fontFamily: font.body,
            fontWeight: 500,
            fontSize: 12,
            lineHeight: "16px",
            whiteSpace: "nowrap",
            zIndex: 50,
            boxShadow: "0px 8px 20px rgba(0,0,0,0.4)",
            pointerEvents: "none",
          }}
        >
          {label}
          <span
            style={{
              position: "absolute",
              left: "50%",
              marginLeft: -4,
              [top ? "top" : "bottom"]: "100%",
              width: 8,
              height: 8,
              background: token("bg-surface-tertiary-default"),
              borderRight: `1px solid ${token("border-primary-default")}`,
              borderBottom: `1px solid ${token("border-primary-default")}`,
              transform: top ? "translateY(-50%) rotate(45deg)" : "translateY(50%) rotate(225deg)",
            }}
          />
        </span>
      )}
    </span>
  );
}
