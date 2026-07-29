"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ChevronLeft, Shuffle, Export } from "reicon-react";
import { Avatar, Button } from "@/ds";
import { sortearTimes, type JogadorSorteio } from "@/lib/sorteioTimes";

const ACCENT = "#9fe870";
const NOMES_TIME = ["A", "B", "C", "D"];

export type FilaItem = JogadorSorteio & { apelido: string; foto: string; convidado: boolean };

export function SorteioClient({ fila }: { fila: FilaItem[] }) {
  const [nTimes, setNTimes] = useState(2);
  const [linhaPorTime, setLinhaPorTime] = useState(4);
  const [seed, setSeed] = useState(0);

  const porId = useMemo(() => new Map(fila.map((f) => [f.id, f])), [fila]);
  const resultado = useMemo(
    () => sortearTimes(fila, { times: nTimes, linhaPorTime, seed }),
    [fila, nTimes, linhaPorTime, seed],
  );

  const nome = (id: string) => porId.get(id)?.apelido ?? "?";

  function compartilhar() {
    const linhas = resultado.times.map((t, i) => {
      const jogadores = t.jogadores
        .map((j, k) => `${k === 0 && j.gol ? "🧤 " : ""}${nome(j.id)}`)
        .join("\n");
      return `*TIME ${NOMES_TIME[i]}* (média ${t.media})\n${jogadores}`;
    });
    if (resultado.fila.length > 0) {
      linhas.push(`*PRÓXIMOS*\n${resultado.fila.map((j) => nome(j.id)).join("\n")}`);
    }
    const texto = `⚽ *TIMES DE HOJE*\n\n${linhas.join("\n\n")}\n\n_sorteado no Canelada_`;
    window.open(`https://wa.me/?text=${encodeURIComponent(texto)}`, "_blank");
  }

  return (
    <div style={{ minHeight: "100dvh", background: "var(--color-bg)", display: "flex", flexDirection: "column" }}>
      <header className="glass-bar" style={{ position: "sticky", top: 0, zIndex: 30, height: 56, display: "flex", alignItems: "center", padding: "0 8px", gap: 8 }}>
        <Link href="/votacao" aria-label="Voltar" style={{ width: 48, height: 48, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>
          <ChevronLeft size={20} weight="Outline" />
        </Link>
        <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 16, color: "#fff", flex: 1 }}>
          Sortear times
        </span>
      </header>

      <main style={{ flex: 1, padding: "8px 16px 120px" }}>
        {fila.length === 0 ? (
          <div style={{ background: "#141414", border: "1px solid #2c2c2c", borderRadius: 16, padding: "24px 18px", textAlign: "center", marginTop: 16 }}>
            <p style={{ margin: "0 0 16px", fontFamily: "var(--font-body)", fontSize: 14, lineHeight: 1.5, color: "#9a9a9a" }}>
              Ninguém marcado como presente ainda. O sorteio usa a <strong style={{ color: "#ddd" }}>ordem de chegada</strong>.
            </p>
            <Link href="/votacao/presenca" style={{ textDecoration: "none" }}>
              <Button fullWidth>Marcar quem chegou</Button>
            </Link>
          </div>
        ) : (
          <>
            {/* Configuração */}
            <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
              <Seletor label="TIMES" valor={nTimes} opcoes={[2, 3, 4]} onChange={setNTimes} />
              <Seletor label="LINHA POR TIME" valor={linhaPorTime} opcoes={[3, 4, 5, 6]} onChange={setLinhaPorTime} />
            </div>

            <p style={{ margin: "0 0 16px", fontFamily: "var(--font-body)", fontSize: 11.5, color: "#6e6e6e" }}>
              {fila.length} na lista · escalam {Math.min(fila.length, nTimes * (linhaPorTime + 1))} ·{" "}
              formação 1 goleiro + {linhaPorTime} de linha
            </p>

            {resultado.timesSemGoleiro.length > 0 && (
              <div style={{ background: "rgba(229,103,103,0.1)", border: "1px solid rgba(229,103,103,0.3)", borderRadius: 12, padding: "10px 12px", marginBottom: 14 }}>
                <p style={{ margin: 0, fontFamily: "var(--font-body)", fontSize: 12.5, color: "#e56767" }}>
                  Sem goleiro pro time{resultado.timesSemGoleiro.length > 1 ? "s" : ""}{" "}
                  {resultado.timesSemGoleiro.map((i) => NOMES_TIME[i]).join(" e ")} — marque quem pega o gol na tela de presença.
                </p>
              </div>
            )}

            {/* Times */}
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {resultado.times.map((t, i) => (
                <div key={i} style={{
                  background: "#141414", border: "1px solid #2c2c2c",
                  borderRadius: 16, overflow: "hidden",
                }}>
                  <div style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "10px 14px", borderBottom: "1px solid #1f1f1f",
                    background: "rgba(255,255,255,0.02)",
                  }}>
                    <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 14, color: "#fff", letterSpacing: "0.5px" }}>
                      TIME {NOMES_TIME[i]}
                    </span>
                    <span style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 11.5, color: ACCENT }}>
                      média {t.media}
                    </span>
                  </div>
                  {t.jogadores.map((j, k) => (
                    <div key={j.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 14px", borderTop: k === 0 ? "none" : "1px solid #191919" }}>
                      <Avatar name={nome(j.id)} src={porId.get(j.id)?.foto || undefined} />
                      <span style={{ flex: 1, minWidth: 0, fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {nome(j.id)}
                      </span>
                      {k === 0 && j.gol && (
                        <span style={{ fontSize: 13 }} title={j.gol === "fixo" ? "Goleiro" : "Pegou o gol"}>🧤</span>
                      )}
                      <span style={{ fontFamily: "var(--font-numeric)", fontWeight: 700, fontSize: 13, color: "#8a8a8a", fontVariantNumeric: "tabular-nums" }}>
                        {j.nota}
                      </span>
                    </div>
                  ))}
                </div>
              ))}
            </div>

            {/* Fila */}
            {resultado.fila.length > 0 && (
              <>
                <div style={{ margin: "20px 0 8px" }}>
                  <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 13, letterSpacing: "1.4px", color: "#9a9a9a" }}>
                    PRÓXIMOS ({resultado.fila.length})
                  </span>
                </div>
                <div style={{ background: "#141414", border: "1px solid #2c2c2c", borderRadius: 16, overflow: "hidden" }}>
                  {resultado.fila.map((j, i) => (
                    <div key={j.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 14px", borderTop: i === 0 ? "none" : "1px solid #191919" }}>
                      <span style={{ width: 20, fontFamily: "var(--font-numeric)", fontWeight: 700, fontSize: 11, color: "#6e6e6e" }}>{i + 1}</span>
                      <span style={{ flex: 1, fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 13.5, color: "#b8b8b8" }}>{nome(j.id)}</span>
                      {j.gol && <span style={{ fontSize: 12 }}>🧤</span>}
                    </div>
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </main>

      {fila.length > 0 && (
        <div style={{
          position: "fixed", left: "50%", transform: "translateX(-50%)", bottom: 0,
          width: "min(100%, 430px)", padding: "12px 16px calc(env(safe-area-inset-bottom, 0px) + 12px)",
          background: "linear-gradient(180deg, rgba(9,9,9,0) 0%, #090909 40%)",
          display: "flex", gap: 8,
        }}>
          <Button onClick={() => setSeed((s) => s + 1)} variant="secondary" leftIcon={<Shuffle size={18} weight="Outline" />}>
            Sortear de novo
          </Button>
          <Button onClick={compartilhar} fullWidth leftIcon={<Export size={18} weight="Outline" />}>
            Compartilhar
          </Button>
        </div>
      )}
    </div>
  );
}

/** Seletor compacto de número (times / jogadores por time). */
function Seletor({ label, valor, opcoes, onChange }: { label: string; valor: number; opcoes: number[]; onChange: (n: number) => void }) {
  return (
    <div style={{ flex: 1, background: "#141414", border: "1px solid #2c2c2c", borderRadius: 14, padding: "8px 10px" }}>
      <span style={{ display: "block", fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 9, letterSpacing: "1.2px", color: "#6e6e6e", marginBottom: 6 }}>
        {label}
      </span>
      <div style={{ display: "flex", gap: 4 }}>
        {opcoes.map((o) => (
          <button
            key={o}
            onClick={() => onChange(o)}
            style={{
              flex: 1, height: 32, borderRadius: 9, border: "none", cursor: "pointer",
              background: o === valor ? ACCENT : "rgba(255,255,255,0.05)",
              color: o === valor ? "#0a1a06" : "#b0b0b0",
              fontFamily: "var(--font-numeric)", fontWeight: 700, fontSize: 13,
              WebkitTapHighlightColor: "transparent",
            }}
          >
            {o}
          </button>
        ))}
      </div>
    </div>
  );
}
