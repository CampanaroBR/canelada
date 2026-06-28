import type { Meta, StoryObj } from "@storybook/react-vite";
import { primitives, semantic, space, radius, shadow, text, textStyle, font } from "./tokens";

const meta: Meta = { title: "Foundations/Overview", parameters: { layout: "fullscreen" } };
export default meta;
type Story = StoryObj;

const Page = ({ children }: { children: React.ReactNode }) => (
  <div style={{ padding: 32, background: "#090909", minHeight: "100vh" }}>{children}</div>
);
const H = ({ children }: { children: React.ReactNode }) => (
  <h2 style={{ fontFamily: font.display, fontWeight: 900, fontSize: 22, color: "#fff", margin: "28px 0 6px" }}>{children}</h2>
);
const Sub = ({ children }: { children: React.ReactNode }) => (
  <p style={{ fontFamily: font.body, fontSize: 13, color: "#7a7a7a", margin: "0 0 14px", maxWidth: 560 }}>{children}</p>
);
const Row = ({ children }: { children: React.ReactNode }) => (
  <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>{children}</div>
);
function Swatch({ name, hex, w = 120 }: { name: string; hex: string; w?: number }) {
  return (
    <div style={{ width: w }}>
      <div style={{ height: 52, borderRadius: 12, background: hex, border: "1px solid rgba(255,255,255,0.12)" }} />
      <div style={{ fontFamily: font.body, fontSize: 11, color: "#fff", marginTop: 6, wordBreak: "break-all" }}>{name}</div>
      <div style={{ fontFamily: font.body, fontSize: 11, color: "#7a7a7a" }}>{hex}</div>
    </div>
  );
}
const scaleRow = (obj: Record<string | number, string>, prefix: string) =>
  Object.entries(obj).map(([k, v]) => <Swatch key={k} name={`${prefix}/${k}`} hex={v} w={104} />);
const group = (obj: Record<string, string>, prefix: string) =>
  Object.entries(obj).map(([k, v]) => <Swatch key={k} name={`${prefix}/${k}`} hex={v} />);

// 1) PRIMITIVOS
export const Primitivos: Story = {
  render: () => (
    <Page>
      <H>Brand (verde)</H>
      <Sub>A cor de marca do Canelada é o verde. Teal, gold, red e purple são apoio.</Sub>
      <Row>{scaleRow(primitives.brand, "brand")}</Row>
      <H>Teal</H><Row>{scaleRow(primitives.teal, "teal")}</Row>
      <H>Gold</H><Row>{scaleRow(primitives.gold, "gold")}</Row>
      <H>Red</H><Row>{scaleRow(primitives.red, "red")}</Row>
      <H>Purple</H><Row>{scaleRow(primitives.purple, "purple")}</Row>
      <H>Neutral</H><Row>{scaleRow(primitives.neutral as Record<string, string>, "neutral")}</Row>
    </Page>
  ),
};

// 2) SEMÂNTICOS (à la Hive: content / background / border / accent / alert / action)
export const SemanticTokens: Story = {
  render: () => {
    const t = semantic.dark;
    return (
      <Page>
        <H>Semantic Tokens — Dark</H>
        <Sub>Tokens por papel (igual ao Hive), resolvidos pro tema Dark do Canelada. Use estes nos componentes, não os primitivos.</Sub>

        <H>Content (texto)</H>
        <Sub>Para textos, ícones e labels.</Sub>
        <Row>{group(t.content, "content")}</Row>

        <H>Background</H>
        <Sub>Fundos de tela, superfícies e componentes.</Sub>
        <Row>{group(t.background, "background")}</Row>

        <H>Border</H>
        <Sub>Bordas de superfícies e inputs.</Sub>
        <Row>{group(t.border, "border")}</Row>

        <H>Accent</H>
        <Sub>Cores de destaque por matiz.</Sub>
        <Row>{group(t.accent, "accent")}</Row>

        <H>Alert</H>
        <Sub>Estados de feedback (success/warning/error/info) + versões subtle.</Sub>
        <Row>{group(t.alert, "alert")}</Row>

        <H>Action</H>
        <Sub>Estados de interação (hover, disabled, active, focus).</Sub>
        <Row>{group(t.action, "action")}</Row>
      </Page>
    );
  },
};

// 3) TEMAS
export const Temas: Story = {
  render: () => {
    type Pal = { background: { brand: string; secondary: string; tertiary: string }; accent: { teal: string; gold: string }; alert: { error: string } };
    const cell = (t: Pal, name: string, bg: string, fg: string) => (
      <div style={{ flex: 1, background: bg, borderRadius: 16, padding: 20, border: "1px solid rgba(128,128,128,0.3)" }}>
        <p style={{ fontFamily: font.display, fontWeight: 900, fontSize: 16, color: fg, margin: "0 0 12px" }}>{name}</p>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {[t.background.brand, t.accent.teal, t.background.secondary, t.background.tertiary, t.alert.error, t.accent.gold].map((c, i) => (
            <div key={i} style={{ width: 40, height: 40, borderRadius: 8, background: c, border: "1px solid rgba(128,128,128,0.4)" }} />
          ))}
        </div>
      </div>
    );
    return (
      <Page>
        <H>Temas</H>
        <Sub>Dark é o padrão do Canelada; Light disponível para futuros contextos.</Sub>
        <div style={{ display: "flex", gap: 16 }}>
          {cell(semantic.dark, "Dark (padrão)", "#0a0e0e", "#fff")}
          {cell(semantic.light, "Light", "#f5f5f5", "#090909")}
        </div>
      </Page>
    );
  },
};

// 4) TIPOGRAFIA
export const Tipografia: Story = {
  render: () => {
    const groups = ["display", "heading", "paragraph", "label", "overline"];
    const keys = Object.keys(text) as (keyof typeof text)[];
    return (
      <Page>
        <H>Tipografia</H>
        <Sub>Nomenclatura do Hive (Display / Heading / Paragraph / Label / Overline). Display, Heading e Overline = Barlow; Paragraph e Label = Inter.</Sub>
        {groups.map((g) => (
          <div key={g} style={{ marginBottom: 8 }}>
            <p style={{ fontFamily: font.display, fontWeight: 800, fontSize: 13, color: "#9fe870", textTransform: "uppercase", letterSpacing: "0.06em", margin: "20px 0 10px" }}>{g}</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {keys.filter((k) => k.startsWith(g)).map((k) => (
                <div key={k} style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
                  <span style={{ ...textStyle(k), color: "#fff" }}>{k}</span>
                  <span style={{ fontFamily: font.body, fontSize: 11, color: "#7a7a7a" }}>
                    {text[k].fontSize}px / {text[k].lineHeight} · {text[k].fontFamily === "display" ? "Barlow" : "Inter"} {text[k].fontWeight}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </Page>
    );
  },
};

// 5) ESPAÇO / RAIO / SOMBRA
export const EspacoRaioSombra: Story = {
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
      <H>Sombras</H>
      <Row>
        {Object.entries(shadow).map(([k, v]) => (
          <div key={k} style={{ textAlign: "center" }}>
            <div style={{ width: 120, height: 76, background: "#171717", borderRadius: 16, boxShadow: v, border: "1px solid #2c2c2c" }} />
            <div style={{ fontFamily: font.body, fontSize: 11, color: "#7a7a7a", marginTop: 8 }}>{k}</div>
          </div>
        ))}
      </Row>
    </Page>
  ),
};
