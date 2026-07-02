import type { Meta, StoryObj } from "@storybook/react-vite";
import { tokenMap } from "./tokens";

const meta: Meta = { title: "Foundations/Tokens (Encore)" };
export default meta;
type Story = StoryObj;

const ROLE = {
  prop: { label: "propriedade", color: "#8a8a8a" },
  element: { label: "elemento", color: "#a78bfa" },
  priority: { label: "prioridade", color: "#9fe870" },
  state: { label: "estado", color: "#ED93B1" },
} as const;
type Role = keyof typeof ROLE;

const mono = "ui-monospace, SFMono-Regular, Menlo, monospace";

/* Chip anatômico: token com colchete colorido sob cada bloco */
function Anatomy({ segs }: { segs: { t: string; role: Role }[] }) {
  return (
    <div style={{ display: "inline-flex", flexDirection: "column", marginBottom: 14 }}>
      <div style={{ display: "inline-flex", background: "#141414", border: "1px solid #2c2c2c", borderRadius: 10, padding: "10px 14px", gap: 6, fontFamily: mono, fontSize: 15 }}>
        <span style={{ color: "#6e6e6e" }}>color-</span>
        {segs.map((s, i) => (
          <span key={i} style={{ color: s.role === "prop" ? "#cfcfcf" : "#fff" }}>
            {s.t}{i < segs.length - 1 ? "-" : ""}
          </span>
        ))}
      </div>
      <div style={{ display: "inline-flex", gap: 6, paddingLeft: 58, marginTop: 4 }}>
        {segs.map((s, i) => (
          <span key={i} style={{ flex: `0 0 auto`, minWidth: (s.t.length + 1) * 9, height: 8, borderLeft: `2px solid ${ROLE[s.role].color}`, borderRight: `2px solid ${ROLE[s.role].color}`, borderBottom: `2px solid ${ROLE[s.role].color}`, borderRadius: "0 0 3px 3px" }} />
        ))}
      </div>
    </div>
  );
}

export const Taxonomia: Story = {
  render: () => (
    <div style={{ maxWidth: 760, color: "#e5e5e5", fontFamily: "var(--font-body, sans-serif)" }}>
      <p style={{ fontFamily: mono, fontSize: 16, color: "#fff", margin: "0 0 6px" }}>
        color-[propriedade]-[elemento?]-[prioridade]-[estado?]
      </p>
      <p style={{ fontSize: 14, color: "#8a8a8a", margin: "0 0 20px", lineHeight: 1.6 }}>
        Cada token semântico segue estritamente essa ordem de blocos (modelo Spotify Encore). Elemento e estado são opcionais.
      </p>

      <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 24 }}>
        {(Object.keys(ROLE) as Role[]).map((r) => (
          <span key={r} style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, color: "#cfcfcf" }}>
            <span style={{ width: 12, height: 12, borderRadius: 3, background: ROLE[r].color }} /> {ROLE[r].label}
          </span>
        ))}
      </div>

      <Anatomy segs={[{ t: "bg", role: "prop" }, { t: "surface", role: "element" }, { t: "secondary", role: "priority" }, { t: "hover", role: "state" }]} />
      <Anatomy segs={[{ t: "bg", role: "prop" }, { t: "fill", role: "element" }, { t: "primary", role: "priority" }, { t: "active", role: "state" }]} />
      <Anatomy segs={[{ t: "text", role: "prop" }, { t: "primary", role: "priority" }, { t: "disabled", role: "state" }]} />
      <Anatomy segs={[{ t: "border", role: "prop" }, { t: "tertiary", role: "priority" }, { t: "default", role: "state" }]} />
      <Anatomy segs={[{ t: "icon", role: "prop" }, { t: "secondary", role: "priority" }, { t: "hover", role: "state" }]} />
    </div>
  ),
};

export const Swatches: Story = {
  render: () => {
    const entries = Object.entries(tokenMap);
    return (
      <div style={{ maxWidth: 760 }}>
        <p style={{ fontFamily: mono, fontSize: 13, color: "#8a8a8a", margin: "0 0 14px" }}>{entries.length} tokens · consumir via var(--color-…)</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))", gap: 8 }}>
          {entries.map(([name, val]) => (
            <div key={name} style={{ display: "flex", alignItems: "center", gap: 10, background: "#141414", border: "1px solid #2c2c2c", borderRadius: 10, padding: 8 }}>
              <span style={{ width: 34, height: 34, borderRadius: 8, background: val, border: "1px solid rgba(255,255,255,0.14)", flexShrink: 0 }} />
              <div style={{ minWidth: 0 }}>
                <div style={{ fontFamily: mono, fontSize: 11, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>color-{name}</div>
                <div style={{ fontFamily: mono, fontSize: 11, color: "#7a7a7a" }}>{val}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  },
};

export const Governanca: Story = {
  render: () => (
    <div style={{ maxWidth: 640, color: "#d5d5d5", fontFamily: "var(--font-body, sans-serif)", fontSize: 15, lineHeight: 1.7 }}>
      <ul style={{ paddingLeft: 18, margin: 0, display: "flex", flexDirection: "column", gap: 12 }}>
        <li><strong style={{ color: "#fff" }}>Proibido usar primitivos no layout.</strong> Nunca aplique <code style={{ color: "#e56767" }}>#9fe870</code> ou <code style={{ color: "#e56767" }}>brand.300</code> direto — use o token semântico (<code style={{ color: "#9fe870" }}>var(--color-bg-fill-primary-default)</code>).</li>
        <li><strong style={{ color: "#fff" }}>Crie por intenção.</strong> Se algo não cabe em <code>primary/secondary/tertiary</code>, ajuste o contexto da taxonomia — não force um token inadequado.</li>
        <li><strong style={{ color: "#fff" }}>Ordem inversa não existe.</strong> <code style={{ color: "#e56767" }}>color-hover-bg-primary</code> viola o sistema e quebra scripts. Sempre <code>propriedade → elemento → prioridade → estado</code>.</li>
        <li><strong style={{ color: "#fff" }}>Estado é opcional.</strong> Só adicione <code>hover/active/disabled</code> quando o elemento é realmente interativo.</li>
        <li><strong style={{ color: "#fff" }}>Export.</strong> A fonte é <code>src/ds/tokens.color.json</code> → <code>npm run gen:tokens</code> gera <code>tokens.css</code> (CSS vars) e <code>public/tokens.json</code> (W3C DTCG).</li>
      </ul>
    </div>
  ),
};
