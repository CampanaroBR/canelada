"use client";

import { useState, useTransition, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { submitVotos } from "./actions";
// TRAIT_SVG removido — usamos ilustrações de personagens PNG no hero
import { CaretLeft, CaretRight, MagnifyingGlass, CheckCircle } from "@phosphor-icons/react";

type Jogador = { id: string; apelido: string };
type Trait = { slug: string; nome: string; categoria: string; emoji: string | null; descricao: string | null };

interface Props {
  rodadaId: string;
  meuId: string;
  jogadores: Jogador[];
  traits: Trait[];
}

// Ordem oficial do PRD "Sistema de Traits do Canelada":
// Etapa 1 (Futebol) → Etapa 2 (Personalidade) → Etapa 3 (Resenha).
const ORDERED_SLUGS = [
  "categoria", "matador", "paredao", "racudo", "xerife", "garcom",
  "resenha-forte", "chorao", "reclamao", "paneleiro",
  "firuleiro", "corpo-mole", "cone", "bagre",
];

// Backgrounds reais do Figma — PNGs baixados de localhost:3845/assets/
const BG_IMAGES: Record<string, string> = {
  categoria:       "/votacao-bg/categoria.png",
  matador:         "/votacao-bg/matador.png",
  paredao:         "/votacao-bg/paredao.png",
  racudo:          "/votacao-bg/racudo.png",
  xerife:          "/votacao-bg/xerife.png",
  garcom:          "/votacao-bg/garcom.png",
  "resenha-forte": "/votacao-bg/resenha-forte.png",
  chorao:          "/votacao-bg/chorao.png",
  reclamao:        "/votacao-bg/reclamao.png",
  paneleiro:       "/votacao-bg/paneleiro.png",
  firuleiro:       "/votacao-bg/firuleiro.png",
  "corpo-mole":    "/votacao-bg/corpo-mole.png",
  cone:            "/votacao-bg/cone.png",
  bagre:           "/votacao-bg/bagre.png",
};

// Cores do glow atrás do mascote — extraídas do Figma
const GLOW_COLORS: Record<string, string> = {
  categoria:       "#5f450f",
  matador:         "#0f375f",
  paredao:         "#761010",
  racudo:          "#392f2f",
  xerife:          "#431406",
  garcom:          "#1f1132",
  "resenha-forte": "#7c1c4d",
  chorao:          "#1a4259",
  reclamao:        "#0c2648",
  paneleiro:       "#043b11",
  firuleiro:       "#594f19",
  "corpo-mole":    "#3c2b17",
  cone:            "#632d10",
  bagre:           "#0e394f",
};

// Mascotes: PNGs do Figma em /public/votacao-mascot/
const MASCOTE: Record<string, string> = {
  categoria:       "/votacao-mascot/categoria.png",
  matador:         "/votacao-mascot/matador.png",
  paredao:         "/votacao-mascot/paredao.png",
  racudo:          "/votacao-mascot/racudo.png",
  xerife:          "/votacao-mascot/xerife.png",
  garcom:          "/votacao-mascot/garcom.png",
  "resenha-forte": "/votacao-mascot/resenha-forte.png",
  chorao:          "/votacao-mascot/chorao.png",
  reclamao:        "/votacao-mascot/reclamao.png",
  paneleiro:       "/votacao-mascot/paneleiro.png",
  firuleiro:       "/votacao-mascot/firuleiro.png",
  "corpo-mole":    "/votacao-mascot/corpo-mole.png",
  cone:            "/votacao-mascot/cone.png",
  bagre:           "/votacao-mascot/bagre.png",
};


function getInitial(apelido: string) {
  return apelido.trim()[0]?.toUpperCase() ?? "?";
}

function getAvatarColor(apelido: string) {
  const colors = ["#B5FF4D", "#60A5FA", "#F59E0B", "#EF4444", "#A78BFA", "#34D399", "#F97316", "#EC4899"];
  let h = 0;
  for (const c of apelido) h = (h * 31 + c.charCodeAt(0)) & 0xffff;
  return colors[h % colors.length];
}

export function VotacaoFlow({ rodadaId, meuId, jogadores, traits }: Props) {
  const steps = ORDERED_SLUGS
    .map((slug) => traits.find((t) => t.slug === slug))
    .filter((t): t is Trait => !!t);

  const [step, setStep] = useState(0);
  const [selections, setSelections] = useState<Record<number, string>>({});
  const [pending, setPending] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [done, setDone] = useState(false);
  const [, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const searchRef = useRef<HTMLInputElement>(null);

  const outros = jogadores.filter((j) => j.id !== meuId);
  const trait = steps[step];
  const bgImage = BG_IMAGES[trait?.slug ?? ""] ?? "";
  const glowColor = GLOW_COLORS[trait?.slug ?? ""] ?? "#333";
  const mascot = MASCOTE[trait?.slug ?? ""] ?? "/ilustracoes/gato.png";
  const filtered = outros.filter((j) => j.apelido.toLowerCase().includes(search.toLowerCase()));
  const pendingPlayer = pending ? jogadores.find((j) => j.id === pending) ?? null : null;
  const total = steps.length;
  const progressPct = total > 0 ? (step / total) * 100 : 0;

  useEffect(() => {
    if (done) {
      const t = setTimeout(() => router.push("/feed"), 3000);
      return () => clearTimeout(t);
    }
  }, [done, router]);

  function handleSelect(id: string) {
    setPending((prev) => (prev === id ? null : id));
  }

  function handleConfirm() {
    if (!pending) return;
    const newSelections = { ...selections, [step]: pending };
    setSelections(newSelections);
    setPending(null);
    setSearch("");
    if (step < total - 1) {
      setStep((s) => s + 1);
    } else {
      submitAllWith(newSelections);
    }
  }

  function handleBack() {
    if (pending) { setPending(null); return; }
    if (step === 0) router.push("/feed");
    else { setStep((s) => s - 1); setSearch(""); }
  }

  function submitAllWith(sels: Record<number, string>) {
    const votos = steps
      .map((t, i) => ({ categoria: "TRAIT" as const, traitSlug: t.slug, votadoId: sels[i] as string | undefined }))
      .filter((v): v is { categoria: "TRAIT"; traitSlug: string; votadoId: string } => v.votadoId !== undefined);

    if (votos.length === 0) { setDone(true); return; }

    startTransition(async () => {
      const result = await submitVotos(rodadaId, votos);
      if ("error" in result) setError(result.error ?? "Erro desconhecido.");
      else setDone(true);
    });
  }

  if (done) return <DoneScreen router={router} />;
  if (!trait) return null;

  return (
    <div style={{
      position: "fixed", top: 0, bottom: 0, left: "50%", transform: "translateX(-50%)",
      width: "min(100%, 430px)",
      background: "#090909", display: "flex", flexDirection: "column", overflow: "hidden",
    }}>
      {/* ── Status Bar (glass, fixo) ── */}
      {/* pointerEvents:none no wrapper + auto só no botão: permite que o swipe-scroll
          atravesse a área do topbar sem ficar "travando" o gesto (mobile UX) */}
      <div className="glass-bar" style={{
        position: "absolute", top: 0, left: 0, right: 0, zIndex: 20,
        pointerEvents: "none",
        paddingTop: "calc(env(safe-area-inset-top, 0px) + 26px)",
        padding: "calc(env(safe-area-inset-top, 0px) + 26px) 16px 16px",
        willChange: "transform",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button
            onClick={handleBack}
            style={{
              width: 48, height: 48, borderRadius: 24, flexShrink: 0,
              background: "rgba(0,0,0,0.4)", border: "1px solid #424242",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer",
              pointerEvents: "auto",
            }}
          >
            <CaretLeft size={16} color="#fff" weight="bold" />
          </button>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ margin: 0, fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 12, color: "#fff" }}>
              VOTAÇÃO
            </p>
            <p style={{ margin: 0, fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 18, color: "#fff" }}>
              {step + 1} de {total} personagens
            </p>
          </div>
          <div style={{ width: 48, flexShrink: 0 }} />
        </div>
        <div style={{ paddingTop: 12 }}>
          <div style={{ height: 6, borderRadius: 9999, background: "#ccc", overflow: "hidden" }}>
            <div style={{
              height: 6, borderRadius: 9999, background: "#9fe870",
              width: `${progressPct}%`, transition: "width 280ms ease",
            }} />
          </div>
        </div>
      </div>

      <div style={{
        flex: 1, overflowY: "auto", display: "flex", flexDirection: "column",
        WebkitOverflowScrolling: "touch",
        overscrollBehavior: "contain",
        willChange: "scroll-position",
      }}>
        {/* ── Hero — estrutura exata do Figma ── */}
        <div
          key={trait.slug}
          style={{
            position: "relative", flexShrink: 0, overflow: "hidden",
            height: 547,
            paddingTop: 140, paddingBottom: 94,
            display: "flex", flexDirection: "column", alignItems: "center",
            borderBottomLeftRadius: 48, borderBottomRightRadius: 48,
            background: "#090909",
          }}
        >
          {/* Background PNG real do Figma — object-cover full-bleed */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            aria-hidden
            src={bgImage}
            alt=""
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", pointerEvents: "none" }}
          />

          <div style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center", width: "100%" }}>
            {/* Character container — 289×296, mb -20 (overlap com título) */}
            <div style={{ position: "relative", width: 289, height: 296, marginBottom: -20, flexShrink: 0 }}>

              {/* Glow: 301×308, blur(104px), top:calc(50%+6px) — igual ao Figma */}
              <div aria-hidden style={{
                position: "absolute",
                left: "50%", top: "calc(50% + 6px)",
                transform: "translate(-50%, -50%)",
                width: 301, height: 308, borderRadius: "50%",
                background: glowColor, filter: "blur(104px)",
              }} />

              {/* Mascote: 264×264, top:18px, overflow:hidden */}
              <div style={{
                position: "absolute", left: "50%", top: 18,
                transform: "translateX(-50%)",
                width: 264, height: 264, overflow: "hidden",
              }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={mascot}
                  alt={trait.nome}
                  style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "contain" }}
                />
              </div>

              {/* Pill: top:-8px, centrado */}
              <div style={{
                position: "absolute", top: -8, left: "50%", transform: "translateX(-50%)",
                background: "rgba(55,55,55,0.2)", border: "1px solid rgba(255,255,255,0.15)",
                borderRadius: 100, padding: "4px 10px", whiteSpace: "nowrap",
                display: "flex", alignItems: "center", gap: 10,
              }}>
                <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 12, color: "#fff", letterSpacing: "-0.4px" }}>
                  VOTAÇÃO DO BABA · {step + 1}/{total}
                </span>
              </div>
            </div>

            {/* Título + descrição */}
            <div style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: "center", width: "100%", maxWidth: 361 }}>
              <p style={{ margin: 0, fontFamily: "var(--font-display)", fontWeight: 900, fontSize: 32, lineHeight: "36px", color: "#fff", textAlign: "center" }}>
                {trait.nome.toUpperCase()} {trait.emoji}
              </p>
              <p style={{
                margin: 0, paddingTop: 4, paddingLeft: 24, paddingRight: 24,
                fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 18, lineHeight: "22px",
                color: "rgba(255,255,255,0.92)", letterSpacing: "-0.8px", textAlign: "center",
              }}>
                {trait.descricao ?? `Quem foi o ${trait.nome} dessa rodada?`}
              </p>
            </div>
          </div>
        </div>

        {/* ── Card escuro ── */}
        <div style={{
          background: "#171717", borderTopLeftRadius: 48, borderTopRightRadius: 48,
          boxShadow: "0px 4px 4px 0px rgba(0,0,0,0.25)",
          padding: "24px 8px 96px", display: "flex", flexDirection: "column", gap: 16,
          flex: 1,
        }}>
          <p style={{
            margin: 0, paddingLeft: 8,
            fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 18,
            color: "#fff", letterSpacing: "1.04px",
          }}>
            QUEM FOI O {trait.nome.toUpperCase()}?
          </p>

          <div style={{ padding: "0 8px" }}>
            <div style={{
              display: "flex", alignItems: "center", gap: 8,
              background: searchFocused ? "#111" : "#141414",
              border: searchFocused ? "2px solid #9fe870" : "1px solid #2a2a2d",
              borderRadius: 14, padding: searchFocused ? "12px 15px" : "13px 16px",
            }}>
              <MagnifyingGlass size={20} color="#fff" weight="regular" />
              <input
                ref={searchRef}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                placeholder="Buscar jogador…"
                style={{
                  flex: 1, background: "transparent", border: "none", outline: "none",
                  fontFamily: "var(--font-body)", fontWeight: 500, fontSize: 14,
                  color: "#fff", caretColor: "#9fe870",
                }}
              />
            </div>
          </div>

          <div style={{ padding: "0 8px" }}>
            {filtered.length === 0 ? (
              <p style={{ color: "#555", fontFamily: "var(--font-body)", fontSize: 13, textAlign: "center", padding: "20px 0" }}>
                Nenhum jogador encontrado
              </p>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
                {filtered.map((j) => {
                  const isSelected = selections[step] === j.id;
                  const isPendingThis = pending === j.id;
                  const highlight = isSelected || isPendingThis;
                  const initial = getInitial(j.apelido);
                  const color = getAvatarColor(j.apelido);

                  return (
                    <button
                      key={j.id}
                      onClick={() => handleSelect(j.id)}
                      style={{
                        appearance: "none", cursor: "pointer",
                        background: "#000",
                        border: highlight ? "2px solid #9fe870" : "1px solid #2e2e2e",
                        borderRadius: 12, padding: "13px 8px",
                        display: "flex", flexDirection: "column",
                        alignItems: "center", gap: 4,
                      }}
                    >
                      <div style={{
                        width: 48, height: 48, borderRadius: "50%",
                        background: highlight ? color + "33" : "#2a2a2a",
                        border: highlight ? `1px solid ${color}` : "none",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        flexShrink: 0,
                      }}>
                        <span style={{
                          fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 18,
                          color: highlight ? color : "#fff",
                        }}>{initial}</span>
                      </div>
                      <span style={{
                        fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 11,
                        color: "#ccc", textAlign: "center", lineHeight: "13.75px",
                        maxWidth: "100%", overflow: "hidden",
                        textOverflow: "ellipsis", whiteSpace: "nowrap" as const,
                      }}>
                        {j.apelido}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Confirm pill flutuante (estilo navbar) ── */}
      {pending && pendingPlayer && (
        <div style={{
          position: "absolute", left: 8, right: 8,
          bottom: `calc(env(safe-area-inset-bottom, 0px) + 8px)`,
          zIndex: 25,
          background: "rgba(15,14,12,0.9)", border: "1px solid #393939",
          borderRadius: 32, padding: "6px 16px",
          display: "flex", alignItems: "center", gap: 8,
          boxShadow: "0px 4px 4.7px 1px rgba(0,0,0,0.28)",
        }}>
          <div style={{ display: "flex", flex: 1, alignItems: "center", gap: 6, minWidth: 0 }}>
            <div style={{ position: "relative", width: 56, height: 56, flexShrink: 0 }}>
              <div style={{
                width: 56, height: 56, borderRadius: "50%",
                background: "#1998ad",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 18, color: "#fff" }}>
                  {getInitial(pendingPlayer.apelido)}
                </span>
              </div>
              <div style={{ position: "absolute", left: 35, top: 32, width: 24, height: 24, background: "#171717", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <CheckCircle size={22} color="#9fe870" weight="fill" />
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 2, flex: 1, minWidth: 0 }}>
              <p style={{
                margin: 0, fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 12,
                color: "#ccc", letterSpacing: "1.2px",
              }}>
                SEU VOTO · {trait.nome.toUpperCase()}
              </p>
              <p style={{
                margin: 0, fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 20,
                color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" as const,
              }}>
                {pendingPlayer.apelido.toUpperCase()}
              </p>
            </div>
          </div>

          <button
            onClick={handleConfirm}
            style={{
              flexShrink: 0, height: 48, borderRadius: 9999,
              background: "#9fe870", border: "1px solid #3a3a3a",
              padding: "0 16px", display: "flex", alignItems: "center", gap: 2,
              cursor: "pointer",
            }}
          >
            <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16, color: "#090909" }}>
              Confirmar
            </span>
            <CaretRight size={16} color="#090909" weight="bold" />
          </button>
        </div>
      )}

      {error && (
        <div style={{
          position: "absolute", bottom: 90, left: 16, right: 16, zIndex: 50,
          background: "#2a0a0a", border: "1px solid #ef4444",
          borderRadius: 12, padding: "12px 16px",
        }}>
          <p style={{ margin: 0, color: "#ef4444", fontFamily: "var(--font-body)", fontSize: 13, textAlign: "center" }}>
            {error}
          </p>
        </div>
      )}
    </div>
  );
}

function DoneScreen({ router }: { router: ReturnType<typeof useRouter> }) {
  return (
    <div style={{
      position: "fixed", top: 0, bottom: 0, left: "50%", transform: "translateX(-50%)",
      width: "min(100%, 430px)",
      background: "#0a0e0e",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      overflow: "hidden",
    }}>
      {/* Background decorativo */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        aria-hidden
        src="/success-bg.png"
        alt=""
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", pointerEvents: "none" }}
      />

      {/* CheckCircle 124px */}
      <div style={{
        position: "relative",
        width: 124, height: 124,
        borderRadius: "50%",
        background: "#7ed44e",
        flexShrink: 0,
        display: "flex", alignItems: "center", justifyContent: "center",
        overflow: "hidden",
      }}>
        <CheckCircle size={104} color="#fff" weight="fill" style={{ position: "absolute", top: 10, left: 10 }} />
      </div>

      {/* Spacer 56px */}
      <div style={{ height: 56, flexShrink: 0 }} />

      {/* Main content */}
      <div style={{
        position: "relative",
        width: 313,
        display: "flex", flexDirection: "column", alignItems: "center", gap: 58,
      }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 32, width: "100%" }}>
          <p style={{
            margin: 0,
            width: 300,
            fontFamily: "var(--font-display)", fontWeight: 700,
            fontSize: 56, lineHeight: "64px",
            color: "#fff", textAlign: "center", letterSpacing: "-2px",
          }}>
            É isso!
          </p>
          <p style={{
            margin: 0,
            fontFamily: "var(--font-body)", fontWeight: 600,
            fontSize: 24, lineHeight: "32px",
            color: "#fff", textAlign: "center", letterSpacing: "-1px",
          }}>
            Votação enviada! Agora é aguardar a resenha! 😂
          </p>
        </div>

        <button
          onClick={() => router.push("/feed")}
          style={{
            background: "#9fe870",
            border: "none",
            borderRadius: 9999,
            padding: "12px 24px",
            fontFamily: "var(--font-display)", fontWeight: 700,
            fontSize: 16, lineHeight: "20px",
            color: "#090909",
            cursor: "pointer",
            whiteSpace: "nowrap",
          }}
        >
          Ir para Home
        </button>
      </div>
    </div>
  );
}
