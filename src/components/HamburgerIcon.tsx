"use client";

import { Menu, X } from "reicon-react";

/**
 * Ícone de menu — usa os ícones do Reicon (Menu ↔ X), padrão do produto (todos
 * os ícones são Reicon). Faz um crossfade suave entre os dois estados; o traço
 * Outline casa com os demais ícones da topbar (ex.: sino).
 */
export function HamburgerIcon({ open, size = 24, color = "#fff" }: { open: boolean; size?: number; color?: string }) {
  const ease = "cubic-bezier(0.32, 0.72, 0, 1)";
  const layer = (visible: boolean): React.CSSProperties => ({
    position: "absolute",
    inset: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    opacity: visible ? 1 : 0,
    transform: visible ? "rotate(0deg) scale(1)" : "rotate(-90deg) scale(0.8)",
    transition: `opacity 220ms ${ease}, transform 320ms ${ease}`,
  });

  return (
    <span style={{ position: "relative", display: "inline-block", width: size, height: size }}>
      <span style={layer(!open)}>
        <Menu size={size} color={color} weight="Outline" />
      </span>
      <span style={layer(open)}>
        <X size={size} color={color} weight="Outline" />
      </span>
    </span>
  );
}
