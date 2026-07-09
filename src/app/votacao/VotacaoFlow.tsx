"use client";

import { useState, useTransition, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { submitVotos } from "./actions";
import { CaretLeft, CaretRight, MagnifyingGlass, CheckCircle, Check, UsersThree, Trophy, Skull, SoccerBall, X } from "@phosphor-icons/react";
import { BottomSheet } from "@/ds";

type Jogador = { id: string; apelido: string };
type Trait = { slug: string; nome: string; categoria: string; emoji: string | null; descricao: string | null };

interface Props {
  rodadaId: string;
  meuId: string;
  jogadores: Jogador[];
  traits: Trait[];
  isAdmin?: boolean;
}

// Estrutura híbrida: 4 personagens "hero" (tela cheia, obrigatórios — os que
// viram assunto no grupo depois do jogo) e os outros numa lista compacta só,
// dividida em Positivo/Negativo, opcional/pulável. Antes eram 7 telas cheias
// obrigatórias seguidas — gente reclamou de cansaço; isso corta pra 4.
//
// De 18 pra 15 traits votáveis: cortados Chorão (redundante com Reclamão —
// mesma ideia de "lamenta/reclama"), Cone (redundante com Pregueiro — mesma
// ideia de "baixo impacto/correu pouco") e Delegado (redundante com
// Categoria — "a bola é dele" já é o que Categoria cobre). Frangueiro
// mantido de propósito: é o único trait negativo específico de goleiro.
// Os traits continuam existindo no banco (histórico/badges intactos), só
// não aparecem mais pra votar.
const HERO_SLUGS = ["categoria", "matador", "paredao", "bagre"];
const POSITIVO_SLUGS = ["racudo", "xerife", "garcom", "driblador", "resenha-forte"];
const NEGATIVO_SLUGS = ["reclamao", "paneleiro", "firuleiro", "pregueiro", "frangueiro", "bragueiro"];
const LISTA_SLUGS = [...POSITIVO_SLUGS, ...NEGATIVO_SLUGS];
const ALL_SLUGS = [...HERO_SLUGS, ...LISTA_SLUGS];

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
  pregueiro:       "/votacao-bg/corpo-mole.png",
  "corpo-mole":    "/votacao-bg/corpo-mole.png",
  cone:            "/votacao-bg/cone.png",
  bagre:           "/votacao-bg/bagre.png",
  driblador:       "/votacao-bg/driblador.png",
  delegado:        "/votacao-bg/delegado.png",
  frangueiro:      "/votacao-bg/frangueiro.png",
  bragueiro:       "/votacao-bg/bragueiro.png",
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
  pregueiro:       "#3c2b17",
  "corpo-mole":    "#3c2b17",
  cone:            "#632d10",
  bagre:           "#0e394f",
  driblador:       "#5a2a12",
  delegado:        "#333333",
  frangueiro:      "#504723",
  bragueiro:       "#72141d",
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
  pregueiro:       "/votacao-mascot/pregueiro.png",
  "corpo-mole":    "/votacao-mascot/corpo-mole.png",
  cone:            "/votacao-mascot/cone.png",
  bagre:           "/votacao-mascot/bagre.png",
  driblador:       "/votacao-mascot/driblador.png",
  delegado:        "/votacao-mascot/delegado.png",
  frangueiro:      "/votacao-mascot/frangueiro.png",
  bragueiro:       "/votacao-mascot/bragueiro.png",
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

type Phase = "hero" | "bem" | "abaixo" | "review" | "done";

export function VotacaoFlow({ rodadaId, meuId, jogadores, traits, isAdmin }: Props) {
  const traitBySlug = new Map(traits.map((t) => [t.slug, t]));
  const heroTraits = HERO_SLUGS.map((s) => traitBySlug.get(s)).filter((t): t is Trait => !!t);
  const listaTraits = LISTA_SLUGS.map((s) => traitBySlug.get(s)).filter((t): t is Trait => !!t);

  const [phase, setPhase] = useState<Phase>("hero");
  const [heroStep, setHeroStep] = useState(0);
  const [selections, setSelections] = useState<Record<string, string>>({});
  const [pending, setPending] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const searchRef = useRef<HTMLInputElement>(null);

  const outros = jogadores.filter((j) => j.id !== meuId);
  const trait = heroTraits[heroStep];
  const bgImage = BG_IMAGES[trait?.slug ?? ""] ?? "";
  const glowColor = GLOW_COLORS[trait?.slug ?? ""] ?? "#333";
  const mascot = MASCOTE[trait?.slug ?? ""] ?? "/ilustracoes/gato.png";
  const filtered = outros.filter((j) => j.apelido.toLowerCase().includes(search.toLowerCase()));
  const pendingPlayer = pending ? jogadores.find((j) => j.id === pending) ?? null : null;

  useEffect(() => {
    if (phase === "done") {
      const t = setTimeout(() => router.push("/feed"), 3000);
      return () => clearTimeout(t);
    }
  }, [phase, router]);

  // Ao trocar de personagem hero (voltar/editar), recupera o voto já feito.
  useEffect(() => {
    if (phase !== "hero" || !trait) return;
    setPending(selections[trait.slug] ?? null);
    setSearch("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, heroStep]);

  function handleSelect(id: string) {
    setPending((prev) => (prev === id ? null : id));
  }

  function handleConfirm() {
    if (!pending || !trait) return;
    setSelections((prev) => ({ ...prev, [trait.slug]: pending }));
    setPending(null);
    setSearch("");
    if (heroStep < heroTraits.length - 1) setHeroStep((s) => s + 1);
    else setPhase("bem");
  }

  function handleBack() {
    if (phase === "hero" && heroStep === 0) router.push("/feed");
    else if (phase === "hero") setHeroStep((s) => s - 1);
    else if (phase === "bem") { setPhase("hero"); setHeroStep(heroTraits.length - 1); }
    else if (phase === "abaixo") setPhase("bem");
  }

  // Editar um voto a partir da revisão: volta pro passo/tela correspondente.
  function editSlug(slug: string) {
    setError(null);
    const heroIdx = HERO_SLUGS.indexOf(slug);
    if (heroIdx >= 0) {
      setPhase("hero");
      setHeroStep(heroIdx);
    } else if (POSITIVO_SLUGS.includes(slug)) {
      setPhase("bem");
    } else {
      setPhase("abaixo");
    }
  }

  function submitAllWith(sels: Record<string, string>) {
    const votos = ALL_SLUGS
      .map((slug) => ({ categoria: "TRAIT" as const, traitSlug: slug, votadoId: sels[slug] }))
      .filter((v): v is { categoria: "TRAIT"; traitSlug: string; votadoId: string } => v.votadoId !== undefined);

    if (votos.length === 0) { setPhase("done"); return; }

    setSubmitting(true);
    startTransition(async () => {
      const result = await submitVotos(rodadaId, votos);
      setSubmitting(false);
      if ("error" in result) setError(result.error ?? "Erro desconhecido.");
      else setPhase("done");
    });
  }

  if (phase === "done") return <DoneScreen router={router} />;
  if (phase === "review") return (
    <ReviewScreen
      heroTraits={heroTraits}
      listaTraits={listaTraits}
      selections={selections}
      jogadores={jogadores}
      submitting={submitting}
      error={error}
      onEdit={editSlug}
      onSubmit={() => submitAllWith(selections)}
      onBack={() => setPhase("abaixo")}
    />
  );
  const selectHandler = (slug: string, jogadorId: string | null) => setSelections((prev) => {
    const next = { ...prev };
    if (jogadorId) next[slug] = jogadorId; else delete next[slug];
    return next;
  });
  if (phase === "bem") return (
    <PersonagensList
      title="Personagens que foram bem"
      icon={<Trophy size={22} color="#9fe870" weight="fill" />}
      tone="#9fe870"
      bg="rgba(159,232,112,0.08)"
      border="#2c2c2c"
      traitsIn={listaTraits.filter((t) => POSITIVO_SLUGS.includes(t.slug))}
      jogadores={jogadores}
      meuId={meuId}
      selections={selections}
      onSelect={selectHandler}
      onBack={handleBack}
      onFinish={() => setPhase("abaixo")}
      finishLabel="Continuar"
    />
  );
  if (phase === "abaixo") return (
    <PersonagensList
      title="Personagens que foram abaixo"
      icon={<Skull size={22} color="#e56767" weight="fill" />}
      tone="#e56767"
      bg="rgba(229,103,103,0.08)"
      border="#3a2424"
      traitsIn={listaTraits.filter((t) => NEGATIVO_SLUGS.includes(t.slug))}
      jogadores={jogadores}
      meuId={meuId}
      selections={selections}
      onSelect={selectHandler}
      onBack={handleBack}
      onFinish={() => setPhase("review")}
      finishLabel="Revisar e enviar"
    />
  );
  if (!trait) return null;

  return (
    <div style={{
      position: "fixed", top: 0, bottom: 0, left: "50%", transform: "translateX(-50%)",
      width: "min(100%, 430px)",
      background: "#090909", display: "flex", flexDirection: "column", overflow: "hidden",
    }}>
      {/* ── Status Bar (glass, fixo) ── */}
      <div className="glass-bar" style={{
        position: "absolute", top: 0, left: 0, right: 0, zIndex: 20,
        pointerEvents: "none",
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
          <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 4 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 12, letterSpacing: "0.06em", color: "#fff", textShadow: "0 1px 3px rgba(0,0,0,0.55)" }}>
                OS 4 DA NOITE
              </span>
              <span style={{
                fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 10, letterSpacing: "0.06em",
                color: "#0a1a06", background: "#9fe870",
                borderRadius: 9999, padding: "3px 9px", boxShadow: "0 1px 3px rgba(0,0,0,0.35)",
              }}>OBRIGATÓRIO</span>
            </div>
            <p style={{ margin: 0, fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 18, color: "#fff", textShadow: "0 1px 3px rgba(0,0,0,0.45)" }}>
              {heroStep + 1} de {heroTraits.length} personagens
            </p>
          </div>
          {isAdmin ? (
            <Link
              href="/votacao/presenca"
              aria-label="Editar quem jogou"
              style={{
                width: 48, height: 48, borderRadius: 24, flexShrink: 0,
                background: "rgba(0,0,0,0.4)", border: "1px solid #424242",
                display: "flex", alignItems: "center", justifyContent: "center",
                pointerEvents: "auto",
              }}
            >
              <UsersThree size={20} color="#fff" weight="bold" />
            </Link>
          ) : (
            <div style={{ width: 48, flexShrink: 0 }} />
          )}
        </div>
        <div style={{ paddingTop: 12, display: "flex", gap: 4 }}>
          {heroTraits.map((t, i) => (
            <div key={t.slug} style={{ flex: 1, height: 6, borderRadius: 9999, background: "rgba(255,255,255,0.18)", overflow: "hidden" }}>
              <div style={{ height: 6, borderRadius: 9999, background: "#9fe870", width: i <= heroStep ? "100%" : "0%", transition: "width 280ms ease" }} />
            </div>
          ))}
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
          {bgImage && (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              aria-hidden
              src={bgImage}
              alt=""
              style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", pointerEvents: "none" }}
            />
          )}

          <div style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center", width: "100%" }}>
            <div style={{ position: "relative", width: 289, height: 296, marginBottom: -20, flexShrink: 0 }}>
              <div aria-hidden style={{
                position: "absolute",
                left: "50%", top: "calc(50% + 6px)",
                transform: "translate(-50%, -50%)",
                width: 301, height: 308, borderRadius: "50%",
                background: glowColor, filter: "blur(104px)",
              }} />
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
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: "center", width: "100%", maxWidth: 361 }}>
              <p style={{ margin: 0, fontFamily: "var(--font-display)", fontWeight: 900, fontSize: 32, lineHeight: "36px", color: "#fff", textAlign: "center", textShadow: "0 2px 12px rgba(0,0,0,0.6), 0 0 2px rgba(0,0,0,0.5)" }}>
                {trait.nome.toUpperCase()} {trait.emoji}
              </p>
              <p style={{
                margin: 0, paddingTop: 4, paddingLeft: 24, paddingRight: 24,
                fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 18, lineHeight: "22px",
                color: "#fff", letterSpacing: "-0.8px", textAlign: "center",
                textShadow: "0 1px 10px rgba(0,0,0,0.55), 0 0 2px rgba(0,0,0,0.45)",
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
                  const highlight = pending === j.id;
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
                      <div style={{ position: "relative", flexShrink: 0 }}>
                        <div style={{
                          width: 48, height: 48, borderRadius: "50%",
                          background: highlight ? color + "33" : "#2a2a2a",
                          border: highlight ? `1px solid ${color}` : "none",
                          display: "flex", alignItems: "center", justifyContent: "center",
                        }}>
                          <span style={{
                            fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 18,
                            color: highlight ? color : "#fff",
                          }}>{initial}</span>
                        </div>
                        <div style={{
                          position: "absolute", right: -2, bottom: -2,
                          width: 20, height: 20, borderRadius: "50%",
                          background: "#9fe870", border: "2px solid #000",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          transform: highlight ? "scale(1)" : "scale(0)",
                          opacity: highlight ? 1 : 0,
                          transition: "transform 200ms cubic-bezier(0.32,0.72,0,1), opacity 160ms ease",
                        }}>
                          <Check size={12} color="#0a1a06" weight="bold" />
                        </div>
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
      {pending && pendingPlayer && !searchFocused && (
        <div style={{
          position: "absolute", left: 8, right: 8,
          bottom: `calc(env(safe-area-inset-bottom, 0px) + 8px)`,
          zIndex: 25,
          background: "rgba(15,14,12,0.92)", border: "1px solid #393939",
          borderRadius: 32, padding: 4,
          display: "flex", alignItems: "center", gap: 8,
          boxShadow: "0px 4px 4.7px 1px rgba(0,0,0,0.28)",
        }}>
          <div style={{ display: "flex", flex: 1, alignItems: "center", gap: 8, minWidth: 0 }}>
            <div style={{ position: "relative", width: 59, height: 56, flexShrink: 0 }}>
              <div style={{
                width: 56, height: 56, borderRadius: "50%",
                background: "#090909", border: "1px solid #383838",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 18, color: "#fff" }}>
                  {getInitial(pendingPlayer.apelido)}
                </span>
              </div>
              <div style={{ position: "absolute", left: 35, top: 32, width: 24, height: 24, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <CheckCircle size={24} color="#9fe870" weight="fill" />
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 2, flex: 1, minWidth: 0 }}>
              <p style={{
                margin: 0, fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 12, lineHeight: "16px",
                color: "#cccccc",
              }}>
                SEU VOTO · {trait.nome.toUpperCase()}
              </p>
              <p style={{
                margin: 0, fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 18, lineHeight: "22px",
                color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" as const,
              }}>
                {pendingPlayer.apelido.toUpperCase()}
              </p>
            </div>
          </div>

          <button
            onClick={handleConfirm}
            style={{
              flexShrink: 0, height: 56, width: 118, borderRadius: 9999,
              background: "#9fe870", border: "1px solid #424242",
              padding: "0 13px", display: "flex", alignItems: "center", justifyContent: "center", gap: 4,
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

/* ─── Tela de lista de personagens: uma seção por tela (bem / abaixo),
   igual ao Figma (764:355 e 764:682) — telas separadas, não uma única
   página com duas seções. Header de seção (ícone em caixinha + título +
   subtítulo "Os votos aqui são opcionais") + lista de linhas 72px de
   altura (avatar 56px, nome, pill de seleção). Escolher jogador abre um
   bottom sheet com busca em vez de carrossel — mais rápido de usar com
   listas de 20-30+ jogadores. */
function PersonagensList({
  title, icon, tone, bg, border, traitsIn, jogadores, meuId, selections, onSelect, onBack, onFinish, finishLabel,
}: {
  title: string;
  icon: React.ReactNode;
  tone: string;
  bg: string;
  border: string;
  traitsIn: Trait[];
  jogadores: Jogador[];
  meuId: string;
  selections: Record<string, string>;
  onSelect: (slug: string, jogadorId: string | null) => void;
  onBack: () => void;
  onFinish: () => void;
  finishLabel: string;
}) {
  const [pickerSlug, setPickerSlug] = useState<string | null>(null);
  const [pickerSearch, setPickerSearch] = useState("");
  const outros = jogadores.filter((j) => j.id !== meuId);
  const pickerTrait = pickerSlug ? traitsIn.find((t) => t.slug === pickerSlug) ?? null : null;
  const pickerFiltered = outros.filter((j) => j.apelido.toLowerCase().includes(pickerSearch.toLowerCase()));

  function openPicker(slug: string) {
    setPickerSlug(slug);
    setPickerSearch("");
  }

  function pickFor(jogadorId: string) {
    if (!pickerSlug) return;
    onSelect(pickerSlug, selections[pickerSlug] === jogadorId ? null : jogadorId);
    setPickerSlug(null);
  }

  return (
    <div style={{
      position: "fixed", top: 0, bottom: 0, left: "50%", transform: "translateX(-50%)",
      width: "min(100%, 430px)", background: "#090909", display: "flex", flexDirection: "column", overflow: "hidden",
    }}>
      <div style={{
        flexShrink: 0, padding: "calc(env(safe-area-inset-top, 0px) + 20px) 16px 16px",
        borderBottom: "1px solid #1c1c1c",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button onClick={onBack} aria-label="Voltar" style={{
            width: 40, height: 40, borderRadius: 20, flexShrink: 0,
            background: "rgba(255,255,255,0.06)", border: "1px solid #2c2c2c",
            display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
          }}>
            <CaretLeft size={16} color="#fff" weight="bold" />
          </button>
          <div style={{
            width: 40, height: 40, borderRadius: 12, flexShrink: 0,
            background: "#171717", border: `1px solid ${border}`,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            {icon}
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <p style={{
              margin: 0, fontFamily: "var(--font-display)", fontWeight: 900, fontSize: 15, color: "#fff",
              textTransform: "uppercase", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
            }}>
              {title}
            </p>
            <p style={{ margin: 0, fontFamily: "var(--font-body)", fontWeight: 500, fontSize: 12, color: tone }}>
              Os votos aqui são opcionais
            </p>
          </div>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "16px 8px 8px", WebkitOverflowScrolling: "touch", display: "flex", flexDirection: "column" }}>
        <div style={{ background: "#141414", border: `1px solid ${border}`, borderRadius: 20, overflow: "hidden" }}>
          {traitsIn.map((t, i) => {
            const votadoId = selections[t.slug];
            const votado = votadoId ? jogadores.find((j) => j.id === votadoId) : null;
            return (
              <div
                key={t.slug}
                style={{
                  display: "flex", alignItems: "center", gap: 12,
                  padding: "8px 12px", background: votado ? bg : "none",
                  borderTop: i === 0 ? "none" : "1px solid #1f1f1f",
                }}
              >
                <div style={{ width: 56, height: 56, position: "relative", flexShrink: 0 }}>
                  <Image alt={t.nome} src={MASCOTE[t.slug] ?? "/ilustracoes/gato.png"} fill sizes="56px" style={{ objectFit: "contain" }} />
                </div>
                <span style={{ flex: 1, minWidth: 0, fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 15, letterSpacing: "0.04em", color: "#fff", textTransform: "uppercase" }}>
                  {t.nome}
                </span>
                <button
                  onClick={() => openPicker(t.slug)}
                  style={{
                    flexShrink: 0, display: "flex", alignItems: "center", gap: 6,
                    height: 32, padding: "0 14px", borderRadius: 9999, cursor: "pointer",
                    WebkitTapHighlightColor: "transparent",
                    background: votado ? "#9fe870" : "#2c2c2c",
                    border: votado ? "none" : "1px solid #3a3a3a",
                  }}
                >
                  <span style={{
                    fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 13,
                    color: votado ? "#0a1a06" : "#e7e7ea",
                    maxWidth: 90, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                  }}>
                    {votado ? votado.apelido : "Selecione"}
                  </span>
                  {votado && <CheckCircle size={16} color="#0a1a06" weight="fill" />}
                </button>
              </div>
            );
          })}
        </div>

        <button
          onClick={onFinish}
          style={{
            width: "100%", height: 54, borderRadius: 9999, border: "none",
            background: "#9fe870", cursor: "pointer", flexShrink: 0,
            fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16, color: "#0a1a06",
            WebkitTapHighlightColor: "transparent",
            marginTop: 24,
            marginBottom: "calc(env(safe-area-inset-bottom, 0px) + 12px)",
          }}
        >
          {finishLabel}
        </button>
      </div>

      {/* Bottom sheet: buscar + escolher jogador pro trait selecionado */}
      <BottomSheet open={!!pickerSlug} onClose={() => setPickerSlug(null)} maxHeight="80dvh">
        <div style={{ display: "flex", flexDirection: "column", gap: 16, padding: "0 16px 16px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 18, flexShrink: 0,
                background: "#141414", border: "1px solid #2c2c2c",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <SoccerBall size={18} color="#9fe870" weight="fill" />
              </div>
              <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 18, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {pickerTrait ? `Selecione o jogador` : ""}
              </span>
            </div>
            <button
              onClick={() => setPickerSlug(null)}
              aria-label="Fechar"
              style={{
                width: 36, height: 36, borderRadius: 18, flexShrink: 0,
                background: "#000", border: "1px solid #424242",
                display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
              }}
            >
              <X size={16} color="#fff" weight="bold" />
            </button>
          </div>

          <div style={{
            display: "flex", alignItems: "center", gap: 8,
            background: "#141414", border: "1px solid #2a2a2d", borderRadius: 14, padding: "12px 15px",
          }}>
            <MagnifyingGlass size={18} color="#fff" weight="regular" />
            <input
              value={pickerSearch}
              onChange={(e) => setPickerSearch(e.target.value)}
              placeholder="Buscar jogador…"
              style={{
                flex: 1, background: "transparent", border: "none", outline: "none",
                fontFamily: "var(--font-body)", fontWeight: 500, fontSize: 14,
                color: "#fff", caretColor: "#9fe870",
              }}
            />
          </div>

          <div style={{ maxHeight: "50dvh", overflowY: "auto", WebkitOverflowScrolling: "touch" }}>
            {pickerFiltered.length === 0 ? (
              <p style={{ color: "#555", fontFamily: "var(--font-body)", fontSize: 13, textAlign: "center", padding: "20px 0" }}>
                Nenhum jogador encontrado
              </p>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
                {pickerFiltered.map((j) => {
                  const active = pickerSlug ? selections[pickerSlug] === j.id : false;
                  const initial = getInitial(j.apelido);
                  const color = getAvatarColor(j.apelido);
                  return (
                    <button
                      key={j.id}
                      onClick={() => pickFor(j.id)}
                      style={{
                        appearance: "none", cursor: "pointer",
                        background: "#000",
                        border: active ? "2px solid #9fe870" : "1px solid #2e2e2e",
                        borderRadius: 12, padding: "13px 8px",
                        display: "flex", flexDirection: "column",
                        alignItems: "center", gap: 4,
                        WebkitTapHighlightColor: "transparent",
                      }}
                    >
                      <div style={{ position: "relative", flexShrink: 0 }}>
                        <div style={{
                          width: 48, height: 48, borderRadius: "50%",
                          background: active ? color + "33" : "#2a2a2a",
                          border: active ? `1px solid ${color}` : "none",
                          display: "flex", alignItems: "center", justifyContent: "center",
                        }}>
                          <span style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 18, color: active ? color : "#fff" }}>{initial}</span>
                        </div>
                        <div style={{
                          position: "absolute", right: -2, bottom: -2,
                          width: 20, height: 20, borderRadius: "50%",
                          background: "#9fe870", border: "2px solid #000",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          transform: active ? "scale(1)" : "scale(0)",
                          opacity: active ? 1 : 0,
                          transition: "transform 200ms cubic-bezier(0.32,0.72,0,1), opacity 160ms ease",
                        }}>
                          <Check size={12} color="#0a1a06" weight="bold" />
                        </div>
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
      </BottomSheet>
    </div>
  );
}

/* ─── Tela de revisão: confere/edita os votos antes de enviar ─── */
function ReviewScreen({
  heroTraits, listaTraits, selections, jogadores, submitting, error, onEdit, onSubmit, onBack,
}: {
  heroTraits: Trait[];
  listaTraits: Trait[];
  selections: Record<string, string>;
  jogadores: Jogador[];
  submitting: boolean;
  error: string | null;
  onEdit: (slug: string) => void;
  onSubmit: () => void;
  onBack: () => void;
}) {
  const nomePorId = new Map(jogadores.map((j) => [j.id, j.apelido]));
  const totalVotos = Object.values(selections).filter(Boolean).length;
  const positivos = listaTraits.filter((t) => POSITIVO_SLUGS.includes(t.slug));
  const negativos = listaTraits.filter((t) => NEGATIVO_SLUGS.includes(t.slug));

  const GROUPS_REVIEW = [
    { label: "Os 4 da noite", tone: "#9fe870", required: true, traitsIn: heroTraits },
    { label: "Positivo", tone: "#9fe870", required: false, traitsIn: positivos },
    { label: "Negativo", tone: "#e56767", required: false, traitsIn: negativos },
  ];

  return (
    <div style={{
      position: "fixed", top: 0, bottom: 0, left: "50%", transform: "translateX(-50%)",
      width: "min(100%, 430px)", background: "#090909", display: "flex", flexDirection: "column", overflow: "hidden",
    }}>
      <div style={{
        flexShrink: 0, padding: "calc(env(safe-area-inset-top, 0px) + 20px) 16px 12px",
        display: "flex", alignItems: "center", gap: 12,
        borderBottom: "1px solid #1c1c1c",
      }}>
        <button onClick={onBack} aria-label="Voltar" style={{
          width: 44, height: 44, borderRadius: 22, flexShrink: 0,
          background: "rgba(255,255,255,0.06)", border: "1px solid #2c2c2c",
          display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
        }}>
          <CaretLeft size={16} color="#fff" weight="bold" />
        </button>
        <div style={{ minWidth: 0 }}>
          <p style={{ margin: 0, fontFamily: "var(--font-display)", fontWeight: 900, fontSize: 20, color: "#fff" }}>
            Revise seus votos
          </p>
          <p style={{ margin: 0, fontFamily: "var(--font-body)", fontWeight: 500, fontSize: 12, color: "#8a8a8a" }}>
            Toque em um voto pra ajustar · {totalVotos} de {heroTraits.length + listaTraits.length}
          </p>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "12px 12px 96px", WebkitOverflowScrolling: "touch" }}>
        {GROUPS_REVIEW.map((g) => (
          <div key={g.label} style={{ marginBottom: 18 }}>
            <p style={{
              margin: "0 0 8px 4px", fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 11,
              letterSpacing: "0.08em", color: g.tone, textTransform: "uppercase",
            }}>
              {g.label} {g.required ? "· obrigatório" : "· opcional"}
            </p>
            <div style={{ background: "#141414", border: "1px solid #2c2c2c", borderRadius: 16, overflow: "hidden" }}>
              {g.traitsIn.map((t, k) => {
                const votadoId = selections[t.slug];
                const apelido = votadoId ? nomePorId.get(votadoId) : null;
                return (
                  <button
                    key={t.slug}
                    onClick={() => onEdit(t.slug)}
                    style={{
                      width: "100%", display: "flex", alignItems: "center", gap: 12,
                      padding: "12px 14px", background: "none", cursor: "pointer",
                      border: "none", borderTop: k === 0 ? "none" : "1px solid #1f1f1f",
                      WebkitTapHighlightColor: "transparent", textAlign: "left",
                    }}
                  >
                    <span style={{ fontSize: 18, width: 22, textAlign: "center", flexShrink: 0 }}>{t.emoji}</span>
                    <span style={{ fontFamily: "var(--font-body)", fontWeight: 500, fontSize: 13, color: "#8a8a8a", width: 96, flexShrink: 0 }}>
                      {t.nome}
                    </span>
                    <span style={{
                      flex: 1, minWidth: 0, fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15,
                      color: apelido ? "#fff" : "#5a5a5a", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                    }}>
                      {apelido ?? "pulado"}
                    </span>
                    <span style={{ flexShrink: 0, color: apelido ? "#7a7a7a" : g.tone, display: "flex" }}>
                      {apelido
                        ? <PencilIcon />
                        : <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 12, color: g.tone }}>votar</span>}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div style={{
        position: "absolute", left: 0, right: 0, bottom: 0,
        padding: "12px 16px calc(env(safe-area-inset-bottom, 0px) + 12px)",
        background: "linear-gradient(180deg, rgba(9,9,9,0) 0%, #090909 40%)",
      }}>
        {error && (
          <p style={{ margin: "0 0 8px", color: "#e56767", fontFamily: "var(--font-body)", fontSize: 13, textAlign: "center" }}>{error}</p>
        )}
        <button
          onClick={onSubmit}
          disabled={submitting}
          style={{
            width: "100%", height: 54, borderRadius: 9999, border: "none",
            background: submitting ? "#5f7a44" : "#9fe870", cursor: submitting ? "default" : "pointer",
            fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16, color: "#0a1a06",
            WebkitTapHighlightColor: "transparent",
          }}
        >
          {submitting ? "Enviando…" : `Enviar ${totalVotos} voto${totalVotos === 1 ? "" : "s"}`}
        </button>
      </div>
    </div>
  );
}

function PencilIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7a7a7a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </svg>
  );
}

const DONE_EASE = "cubic-bezier(0.32, 0.72, 0, 1)";
// Confete temático: bolas + emojis do baba, posições/atrasos fixos (determinístico)
const CONFETTI = [
  { emoji: "⚽", left: 12, delay: 0.05, dur: 2.6, size: 20, drift: -30 },
  { emoji: "🏆", left: 24, delay: 0.35, dur: 3.1, size: 18, drift: 20 },
  { emoji: "⚽", left: 38, delay: 0.6, dur: 2.4, size: 14, drift: -12 },
  { emoji: "🔥", left: 50, delay: 0.15, dur: 2.9, size: 18, drift: 25 },
  { emoji: "⚽", left: 62, delay: 0.5, dur: 2.7, size: 22, drift: -20 },
  { emoji: "🥇", left: 74, delay: 0.25, dur: 3.0, size: 18, drift: 14 },
  { emoji: "⚽", left: 86, delay: 0.45, dur: 2.5, size: 16, drift: -18 },
  { emoji: "🎉", left: 6, delay: 0.7, dur: 3.2, size: 18, drift: 22 },
  { emoji: "⚽", left: 92, delay: 0.1, dur: 2.8, size: 14, drift: -10 },
  { emoji: "🔥", left: 32, delay: 0.8, dur: 3.0, size: 16, drift: 16 },
  { emoji: "⚽", left: 68, delay: 0.9, dur: 2.6, size: 20, drift: -24 },
];

function DoneScreen({ router }: { router: ReturnType<typeof useRouter> }) {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const raf = requestAnimationFrame(() => requestAnimationFrame(() => setShow(true)));
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div style={{
      position: "fixed", top: 0, bottom: 0, left: "50%", transform: "translateX(-50%)",
      width: "min(100%, 430px)",
      background: "#090909",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      overflow: "hidden",
      padding: "0 24px", boxSizing: "border-box",
    }}>
      <style>{`
        @keyframes done-pop { 0% { transform: scale(0); opacity: 0; } 60% { transform: scale(1.12); opacity: 1; } 100% { transform: scale(1); } }
        @keyframes done-ring { 0% { transform: scale(0.7); opacity: 0.55; } 100% { transform: scale(2.2); opacity: 0; } }
        @keyframes done-check { 0% { stroke-dashoffset: 48; } 100% { stroke-dashoffset: 0; } }
        @keyframes done-fall { 0% { transform: translateY(-10vh) rotate(0deg); opacity: 0; } 10% { opacity: 1; } 100% { transform: translateY(105vh) translateX(var(--drift)) rotate(320deg); opacity: 0; } }
        @keyframes done-glow { 0%,100% { opacity: 0.5; } 50% { opacity: 0.85; } }
      `}</style>

      <div aria-hidden style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        background: "radial-gradient(460px 380px at 50% 38%, rgba(159,232,112,0.20), transparent 70%)",
        animation: "done-glow 3.4s ease-in-out infinite",
      }} />

      <div aria-hidden style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden" }}>
        {CONFETTI.map((c, i) => (
          <span key={i} style={{
            position: "absolute", top: 0, left: `${c.left}%`, fontSize: c.size,
            // @ts-expect-error custom prop
            "--drift": `${c.drift}px`,
            animation: `done-fall ${c.dur}s ${DONE_EASE} ${c.delay}s infinite`,
          }}>{c.emoji}</span>
        ))}
      </div>

      <div style={{ position: "relative", width: 132, height: 132, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
        {show && [0, 0.5].map((d, i) => (
          <span key={i} aria-hidden style={{
            position: "absolute", width: 132, height: 132, borderRadius: "50%",
            border: "2px solid #9fe870",
            animation: `done-ring 2.4s ${DONE_EASE} ${d}s infinite`,
          }} />
        ))}
        <div style={{
          position: "relative", width: 118, height: 118, borderRadius: "50%",
          background: "linear-gradient(160deg, #b6f588 0%, #7ed44e 100%)",
          boxShadow: "0 12px 40px rgba(159,232,112,0.4)",
          display: "flex", alignItems: "center", justifyContent: "center",
          animation: show ? `done-pop 0.7s ${DONE_EASE} both` : "none",
          opacity: show ? 1 : 0,
        }}>
          <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="#0a1a06" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 12.5l5 5L20 6" style={{
              strokeDasharray: 48, strokeDashoffset: show ? 0 : 48,
              animation: show ? `done-check 0.5s ${DONE_EASE} 0.4s both` : "none",
            }} />
          </svg>
        </div>
      </div>

      <div style={{ position: "relative", width: "100%", maxWidth: 340, display: "flex", flexDirection: "column", alignItems: "center", marginTop: 48 }}>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 6, padding: "5px 14px", borderRadius: 9999,
          background: "rgba(159,232,112,0.08)", border: "1px solid rgba(159,232,112,0.3)", marginBottom: 20,
          opacity: show ? 1 : 0, transform: show ? "translateY(0)" : "translateY(16px)",
          transition: `opacity 500ms ${DONE_EASE} 500ms, transform 500ms ${DONE_EASE} 500ms`,
        }}>
          <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#9fe870" }} />
          <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: "#9fe870" }}>
            Voto confirmado
          </span>
        </div>

        <p style={{
          margin: 0, fontFamily: "var(--font-display)", fontWeight: 900,
          fontSize: 52, lineHeight: "56px", color: "#fff", textAlign: "center", letterSpacing: "-2px",
          opacity: show ? 1 : 0, transform: show ? "translateY(0)" : "translateY(20px)", filter: show ? "blur(0)" : "blur(6px)",
          transition: `opacity 600ms ${DONE_EASE} 580ms, transform 600ms ${DONE_EASE} 580ms, filter 600ms ${DONE_EASE} 580ms`,
        }}>
          É isso!
        </p>

        <p style={{
          margin: "14px 0 0", fontFamily: "var(--font-body)", fontWeight: 500,
          fontSize: 17, lineHeight: "24px", color: "#8a8a8a", textAlign: "center", maxWidth: 300,
          opacity: show ? 1 : 0, transform: show ? "translateY(0)" : "translateY(20px)",
          transition: `opacity 600ms ${DONE_EASE} 680ms, transform 600ms ${DONE_EASE} 680ms`,
        }}>
          Votação enviada! Agora é aguardar a resenha 😂
        </p>

        <button
          onClick={() => router.push("/feed")}
          style={{
            marginTop: 40, background: "#9fe870", border: "none", borderRadius: 9999,
            height: 56, paddingLeft: 28, paddingRight: 8,
            display: "flex", alignItems: "center", gap: 12,
            cursor: "pointer", WebkitTapHighlightColor: "transparent",
            opacity: show ? 1 : 0, transform: show ? "translateY(0)" : "translateY(20px)",
            transition: `opacity 600ms ${DONE_EASE} 800ms, transform 600ms ${DONE_EASE} 800ms`,
          }}
          onPointerDown={(e) => { e.currentTarget.style.transform = "scale(0.97)"; }}
          onPointerUp={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
          onPointerLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
        >
          <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16, color: "#0a1a06", whiteSpace: "nowrap" }}>
            Ir para a Home
          </span>
          <span style={{
            width: 40, height: 40, borderRadius: "50%", background: "rgba(10,26,6,0.14)",
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
          }}>
            <CaretRight size={18} color="#0a1a06" weight="bold" />
          </span>
        </button>
      </div>
    </div>
  );
}
