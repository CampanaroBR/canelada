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

// Gradientes temáticos por trait (256deg, claro nas pontas — mesma receita do Figma)
const GRADIENTS: Record<string, [string, string]> = {
  categoria:       ["rgb(121,89,14)",  "rgb(229,186,102)"],
  matador:         ["rgb(10,90,80)",   "rgb(70,200,180)"],
  paredao:         ["rgb(15,50,90)",   "rgb(70,140,210)"],
  racudo:          ["rgb(120,40,10)",  "rgb(224,120,60)"],
  xerife:          ["rgb(90,60,15)",   "rgb(200,150,70)"],
  garcom:          ["rgb(90,40,90)",   "rgb(200,120,200)"],
  "resenha-forte": ["rgb(120,20,80)",  "rgb(230,90,170)"],
  chorao:          ["rgb(20,55,90)",   "rgb(90,150,210)"],
  reclamao:        ["rgb(110,15,15)",  "rgb(220,70,70)"],
  paneleiro:       ["rgb(110,55,10)",  "rgb(230,140,40)"],
  firuleiro:       ["rgb(70,20,110)",  "rgb(170,90,230)"],
  "corpo-mole":    ["rgb(35,55,80)",   "rgb(110,140,170)"],
  cone:            ["rgb(90,55,10)",   "rgb(200,130,30)"],
  bagre:           ["rgb(10,40,90)",   "rgb(60,120,210)"],
};

// Mascotes: ilustrações PNG por trait (animais personagens do Figma)
const MASCOTE: Record<string, string> = {
  categoria:       "/ilustracoes/gato.png",
  matador:         "/ilustracoes/tubarao.png",
  paredao:         "/ilustracoes/rinoceronte.png",
  racudo:          "/ilustracoes/touro.png",
  xerife:          "/ilustracoes/bulldog.png",
  garcom:          "/ilustracoes/polvo.png",
  "resenha-forte": "/ilustracoes/peixe-mic.png",
  chorao:          "/ilustracoes/foca.png",
  reclamao:        "/ilustracoes/bode.png",
  paneleiro:       "/ilustracoes/porco.png",
  firuleiro:       "/ilustracoes/flamingo.png",
  "corpo-mole":    "/ilustracoes/corpo-mole.png",
  cone:            "/ilustracoes/cone.png",
  bagre:           "/ilustracoes/bagre.png",
};

// Rotação de matiz aplicada na imagem de fundo (base = dourado/categoria) pra
// recolorir o mesmo asset por trait, sem precisar de 14 imagens diferentes.
const HUE_ROTATE: Record<string, number> = {
  categoria: 0,
  matador: 160,
  paredao: 190,
  racudo: -25,
  xerife: 20,
  garcom: 260,
  "resenha-forte": 280,
  chorao: 200,
  reclamao: -35,
  paneleiro: 10,
  firuleiro: 250,
  "corpo-mole": 180,
  cone: 15,
  bagre: 200,
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
  const [c1] = GRADIENTS[trait?.slug ?? ""] ?? ["rgb(60,60,65)", "rgb(150,150,155)"];
  const hueRotate = HUE_ROTATE[trait?.slug ?? ""] ?? 0;
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

  if (done) return <DoneScreen total={total} />;
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
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, zIndex: 20,
        pointerEvents: "none",
        paddingTop: "calc(env(safe-area-inset-top, 0px) + 26px)",
        padding: "calc(env(safe-area-inset-top, 0px) + 26px) 16px 16px",
        background: "rgba(15,14,10,0.55)",
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
        boxShadow: "inset 0 -1px 0 rgba(255,255,255,0.08)",
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
        {/* ── Hero (imagem de fundo real, recolorida por trait) ── */}
        <div
          key={trait.slug}
          style={{
            position: "relative", flexShrink: 0, overflow: "hidden",
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
            gap: 8, paddingTop: 128, paddingBottom: 24, paddingLeft: 16, paddingRight: 16,
            borderBottomLeftRadius: 48, borderBottomRightRadius: 48,
            background: c1,
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            aria-hidden
            src="/ilustracoes/votacao-hero-bg.png"
            alt=""
            style={{
              position: "absolute", inset: 0,
              width: "100%", height: "100%", objectFit: "cover",
              filter: `hue-rotate(${hueRotate}deg) saturate(1.05)`,
            }}
          />

          <div style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center", width: "100%" }}>
            <div style={{
              background: "rgba(55,55,55,0.2)", border: "1px solid rgba(255,255,255,0.15)",
              borderRadius: 100, padding: "4px 10px", whiteSpace: "nowrap",
              marginBottom: 20,
            }}>
              <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 12, color: "#fff", letterSpacing: "-0.4px" }}>
                VOTAÇÃO DO BABA · {step + 1}/{total}
              </span>
            </div>

            <div style={{ position: "relative", width: 220, height: 220, marginBottom: 8 }}>
              <div aria-hidden style={{
                position: "absolute", inset: 0, margin: "auto",
                width: 230, height: 230, borderRadius: "50%",
                background: "rgba(95,69,15,0.5)", filter: "blur(60px)",
              }} />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={mascot}
                alt={trait.nome}
                style={{ position: "relative", width: "100%", height: "100%", objectFit: "contain" }}
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 0, width: "100%", maxWidth: 361 }}>
              <p style={{ margin: 0, fontFamily: "var(--font-display)", fontWeight: 900, fontSize: 32, lineHeight: "36px", color: "#fff", textAlign: "center" }}>
                {trait.nome.toUpperCase()} {trait.emoji}
              </p>
              <p style={{
                margin: 0, paddingTop: 0, paddingLeft: 24, paddingRight: 24,
                fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 18, lineHeight: "22px",
                color: "rgba(255,255,255,0.92)", letterSpacing: "-0.4px", textAlign: "center",
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

function DoneScreen({ total }: { total: number }) {
  return (
    <div style={{
      position: "fixed", top: 0, bottom: 0, left: "50%", transform: "translateX(-50%)",
      width: "min(100%, 430px)",
      background: "#9fe870",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      textAlign: "center", gap: 20, padding: "32px 24px",
    }}>
      <div aria-hidden style={{
        position: "absolute", inset: 0,
        backgroundImage: "repeating-linear-gradient(90deg, transparent 0px, transparent 46px, rgba(0,0,0,0.07) 46px, rgba(0,0,0,0.07) 48px)",
      }} />
      <h1 style={{
        fontFamily: "var(--font-display)", fontWeight: 900,
        fontSize: "clamp(64px, 18vw, 88px)", lineHeight: 0.86,
        letterSpacing: "-0.02em", textTransform: "uppercase" as const,
        color: "#0d0d0d", position: "relative", margin: 0,
      }}>
        É ISSO!
      </h1>
      <p style={{
        fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 13,
        color: "rgba(20,48,0,0.55)", letterSpacing: "0.12em",
        textTransform: "uppercase" as const, position: "relative", margin: 0,
      }}>
        Votos enviados pros {total} personagens
      </p>
    </div>
  );
}
