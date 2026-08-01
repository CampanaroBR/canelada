"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ChevronLeft, Shuffle, Export, ArrowRight } from "reicon-react";
import { Avatar, Button } from "@/ds";
import { sortearTimes, type JogadorSorteio } from "@/lib/sorteioTimes";

const ACCENT = "#9fe870";
const NOMES_TIME = ["A", "B", "C", "D"];
/** Cor por time — dá identidade visual e ajuda a ler de relance quem é de onde. */
const COR_TIME = ["#9fe870", "#5cc8ff", "#f0a44a", "#c58cff"];

export type FilaItem = JogadorSorteio & { apelido: string; foto: string; convidado: boolean };

type Slot = { jogador: JogadorSorteio; time: number };

export function SorteioClient({ fila }: { fila: FilaItem[] }) {
  const [nTimes, setNTimes] = useState(2);
  const [linhaPorTime, setLinhaPorTime] = useState(4);
  const [seed, setSeed] = useState(0);
  /** Trocas feitas na mão pelo admin — sobrepõem o sorteio. Ver `mover`. */
  const [manual, setManual] = useState<Record<string, number>>({});

  const porId = useMemo(() => new Map(fila.map((f) => [f.id, f])), [fila]);
  const base = useMemo(
    () => sortearTimes(fila, { times: nTimes, linhaPorTime, seed }),
    [fila, nTimes, linhaPorTime, seed],
  );

  // Sorteio + ajustes manuais. O sorteio nunca fica perfeito pra vida real
  // (com 9 pessoas um time fica com 4), então o admin precisa poder mover
  // alguém sem perder o resto da escalação.
  const times: Slot[][] = useMemo(() => {
    const out: Slot[][] = Array.from({ length: nTimes }, () => []);
    for (const [i, t] of base.times.entries()) {
      for (const j of t.jogadores) {
        const destino = manual[j.id] ?? i;
        out[Math.min(destino, nTimes - 1)].push({ jogador: j, time: destino });
      }
    }
    return out;
  }, [base, manual, nTimes]);

  const soma = (t: Slot[]) => t.reduce((acc, s) => acc + s.jogador.nota, 0);
  const media = (t: Slot[]) => (t.length ? Math.round(soma(t) / t.length) : 0);
  const diferenca = times.length >= 2
    ? Math.max(...times.map(soma)) - Math.min(...times.map(soma))
    : 0;

  const nome = (id: string) => porId.get(id)?.apelido ?? "?";
  /** Move pro próximo time (cicla). Com 2 times é literalmente "trocar de lado". */
  const mover = (id: string, atual: number) =>
    setManual((m) => ({ ...m, [id]: (atual + 1) % nTimes }));

  function sortearDeNovo() {
    setManual({}); // ajustes manuais não sobrevivem a um sorteio novo
    setSeed((s) => s + 1);
  }

  function compartilhar() {
    const linhas = times.map((t, i) => {
      const jogadores = t
        .map((s, k) => `${k === 0 && s.jogador.gol ? "🧤 " : ""}${nome(s.jogador.id)}`)
        .join("\n");
      return `*TIME ${NOMES_TIME[i]}* (média ${media(t)})\n${jogadores}`;
    });
    if (base.fila.length > 0) {
      linhas.push(`*PRÓXIMOS*\n${base.fila.map((j) => nome(j.id)).join("\n")}`);
    }
    const texto = `⚽ *TIMES DE HOJE*\n\n${linhas.join("\n\n")}\n\n_sorteado no Canelada_`;
    window.open(`https://wa.me/?text=${encodeURIComponent(texto)}`, "_blank");
  }

  const escalados = times.reduce((n, t) => n + t.length, 0);

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
            <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
              <Seletor label="TIMES" valor={nTimes} opcoes={[2, 3, 4]} onChange={(v) => { setManual({}); setNTimes(v); }} />
              <Seletor label="LINHA POR TIME" valor={linhaPorTime} opcoes={[3, 4, 5, 6]} onChange={(v) => { setManual({}); setLinhaPorTime(v); }} />
            </div>

            {/* Barra de equilíbrio — o dado mais importante da tela vira gráfico
                em vez de texto solto: dá pra ver de relance se ficou justo. */}
            <div style={{
              padding: "14px 16px", borderRadius: 20, marginBottom: 14,
              background: "rgba(255,255,255,0.03)",
              boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.07)",
            }}>
              <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 10 }}>
                <span style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 10, letterSpacing: "1.6px", color: "#7a7a7a" }}>
                  EQUILÍBRIO
                </span>
                <span style={{
                  fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 13,
                  color: diferenca <= 5 ? ACCENT : diferenca <= 15 ? "#f0a44a" : "#e56767",
                }}>
                  {diferenca === 0 ? "perfeito" : `${diferenca} pts de diferença`}
                </span>
              </div>
              <div style={{ display: "flex", gap: 4, height: 8, borderRadius: 999, overflow: "hidden" }}>
                {times.map((t, i) => (
                  <div key={i} style={{ flex: Math.max(soma(t), 1), background: COR_TIME[i], borderRadius: 999 }} />
                ))}
              </div>
              <p style={{ margin: "10px 0 0", fontFamily: "var(--font-body)", fontSize: 11.5, color: "#6e6e6e" }}>
                {fila.length} na lista · {escalados} escalados · toque em{" "}
                <ArrowRight size={11} weight="Outline" color="#6e6e6e" style={{ verticalAlign: "middle" }} />{" "}
                pra trocar alguém de time
              </p>
            </div>

            {base.timesSemGoleiro.length > 0 && (
              <div style={{ background: "rgba(229,103,103,0.1)", boxShadow: "inset 0 0 0 1px rgba(229,103,103,0.3)", borderRadius: 14, padding: "10px 14px", marginBottom: 14 }}>
                <p style={{ margin: 0, fontFamily: "var(--font-body)", fontSize: 12.5, color: "#e56767" }}>
                  Sem goleiro pro time{base.timesSemGoleiro.length > 1 ? "s" : ""}{" "}
                  {base.timesSemGoleiro.map((i) => NOMES_TIME[i]).join(" e ")} — marque quem pega o gol na tela de presença.
                </p>
              </div>
            )}

            {/* Times */}
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {times.map((t, i) => (
                <div key={i} style={{
                  padding: 5, borderRadius: 26,
                  background: "rgba(255,255,255,0.035)",
                  boxShadow: `inset 0 0 0 1px ${COR_TIME[i]}2e`,
                }}>
                  <div style={{
                    borderRadius: 22, overflow: "hidden",
                    background: "linear-gradient(180deg, #161616 0%, #101010 100%)",
                    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06)",
                  }}>
                    <div style={{
                      display: "flex", alignItems: "center", gap: 10,
                      padding: "12px 16px",
                      borderBottom: "1px solid rgba(255,255,255,0.05)",
                    }}>
                      <span style={{ width: 8, height: 8, borderRadius: 999, background: COR_TIME[i], flexShrink: 0 }} />
                      <span style={{ flex: 1, fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 15, color: "#fff", letterSpacing: "0.4px" }}>
                        TIME {NOMES_TIME[i]}
                      </span>
                      <span style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 10, letterSpacing: "1.2px", color: "#6e6e6e" }}>
                        MÉDIA
                      </span>
                      {/* OVR do time com ênfase: era texto de 11px perdido no canto */}
                      <span style={{
                        fontFamily: "var(--font-numeric)", fontWeight: 700, fontSize: 24,
                        lineHeight: 1, color: COR_TIME[i], fontVariantNumeric: "tabular-nums",
                      }}>
                        {media(t)}
                      </span>
                      <span style={{
                        fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 11,
                        color: "#5a5a5a", marginLeft: 2,
                      }}>
                        {t.length}
                      </span>
                    </div>

                    {t.map((s, k) => (
                      <div key={s.jogador.id} style={{
                        display: "flex", alignItems: "center", gap: 12,
                        padding: "10px 12px 10px 16px",
                        borderTop: k === 0 ? "none" : "1px solid rgba(255,255,255,0.04)",
                      }}>
                        <Avatar name={nome(s.jogador.id)} src={porId.get(s.jogador.id)?.foto || undefined} />
                        <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 2 }}>
                          <span style={{
                            fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14.5, color: "#fff",
                            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                          }}>
                            {nome(s.jogador.id)}
                          </span>
                          {s.jogador.gol && (
                            <span style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 10, letterSpacing: "0.8px", color: COR_TIME[i] }}>
                              {s.jogador.gol === "fixo" ? "🧤 GOLEIRO" : "🧤 PEGOU O GOL"}
                            </span>
                          )}
                        </div>

                        {/* Nota com ênfase — é o número que justifica a escalação */}
                        <span style={{
                          fontFamily: "var(--font-numeric)", fontWeight: 700, fontSize: 22,
                          lineHeight: 1, color: "#e8e8e8", fontVariantNumeric: "tabular-nums",
                          minWidth: 34, textAlign: "right",
                        }}>
                          {s.jogador.nota}
                        </span>

                        <button
                          onClick={() => mover(s.jogador.id, i)}
                          aria-label={`Mover ${nome(s.jogador.id)} de time`}
                          style={{
                            width: 34, height: 34, borderRadius: 11, flexShrink: 0, border: "none",
                            background: "rgba(255,255,255,0.05)", cursor: "pointer",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            transition: "background 200ms cubic-bezier(0.32,0.72,0,1)",
                            WebkitTapHighlightColor: "transparent",
                          }}
                        >
                          <ArrowRight size={15} weight="Outline" color="#9a9a9a" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {base.fila.length > 0 && (
              <>
                <div style={{ margin: "22px 0 8px" }}>
                  <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 13, letterSpacing: "1.4px", color: "#9a9a9a" }}>
                    PRÓXIMOS ({base.fila.length})
                  </span>
                </div>
                <div style={{
                  borderRadius: 20, overflow: "hidden",
                  background: "rgba(255,255,255,0.025)",
                  boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.06)",
                }}>
                  {base.fila.map((j, i) => (
                    <div key={j.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 16px", borderTop: i === 0 ? "none" : "1px solid rgba(255,255,255,0.04)" }}>
                      <span style={{ width: 18, fontFamily: "var(--font-numeric)", fontWeight: 700, fontSize: 11, color: "#5a5a5a" }}>{i + 1}</span>
                      <span style={{ flex: 1, fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 13.5, color: "#a8a8a8" }}>{nome(j.id)}</span>
                      {j.gol && <span style={{ fontSize: 12 }}>🧤</span>}
                      <span style={{ fontFamily: "var(--font-numeric)", fontWeight: 700, fontSize: 14, color: "#6e6e6e", fontVariantNumeric: "tabular-nums" }}>{j.nota}</span>
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
          <Button onClick={sortearDeNovo} variant="secondary" leftIcon={<Shuffle size={18} weight="Outline" />}>
            Sortear
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
    <div style={{
      flex: 1, padding: "9px 10px", borderRadius: 18,
      background: "rgba(255,255,255,0.03)",
      boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.07)",
    }}>
      <span style={{ display: "block", fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 9, letterSpacing: "1.2px", color: "#6e6e6e", marginBottom: 7 }}>
        {label}
      </span>
      <div style={{ display: "flex", gap: 4 }}>
        {opcoes.map((o) => (
          <button
            key={o}
            onClick={() => onChange(o)}
            style={{
              flex: 1, height: 32, borderRadius: 10, border: "none", cursor: "pointer",
              background: o === valor ? ACCENT : "rgba(255,255,255,0.05)",
              color: o === valor ? "#0a1a06" : "#a8a8a8",
              fontFamily: "var(--font-numeric)", fontWeight: 700, fontSize: 13,
              transition: "background 200ms cubic-bezier(0.32,0.72,0,1)",
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
