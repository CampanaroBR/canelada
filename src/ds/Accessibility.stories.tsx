import React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { colors, font } from "./tokens";

const meta: Meta = { title: "Foundations/Acessibilidade", parameters: { layout: "fullscreen" } };
export default meta;
type Story = StoryObj;

function lum(hex: string) {
  const n = parseInt(hex.replace("#", ""), 16);
  const f = (c: number) => { c /= 255; return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); };
  return 0.2126 * f((n >> 16) & 255) + 0.7152 * f((n >> 8) & 255) + 0.0722 * f(n & 255);
}
function ratio(a: string, b: string) {
  const L1 = lum(a), L2 = lum(b), hi = Math.max(L1, L2), lo = Math.min(L1, L2);
  return (hi + 0.05) / (lo + 0.05);
}

const Page = ({ children }: { children: React.ReactNode }) => (
  <div style={{ padding: 32, background: colors.bg.base, minHeight: "100vh" }}>{children}</div>
);
const H = ({ children }: { children: React.ReactNode }) => (
  <h2 style={{ fontFamily: font.display, fontWeight: 900, fontSize: 22, color: "#fff", margin: "28px 0 6px" }}>{children}</h2>
);
const Sub = ({ children }: { children: React.ReactNode }) => (
  <p style={{ fontFamily: font.body, fontSize: 13, color: colors.text.muted, margin: "0 0 14px", maxWidth: 620 }}>{children}</p>
);

const SURFACES: [string, string][] = [["bg/base", colors.bg.base], ["bg/surface", colors.bg.surface], ["bg/card", colors.bg.card], ["bg/elevated", colors.bg.elevated]];
const TEXTS: [string, string][] = [["text/primary", colors.text.primary], ["text/secondary", colors.text.secondary], ["text/muted", colors.text.muted], ["text/accent", colors.text.accent]];

function Pill({ r }: { r: number }) {
  const pass = r >= 4.5; const aaLarge = r >= 3;
  const c = pass ? colors.semantic.success : aaLarge ? colors.semantic.gold : colors.semantic.danger;
  return <span style={{ fontFamily: font.display, fontWeight: 700, fontSize: 11, color: c }}>{r.toFixed(2)} {pass ? "AA" : aaLarge ? "AA large" : "✗"}</span>;
}

export const Contraste: Story = {
  render: () => (
    <Page>
      <H>Contraste (WCAG)</H>
      <Sub>Texto normal precisa de ≥ 4.5:1 (AA) e texto grande/UI ≥ 3:1. Tabela: cada cor de texto sobre cada superfície do tema dark.</Sub>
      <div style={{ display: "grid", gridTemplateColumns: `160px repeat(${SURFACES.length}, 1fr)`, gap: 1, background: colors.bg.border, border: `1px solid ${colors.bg.border}`, borderRadius: 12, overflow: "hidden", maxWidth: 720 }}>
        <div style={{ background: colors.bg.surface, padding: 10 }} />
        {SURFACES.map(([n]) => <div key={n} style={{ background: colors.bg.surface, padding: 10, fontFamily: font.body, fontSize: 11, color: "#fff" }}>{n}</div>)}
        {TEXTS.map(([tn, tc]) => (
          <React.Fragment key={tn}>
            <div style={{ background: colors.bg.surface, padding: 10, fontFamily: font.body, fontSize: 11, color: "#fff" }}>{tn}</div>
            {SURFACES.map(([sn, sc]) => (
              <div key={sn} style={{ background: sc, padding: 10, display: "flex", flexDirection: "column", gap: 4 }}>
                <span style={{ fontFamily: font.body, fontSize: 13, color: tc }}>Aa</span>
                <Pill r={ratio(tc, sc)} />
              </div>
            ))}
          </React.Fragment>
        ))}
      </div>

      <H>Diretrizes</H>
      <ul style={{ fontFamily: font.body, fontSize: 14, color: colors.text.secondary, lineHeight: "24px", maxWidth: 620 }}>
        <li><strong style={{ color: "#fff" }}>Alvos de toque ≥ 44×44px</strong> — botões e ícones clicáveis.</li>
        <li><strong style={{ color: "#fff" }}>Foco visível</strong> — nunca remover o outline sem alternativa (use o token <code style={{ color: "#9fe870" }}>action/focusRing</code>).</li>
        <li><strong style={{ color: "#fff" }}>Cor não é o único sinal</strong> — erro/sucesso sempre com ícone + texto, não só a cor.</li>
        <li><strong style={{ color: "#fff" }}>Ícones</strong> — Phosphor regular; sempre com <code style={{ color: "#9fe870" }}>aria-label</code> quando isolados (ver IconButton).</li>
        <li><strong style={{ color: "#fff" }}>Labels</strong> — todo input/select com label visível, não só placeholder.</li>
      </ul>
    </Page>
  ),
};
