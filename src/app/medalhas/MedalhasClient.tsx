"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { BottomNav } from "@/components/layout/BottomNav";
import { MenuSheet } from "@/components/MenuSheet";
import { HamburgerIcon } from "@/components/HamburgerIcon";
import { Lock, CheckCircle, Medal2, Bell, Export } from "reicon-react";
import { SegmentedControl, BottomSheet } from "@/ds";

function loadImg(src: string): Promise<HTMLImageElement> {
  return new Promise((res, rej) => {
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.onload = () => res(img);
    img.onerror = rej;
    img.src = src;
  });
}

/** Gera um card de compartilhamento em alta resolução (1080×1350) com a badge ampliada. */
async function buildBadgeShare(nome: string, svg: string, tagline: string): Promise<Blob> {
  const W = 1080, H = 1350;
  const canvas = document.createElement("canvas");
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext("2d")!;

  // fundo + glow verde
  ctx.fillStyle = "#0a0e0e"; ctx.fillRect(0, 0, W, H);
  const g = ctx.createRadialGradient(W / 2, 430, 60, W / 2, 430, 760);
  g.addColorStop(0, "rgba(159,232,112,0.20)"); g.addColorStop(1, "rgba(159,232,112,0)");
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);

  try { await (document as Document & { fonts?: FontFaceSet }).fonts?.ready; } catch { /* */ }

  ctx.textAlign = "center";
  ctx.fillStyle = "#9fe870";
  ctx.font = "800 36px Barlow, sans-serif";
  ctx.fillText("DESBLOQUEEI", W / 2, 220);

  // badge ampliada (suavizada)
  ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = "high";
  try {
    const img = await loadImg(svg);
    const bs = 600;
    ctx.drawImage(img, (W - bs) / 2, 300, bs, bs);
  } catch { /* sem imagem */ }

  // nome (ajusta fonte se largo)
  ctx.fillStyle = "#ffffff";
  let size = 88;
  const upper = nome.toUpperCase();
  do { ctx.font = `900 ${size}px Barlow, sans-serif`; if (ctx.measureText(upper).width <= W - 120) break; size -= 6; } while (size > 40);
  ctx.fillText(upper, W / 2, 1010);

  if (tagline) {
    ctx.fillStyle = "#9fe870";
    ctx.font = "700 38px Inter, sans-serif";
    ctx.fillText(tagline, W / 2, 1075);
  }

  ctx.fillStyle = "#5a5a5a";
  ctx.font = "800 30px Barlow, sans-serif";
  ctx.fillText("CANELADA", W / 2, 1290);

  return new Promise((res, rej) => canvas.toBlob(b => (b ? res(b) : rej(new Error("toBlob failed"))), "image/png"));
}

async function shareBadge(slug: string, nome: string, svg: string, tagline = "") {
  const texto = `Desbloqueei a badge "${nome}" no Canelada! ⚽`;
  try {
    const blob = await buildBadgeShare(nome, svg, tagline);
    const file = new File([blob], `${slug}.png`, { type: "image/png" });
    if (navigator.canShare?.({ files: [file] })) {
      await navigator.share({ files: [file], text: texto });
    } else if (navigator.share) {
      await navigator.share({ text: texto });
    } else {
      const url = URL.createObjectURL(blob);
      Object.assign(document.createElement("a"), { href: url, download: `${slug}.png` }).click();
      URL.revokeObjectURL(url);
    }
  } catch (e) {
    if ((e as Error)?.name !== "AbortError") console.error(e);
  }
}

const BADGE_CATALOG = [
  {
    id: "presenca",
    title: "PRESENÇA",
    badges: [
      { slug: "primeiro-baba",  nome: "Primeira Pelada", descricao: "Participou da primeira rodada registrada no Canelada.", svg: "/conquistas/primeiro-baba.png", tagline: "PRIMEIRA DE MUITAS!", rara: false },
      { slug: "veterano",       nome: "Veterano",         descricao: "Participou de 10 rodadas.",                                                                    svg: "/conquistas/veterano.png",       tagline: "10 PARTIDAS, QUE RAÇA!",       rara: false },
      { slug: "casca-grossa",   nome: "Casca Grossa",     descricao: "Participou de 25 rodadas.",                                                                    svg: "/conquistas/casca-grossa.png",   tagline: "25 PARTIDAS CONCLUÍDAS!",      rara: false },
      { slug: "mais-presente",  nome: "Mais Presente",    descricao: "Participou de 100% das rodadas de um mês.",                                                    svg: "/conquistas/mais-presente.png",  tagline: "100% DE PRESENÇA!",            rara: false },
      { slug: "alma-do-grupo",  nome: "Alma do Grupo",    descricao: "Participou de ao menos 80% das rodadas em 3 meses consecutivos.",                              svg: "/conquistas/alma-do-grupo.png",  tagline: "PILAR DO GRUPO!",              rara: false },
      { slug: "hall-da-fama",   nome: "Hall da Fama",     descricao: "Participou de 50 rodadas.",                                                                    svg: "/conquistas/hall-da-fama.png",   tagline: "50 PARTIDAS, LENDÁRIO!",       rara: true  },
      { slug: "lenda-do-baba",  nome: "Lenda do Baba",    descricao: "Participou de 100 rodadas e tem pelo menos 5 MVPs.",                                           svg: "/conquistas/lenda-do-baba.png",  tagline: "O LENDÃO DO BABA!",            rara: true  },
    ],
  },
  {
    id: "performance",
    title: "PERFORMANCE",
    badges: [
      { slug: "mvp",              nome: "MVP",              descricao: "Recebeu MVP pela primeira vez.",                 svg: "/conquistas/mvp.png",              tagline: "PRIMEIRO MVP!",              rara: false },
      { slug: "rei-absoluto",     nome: "Rei Absoluto",     descricao: "Recebeu 5 MVPs acumulados.",                    svg: "/conquistas/rei-absoluto.png",     tagline: "5 MVPs, É REI!",             rara: false },
      { slug: "craque-da-galera", nome: "Craque da Galera", descricao: "Recebeu 10 MVPs acumulados.",                   svg: "/conquistas/craque-da-galera.png", tagline: "10 MVPs E CRESCENDO!",       rara: true  },
      { slug: "rei-do-mes",       nome: "Rei do Mês",       descricao: "Jogador com mais MVPs durante um mês.",         svg: "/conquistas/rei-do-mes.png",       tagline: "MELHOR DO MÊS!",             rara: false },
      { slug: "craque-historico", nome: "Craque Histórico", descricao: "Recebeu 20 MVPs acumulados.",                   svg: "/conquistas/craque-historico.png", tagline: "20 MVPs, CRAQUE HISTÓRICO!", rara: true  },
    ],
  },
  {
    id: "sequencias",
    title: "SEQUÊNCIAS",
    badges: [
      { slug: "em-chamas",       nome: "Em Chamas",       descricao: "Recebeu destaque positivo em 3 rodadas consecutivas.",                                svg: "/conquistas/em-chamas.png",       tagline: "3 DESTAQUES SEGUIDOS!",  rara: false },
      { slug: "imparavel",       nome: "Imparável",        descricao: "Recebeu destaque positivo em 5 rodadas consecutivas.",                                svg: "/conquistas/imparavel.png",       tagline: "5 SEGUIDOS, IMPARÁVEL!", rara: true  },
      { slug: "invicto",         nome: "Invicto",          descricao: "Sem traits negativas por 5 rodadas consecutivas.",                                    svg: "/conquistas/invicto.png",         tagline: "LIMPO POR 5 RODADAS!",   rara: true  },
      { slug: "virada-de-chave", nome: "Virada de Chave",  descricao: "Recebeu trait negativa e conquistou destaque positivo na rodada seguinte.",           svg: "/conquistas/virada-de-chave.png", tagline: "QUE REVIRAVOLTA!",       rara: false },
      { slug: "consistente",     nome: "Consistente",      descricao: "Participou de 8 rodadas consecutivas.",                                              svg: "/conquistas/consistente.png",     tagline: "8 RODADAS SEGUIDAS!",    rara: false },
    ],
  },
  {
    id: "reconhecimento",
    title: "RECONHECIMENTO",
    badges: [
      { slug: "operario",          nome: "Operário",          descricao: "Recebeu a trait Raçudo 5 vezes.",                    svg: "/conquistas/operario.png",          tagline: "RAÇUDO ATÉ A ALMA!",    rara: false },
      { slug: "racudo-do-mes",     nome: "Raçudo do Mês",     descricao: "Recebeu mais votos para Raçudo durante um mês.",     svg: "/conquistas/racudo-do-mes.png",     tagline: "RAÇUDO DO MÊS!",        rara: false },
      { slug: "resenha-forte",     nome: "Resenha Forte",     descricao: "Recebeu 20 traits sociais acumuladas.",              svg: "/conquistas/resenha-forte.png",     tagline: "20 DESTAQUES SOCIAIS!", rara: false },
      { slug: "querido-da-galera", nome: "Querido da Galera", descricao: "Recebeu 50 destaques positivos acumulados.",         svg: "/conquistas/querido-da-galera.png", tagline: "50 DESTAQUES, É AMADO!", rara: true  },
    ],
  },
  {
    id: "colecao",
    title: "COLEÇÃO",
    badges: [
      { slug: "colecionador",      nome: "Colecionador",      descricao: "Desbloqueou 8 badges.",              svg: "/conquistas/colecionador.png",      tagline: "8 BADGES DESBLOQUEADAS!", rara: false },
      { slug: "mestre-da-resenha", nome: "Mestre da Resenha", descricao: "Desbloqueou 16 badges.",             svg: "/conquistas/mestre-da-resenha.png", tagline: "16 BADGES, MESTRE!",      rara: true  },
      { slug: "completo",          nome: "Completo!",          descricao: "Desbloqueou todas as badges do jogo.", svg: "/conquistas/completo.png",         tagline: "TODAS AS BADGES! INCRÍVEL!", rara: true },
    ],
  },
] as const;

type BadgeEntry = typeof BADGE_CATALOG[number]["badges"][number];

const ALL_SLUGS = BADGE_CATALOG.flatMap(c => c.badges.map(b => b.slug));
const TOTAL = ALL_SLUGS.length;

// Raridade por badge (ver docs/gamificacao.md). cor = clara (cadeado/chip), borda = mais escura (tile)
type Tier = "comum" | "incomum" | "rara" | "epica";
const TIER_META: Record<Tier, { label: string; cor: string; borda: string }> = {
  comum:   { label: "Comum",   cor: "#cfcfcf", borda: "#2c2c2c" },
  incomum: { label: "Incomum", cor: "#5aa9e6", borda: "#3f6f99" },
  rara:    { label: "Rara",    cor: "#a978f0", borda: "#6f4f9e" },
  epica:   { label: "Épica",   cor: "#e2c485", borda: "#7a5c28" },
};
const RARITY: Record<string, Tier> = {
  // Comum (9)
  "primeiro-baba": "comum", "mvp": "comum", "virada-de-chave": "comum", "em-chamas": "comum",
  "veterano": "comum", "operario": "comum", "consistente": "comum", "rei-do-mes": "comum", "colecionador": "comum",
  // Incomum (6)
  "mais-presente": "incomum", "racudo-do-mes": "incomum", "rei-absoluto": "incomum",
  "resenha-forte": "incomum", "casca-grossa": "incomum", "imparavel": "incomum",
  // Rara (5)
  "alma-do-grupo": "rara", "invicto": "rara", "craque-da-galera": "rara",
  "hall-da-fama": "rara", "querido-da-galera": "rara",
  // Épica (4)
  "lenda-do-baba": "epica", "craque-historico": "epica", "mestre-da-resenha": "epica", "completo": "epica",
};
const tierOf = (slug: string): Tier => RARITY[slug] ?? "comum";

// slug → categoria (em title case p/ o chip)
const BADGE_CATEGORY: Record<string, string> = Object.fromEntries(
  BADGE_CATALOG.flatMap(c => {
    const nome = c.title.charAt(0) + c.title.slice(1).toLowerCase();
    return c.badges.map(b => [b.slug, nome]);
  })
);

const BADGE_SVG: Record<string, string> = Object.fromEntries(
  BADGE_CATALOG.flatMap(c => c.badges.map(b => [b.slug, b.svg]))
);

type Filter = "todas" | "desbloqueadas" | "andamento";

interface Props {
  unlockedSlugs: string[];
  novos?: string[];
  progress?: Record<string, { current: number; meta: number }>;
}

export function MedalhasClient({ unlockedSlugs, novos = [], progress = {} }: Props) {
  const [filter, setFilter] = useState<Filter>("todas");
  const [selected, setSelected] = useState<BadgeEntry | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  // mantém a badge durante a animação de fechamento do sheet
  const [lastBadge, setLastBadge] = useState<BadgeEntry | null>(null);
  useEffect(() => { if (selected) setLastBadge(selected); }, [selected]);
  const sheetBadge = selected ?? lastBadge;
  const unlockedSet = new Set(unlockedSlugs);
  const novosSet = new Set(novos);
  const unlockedCount = ALL_SLUGS.filter(s => unlockedSet.has(s)).length;

  // % de progresso de uma badge bloqueada (capado em 0.95 p/ nunca parecer "completa porém travada")
  function pctFor(slug: string): number {
    if (unlockedSet.has(slug)) return 1;
    const p = progress[slug];
    if (!p || p.meta <= 0) return 0;
    return Math.min(p.current / p.meta, 0.95);
  }
  // "Em andamento" = bloqueada com algum progresso real
  const andamentoCount = ALL_SLUGS.filter(s => !unlockedSet.has(s) && pctFor(s) > 0).length;

  function shouldShow(slug: string): boolean {
    if (filter === "todas") return true;
    if (filter === "desbloqueadas") return unlockedSet.has(slug);
    if (filter === "andamento") return !unlockedSet.has(slug) && pctFor(slug) > 0;
    return true;
  }

  return (
    <div style={{ minHeight: "100dvh", background: "#090909" }}>

      {/* ── TOPBAR ── */}
      <div className="glass-bar" style={{
        position: "fixed", top: 0, left: "50%", transform: "translateX(-50%)",
        width: "min(100%, 430px)", zIndex: 30,
        paddingTop: "env(safe-area-inset-top, 0px)",
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "4px 8px" }}>
          <button onClick={() => setMenuOpen(true)} style={{ width: 56, height: 56, display: "flex", alignItems: "center", justifyContent: "center", background: "none", border: "none", cursor: "pointer" }}>
            <HamburgerIcon open={menuOpen} />
          </button>
          <div style={{ padding: 4, display: "flex", overflow: "clip" }}>
            <Image alt="Canelada" src="/logo.png" width={48} height={48} priority style={{ objectFit: "cover", borderRadius: "50%" }} />
          </div>
          <button style={{ width: 56, height: 56, display: "flex", alignItems: "center", justifyContent: "center", background: "none", border: "none", cursor: "pointer" }}>
            <Bell size={24} color="#fff" weight="Outline" />
          </button>
        </div>
      </div>

      {/* ── HEADER COMPACTO: painel com card "Suas Badges" X/Y + anel (Figma 564-4399) ── */}
      <div style={{
        background: "#0a0e0e",
        border: "1px solid #2c2c2c",
        borderRadius: "0 0 40px 40px",
        paddingTop: "calc(env(safe-area-inset-top, 0px) + 96px)",
        paddingBottom: 20,
        paddingLeft: 16,
        paddingRight: 16,
        boxSizing: "border-box",
        width: "100%",
      }}>
        <div style={{
          background: "#090909", border: "1px solid #2c2c2c", borderRadius: 20,
          padding: "13px 9px 13px 17px",
          display: "flex", alignItems: "center", gap: 16,
        }}>
          <div style={{ flex: "1 0 0", minWidth: 1, display: "flex", flexDirection: "column", gap: 6 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <Medal2 size={20} color="#9fe870" weight="Filled" />
              <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 18, lineHeight: "22px", color: "#fff", whiteSpace: "nowrap" }}>SUAS BADGES</span>
            </div>
            <p style={{ margin: 0, whiteSpace: "nowrap" }}>
              <span style={{ fontFamily: "var(--font-numeric)", fontWeight: 700, fontSize: 18, lineHeight: "22px", color: "#9fe870" }}>{unlockedCount}</span>
              <span style={{ fontFamily: "var(--font-numeric)", fontWeight: 500, fontSize: 16, lineHeight: "18px", color: "#7a7a7a" }}>/{TOTAL}</span>
            </p>
          </div>
          {/* Anel de progresso */}
          <div style={{ flexShrink: 0, width: 48, height: 48, position: "relative" }}>
            <svg width="48" height="48" viewBox="0 0 48 48" style={{ display: "block" }}>
              <circle cx="24" cy="24" r="20" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="4" />
              <circle
                cx="24" cy="24" r="20" fill="none"
                stroke="#9fe870" strokeWidth="4" strokeLinecap="round"
                strokeDasharray={`${(unlockedCount / TOTAL) * 125.66} 125.66`}
                transform="rotate(-90 24 24)"
              />
            </svg>
            <span style={{
              position: "absolute", inset: 0,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 11, color: "#fff",
            }}>
              {Math.round(unlockedCount / TOTAL * 100)}%
            </span>
          </div>
        </div>
      </div>

      {/* ── CONTEÚDO (encostado no header, formando um container único) ── */}
      <div style={{
        background: "transparent",
        paddingTop: 0,
        paddingLeft: 8,
        paddingRight: 8,
        paddingBottom: "calc(104px + env(safe-area-inset-bottom, 0px))",
        display: "flex",
        flexDirection: "column",
        gap: 16,
      }}>

        {/* Card externo (Figma 564-4398): bg #171717, topo arredondado 48 p/ unir ao header */}
        <div style={{
          background: "#171717",
          border: "1px solid #2c2c2c",
          borderRadius: "48px 48px 16px 16px",
          boxShadow: "0px 4px 4px rgba(0,0,0,0.25)",
          padding: "32px 9px 16px",
          display: "flex",
          flexDirection: "column",
          gap: 16,
        }}>
        {/* Section header */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, height: 42, paddingLeft: 8 }}>
          <div style={{
            background: "#171717",
            border: "1px solid #2c2c2c",
            borderRadius: 12,
            padding: 8,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}>
            <Medal2 size={24} color="#9fe870" weight="Outline" />
          </div>
          <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 16, lineHeight: "20px", color: "#fff", whiteSpace: "nowrap" }}>
            BADGES
          </span>
        </div>

        {/* Filter tabs */}
        <div style={{ overflowX: "auto" }}>
          <SegmentedControl
            value={filter}
            onChange={(v) => setFilter(v as Filter)}
            items={[
              { value: "todas", label: `Todas (${TOTAL})` },
              { value: "desbloqueadas", label: `Desbloqueadas (${unlockedCount})` },
              { value: "andamento", label: `Em andamento (${andamentoCount})` },
            ]}
          />
        </div>

        {/* Container interno (Figma): bg #090909, rounded 20, com as categorias */}
        <div style={{
          background: "#090909",
          border: "1px solid #2c2c2c",
          borderRadius: 20,
          padding: "16px 8px 8px",
          display: "flex",
          flexDirection: "column",
          gap: 24,
        }}>
          {BADGE_CATALOG.map(cat => {
            const visible = cat.badges.filter(b => shouldShow(b.slug));
            if (visible.length === 0) return null;
            const catUnlocked = cat.badges.filter(b => unlockedSet.has(b.slug)).length;

            return (
              <div key={cat.id} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {/* Category header */}
                <div style={{ paddingLeft: 8, display: "flex", flexDirection: "column", gap: 0 }}>
                  <p style={{ margin: 0, fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 16, lineHeight: "20px", color: "#fff", whiteSpace: "nowrap" }}>
                    {cat.title}
                  </p>
                  <div style={{ display: "flex", gap: 6, alignItems: "baseline", whiteSpace: "nowrap" }}>
                    {/* número + /N inline, sem gap entre eles */}
                    <span style={{ fontFamily: "var(--font-numeric)", lineHeight: 0 }}>
                      <span style={{ fontWeight: 700, fontSize: 18, lineHeight: "22px", color: catUnlocked > 0 ? "#9fe870" : "#fff" }}>{catUnlocked}</span>
                      <span style={{ fontWeight: 500, fontSize: 16, lineHeight: "18px", color: "#fff" }}>/{cat.badges.length}</span>
                    </span>
                    <span style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 16, lineHeight: "20px", color: "#999" }}>
                      Badges conquistadas
                    </span>
                  </div>
                </div>

                {/* Grid de badges — 3 colunas iguais (uniforme, sem fillers) */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
                  {visible.map(badge => {
                        const unlocked = unlockedSet.has(badge.slug);
                        const epica = tierOf(badge.slug) === "epica";
                        const temBarra = !unlocked && badge.slug !== "primeiro-baba" && !!progress[badge.slug];
                        return (
                          <div
                            key={badge.slug}
                            onClick={() => setSelected(badge)}
                            style={{
                              position: "relative",
                              // Destravada ganha preenchimento (card elevado); bloqueada fica "vazia"
                              background: unlocked ? "#1a1a1a" : "#0a0e0e",
                              border: `1px solid ${unlocked ? "#3a3a3a" : "#2c2c2c"}`,
                              boxShadow: unlocked ? "inset 0 1px 0 rgba(255,255,255,0.05)" : "none",
                              borderRadius: 12,
                              boxSizing: "border-box",
                              height: 118,
                              padding: "20px 8px 8px",
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "center",
                              justifyContent: "flex-start",
                              gap: 3,
                              cursor: "pointer",
                              WebkitTapHighlightColor: "transparent",
                            }}
                          >
                            {/* Tag NOVO (conquista recente) ou cadeado (bloqueada) — selo no canto, sem encostar na medalha */}
                            {unlocked
                              ? (novosSet.has(badge.slug) && (
                                  <div style={{ position: "absolute", top: 6, right: 6, background: "#9fe870", borderRadius: 5, padding: "0px 5px", display: "flex", alignItems: "center", zIndex: 2 }}>
                                    <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 9, lineHeight: "15px", letterSpacing: "0.2px", color: "#0a1a06" }}>NOVO</span>
                                  </div>
                                ))
                              : (
                                <div style={{ position: "absolute", top: 7, right: 7, zIndex: 2 }}>
                                  <Lock size={13} color={epica ? "#e2c485" : "#fff"} weight="Filled" />
                                </div>
                              )}

                            {/* Badge image */}
                            <div style={{ width: 54, height: 54, flexShrink: 0, position: "relative" }}>
                              <Image
                                alt={badge.nome}
                                src={badge.svg}
                                fill
                                sizes="54px"
                                style={{ objectFit: "contain", filter: unlocked ? "none" : "brightness(0.5)" }}
                              />
                            </div>

                            {/* Nome — raridade fica só no modal de detalhe */}
                            <p style={{
                              margin: 0,
                              fontFamily: "var(--font-display)",
                              fontWeight: 800,
                              fontSize: 12,
                              lineHeight: "14px",
                              color: unlocked ? "#fff" : "#7a7a7a",
                              textAlign: "center",
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              maxWidth: "100%",
                            }}>
                              {badge.nome}
                            </p>

                            {/* Barra de progresso (parte do conteúdo centralizado) */}
                            {temBarra && (
                              <div style={{ height: 6, width: 64, background: "rgba(120,120,120,0.2)", borderRadius: 100, overflow: "hidden", flexShrink: 0 }}>
                                <div style={{ height: "100%", width: `${Math.round(pctFor(badge.slug) * 100)}%`, background: "#9fe870", borderRadius: 100 }} />
                              </div>
                            )}
                          </div>
                        );
                      })}
                </div>
              </div>
            );
          })}
        </div>
        </div>
      </div>

      {/* ── BADGE BOTTOM SHEET ── */}
      {sheetBadge && (() => {
        const b = sheetBadge;
        const unlocked = unlockedSet.has(b.slug);
        const isRara = tierOf(b.slug) === "epica";

        // Glow dourado nas épicas (senão usa o shadow padrão do shell)
        const sheetShadow = isRara
          ? "0px 0px 64px 6px rgba(226,196,133,0.55), 0px -10px 40px 2px rgba(226,196,133,0.45)"
          : undefined;

        // Título e subtítulo em muted quando bloqueado (incl. épica)
        const nameColor = unlocked ? "#fff" : "#8b8b93";
        const descColor = unlocked ? "#b0b0b6" : "#7a7a7a";

        return (
          <BottomSheet open={!!selected} onClose={() => setSelected(null)} bg="#171717" boxShadow={sheetShadow}>
              {/* Content */}
              <div style={{
                display: "flex", flexDirection: "column", gap: 24,
                alignItems: "center", padding: "0 16px",
              }}>

                {/* Badge info block */}
                <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "center", width: "100%" }}>

                  {/* Status pill */}
                  <div style={{
                    background: "#0a0e0e",
                    border: "1px solid #2e2e2e",
                    borderRadius: 9999,
                    padding: "5px 13px",
                    display: "inline-flex", alignItems: "center", gap: 8,
                    flexShrink: 0,
                  }}>
                    {unlocked
                      ? <CheckCircle size={18} color="#9fe870" weight="Filled" />
                      : <Lock size={18} color="#fff" weight="Filled" />
                    }
                    <span style={{
                      fontFamily: "var(--font-display)", fontWeight: 700,
                      fontSize: 12, lineHeight: "18px",
                      color: unlocked ? "#9fe870" : "#fff",
                      whiteSpace: "nowrap",
                    }}>
                      {unlocked ? "DESBLOQUEADA" : "BLOQUEADO"}
                    </span>
                  </div>

                  {/* Badge image 140×140 */}
                  <div style={{ width: 140, height: 140, flexShrink: 0, marginBottom: isRara && !unlocked ? -8 : 0, position: "relative" }}>
                    <Image
                      src={b.svg}
                      alt={b.nome}
                      fill
                      sizes="140px"
                      style={{ objectFit: "contain", opacity: unlocked ? 1 : 0.65 }}
                    />
                  </div>

                  {/* Text block */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: "flex-start", width: "100%" }}>
                    {/* Tagline (unlocked only) */}
                    {unlocked && (
                      <p style={{
                        margin: 0,
                        fontFamily: "var(--font-display)", fontWeight: 700,
                        fontSize: 12, lineHeight: "16px",
                        color: "#8b8b93", letterSpacing: "1.4px",
                        textAlign: "center", width: "100%",
                      }}>
                        {b.tagline}
                      </p>
                    )}

                    <div style={{ display: "flex", flexDirection: "column", gap: 4, alignItems: "center", width: "100%" }}>
                      <p style={{
                        margin: 0,
                        fontFamily: "var(--font-display)", fontWeight: 900,
                        fontSize: 28, lineHeight: "32px",
                        color: nameColor, textAlign: "center", width: "100%",
                      }}>
                        {b.nome}
                      </p>
                      <p style={{
                        margin: 0,
                        fontFamily: "var(--font-body)", fontWeight: 500,
                        fontSize: 16, lineHeight: "20px",
                        color: descColor, textAlign: "center", width: "100%",
                      }}>
                        {b.descricao}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Chips: Categoria + Raridade */}
                <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap", width: "100%" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, background: "#0a0e0e", border: "1px solid #2c2c2c", borderRadius: 9999, padding: "6px 12px" }}>
                    <span style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 12, lineHeight: "16px", color: "#9b9b9b" }}>Categoria</span>
                    <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 12, lineHeight: "16px", color: "#fff" }}>{BADGE_CATEGORY[b.slug] ?? "—"}</span>
                  </div>
                  {(() => {
                    const m = TIER_META[tierOf(b.slug)];
                    return (
                      <div style={{ display: "flex", alignItems: "center", gap: 6, background: "#0a0e0e", border: `1px solid ${m.borda}`, borderRadius: 9999, padding: "6px 12px" }}>
                        <span style={{ width: 6, height: 6, borderRadius: "50%", background: m.cor, flexShrink: 0 }} />
                        <span style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 12, lineHeight: "16px", color: "#9b9b9b" }}>Raridade</span>
                        <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 12, lineHeight: "16px", color: m.cor }}>{m.label}</span>
                      </div>
                    );
                  })()}
                </div>

                {/* Status box — locked only */}
                {!unlocked && (() => {
                  const p = progress[b.slug];
                  const cur = p ? Math.min(p.current, p.meta) : 0;
                  const pct = p && p.meta > 0 ? Math.min(p.current / p.meta, 1) : 0;
                  return (
                    <div style={{
                      background: "#0a0e0e",
                      border: "1px solid #232327",
                      borderRadius: 18,
                      padding: "11px 16px",
                      display: "flex", flexDirection: "column", gap: 12,
                      width: "100%", boxSizing: "border-box",
                    }}>
                      {p ? (
                        <div style={{ display: "flex", flexDirection: "column", gap: 8, width: "100%" }}>
                          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
                            <p style={{ margin: 0, fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16, lineHeight: "20px", color: "#fff" }}>Em andamento</p>
                            <p style={{ margin: 0, fontFamily: "var(--font-numeric)", fontWeight: 700, fontSize: 16, lineHeight: "20px" }}>
                              <span style={{ color: "#9fe870" }}>{cur}</span>
                              <span style={{ color: "#7a7a7a" }}>/{p.meta}</span>
                            </p>
                          </div>
                          <div style={{ height: 8, background: "#26262b", borderRadius: 99, overflow: "hidden", width: "100%" }}>
                            <div style={{ height: "100%", width: `${Math.round(pct * 100)}%`, background: "#9fe870", borderRadius: 99 }} />
                          </div>
                        </div>
                      ) : (
                        <p style={{ margin: 0, fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16, lineHeight: "20px", color: "#fff" }}>
                          Como desbloquear
                        </p>
                      )}
                      <p style={{ margin: 0, fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 12, color: "#999" }}>
                        {b.descricao}
                      </p>
                    </div>
                  );
                })()}

                {/* Ações: compartilhar (desbloqueada) + fechar */}
                <div style={{ display: "flex", gap: 8, width: "100%" }}>
                  {unlocked && (
                    <button
                      onClick={() => shareBadge(b.slug, b.nome, b.svg, b.tagline)}
                      aria-label="Compartilhar badge"
                      style={{
                        flexShrink: 0, width: 73, height: 54, borderRadius: 16,
                        background: "#7ed44e", border: "none", cursor: "pointer",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        WebkitTapHighlightColor: "transparent",
                      }}
                    >
                      <Export size={24} color="#090909" weight="Outline" />
                    </button>
                  )}
                  <button
                    onClick={() => setSelected(null)}
                    style={{
                      flex: 1, minWidth: 0, height: 54,
                      background: "#0a0e0e",
                      border: "1px solid #424242",
                      borderRadius: 16,
                      fontFamily: "var(--font-display)", fontWeight: 700,
                      fontSize: 16, lineHeight: "20px",
                      color: "#fff",
                      cursor: "pointer", textAlign: "center",
                      WebkitTapHighlightColor: "transparent",
                      boxSizing: "border-box",
                    }}
                  >
                    Fechar
                  </button>
                </div>
              </div>
          </BottomSheet>
        );
      })()}

      <BottomNav />

      {/* ── Menu Hambúrguer ── */}
      <MenuSheet open={menuOpen} onClose={() => setMenuOpen(false)} />
    </div>
  );
}
