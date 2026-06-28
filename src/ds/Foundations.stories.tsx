import type { Meta, StoryObj } from "@storybook/react-vite";
import { primitives, colors, space, radius, text, textStyle, font } from "./tokens";

const meta: Meta = { title: "Foundations/Overview", parameters: { layout: "fullscreen" } };
export default meta;
type Story = StoryObj;

const H = ({ children }: { children: React.ReactNode }) => (
  <h2 style={{ fontFamily: font.display, fontWeight: 900, fontSize: 22, color: "#fff", margin: "28px 0 12px" }}>{children}</h2>
);

function Swatch({ name, hex }: { name: string; hex: string }) {
  return (
    <div style={{ width: 120 }}>
      <div style={{ height: 56, borderRadius: 12, background: hex, border: "1px solid #2c2c2c" }} />
      <div style={{ fontFamily: font.body, fontSize: 11, color: "#fff", marginTop: 6 }}>{name}</div>
      <div style={{ fontFamily: font.body, fontSize: 11, color: "#7a7a7a" }}>{hex}</div>
    </div>
  );
}

const Row = ({ children }: { children: React.ReactNode }) => (
  <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>{children}</div>
);

export const Cores: Story = {
  render: () => (
    <div style={{ padding: 32, background: "#090909", minHeight: "100vh" }}>
      <H>Marca & Accent</H>
      <Row>
        <Swatch name="brand/primary" hex={colors.brand.primary} />
        <Swatch name="accent/default" hex={colors.accent.default} />
        <Swatch name="accent/strong" hex={colors.accent.strong} />
        <Swatch name="semantic/gold" hex={colors.semantic.gold} />
        <Swatch name="semantic/danger" hex={colors.semantic.danger} />
      </Row>
      <H>Superfícies</H>
      <Row>
        <Swatch name="bg/base" hex={colors.bg.base} />
        <Swatch name="bg/surface" hex={colors.bg.surface} />
        <Swatch name="bg/card" hex={colors.bg.card} />
        <Swatch name="bg/elevated" hex={colors.bg.elevated} />
        <Swatch name="bg/border" hex={colors.bg.border} />
      </Row>
      <H>Green</H>
      <Row>{Object.entries(primitives.green).map(([k, v]) => <Swatch key={k} name={`green/${k}`} hex={v} />)}</Row>
      <H>Neutral</H>
      <Row>{Object.entries(primitives.neutral).map(([k, v]) => <Swatch key={k} name={`neutral/${k}`} hex={v} />)}</Row>
    </div>
  ),
};

export const Tipografia: Story = {
  render: () => (
    <div style={{ padding: 32, background: "#090909", minHeight: "100vh" }}>
      <H>Escala tipográfica</H>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {(Object.keys(text) as (keyof typeof text)[]).map((k) => (
          <div key={k}>
            <span style={{ ...textStyle(k), color: "#fff" }}>{k}</span>
            <span style={{ fontFamily: font.body, fontSize: 11, color: "#7a7a7a", marginLeft: 12 }}>
              {text[k].fontSize}px / {String(text[k].lineHeight)}
            </span>
          </div>
        ))}
      </div>
    </div>
  ),
};

export const EspacoERaio: Story = {
  render: () => (
    <div style={{ padding: 32, background: "#090909", minHeight: "100vh" }}>
      <H>Espaçamento</H>
      <Row>
        {Object.entries(space).map(([k, v]) => (
          <div key={k} style={{ textAlign: "center" }}>
            <div style={{ width: v, height: v, background: "#9fe870", borderRadius: 4 }} />
            <div style={{ fontFamily: font.body, fontSize: 11, color: "#7a7a7a", marginTop: 4 }}>{k} · {v}</div>
          </div>
        ))}
      </Row>
      <H>Raios</H>
      <Row>
        {Object.entries(radius).filter(([k]) => k !== "pill").map(([k, v]) => (
          <div key={k} style={{ textAlign: "center" }}>
            <div style={{ width: 64, height: 64, background: "#171717", border: "1px solid #2c2c2c", borderRadius: v }} />
            <div style={{ fontFamily: font.body, fontSize: 11, color: "#7a7a7a", marginTop: 4 }}>{k} · {v}</div>
          </div>
        ))}
      </Row>
    </div>
  ),
};
