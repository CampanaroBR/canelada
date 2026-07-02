import type { Meta, StoryObj } from "@storybook/react-vite";

const meta: Meta = { title: "Foundations/Personagens" };
export default meta;
type Story = StoryObj;

type P = { slug: string; nome: string };
const GRUPOS: { label: string; tom: string; itens: P[] }[] = [
  {
    label: "Futebol · obrigatório",
    tom: "#9fe870",
    itens: [
      { slug: "categoria", nome: "Categoria" },
      { slug: "matador", nome: "Matador" },
      { slug: "paredao", nome: "Paredão" },
      { slug: "racudo", nome: "Raçudo" },
      { slug: "xerife", nome: "Xerife" },
      { slug: "garcom", nome: "Garçom" },
      { slug: "driblador", nome: "Driblador" },
    ],
  },
  {
    label: "Resenha · opcional",
    tom: "#f0b84a",
    itens: [
      { slug: "resenha-forte", nome: "Só Resenha" },
      { slug: "delegado", nome: "Delegado" },
      { slug: "chorao", nome: "Chorão" },
      { slug: "reclamao", nome: "Reclamão" },
      { slug: "paneleiro", nome: "Paneleiro" },
    ],
  },
  {
    label: "Destaques negativos · opcional",
    tom: "#f0b84a",
    itens: [
      { slug: "firuleiro", nome: "Firuleiro" },
      { slug: "pregueiro", nome: "Pregueiro" },
      { slug: "cone", nome: "Cone" },
      { slug: "bagre", nome: "Bagre da Noite" },
    ],
  },
];

function Card({ p }: { p: P }) {
  return (
    <div style={{ background: "#141414", border: "1px solid #2c2c2c", borderRadius: 16, padding: 12, display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
      <div style={{ width: 120, height: 120, display: "flex", alignItems: "center", justifyContent: "center" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={`/votacao-mascot/${p.slug}.png`} alt={p.nome} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
      </div>
      <span style={{ fontFamily: "var(--font-display, sans-serif)", fontWeight: 800, fontSize: 14, color: "#fff", textAlign: "center" }}>{p.nome}</span>
      <code style={{ fontSize: 11, color: "#7a7a7a" }}>{p.slug}</code>
    </div>
  );
}

export const Galeria: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 28, maxWidth: 760 }}>
      {GRUPOS.map((g) => (
        <section key={g.label}>
          <p style={{ margin: "0 0 12px", fontFamily: "var(--font-display, sans-serif)", fontWeight: 800, fontSize: 12, letterSpacing: "0.08em", textTransform: "uppercase", color: g.tom }}>
            {g.label} · {g.itens.length}
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 12 }}>
            {g.itens.map((p) => <Card key={p.slug} p={p} />)}
          </div>
        </section>
      ))}
    </div>
  ),
};
