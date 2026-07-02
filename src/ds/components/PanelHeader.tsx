import React from "react";
import { font, radius, token } from "../tokens";

export interface PanelHeaderProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  /** elemento à direita (ex.: botão compartilhar) */
  action?: React.ReactNode;
  children?: React.ReactNode;
}

/**
 * Cabeçalho-painel do Canelada — superfície com cantos inferiores arredondados (40px),
 * usada no topo de Ranking, Badges, Meu Grupo, Criar Rodada.
 */
export function PanelHeader({ title, subtitle, icon, action, children }: PanelHeaderProps) {
  return (
    <header
      style={{
        background: token("bg-surface-primary-default"),
        border: `1px solid ${token("border-primary-default")}`,
        borderRadius: `0 0 ${radius["4xl"] - 8}px ${radius["4xl"] - 8}px`,
        padding: "20px 16px",
        boxSizing: "border-box",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        {icon}
        <div style={{ flex: 1, minWidth: 0 }}>
          <h1 style={{ margin: 0, fontFamily: font.display, fontWeight: 800, fontSize: 18, lineHeight: "22px", color: token("text-primary-default"), textTransform: "uppercase", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {title}
          </h1>
          {subtitle && (
            <p style={{ margin: "2px 0 0", fontFamily: font.body, fontWeight: 500, fontSize: 13, color: token("text-secondary-default") }}>{subtitle}</p>
          )}
        </div>
        {action}
      </div>
      {children}
    </header>
  );
}
