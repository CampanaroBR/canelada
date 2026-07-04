import type { Meta, StoryObj } from "@storybook/react-vite";
import { asset } from "./asset";

const meta: Meta = { title: "Foundations/Medalhas" };
export default meta;
type Story = StoryObj;

// Fonte da verdade: TRAIT_BADGE (feed) — slug → arquivo real (case-sensitive no Vercel)
// + nome do seed. Só as conquistas válidas (sem os arquivos legados duplicados).
const MEDALHAS: { slug: string; nome: string; file: string }[] = [
  { slug: "primeira-vitoria", nome: "Primeira vitória", file: "/conquistas/primeira-vitoria.png" },
  { slug: "em-chamas", nome: "Em chamas", file: "/conquistas/em-chamas.png" },
  { slug: "rei-do-mes", nome: "Rei do mês", file: "/conquistas/rei-do-mes.png" },
  { slug: "rei-absoluto", nome: "Rei absoluto", file: "/conquistas/rei-absoluto.png" },
  { slug: "racudo-do-mes", nome: "Raçudo do mês", file: "/conquistas/racudo-do-mes.png" },
  { slug: "mais-presente", nome: "Mais presente", file: "/conquistas/mais-presente.png" },
  { slug: "consistente", nome: "Consistente", file: "/conquistas/consistente.png" },
  { slug: "completo", nome: "Completo", file: "/conquistas/completo.png" },
  { slug: "invicto", nome: "Invicto", file: "/conquistas/invicto.png" },
  { slug: "veterano", nome: "Veterano", file: "/conquistas/veterano.png" },
  { slug: "lenda", nome: "Lenda", file: "/conquistas/lenda.png" },
  { slug: "alma-do-grupo", nome: "Alma do Grupo", file: "/conquistas/alma-do-grupo.png" },
  { slug: "virada-de-chave", nome: "Virada de chave", file: "/conquistas/virada-de-chave.png" },
  { slug: "irregular", nome: "Irregular", file: "/conquistas/irregular.png" },
  { slug: "trofeu-bagre", nome: "Troféu Bagre", file: "/conquistas/trofeu-bagre.png" },
  { slug: "lanterna", nome: "Lanterna", file: "/conquistas/lanterna.png" },
  { slug: "ma-fase", nome: "Má fase", file: "/conquistas/ma-fase.png" },
  { slug: "so-perde", nome: "Só perde", file: "/conquistas/so-perde.png" },
  { slug: "jogador-invisivel", nome: "Jogador invisível", file: "/conquistas/jogador-invisivel.png" },
];

export const Galeria: Story = {
  render: () => (
    <div style={{ maxWidth: 760 }}>
      <p style={{ margin: "0 0 12px", fontFamily: "var(--font-display, sans-serif)", fontWeight: 800, fontSize: 12, letterSpacing: "0.08em", textTransform: "uppercase", color: "#9fe870" }}>
        Conquistas · {MEDALHAS.length}
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 12 }}>
        {MEDALHAS.map((m) => (
          <div key={m.slug} style={{ background: "#141414", border: "1px solid #2c2c2c", borderRadius: 16, padding: 14, display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
            <div style={{ width: 96, height: 96, display: "flex", alignItems: "center", justifyContent: "center" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={asset(m.file)} alt={m.nome} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
            </div>
            <span style={{ fontFamily: "var(--font-display, sans-serif)", fontWeight: 800, fontSize: 13, color: "#fff", textAlign: "center" }}>{m.nome}</span>
            <code style={{ fontSize: 10, color: "#7a7a7a" }}>{m.slug}</code>
          </div>
        ))}
      </div>
    </div>
  ),
};
