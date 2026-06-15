"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { submitVotos } from "./actions";
import { House, CheckCircle, Football, ChartBar, CaretLeft, FastForward } from "@phosphor-icons/react";
import Link from "next/link";

type Jogador = { id: string; apelido: string };
type Trait = { slug: string; nome: string; categoria: string; emoji: string | null };

interface Props {
  rodadaId: string;
  meuId: string;
  jogadores: Jogador[];
  traits: Trait[];
}

const STEPS = [
  {
    categoria: "MVP",
    title: "MATADOR",
    description: "O artilheiro implacável. Ninguém escapou dos gols dele hoje.",
    illustration: "/ilustracoes/tubarao.png",
  },
  {
    categoria: "BAGRE",
    title: "BAGRE DA NOITE",
    description: "Errou tudo que tentou. Hoje definitivamente não era o dia dele.",
    illustration: "/ilustracoes/bagre.png",
  },
  {
    categoria: "RACUDO",
    title: "PREGUEIRO",
    description: "Corpo presente, alma ausente. Raçou quando quis, mas não muito.",
    illustration: "/ilustracoes/corpo-mole.png",
  },
  {
    categoria: "RESENHA",
    title: "REI DA RESENHA",
    description: "A zoação ficou mais animada com ele em campo.",
    illustration: "/ilustracoes/gato.png",
  },
  {
    categoria: "TRAIT",
    title: "TRAIT ESPECIAL",
    description: "Escolha um jogador que merece um reconhecimento especial.",
    illustration: "/ilustracoes/flamingo.png",
  },
] as const;

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
  const [step, setStep] = useState(0);
  const [selections, setSelections] = useState<Record<number, string>>({});
  const [traitSlug, setTraitSlug] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const outros = jogadores.filter((j) => j.id !== meuId);
  const cfg = STEPS[step <= 4 ? step : 4];
  const totalSteps = STEPS.length;

  useEffect(() => {
    if (step === 6) {
      const t = setTimeout(() => router.push("/feed"), 3500);
      return () => clearTimeout(t);
    }
  }, [step, router]);

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
      if (selections[4] === undefined) submitAllVotes();
      else setStep(5);
    } else if (step === 5) {
      submitAllVotes();
    }
  }

  function handleSkip() {
    handleNext();
  }

  function handleBack() {
    if (step === 0) router.push("/feed");
    else setStep(step - 1);
  }

  if (step === 6) {
    return <DoneScreen />;
  }

  const traitPlayer = step === 5 ? jogadores.find((j) => j.id === selections[4]) : null;
  const progressPct = (step / totalSteps) * 100;

  return (
    <>
      <style>{`
        .vote-btn { transition: transform 120ms cubic-bezier(0.23,1,0.32,1); }
        .vote-btn:active { transform: scale(0.94); }
      `}</style>

      <div style={{
        minHeight: "100dvh",
        background: "#090909",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        overflow: "hidden",
      }}>

        {/* ── Main content ── */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>

          {/* Top character card */}
          <div style={{
            background: "#171717",
            borderBottomLeftRadius: 48,
            borderBottomRightRadius: 48,
            paddingTop: "calc(168px + env(safe-area-inset-top, 0px))",
            paddingBottom: 24,
            paddingLeft: 8,
            paddingRight: 8,
            flexShrink: 0,
          }}>
            <div style={{
              border: "1px solid rgba(255,215,0,0.2)",
              borderRadius: 36,
              background: "linear-gradient(158.57deg, #1a1a1a 0%, #0d0d0d 100%)",
              padding: 8,
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}>
              {/* Illustration */}
              <div style={{ width: 132, height: 132, flexShrink: 0, boxShadow: "0px 4px 45px -30px rgba(255,215,0,0.25)" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={step <= 4 ? cfg.illustration : "/ilustracoes/flamingo.png"}
                  alt={step <= 4 ? cfg.title : "Trait"}
                  style={{ width: "100%", height: "100%", objectFit: "cover", mixBlendMode: "screen" }}
                />
              </div>
              {/* Info */}
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 4 }}>
                <p style={{ margin: 0, fontFamily: "var(--font-display)", fontWeight: 900, fontSize: 24, lineHeight: "28px", color: "#fff" }}>
                  {step === 5 ? "TRAIT ESPECIAL" : cfg.title}
                </p>
                <p style={{ margin: 0, fontFamily: "var(--font-display)", fontWeight: 500, fontSize: 14, lineHeight: "18px", color: "#999", letterSpacing: "-0.65px" }}>
                  {step === 5 && traitPlayer
                    ? `Para ${traitPlayer.apelido}: qual trait ele merece?`
                    : step <= 4 ? cfg.description : ""}
                </p>
              </div>
            </div>
          </div>

          {/* Bottom player grid */}
          <div style={{
            background: "#171717",
            borderTopLeftRadius: 48,
            borderTopRightRadius: 48,
            flex: 1,
            padding: "24px 8px",
            overflowY: "auto",
            paddingBottom: "calc(96px + env(safe-area-inset-bottom, 0px))",
          }}>
            {step < 5 ? (
              <PlayerGrid
                jogadores={outros}
                selected={selections[step]}
                onSelect={(id) => setSelections((prev) => ({ ...prev, [step]: id }))}
              />
            ) : (
              <TraitGrid traits={traits} selected={traitSlug} onSelect={setTraitSlug} />
            )}
          </div>
        </div>

        {/* ── Topbar (fixed overlay) ── */}
        <div style={{
          position: "fixed", top: 0, left: "50%", transform: "translateX(-50%)",
          width: "min(100%, 430px)", zIndex: 30,
        }}>
          <div style={{ height: "calc(26px + env(safe-area-inset-top, 0px))" }} />
          <div style={{ padding: "0 16px", display: "flex", alignItems: "center", gap: 12 }}>
            {/* Back button */}
            <button
              onClick={handleBack}
              style={{
                width: 40, height: 40,
                background: "#2a2a2a", border: "1px solid #444",
                borderRadius: 9999, display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer", flexShrink: 0,
              }}
            >
              <CaretLeft size={18} color="#fff" weight="bold" />
            </button>

            {/* Title */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ margin: 0, fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 12, lineHeight: "18px", color: "#999", textTransform: "uppercase" as const, letterSpacing: "0.5px" }}>
                VOTANDO
              </p>
              <p style={{ margin: 0, fontFamily: "var(--font-display)", fontWeight: 900, fontSize: 18, lineHeight: "27px", color: "#fff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {step + 1} de {totalSteps} personagens
              </p>
            </div>

            {/* Skip button */}
            <button
              onClick={handleSkip}
              style={{
                background: "#2a2a2a", borderRadius: 10,
                padding: "8px 12px", display: "flex", alignItems: "center", gap: 4,
                cursor: "pointer", border: "none", flexShrink: 0,
              }}
            >
              <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 12, color: "#666" }}>Pular</span>
              <FastForward size={14} color="#666" weight="fill" />
            </button>
          </div>

          {/* Progress bar */}
          <div style={{ padding: "12px 16px 0" }}>
            <div style={{ height: 6, background: "#333", borderRadius: 9999, overflow: "hidden" }}>
              <div style={{
                height: "100%", background: "#9fe870",
                borderRadius: 9999,
                width: `${progressPct}%`,
                transition: "width 300ms cubic-bezier(0.23,1,0.32,1)",
              }} />
            </div>
          </div>
        </div>

        {/* ── Bottom Nav ── */}
        <div style={{
          position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)",
          width: "min(100%, 430px)", zIndex: 30,
          padding: "0 16px",
          paddingBottom: "max(6px, env(safe-area-inset-bottom, 6px))",
        }}>
          {error && (
            <p role="alert" style={{ color: "#ef4444", fontSize: 13, textAlign: "center", fontFamily: "var(--font-body)", marginBottom: 8 }}>
              {error}
            </p>
          )}
          <nav style={{
            background: "rgba(0,0,0,0.08)", border: "1px solid #393939",
            borderRadius: 32, padding: "6px 15px",
            display: "flex", alignItems: "center",
            backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
            boxShadow: "0px 4px 4.7px 1px rgba(0,0,0,0.28)",
          }}>
            <div style={{ display: "flex", flex: 1, alignItems: "center", justifyContent: "space-between" }}>
              <VNavItem icon="house" label="Home" href="/feed" />
              <VNavItem icon="check" label="Votos" active />
              <VNavItem icon="soccer" label="Pelada" href="/feed" />
              <VNavItem icon="chart" label="Ranking" href="/ranking" />
            </div>
          </nav>
        </div>
      </div>
    </>
  );
}

function PlayerGrid({ jogadores, selected, onSelect }: {
  jogadores: Jogador[];
  selected: string | undefined;
  onSelect: (id: string) => void;
}) {
  if (jogadores.length === 0) {
    return (
      <p style={{ color: "#666", fontFamily: "var(--font-body)", fontSize: 14, textAlign: "center", padding: "32px 0" }}>
        Nenhum outro jogador no grupo ainda.
      </p>
    );
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
      {jogadores.map((j) => {
        const isSelected = selected === j.id;
        const initial = getInitial(j.apelido);
        const avatarColor = getAvatarColor(j.apelido);
        const firstName = j.apelido.split(" ")[0];

        return (
          <button
            key={j.id}
            onClick={() => onSelect(j.id)}
            className="vote-btn"
            style={{
              background: isSelected ? "#272727" : "#000",
              border: isSelected ? "2px solid #9fe870" : "1px solid #2e2e2e",
              borderRadius: isSelected ? 20 : 14,
              padding: isSelected ? "10px 9px" : "13px 9px",
              display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
              cursor: "pointer",
              minHeight: isSelected ? 110 : 84,
              transition: "all 150ms cubic-bezier(0.23,1,0.32,1)",
            }}
          >
            {isSelected ? (
              <div style={{
                width: 72, height: 72, borderRadius: "50%",
                background: avatarColor + "22",
                border: `2px solid ${avatarColor}55`,
                display: "flex", alignItems: "center", justifyContent: "center",
                overflow: "hidden", flexShrink: 0,
              }}>
                <span style={{ fontFamily: "var(--font-display)", fontWeight: 900, fontSize: 28, color: avatarColor }}>{initial}</span>
              </div>
            ) : (
              <div style={{
                width: 40, height: 40, borderRadius: "50%",
                background: "#2a2a2a",
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0,
              }}>
                <span style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 18, color: "#fff" }}>{initial}</span>
              </div>
            )}
            <span style={{
              fontFamily: "var(--font-display)",
              fontWeight: 800,
              fontSize: isSelected ? 14 : 11,
              color: isSelected ? "#ccc" : "#ccc",
              textAlign: "center",
              lineHeight: "13.75px",
              maxWidth: "100%",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}>
              {firstName}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function TraitGrid({ traits, selected, onSelect }: {
  traits: Trait[];
  selected: string | null;
  onSelect: (slug: string) => void;
}) {
  const categories = [
    { key: "FUTEBOL",       label: "Futebol",       color: "#B5FF4D" },
    { key: "PERSONALIDADE", label: "Personalidade", color: "#F59E0B" },
    { key: "RESENHA",       label: "Resenha",       color: "#EF4444" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {categories.map((cat) => {
        const catTraits = traits.filter((t) => t.categoria === cat.key);
        if (catTraits.length === 0) return null;
        return (
          <div key={cat.key}>
            <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase" as const, color: cat.color, marginBottom: 8, opacity: 0.8 }}>
              {cat.label}
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
              {catTraits.map((trait) => {
                const isSelected = selected === trait.slug;
                return (
                  <button
                    key={trait.slug}
                    onClick={() => onSelect(trait.slug)}
                    className="vote-btn"
                    style={{
                      background: isSelected ? "#272727" : "#000",
                      border: isSelected ? `2px solid ${cat.color}` : "1px solid #2e2e2e",
                      borderRadius: 14,
                      padding: "13px 9px",
                      display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
                      cursor: "pointer",
                    }}
                  >
                    <div style={{
                      width: 40, height: 40, borderRadius: "50%",
                      background: "#2a2a2a",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      <span style={{ fontSize: 20 }}>{trait.emoji ?? "⭐"}</span>
                    </div>
                    <span style={{
                      fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 11,
                      color: isSelected ? cat.color : "#ccc",
                      textAlign: "center", lineHeight: "13.75px",
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

function DoneScreen() {
  return (
    <div style={{
      minHeight: "100dvh",
      background: "#9fe870",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      textAlign: "center", gap: 24, padding: "32px 24px",
    }}>
      <div aria-hidden style={{
        position: "absolute", inset: "-40px",
        backgroundImage: "repeating-linear-gradient(90deg, transparent 0px, transparent 46px, rgba(0,0,0,0.07) 46px, rgba(0,0,0,0.07) 48px)",
      }} />
      <h1 style={{
        fontFamily: "var(--font-display)", fontWeight: 900,
        fontSize: "clamp(52px, 14vw, 72px)", lineHeight: 0.86,
        letterSpacing: "-0.02em", textTransform: "uppercase" as const,
        color: "#0d0d0d", position: "relative",
      }}>
        VOTOS<br />ENVIADOS!
      </h1>
      <p style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 13, color: "rgba(22,51,0,0.55)", letterSpacing: "0.12em", textTransform: "uppercase" as const }}>
        Voltando para o feed...
      </p>
    </div>
  );
}

function VNavItem({ icon, label, active, href }: { icon: string; label: string; active?: boolean; href?: string }) {
  const c = active ? "#000" : "#fff";
  const w = 28;
  const iconEl = (() => {
    if (icon === "house")  return <House  size={w} color={c} weight={active ? "fill" : "regular"} />;
    if (icon === "check")  return <CheckCircle size={w} color={c} weight={active ? "fill" : "regular"} />;
    if (icon === "soccer") return <Football size={w} color={c} weight={active ? "fill" : "regular"} />;
    if (icon === "chart")  return <ChartBar size={w} color={c} weight={active ? "fill" : "regular"} />;
    return null;
  })();

  const inner = (
    <div style={{
      width: 56, height: 56,
      borderRadius: active ? 100 : undefined,
      background: active ? "#9fe870" : undefined,
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      padding: 8,
    }}>
      <div style={{ width: 28, display: "flex", flexDirection: "column", alignItems: "center" }}>
        {iconEl}
        <span style={{
          fontFamily: "var(--font-display)", fontWeight: active ? 800 : 600,
          fontSize: 10, lineHeight: "14px", color: active ? "#000" : "#fff",
          textAlign: "center", letterSpacing: "-0.2px", whiteSpace: "nowrap", minWidth: "100%",
        }}>{label}</span>
      </div>
    </div>
  );
  if (href) return <Link href={href} style={{ textDecoration: "none" }}>{inner}</Link>;
  return <button style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}>{inner}</button>;
}
