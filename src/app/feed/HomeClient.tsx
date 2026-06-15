"use client";

import { useState } from "react";
import Link from "next/link";
import {
  House, Check, Football, ChartBar,
  Trophy, Medal, CaretRight,
  CalendarBlank, Alarm, CalendarStar,
  List, Bell,
} from "@phosphor-icons/react";
import { BottomsheetMaisVotados } from "@/components/BottomsheetMaisVotados";
import type { LeaderboardEntry } from "@/components/BottomsheetMaisVotados";
import { PersonagemShareModal } from "@/components/PersonagemShareModal";
import { getMedalha } from "@/lib/assets";

const CAMPO  = "/campo.png";
const LOGO   = "/logo.png";
const TSHIRT     = "/tshirt.svg";
const TSHIRT_ALT = "/tshirt-alt.svg";

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
  MVP:    "/ilustracoes/tubarao.png",
  BAGRE:  "/ilustracoes/bagre.png",
  RACUDO: "/ilustracoes/corpo-mole.png",
};

const PERSONAGEM_TITLES: Record<string, string> = {
  MVP:    "MATADOR",
  BAGRE:  "BAGRE DA NOITE",
  RACUDO: "PREGUEIRO",
};

// Fallback badge images when conquista traitNome isn't recognized
const BADGE_FALLBACKS = [
  "/medalhas/em-chamas.png",
  "/medalhas/virada-de-chave.png",
  "/medalhas/ma-fase.png",
];

export function HomeClient({
  rodadaId, dataRodada, jaVotou,
  maisVotados, personagens, conquistas, datePills,
  criarRodadaAction,
}: Props) {
  const [bsOpen, setBsOpen] = useState(false);
  const [activePill, setActivePill] = useState(datePills.length > 0 ? datePills.length - 1 : 0);
  const [sharePersonagem, setSharePersonagem] = useState<number | null>(null);

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
          paddingTop: 130,
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
              <img aria-hidden alt="" src={CAMPO} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", pointerEvents: "none", borderRadius: 40 }} />
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
                      <CalendarBlank size={16} color="#9fe870" weight="bold" />
                      <span style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 12, lineHeight: "20px", color: "#9fe870", letterSpacing: "-0.48px", whiteSpace: "nowrap" }}>{dataRodada}</span>
                    </div>
                    <div style={{ background: "#1e1e1e", padding: "4px 8px", borderRadius: 48, display: "flex", alignItems: "center", gap: 4, overflow: "hidden" }}>
                      <Alarm size={16} color="#fff" weight="bold" />
                      <span style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 12, lineHeight: "20px", color: "#fff", letterSpacing: "-0.48px", whiteSpace: "nowrap" }}>20:00</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Players formation */}
              <div style={{ position: "relative", display: "flex", flexDirection: "column", gap: 24, alignItems: "center" }}>
                <PlayerSlot tshirt={TSHIRT} />
                <div style={{ display: "flex", gap: 62, alignItems: "center", justifyContent: "center", width: "100%" }}>
                  <PlayerSlot tshirt={TSHIRT} />
                  <PlayerSlot tshirt={TSHIRT} />
                  <PlayerSlot tshirt={TSHIRT} />
                </div>
                <div style={{ borderTop: "1px solid #5e5e5e", width: 292, paddingTop: 16, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <PlayerSlot tshirt={TSHIRT_ALT} />
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
                      <CaretRight size={20} weight="bold" color="#000" />
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
                  <Trophy size={16} color="#9fe870" weight="fill" />
                  <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 16, lineHeight: "20px", color: "#fff" }}>MAIS VOTADOS</span>
                </div>
                <button onClick={() => setBsOpen(true)} style={{
                  display: "flex", alignItems: "center", gap: 4,
                  background: "#2a2a2a", border: "1px solid #3a3a3a",
                  borderRadius: 9999, padding: "7px 13px", cursor: "pointer",
                }}>
                  <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 12, lineHeight: "18px", color: "#fff" }}>Ver mais</span>
                  <CaretRight size={12} color="#fff" weight="bold" />
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
                        <div style={{ background: "#000", border: "1px solid #353535", borderRadius: 12, width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          <Medal size={24} color={["#f5c518","#aaa","#cd7f32"][i] ?? "#fff"} weight="fill" />
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
                <CalendarStar size={16} color="#9fe870" weight="fill" />
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
                  const mascot = PERSONAGEM_MASCOTS[p.tipo] ?? "/ilustracoes/corpo-mole.png";
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
                        <button onClick={() => setSharePersonagem(i)} style={{
                          display: "inline-flex", alignItems: "center", gap: 4, alignSelf: "flex-start",
                          background: "#2a2a2a", border: "1px solid #3a3a3a",
                          borderRadius: 9999, padding: "7px 13px", cursor: "pointer",
                        }}>
                          <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 12, lineHeight: "18px", color: "#fff" }}>Ver mais</span>
                          <CaretRight size={12} color="#fff" weight="bold" />
                        </button>
                      </div>
                      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "flex-end", alignSelf: "stretch" }}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img alt={title} src={mascot} style={{ width: 117, height: 117, objectFit: "contain", flexShrink: 0 }} />
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
                  <Medal size={16} color="#9fe870" weight="fill" />
                  <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 16, lineHeight: "20px", color: "#fff" }}>MEDALHAS</span>
                </div>
                <Link href="/ranking" style={{
                  display: "flex", alignItems: "center", gap: 4, textDecoration: "none",
                  background: "#2a2a2a", border: "1px solid #3a3a3a",
                  borderRadius: 9999, padding: "7px 13px",
                }}>
                  <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 12, lineHeight: "18px", color: "#fff" }}>Ver todas</span>
                  <CaretRight size={12} color="#fff" weight="bold" />
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
                  const badge = getMedalha(c.traitNome) ?? BADGE_FALLBACKS[i % BADGE_FALLBACKS.length];
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
                        <div style={{ width: 72, height: 72, overflow: "hidden", flexShrink: 0, background: "#111", borderRadius: 8 }}>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img alt={c.traitNome} src={badge} style={{ width: 72, height: 72, objectFit: "contain", mixBlendMode: "screen" }} />
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

      {/* ── TOPBAR (fixed overlay) — matches Figma 126:326 / 126:337 ── */}
      <div style={{
        position: "fixed", top: 0, left: "50%", transform: "translateX(-50%)",
        width: "min(100%, 430px)", zIndex: 30,
        background: "rgba(255,255,255,0.08)",
        backdropFilter: "blur(50px)", WebkitBackdropFilter: "blur(50px)",
        borderBottom: "1px solid rgba(84,84,86,0.34)",
      }}>
        {/* Status bar area */}
        <div style={{ height: 54 }} />
        {/* Topbar row */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "4px 8px" }}>
          <button style={{ width: 56, height: 56, display: "flex", alignItems: "center", justifyContent: "center", background: "none", border: "none", cursor: "pointer" }}>
            <List size={24} color="#fff" weight="bold" />
          </button>
          <div style={{ display: "flex", alignItems: "center", alignSelf: "stretch", padding: "16px 0" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img alt="Canelada" src={LOGO} style={{ height: 32, width: 32, objectFit: "contain" }} />
          </div>
          <button style={{ width: 56, height: 56, display: "flex", alignItems: "center", justifyContent: "center", background: "none", border: "none", cursor: "pointer" }}>
            <Bell size={24} color="#fff" weight="bold" />
          </button>
        </div>
      </div>

      {/* ── BOTTOM NAV ── */}
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
            <NavItem icon="house"   label="Home"    active />
            <NavItem icon="check"   label="Votos"   href="/votacao" />
            <NavItem icon="soccer"  label="Pelada"  href="/feed" />
            <NavItem icon="chart"   label="Ranking" href="/ranking" />
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

      {sharePersonagem !== null && personagens[sharePersonagem] && (
        <PersonagemShareModal
          open
          onClose={() => setSharePersonagem(null)}
          tipo={personagens[sharePersonagem].tipo}
          texto={personagens[sharePersonagem].texto}
          data={personagens[sharePersonagem].data}
          mascot={PERSONAGEM_MASCOTS[personagens[sharePersonagem].tipo] ?? "/ilustracoes/corpo-mole.png"}
          qtd={7 - sharePersonagem}
        />
      )}
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
  const iconEl = (() => {
    const c = active ? "#000" : "#fff";
    const w = 28;
    if (icon === "house")  return <House  size={w} color={c} weight={active ? "fill" : "regular"} />;
    if (icon === "check")  return <Check  size={w} color={c} weight={active ? "fill" : "regular"} />;
    if (icon === "soccer") return <Football size={w} color={c} weight={active ? "fill" : "regular"} />;
    if (icon === "chart")  return <ChartBar size={w} color={c} weight={active ? "fill" : "regular"} />;
    return null;
  })();

  const inner = (
    <div style={{
      width: 56, height: 56,
      borderRadius: active ? 100 : undefined,
      background: active ? "#9fe870" : undefined,
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      padding: 8, overflow: "hidden",
    }}>
      <div style={{ width: 28, display: "flex", flexDirection: "column", alignItems: "center" }}>
        {iconEl}
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
