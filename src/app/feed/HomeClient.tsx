"use client";

import { useState } from "react";
import Link from "next/link";
import {
  House, CheckCircle, Football, ChartBar,
  Trophy, Medal, CaretRight, Check,
  CalendarBlank, Alarm, CalendarStar,
  List, Bell,
} from "@phosphor-icons/react";
import { BottomsheetMaisVotados } from "@/components/BottomsheetMaisVotados";
import type { LeaderboardEntry } from "@/components/BottomsheetMaisVotados";
import { PersonagemShareModal } from "@/components/PersonagemShareModal";
import { getMedalha } from "@/lib/assets";

const CAMPO      = "/campo.png";
const LOGO       = "/logo.png";
const TSHIRT     = "/tshirt.svg";
const TSHIRT_GK  = "/tshirt-alt.svg";

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

const MEDAL_ICONS = ["🥇", "🥈", "🥉", "🏅", "🏅", "🏅"];

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

  // Top 5 para o campinho no estado "já votou"
  const top5 = maisVotados.slice(0, 5).map(v => v.apelido.toUpperCase());

  return (
    <div style={{
      minHeight: "100dvh",
      background: "#090909",
      display: "flex",
      flexDirection: "column",
      gap: 16,
      alignItems: "center",
      paddingBottom: "calc(80px + env(safe-area-inset-bottom, 0px))",
      position: "relative",
    }}>

      {/* ── 1. TEAL HEADER ── */}
      <div style={{
        background: "#1998ad",
        paddingTop: "calc(env(safe-area-inset-top, 0px) + 64px)",
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

              {/* Status pill */}
              <div style={{
                display: "inline-flex", alignSelf: "flex-start",
                alignItems: "center", gap: 6,
                background: "rgba(55,55,55,0.2)",
                border: "1px solid rgba(255,255,255,0.15)",
                borderRadius: 100, padding: "4px 6px",
              }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: jaVotou ? "#e56767" : "#9fe870", flexShrink: 0 }} />
                <span style={{ fontFamily: "var(--font-display)", fontWeight: 500, fontSize: 12, lineHeight: "16px", color: "#fff", letterSpacing: "-0.4px", whiteSpace: "nowrap" }}>
                  {jaVotou ? "Votação encerrada!" : rodadaId ? "Votação aberta até às 15h" : "Nenhuma rodada aberta"}
                </span>
              </div>
            </div>

            {/* Players formation */}
            <div style={{ position: "relative", display: "flex", flexDirection: "column", gap: 16, alignItems: "center", width: "100%" }}>
              {/* CF row */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", width: 292, paddingTop: 16, paddingBottom: 16 }}>
                {jaVotou
                  ? <PlayerNamed name={top5[0] ?? "?"} tshirt={TSHIRT} />
                  : <PlayerSlot tshirt={TSHIRT} />}
              </div>

              {/* Meio campo: 3 slots */}
              <div style={{ display: "flex", gap: 62, alignItems: "center", justifyContent: "center", width: "100%" }}>
                {jaVotou ? (
                  <>
                    <PlayerNamed name={top5[1] ?? "?"} tshirt={TSHIRT} />
                    <PlayerNamed name={top5[2] ?? "?"} tshirt={TSHIRT} />
                    <PlayerNamed name={top5[3] ?? "?"} tshirt={TSHIRT} />
                  </>
                ) : (
                  <>
                    <PlayerSlot tshirt={TSHIRT} />
                    <PlayerSlot tshirt={TSHIRT} />
                    <PlayerSlot tshirt={TSHIRT} />
                  </>
                )}
              </div>

              {/* GK row */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", width: 292, paddingTop: 16, paddingBottom: 16 }}>
                {jaVotou
                  ? <PlayerNamed name={top5[4] ?? "?"} tshirt={TSHIRT_GK} />
                  : <PlayerSlot tshirt={TSHIRT_GK} />}
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
                  <span style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 18, lineHeight: "22px", color: "#fff", letterSpacing: "-0.5px", flex: 1 }}>
                    Você já votou nesta rodada!
                  </span>
                  <Check size={32} color="#9fe870" weight="bold" />
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

        {/* ── 2. MAIS VOTADOS ── */}
        {maisVotados.length > 0 && (
          <div style={{ background: "#171717", border: "1px solid #2e2e2e", borderRadius: 20, padding: "17px 9px", display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Header */}
            <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
              <div style={{ display: "flex", flex: 1, alignItems: "center", gap: 4 }}>
                <Trophy size={16} color="#9fe870" weight="fill" />
                <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 16, lineHeight: "20px", color: "#fff", whiteSpace: "nowrap" }}>MAIS VOTADOS</span>
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
                <div key={i} style={{ background: "#090909", borderRadius: 14, paddingLeft: 24, paddingRight: 8, paddingTop: 8, paddingBottom: 8 }}>
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
                        <span style={{ fontSize: 22, lineHeight: 1 }}>{MEDAL_ICONS[i]}</span>
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
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <CalendarStar size={16} color="#9fe870" weight="fill" />
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
                  <div key={i} style={{ background: "#090909", border: "1px solid #2e2e2e", borderRadius: 16, padding: 17, display: "flex", gap: 16, alignItems: "flex-start" }}>
                    {/* Left: info + button */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 12, flexShrink: 0 }}>
                      <div style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: "flex-start", justifyContent: "center" }}>
                        {/* Title + name block */}
                        <div style={{ height: 46, display: "flex", flexDirection: "column", gap: 4, alignItems: "flex-start" }}>
                          <p style={{ margin: 0, fontFamily: "var(--font-display)", fontWeight: 900, fontSize: 20, lineHeight: "24px", color: "#fff", whiteSpace: "nowrap" }}>{title}</p>
                          <p style={{ margin: 0, fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16, lineHeight: "18px", color: "#f9a8d4", whiteSpace: "nowrap" }}>{p.texto}</p>
                        </div>
                        {/* Stats */}
                        <div style={{ height: 21, display: "flex", flexDirection: "column", alignItems: "flex-start", paddingTop: 4 }}>
                          <p style={{ margin: 0, fontFamily: "var(--font-display)", fontWeight: 500, fontSize: 0, lineHeight: 0, color: "#9fe870" }}>
                            <span style={{ fontSize: 11, lineHeight: "16.5px" }}>Votado {qtd}x · </span>
                            <span style={{ fontSize: 11, lineHeight: "16.5px", color: "#838383" }}>{dateStr}</span>
                          </p>
                        </div>
                      </div>
                      {/* Ver mais */}
                      <button onClick={() => setSharePersonagem(i)} style={{
                        display: "inline-flex", alignItems: "center", gap: 4, alignSelf: "flex-start",
                        background: "#2a2a2a", border: "1px solid #3a3a3a",
                        borderRadius: 9999, padding: "7px 13px", cursor: "pointer",
                      }}>
                        <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 12, lineHeight: "18px", color: "#fff", whiteSpace: "nowrap" }}>Ver mais</span>
                        <CaretRight size={12} color="#fff" weight="bold" />
                      </button>
                    </div>

                    {/* Right: mascot — fills remaining height */}
                    <div style={{ flex: 1, minWidth: 0, display: "flex", alignItems: "center", justifyContent: "flex-end", alignSelf: "stretch" }}>
                      <div style={{ position: "relative", height: "100%", aspectRatio: "1/1", overflow: "clip", flexShrink: 0 }}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img alt={title} src={mascot} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", pointerEvents: "none" }} />
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
              <div style={{ display: "flex", flex: 1, alignItems: "center", gap: 4 }}>
                <Medal size={16} color="#9fe870" weight="fill" />
                <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 16, lineHeight: "20px", color: "#fff", whiteSpace: "nowrap" }}>MEDALHAS</span>
              </div>
              <Link href="/ranking" style={{
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
              <span style={{ fontSize: 18, lineHeight: "27px", flexShrink: 0 }}>🏅</span>
              <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 4 }}>
                <p style={{ margin: 0, whiteSpace: "nowrap" }}>
                  <span style={{ fontFamily: "var(--font-display)", fontWeight: 900, fontSize: 18, lineHeight: "20px", color: "#fff" }}>{conquistas.length} </span>
                  <span style={{ fontFamily: "var(--font-display)", fontWeight: 500, fontSize: 16, lineHeight: "20px", color: "#555" }}>de 15 jogadores</span>
                </p>
                <p style={{ margin: 0, fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 14, lineHeight: "18px", color: "#555", whiteSpace: "nowrap" }}>já conquistaram uma medalha</p>
              </div>
            </div>

            {/* Achievement cards */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {conquistas.map((c, i) => {
                const medalSvg = getMedalha(c.traitNome);
                return (
                  <div key={i} style={{ background: "#090909", border: "1px solid #2e2e2e", borderRadius: 16, padding: "9px 17px" }}>
                    <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                      {/* Text */}
                      <div style={{ display: "flex", flexDirection: "column", gap: 2, flex: 1, minWidth: 0 }}>
                        {/* Label row — h:24, text positioned at top:5 */}
                        <div style={{ height: 24, position: "relative" }}>
                          <p style={{ margin: 0, position: "absolute", top: 5, left: 0, fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 10, lineHeight: "15px", color: "#a1a1a1", letterSpacing: "0.5px", whiteSpace: "nowrap" }}>
                            HOJE · NOVA MEDALHA
                          </p>
                        </div>
                        {/* Name paragraph */}
                        <p style={{ margin: 0, fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 16, lineHeight: "20px", color: "#fff" }}>
                          <span style={{ color: "#9fe870" }}>{c.apelido}</span>
                          {" destravou "}
                          {`"${c.traitNome}!"`}
                        </p>
                        {/* Description */}
                        <div style={{ height: 21, display: "flex", flexDirection: "column", alignItems: "flex-start", paddingTop: 2 }}>
                          <p style={{ margin: 0, fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 12, lineHeight: "16px", color: "#555" }}>
                            {c.traitEmoji ? `${c.traitEmoji} ` : ""}{c.traitNome}
                          </p>
                        </div>
                      </div>

                      {/* Medal badge: SVG fills 72x72 absolutely, no dark bg */}
                      {medalSvg ? (
                        <div style={{ width: 72, height: 72, flexShrink: 0, position: "relative", overflow: "clip" }}>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            alt={c.traitNome}
                            src={medalSvg}
                            style={{ position: "absolute", display: "block", inset: 0, width: "100%", height: "100%", maxWidth: "none" }}
                          />
                        </div>
                      ) : (
                        <div style={{ width: 72, height: 72, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <span style={{ fontSize: 40, lineHeight: 1 }}>{c.traitEmoji ?? "🏅"}</span>
                        </div>
                      )}
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
          <button style={{ width: 56, height: 56, display: "flex", alignItems: "center", justifyContent: "center", padding: "16px 4px", background: "none", border: "none", cursor: "pointer", overflow: "clip" }}>
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
      <div style={{
        position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)",
        width: "min(100%, 430px)", zIndex: 30,
        padding: "0 8px",
        paddingBottom: "max(6px, env(safe-area-inset-bottom, 6px))",
      }}>
        <nav style={{
          background: "rgba(0,0,0,0.08)", border: "1px solid #393939",
          borderRadius: 32, padding: "6px 15px",
          display: "flex", alignItems: "center",
          backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
          boxShadow: "0px 4px 4.7px 1px rgba(0,0,0,0.28)",
          overflow: "clip",
        }}>
          <div style={{ display: "flex", flex: 1, alignItems: "center", justifyContent: "space-between" }}>
            <NavItem icon={<House size={28} color="#000" weight="fill" />}    label="Home"    active />
            <NavItem icon={<CheckCircle size={28} color="#fff" weight="regular" />} label="Votos"   href="/votacao" />
            <NavItem icon={<Football size={28} color="#fff" weight="regular" />}    label="Pelada"  href="/feed" />
            <NavItem icon={<ChartBar size={28} color="#fff" weight="regular" />}    label="Ranking" href="/ranking" />
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
          qtd={Math.max(5, 8 - sharePersonagem)}
        />
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

function NavItem({ icon, label, active, href }: { icon: React.ReactNode; label: string; active?: boolean; href?: string }) {
  const inner = (
    <div style={{
      width: 56, height: 56,
      borderRadius: active ? 100 : undefined,
      background: active ? "#9fe870" : undefined,
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      padding: 8, overflow: "clip",
    }}>
      <div style={{ width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center" }}>{icon}</div>
      <span style={{
        fontFamily: "var(--font-display)", fontWeight: active ? 800 : 600,
        fontSize: 10, lineHeight: "14px",
        color: active ? "#000" : "#fff",
        textAlign: "center", letterSpacing: "-0.2px", whiteSpace: "nowrap",
        display: "block", width: "100%",
      }}>{label}</span>
    </div>
  );
  if (href) return <Link href={href} style={{ textDecoration: "none" }}>{inner}</Link>;
  return <button style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}>{inner}</button>;
}
