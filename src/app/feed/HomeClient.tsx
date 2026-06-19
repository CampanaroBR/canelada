"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Lightning, Medal, CaretRight, Check,
  CalendarBlank, Alarm, CalendarStar,
  List, Bell, MedalMilitary,
  User, UsersThree, SignOut, X,
} from "@phosphor-icons/react";
import { BottomNav } from "@/components/layout/BottomNav";
import { signOut } from "next-auth/react";
import { BottomsheetMaisVotados } from "@/components/BottomsheetMaisVotados";
import type { LeaderboardEntry } from "@/components/BottomsheetMaisVotados";
import { PersonagemShareModal } from "@/components/PersonagemShareModal";

// Mapeia achievement slug → arquivo SVG exato no git (case-sensitive no Vercel/Linux)
const TRAIT_BADGE: Record<string, string> = {
  "alma-do-grupo":    "/conquistas/alma-do-grupo.svg",
  "completo":         "/conquistas/completo.svg",
  "consistente":      "/conquistas/consistente.svg",
  "em-chamas":        "/conquistas/em-chamas.svg",
  "invicto":          "/conquistas/Invicto.svg",
  "irregular":        "/conquistas/Irregular.svg",
  "jogador-invisivel":"/conquistas/jogador-invisivel.svg",
  "lanterna":         "/conquistas/Lanterna.svg",
  "lenda":            "/conquistas/Lenda.svg",
  "ma-fase":          "/conquistas/ma-fase.svg",
  "mais-presente":    "/conquistas/mais-presente.svg",
  "primeira-vitoria": "/conquistas/primeira-vitoria.svg",
  "racudo-do-mes":    "/conquistas/racudo-do-mes.svg",
  "rei-absoluto":     "/conquistas/rei-absoluto.svg",
  "rei-do-mes":       "/conquistas/rei-do-mes.svg",
  "so-perde":         "/conquistas/so-perde.svg",
  "trofeu-bagre":     "/conquistas/trofeu-bagre.svg",
  "veterano":         "/conquistas/veterano.svg",
  "virada-de-chave":  "/conquistas/virada-de-chave.svg",
};

const CAMPO           = "/campo.png";
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
  personagens: Personagem[];
  conquistas: Conquista[];
  datePills: string[];
  grupoNome: string;
  proximoBaba: ProximoBaba | null;
  criarRodadaAction: () => Promise<void>;
}

const PERSONAGEM_MASCOTS: Record<string, string> = {
  MVP:    "/ilustracoes/tubarao-share.png",
  BAGRE:  "/ilustracoes/bagre.png",
  RACUDO: "/ilustracoes/corpo-mole.png",
};

const PERSONAGEM_TITLES: Record<string, string> = {
  MVP:    "MATADOR",
  BAGRE:  "BAGRE DA NOITE",
  RACUDO: "PREGUEIRO",
};

const MEDAL_COLORS = ["#F59E0B", "#9CA3AF", "#B45309"];

export function HomeClient({
  rodadaId, dataRodada, jaVotou, top5Rodada,
  maisVotados, personagens, conquistas, datePills, grupoNome,
  proximoBaba, criarRodadaAction,
}: Props) {
  const [bsOpen, setBsOpen] = useState(false);
  const [activePill, setActivePill] = useState(datePills.length > 0 ? datePills.length - 1 : 0);
  const [sharePersonagem, setSharePersonagem] = useState<number | null>(null);
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

      {/* ── 1. TEAL HEADER ── */}
      <div style={{
        background: "#1998ad",
        paddingTop: "calc(env(safe-area-inset-top, 0px) + 80px)",
        paddingBottom: 20,
        paddingLeft: 16,
        paddingRight: 16,
        borderBottomLeftRadius: 40,
        borderBottomRightRadius: 40,
        display: "flex",
        alignItems: "center",
        width: "100%",
        boxSizing: "border-box",
        overflow: "clip",
      }}>
        {/* White outer card */}
        <div style={{
          background: "#fff",
          borderRadius: 48,
          padding: "16px 12px",
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          overflow: "clip",
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
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img aria-hidden alt="" src={CAMPO} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", pointerEvents: "none", borderRadius: 40 }} />
            <div aria-hidden style={{ position: "absolute", inset: 0, background: "rgba(35,52,0,0.34)", borderRadius: 40, pointerEvents: "none" }} />

            {/* Header info: título + data/hora + status */}
            <div style={{ position: "relative", display: "flex", flexDirection: "column", gap: 4, alignItems: "center", width: "100%" }}>
              {/* Row: título + date chips */}
              <div style={{ display: "flex", gap: 24, alignItems: "flex-start", justifyContent: "center", width: "100%" }}>
                {/* Título */}
                <div style={{ display: "flex", flexDirection: "column", flex: 1, minWidth: 0 }}>
                  <p style={{ margin: 0, fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 14, lineHeight: "20px", color: "#fff" }}>VOTAÇÃO DO</p>
                  <p style={{ margin: 0, fontFamily: "var(--font-display)", fontWeight: 900, fontSize: 32, lineHeight: "32px", color: "#fff" }}>BABA</p>
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
                  ? <PlayerNamed name={top5Rodada[0] ?? "?"} tshirt={TSHIRT_FILLED} />
                  : <PlayerSlot tshirt={TSHIRT_OUTLINE} />}
              </div>

              {/* Meio campo: 3 slots */}
              <div style={{ display: "flex", gap: 62, alignItems: "center", justifyContent: "center", width: "100%" }}>
                {jaVotou ? (
                  <>
                    <PlayerNamed name={top5Rodada[1] ?? "?"} tshirt={TSHIRT_FILLED} />
                    <PlayerNamed name={top5Rodada[2] ?? "?"} tshirt={TSHIRT_FILLED} />
                    <PlayerNamed name={top5Rodada[3] ?? "?"} tshirt={TSHIRT_FILLED} />
                  </>
                ) : (
                  <>
                    <PlayerSlot tshirt={TSHIRT_OUTLINE} />
                    <PlayerSlot tshirt={TSHIRT_OUTLINE} />
                    <PlayerSlot tshirt={TSHIRT_OUTLINE} />
                  </>
                )}
              </div>

              {/* GK row */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", width: 292, paddingTop: 16, paddingBottom: 16 }}>
                {jaVotou
                  ? <PlayerNamed name={top5Rodada[4] ?? "?"} tshirt={TSHIRT_GK_FILL} />
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
                  <Lightning size={24} color="#9fe870" weight="fill" />
                </div>
                <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 16, lineHeight: "20px", color: "#fff", whiteSpace: "nowrap" }}>PARCIAL DA RODADA</span>
              </div>
              <button onClick={() => setBsOpen(true)} style={{
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

        {/* ── 3. PERSONAGEM DA SEMANA ── */}
        {personagens.length > 0 && (
          <div style={{ background: "#171717", border: "1px solid #2e2e2e", borderRadius: 20, padding: "17px 9px", display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ background: "#171717", border: "1px solid #2e2e2e", borderRadius: 12, padding: 8, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <CalendarStar size={24} color="#9fe870" weight="fill" />
              </div>
              <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 16, lineHeight: "20px", color: "#fff", whiteSpace: "nowrap" }}>PERSONAGEM DA SEMANA</span>
            </div>

            {/* Date pills */}
            {datePills.length > 0 && (
              <div style={{ height: 38, display: "flex", gap: 8, alignItems: "flex-start", overflow: "clip" }}>
                {datePills.map((d, i) => {
                  const active = i === activePill;
                  return (
                    <button key={i} onClick={() => setActivePill(i)} style={{
                      background: active ? "#9fe870" : "#111",
                      border: active ? "none" : "1px solid #2e2e2e",
                      borderRadius: 9999,
                      padding: active ? "6px 12px" : "7px 13px",
                      height: "100%",
                      fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 12, lineHeight: "18px",
                      color: active ? "#090909" : "#555",
                      cursor: "pointer", flexShrink: 0, whiteSpace: "nowrap",
                    }}>{d}</button>
                  );
                })}
              </div>
            )}

            {/* Cards */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {personagens.map((p, i) => {
                const title   = PERSONAGEM_TITLES[p.tipo] ?? p.tipo;
                const mascot  = PERSONAGEM_MASCOTS[p.tipo] ?? "/ilustracoes/corpo-mole.png";
                const dateStr = new Date(p.data).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
                const qtd     = Math.max(5, 8 - i);
                return (
                  <div key={i} style={{ background: "#090909", border: "1px solid #2e2e2e", borderRadius: 16, padding: 17, display: "flex", gap: 16, alignItems: "flex-start", overflow: "hidden" }}>
                    {/* Left: Award Container — flexShrink:0, width = content */}
                    <div style={{ flexShrink: 0, display: "flex", flexDirection: "column", gap: 12, alignItems: "flex-start" }}>
                      <div style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: "flex-start", justifyContent: "center" }}>
                        {/* Title + name block h:46 */}
                        <div style={{ height: 46, display: "flex", flexDirection: "column", gap: 4, alignItems: "flex-start" }}>
                          <p style={{ margin: 0, fontFamily: "var(--font-display)", fontWeight: 900, fontSize: 20, lineHeight: "24px", color: "#fff", whiteSpace: "nowrap" }}>{title}</p>
                          <p style={{ margin: 0, fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16, lineHeight: "18px", color: "#f9a8d4", whiteSpace: "nowrap" }}>{p.apelido}</p>
                        </div>
                        {/* Stats h:21 pt:4 */}
                        <div style={{ height: 21, paddingTop: 4 }}>
                          <p style={{ margin: 0, fontFamily: "var(--font-display)", fontWeight: 500, fontSize: 0, lineHeight: 0, color: "#9fe870" }}>
                            <span style={{ fontSize: 11, lineHeight: "16.5px" }}>Votado {qtd}x · </span>
                            <span style={{ fontSize: 11, lineHeight: "16.5px", color: "#838383" }}>{dateStr}</span>
                          </p>
                        </div>
                      </div>
                      {/* Ver mais */}
                      <button onClick={() => setSharePersonagem(i)} style={{
                        display: "inline-flex", alignItems: "center", gap: 4,
                        background: "#2a2a2a", border: "1px solid #3a3a3a",
                        borderRadius: 9999, padding: "7px 13px", cursor: "pointer",
                      }}>
                        <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 12, lineHeight: "18px", color: "#fff", whiteSpace: "nowrap" }}>Ver mais</span>
                        <CaretRight size={12} color="#fff" weight="bold" />
                      </button>
                    </div>

                    {/* Right: flex:1 self-stretch → definite height for mascot h:100% */}
                    <div style={{ flex: 1, minWidth: 1, alignSelf: "stretch", position: "relative", display: "flex", alignItems: "center", justifyContent: "flex-end" }}>
                      <div style={{ position: "relative", height: "100%", aspectRatio: "1920/1920", overflow: "clip", flexShrink: 0 }}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img alt={title} src={mascot} style={{ position: "absolute", display: "block", inset: 0, width: "100%", height: "100%", maxWidth: "none", pointerEvents: "none" }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
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
                <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 16, lineHeight: "20px", color: "#fff", whiteSpace: "nowrap" }}>MEDALHAS</span>
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
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            alt={c.traitNome}
                            src={TRAIT_BADGE[c.traitSlug] ?? `/conquistas/${c.traitSlug}.svg`}
                            style={{ position: "absolute", display: "block", inset: 0, width: "100%", height: "100%", maxWidth: "none", objectFit: "contain" }}
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
      <div style={{
        position: "fixed", top: 0, left: "50%", transform: "translateX(-50%)",
        width: "min(100%, 430px)", zIndex: 30,
        paddingTop: "env(safe-area-inset-top, 0px)",
        background: "rgba(255,255,255,0.1)",
        backdropFilter: "blur(50px)", WebkitBackdropFilter: "blur(50px)",
        borderBottom: "1px solid rgba(84,84,86,0.34)",
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "4px 8px" }}>
          <button onClick={() => setMenuOpen(true)} style={{ width: 56, height: 56, display: "flex", alignItems: "center", justifyContent: "center", padding: "16px 4px", background: "none", border: "none", cursor: "pointer", overflow: "clip" }}>
            <List size={24} color="#fff" weight="bold" />
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img alt="Canelada" src={LOGO} style={{ width: 56, height: 56, objectFit: "cover" }} />
          <button style={{ width: 56, height: 56, display: "flex", alignItems: "center", justifyContent: "center", padding: "16px 4px", background: "none", border: "none", cursor: "pointer", overflow: "clip" }}>
            <Bell size={24} color="#fff" weight="bold" />
          </button>
        </div>
      </div>

      {/* ── BOTTOM NAV (fixed) ── */}
      <BottomNav />

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
          apelido={personagens[sharePersonagem].apelido}
          data={personagens[sharePersonagem].data}
          mascot={PERSONAGEM_MASCOTS[personagens[sharePersonagem].tipo] ?? "/ilustracoes/corpo-mole.png"}
          qtd={maisVotados[sharePersonagem]?.qtd ?? Math.max(5, 8 - sharePersonagem)}
          grupoNome={grupoNome}
        />
      )}

      {/* ── Menu Hambúrguer Drawer ── */}
      {menuOpen && (
        <>
          {/* Backdrop */}
          <div
            aria-hidden
            onClick={() => setMenuOpen(false)}
            style={{
              position: "fixed", top: 0, bottom: 0, left: "50%", transform: "translateX(-50%)",
              width: "min(100%, 430px)", zIndex: 50,
              background: "rgba(0,0,0,0.65)",
              backdropFilter: "blur(2px)", WebkitBackdropFilter: "blur(2px)",
            }}
          />
          {/* Drawer */}
          <div style={{
            position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)",
            width: "min(100%, 430px)", zIndex: 51,
            background: "#1a1a1a",
            border: "1px solid #2e2e2e",
            borderRadius: "32px 32px 0 0",
            paddingBottom: "max(24px, env(safe-area-inset-bottom, 24px))",
          }}>
            {/* Handle */}
            <div style={{ display: "flex", justifyContent: "center", padding: "12px 0 8px" }}>
              <div style={{ width: 40, height: 4, background: "#3a3a3a", borderRadius: 9999 }} />
            </div>

            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "4px 16px 16px" }}>
              <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 18, color: "#fff" }}>
                MENU
              </span>
              <button
                onClick={() => setMenuOpen(false)}
                style={{ width: 40, height: 40, background: "#000", border: "1px solid #424242", borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
              >
                <X size={16} color="#fff" weight="bold" />
              </button>
            </div>

            {/* Items */}
            <div style={{ display: "flex", flexDirection: "column", gap: 2, padding: "0 16px" }}>
              <MenuRow icon={<User size={20} color="#fff" weight="regular" />} label="Meu Perfil" href="/perfil" onClose={() => setMenuOpen(false)} />
              <MenuRow icon={<UsersThree size={20} color="#fff" weight="regular" />} label="Meu Grupo" href="/grupo" onClose={() => setMenuOpen(false)} />
              <div style={{ height: 1, background: "#2a2a2a", margin: "8px 0" }} />
              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                style={{
                  display: "flex", alignItems: "center", gap: 12,
                  background: "none", border: "none", cursor: "pointer",
                  padding: "14px 8px", borderRadius: 12, width: "100%",
                }}
              >
                <div style={{ width: 40, height: 40, background: "#2a0a0a", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <SignOut size={20} color="#ef4444" weight="regular" />
                </div>
                <span style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 16, color: "#ef4444" }}>
                  Sair
                </span>
              </button>
            </div>
          </div>
        </>
      )}
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
function PlayerNamed({ name, tshirt }: { name: string; tshirt: string }) {
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
      <p style={{ margin: 0, marginTop: 0, fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 12, lineHeight: "normal", color: "#fff", textAlign: "center", whiteSpace: "nowrap", maxWidth: 72, overflow: "hidden", textOverflow: "ellipsis" }}>{name}</p>
    </div>
  );
}


function MenuRow({ icon, label, href, onClose }: { icon: React.ReactNode; label: string; href: string; onClose: () => void }) {
  return (
    <Link href={href} onClick={onClose} style={{ textDecoration: "none" }}>
      <div style={{
        display: "flex", alignItems: "center", gap: 12,
        padding: "14px 8px", borderRadius: 12,
      }}>
        <div style={{ width: 40, height: 40, background: "#2a2a2a", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          {icon}
        </div>
        <span style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 16, color: "#fff" }}>
          {label}
        </span>
        <CaretRight size={16} color="#555" weight="bold" style={{ marginLeft: "auto" }} />
      </div>
    </Link>
  );
}
