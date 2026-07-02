import React from "react";
import { radius, token } from "../tokens";

export interface IconBoxProps {
  children: React.ReactNode;
  size?: number;
  /** default = caixa escura com borda · accent = fundo verde */
  tone?: "default" | "accent" | "danger";
  radiusToken?: keyof typeof radius;
}

/** Caixa de ícone padrão do Canelada (ex.: linhas de conta, headers de seção). */
export function IconBox({ children, size = 36, tone = "default", radiusToken = "md" }: IconBoxProps) {
  const bg = tone === "accent" ? token("bg-fill-primary-default") : tone === "danger" ? token("bg-fill-danger-default") : token("bg-surface-tertiary-default");
  const border = tone === "default" ? `1px solid ${token("border-primary-default")}` : "none";
  return (
    <div
      style={{
        width: size,
        height: size,
        flexShrink: 0,
        background: bg,
        border,
        borderRadius: radius[radiusToken],
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {children}
    </div>
  );
}
