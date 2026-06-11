"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { submitVotos } from "./actions";

type Jogador = { id: string; apelido: string };
type Trait = { slug: string; nome: string; categoria: string; emoji: string | null };

interface Props {
  rodadaId: string;
  meuId: string;
  jogadores: Jogador[];
  traits: Trait[];
}

const STEPS = [
  { categoria: "MVP",     label: "CRAQUE DO DIA",   pre: "QUEM FOI",   accent: "O CRAQUE?",    color: "#B5FF4D" },
  { categoria: "BAGRE",   label: "BAGRE DA VEZ",    pre: "QUEM FOI",   accent: "O BAGRE?",     color: "#EF4444" },
  { categoria: "RACUDO",  label: "RAÇUDO",           pre: "QUEM MAIS",  accent: "SE RAÇOU?",    color: "#F59E0B" },
  { categoria: "RESENHA", label: "REI DA RESENHA",  pre: "QUEM ANIMOU", accent: "A RESENHA?",  color: "#60A5FA" },
  { categoria: "TRAIT",   label: "TRAIT ESPECIAL",  pre: "QUEM MERECE", accent: "UMA TRAIT?",  color: "#A78BFA" },
] as const;

const AVATAR_COLORS = ["#B5FF4D", "#60A5FA", "#F59E0B", "#EF4444", "#A78BFA", "#34D399", "#F97316", "#EC4899"];

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
  // step 0-4: pick player for each category; step 5: pick trait; step 6: done
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

  // Allow proceeding even with no players (step will be skipped without a vote)
  const canProceed =
    step === 5 ? traitSlug !== null : noPlayers || selections[step] !== undefined;

  function handleBack() {
    if (step === 0) {
      router.push("/feed");
    } else {
      setStep(step - 1);
    }
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

    if (votos.length === 0) {
      setStep(6);
      return;
    }

    startTransition(async () => {
      const result = await submitVotos(rodadaId, votos);
      if ("error" in result) {
        setError(result.error ?? "Erro desconhecido.");
      } else {
        setStep(6);
      }
    });
  }

  function handleNext() {
    if (step < 4) {
      setStep(step + 1);
    } else if (step === 4) {
      // Skip trait picker if no player was selected (no outros)
      if (noPlayers || selections[4] === undefined) {
        submitAllVotes();
      } else {
        setStep(5);
      }
    } else if (step === 5) {
      submitAllVotes();
    }
  }

  if (step === 6) {
    return (
      <DoneScreen
        selections={selections}
        traitSlug={traitSlug}
        jogadores={jogadores}
        traits={traits}
      />
    );
  }

  const traitPlayer = step === 5 ? jogadores.find((j) => j.id === selections[4]) : null;

  return (
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
              transition: "background 0.3s, opacity 0.3s",
            }}
          />
        ))}
      </div>

      {/* Header */}
      <div style={{ padding: "0 20px 16px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          {/* Back button — 44×44 touch target */}
          <button
            onClick={handleBack}
            aria-label="Voltar"
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

          <div style={{
            background: cfg.color + "22",
            border: `1px solid ${cfg.color}55`,
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

          <span style={{ fontFamily: "var(--font-body)", fontSize: "12px", color: "var(--color-text-muted)", minWidth: "34px", textAlign: "right" }}>
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
            <>
              QUAL A<br />
              <span style={{ color: cfg.color }}>TRAIT?</span>
            </>
          ) : (
            <>
              {cfg.pre}<br />
              <span style={{ color: cfg.color }}>{cfg.accent}</span>
            </>
          )}
        </h1>

        {step === 5 && traitPlayer && (
          <p style={{
            marginTop: "6px",
            fontSize: "13px",
            color: "var(--color-text-muted)",
            fontFamily: "var(--font-body)",
          }}>
            Para <strong style={{ color: "var(--color-text-secondary)" }}>{traitPlayer.apelido}</strong>
          </p>
        )}
      </div>

      {/* Scrollable content */}
      <div style={{ flex: 1, overflowY: "auto", padding: "0 16px" }}>
        {step < 5 ? (
          <PlayerGrid
            jogadores={outros}
            selected={selections[step]}
            onSelect={(id) => setSelections((prev) => ({ ...prev, [step]: id }))}
            color={cfg.color}
          />
        ) : (
          <TraitGrid
            traits={traits}
            selected={traitSlug}
            onSelect={setTraitSlug}
          />
        )}
      </div>

      {/* Footer */}
      <div style={{
        padding: "12px 20px",
        paddingBottom: "max(20px, env(safe-area-inset-bottom, 0px))",
        borderTop: "1px solid var(--color-border-muted)",
        background: "rgba(10,10,10,0.97)",
      }}>
        {error && (
          <p style={{ color: "var(--color-danger)", fontSize: "13px", marginBottom: "8px", textAlign: "center", fontFamily: "var(--font-body)" }}>
            {error}
          </p>
        )}
        <button
          onClick={handleNext}
          disabled={!canProceed || isPending}
          style={{
            width: "100%",
            height: "56px",
            background: canProceed ? cfg.color : "var(--color-surface-2)",
            color: canProceed ? "#0D0D0D" : "var(--color-text-muted)",
            border: "none",
            borderRadius: "var(--radius-md)",
            fontFamily: "var(--font-display)",
            fontWeight: 900,
            fontSize: "16px",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            cursor: canProceed ? "pointer" : "default",
            transition: "background 0.15s, color 0.15s",
            WebkitTapHighlightColor: "transparent",
          }}
        >
          {isPending ? "ENVIANDO..." : step === 5 ? "CONFIRMAR VOTOS" : "PRÓXIMO →"}
        </button>
      </div>
    </div>
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
            style={{
              background: isSelected ? color + "18" : "var(--color-surface-1)",
              border: `2px solid ${isSelected ? color : "var(--color-border)"}`,
              borderRadius: "var(--radius-md)",
              padding: "14px 8px 10px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "8px",
              cursor: "pointer",
              transition: "all 0.12s",
              WebkitTapHighlightColor: "transparent",
            }}
          >
            <div style={{
              width: "52px",
              height: "52px",
              borderRadius: "50%",
              background: isSelected ? color + "22" : avatarColor + "18",
              border: `2px solid ${isSelected ? color : avatarColor + "55"}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: "var(--font-display)",
              fontWeight: 900,
              fontSize: "15px",
              letterSpacing: "0.04em",
              color: isSelected ? color : avatarColor,
              position: "relative",
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
    { key: "FUTEBOL", label: "Futebol" },
    { key: "PERSONALIDADE", label: "Personalidade" },
    { key: "RESENHA", label: "Resenha" },
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
              color: "var(--color-text-muted)",
              fontFamily: "var(--font-body)",
              marginBottom: "8px",
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
                    style={{
                      background: isSelected ? "rgba(167,139,250,0.18)" : "var(--color-surface-1)",
                      border: `2px solid ${isSelected ? "#A78BFA" : "var(--color-border)"}`,
                      borderRadius: "var(--radius-md)",
                      padding: "12px 8px 10px",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: "4px",
                      cursor: "pointer",
                      transition: "all 0.12s",
                      WebkitTapHighlightColor: "transparent",
                    }}
                  >
                    <span style={{ fontSize: "22px", lineHeight: 1 }}>{trait.emoji ?? "⭐"}</span>
                    <span style={{
                      fontSize: "10px",
                      fontWeight: 600,
                      fontFamily: "var(--font-body)",
                      color: isSelected ? "#A78BFA" : "var(--color-text-secondary)",
                      textAlign: "center",
                      lineHeight: 1.2,
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
    { label: "MVP",     color: "#B5FF4D", value: apelido(selections[0]) },
    { label: "BAGRE",   color: "#EF4444", value: apelido(selections[1]) },
    { label: "RAÇUDO",  color: "#F59E0B", value: apelido(selections[2]) },
    { label: "RESENHA", color: "#60A5FA", value: apelido(selections[3]) },
    { label: "TRAIT",   color: "#A78BFA", value: `${apelido(selections[4])} — ${trait?.emoji ?? ""} ${trait?.nome ?? ""}`.trim() },
  ];

  return (
    <div style={{
      minHeight: "100dvh",
      background: "var(--color-bg)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "32px 24px",
      textAlign: "center",
      gap: "28px",
    }}>
      <div style={{ fontSize: "64px", lineHeight: 1 }}>⚽</div>

      <div>
        <h1 style={{
          fontFamily: "var(--font-display)",
          fontWeight: 900,
          fontSize: "clamp(48px, 13vw, 64px)",
          lineHeight: 0.88,
          letterSpacing: "-0.02em",
          textTransform: "uppercase",
          color: "var(--color-text-primary)",
          marginBottom: "10px",
        }}>
          VOTOS<br />
          <span style={{ color: "var(--color-accent)" }}>ENVIADOS!</span>
        </h1>
        <p style={{ fontSize: "14px", color: "var(--color-text-muted)", fontFamily: "var(--font-body)" }}>
          Voltando para o feed...
        </p>
      </div>

      <div style={{
        width: "100%",
        maxWidth: "320px",
        background: "var(--color-surface-1)",
        borderRadius: "var(--radius-lg)",
        border: "1px solid var(--color-border)",
        overflow: "hidden",
      }}>
        {summary.map((item, i) => (
          <div
            key={item.label}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "12px 16px",
              borderBottom: i < summary.length - 1 ? "1px solid var(--color-border-muted)" : "none",
            }}
          >
            <span style={{
              fontFamily: "var(--font-display)",
              fontWeight: 900,
              fontSize: "11px",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: item.color,
              minWidth: "64px",
            }}>
              {item.label}
            </span>
            <span style={{
              fontSize: "13px",
              fontWeight: 600,
              fontFamily: "var(--font-body)",
              color: "var(--color-text-primary)",
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
