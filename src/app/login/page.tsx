"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";

export default function LoginPage() {
  const [showEmail, setShowEmail] = useState(false);
  const [email, setEmail]         = useState("");
  const [sent, setSent]           = useState(false);
  const [loading, setLoading]     = useState(false);

  async function handleGoogle() {
    await signIn("google", { callbackUrl: "/api/auth/post-login" });
  }

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    await signIn("resend", { email, callbackUrl: "/api/auth/post-login", redirect: false });
    setSent(true);
    setLoading(false);
  }

  return (
    <>
      <style>{`
        @keyframes stripe-drift {
          from { transform: translateX(0);    }
          to   { transform: translateX(48px); }
        }

        /* Scale on press (make-interfaces-feel-better) — sempre 0.96, nunca abaixo de 0.95 */
        .btn-press {
          transition-property: transform, box-shadow;
          transition-duration: 150ms;
          transition-timing-function: cubic-bezier(0.23, 1, 0.32, 1);
        }
        .btn-press:active { transform: scale(0.96); }

        .login-input:focus {
          outline: none;
          box-shadow: 0 0 0 1px rgba(159,232,112,0.5), 0 0 0 3px rgba(159,232,112,0.12);
        }
      `}</style>

      <main style={{
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        background: "var(--color-bg)",
      }}>

        {/* ── HERO — bloco accent ── */}
        <div style={{
          flex: "0 0 56%",
          position: "relative",
          background: "var(--color-accent)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
        }}>
          {/* Stripe texture animada (keyframe one-shot → loop decorativo) */}
          <div aria-hidden style={{
            position: "absolute",
            inset: "-40px",
            backgroundImage: "repeating-linear-gradient(90deg, transparent 0px, transparent 46px, rgba(0,0,0,0.07) 46px, rgba(0,0,0,0.07) 48px)",
            animation: "stripe-drift 10s linear infinite",
            pointerEvents: "none",
          }} />

          {/* Vinheta radial */}
          <div aria-hidden style={{
            position: "absolute",
            inset: 0,
            background: "radial-gradient(ellipse at center, transparent 45%, rgba(0,0,0,0.20) 100%)",
            pointerEvents: "none",
          }} />

          {/* Notch em V na base — transição para dark */}
          <div aria-hidden style={{
            position: "absolute",
            bottom: -1,
            left: 0,
            right: 0,
            height: "32px",
            background: "var(--color-bg)",
            clipPath: "polygon(0 100%, 100% 100%, 100% 0, 50% 100%, 0 0)",
            pointerEvents: "none",
          }} />

          {/* Brand */}
          <div style={{
            position: "relative",
            zIndex: 1,
            textAlign: "center",
            padding: "0 24px",
          }}>
            {/* Eyebrow tag (high-end-visual-design) */}
            <div style={{
              display: "inline-flex",
              alignItems: "center",
              marginBottom: "16px",
              padding: "4px 12px",
              borderRadius: "var(--radius-pill)",
              background: "rgba(22,51,0,0.18)",
              border: "1px solid rgba(22,51,0,0.25)",
            }}>
              <span style={{
                fontSize: "10px",
                fontWeight: 700,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: "var(--color-on-accent)",
                fontFamily: "var(--font-body)",
                opacity: 0.7,
              }}>
                Grupo fechado
              </span>
            </div>

            {/* Logo — Barlow Condensed 900, filling the space */}
            <div style={{
              fontFamily: "var(--font-display)",
              fontWeight: 900,
              fontSize: "clamp(72px, 22vw, 112px)",
              lineHeight: 0.86,
              letterSpacing: "-0.01em",
              color: "var(--color-on-accent)",
              textTransform: "uppercase",
              userSelect: "none",
            }}>
              CANE<br />LADA
            </div>

            <p style={{
              marginTop: "18px",
              fontFamily: "var(--font-body)",
              fontSize: "13px",
              fontWeight: 500,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "rgba(22,51,0,0.55)",
            }}>
              O baba virou resenha.
            </p>
          </div>
        </div>

        {/* ── FORM — dark ── */}
        <div style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "32px 28px calc(32px + env(safe-area-inset-bottom, 0px))",
          gap: "10px",
        }}>

          {!sent && (
            <>
              {/* Google — CTA principal: branco sólido, máximo contraste */}
              <button
                className="btn-press"
                onClick={handleGoogle}
                aria-label="Entrar com Google"
                style={{
                  width: "100%",
                  height: "52px",        /* CTA: min 52px (frontend-design.md) */
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "10px",
                  background: "#FFFFFF",
                  border: "none",
                  borderRadius: "var(--radius-xl)",  /* pill-ish: 20px */
                  color: "#1A1A1A",
                  fontSize: "15px",
                  fontWeight: 700,
                  fontFamily: "var(--font-body)",
                  letterSpacing: "0.01em",
                  cursor: "pointer",
                  /* Shadow-as-border (surfaces.md) */
                  boxShadow: "0 0 0 1px rgba(0,0,0,0.06), 0 2px 12px rgba(0,0,0,0.45)",
                }}
              >
                <GoogleIcon />
                Entrar com Google
              </button>

              {!showEmail && (
                <button
                  className="btn-press"
                  onClick={() => setShowEmail(true)}
                  aria-label="Entrar com email"
                  style={{
                    width: "100%",
                    height: "52px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "10px",
                    background: "transparent",
                    /* Shadow-as-border dark (surfaces.md) */
                    boxShadow: "var(--shadow-border)",
                    border: "none",
                    borderRadius: "var(--radius-xl)",
                    color: "var(--color-text-secondary)",
                    fontSize: "15px",
                    fontWeight: 600,
                    fontFamily: "var(--font-body)",
                    cursor: "pointer",
                  }}
                >
                  Entrar com email
                </button>
              )}

              {showEmail && (
                <form onSubmit={handleMagicLink} style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <input
                    className="login-input"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoFocus
                    required
                    style={{
                      width: "100%",
                      height: "52px",
                      padding: "0 18px",
                      background: "var(--color-surface-1)",
                      /* Shadow-as-border dark (surfaces.md) */
                      boxShadow: "var(--shadow-border)",
                      border: "none",
                      borderRadius: "var(--radius-xl)",
                      color: "var(--color-text-primary)",
                      fontSize: "16px",
                      fontFamily: "var(--font-body)",
                      /* Concentric: input dentro do container; sem nested aqui */
                    }}
                  />
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-press"
                    style={{
                      width: "100%",
                      height: "52px",
                      background: loading ? "var(--color-surface-2)" : "var(--color-accent)",
                      border: "none",
                      borderRadius: "var(--radius-xl)",
                      color: loading ? "var(--color-text-muted)" : "var(--color-on-accent)",
                      fontSize: "14px",
                      fontWeight: 800,
                      fontFamily: "var(--font-display)",
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      cursor: loading ? "not-allowed" : "pointer",
                      opacity: loading ? 0.6 : 1,
                    }}
                  >
                    {loading ? "Enviando..." : "Enviar link de acesso"}
                  </button>
                </form>
              )}
            </>
          )}

          {sent && (
            <div style={{
              padding: "20px",
              background: "var(--color-surface-1)",
              /* Shadow-as-border com accent (surfaces.md) */
              boxShadow: "0 0 0 1px rgba(159,232,112,0.2)",
              border: "none",
              borderRadius: "var(--radius-lg)",
              lineHeight: 1.6,
            }}>
              <p style={{
                fontWeight: 700,
                marginBottom: "4px",
                color: "var(--color-accent)",
                fontFamily: "var(--font-body)",
                fontSize: "14px",
              }}>
                Link enviado.
              </p>
              <p style={{ fontSize: "14px", color: "var(--color-text-secondary)", fontFamily: "var(--font-body)" }}>
                Confere a caixa de entrada de <strong style={{ color: "var(--color-text-primary)" }}>{email}</strong>.
              </p>
            </div>
          )}

          <p style={{
            textAlign: "center",
            fontSize: "11px",
            fontWeight: 500,
            letterSpacing: "0.04em",
            color: "var(--color-text-muted)",
            fontFamily: "var(--font-body)",
            marginTop: "6px",
          }}>
            Acesso restrito ao grupo do condomínio
          </p>
        </div>

      </main>
    </>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
      <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
      <path d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z" fill="#FBBC05"/>
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.961L3.964 7.293C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
    </svg>
  );
}
