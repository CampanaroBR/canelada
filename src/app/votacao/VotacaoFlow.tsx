"use client";

import { useState, useTransition, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { submitVotos } from "./actions";
// TRAIT_SVG removido — usamos ilustrações de personagens PNG no hero
import { CaretLeft, CaretRight, MagnifyingGlass, CheckCircle, Check, Confetti } from "@phosphor-icons/react";

type Jogador = { id: string; apelido: string };
type Trait = { slug: string; nome: string; categoria: string; emoji: string | null; descricao: string | null };

interface Props {
  rodadaId: string;
  meuId: string;
  jogadores: Jogador[];
  traits: Trait[];
}

// Ordem oficial do PRD "Sistema de Traits do Canelada" — 16 personagens em 3 grupos.
// Grupo Futebol é obrigatório; Resenha e Destaques Negativos são opcionais (dá pra pular).
const GROUPS = [
  { label: "Futebol", required: true, slugs: ["categoria", "matador", "paredao", "racudo", "xerife", "garcom", "driblador"] },
  { label: "Resenha", required: false, slugs: ["resenha-forte", "delegado", "chorao", "reclamao", "paneleiro"] },
  { label: "Destaques", required: false, slugs: ["firuleiro", "pregueiro", "cone", "bagre"] },
];
const ORDERED_SLUGS = GROUPS.flatMap((g) => g.slugs);
const REQUIRED_COUNT = GROUPS.filter((g) => g.required).reduce((n, g) => n + g.slugs.length, 0);
// grupo de um dado slug (para rótulo/estado opcional)
function groupOf(slug: string) {
  return GROUPS.find((g) => g.slugs.includes(slug)) ?? GROUPS[0];
}

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
  const [review, setReview] = useState(false);
  const [submitting, setSubmitting] = useState(false);
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
  const currentGroup = groupOf(trait?.slug ?? "");
  const isOptional = step >= REQUIRED_COUNT;

  useEffect(() => {
    if (done) {
      const t = setTimeout(() => router.push("/feed"), 3000);
      return () => clearTimeout(t);
    }
  }, [done, router]);

  // Ao trocar de personagem (voltar/editar), recupera o voto já feito para o passo,
  // fazendo a barra de "Confirmar" reaparecer em vez de sumir.
  useEffect(() => {
    setPending(selections[step] ?? null);
    setSearch("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

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
      setReview(true);
    }
  }

  function handleBack() {
    if (step === 0) router.push("/feed");
    else setStep((s) => s - 1);
  }

  // Pular: só nos personagens opcionais. Remove qualquer voto do passo e avança (ou revisa).
  function handleSkip() {
    const next = { ...selections };
    delete next[step];
    setSelections(next);
    setPending(null);
    setSearch("");
    if (step < total - 1) setStep((s) => s + 1);
    else setReview(true);
  }

  // Finalizar (nos opcionais): vai pra revisão em vez de enviar direto.
  function handleFinish() {
    setReview(true);
  }

  // Editar um voto a partir da revisão: volta ao passo correspondente.
  function editStep(i: number) {
    setReview(false);
    setPending(null);
    setSearch("");
    setStep(i);
  }

  function submitAllWith(sels: Record<number, string>) {
    const votos = steps
      .map((t, i) => ({ categoria: "TRAIT" as const, traitSlug: t.slug, votadoId: sels[i] as string | undefined }))
      .filter((v): v is { categoria: "TRAIT"; traitSlug: string; votadoId: string } => v.votadoId !== undefined);

    if (votos.length === 0) { setDone(true); return; }

    setSubmitting(true);
    startTransition(async () => {
      const result = await submitVotos(rodadaId, votos);
      setSubmitting(false);
      if ("error" in result) setError(result.error ?? "Erro desconhecido.");
      else setDone(true);
    });
  }

  if (done) return <DoneScreen router={router} />;
  if (review) return (
    <ReviewScreen
      steps={steps}
      selections={selections}
      jogadores={jogadores}
      submitting={submitting}
      error={error}
      onEdit={editStep}
      onSubmit={() => submitAllWith(selections)}
      onBack={() => setReview(false)}
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
          <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 4 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 12, letterSpacing: "0.06em", color: "#fff", textShadow: "0 1px 3px rgba(0,0,0,0.55)" }}>
                {currentGroup.label.toUpperCase()}
              </span>
              {isOptional ? (
                <span style={{
                  fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 10, letterSpacing: "0.06em",
                  color: "#3a2a06", background: "#f0b84a",
                  borderRadius: 9999, padding: "3px 9px", boxShadow: "0 1px 3px rgba(0,0,0,0.35)",
                }}>OPCIONAL</span>
              ) : (
                <span style={{
                  fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 10, letterSpacing: "0.06em",
                  color: "#0a1a06", background: "#9fe870",
                  borderRadius: 9999, padding: "3px 9px", boxShadow: "0 1px 3px rgba(0,0,0,0.35)",
                }}>OBRIGATÓRIO</span>
              )}
            </div>
            <p style={{ margin: 0, fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 18, color: "#fff", textShadow: "0 1px 3px rgba(0,0,0,0.45)" }}>
              {step + 1} de {total} personagens
            </p>
          </div>
          {isOptional ? (
            <button
              onClick={handleSkip}
              style={{
                height: 48, minWidth: 48, borderRadius: 24, flexShrink: 0, padding: "0 16px",
                background: "rgba(0,0,0,0.4)", border: "1px solid #424242",
                fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14, color: "#cfcfcf",
                cursor: "pointer", pointerEvents: "auto",
              }}
            >
              Pular
            </button>
          ) : (
            <div style={{ width: 48, flexShrink: 0 }} />
          )}
        </div>
        <div style={{ paddingTop: 12, display: "flex", gap: 4 }}>
          {GROUPS.map((g) => {
            const start = ORDERED_SLUGS.indexOf(g.slugs[0]);
            const filled = Math.min(Math.max(step - start, 0), g.slugs.length) / g.slugs.length;
            const tone = g.required ? "#9fe870" : "#e0a83a";
            return (
              <div key={g.label} style={{ flex: g.slugs.length, height: 6, borderRadius: 9999, background: "rgba(255,255,255,0.18)", overflow: "hidden" }}>
                <div style={{ height: 6, borderRadius: 9999, background: tone, width: `${filled * 100}%`, transition: "width 280ms ease" }} />
              </div>
            );
          })}
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
          {/* Background PNG real do Figma — object-cover full-bleed (quando existir) */}
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
            </div>

            {/* Título + descrição */}
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
          {/* Aviso de transição: primeira etapa opcional */}
          {step === REQUIRED_COUNT && (
            <div style={{
              margin: "0 8px", padding: 14, borderRadius: 16,
              background: "rgba(159,232,112,0.08)", border: "1px solid rgba(159,232,112,0.28)",
              display: "flex", gap: 12, alignItems: "center",
            }}>
              <div style={{
                width: 40, height: 40, borderRadius: 12, flexShrink: 0,
                background: "rgba(159,232,112,0.14)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <Confetti size={22} color="#9fe870" weight="regular" />
              </div>
              <div style={{ minWidth: 0 }}>
                <p style={{ margin: 0, fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 14, color: "#fff" }}>
                  Agora é opcional
                </p>
                <p style={{ margin: "2px 0 0", fontFamily: "var(--font-body)", fontWeight: 500, fontSize: 13, lineHeight: "18px", color: "#a9c99a" }}>
                  Vote em quem quiser, ou toque em Pular / Finalizar quando terminar.
                </p>
              </div>
            </div>
          )}

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
                  // Só a escolha atual (pending) fica destacada. Ao voltar, o pending já
                  // vem sincronizado com o voto salvo, então trocar não acende dois.
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
                        {/* Check verde ao escolher — micro-feedback */}
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

          {/* Finalizar votação — só nos opcionais, encerra sem pular um a um */}
          {isOptional && (
            <div style={{ padding: "8px 8px 0", display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
              <button
                onClick={handleFinish}
                style={{
                  width: "100%", height: 50, borderRadius: 14,
                  background: "transparent", border: "1px solid #2e2e2e",
                  fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15, color: "#9fe870",
                  cursor: "pointer", WebkitTapHighlightColor: "transparent",
                }}
              >
                Finalizar votação
              </button>
              <span style={{ fontFamily: "var(--font-body)", fontWeight: 500, fontSize: 12, color: "#7a7a7a" }}>
                envia o que você já votou
              </span>
            </div>
          )}
        </div>
      </div>

      {/* ── Confirm pill flutuante (estilo navbar) ── */}
      {pending && pendingPlayer && (
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

/* ─── Tela de revisão: confere/edita os votos antes de enviar ─── */
function ReviewScreen({
  steps, selections, jogadores, submitting, error, onEdit, onSubmit, onBack,
}: {
  steps: Trait[];
  selections: Record<number, string>;
  jogadores: Jogador[];
  submitting: boolean;
  error: string | null;
  onEdit: (i: number) => void;
  onSubmit: () => void;
  onBack: () => void;
}) {
  const nomePorId = new Map(jogadores.map((j) => [j.id, j.apelido]));
  const totalVotos = Object.values(selections).filter(Boolean).length;

  return (
    <div style={{
      position: "fixed", top: 0, bottom: 0, left: "50%", transform: "translateX(-50%)",
      width: "min(100%, 430px)", background: "#090909", display: "flex", flexDirection: "column", overflow: "hidden",
    }}>
      {/* Topbar */}
      <div style={{
        flexShrink: 0, paddingTop: "calc(env(safe-area-inset-top, 0px) + 20px)",
        padding: "calc(env(safe-area-inset-top, 0px) + 20px) 16px 12px",
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
            Toque em um voto pra ajustar · {totalVotos} de {steps.length}
          </p>
        </div>
      </div>

      {/* Lista agrupada */}
      <div style={{ flex: 1, overflowY: "auto", padding: "12px 12px 96px", WebkitOverflowScrolling: "touch" }}>
        {GROUPS.map((g) => {
          const green = g.required;
          const tone = green ? "#9fe870" : "#e0a83a";
          return (
            <div key={g.label} style={{ marginBottom: 18 }}>
              <p style={{
                margin: "0 0 8px 4px", fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 11,
                letterSpacing: "0.08em", color: tone, textTransform: "uppercase",
              }}>
                {g.label} {green ? "· obrigatório" : "· opcional"}
              </p>
              <div style={{ background: "#141414", border: "1px solid #2c2c2c", borderRadius: 16, overflow: "hidden" }}>
                {g.slugs.map((slug, k) => {
                  const i = steps.findIndex((t) => t.slug === slug);
                  if (i < 0) return null;
                  const t = steps[i];
                  const votadoId = selections[i];
                  const apelido = votadoId ? nomePorId.get(votadoId) : null;
                  return (
                    <button
                      key={slug}
                      onClick={() => onEdit(i)}
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
                      <span style={{ flexShrink: 0, color: apelido ? "#7a7a7a" : tone, display: "flex" }}>
                        {apelido
                          ? <PencilIcon />
                          : <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 12, color: tone }}>votar</span>}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Rodapé fixo — enviar */}
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

      {/* Glow radial verde pulsante */}
      <div aria-hidden style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        background: "radial-gradient(460px 380px at 50% 38%, rgba(159,232,112,0.20), transparent 70%)",
        animation: "done-glow 3.4s ease-in-out infinite",
      }} />

      {/* Confete */}
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

      {/* Check com anéis de pulso */}
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

      {/* Conteúdo — reveal escalonado */}
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
