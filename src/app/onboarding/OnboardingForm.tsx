"use client";

import { useState, useTransition } from "react";
import { saveOnboarding } from "./actions";
import { enablePush } from "@/lib/pushClient";

const MAX = 20;

export function OnboardingForm() {
  const [apelido, setApelido]         = useState("");
  const [nomeNoBaba, setNomeNoBaba]   = useState("");
  const [error, setError]             = useState("");
  const [isPending, startTransition]  = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!apelido.trim() || !nomeNoBaba.trim()) return;
    setError("");
    // Ativa notificações por padrão no cadastro — precisa partir do gesto do usuário
    // (regra do iOS/Chrome), por isso dispara aqui e não num useEffect.
    void enablePush();
    startTransition(async () => {
      const result = await saveOnboarding(apelido, nomeNoBaba);
      if (result?.error) setError(result.error);
    });
  }

  const disabled = isPending || !apelido.trim() || !nomeNoBaba.trim();

  return (
    <>
      <style>{`
        @keyframes pulse-ring {
          0%, 100% { transform: scale(1);    opacity: 0.45; }
          50%       { transform: scale(1.08); opacity: 0.15; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-8px); }
        }

        /* Scale on press (make-interfaces-feel-better) */
        .onboarding-btn {
          transition-property: transform, background, color;
          transition-duration: 150ms;
          transition-timing-function: cubic-bezier(0.23, 1, 0.32, 1);
        }
        .onboarding-btn:not(:disabled):active { transform: scale(0.96); }

        /* Input focus — shadow-as-border com accent */
        .onboarding-input {
          transition-property: box-shadow;
          transition-duration: 150ms;
          transition-timing-function: cubic-bezier(0.23, 1, 0.32, 1);
        }
        .onboarding-input:focus {
          outline: none;
          box-shadow: 0 0 0 1px rgba(159,232,112,0.5), 0 0 0 3px rgba(159,232,112,0.12) !important;
        }
      `}</style>

      <main style={{
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
        background: "var(--color-bg)",
        position: "relative",
        overflow: "hidden",
      }}>

        {/* Stripe texture */}
        <div aria-hidden style={{
          position: "absolute",
          inset: 0,
          backgroundImage: "repeating-linear-gradient(90deg, transparent 0px, transparent 47px, rgba(255,255,255,0.015) 47px, rgba(255,255,255,0.015) 48px)",
          pointerEvents: "none",
        }} />

        {/* Glow radial verde */}
        <div aria-hidden style={{
          position: "absolute",
          top: "12%",
          left: "50%",
          transform: "translateX(-50%)",
          width: "300px",
          height: "300px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(159,232,112,0.06) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />

        {/* Header */}
        <header style={{
          padding: "20px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          position: "relative",
          zIndex: 1,
          flexShrink: 0,
        }}>
          <span style={{
            fontFamily: "var(--font-display)",
            fontWeight: 900,
            fontSize: "16px",
            letterSpacing: "0.08em",
            color: "var(--color-accent)",
            textTransform: "uppercase",
          }}>
            CANELADA
          </span>
          <span style={{
            fontSize: "11px",
            fontWeight: 600,
            letterSpacing: "0.1em",
            color: "var(--color-text-muted)",
            fontFamily: "var(--font-body)",
          }}>
            01 / 01
          </span>
        </header>

        {/* Badge flutuante */}
        <div style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          zIndex: 1,
          minHeight: 0,
        }}>
          <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
            {/* Anéis de pulso — verde */}
            <div aria-hidden style={{
              position: "absolute",
              width: "120px",
              height: "120px",
              borderRadius: "50%",
              border: "1.5px solid rgba(159,232,112,0.22)",
              animation: "pulse-ring 3s ease-in-out infinite",
            }} />
            <div aria-hidden style={{
              position: "absolute",
              width: "152px",
              height: "152px",
              borderRadius: "50%",
              border: "1px solid rgba(159,232,112,0.10)",
              animation: "pulse-ring 3s ease-in-out infinite 0.5s",
            }} />

            {/* Badge — double-bezel (high-end-visual-design) */}
            {/* Outer shell */}
            <div style={{
              width: "108px",
              height: "108px",
              borderRadius: "50%",
              background: "rgba(159,232,112,0.06)",
              boxShadow: "var(--shadow-border), inset 0 1px 1px rgba(255,255,255,0.08)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "6px",
              animation: "float 4s ease-in-out infinite",
            }}>
              {/* Inner core */}
              <div style={{
                width: "100%",
                height: "100%",
                borderRadius: "50%",
                background: "var(--color-surface-2)",
                boxShadow: "inset 0 1px 1px rgba(255,255,255,0.06)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "42px",
              }}>
                ⚽
              </div>
            </div>
          </div>
        </div>

        {/* Bottom content */}
        <div style={{
          flexShrink: 0,
          padding: "0 24px calc(40px + env(safe-area-inset-bottom, 0px))",
          position: "relative",
          zIndex: 1,
        }}>
          {/* Eyebrow (high-end-visual-design) */}
          <div style={{
            display: "inline-flex",
            alignItems: "center",
            marginBottom: "14px",
            padding: "3px 10px",
            borderRadius: "var(--radius-pill)",
            boxShadow: "var(--shadow-border)",
          }}>
            <span style={{
              fontSize: "10px",
              fontWeight: 700,
              letterSpacing: "0.16em",
              color: "var(--color-text-muted)",
              textTransform: "uppercase",
              fontFamily: "var(--font-body)",
            }}>
              Primeiro acesso
            </span>
          </div>

          {/* Hero title — Barlow Condensed, text-wrap: balance via CSS global */}
          <h1 style={{
            fontFamily: "var(--font-display)",
            fontWeight: 900,
            fontSize: "clamp(54px, 14vw, 80px)",
            lineHeight: 0.88,
            letterSpacing: "-0.02em",
            textTransform: "uppercase",
            marginBottom: "16px",
          }}>
            <span style={{ color: "var(--color-text-primary)", display: "block" }}>ENTRA</span>
            <span style={{ color: "var(--color-accent)", display: "block" }}>NO BABA</span>
          </h1>

          <p style={{
            fontSize: "14px",
            color: "var(--color-text-secondary)",
            fontFamily: "var(--font-body)",
            lineHeight: 1.55,
            marginBottom: "24px",
          }}>
            Como o grupo vai te conhecer.
          </p>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>

            {/* Label apelido */}
            <p style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.12em", color: "var(--color-text-muted)", fontFamily: "var(--font-body)", textTransform: "uppercase", marginBottom: 2 }}>
              Apelido
            </p>
            {/* Input apelido */}
            <div style={{
              position: "relative",
              borderRadius: "var(--radius-lg)",
              background: "var(--color-surface-1)",
              boxShadow: "var(--shadow-border)",
              padding: "4px",
              marginBottom: 4,
            }}>
              <input
                className="onboarding-input"
                type="text"
                placeholder="Ex: Arthurzinho"
                value={apelido}
                onChange={(e) => setApelido(e.target.value.slice(0, MAX))}
                autoFocus
                autoComplete="off"
                autoCapitalize="words"
                aria-label="Apelido"
                style={{
                  width: "100%",
                  height: "52px",
                  padding: "0 52px 0 16px",
                  borderRadius: "var(--radius-md)",
                  background: "var(--color-surface-2)",
                  border: "none",
                  color: "var(--color-text-primary)",
                  fontSize: "20px",
                  fontWeight: 600,
                  fontFamily: "var(--font-body)",
                }}
              />
              <span className="tabular" aria-hidden style={{
                position: "absolute", right: "20px", top: "50%", transform: "translateY(-50%)",
                fontSize: "11px", fontWeight: 600, fontFamily: "var(--font-body)",
                color: apelido.length >= MAX ? "var(--color-danger)" : "var(--color-text-muted)",
              }}>
                {apelido.length}/{MAX}
              </span>
            </div>

            {/* Label nome no baba */}
            <p style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.12em", color: "var(--color-text-muted)", fontFamily: "var(--font-body)", textTransform: "uppercase", marginBottom: 2 }}>
              Nome na lista do WhatsApp
            </p>
            <p style={{ fontSize: "12px", color: "var(--color-text-muted)", fontFamily: "var(--font-body)", marginBottom: 4, marginTop: -2 }}>
              Como você aparece quando confirma presença no grupo.
            </p>
            {/* Input nome no baba */}
            <div style={{
              position: "relative",
              borderRadius: "var(--radius-lg)",
              background: "var(--color-surface-1)",
              boxShadow: "var(--shadow-border)",
              padding: "4px",
              marginBottom: 4,
            }}>
              <input
                className="onboarding-input"
                type="text"
                placeholder="Ex: Arthur, Brunão, Galego"
                value={nomeNoBaba}
                onChange={(e) => setNomeNoBaba(e.target.value.slice(0, 30))}
                autoComplete="off"
                autoCapitalize="words"
                aria-label="Nome na lista do WhatsApp"
                style={{
                  width: "100%",
                  height: "52px",
                  padding: "0 52px 0 16px",
                  borderRadius: "var(--radius-md)",
                  background: "var(--color-surface-2)",
                  border: "none",
                  color: "var(--color-text-primary)",
                  fontSize: "20px",
                  fontWeight: 600,
                  fontFamily: "var(--font-body)",
                }}
              />
              <span className="tabular" aria-hidden style={{
                position: "absolute", right: "20px", top: "50%", transform: "translateY(-50%)",
                fontSize: "11px", fontWeight: 600, fontFamily: "var(--font-body)",
                color: nomeNoBaba.length >= 30 ? "var(--color-danger)" : "var(--color-text-muted)",
              }}>
                {nomeNoBaba.length}/30
              </span>
            </div>

            {error && (
              <p role="alert" style={{ fontSize: "13px", color: "var(--color-danger)", fontFamily: "var(--font-body)", paddingLeft: "4px" }}>
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={disabled}
              className="onboarding-btn"
              style={{
                width: "100%",
                height: "52px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "10px",
                background: disabled ? "var(--color-surface-2)" : "var(--color-accent)",
                border: "none",
                borderRadius: "var(--radius-xl)",
                color: disabled ? "var(--color-text-muted)" : "var(--color-on-accent)",
                fontSize: "17px",
                fontWeight: 900,
                fontFamily: "var(--font-display)",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                cursor: disabled ? "not-allowed" : "pointer",
              }}
            >
              {isPending
                ? "ENTRANDO..."
                : <><span>ENTRAR NO GRUPO</span><span aria-hidden style={{ fontSize: "20px", lineHeight: 1 }}>⚽</span></>
              }
            </button>
          </form>
        </div>

      </main>
    </>
  );
}
