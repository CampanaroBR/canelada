import type { Meta, StoryObj } from "@storybook/react-vite";
import { colors, font } from "./tokens";

const meta: Meta = { title: "Foundations/Números (comparação)", parameters: { layout: "fullscreen" } };
export default meta;
type Story = StoryObj;

const CANDIDATES = [
  { name: "Barlow (atual)", stack: font.display },
  { name: "DM Sans", stack: '"DM Sans", sans-serif' },
  { name: "Manrope", stack: '"Manrope", sans-serif' },
  { name: "Plus Jakarta Sans", stack: '"Plus Jakarta Sans", sans-serif' },
  { name: "Lexend", stack: '"Lexend", sans-serif' },
  { name: "Sora", stack: '"Sora", sans-serif' },
];

function Demo({ stack }: { stack: string }) {
  return (
    <div style={{ display: "flex", alignItems: "baseline", gap: 24, flexWrap: "wrap", fontFamily: stack }}>
      {/* OVERALL */}
      <div style={{ textAlign: "center" }}>
        <div style={{ fontWeight: 900, fontSize: 56, lineHeight: 1, color: colors.accent.default, fontVariantNumeric: "tabular-nums" }}>87</div>
        <div style={{ fontFamily: font.body, fontSize: 9, letterSpacing: "1.5px", color: colors.accent.default }}>OVERALL</div>
      </div>
      {/* placar / pts */}
      <div style={{ fontWeight: 800, fontSize: 30, color: "#fff", fontVariantNumeric: "tabular-nums" }}>30<span style={{ fontFamily: font.body, fontSize: 11, color: "#7a7a7a" }}> pts</span></div>
      {/* fração */}
      <div style={{ fontWeight: 800, fontSize: 22, color: "#fff" }}>
        <span style={{ color: colors.accent.default }}>12</span><span style={{ color: "#7a7a7a", fontWeight: 500 }}>/24</span>
      </div>
      {/* % */}
      <div style={{ fontWeight: 700, fontSize: 18, color: "#fff", fontVariantNumeric: "tabular-nums" }}>8%</div>
      {/* dígitos */}
      <div style={{ fontWeight: 700, fontSize: 20, color: "#cccccc", fontVariantNumeric: "tabular-nums" }}>0123456789</div>
      {/* horário */}
      <div style={{ fontWeight: 700, fontSize: 18, color: "#fff" }}>22:30</div>
    </div>
  );
}

export const Comparacao: Story = {
  render: () => (
    <div style={{ padding: 32, background: "#090909", minHeight: "100vh" }}>
      <h2 style={{ fontFamily: font.display, fontWeight: 900, fontSize: 22, color: "#fff", margin: "0 0 6px" }}>Números — comparação de fontes</h2>
      <p style={{ fontFamily: font.body, fontSize: 13, color: "#7a7a7a", margin: "0 0 24px", maxWidth: 560 }}>
        Mesmos números (OVERALL, placar, fração, %, dígitos, horário) em cada candidata. &quot;Google Sans&quot; não está no Google Fonts;
        estas são alternativas geométrico-humanistas com bons numerais. Escolha uma e eu fixo como <code style={{ color: "#9fe870" }}>font.numeric</code>.
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {CANDIDATES.map((c) => (
          <div key={c.name} style={{ padding: "18px 20px", background: "#171717", border: "1px solid #2c2c2c", borderRadius: 16 }}>
            <div style={{ fontFamily: font.body, fontSize: 12, color: "#9fe870", fontWeight: 700, marginBottom: 12 }}>{c.name}</div>
            <Demo stack={c.stack} />
          </div>
        ))}
      </div>
    </div>
  ),
};
