"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";

export default function LoginPage() {
  const [showEmail, setShowEmail] = useState(false);
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleGoogle() {
    await signIn("google", { callbackUrl: "/feed" });
  }

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    await signIn("resend", { email, callbackUrl: "/feed", redirect: false });
    setSent(true);
    setLoading(false);
  }

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
            fontSize: "clamp(56px, 14vw, 72px)",
            lineHeight: 0.9,
            letterSpacing: "-0.02em",
            color: "var(--color-accent)",
            textTransform: "uppercase",
          }}>
            CANELADA
          </h1>
          <p style={{
            marginTop: "10px",
            fontFamily: "var(--font-body)",
            fontSize: "15px",
            color: "var(--color-text-secondary)",
            letterSpacing: "0.01em",
          }}>
            O baba virou resenha.
          </p>
        </div>

        <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "12px" }}>
          <button
            onClick={handleGoogle}
            style={{
              width: "100%",
              height: "48px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "10px",
              background: "var(--color-surface-1)",
              border: "1px solid var(--color-border)",
              borderRadius: "var(--radius-md)",
              color: "var(--color-text-primary)",
              fontSize: "15px",
              fontWeight: 500,
              fontFamily: "var(--font-body)",
              cursor: "pointer",
            }}
          >
            <GoogleIcon />
            Entrar com Google
          </button>

          {!showEmail && !sent && (
            <button
              onClick={() => setShowEmail(true)}
              style={{
                width: "100%",
                height: "48px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "10px",
                background: "transparent",
                border: "1px solid var(--color-border-muted)",
                borderRadius: "var(--radius-md)",
                color: "var(--color-text-secondary)",
                fontSize: "15px",
                fontWeight: 500,
                fontFamily: "var(--font-body)",
                cursor: "pointer",
              }}
            >
              Entrar com email
            </button>
          )}

          {showEmail && !sent && (
            <form onSubmit={handleMagicLink} style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <input
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoFocus
                required
                style={{
                  width: "100%",
                  height: "48px",
                  padding: "0 16px",
                  background: "var(--color-surface-1)",
                  border: "1px solid var(--color-border)",
                  borderRadius: "var(--radius-md)",
                  color: "var(--color-text-primary)",
                  fontSize: "15px",
                  fontFamily: "var(--font-body)",
                  outline: "none",
                }}
              />
              <button
                type="submit"
                disabled={loading}
                style={{
                  width: "100%",
                  height: "48px",
                  background: "var(--color-accent)",
                  border: "none",
                  borderRadius: "var(--radius-md)",
                  color: "var(--color-on-accent)",
                  fontSize: "15px",
                  fontWeight: 600,
                  fontFamily: "var(--font-body)",
                  cursor: loading ? "not-allowed" : "pointer",
                  opacity: loading ? 0.7 : 1,
                }}
              >
                {loading ? "Enviando..." : "Enviar link de acesso"}
              </button>
            </form>
          )}

          {sent && (
            <div style={{
              padding: "16px",
              background: "var(--color-accent-muted)",
              border: "1px solid rgba(181,255,77,0.2)",
              borderRadius: "var(--radius-md)",
              color: "var(--color-accent)",
              fontSize: "14px",
              textAlign: "center",
              lineHeight: 1.5,
            }}>
              Link enviado para <strong>{email}</strong>.<br />
              Confere sua caixa de entrada.
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
      <path d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z" fill="#FBBC05"/>
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.961L3.964 7.293C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
    </svg>
  );
}
