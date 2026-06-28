import type { Meta, StoryObj } from "@storybook/react-vite";
import { colors, font } from "./tokens";
import { IconBox } from "./components/IconBox";

const meta: Meta = { title: "Foundations/Icons", parameters: { layout: "fullscreen" } };
export default meta;
type Story = StoryObj;

// amostras (no app: @phosphor-icons/react). Aqui SVGs inline só pra documentar tamanhos/tons.
const ICONS: Record<string, string> = {
  bell: "M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 01-3.4 0",
  check: "M20 6L9 17l-5-5",
  user: "M20 21a8 8 0 10-16 0M12 11a4 4 0 100-8 4 4 0 000 8",
  share: "M4 12v8h16v-8M12 16V4M8 8l4-4 4 4",
  list: "M3 6h18M3 12h18M3 18h18",
  caret: "M9 18l6-6-6-6",
};

const Ic = ({ d, c = colors.text.primary, s = 22 }: { d: string; c?: string; s?: number }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={d} /></svg>
);

export const Uso: Story = {
  render: () => (
    <div style={{ padding: 32, background: colors.bg.base, minHeight: "100vh" }}>
      <h2 style={{ fontFamily: font.display, fontWeight: 900, fontSize: 22, color: "#fff", margin: "0 0 8px" }}>Ícones</h2>
      <p style={{ fontFamily: font.body, fontSize: 14, color: colors.text.secondary, maxWidth: 520, margin: "0 0 24px" }}>
        O Canelada usa a biblioteca <strong style={{ color: "#fff" }}>@phosphor-icons/react</strong> (não um set próprio).
        Padrão: ícone outline (weight=&quot;regular&quot;) em <strong style={{ color: "#fff" }}>verde accent</strong> dentro de um <code style={{ color: "#9fe870" }}>IconBox</code> nas linhas/headers.
      </p>

      <h3 style={{ fontFamily: font.display, fontWeight: 800, fontSize: 14, color: "#fff", margin: "0 0 12px" }}>Em IconBox (tons)</h3>
      <div style={{ display: "flex", gap: 12, marginBottom: 28 }}>
        <IconBox tone="default"><Ic d={ICONS.bell} c={colors.accent.default} s={20} /></IconBox>
        <IconBox tone="accent"><Ic d={ICONS.check} c="#0a1a06" s={20} /></IconBox>
        <IconBox tone="danger"><Ic d={ICONS.share} c="#1a0606" s={20} /></IconBox>
      </div>

      <h3 style={{ fontFamily: font.display, fontWeight: 800, fontSize: 14, color: "#fff", margin: "0 0 12px" }}>Amostra</h3>
      <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
        {Object.entries(ICONS).map(([name, d]) => (
          <div key={name} style={{ textAlign: "center" }}>
            <Ic d={d} c="#fff" s={24} />
            <div style={{ fontFamily: font.body, fontSize: 11, color: colors.text.muted, marginTop: 6 }}>{name}</div>
          </div>
        ))}
      </div>
    </div>
  ),
};
