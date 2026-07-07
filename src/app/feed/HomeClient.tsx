"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import {
  Lightning, Medal, CaretRight, Check,
  CalendarBlank, Alarm, CalendarStar,
  Bell, MedalMilitary, Export, PencilSimpleLine,
} from "@phosphor-icons/react";
import { BottomNav } from "@/components/layout/BottomNav";
import { HamburgerIcon } from "@/components/HamburgerIcon";
import { SegmentedControl, SectionHeader, Stat } from "@/ds";
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
const SelecaoShareModal = dynamic(
  () => import("@/components/SelecaoShareModal").then(m => m.SelecaoShareModal),
  { ssr: false }
);

import { TRAIT_BADGE } from "@/lib/badgeAssets";
import { PlayerSlot, PlayerNamed, TSHIRT_OUTLINE, TSHIRT_GK_OUT, TSHIRT_FILLED, TSHIRT_GK_FILL } from "./CampoPlayers";

const CAMPO   = "/campo.jpg";
const ESTADIO = "/estadio.jpg";
const LOGO    = "/logo.png";

type MaisVotado = { apelido: string; qtd: number; categoria: string };
type Personagem  = { tipo: string; apelido: string; texto: string; data: Date };
type Conquista   = { apelido: string; traitSlug: string; traitNome: string; traitEmoji: string | null; traitDesc: string | null; data: Date };

type ProximoBaba = { dataFormatada: string; hora: string; diasRestantes: number };

interface Props {
  rodadaId: string | null;
  top5Rodada: string[];
  dataRodada: string | null;
  dataCurta: string | null;
  horarioJogo: string;
  votacao: { fase: "antes" | "aberta" | "encerrada"; aberta: boolean; texto: string } | null;
  jaVotou: boolean;
  maisVotados: MaisVotado[];
  personagensPorRodada: Personagem[][];
  personagensSemana: PersonagemSemana[];
  selecao: (PersonagemSemana | null)[];
  selecaoPiores: (PersonagemSemana | null)[];
  conquistas: Conquista[];
  badgesGrupo: { comBadge: number; total: number };
  datePills: string[];
  grupoNome: string;
  proximoBaba: ProximoBaba | null;
  criarRodadaAction: () => Promise<void>;
  isSuperAdmin: boolean;
}

const MEDAL_COLORS = ["#F59E0B", "#9CA3AF", "#B45309"];

export function HomeClient({
  rodadaId, dataRodada, dataCurta, horarioJogo, votacao, jaVotou, top5Rodada,
  maisVotados, personagensPorRodada, personagensSemana, selecao, selecaoPiores, conquistas, badgesGrupo, datePills, grupoNome,
  proximoBaba, criarRodadaAction, isSuperAdmin,
}: Props) {
  const [bsOpen, setBsOpen] = useState(false);
  const [bsMounted, setBsMounted] = useState(false); // só monta o sheet após 1ª abertura
  const [shareCard, setShareCard] = useState<PersonagemSemana | null>(null);
  const [mostrarTodosPersonagens, setMostrarTodosPersonagens] = useState(false);
  const [shareSelecao, setShareSelecao] = useState(false);
  const [campoTab, setCampoTab] = useState<"melhores" | "piores">("melhores");

  // Campinho: conjunto ativo conforme a aba
  const campoSel = campoTab === "melhores" ? selecao : selecaoPiores;
  // Janela de votação: parcial ao vivo na fase aberta, oficial após encerrar (15h); botão só ativo na janela aberta
  const mostrarResultados = votacao ? votacao.fase !== "antes" : false;
  const podeVotar = votacao?.fase === "aberta" && !jaVotou;

  // Auto-refresh da parcial enquanto a votação está aberta
  const router = useRouter();
  useEffect(() => {
    if (votacao?.fase !== "aberta") return;
    const id = setInterval(() => router.refresh(), 30000);
    return () => clearInterval(id);
  }, [votacao?.fase, router]);
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

      {/* ── 1. SEÇÃO VOTAÇÃO (fundo estádio) ── */}
      <div style={{
        position: "relative",
        paddingTop: "calc(env(safe-area-inset-top, 0px) + 100px)",
        paddingBottom: 20,
        paddingLeft: 16,
        paddingRight: 16,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 8,
        width: "100%",
        boxSizing: "border-box",
        overflow: "clip",
        border: "1px solid #666",
        borderTop: "none",
        borderBottomLeftRadius: 48,
        borderBottomRightRadius: 48,
      }}>
        {/* Fundo: estádio (enquadramento do Figma) + overlay escuro */}
        <div aria-hidden style={{ position: "absolute", inset: 0, overflow: "hidden", borderBottomLeftRadius: 48, borderBottomRightRadius: 48, opacity: 0.76, pointerEvents: "none" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={ESTADIO} alt="" style={{ position: "absolute", height: "151.86%", width: "155.59%", left: "-26.58%", top: "-13.45%", maxWidth: "none", objectFit: "cover" }} />
        </div>
        <div aria-hidden style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.45)", borderBottomLeftRadius: 48, borderBottomRightRadius: 48, pointerEvents: "none" }} />

        {/* Título — editar votos (só dono do grupo) alinhado no canto direito */}
        <div style={{ position: "relative", width: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <p style={{ margin: 0, fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 18, lineHeight: "20px", color: "#fff", textAlign: "center" }}>
            Votação da rodada
          </p>
          {rodadaId && isSuperAdmin && (
            <Link href="/votacao/admin" aria-label="Editar votos da rodada" style={{
              position: "absolute", right: 0, top: "50%", transform: "translateY(-50%)",
              width: 36, height: 36, borderRadius: 12, flexShrink: 0,
              background: "#0d0d0d", border: "1px solid #090909",
              display: "flex", alignItems: "center", justifyContent: "center", WebkitTapHighlightColor: "transparent",
            }}>
              <PencilSimpleLine size={17} color="#fff" weight="bold" />
            </Link>
          )}
        </div>

        {/* Tabs: Os melhores / Os piores — pill com indicador deslizante */}
        <div style={{ position: "relative", width: "100%" }}>
          <SegmentedControl
            fullWidth
            value={campoTab}
            onChange={(v) => setCampoTab(v as "melhores" | "piores")}
            items={[{ value: "melhores", label: "Os melhores" }, { value: "piores", label: "Os piores" }]}
          />
        </div>

        {/* Wrapper do campo (sem card branco) */}
        <div style={{
          position: "relative",
          padding: "8px 16px",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          boxSizing: "border-box",
        }}>
          {/* Campo */}
          <div style={{
            border: "1px solid #777575",
            borderRadius: 36,
            padding: "16px 24px",
            display: "flex",
            flexDirection: "column",
            gap: 16,
            alignItems: "center",
            position: "relative",
            width: "100%",
            boxSizing: "border-box",
            overflow: "clip",
          }}>
            {/* Background field image */}
            <Image aria-hidden alt="" src={CAMPO} fill sizes="400px" style={{ objectFit: "cover", pointerEvents: "none", borderRadius: 36 }} />
            <div aria-hidden style={{ position: "absolute", inset: 0, background: "rgba(58,87,0,0.25)", borderRadius: 36, pointerEvents: "none" }} />

            {/* Header info: título + data/hora + status */}
            <div style={{ position: "relative", display: "flex", flexDirection: "column", gap: 4, alignItems: "center", width: "100%" }}>
              {/* Row: data/hora à esquerda */}
              {dataRodada && (
                <div style={{ display: "flex", width: "100%" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 4, alignItems: "flex-start", flexShrink: 0 }}>
                    <div style={{ background: "#1c1c1c", display: "flex", alignItems: "center", gap: 4, padding: "4px 8px", borderRadius: 48, overflow: "clip" }}>
                      <CalendarBlank size={16} color="#9fe870" weight="bold" />
                      <span style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 12, lineHeight: "16px", color: "#9fe870", whiteSpace: "nowrap" }}>{dataRodada}</span>
                    </div>
                    <div style={{ background: "#1c1c1c", display: "flex", alignItems: "center", gap: 4, padding: "4px 8px", borderRadius: 48, overflow: "clip" }}>
                      <Alarm size={16} color="#fff" weight="bold" />
                      <span style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 12, lineHeight: "16px", color: "#fff", whiteSpace: "nowrap" }}>{horarioJogo}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Status pill — centralizada */}
              <div style={{
                display: "inline-flex", alignSelf: "center",
                alignItems: "center", gap: 6,
                background: "rgba(55,55,55,0.2)",
                border: "1px solid rgba(255,255,255,0.15)",
                borderRadius: 100, padding: "4px 6px",
              }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: votacao?.aberta ? "#9fe870" : "#e56767", flexShrink: 0 }} />
                <span style={{ fontFamily: "var(--font-display)", fontWeight: 500, fontSize: 12, lineHeight: "16px", color: "#fff", letterSpacing: "-0.4px", whiteSpace: "nowrap" }}>
                  {votacao ? votacao.texto : "Nenhuma rodada aberta"}
                </span>
              </div>
            </div>

            {/* Players formation */}
            <div style={{ position: "relative", display: "flex", flexDirection: "column", gap: 16, alignItems: "center", width: "100%" }}>
              {/* CF row */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", width: 292, paddingTop: 8, paddingBottom: 8 }}>
                {mostrarResultados
                  ? <PlayerNamed p={campoSel[0]} tshirt={TSHIRT_FILLED} onShare={setShareCard} />
                  : <PlayerSlot tshirt={TSHIRT_OUTLINE} href={podeVotar ? "/votacao" : undefined} />}
              </div>

              {/* Meio campo: 3 slots */}
              <div style={{ display: "flex", gap: 62, alignItems: "center", justifyContent: "center", width: "100%" }}>
                {mostrarResultados ? (
                  <>
                    <PlayerNamed p={campoSel[1]} tshirt={TSHIRT_FILLED} onShare={setShareCard} />
                    <PlayerNamed p={campoSel[2]} tshirt={TSHIRT_FILLED} onShare={setShareCard} />
                    <PlayerNamed p={campoSel[3]} tshirt={TSHIRT_FILLED} onShare={setShareCard} />
                  </>
                ) : (
                  <>
                    <PlayerSlot tshirt={TSHIRT_OUTLINE} href={podeVotar ? "/votacao" : undefined} />
                    <PlayerSlot tshirt={TSHIRT_OUTLINE} href={podeVotar ? "/votacao" : undefined} />
                    <PlayerSlot tshirt={TSHIRT_OUTLINE} href={podeVotar ? "/votacao" : undefined} />
                  </>
                )}
              </div>

              {/* GK row (só faz sentido GK nos "melhores" = Paredão) */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", width: 292, paddingTop: 8, paddingBottom: 8 }}>
                {mostrarResultados
                  ? <PlayerNamed p={campoSel[4]} tshirt={campoTab === "melhores" ? TSHIRT_GK_FILL : TSHIRT_FILLED} onShare={setShareCard} />
                  : <PlayerSlot tshirt={TSHIRT_GK_OUT} href={podeVotar ? "/votacao" : undefined} />}
              </div>
            </div>

            {/* CTA */}
            <div style={{ position: "relative", width: "100%" }}>
              {!rodadaId ? (
                /* Criar rodada */
                <form action={criarRodadaAction}>
                  <button type="submit" style={{
                    width: "100%", background: "#0d0d0d", border: "1px solid #090909",
                    borderRadius: 14, padding: "13px 16px",
                    fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 18, color: "#9fe870",
                    cursor: "pointer", letterSpacing: "-0.8px",
                  }}>⚽ BABA ROLOU HOJE</button>
                </form>
              ) : (votacao?.fase === "encerrada" || jaVotou) ? (
                /* Resultados — botão compartilhar separado, alinhado à faixa (Figma 529-155) */
                <div style={{ display: "flex", gap: 8, alignItems: "stretch", width: "100%" }}>
                  <button onClick={() => setShareSelecao(true)} aria-label="Compartilhar seleção" style={{
                    flexShrink: 0, width: 56, borderRadius: 16, cursor: "pointer",
                    background: "#0d0d0d", border: "1px solid #090909",
                    boxShadow: "0px 4px 9.8px 2px rgba(0,0,0,0.25)",
                    display: "flex", alignItems: "center", justifyContent: "center", WebkitTapHighlightColor: "transparent",
                  }}>
                    <Export size={22} color="#fff" weight="bold" />
                  </button>
                  <Link href="/votacao" style={{
                    flex: 1, minWidth: 0, textDecoration: "none",
                    backdropFilter: "blur(4.9px)", WebkitBackdropFilter: "blur(4.9px)",
                    background: "rgba(13,13,13,0.25)", borderRadius: 16, padding: "12px 16px",
                    display: "flex", alignItems: "center", gap: 8,
                  }}>
                    <span style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 16, lineHeight: "20px", color: "#fff", letterSpacing: "-0.5px", flex: 1 }}>
                      {votacao?.fase === "aberta" ? "Compartilhe a parcial!" : "Confira a seleção!"}
                    </span>
                    <img src="/check-circle-green.svg" alt="" style={{ width: 24, height: 24, flexShrink: 0 }} />
                  </Link>
                </div>
              ) : podeVotar ? (
                /* Votar agora (janela aberta) */
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
                /* Antes de abrir (22:30) — botão desativado */
                <div aria-disabled style={{
                  display: "flex",
                  background: "#0d0d0d",
                  border: "1px solid #26262b",
                  borderRadius: 14, padding: "8px 16px",
                  overflow: "clip", opacity: 0.85, cursor: "not-allowed",
                }}>
                  <div style={{ display: "flex", gap: 8, height: 52, alignItems: "center", paddingTop: 8, paddingBottom: 8, borderRadius: 12, width: "100%" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: 2, flex: 1, minWidth: 0 }}>
                      <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 18, lineHeight: "22px", color: "#7a7a7a", letterSpacing: "-0.4px" }}>Votar agora!</span>
                      <span style={{ fontFamily: "var(--font-display)", fontWeight: 500, fontSize: 12, lineHeight: "16px", color: "#7a7a7a" }}>{votacao?.texto ?? "Votação abre às 22:30"}</span>
                    </div>
                    <div style={{ background: "#26262b", borderRadius: 12, width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, padding: 4, overflow: "clip" }}>
                      <CaretRight size={20} weight="bold" color="#7a7a7a" />
                    </div>
                  </div>
                </div>
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

        {/* ── 3. PERSONAGEM DA SEMANA ── */}
        {personagensSemana.length > 0 && (
          <div style={{ background: "#171717", border: "1px solid #2c2c2c", borderRadius: 20, padding: "17px 9px", display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Header */}
            <SectionHeader icon={<CalendarStar size={24} color="#9fe870" weight="regular" />} title="PERSONAGEM DA SEMANA" />

            {/* Date pills */}
            {datePills.length > 0 && (
              <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 2 }}>
                {datePills.map((d, i) => {
                  const ativo = i === datePills.length - 1;
                  return (
                    <div key={i} style={{
                      flexShrink: 0, borderRadius: 9999, padding: "9px 13px",
                      background: ativo ? "#9fe870" : "#0a0e0e",
                      border: ativo ? "1px solid #9fe870" : "1px solid #2c2c2c",
                    }}>
                      <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 12, lineHeight: "16px", color: ativo ? "#090909" : "#666", whiteSpace: "nowrap", textTransform: "capitalize" }}>{d}</span>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Cards */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {(mostrarTodosPersonagens ? personagensSemana : personagensSemana.slice(0, 3)).map((p) => (
                <div key={p.slug} style={{ background: "#090909", border: "1px solid #2c2c2c", borderRadius: 16, padding: 17, display: "flex", gap: 16, alignItems: "flex-start" }}>
                  {/* Award container */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 12, alignItems: "flex-start", flexShrink: 0 }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "flex-start" }}>
                      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                        <p style={{ margin: 0, fontFamily: "var(--font-display)", fontWeight: 900, fontSize: 20, lineHeight: "24px", color: "#fff", whiteSpace: "nowrap", textTransform: "uppercase" }}>{p.nome}</p>
                        <p style={{ margin: 0, fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16, lineHeight: "20px", color: "#f9a8d4" }}>{p.vencedor}</p>
                      </div>
                      <p style={{ margin: 0, fontFamily: "var(--font-display)", fontWeight: 500, fontSize: 11, lineHeight: "16.5px", color: "#9fe870" }}>
                        Votado {p.votos}x{dataCurta ? <span style={{ color: "#838383" }}> · {dataCurta}</span> : null}
                      </p>
                    </div>
                    <button onClick={() => setShareCard(p)} style={{
                      cursor: "pointer", WebkitTapHighlightColor: "transparent",
                      background: "#2c2c2c", border: "1px solid #424242", borderRadius: 9999, padding: "9px 13px",
                      display: "flex", alignItems: "center", gap: 4,
                    }}>
                      <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 12, lineHeight: "16px", color: "#fff" }}>Ver mais</span>
                      <CaretRight size={12} color="#fff" weight="bold" />
                    </button>
                  </div>
                  {/* Mascote */}
                  <div style={{ flex: 1, minWidth: 0, display: "flex", justifyContent: "flex-end", alignItems: "center" }}>
                    <div style={{ width: 117, height: 117, position: "relative", flexShrink: 0 }}>
                      <Image alt={p.nome} src={`/votacao-mascot/${p.slug}.png`} fill sizes="117px" style={{ objectFit: "contain" }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {personagensSemana.length > 3 && (
              <button
                onClick={() => setMostrarTodosPersonagens((v) => !v)}
                style={{
                  alignSelf: "center", cursor: "pointer", WebkitTapHighlightColor: "transparent",
                  background: "none", border: "none",
                  display: "flex", alignItems: "center", gap: 4,
                  fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 13, color: "#9fe870",
                }}
              >
                {mostrarTodosPersonagens ? "Ver menos" : `Ver mais (${personagensSemana.length - 3})`}
                <CaretRight size={12} weight="bold" style={{ transform: mostrarTodosPersonagens ? "rotate(-90deg)" : "rotate(90deg)", transition: "transform 150ms ease" }} />
              </button>
            )}
          </div>
        )}

        {/* ── 4. MEDALHAS ── */}
        {badgesGrupo.total > 0 && (
          <div style={{ background: "#171717", border: "1px solid #2e2e2e", borderRadius: 20, padding: "17px 9px", display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Header */}
            <SectionHeader
              icon={<Medal size={24} color="#9fe870" weight="regular" />}
              title="BADGES"
              trailing={
                <Link href="/medalhas" style={{
                  display: "flex", alignItems: "center", gap: 4, textDecoration: "none", flexShrink: 0,
                  background: "#2c2c2c", border: "1px solid #424242",
                  borderRadius: 9999, padding: "9px 13px",
                }}>
                  <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 12, lineHeight: "16px", color: "#fff", whiteSpace: "nowrap" }}>Ver mais</span>
                  <CaretRight size={12} color="#fff" weight="bold" />
                </Link>
              }
            />

            {/* Stats bar */}
            <div style={{ background: "#242424", border: "1px solid #424242", borderRadius: 12, padding: "9px 13px" }}>
              <Stat
                direction="inline"
                icon={<span style={{ fontFamily: "var(--font-body)", fontSize: 18, lineHeight: "27px", letterSpacing: "-0.44px" }}>🏅</span>}
                value={<>{badgesGrupo.comBadge}/<span style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 16, lineHeight: "1.4", color: "#7a7a7a" }}>{badgesGrupo.total} jogadores</span></>}
                label="já conquistaram uma medalha"
              />
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
            <HamburgerIcon open={menuOpen} />
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

      {/* Compartilhar a escalação inteira (parcial ou fechada) */}
      {shareSelecao && (
        <SelecaoShareModal
          selecao={campoSel}
          grupoNome={grupoNome}
          dataRodada={dataRodada}
          horarioJogo={horarioJogo}
          parcial={votacao?.fase === "aberta"}
          gkVermelho={campoTab === "melhores"}
          onClose={() => setShareSelecao(false)}
        />
      )}

      {/* ── Menu Hambúrguer (bottom sheet compartilhado) ── */}
      {menuOpen && <MenuSheet open onClose={() => setMenuOpen(false)} />}
    </div>
  );
}



