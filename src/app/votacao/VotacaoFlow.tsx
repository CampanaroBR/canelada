"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { submitVotos } from "./actions";
import { BottomNav } from "@/components/layout/BottomNav";

type Jogador = { id: string; apelido: string };
type Trait = { slug: string; nome: string; categoria: string; emoji: string | null };

interface Props {
  rodadaId: string;
  meuId: string;
  jogadores: Jogador[];
  traits: Trait[];
}

const STEPS = [
  { categoria: "MVP",     label: "CRAQUE DO DIA",  pre: "QUEM FOI",    accent: "O CRAQUE?",   color: "#9fe870" },
  { categoria: "BAGRE",   label: "BAGRE DA VEZ",   pre: "QUEM FOI",    accent: "O BAGRE?",    color: "#EF4444" },
  { categoria: "RACUDO",  label: "RAÇUDO",          pre: "QUEM MAIS",   accent: "SE RAÇOU?",   color: "#F59E0B" },
  { categoria: "RESENHA", label: "REI DA RESENHA", pre: "QUEM ANIMOU", accent: "A RESENHA?",  color: "#60A5FA" },
  { categoria: "TRAIT",   label: "TRAIT ESPECIAL", pre: "QUEM MERECE", accent: "UMA TRAIT?",  color: "#A78BFA" },
] as const;

const AVATAR_COLORS = ["#9fe870", "#60A5FA", "#F59E0B", "#EF4444", "#A78BFA", "#34D399", "#F97316", "#EC4899"];

function getAvatarColor(apelido: string) {
  let h = 0;
  for (const c of apelido) h = (h * 31 + c.charCodeAt(0)) & 0xffff;
  return AVATAR_COLORS[h % AVATAR_COLORS.length];
}

function getInitials(apelido: string) {
  const parts = apelido.trim().split(/\s+/);
  return parts.length >= 2 ? (parts[0][0] + parts[1][0]).toUpperCase() : apelido.slice(0, 2).toUpperCase();
}

export function VotacaoFlow({ rodadaId, meuId, jogadores, traits }: Props) {
  const [step, setStep] = useState(0);
  const [selections, setSelections] = useState<Record<number, string>>({});
  const [traitSlug, setTraitSlug] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const outros = jogadores.filter((j) => j.id !== meuId);
  const noPlayers = outros.length === 0;
  const progressStep = step >= 5 ? 4 : step;
  const cfg = STEPS[step <= 4 ? step : 4];

  useEffect(() => {
    if (step === 6) {
      const t = setTimeout(() => router.push("/feed"), 3500);
      return () => clearTimeout(t);
    }
  }, [step, router]);

  const canProceed =
    step === 5 ? traitSlug !== null : noPlayers || selections[step] !== undefined;

  function handleBack() {
    if (step === 0) router.push("/feed");
    else setStep(step - 1);
  }

  function submitAllVotes() {
    const votos = STEPS
      .map((s, i) => ({
        categoria: s.categoria as "MVP" | "BAGRE" | "RACUDO" | "RESENHA" | "TRAIT",
        votadoId: selections[i] as string | undefined,
        ...(s.categoria === "TRAIT" && traitSlug ? { traitSlug } : {}),
      }))
      .filter(
        (v): v is { categoria: "MVP" | "BAGRE" | "RACUDO" | "RESENHA" | "TRAIT"; votadoId: string; traitSlug?: string } =>
          v.votadoId !== undefined
      );

    if (votos.length === 0) { setStep(6); return; }

    startTransition(async () => {
      const result = await submitVotos(rodadaId, votos);
      if ("error" in result) setError(result.error ?? "Erro desconhecido.");
      else setStep(6);
    });
  }

  function handleNext() {
    if (step < 4) {
      setStep(step + 1);
    } else if (step === 4) {
      if (noPlayers || selections[4] === undefined) submitAllVotes();
      else setStep(5);
    } else if (step === 5) {
      submitAllVotes();
    }
  }

  if (step === 6) {
    return <DoneScreen selections={selections} traitSlug={traitSlug} jogadores={jogadores} traits={traits} />;
  }

  const traitPlayer = step === 5 ? jogadores.find((j) => j.id === selections[4]) : null;

  return (
    <>
      <style>{`
        .vote-card {
          transition-property: transform, box-shadow, background;
          transition-duration: 150ms;
          transition-timing-function: cubic-bezier(0.23, 1, 0.32, 1);
        }
        .vote-card:active { transform: scale(0.96); }
        .vote-cta {
          transition-property: background, color, transform;
          transition-duration: 150ms;
          transition-timing-function: cubic-bezier(0.23, 1, 0.32, 1);
        }
        .vote-cta:not(:disabled):active { transform: scale(0.96); }
        .vote-back {
          transition-property: color, background;
          transition-duration: 150ms;
          transition-timing-function: cubic-bezier(0.23, 1, 0.32, 1);
        }
      `}</style>
      <div style={{
        position: "fixed",
        top: 0,
        bottom: 0,
        left: "50%",
        transform: "translateX(-50%)",
        width: "min(100vw, 430px)",
        background: "var(--color-bg)",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}>
        {/* Progress bar */}
        <div style={{
          display: "flex",
          gap: "4px",
          padding: "0 16px",
          paddingTop: "calc(12px + env(safe-area-inset-top, 0px))",
          paddingBottom: "12px",
        }}>
          {STEPS.map((s, i) => (
            <div
              key={i}
              style={{
                flex: 1,
                height: "3px",
                borderRadius: "9999px",
                background: i <= progressStep ? s.color : "var(--color-surface-2)",
                opacity: i > progressStep ? 0.3 : 1,
                transition: "background 300ms cubic-bezier(0.23,1,0.32,1), opacity 300ms cubic-bezier(0.23,1,0.32,1)",
              }}
            />
          ))}
        </div>

        {/* Header */}
        <div style={{ padding: "0 20px 16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <button
              onClick={handleBack}
              aria-label="Voltar"
              className="vote-back"
              style={{
                width: "44px",
                height: "44px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "var(--color-text-muted)",
                marginLeft: "-10px",
                WebkitTapHighlightColor: "transparent",
                borderRadius: "var(--radius-sm)",
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>

            {/* Label pill — shadow-as-border */}
            <div style={{
              background: cfg.color + "18",
              boxShadow: `0 0 0 1px ${cfg.color}50`,
              borderRadius: "9999px",
              padding: "4px 12px",
              fontFamily: "var(--font-display)",
              fontWeight: 900,
              fontSize: "11px",
              letterSpacing: "0.12em",
              textTransform: "uppercase" as const,
              color: cfg.color,
            }}>
              {cfg.label}
            </div>

            <span className="tabular" style={{ fontFamily: "var(--font-body)", fontSize: "12px", color: "var(--color-text-muted)", minWidth: "34px", textAlign: "right" }}>
              {step >= 4 ? "5" : step + 1} / 5
            </span>
          </div>

          <h1 style={{
            fontFamily: "var(--font-display)",
            fontWeight: 900,
            fontSize: "clamp(30px, 8vw, 40px)",
            lineHeight: 0.9,
            letterSpacing: "-0.01em",
            textTransform: "uppercase",
            color: "var(--color-text-primary)",
          }}>
            {step === 5 ? (
              <>QUAL A<br /><span style={{ color: cfg.color }}>TRAIT?</span></>
            ) : (
              <>{cfg.pre}<br /><span style={{ color: cfg.color }}>{cfg.accent}</span></>
            )}
          </h1>

          {step === 5 && traitPlayer && (
            <p style={{ marginTop: "6px", fontSize: "13px", color: "var(--color-text-muted)", fontFamily: "var(--font-body)" }}>
              Para <strong style={{ color: "var(--color-text-secondary)" }}>{traitPlayer.apelido}</strong>
            </p>
          )}
        </div>

        {/* Scrollable content — padding bottom deixa espaço para footer + navbar */}
        <div style={{ flex: 1, overflowY: "auto", padding: "0 16px" }}>
          {step < 5 ? (
            <PlayerGrid
              jogadores={outros}
              selected={selections[step]}
              onSelect={(id) => setSelections((prev) => ({ ...prev, [step]: id }))}
              color={cfg.color}
            />
          ) : (
            <TraitGrid traits={traits} selected={traitSlug} onSelect={setTraitSlug} />
          )}
        </div>

        {/* Footer — liquid glass, acima do BottomNav */}
        <div style={{
          padding: "12px 20px",
          paddingBottom: "calc(84px + env(safe-area-inset-bottom, 0px))",
          background: "rgba(18,18,18,0.80)",
          backdropFilter: "blur(24px) saturate(180%)",
          WebkitBackdropFilter: "blur(24px) saturate(180%)",
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.08)",
        }}>
          {error && (
            <p role="alert" style={{ color: "var(--color-danger)", fontSize: "13px", marginBottom: "8px", textAlign: "center", fontFamily: "var(--font-body)" }}>
              {error}
            </p>
          )}
          <button
            onClick={handleNext}
            disabled={!canProceed || isPending}
            className="vote-cta"
            style={{
              width: "100%",
              height: "52px",
              background: canProceed ? cfg.color : "var(--color-surface-2)",
              color: canProceed ? "#0D0D0D" : "var(--color-text-muted)",
              border: "none",
              borderRadius: "var(--radius-xl)",
              fontFamily: "var(--font-display)",
              fontWeight: 900,
              fontSize: "16px",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              cursor: canProceed ? "pointer" : "default",
              WebkitTapHighlightColor: "transparent",
            }}
          >
            {isPending ? "ENVIANDO..." : step === 5 ? "CONFIRMAR VOTOS" : "PRÓXIMO →"}
          </button>
        </div>

        <BottomNav />
      </div>
    </>
  );
}

function PlayerGrid({
  jogadores,
  selected,
  onSelect,
  color,
}: {
  jogadores: Jogador[];
  selected: string | undefined;
  onSelect: (id: string) => void;
  color: string;
}) {
  if (jogadores.length === 0) {
    return (
      <p style={{ color: "var(--color-text-muted)", fontFamily: "var(--font-body)", fontSize: "14px", textAlign: "center", padding: "32px 0" }}>
        Nenhum outro jogador no grupo ainda.
      </p>
    );
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px", paddingBottom: "16px" }}>
      {jogadores.map((j) => {
        const isSelected = selected === j.id;
        const avatarColor = getAvatarColor(j.apelido);
        return (
          <button
            key={j.id}
            onClick={() => onSelect(j.id)}
            className="vote-card"
            style={{
              background: isSelected ? color + "18" : "var(--color-surface-1)",
              boxShadow: isSelected
                ? `0 0 0 2px ${color}, inset 0 1px 0 rgba(255,255,255,0.06)`
                : "var(--shadow-border)",
              border: "none",
              borderRadius: "var(--radius-md)",
              padding: "14px 8px 10px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "8px",
              cursor: "pointer",
              WebkitTapHighlightColor: "transparent",
            }}
          >
            <div style={{
              width: "52px",
              height: "52px",
              borderRadius: "50%",
              background: isSelected ? color + "22" : avatarColor + "18",
              boxShadow: `0 0 0 2px ${isSelected ? color + "80" : avatarColor + "55"}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: "var(--font-display)",
              fontWeight: 900,
              fontSize: "15px",
              letterSpacing: "0.04em",
              color: isSelected ? color : avatarColor,
              flexShrink: 0,
            }}>
              {isSelected ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              ) : (
                getInitials(j.apelido)
              )}
            </div>
            <span style={{
              fontSize: "11px",
              fontWeight: isSelected ? 700 : 500,
              fontFamily: "var(--font-body)",
              color: isSelected ? color : "var(--color-text-secondary)",
              letterSpacing: "0.01em",
              textAlign: "center",
              lineHeight: 1.2,
              maxWidth: "72px",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}>
              {j.apelido}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function TraitGrid({
  traits,
  selected,
  onSelect,
}: {
  traits: Trait[];
  selected: string | null;
  onSelect: (slug: string) => void;
}) {
  const categories = [
    { key: "FUTEBOL",       label: "Futebol",       color: "#9fe870" },
    { key: "PERSONALIDADE", label: "Personalidade", color: "#F59E0B" },
    { key: "RESENHA",       label: "Resenha",       color: "#EF4444" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", paddingBottom: "16px" }}>
      {categories.map((cat) => {
        const catTraits = traits.filter((t) => t.categoria === cat.key);
        if (catTraits.length === 0) return null;
        return (
          <div key={cat.key}>
            <p style={{
              fontSize: "10px",
              fontWeight: 700,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: cat.color,
              fontFamily: "var(--font-body)",
              marginBottom: "8px",
              opacity: 0.8,
            }}>
              {cat.label}
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px" }}>
              {catTraits.map((trait) => {
                const isSelected = selected === trait.slug;
                return (
                  <button
                    key={trait.slug}
                    onClick={() => onSelect(trait.slug)}
                    className="vote-card"
                    style={{
                      background: isSelected ? cat.color + "18" : "var(--color-surface-1)",
                      boxShadow: isSelected
                        ? `0 0 0 2px ${cat.color}, inset 0 1px 0 rgba(255,255,255,0.06)`
                        : "var(--shadow-border)",
                      border: "none",
                      borderRadius: "var(--radius-md)",
                      padding: "12px 8px 10px",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: "4px",
                      cursor: "pointer",
                      WebkitTapHighlightColor: "transparent",
                    }}
                  >
                    <span style={{ fontSize: "22px", lineHeight: 1 }}>{trait.emoji ?? "⭐"}</span>
                    <span style={{
                      fontSize: "10px",
                      fontWeight: 600,
                      fontFamily: "var(--font-body)",
                      color: isSelected ? cat.color : "var(--color-text-secondary)",
                      textAlign: "center",
                      lineHeight: 1.2,
                      transition: "color 150ms cubic-bezier(0.23,1,0.32,1)",
                    }}>
                      {trait.nome}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function DoneScreen({
  selections,
  traitSlug,
  jogadores,
  traits,
}: {
  selections: Record<number, string>;
  traitSlug: string | null;
  jogadores: Jogador[];
  traits: Trait[];
}) {
  const apelido = (id: string) => jogadores.find((j) => j.id === id)?.apelido ?? "—";
  const trait = traits.find((t) => t.slug === traitSlug);

  const summary = [
    { label: "MVP",     color: "#9fe870", value: apelido(selections[0]) },
    { label: "BAGRE",   color: "#EF4444", value: apelido(selections[1]) },
    { label: "RAÇUDO",  color: "#F59E0B", value: apelido(selections[2]) },
    { label: "RESENHA", color: "#60A5FA", value: apelido(selections[3]) },
    { label: "TRAIT",   color: "#A78BFA", value: `${apelido(selections[4])} — ${trait?.emoji ?? ""} ${trait?.nome ?? ""}`.trim() },
  ];

  return (
    <div style={{
      minHeight: "100dvh",
      background: "var(--color-accent)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "32px 24px calc(32px + env(safe-area-inset-bottom, 0px))",
      textAlign: "center",
      gap: "32px",
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Stripe texture */}
      <div aria-hidden style={{
        position: "absolute",
        inset: "-40px",
        backgroundImage: "repeating-linear-gradient(90deg, transparent 0px, transparent 46px, rgba(0,0,0,0.07) 46px, rgba(0,0,0,0.07) 48px)",
        pointerEvents: "none",
      }} />
      {/* Radial vignette */}
      <div aria-hidden style={{
        position: "absolute",
        inset: 0,
        background: "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.25) 100%)",
        pointerEvents: "none",
      }} />

      {/* Badge — double-bezel circular, estilo TOP SNIPER */}
      <div style={{ position: "relative", zIndex: 1 }}>
        {/* Outer ring */}
        <div style={{
          width: "140px",
          height: "140px",
          borderRadius: "50%",
          background: "rgba(0,0,0,0.18)",
          boxShadow: [
            "0 0 0 1px rgba(0,0,0,0.25)",
            "inset 0 2px 0 rgba(255,255,255,0.15)",
            "0 8px 32px rgba(0,0,0,0.30)",
          ].join(", "),
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "8px",
        }}>
          {/* Inner core */}
          <div style={{
            width: "100%",
            height: "100%",
            borderRadius: "50%",
            background: "rgba(0,0,0,0.22)",
            boxShadow: "inset 0 2px 4px rgba(0,0,0,0.30), 0 0 0 1px rgba(0,0,0,0.20)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "52px",
            lineHeight: 1,
          }}>
            ⚽
          </div>
        </div>
      </div>

      {/* Texto hero */}
      <div style={{ position: "relative", zIndex: 1 }}>
        <h1 style={{
          fontFamily: "var(--font-display)",
          fontWeight: 900,
          fontSize: "clamp(52px, 14vw, 72px)",
          lineHeight: 0.86,
          letterSpacing: "-0.02em",
          textTransform: "uppercase",
          color: "var(--color-on-accent)",
          marginBottom: "16px",
        }}>
          VOTOS<br />ENVIADOS!
        </h1>
        <p style={{
          fontSize: "13px",
          fontWeight: 600,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: "rgba(22,51,0,0.55)",
          fontFamily: "var(--font-body)",
        }}>
          Voltando para o feed...
        </p>
      </div>

      {/* Summary card — dark card sobre fundo verde */}
      <div style={{
        position: "relative",
        zIndex: 1,
        width: "100%",
        maxWidth: "320px",
        background: "rgba(0,0,0,0.22)",
        borderRadius: "var(--radius-lg)",
        boxShadow: [
          "0 0 0 1px rgba(0,0,0,0.25)",
          "inset 0 1px 0 rgba(255,255,255,0.10)",
          "0 8px 32px rgba(0,0,0,0.20)",
        ].join(", "),
        overflow: "hidden",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
      }}>
        {summary.map((item, i) => (
          <div
            key={item.label}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "11px 16px",
              boxShadow: i < summary.length - 1 ? "inset 0 -1px 0 rgba(0,0,0,0.15)" : "none",
            }}
          >
            <span style={{
              fontFamily: "var(--font-display)",
              fontWeight: 900,
              fontSize: "11px",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: item.color,
              minWidth: "64px",
              textShadow: "0 1px 4px rgba(0,0,0,0.30)",
            }}>
              {item.label}
            </span>
            <span style={{
              fontSize: "13px",
              fontWeight: 600,
              fontFamily: "var(--font-body)",
              color: "rgba(255,255,255,0.90)",
              textAlign: "right",
            }}>
              {item.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
