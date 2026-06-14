"use client";

import { useState } from "react";
import Link from "next/link";
import { BottomsheetMaisVotados } from "@/components/BottomsheetMaisVotados";
import type { LeaderboardEntry } from "@/components/BottomsheetMaisVotados";

// Figma asset URLs — Home screen (node 126:44)
const A = {
  campo:        "http://localhost:3845/assets/a263af27cbe7a4ef6641eae0a2116c73349a78ff.png",
  logo:         "http://localhost:3845/assets/31c46a81e6d70b0dc33ca60496ecfa043e761f1c.png",
  calendarBlank:"http://localhost:3845/assets/9fbcd9405a497085e1df88ed009276f1587d787c.svg",
  alarm:        "http://localhost:3845/assets/3171d50ce937795f17f4d5b40bcfcc5f2b35e39f.svg",
  tshirt:       "http://localhost:3845/assets/b4cbc176d76f942ed9d2e730c598230da33eb369.svg",
  tshirtAlt:    "http://localhost:3845/assets/e34ae7fbaf552e83335c72c359cb51099b46e149.svg",
  caretRight:   "http://localhost:3845/assets/7038802d9fcf108f2f3ad5a4a93d5463281a40c6.svg",
  caretRight1:  "http://localhost:3845/assets/1a99e8b512216ad730b3789f0f32149bb65b8734.svg",
  trophy:       "http://localhost:3845/assets/e3f883d17ae67efead123e30b9dec3f2de83035c.svg",
  medal1:       "http://localhost:3845/assets/ed3d245a654a2fbbf71fa008b60c5261a3b492b4.svg",
  medal2:       "http://localhost:3845/assets/5cbc74c5d63a841c4db0d1f95fa614b4b6ccb83e.svg",
  medal3:       "http://localhost:3845/assets/9a1646dc20219cb326579f1d3aa136312f40d036.svg",
  calendarStar: "http://localhost:3845/assets/e23d845c76452f4c998a4f8f10e56d4c15e127ca.svg",
  medalIcon:    "http://localhost:3845/assets/ad6be823fa87a138055c46b3af3a96875dd76d19.svg",
  mascotPreg:   "http://localhost:3845/assets/b663ed68937f38dbe3274350c39786fc36e54346.png",
  mascotMat:    "http://localhost:3845/assets/320508786458480dbbb96170e84a70d16c6f69f9.png",
  mascotBagre:  "http://localhost:3845/assets/87fa5599c5cd3975730bfdff7b046d047125b39c.png",
  emChamas:     "http://localhost:3845/assets/3ec226f3c12640cf91318642ba7cb1e93af99fc1.png",
  virada:       "http://localhost:3845/assets/ebc29bb02d6decbb4a455a28707bcd21935d9c0e.png",
  maFase:       "http://localhost:3845/assets/4b0505e234167ce75814365564715857215d2164.png",
  navHouse:     "http://localhost:3845/assets/d1145caf56c1aabcabda4a5ea86d0a680ee52020.svg",
  navCheck:     "http://localhost:3845/assets/39afc8a71d58ddc41ddc8c85bf441ed7521dcf1a.svg",
  navBall:      "http://localhost:3845/assets/f200e818eb26a68d4b29cc37c51b603a4ce1fa37.svg",
  navChart:     "http://localhost:3845/assets/1bd0dd48431b328313535cfc2138cbb0e273f436.svg",
  list:         "http://localhost:3845/assets/1b0a8c436f55e4a6e53e98bbd07cc3cfc0bbbb83.svg",
  bell:         "http://localhost:3845/assets/85367da42c70e1d5ab7fd44d7b65dddf496bca2b.svg",
};

type MaisVotado = { apelido: string; qtd: number; categoria: string };
type Personagem  = { tipo: string; texto: string; data: Date };
type Conquista   = { apelido: string; traitNome: string; traitEmoji: string | null; data: Date };

interface Props {
  IMG: Record<string, string>;
  rodadaId: string | null;
  dataRodada: string | null;
  jaVotou: boolean;
  maisVotados: MaisVotado[];
  personagens: Personagem[];
  conquistas: Conquista[];
  datePills: string[];
  criarRodadaAction: () => Promise<void>;
}

const PERSONAGEM_MASCOTS: Record<string, string> = {
  MVP:    A.mascotMat,
  BAGRE:  A.mascotBagre,
  RACUDO: A.mascotPreg,
};

const PERSONAGEM_TITLES: Record<string, string> = {
  MVP:    "MATADOR",
  BAGRE:  "BAGRE DA NOITE",
  RACUDO: "PREGUEIRO",
};

const BADGE_IMGS = [A.emChamas, A.virada, A.maFase];
const MEDAL_IMGS = [A.medal1, A.medal2, A.medal3];

export function HomeClient({
  rodadaId, dataRodada, jaVotou,
  maisVotados, personagens, conquistas, datePills,
  criarRodadaAction,
}: Props) {
  const [bsOpen, setBsOpen] = useState(false);
  const [activePill, setActivePill] = useState(datePills.length > 0 ? datePills.length - 1 : 0);

  const lbEntries: LeaderboardEntry[] = maisVotados.slice(0, 6).map((v, i) => ({
    rank: i + 1,
    apelido: v.apelido,
    qtd: v.qtd,
    categoria: v.categoria,
  }));

  return (
    <div style={{ minHeight: "100dvh", background: "#090909", position: "relative" }}>

      {/* ── Scrollable content ── */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16, paddingBottom: "calc(100px + env(safe-area-inset-bottom, 0px))" }}>

        {/* ── 1. TEAL HEADER ── */}
        <div style={{
          background: "#1998ad",
          paddingTop: 148,
          paddingBottom: 24,
          paddingLeft: 16,
          paddingRight: 16,
          borderBottomLeftRadius: 40,
          borderBottomRightRadius: 40,
          display: "flex",
          alignItems: "center",
        }}>
          {/* White outer card */}
          <div style={{ background: "#fff", borderRadius: 48, padding: 12, flex: 1, overflow: "hidden" }}>
            {/* Campo inner card */}
            <div style={{ position: "relative", border: "1px solid #777575", borderRadius: 40, overflow: "hidden", padding: "16px 24px", display: "flex", flexDirection: "column", gap: 16 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img aria-hidden alt="" src={A.campo} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", pointerEvents: "none", borderRadius: 40 }} />
              <div aria-hidden style={{ position: "absolute", inset: 0, background: "rgba(35,52,0,0.34)", borderRadius: 40, pointerEvents: "none" }} />

              {/* Voting Panel */}
              <div style={{ position: "relative", display: "flex", gap: 24, alignItems: "flex-start", justifyContent: "space-between" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 4, flex: 1 }}>
                  <div style={{ height: 52, color: "#fff" }}>
                    <p style={{ margin: 0, fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 14, lineHeight: "20px" }}>VOTAÇÃO DO </p>
                    <p style={{ margin: 0, fontFamily: "var(--font-display)", fontWeight: 900, fontSize: 32, lineHeight: "32px" }}>BABA</p>
                  </div>
                  <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(55,55,55,0.2)", padding: "4px 6px", borderRadius: 100 }}>
                    <div style={{ width: 6, height: 6, borderRadius: "50%", background: rodadaId ? "#00ff00" : "#888", flexShrink: 0 }} />
                    <span style={{ fontFamily: "var(--font-display)", fontWeight: 500, fontSize: 12, lineHeight: "16px", color: "#fff", letterSpacing: "-0.4px", whiteSpace: "nowrap" }}>
                      {rodadaId ? "Votação aberta até às 15h" : "Nenhuma rodada aberta"}
                    </span>
                  </div>
                </div>
                {dataRodada && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 4, alignItems: "flex-end", flexShrink: 0 }}>
                    <div style={{ background: "#1e1e1e", padding: "4px 8px", borderRadius: 48, display: "flex", alignItems: "center", gap: 4, overflow: "hidden" }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img alt="" src={A.calendarBlank} style={{ width: 16, height: 16, flexShrink: 0 }} />
                      <span style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 12, lineHeight: "20px", color: "#9fe870", letterSpacing: "-0.48px", whiteSpace: "nowrap" }}>{dataRodada}</span>
                    </div>
                    <div style={{ background: "#1e1e1e", padding: "4px 8px", borderRadius: 48, display: "flex", alignItems: "center", gap: 4, overflow: "hidden" }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img alt="" src={A.alarm} style={{ width: 16, height: 16, flexShrink: 0 }} />
                      <span style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 12, lineHeight: "20px", color: "#fff", letterSpacing: "-0.48px", whiteSpace: "nowrap" }}>20:00</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Players formation */}
              <div style={{ position: "relative", display: "flex", flexDirection: "column", gap: 24, alignItems: "center" }}>
                <PlayerSlot tshirt={A.tshirt} />
                <div style={{ display: "flex", gap: 62, alignItems: "center", justifyContent: "center", width: "100%" }}>
                  <PlayerSlot tshirt={A.tshirt} />
                  <PlayerSlot tshirt={A.tshirt} />
                  <PlayerSlot tshirt={A.tshirt} />
                </div>
                <div style={{ borderTop: "1px solid #5e5e5e", width: 292, paddingTop: 16, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <PlayerSlot tshirt={A.tshirtAlt} />
                </div>
              </div>

              {/* CTA */}
              <div style={{ position: "relative" }}>
                {rodadaId && !jaVotou ? (
                  <Link href="/votacao" style={{
                    display: "flex", alignItems: "center",
                    background: "#0d0d0d", border: "1px solid #000",
                    borderRadius: 14, padding: "8px 16px", textDecoration: "none",
                    boxShadow: "0px 4px 9.8px 2px rgba(0,0,0,0.25)",
                  }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: 2, flex: 1 }}>
                      <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 18, lineHeight: "22px", color: "#9fe870", letterSpacing: "-0.8px" }}>VOTAR AGORA</span>
                      <span style={{ fontFamily: "var(--font-display)", fontWeight: 500, fontSize: 12, lineHeight: "16px", color: "rgba(255,255,255,0.6)" }}>Escolha o personagem de cada um</span>
                    </div>
                    <div style={{ width: 36, height: 36, borderRadius: 12, background: "#9fe870", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img alt="" src={A.caretRight} style={{ width: 20, height: 20 }} />
                    </div>
                  </Link>
                ) : !rodadaId ? (
                  <form action={criarRodadaAction}>
                    <button type="submit" style={{
                      width: "100%", background: "#0d0d0d", border: "1px solid #000",
                      borderRadius: 14, padding: "13px 16px",
                      fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 18, color: "#9fe870",
                      cursor: "pointer", letterSpacing: "-0.8px",
                    }}>⚽ BABA ROLOU HOJE</button>
                  </form>
                ) : (
                  <div style={{ background: "#0d0d0d", border: "1px solid #000", borderRadius: 14, padding: 16, textAlign: "center" }}>
                    <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14, color: "rgba(255,255,255,0.4)" }}>Você já votou nesta rodada ✓</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── Page sections ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16, padding: "0 8px" }}>

          {/* ── 2. MAIS VOTADOS ── */}
          {maisVotados.length > 0 && (
            <div style={{ background: "#171717", border: "1px solid #2e2e2e", borderRadius: 20, padding: 17, display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 4, flex: 1 }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img alt="" src={A.trophy} style={{ width: 16, height: 16 }} />
                  <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 16, lineHeight: "20px", color: "#fff" }}>MAIS VOTADOS</span>
                </div>
                <button onClick={() => setBsOpen(true)} style={{
                  display: "flex", alignItems: "center", gap: 4,
                  background: "#2a2a2a", border: "1px solid #3a3a3a",
                  borderRadius: 9999, padding: "7px 13px", cursor: "pointer",
                }}>
                  <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 12, lineHeight: "18px", color: "#fff" }}>Ver mais</span>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img alt="" src={A.caretRight1} style={{ width: 12, height: 12 }} />
                </button>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {maisVotados.slice(0, 3).map((v, i) => (
                  <div key={i} style={{ background: "#000", borderRadius: 14, paddingLeft: 24, paddingRight: 8, paddingTop: 8, paddingBottom: 8 }}>
                    <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                      <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 20, lineHeight: "18px", color: "#fff", flexShrink: 0 }}>{i + 1}.</span>
                      <div style={{ background: "#1b1b1b", flex: 1, height: 52, borderRadius: 12, padding: 8, display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ display: "flex", flex: 1, gap: 8, alignItems: "center", overflow: "hidden" }}>
                          <div style={{ background: "#3a3a3a", width: 40, height: 40, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, padding: 4 }}>
                            <span style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 20, lineHeight: "18px", color: "#fff" }}>{v.qtd}x</span>
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ margin: 0, fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 16, lineHeight: "18px", color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{v.apelido.toUpperCase()}</p>
                            <p style={{ margin: 0, fontFamily: "var(--font-display)", fontWeight: 500, fontSize: 14, lineHeight: "18px", color: "#8d908d" }}>{v.categoria}</p>
                          </div>
                        </div>
                        <div style={{ background: "#000", border: "1px solid #353535", borderRadius: 12, width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, padding: 4 }}>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img alt="" src={MEDAL_IMGS[i]} style={{ width: 28, height: 28 }} />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── 3. PERSONAGEM DA SEMANA ── */}
          {personagens.length > 0 && (
            <div style={{ background: "#171717", border: "1px solid #2e2e2e", borderRadius: 20, padding: 17, display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img alt="" src={A.calendarStar} style={{ width: 16, height: 16 }} />
                <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 16, lineHeight: "20px", color: "#fff" }}>PERSONAGEM DA SEMANA</span>
              </div>
              {datePills.length > 0 && (
                <div style={{ display: "flex", gap: 8, height: 38, overflow: "hidden" }}>
                  {datePills.map((d, i) => (
                    <button key={i} onClick={() => setActivePill(i)} style={{
                      background: i === activePill ? "#9fe870" : "#111",
                      border: i === activePill ? "none" : "1px solid #2e2e2e",
                      borderRadius: 9999,
                      padding: i === activePill ? "6px 12px" : "7px 13px",
                      fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 12, lineHeight: "18px",
                      color: i === activePill ? "#000" : "#555",
                      cursor: "pointer", flexShrink: 0,
                    }}>{d}</button>
                  ))}
                </div>
              )}
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {personagens.map((p, i) => {
                  const title = PERSONAGEM_TITLES[p.tipo] ?? p.tipo;
                  const mascot = PERSONAGEM_MASCOTS[p.tipo] ?? A.mascotPreg;
                  const nome = p.texto.split(" ").slice(0, 2).join(" ");
                  const dateStr = new Date(p.data).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
                  const qtd = 7 - i;
                  return (
                    <div key={i} style={{ background: "#000", border: "1px solid #2e2e2e", borderRadius: 16, padding: 17, display: "flex", gap: 16, alignItems: "flex-start" }}>
                      <div style={{ display: "flex", flexDirection: "column", gap: 12, flexShrink: 0 }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                          <div style={{ display: "flex", flexDirection: "column", gap: 4, height: 46 }}>
                            <p style={{ margin: 0, fontFamily: "var(--font-display)", fontWeight: 900, fontSize: 20, lineHeight: "24px", color: "#fff" }}>{title}</p>
                            <p style={{ margin: 0, fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16, lineHeight: "18px", color: "#f9a8d4" }}>{nome}</p>
                          </div>
                          <div>
                            <p style={{ margin: 0, fontFamily: "var(--font-display)", fontWeight: 500, fontSize: 11 }}>
                              <span style={{ color: "#9fe870" }}>Votado {qtd}x · </span>
                              <span style={{ color: "#838383" }}>{dateStr}</span>
                            </p>
                          </div>
                        </div>
                        <button style={{
                          display: "inline-flex", alignItems: "center", gap: 4,
                          background: "#2a2a2a", border: "1px solid #3a3a3a",
                          borderRadius: 9999, padding: "7px 13px", cursor: "pointer",
                        }}>
                          <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 12, lineHeight: "18px", color: "#fff" }}>Ver mais</span>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img alt="" src={A.caretRight1} style={{ width: 12, height: 12 }} />
                        </button>
                      </div>
                      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "flex-end", alignSelf: "stretch" }}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img alt={title} src={mascot} style={{ width: 117, height: 117, objectFit: "cover", flexShrink: 0 }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── 4. MEDALHAS ── */}
          {conquistas.length > 0 && (
            <div style={{ background: "#171717", border: "1px solid #2e2e2e", borderRadius: 20, padding: 17, display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <div style={{ display: "flex", flex: 1, alignItems: "center", gap: 4 }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img alt="" src={A.medalIcon} style={{ width: 16, height: 16 }} />
                  <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 16, lineHeight: "20px", color: "#fff" }}>MEDALHAS</span>
                </div>
                <Link href="/ranking" style={{
                  display: "flex", alignItems: "center", gap: 4, textDecoration: "none",
                  background: "#2a2a2a", border: "1px solid #3a3a3a",
                  borderRadius: 9999, padding: "7px 13px",
                }}>
                  <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 12, lineHeight: "18px", color: "#fff" }}>Ver todas</span>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img alt="" src={A.caretRight1} style={{ width: 12, height: 12 }} />
                </Link>
              </div>
              <div style={{ background: "#111", border: "1px solid #1e1e1e", borderRadius: 12, padding: "9px 13px", display: "flex", gap: 12, alignItems: "center" }}>
                <span style={{ fontSize: 18, lineHeight: "27px" }}>🏅</span>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0 }}>
                    <span style={{ fontFamily: "var(--font-display)", fontWeight: 900, fontSize: 18, lineHeight: "20px", color: "#fff" }}>{conquistas.length} </span>
                    <span style={{ fontFamily: "var(--font-display)", fontWeight: 500, fontSize: 16, lineHeight: "20px", color: "#555" }}>de 15 jogadores</span>
                  </p>
                  <p style={{ margin: 0, fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 14, lineHeight: "18px", color: "#555" }}>já conquistaram uma medalha</p>
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {conquistas.map((c, i) => {
                  const badge = BADGE_IMGS[i % BADGE_IMGS.length];
                  const subtitles = ["3x seguido como Craque/Matador", "Do pior para o melhor em 1 jogo", "3x seguido como pior personagem"];
                  return (
                    <div key={i} style={{ background: "#000", border: "1px solid #2e2e2e", borderRadius: 16, padding: "9px 17px" }}>
                      <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: 2, flex: 1 }}>
                          <p style={{ margin: 0, fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 10, lineHeight: "15px", color: "#a1a1a1", letterSpacing: "0.5px", whiteSpace: "nowrap" }}>HOJE · NOVA MEDALHA</p>
                          <p style={{ margin: 0 }}>
                            <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 16, lineHeight: "20px", color: "#9fe870" }}>{c.apelido}</span>
                            <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 16, lineHeight: "20px", color: "#fff" }}>{` destravou "${c.traitNome}!"`}</span>
                          </p>
                          <p style={{ margin: 0, fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 12, lineHeight: "16px", color: "#555" }}>{subtitles[i % subtitles.length]}</p>
                        </div>
                        <div style={{ width: 72, height: 72, overflow: "hidden", flexShrink: 0 }}>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img alt="" src={badge} style={{ width: 72, height: 72 }} />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── TOPBAR (fixed overlay) ── */}
      <div style={{
        position: "fixed", top: 0, left: "50%", transform: "translateX(-50%)",
        width: "min(100%, 430px)", zIndex: 30, pointerEvents: "none",
      }}>
        <div style={{ height: 54 }} />
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 8px", height: 64, pointerEvents: "auto" }}>
          <button style={{ width: 56, height: 64, display: "flex", alignItems: "center", justifyContent: "center", background: "none", border: "none", cursor: "pointer" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img alt="Menu" src={A.list} style={{ width: 32, height: 32 }} />
          </button>
          <div style={{ display: "flex", alignItems: "center", alignSelf: "stretch" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img alt="Canelada" src={A.logo} style={{ height: "100%", aspectRatio: "1 / 1", objectFit: "cover" }} />
          </div>
          <button style={{ width: 56, height: 64, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, background: "none", border: "none", cursor: "pointer" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img alt="Notificações" src={A.bell} style={{ width: 28, height: 28 }} />
          </button>
        </div>
      </div>

      {/* ── BOTTOM NAV (Figma: bg rgba(0,0,0,0.08) border #393939 rounded-32px) ── */}
      <div style={{
        position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)",
        width: "min(100%, 430px)", zIndex: 30,
        padding: "0 8px",
        paddingBottom: "max(6px, env(safe-area-inset-bottom, 6px))",
      }}>
        <nav aria-label="Navegação principal" style={{
          background: "rgba(0,0,0,0.08)", border: "1px solid #393939",
          borderRadius: 32, padding: "6px 15px",
          display: "flex", alignItems: "center",
          backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
          boxShadow: "0px 4px 4.7px 1px rgba(0,0,0,0.28)",
        }}>
          <div style={{ display: "flex", flex: 1, alignItems: "center", justifyContent: "space-between" }}>
            <NavItem icon={A.navHouse} label="Home" active />
            <NavItem icon={A.navCheck} label="Votos" href="/votacao" />
            <NavItem icon={A.navBall} label="Pelada" href="/feed" />
            <NavItem icon={A.navChart} label="Ranking" href="/ranking" />
          </div>
        </nav>
      </div>

      <BottomsheetMaisVotados
        open={bsOpen}
        onClose={() => setBsOpen(false)}
        entries={lbEntries}
        datas={datePills}
        dataAtiva={datePills.length - 1}
      />
    </div>
  );
}

function PlayerSlot({ tshirt }: { tshirt: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <div style={{
        background: "#1e1e1e", border: "1px solid #555", borderRadius: 22,
        width: 48, height: 48, display: "flex", alignItems: "center", justifyContent: "center",
        marginBottom: -8, boxShadow: "0px 5px 6.9px 4px rgba(0,0,0,0.3)", padding: 7, overflow: "hidden",
      }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img alt="" src={tshirt} style={{ width: 24, height: 24 }} />
      </div>
      <p style={{ margin: 0, marginTop: 10, fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 12, color: "#fff", textAlign: "center", whiteSpace: "nowrap" }}>VOTE</p>
    </div>
  );
}

function NavItem({ icon, label, active, href }: { icon: string; label: string; active?: boolean; href?: string }) {
  const inner = (
    <div style={{
      width: 56, height: 56,
      borderRadius: active ? 100 : undefined,
      background: active ? "#9fe870" : undefined,
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      padding: 8, overflow: "hidden",
    }}>
      <div style={{ width: 28, display: "flex", flexDirection: "column", alignItems: "center" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img alt="" src={icon} style={{ width: 28, height: 28 }} />
        <span style={{
          fontFamily: "var(--font-display)", fontWeight: active ? 800 : 600,
          fontSize: 10, lineHeight: "14px", color: active ? "#000" : "#fff",
          textAlign: "center", letterSpacing: "-0.2px", whiteSpace: "nowrap", minWidth: "100%",
        }}>{label}</span>
      </div>
    </div>
  );
  if (href) return <Link href={href} style={{ textDecoration: "none" }}>{inner}</Link>;
  return <button style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}>{inner}</button>;
}
