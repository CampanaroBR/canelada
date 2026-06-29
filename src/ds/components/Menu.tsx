import React, { useEffect, useRef, useState } from "react";
import { colors, font, radius, motion } from "../tokens";

export interface MenuItem {
  label: string;
  icon?: React.ReactNode;
  danger?: boolean;
  onClick?: () => void;
}

export interface MenuProps {
  trigger: React.ReactNode;
  items: MenuItem[];
  align?: "left" | "right";
}

/** Dropdown-menu de ações (trigger + itens em popover). */
export function Menu({ trigger, items, align = "right" }: MenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  return (
    <div ref={ref} style={{ position: "relative", display: "inline-flex" }}>
      <span onClick={() => setOpen((v) => !v)} style={{ display: "inline-flex", cursor: "pointer" }}>
        {trigger}
      </span>
      {open && (
        <div
          role="menu"
          style={{
            position: "absolute",
            top: "calc(100% + 6px)",
            [align]: 0,
            minWidth: 180,
            background: colors.bg.elevated,
            border: `1px solid ${colors.bg.border}`,
            borderRadius: radius.md,
            padding: 4,
            zIndex: 50,
            boxShadow: "0px 12px 28px rgba(0,0,0,0.45)",
            animation: `bagre-menu ${motion.duration.fast}ms ${motion.ease.out}`,
          }}
        >
          {items.map((it, i) => (
            <button
              key={i}
              role="menuitem"
              onClick={() => { it.onClick?.(); setOpen(false); }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                width: "100%",
                background: "none",
                border: "none",
                borderRadius: radius.sm,
                padding: "10px 10px",
                cursor: "pointer",
                textAlign: "left",
                fontFamily: font.body,
                fontWeight: 600,
                fontSize: 14,
                color: it.danger ? colors.semantic.danger : colors.text.primary,
                WebkitTapHighlightColor: "transparent",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = colors.bg.surface)}
              onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
            >
              {it.icon}
              {it.label}
            </button>
          ))}
          <style>{`@keyframes bagre-menu{from{opacity:0;transform:translateY(-4px)}to{opacity:1;transform:translateY(0)}}`}</style>
        </div>
      )}
    </div>
  );
}
