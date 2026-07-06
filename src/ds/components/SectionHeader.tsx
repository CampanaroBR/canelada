import React from "react";
import { font, token } from "../tokens";
import { IconBox } from "./IconBox";

export interface SectionHeaderProps {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  /** ação à direita, ex.: botão "Ver mais" ou ícone de compartilhar */
  trailing?: React.ReactNode;
}

/** Cabeçalho de seção (ícone em caixa + título/subtítulo) — usado no topo de cards/blocos de conteúdo. */
export function SectionHeader({ icon, title, subtitle, trailing }: SectionHeaderProps) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
        <IconBox size={40}>{icon}</IconBox>
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", minWidth: 0 }}>
          <span style={{ fontFamily: font.display, fontWeight: 800, fontSize: 16, lineHeight: "20px", color: token("text-primary-default"), whiteSpace: "nowrap" }}>{title}</span>
          {subtitle && (
            <span style={{ fontFamily: font.display, fontWeight: 600, fontSize: 16, lineHeight: "20px", color: token("text-tertiary-default"), whiteSpace: "nowrap" }}>{subtitle}</span>
          )}
        </div>
      </div>
      {trailing && <div style={{ flexShrink: 0 }}>{trailing}</div>}
    </div>
  );
}
