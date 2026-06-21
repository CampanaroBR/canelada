"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import {
  Lightning, Medal, CaretRight, Check,
  CalendarBlank, Alarm, CalendarStar,
  List, Bell, MedalMilitary, X, ThumbsUp, ThumbsDown,
} from "@phosphor-icons/react";
import { BottomNav } from "@/components/layout/BottomNav";
import type { LeaderboardEntry } from "@/components/BottomsheetMaisVotados";
import type { PersonagemSemana } from "@/components/ShareCardModal";

// Carregados sob demanda (abrem só na interação) — reduz o JS inicial da Home
const BottomsheetMaisVotados = dynamic(
  () => import("@/components/BottomsheetMaisVotados").then(m => m.BottomsheetMaisVotados),
  { ssr: false }
);
const MenuSheet = dynamic(
  () => import("@/components/MenuSheet").then(m => m.MenuSheet),
  { ssr: false }
);
const ShareCardModal = dynamic(
  () => import("@/components/ShareCardModal").then(m => m.ShareCardModal),
  { ssr: false }
);

// Mapeia achievement slug → arquivo SVG exato no git (case-sensitive no Vercel/Linux)
const TRAIT_BADGE: Record<string, string> = {
  "alma-do-grupo":    "/conquistas/alma-do-grupo.png",
  "completo":         "/conquistas/completo.png",
  "consistente":      "/conquistas/consistente.png",
  "em-chamas":        "/conquistas/em-chamas.png",
  "invicto":          "/conquistas/Invicto.png",
  "irregular":        "/conquistas/Irregular.png",
  "jogador-invisivel":"/conquistas/jogador-invisivel.png",
  "lanterna":         "/conquistas/Lanterna.png",
  "lenda":            "/conquistas/Lenda.png",
  "ma-fase":          "/conquistas/ma-fase.png",
  "mais-presente":    "/conquistas/mais-presente.png",
  "primeira-vitoria": "/conquistas/primeira-vitoria.png",
  "racudo-do-mes":    "/conquistas/racudo-do-mes.png",
  "rei-absoluto":     "/conquistas/rei-absoluto.png",
  "rei-do-mes":       "/conquistas/rei-do-mes.png",
  "so-perde":         "/conquistas/so-perde.png",
  "trofeu-bagre":     "/conquistas/trofeu-bagre.png",
  "veterano":         "/conquistas/veterano.png",
  "virada-de-chave":  "/conquistas/virada-de-chave.png",
};

const CAMPO           = "/campo.jpg";
const LOGO            = "/logo.png";
const TSHIRT_OUTLINE  = "/tshirt-outline.svg";
const TSHIRT_GK_OUT   = "/tshirt-gk-outline.svg";
const TSHIRT_FILLED   = "/tshirt-filled.svg";
const TSHIRT_GK_FILL  = "/tshirt-gk-filled.svg";

type MaisVotado = { apelido: string; qtd: number; categoria: string };
type Personagem  = { tipo: string; apelido: string; texto: string; data: Date };
type Conquista   = { apelido: string; traitSlug: string; traitNome: string; traitEmoji: string | null; traitDesc: string | null; data: Date };

type ProximoBaba = { dataFormatada: string; hora: string; diasRestantes: number };

interface Props {
  IMG: Record<string, string>;
  rodadaId: string | null;
  top5Rodada: string[];
  dataRodada: string | null;
  jaVotou: boolean;
  maisVotados: MaisVotado[];
  personagensPorRodada: Personagem[][];
  personagensSemana: PersonagemSemana[];
  selecao: (PersonagemSemana | null)[];
  selecaoPiores: (PersonagemSemana | null)[];
  conquistas: Conquista[];
  datePills: string[];
  grupoNome: string;
  proximoBaba: ProximoBaba | null;
  criarRodadaAction: () => Promise<void>;
}

const MEDAL_COLORS = ["#F59E0B", "#9CA3AF", "#B45309"];

export function HomeClient({
  rodadaId, dataRodada, jaVotou, top5Rodada,
  maisVotados, personagensPorRodada, personagensSemana, selecao, selecaoPiores, conquistas, datePills, grupoNome,
  proximoBaba, criarRodadaAction,
}: Props) {
  const [bsOpen, setBsOpen] = useState(false);
  const [bsMounted, setBsMounted] = useState(false); // só monta o sheet após 1ª abertura
  const [shareCard, setShareCard] = useState<PersonagemSemana | null>(null);
  const [verMaisOpen, setVerMaisOpen] = useState(false);
  const [campoTab, setCampoTab] = useState<"melhores" | "piores">("melhores");

  // Campinho: conjunto ativo conforme a aba
  const campoSel = campoTab === "melhores" ? selecao : selecaoPiores;
  const [menuOpen, setMenuOpen] = useState(false);


  const lbEntries: LeaderboardEntry[] = maisVotados.slice(0, 6).map((v, i) => ({
    rank: i + 1,
    apelido: v.apelido,
    qtd: v.qtd,
    categoria: v.categoria,
  }));


  return (
    <div style={{
      minHeight: "100dvh",
      background: "#090909",
      display: "flex",
      flexDirection: "column",
      gap: 16,
      alignItems: "center",
      paddingBottom: "calc(96px + env(safe-area-inset-bottom, 0px))",
      position: "relative",
    }}>

      {/* ── 1. HEADER (dark, sem teal) ── */}
      <div style={{
        background: "transparent",
        paddingTop: "calc(env(safe-area-inset-top, 0px) + 80px)",
        paddingBottom: 0,
        paddingLeft: 16,
        paddingRight: 16,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 16,
        width: "100%",
        boxSizing: "border-box",
        overflow: "clip",
      }}>
        {/* Tabs: Os melhores / Os piores (dentro da área azul, acima do campinho) */}
        {jaVotou && (
          <div style={{ display: "flex", alignItems: "center", gap: 4, background: "#171717", borderRadius: 12, padding: 4 }}>
            {([["melhores", "Os melhores", ThumbsUp], ["piores", "Os piores", ThumbsDown]] as const).map(([key, label, Icon]) => {
              const active = campoTab === key;
              return (
                <button
                  key={key}
                  onClick={() => setCampoTab(key)}
                  style={{
                    display: "flex", alignItems: "center", gap: 8, cursor: "pointer",
                    borderRadius: 10, padding: "8px 10px",
                    background: active ? "#090909" : "transparent",
                    border: active ? "1px solid #424242" : "1px solid transparent",
                    boxShadow: active ? "0px 1px 2px rgba(0,0,0,0.2)" : "none",
                  }}
                >
                  <Icon size={20} color={active ? "#fff" : "#7a7a7a"} weight="regular" />
                  <span style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 14, lineHeight: "20px", color: active ? "#fff" : "#7a7a7a", whiteSpace: "nowrap" }}>{label}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* White outer card */}
        <div style={{
          background: "#fff",
          borderRadius: 48,
          padding: "16px 12px",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          overflow: "clip",
          boxSizing: "border-box",
        }}>
          {/* Campo */}
          <div style={{
            border: "1px solid #777575",
            borderRadius: 40,
            padding: "16px 24px",
            display: "flex",
            flexDirection: "column",
            gap: 16,
            alignItems: "center",
            position: "relative",
            width: "100%",
            boxSizing: "border-box",
          }}>
            {/* Background field image */}
            <Image aria-hidden alt="" src={CAMPO} fill sizes="400px" style={{ objectFit: "cover", pointerEvents: "none", borderRadius: 40 }} />
            <div aria-hidden style={{ position: "absolute", inset: 0, background: "rgba(35,52,0,0.34)", borderRadius: 40, pointerEvents: "none" }} />

            {/* Header info: título + data/hora + status */}
            <div style={{ position: "relative", display: "flex", flexDirection: "column", gap: 4, alignItems: "center", width: "100%" }}>
              {/* Row: título + date chips */}
              <div style={{ display: "flex", gap: 24, alignItems: "flex-start", justifyContent: "center", width: "100%" }}>
                {/* Título */}
                <div style={{ display: "flex", flexDirection: "column", flex: 1, minWidth: 0 }}>
                  <p style={{ margin: 0, fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 14, lineHeight: "20px", color: "#fff" }}>VOTAÇÃO DO</p>
                  <h1 style={{ margin: 0, fontFamily: "var(--font-display)", fontWeight: 900, fontSize: 32, lineHeight: "32px", color: "#fff" }}>BABA</h1>
                </div>
                {/* Date + time chips */}
                {dataRodada && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 4, alignItems: "flex-end", flexShrink: 0 }}>
                    <div style={{ background: "#1e1e1e", display: "flex", alignItems: "center", gap: 4, padding: "4px 8px", borderRadius: 48, overflow: "clip" }}>
                      <CalendarBlank size={16} color="#9fe870" weight="bold" />
                      <span style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 12, lineHeight: "20px", color: "#9fe870", letterSpacing: "-0.48px", whiteSpace: "nowrap" }}>{dataRodada}</span>
                    </div>
                    <div style={{ background: "#1e1e1e", display: "flex", alignItems: "center", gap: 4, padding: "4px 8px", borderRadius: 48, overflow: "clip" }}>
                      <Alarm size={16} color="#fff" weight="bold" />
                      <span style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 12, lineHeight: "20px", color: "#fff", letterSpacing: "-0.48px", whiteSpace: "nowrap" }}>20:00</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Status pill — centralizada */}
              <div style={{
                display: "inline-flex", alignSelf: "center",
                alignItems: "center", gap: 6,
                background: "rgba(55,55,55,0.2)",
                border: "1px solid rgba(255,255,255,0.15)",
                borderRadius: 100, padding: "4px 6px",
              }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: jaVotou ? "#e56767" : "#9fe870", flexShrink: 0 }} />
                <span style={{ fontFamily: "var(--font-display)", fontWeight: 500, fontSize: 12, lineHeight: "16px", color: "#fff", letterSpacing: "-0.4px", whiteSpace: "nowrap" }}>
                  {jaVotou ? "Votação encerrada!" : rodadaId ? "Votação aberta até às 22:30" : "Nenhuma rodada aberta"}
                </span>
              </div>
            </div>

            {/* Players formation */}
            <div style={{ position: "relative", display: "flex", flexDirection: "column", gap: 16, alignItems: "center", width: "100%" }}>
              {/* CF row */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", width: 292, paddingTop: 16, paddingBottom: 16 }}>
                {jaVotou
                  ? <PlayerNamed p={campoSel[0]} tshirt={TSHIRT_FILLED} onShare={setShareCard} />
                  : <PlayerSlot tshirt={TSHIRT_OUTLINE} />}
              </div>

              {/* Meio campo: 3 slots */}
              <div style={{ display: "flex", gap: 62, alignItems: "center", justifyContent: "center", width: "100%" }}>
                {jaVotou ? (
                  <>
                    <PlayerNamed p={campoSel[1]} tshirt={TSHIRT_FILLED} onShare={setShareCard} />
                    <PlayerNamed p={campoSel[2]} tshirt={TSHIRT_FILLED} onShare={setShareCard} />
                    <PlayerNamed p={campoSel[3]} tshirt={TSHIRT_FILLED} onShare={setShareCard} />
                  </>
                ) : (
                  <>
                    <PlayerSlot tshirt={TSHIRT_OUTLINE} />
                    <PlayerSlot tshirt={TSHIRT_OUTLINE} />
                    <PlayerSlot tshirt={TSHIRT_OUTLINE} />
                  </>
                )}
              </div>

              {/* GK row (só faz sentido GK nos "melhores" = Paredão) */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", width: 292, paddingTop: 16, paddingBottom: 16 }}>
                {jaVotou
                  ? <PlayerNamed p={campoSel[4]} tshirt={campoTab === "melhores" ? TSHIRT_GK_FILL : TSHIRT_FILLED} onShare={setShareCard} />
                  : <PlayerSlot tshirt={TSHIRT_GK_OUT} />}
              </div>
            </div>

            {/* CTA */}
            <div style={{ position: "relative", width: "100%" }}>
              {jaVotou ? (
                /* Banner frosted */
                <div style={{
                  backdropFilter: "blur(4.9px)", WebkitBackdropFilter: "blur(4.9px)",
                  background: "rgba(13,13,13,0.25)",
                  borderRadius: 10, padding: "12px 16px",
                  display: "flex", alignItems: "center", gap: 8,
                }}>
                  <span style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 16, lineHeight: "20px", color: "#fff", letterSpacing: "-0.5px", flex: 1 }}>
                    Você já votou nesta rodada!
                  </span>
                  <img src="/check-circle-green.svg" alt="" style={{ width: 24, height: 24, flexShrink: 0 }} />
                </div>
              ) : rodadaId ? (
                /* Votar agora */
                <Link href="/votacao" style={{
                  display: "flex", textDecoration: "none",
                  background: "#0d0d0d",
                  border: "1px solid #090909",
                  borderRadius: 14, padding: "8px 16px",
                  boxShadow: "0px 4px 9.8px 2px rgba(0,0,0,0.25)",
                  overflow: "clip",
                }}>
                  <div style={{ display: "flex", gap: 8, height: 52, alignItems: "center", paddingTop: 8, paddingBottom: 8, borderRadius: 12, width: "100%" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: 2, flex: 1, minWidth: 0 }}>
                      <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 18, lineHeight: "22px", color: "#9fe870", letterSpacing: "-0.4px" }}>Votar agora!</span>
                      <span style={{ fontFamily: "var(--font-display)", fontWeight: 500, fontSize: 12, lineHeight: "16px", color: "#fff" }}>Escolha o personagem de cada um</span>
                    </div>
                    <div style={{ background: "#9fe870", borderRadius: 12, width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, padding: 4, overflow: "clip" }}>
                      <CaretRight size={20} weight="bold" color="#000" />
                    </div>
                  </div>
                </Link>
              ) : (
                /* Criar rodada */
                <form action={criarRodadaAction}>
                  <button type="submit" style={{
                    width: "100%", background: "#0d0d0d", border: "1px solid #090909",
                    borderRadius: 14, padding: "13px 16px",
                    fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 18, color: "#9fe870",
                    cursor: "pointer", letterSpacing: "-0.8px",
                  }}>⚽ BABA ROLOU HOJE</button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Page sections ── */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16, padding: "0 8px", width: "100%", boxSizing: "border-box" }}>

        {/* ── PRÓXIMO BABA ── */}
        {proximoBaba && (
          <div style={{
            background: "#171717",
            border: "1px solid #2e2e2e",
            borderRadius: 20,
            padding: "13px 9px",
            display: "flex",
            alignItems: "center",
            gap: 16,
          }}>
            {/* Left: icon + info */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1, minWidth: 0 }}>
              {/* Calendar icon box */}
              <div style={{
                background: "#171717",
                border: "1px solid #2e2e2e",
                borderRadius: 12,
                padding: 8,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img alt="" src="/icon-calendar.svg" width={28} height={28} />
              </div>

              {/* Text */}
              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <span style={{
                  fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 10,
                  lineHeight: "14px", letterSpacing: "0.5px", textTransform: "uppercase",
                  color: "#9fe870", whiteSpace: "nowrap",
                }}>PRÓXIMO BABA</span>
                <span style={{
                  fontFamily: "var(--font-display)", fontWeight: 900, fontSize: 18,
                  lineHeight: "22px", color: "#fff", whiteSpace: "nowrap", textTransform: "capitalize",
                }}>
                  {proximoBaba.dataFormatada}
                </span>
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img alt="" src="/icon-clock.svg" width={16} height={16} />
                  <span style={{
                    fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 12,
                    lineHeight: "16px", color: "#fff", letterSpacing: "-0.48px",
                  }}>{proximoBaba.hora}</span>
                </div>
              </div>
            </div>

            {/* Right: days badge */}
            <div style={{
              background: "rgba(214,255,188,0.12)",
              borderRadius: 14,
              width: 55,
              height: 36,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}>
              <span style={{
                fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 12,
                lineHeight: "18px", color: "#9fe870", whiteSpace: "nowrap",
              }}>
                {proximoBaba.diasRestantes > 0
                  ? `${proximoBaba.diasRestantes} dia${proximoBaba.diasRestantes !== 1 ? "s" : ""}`
                  : "hoje"}
              </span>
            </div>
          </div>
        )}

        {/* ── 2. MAIS VOTADOS ── */}
        {maisVotados.length > 0 && (
          <div style={{ background: "#171717", border: "1px solid #2e2e2e", borderRadius: 20, padding: "17px 9px", display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Header */}
            <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
              <div style={{ display: "flex", flex: 1, alignItems: "center", gap: 8 }}>
                <div style={{ background: "#171717", border: "1px solid #2e2e2e", borderRadius: 12, padding: 8, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Lightning size={24} color="#9fe870" weight="regular" />
                </div>
                <h2 style={{ margin: 0, fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 16, lineHeight: "20px", color: "#fff", whiteSpace: "nowrap" }}>PARCIAL DA RODADA</h2>
              </div>
              <button onClick={() => { setBsMounted(true); setBsOpen(true); }} style={{
                display: "flex", alignItems: "center", gap: 4, flexShrink: 0,
                background: "#2a2a2a", border: "1px solid #3a3a3a",
                borderRadius: 9999, padding: "7px 13px", cursor: "pointer",
              }}>
                <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 12, lineHeight: "18px", color: "#fff", whiteSpace: "nowrap" }}>Ver mais</span>
                <CaretRight size={12} color="#fff" weight="bold" />
              </button>
            </div>

            {/* Leaderboard rows */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {maisVotados.slice(0, 3).map((v, i) => (
                <div key={i} style={{ background: "#090909", border: "1px solid #2e2e2e", borderRadius: 14, paddingLeft: 24, paddingRight: 8, paddingTop: 8, paddingBottom: 8 }}>
                  <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                    <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 20, lineHeight: "18px", color: "#fff", whiteSpace: "nowrap", flexShrink: 0 }}>{i + 1}.</span>
                    <div style={{ background: "#1b1b1b", flex: 1, height: 52, borderRadius: 12, padding: 8, display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
                      <div style={{ display: "flex", flex: 1, gap: 8, alignItems: "center", overflow: "clip", minWidth: 0 }}>
                        {/* Qtd box */}
                        <div style={{ background: "#3a3a3a", width: 40, height: 40, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, padding: 4, overflow: "clip" }}>
                          <span style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 20, lineHeight: "18px", color: "#fff", whiteSpace: "nowrap" }}>{v.qtd}x</span>
                        </div>
                        {/* Name + category */}
                        <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", justifyContent: "center", lineHeight: "18px" }}>
                          <p style={{ margin: 0, fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 16, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{v.apelido.toUpperCase()}</p>
                          <p style={{ margin: 0, fontFamily: "var(--font-display)", fontWeight: 500, fontSize: 14, color: "#8d908d" }}>{v.categoria}</p>
                        </div>
                      </div>
                      {/* Medal icon */}
                      <div style={{ background: "#090909", border: "1px solid #353535", borderRadius: 12, width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, padding: 4, overflow: "clip" }}>
                        <MedalMilitary size={28} weight="fill" color={MEDAL_COLORS[i] ?? "#555"} />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── 3. VER TODOS OS PERSONAGENS (catálogo da rodada) ── */}
        {personagensSemana.length > 0 && (
          <button
            onClick={() => setVerMaisOpen(true)}
            style={{
              cursor: "pointer", WebkitTapHighlightColor: "transparent",
              background: "#171717", border: "1px solid #2e2e2e", borderRadius: 20, padding: "13px 9px",
              display: "flex", alignItems: "center", gap: 12, textAlign: "left",
            }}
          >
            <div style={{ background: "#171717", border: "1px solid #2e2e2e", borderRadius: 12, padding: 8, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <CalendarStar size={24} color="#9fe870" weight="regular" />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ margin: 0, fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 16, lineHeight: "20px", color: "#fff" }}>PERSONAGENS DA SEMANA</p>
              <p style={{ margin: 0, fontFamily: "var(--font-body)", fontWeight: 500, fontSize: 12, color: "#9fe870" }}>{personagensSemana.length} personagens · ver todos</p>
            </div>
            <CaretRight size={16} color="#555" weight="bold" />
          </button>
        )}

        {/* ── 4. MEDALHAS ── */}
        {conquistas.length > 0 && (
          <div style={{ background: "#171717", border: "1px solid #2e2e2e", borderRadius: 20, padding: "17px 9px", display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Header */}
            <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
              <div style={{ display: "flex", flex: 1, alignItems: "center", gap: 8 }}>
                <div style={{ background: "#171717", border: "1px solid #2e2e2e", borderRadius: 12, padding: 8, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Medal size={24} color="#9fe870" weight="fill" />
                </div>
                <h2 style={{ margin: 0, fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 16, lineHeight: "20px", color: "#fff", whiteSpace: "nowrap" }}>MEDALHAS</h2>
              </div>
              <Link href="/medalhas" style={{
                display: "flex", alignItems: "center", gap: 4, textDecoration: "none", flexShrink: 0,
                background: "#2a2a2a", border: "1px solid #3a3a3a",
                borderRadius: 9999, padding: "7px 13px",
              }}>
                <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 12, lineHeight: "18px", color: "#fff", whiteSpace: "nowrap" }}>Ver todas</span>
                <CaretRight size={12} color="#fff" weight="bold" />
              </Link>
            </div>

            {/* Stats bar */}
            <div style={{ background: "#111", border: "1px solid #1e1e1e", borderRadius: 12, padding: "9px 13px", display: "flex", gap: 12, alignItems: "center" }}>
              <span style={{ fontFamily: "var(--font-body)", fontSize: 18, lineHeight: "27px", letterSpacing: "-0.44px", flexShrink: 0 }}>🏅</span>
              <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 4 }}>
                <p style={{ margin: 0, fontFamily: "var(--font-display)", fontWeight: 900, fontSize: 0, lineHeight: 0, color: "#fff", whiteSpace: "nowrap" }}>
                  <span style={{ fontSize: 18, lineHeight: "20px" }}>{conquistas.length} </span>
                  <span style={{ fontWeight: 500, fontSize: 16, lineHeight: "20px", color: "#555" }}>de 15 jogadores</span>
                </p>
                <p style={{ margin: 0, fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 14, lineHeight: "18px", color: "#555", whiteSpace: "nowrap" }}>já conquistaram uma medalha</p>
              </div>
            </div>

            {/* Achievement cards */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {conquistas.map((c, i) => {
                return (
                  <div key={i} style={{ background: "#090909", border: "1px solid #2e2e2e", borderRadius: 16, padding: "9px 17px", display: "flex", alignItems: "flex-start" }}>
                    {/* flex-[1_0_0] min-w-px wrapper */}
                    <div style={{ flex: "1 0 0", minWidth: 1, position: "relative" }}>
                      {/* flex gap-16 items-center row */}
                      <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                        {/* Text column: flex-[1_0_0] flex-col gap-2 items-start justify-center min-w-px */}
                        <div style={{ flex: "1 0 0", minWidth: 0, overflow: "hidden", display: "flex", flexDirection: "column", gap: 2, alignItems: "flex-start", justifyContent: "center" }}>

                          {/* Label: h-24, text absolute top-5 */}
                          <div style={{ height: 24, position: "relative", width: "100%", flexShrink: 0 }}>
                            <p style={{ margin: 0, position: "absolute", top: 5, left: 0, fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 10, lineHeight: "15px", color: "#a1a1a1", letterSpacing: "0.5px", whiteSpace: "nowrap" }}>
                              HOJE · NOVA MEDALHA
                            </p>
                          </div>

                          {/* Name wrapper: relative shrink-0 w-full → inner flex items-center → p flex-1 min-w-px */}
                          <div style={{ position: "relative", flexShrink: 0, width: "100%" }}>
                            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
                              <div style={{ display: "flex", alignItems: "center", position: "relative", width: "100%", flexShrink: 0 }}>
                                <p style={{ margin: 0, flex: "1 0 0", minWidth: 1, fontFamily: "var(--font-display)", fontWeight: 900, fontSize: 0, lineHeight: 0, color: "#fff" }}>
                                  <span style={{ fontWeight: 800, fontSize: 16, lineHeight: "20px", color: "#9fe870" }}>{c.apelido}</span>
                                  <span style={{ fontWeight: 800, fontSize: 16, lineHeight: "20px" }}>{" destravou "}</span>
                                  <span style={{ fontWeight: 800, fontSize: 16, lineHeight: "20px" }}>{`"${c.traitNome}!"`}</span>
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Description: h-21 pt-2 */}
                          <div style={{ height: 21, flexShrink: 0, paddingTop: 2, overflow: "hidden" }}>
                            <p style={{ margin: 0, fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 12, lineHeight: "16px", color: "#555", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                              {c.traitDesc ?? (c.traitEmoji ? `${c.traitEmoji} ${c.traitNome}` : c.traitNome)}
                            </p>
                          </div>

                        </div>

                        {/* Badge: overflow hidden para cortar o nome interno do SVG */}
                        <div style={{ width: 72, height: 72, flexShrink: 0, position: "relative", overflow: "hidden" }}>
                          <Image
                            alt={c.traitNome}
                            src={TRAIT_BADGE[c.traitSlug] ?? `/conquistas/${c.traitSlug}.png`}
                            fill
                            sizes="72px"
                            style={{ display: "block", objectFit: "contain" }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

          </div>
        )}
      </div>

      {/* ── TOPBAR (fixed) ── */}
      <div className="glass-bar" style={{
        position: "fixed", top: 0, left: "50%", transform: "translateX(-50%)",
        width: "min(100%, 430px)", zIndex: 30,
        paddingTop: "env(safe-area-inset-top, 0px)",
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "4px 8px" }}>
          <button aria-label="Abrir menu" onClick={() => setMenuOpen(true)} style={{ width: 56, height: 56, display: "flex", alignItems: "center", justifyContent: "center", padding: "16px 4px", background: "none", border: "none", cursor: "pointer", overflow: "clip" }}>
            <List size={24} color="#fff" weight="bold" />
          </button>
          <div style={{ padding: 4, display: "flex", overflow: "clip" }}>
            <Image alt="Canelada" src={LOGO} width={48} height={48} priority style={{ objectFit: "cover", borderRadius: "50%" }} />
          </div>
          <button aria-label="Notificações" style={{ width: 56, height: 56, display: "flex", alignItems: "center", justifyContent: "center", padding: "16px 4px", background: "none", border: "none", cursor: "pointer", overflow: "clip" }}>
            <Bell size={24} color="#fff" weight="bold" />
          </button>
        </div>
      </div>

      {/* ── BOTTOM NAV (fixed) ── */}
      <BottomNav />

      {bsMounted && (
        <BottomsheetMaisVotados
          open={bsOpen}
          onClose={() => setBsOpen(false)}
          entries={lbEntries}
          datas={datePills}
          dataAtiva={datePills.length - 1}
        />
      )}

      {/* Card premium do personagem (full-screen) */}
      {shareCard && (
        <ShareCardModal personagem={shareCard} grupoNome={grupoNome} onClose={() => setShareCard(null)} />
      )}

      {/* Ver mais — lista completa dos personagens da semana */}
      {verMaisOpen && (
        <>
          <div aria-hidden onClick={() => setVerMaisOpen(false)} style={{
            position: "fixed", top: 0, bottom: 0, left: "50%", transform: "translateX(-50%)",
            width: "min(100%, 430px)", zIndex: 50, background: "rgba(0,0,0,0.65)",
            backdropFilter: "blur(2px)", WebkitBackdropFilter: "blur(2px)",
          }} />
          <div role="dialog" aria-modal="true" style={{
            position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)",
            width: "min(100%, 430px)", zIndex: 51, maxHeight: "85dvh",
            background: "#1a1a1a", border: "1px solid #2e2e2e", borderRadius: "32px 32px 0 0",
            display: "flex", flexDirection: "column",
            paddingBottom: "max(24px, env(safe-area-inset-bottom, 24px))",
            animation: "sheet-up 0.32s cubic-bezier(0.32, 0.72, 0, 1)",
          }}>
            <div style={{ display: "flex", justifyContent: "center", padding: "12px 0 8px", flexShrink: 0 }}>
              <div style={{ width: 40, height: 4, background: "#3a3a3a", borderRadius: 9999 }} />
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "4px 16px 12px", flexShrink: 0 }}>
              <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 18, color: "#fff" }}>PERSONAGENS DA SEMANA</span>
              <button onClick={() => setVerMaisOpen(false)} aria-label="Fechar" style={{ width: 40, height: 40, background: "#000", border: "1px solid #424242", borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                <X size={16} color="#fff" weight="bold" />
              </button>
            </div>
            <div style={{ overflowY: "auto", display: "flex", flexDirection: "column", gap: 8, padding: "0 16px" }}>
              {personagensSemana.map((p) => (
                <button key={p.slug} onClick={() => { setVerMaisOpen(false); setShareCard(p); }} style={{
                  textAlign: "left", cursor: "pointer", display: "flex", alignItems: "center", gap: 12,
                  background: "#090909", border: "1px solid #2e2e2e", borderRadius: 14, padding: "8px 12px", WebkitTapHighlightColor: "transparent",
                }}>
                  <div style={{ width: 48, height: 48, position: "relative", flexShrink: 0 }}>
                    <Image alt={p.nome} src={`/votacao-mascot/${p.slug}.png`} fill sizes="48px" style={{ objectFit: "contain" }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: 0, fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 15, color: "#fff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", textTransform: "uppercase" }}>{p.nome}</p>
                    <p style={{ margin: 0, fontFamily: "var(--font-body)", fontWeight: 500, fontSize: 12, color: "#9fe870" }}>{p.vencedor} · {p.votos} votos</p>
                  </div>
                  <CaretRight size={16} color="#555" weight="bold" />
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {/* ── Menu Hambúrguer (bottom sheet compartilhado) ── */}
      {menuOpen && <MenuSheet open onClose={() => setMenuOpen(false)} />}
    </div>
  );
}

/* Slot vazio: camisa + "VOTE" */
function PlayerSlot({ tshirt }: { tshirt: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flex: 1 }}>
      <div style={{
        background: "#1e1e1e", border: "1px solid #555", borderRadius: 22,
        width: 48, height: 48,
        display: "flex", alignItems: "center", justifyContent: "center",
        marginBottom: -8,
        boxShadow: "0px 5px 6.9px 4px rgba(0,0,0,0.3)",
        padding: 7, overflow: "clip", flexShrink: 0,
      }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img alt="" src={tshirt} style={{ width: 24, height: 24 }} />
      </div>
      <p style={{ margin: 0, marginTop: 0, fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 12, lineHeight: "normal", color: "#fff", textAlign: "center", whiteSpace: "nowrap" }}>VOTE</p>
    </div>
  );
}

/* Slot com nome do jogador (estado pós-votação) */
function PlayerNamed({ p, tshirt, onShare }: { p: PersonagemSemana | null; tshirt: string; onShare: (p: PersonagemSemana) => void }) {
  const name = p?.vencedor ?? "?";
  const clickable = !!p;
  return (
    <button
      onClick={() => p && onShare(p)}
      disabled={!clickable}
      style={{
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flex: 1,
        background: "none", border: "none", padding: 0, cursor: clickable ? "pointer" : "default",
        WebkitTapHighlightColor: "transparent",
      }}
    >
      <div style={{
        background: "#1e1e1e", border: "1px solid #555", borderRadius: 22,
        width: 48, height: 48,
        display: "flex", alignItems: "center", justifyContent: "center",
        marginBottom: -8,
        boxShadow: "0px 5px 6.9px 4px rgba(0,0,0,0.3)",
        padding: 7, overflow: "clip", flexShrink: 0,
      }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img alt="" src={tshirt} style={{ width: 24, height: 24 }} />
      </div>
      <p style={{ margin: 0, marginTop: 0, fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 12, lineHeight: "normal", color: "#fff", textAlign: "center", whiteSpace: "nowrap", maxWidth: 72, overflow: "hidden", textOverflow: "ellipsis" }}>{name}</p>
    </button>
  );
}


