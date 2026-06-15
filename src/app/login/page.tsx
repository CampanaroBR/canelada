"use client";

import { signIn } from "next-auth/react";

export default function LoginPage() {
  return (
    <div style={{
      position: "relative",
      width: "100%", height: "100dvh",
      background: "#0a0f10", overflow: "hidden",
      display: "flex", alignItems: "center", justifyContent: "center",
      paddingTop: 62, paddingBottom: 24,
      paddingLeft: 16, paddingRight: 16,
      boxSizing: "border-box",
    }}>
      {/* Background */}
      <div aria-hidden style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
        <div style={{ position: "absolute", inset: 0, background: "#0a0f10" }} />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img alt="" style={{ position: "absolute", width: "100%", height: "100%", objectFit: "cover" }} src="/login-bg.png" />
      </div>

      {/* Main container — flex-1, centered */}
      <div style={{
        position: "relative",
        flex: 1, minWidth: 0,
        display: "flex", flexDirection: "column",
        alignItems: "center", gap: 22,
      }}>

        {/* Logo area 316×324 */}
        <div style={{ position: "relative", width: 316, height: 324, flexShrink: 0 }}>
          {/* Blur circle */}
          <div aria-hidden style={{
            position: "absolute", left: "50%", top: "50%",
            transform: "translate(-50%, -50%)",
            width: 316, height: 324,
            background: "#2a2a2a", filter: "blur(80.35px)",
            borderRadius: "50%", pointerEvents: "none",
          }} />

          {/* Title: logo + brand + tagline */}
          <div style={{
            position: "absolute", left: 38, top: 48, width: 246,
            display: "flex", flexDirection: "column", alignItems: "center",
          }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              alt="Canelada" src="/logo.png"
              style={{ width: 116, height: 116, objectFit: "contain", marginBottom: -8, display: "block" }}
            />
            <div style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: "center", width: "100%" }}>
              <p style={{
                margin: 0,
                fontFamily: "var(--font-display)", fontWeight: 900,
                fontSize: 28, lineHeight: "36px",
                color: "#fff", textAlign: "center",
                letterSpacing: "-0.5px", whiteSpace: "nowrap",
              }}>
                Canelada
              </p>
              <p style={{
                margin: 0,
                fontFamily: "var(--font-body)", fontWeight: 700,
                fontSize: 18, lineHeight: "22px",
                color: "#6c6c6c", whiteSpace: "nowrap",
              }}>
                Quando o baba vira resenha
              </p>
            </div>
          </div>
        </div>

        {/* Auth section */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8, width: "100%" }}>

          {/* Auth buttons */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12, width: "100%" }}>

            {/* Google */}
            <button
              onClick={() => signIn("google", { callbackUrl: "/feed" })}
              style={{
                width: "100%", height: 56,
                background: "#fff", border: "none",
                borderRadius: 16, cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/google-icon.svg" alt="" aria-hidden width={20} height={20} />
                <span style={{
                  fontFamily: "var(--font-display)", fontWeight: 700,
                  fontSize: 16, lineHeight: "20px",
                  color: "#111", whiteSpace: "nowrap",
                }}>
                  Continuar com Google
                </span>
              </div>
            </button>

            {/* Apple */}
            <button
              onClick={() => signIn("apple", { callbackUrl: "/feed" })}
              style={{
                width: "100%", height: 56,
                background: "#1e1e1e", border: "1px solid #2e2e2e",
                borderRadius: 16, cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/apple-icon.svg" alt="" aria-hidden width={20} height={20} />
                <span style={{
                  fontFamily: "var(--font-display)", fontWeight: 700,
                  fontSize: 16, lineHeight: "20px",
                  color: "#fff", whiteSpace: "nowrap",
                }}>
                  Continuar com Apple
                </span>
              </div>
            </button>

            {/* Phone */}
            <button
              onClick={() => signIn("resend", { callbackUrl: "/feed" })}
              style={{
                width: "100%", height: 56,
                background: "#1e1e1e", border: "1px solid #2e2e2e",
                borderRadius: 16, cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/phone-icon.svg" alt="" aria-hidden width={20} height={20} />
                <span style={{
                  fontFamily: "var(--font-display)", fontWeight: 700,
                  fontSize: 16, lineHeight: "20px",
                  color: "#fff", whiteSpace: "nowrap",
                }}>
                  Entrar com telefone
                </span>
              </div>
            </button>
          </div>

          {/* "ou" divider */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "16px 0" }}>
            <div style={{ flex: 1, height: 1, background: "#2a2a2a" }} />
            <span style={{
              fontFamily: "var(--font-body)", fontWeight: 500,
              fontSize: 12, lineHeight: "18px", color: "#606060",
            }}>ou</span>
            <div style={{ flex: 1, height: 1, background: "#2a2a2a" }} />
          </div>

          {/* Invite card */}
          <div style={{
            background: "#1a1a1a", border: "1px solid #2a2a2a",
            borderRadius: 16, padding: 17,
            display: "flex", flexDirection: "column", gap: 4,
          }}>
            <p style={{
              margin: 0,
              fontFamily: "var(--font-display)", fontWeight: 700,
              fontSize: 16, lineHeight: "19.5px",
              color: "#9fe870", whiteSpace: "nowrap",
            }}>
              ⚽ Novo no App do Baba?
            </p>
            <p style={{
              margin: 0, paddingTop: 4,
              fontFamily: "var(--font-body)", fontWeight: 400,
              fontSize: 14, lineHeight: "18px", color: "#666",
            }}>
              Peça ao administrador da sua liga um link de convite. Só é possível entrar por convite.
            </p>
          </div>

          {/* Terms */}
          <div style={{ paddingTop: 24, display: "flex", justifyContent: "center" }}>
            <p style={{
              margin: 0,
              fontFamily: "var(--font-body)", fontWeight: 400,
              fontSize: 11, lineHeight: "16px",
              color: "#666", textAlign: "center",
            }}>
              Ao continuar você aceita os{" "}
              <strong style={{ fontWeight: 700, color: "#666" }}>Termos de Uso</strong>
              {" "}e a{" "}
              <strong style={{ fontWeight: 700, color: "#666" }}>Política de Privacidade</strong>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
