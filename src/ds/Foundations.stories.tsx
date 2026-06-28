import type { Meta, StoryObj } from "@storybook/react-vite";
import { primitives, theme, colors, space, radius, shadow, text, textStyle, font } from "./tokens";

const meta: Meta = { title: "Foundations/Overview", parameters: { layout: "fullscreen" } };
export default meta;
type Story = StoryObj;

const Page = ({ children, bg = primitives.neutral[1000] }: { children: React.ReactNode; bg?: string }) => (
  <div style={{ padding: 32, background: bg, minHeight: "100vh" }}>{children}</div>
);
const H = ({ children }: { children: React.ReactNode }) => (
  <h2 style={{ fontFamily: font.display, fontWeight: 900, fontSize: 22, color: "#fff", margin: "28px 0 12px" }}>{children}</h2>
);
const Row = ({ children }: { children: React.ReactNode }) => (
  <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>{children}</div>
);
function Swatch({ name, hex, onDark = true }: { name: string; hex: string; onDark?: boolean }) {
  return (
    <div style={{ width: 116 }}>
      <div style={{ height: 56, borderRadius: 12, background: hex, border: "1px solid rgba(255,255,255,0.12)" }} />
      <div style={{ fontFamily: font.body, fontSize: 11, color: onDark ? "#fff" : "#090909", marginTop: 6 }}>{name}</div>
      <div style={{ fontFamily: font.body, fontSize: 11, color: "#7a7a7a" }}>{hex}</div>
    </div>
  );
}
const scale = (obj: Record<string, string>, prefix: string) =>
  Object.entries(obj).map(([k, v]) => <Swatch key={k} name={`${prefix}/${k}`} hex={v} />);

export const Paleta: Story = {
  render: () => (
    <Page>
      <H>Marca</H>
      <Row>{scale(primitives.teal, "teal")}</Row>
      <H>Accent (verde)</H>
      <Row>{scale(primitives.green, "green")}</Row>
      <H>Gold</H>
      <Row>{scale(primitives.gold, "gold")}</Row>
      <H>Red</H>
      <Row>{scale(primitives.red, "red")}</Row>
      <H>Neutral</H>
      <Row>{scale(primitives.neutral as unknown as Record<string, string>, "neutral")}</Row>
    </Page>
  ),
};

export const Semanticos: Story = {
  render: () => {
    const t = theme.dark;
    return (
      <Page>
        <H>Brand / Accent</H>
        <Row>
          <Swatch name="brand/primary" hex={t.brand.primary} />
          <Swatch name="accent/default" hex={t.accent.default} />
          <Swatch name="accent/strong" hex={t.accent.strong} />
        </Row>
        <H>Superfícies</H>
        <Row>
          <Swatch name="bg/base" hex={t.bg.base} />
          <Swatch name="bg/surface" hex={t.bg.surface} />
          <Swatch name="bg/card" hex={t.bg.card} />
          <Swatch name="bg/elevated" hex={t.bg.elevated} />
          <Swatch name="border (#2c2c2c)" hex={colors.bg.border} />
        </Row>
        <H>Semânticos</H>
        <Row>
          <Swatch name="success" hex={t.semantic.success} />
          <Swatch name="danger" hex={colors.semantic.danger} />
          <Swatch name="gold" hex={t.semantic.gold} />
        </Row>
        <H>Personagens</H>
        <Row>
          <Swatch name="matador" hex={t.character.matador} />
          <Swatch name="categoria" hex={t.character.categoria} />
          <Swatch name="paredao" hex={t.character.paredao} />
        </Row>
      </Page>
    );
  },
};

export const Temas: Story = {
  render: () => {
    type Pal = {
      brand: { primary: string };
      accent: { default: string };
      bg: { card: string; elevated: string };
      semantic: { danger: string; gold: string };
    };
    const cell = (t: Pal, name: string, bg: string, fg: string) => (
      <div style={{ flex: 1, background: bg, borderRadius: 16, padding: 20, border: "1px solid rgba(128,128,128,0.3)" }}>
        <p style={{ fontFamily: font.display, fontWeight: 900, fontSize: 16, color: fg, margin: "0 0 12px" }}>{name}</p>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {[t.brand.primary, t.accent.default, t.bg.card, t.bg.elevated, t.semantic.danger, t.semantic.gold].map((c, i) => (
            <div key={i} style={{ width: 40, height: 40, borderRadius: 8, background: c, border: "1px solid rgba(128,128,128,0.4)" }} />
          ))}
        </div>
      </div>
    );
    return (
      <Page>
        <H>Temas</H>
        <div style={{ display: "flex", gap: 16 }}>
          {cell(theme.dark, "Dark (padrão)", "#0a0e0e", "#fff")}
          {cell(theme.light, "Light", "#f5f5f5", "#090909")}
        </div>
      </Page>
    );
  },
};

export const Tipografia: Story = {
  render: () => (
    <Page>
      <H>Escala tipográfica</H>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {(Object.keys(text) as (keyof typeof text)[]).map((k) => (
          <div key={k}>
            <span style={{ ...textStyle(k), color: "#fff" }}>{k}</span>
            <span style={{ fontFamily: font.body, fontSize: 11, color: "#7a7a7a", marginLeft: 12 }}>
              {text[k].fontSize}px / {text[k].lineHeight} · {text[k].fontFamily === "display" ? "Barlow" : "Inter"} {text[k].fontWeight}
            </span>
          </div>
        ))}
      </div>
    </Page>
  ),
};

export const EspacoERaio: Story = {
  render: () => (
    <Page>
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
    </Page>
  ),
};

export const Sombras: Story = {
  render: () => (
    <Page>
      <H>Sombras / Elevação</H>
      <Row>
        {Object.entries(shadow).map(([k, v]) => (
          <div key={k} style={{ textAlign: "center" }}>
            <div style={{ width: 120, height: 80, background: "#171717", borderRadius: 16, boxShadow: v, border: "1px solid #2c2c2c" }} />
            <div style={{ fontFamily: font.body, fontSize: 11, color: "#7a7a7a", marginTop: 8 }}>{k}</div>
          </div>
        ))}
      </Row>
    </Page>
  ),
};
