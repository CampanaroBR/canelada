"use client";

import { useState, useTransition } from "react";
import { saveApelido } from "./actions";

const MAX = 20;

export function OnboardingForm() {
  const [apelido, setApelido] = useState("");
  const [error, setError] = useState("");
  const [focused, setFocused] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!apelido.trim()) return;
    setError("");
    startTransition(async () => {
      const result = await saveApelido(apelido);
      if (result?.error) setError(result.error);
    });
  }

  const disabled = isPending || !apelido.trim();

  return (
    <>
      <style>{`
        @keyframes pulse-ring {
          0%   { transform: scale(1);   opacity: 0.5; }
          50%  { transform: scale(1.08); opacity: 0.2; }
          100% { transform: scale(1);   opacity: 0.5; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-8px); }
        }
        .onboarding-input:focus {
          border-color: var(--color-accent) !important;
          box-shadow: 0 0 0 3px rgba(181,255,77,0.12);
        }
        .onboarding-btn:not(:disabled):hover {
          background: var(--color-accent-hover) !important;
        }
        .onboarding-btn:not(:disabled):active {
          transform: scale(0.98);
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

        {/* Vertical stripe texture */}
        <div aria-hidden style={{
          position: "absolute",
          inset: 0,
          backgroundImage: "repeating-linear-gradient(90deg, transparent 0px, transparent 48px, rgba(255,255,255,0.018) 48px, rgba(255,255,255,0.018) 49px)",
          pointerEvents: "none",
        }} />

        {/* Accent glow behind badge */}
        <div aria-hidden style={{
          position: "absolute",
          top: "15%",
          left: "50%",
          transform: "translateX(-50%)",
          width: "280px",
          height: "280px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(181,255,77,0.07) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />

        {/* Top bar */}
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

        {/* Badge area */}
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
            {/* Pulse ring */}
            <div aria-hidden style={{
              position: "absolute",
              width: "120px",
              height: "120px",
              borderRadius: "50%",
              border: "1.5px solid rgba(181,255,77,0.25)",
              animation: "pulse-ring 3s ease-in-out infinite",
            }} />
            <div aria-hidden style={{
              position: "absolute",
              width: "148px",
              height: "148px",
              borderRadius: "50%",
              border: "1px solid rgba(181,255,77,0.1)",
              animation: "pulse-ring 3s ease-in-out infinite 0.4s",
            }} />
            {/* Badge circle */}
            <div style={{
              width: "96px",
              height: "96px",
              borderRadius: "50%",
              background: "var(--color-surface-2)",
              border: "1.5px solid var(--color-border)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "44px",
              animation: "float 4s ease-in-out infinite",
              boxShadow: "0 8px 32px rgba(0,0,0,0.6), 0 0 0 1px rgba(181,255,77,0.08)",
            }}>
              ⚽
            </div>
          </div>
        </div>

        {/* Bottom content */}
        <div style={{
          flexShrink: 0,
          padding: "0 24px 40px",
          position: "relative",
          zIndex: 1,
        }}>
          {/* Eyebrow */}
          <p style={{
            fontSize: "11px",
            fontWeight: 700,
            letterSpacing: "0.16em",
            color: "var(--color-text-muted)",
            textTransform: "uppercase",
            fontFamily: "var(--font-body)",
            marginBottom: "12px",
          }}>
            PRIMEIRO ACESSO
          </p>

          {/* Hero title */}
          <h1 style={{
            fontFamily: "var(--font-display)",
            fontWeight: 900,
            fontSize: "clamp(68px, 18vw, 88px)",
            lineHeight: 0.88,
            letterSpacing: "-0.02em",
            textTransform: "uppercase",
            marginBottom: "16px",
          }}>
            <span style={{ color: "var(--color-text-primary)", display: "block" }}>SEU</span>
            <span style={{ color: "var(--color-accent)", display: "block" }}>APELIDO</span>
            <span style={{ color: "var(--color-text-muted)", fontSize: "0.6em" }}>.</span>
          </h1>

          <p style={{
            fontSize: "14px",
            color: "var(--color-text-secondary)",
            fontFamily: "var(--font-body)",
            lineHeight: 1.5,
            marginBottom: "28px",
          }}>
            Como o grupo vai te chamar pra sempre.
          </p>

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <div style={{ position: "relative" }}>
              <input
                className="onboarding-input"
                type="text"
                placeholder="Ex: Arthurzinho"
                value={apelido}
                onChange={(e) => setApelido(e.target.value.slice(0, MAX))}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                autoFocus
                autoComplete="off"
                autoCapitalize="words"
                style={{
                  width: "100%",
                  height: "60px",
                  padding: "0 56px 0 20px",
                  background: "var(--color-surface-1)",
                  border: `1.5px solid ${error ? "var(--color-danger)" : focused ? "var(--color-accent)" : "var(--color-border)"}`,
                  borderRadius: "var(--radius-md)",
                  color: "var(--color-text-primary)",
                  fontSize: "20px",
                  fontWeight: 600,
                  fontFamily: "var(--font-body)",
                  outline: "none",
                  transition: "border-color 0.15s, box-shadow 0.15s",
                  boxShadow: focused && !error ? "0 0 0 3px rgba(181,255,77,0.12)" : "none",
                }}
              />
              <span style={{
                position: "absolute",
                right: "16px",
                top: "50%",
                transform: "translateY(-50%)",
                fontSize: "11px",
                fontWeight: 600,
                letterSpacing: "0.04em",
                fontFamily: "var(--font-body)",
                color: apelido.length >= MAX ? "var(--color-danger)" : "var(--color-text-muted)",
              }}>
                {apelido.length}/{MAX}
              </span>
            </div>

            {error && (
              <p style={{
                fontSize: "13px",
                color: "var(--color-danger)",
                fontFamily: "var(--font-body)",
                letterSpacing: "0.01em",
              }}>
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={disabled}
              className="onboarding-btn"
              style={{
                width: "100%",
                height: "60px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "10px",
                background: disabled ? "var(--color-surface-2)" : "var(--color-accent)",
                border: "none",
                borderRadius: "var(--radius-md)",
                color: disabled ? "var(--color-text-muted)" : "var(--color-on-accent)",
                fontSize: "17px",
                fontWeight: 900,
                fontFamily: "var(--font-display)",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                cursor: disabled ? "not-allowed" : "pointer",
                transition: "background 0.15s, color 0.15s, transform 0.1s",
              }}
            >
              {isPending
                ? "ENTRANDO..."
                : <><span>ENTRAR NO GRUPO</span><span style={{ fontSize: "22px", lineHeight: 1 }}>⚽</span></>
              }
            </button>
          </form>
        </div>

      </main>
    </>
  );
}
