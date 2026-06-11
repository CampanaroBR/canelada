"use client";

import { useState, useTransition } from "react";
import { saveApelido } from "./actions";

const MAX = 20;

export function OnboardingForm() {
  const [apelido, setApelido] = useState("");
  const [error, setError] = useState("");
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
    <main style={{
      minHeight: "100dvh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "24px",
      background: "var(--color-bg)",
    }}>
      <div style={{
        width: "100%",
        maxWidth: "360px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "40px",
      }}>
        <div style={{ textAlign: "center" }}>
          <h1 style={{
            fontFamily: "var(--font-display)",
            fontWeight: 900,
            fontSize: "clamp(36px, 9vw, 52px)",
            lineHeight: 1,
            letterSpacing: "-0.02em",
            color: "var(--color-accent)",
            textTransform: "uppercase",
          }}>
            Qual é o seu apelido?
          </h1>
          <p style={{
            marginTop: "10px",
            fontSize: "15px",
            color: "var(--color-text-secondary)",
            fontFamily: "var(--font-body)",
          }}>
            Como você quer ser chamado no grupo.
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{
          width: "100%",
          display: "flex",
          flexDirection: "column",
          gap: "12px",
        }}>
          <div style={{ position: "relative" }}>
            <input
              type="text"
              placeholder="Ex: Arthurzinho"
              value={apelido}
              onChange={(e) => setApelido(e.target.value.slice(0, MAX))}
              autoFocus
              autoComplete="off"
              style={{
                width: "100%",
                height: "56px",
                padding: "0 52px 0 16px",
                background: "var(--color-surface-1)",
                border: `1px solid ${error ? "var(--color-danger)" : "var(--color-border)"}`,
                borderRadius: "var(--radius-md)",
                color: "var(--color-text-primary)",
                fontSize: "18px",
                fontWeight: 500,
                fontFamily: "var(--font-body)",
                outline: "none",
              }}
            />
            <span style={{
              position: "absolute",
              right: "14px",
              top: "50%",
              transform: "translateY(-50%)",
              fontSize: "12px",
              fontFamily: "var(--font-body)",
              color: apelido.length >= MAX
                ? "var(--color-danger)"
                : "var(--color-text-muted)",
            }}>
              {apelido.length}/{MAX}
            </span>
          </div>

          {error && (
            <p style={{
              fontSize: "13px",
              color: "var(--color-danger)",
              fontFamily: "var(--font-body)",
            }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={disabled}
            style={{
              width: "100%",
              height: "52px",
              background: disabled ? "var(--color-surface-2)" : "var(--color-accent)",
              border: "none",
              borderRadius: "var(--radius-md)",
              color: disabled ? "var(--color-text-muted)" : "var(--color-on-accent)",
              fontSize: "16px",
              fontWeight: 700,
              fontFamily: "var(--font-body)",
              cursor: disabled ? "not-allowed" : "pointer",
              transition: "background 0.15s, color 0.15s",
            }}
          >
            {isPending ? "Entrando..." : "Entrar no grupo"}
          </button>
        </form>
      </div>
    </main>
  );
}
