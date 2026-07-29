"use client";

import Image from "next/image";
import { BottomSheet } from "@/ds";

export type PersonagemItem = { slug: string; nome: string; emoji: string | null; vezes: number; bg: string; mascote: string };
export type RodadaItem = { data: string; participantes?: number; votos?: number };

export type SheetKind = "PERSONAGENS" | "PRESENÇAS" | "MVP's" | "BAGRES";

export interface StatSheetsProps {
  aberta: SheetKind | null;
  onClose: () => void;
  personagens: PersonagemItem[];
  presencas: RodadaItem[];
  mvps: RodadaItem[];
  bagres: RodadaItem[];
}

const TITULOS: Record<SheetKind, { titulo: string; vazio: string }> = {
  // "Vitórias" confundia — num app de futebol lê-se como "ganhou X jogos".
  // O que o número conta é quantas rodadas o jogador FOI aquele personagem.
  "PERSONAGENS": { titulo: "Personagens", vazio: "Ainda não levou nenhum personagem." },
  "PRESENÇAS": { titulo: "Presenças", vazio: "Nenhuma presença registrada ainda." },
  "MVP's": { titulo: "Craque da rodada", vazio: "Ainda não foi craque da rodada." },
  "BAGRES": { titulo: "Bagre da noite", vazio: "Nunca levou o bagre. Segue assim!" },
};

const fmtData = (iso: string) =>
  new Date(iso).toLocaleDateString("pt-BR", { weekday: "short", day: "2-digit", month: "short", timeZone: "UTC" })
    .replace(/\./g, "");

/** Sheets de detalhe dos números do perfil (tocar no stat abre a lista por trás
 *  daquele número — antes eram só números soltos, sem como conferir de onde vinham). */
export function StatSheets({ aberta, onClose, personagens, presencas, mvps, bagres }: StatSheetsProps) {
  const meta = aberta ? TITULOS[aberta] : null;
  const rodadas = aberta === "PRESENÇAS" ? presencas : aberta === "MVP's" ? mvps : aberta === "BAGRES" ? bagres : [];
  const vazio = aberta === "PERSONAGENS" ? personagens.length === 0 : rodadas.length === 0;

  return (
    <BottomSheet open={!!aberta} onClose={onClose} bg="#0d0d0d">
      <div style={{ padding: "4px 16px calc(16px + env(safe-area-inset-bottom, 0px))" }}>
        <h2 style={{
          fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 18,
          color: "#fff", margin: "0 0 4px",
        }}>
          {meta?.titulo ?? ""}
        </h2>
        <p style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "#8a8a8a", margin: "0 0 16px" }}>
          {aberta === "PERSONAGENS"
            ? `${personagens.length} ${personagens.length === 1 ? "diferente" : "diferentes"} · ${personagens.reduce((t, p) => t + p.vezes, 0)}x no total`
            : `${rodadas.length} ${rodadas.length === 1 ? "rodada" : "rodadas"}`}
        </p>

        {vazio ? (
          <p style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "#7a7a7a", padding: "24px 0", textAlign: "center" }}>
            {meta?.vazio}
          </p>
        ) : aberta === "PERSONAGENS" ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {personagens.map((p) => (
              <div key={p.slug} style={{
                display: "flex", alignItems: "center", gap: 12,
                background: "#141414", border: "1px solid #242424",
                borderRadius: 14, padding: 10,
              }}>
                {/* Miniatura só-ilustração: fundo do prêmio + mascote por cima.
                    Nada de título — o nome do personagem já vem ao lado. */}
                <div style={{
                  position: "relative", width: 44, height: 44, borderRadius: 10,
                  overflow: "hidden", background: "#1e1e1e", flexShrink: 0,
                }}>
                  <Image src={p.bg} alt="" fill sizes="44px" style={{ objectFit: "cover" }} />
                  <Image
                    src={p.mascote}
                    alt=""
                    fill
                    sizes="44px"
                    style={{ objectFit: "contain", padding: 4 }}
                  />
                </div>
                <span style={{
                  flex: 1, minWidth: 0, fontFamily: "var(--font-display)", fontWeight: 700,
                  fontSize: 14, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                }}>
                  {p.nome}
                </span>
                <span style={{
                  fontFamily: "var(--font-numeric)", fontWeight: 700, fontSize: 13,
                  color: "#A78BFA", background: "#A78BFA1a", borderRadius: 9999,
                  padding: "4px 10px", flexShrink: 0,
                }}>
                  {p.vezes}x
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {rodadas.map((r, i) => (
              <div key={`${r.data}-${i}`} style={{
                display: "flex", alignItems: "center", gap: 12,
                background: "#141414", border: "1px solid #242424",
                borderRadius: 14, padding: "12px 14px",
              }}>
                <span style={{
                  flex: 1, minWidth: 0, fontFamily: "var(--font-display)", fontWeight: 700,
                  fontSize: 14, color: "#fff", textTransform: "capitalize",
                }}>
                  {fmtData(r.data)}
                </span>
                <span style={{ fontFamily: "var(--font-body)", fontSize: 12.5, color: "#8a8a8a", flexShrink: 0 }}>
                  {r.participantes !== undefined
                    ? `${r.participantes} jogadores`
                    : `${r.votos} ${r.votos === 1 ? "voto" : "votos"}`}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </BottomSheet>
  );
}
