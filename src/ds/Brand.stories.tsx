import type { Meta, StoryObj } from "@storybook/react-vite";
import { colors, font } from "./tokens";

const meta: Meta = { title: "Foundations/Marca", parameters: { layout: "fullscreen" } };
export default meta;
type Story = StoryObj;

const Page = ({ children }: { children: React.ReactNode }) => (
  <div style={{ padding: 32, background: colors.bg.base, minHeight: "100vh", maxWidth: 760 }}>{children}</div>
);
const H = ({ children }: { children: React.ReactNode }) => (
  <h2 style={{ fontFamily: font.display, fontWeight: 900, fontSize: 22, color: "#fff", margin: "28px 0 8px" }}>{children}</h2>
);

export const Marca: Story = {
  render: () => (
    <Page>
      <h1 style={{ fontFamily: font.display, fontWeight: 900, fontSize: 32, color: "#fff", margin: "0 0 4px" }}>Canelada</h1>
      <p style={{ fontFamily: font.body, fontSize: 14, color: colors.text.muted, margin: 0 }}>O baba virou resenha.</p>

      <H>Logo</H>
      <div style={{ display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
        {[colors.bg.base, colors.bg.card, colors.accent.default].map((bg, i) => (
          <div key={i} style={{ width: 120, height: 120, borderRadius: 16, background: bg, border: `1px solid ${colors.bg.border}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="Canelada" width={64} height={64} style={{ borderRadius: "50%", objectFit: "cover" }} />
          </div>
        ))}
      </div>
      <p style={{ fontFamily: font.body, fontSize: 12, color: colors.text.muted, marginTop: 8 }}>Use o logo com respiro; fundo escuro é o padrão.</p>

      <H>Cor de marca</H>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        {[["brand/primary (verde)", colors.brand.primary], ["accent/strong", colors.accent.strong], ["apoio: teal", colors.accent.teal], ["apoio: gold", colors.semantic.gold]].map(([n, c]) => (
          <div key={n} style={{ width: 150 }}>
            <div style={{ height: 56, borderRadius: 12, background: c, border: "1px solid rgba(255,255,255,0.12)" }} />
            <div style={{ fontFamily: font.body, fontSize: 11, color: "#fff", marginTop: 6 }}>{n}</div>
            <div style={{ fontFamily: font.body, fontSize: 11, color: colors.text.muted }}>{c}</div>
          </div>
        ))}
      </div>

      <H>Tipografia</H>
      <p style={{ fontFamily: font.body, fontSize: 14, color: colors.text.secondary, lineHeight: "22px" }}>
        <strong style={{ color: "#fff" }}>Barlow</strong> nos títulos e números (esportivo, encorpado) ·
        <strong style={{ color: "#fff" }}> Google Sans</strong> no corpo e labels.
      </p>

      <H>Tom de voz</H>
      <ul style={{ fontFamily: font.body, fontSize: 14, color: colors.text.secondary, lineHeight: "24px" }}>
        <li>✅ Informal e direto, como a resenha do grupo: "Confirmar presença", "Bora pro baba!".</li>
        <li>✅ Gírias de futebol com leveza (baba, resenha, craque, bagre).</li>
        <li>🚫 Evitar formalidade corporativa e textos longos.</li>
        <li>🚫 Sem zoeira ofensiva — é resenha entre amigos, não bullying.</li>
      </ul>
    </Page>
  ),
};
