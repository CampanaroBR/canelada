"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import Image from "next/image";

export default function LoginPage() {
  const [sent, setSent]       = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleGoogle() {
    await signIn("google", { callbackUrl: "/api/auth/post-login" });
  }

  async function handlePhone() {
    // placeholder — futuramente magic link por telefone
    alert("Em breve disponível!");
  }

  return (
    <>
      <style>{`
        .btn-press {
          transition: transform 150ms cubic-bezier(0.23,1,0.32,1), box-shadow 150ms;
          -webkit-tap-highlight-color: transparent;
        }
        .btn-press:active { transform: scale(0.96); }
      `}</style>

      <main style={{
        minHeight: "100dvh",
        background: "#0a0f10",
        position: "relative",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}>
        {/* Stripe background — 3 listras verticais como no Figma */}
        <div aria-hidden style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          justifyContent: "center",
          gap: "28px",
          pointerEvents: "none",
          zIndex: 0,
        }}>
          {[0,1,2].map(i => (
            <div key={i} style={{
              width: "36px",
              height: "100%",
              background: "linear-gradient(180deg, transparent 0%, rgba(60,60,60,0.18) 30%, rgba(60,60,60,0.22) 60%, transparent 100%)",
            }} />
          ))}
        </div>

        {/* Blur glow center */}
        <div aria-hidden style={{
          position: "absolute",
          left: "50%",
          top: "30%",
          transform: "translate(-50%,-50%)",
          width: "316px",
          height: "324px",
          background: "#2a2a2a",
          filter: "blur(80px)",
          opacity: 0.7,
          borderRadius: "50%",
          pointerEvents: "none",
          zIndex: 0,
        }} />

        {/* Logo + Brand name — centro superior */}
        <div style={{
          position: "relative",
          zIndex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          paddingTop: "110px",
          gap: "6px",
        }}>
          {/* Logo image */}
          <div style={{ width: 116, height: 116, position: "relative", marginBottom: "-8px" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="http://localhost:3845/assets/31c46a81e6d70b0dc33ca60496ecfa043e761f1c.png"
              alt="Canelada logo"
              style={{ width: "100%", height: "100%", objectFit: "contain" }}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
            <p style={{
              fontFamily: "var(--font-display)",
              fontWeight: 900,
              fontSize: "28px",
              lineHeight: "36px",
              letterSpacing: "-0.5px",
              color: "#ffffff",
              textAlign: "center",
              margin: 0,
            }}>
              Canelada
            </p>
            <p style={{
              fontFamily: "var(--font-body)",
              fontWeight: 700,
              fontSize: "18px",
              lineHeight: "22px",
              color: "#6c6c6c",
              textAlign: "center",
              margin: 0,
            }}>
              Quando o baba vira resenha
            </p>
          </div>
        </div>

        {/* Auth section */}
        <div style={{
          position: "relative",
          zIndex: 1,
          marginTop: "auto",
          padding: "0 24px calc(32px + env(safe-area-inset-bottom, 0px))",
          display: "flex",
          flexDirection: "column",
          gap: "8px",
        }}>

          {/* Google — branco sólido, CTA principal */}
          <button
            className="btn-press"
            onClick={handleGoogle}
            style={{
              width: "100%",
              height: "56px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "12px",
              background: "#ffffff",
              border: "none",
              borderRadius: "16px",
              color: "#111",
              fontSize: "16px",
              fontWeight: 700,
              fontFamily: "var(--font-display)",
              cursor: "pointer",
            }}
          >
            <GoogleIcon />
            Continuar com Google
          </button>

          {/* Apple */}
          <button
            className="btn-press"
            onClick={() => signIn("apple", { callbackUrl: "/api/auth/post-login" }).catch(() => null)}
            style={{
              width: "100%",
              height: "56px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              background: "#1e1e1e",
              border: "1px solid #2e2e2e",
              borderRadius: "16px",
              color: "#ffffff",
              fontSize: "16px",
              fontWeight: 700,
              fontFamily: "var(--font-display)",
              cursor: "pointer",
            }}
          >
            <AppleIcon />
            Continuar com Apple
          </button>

          {/* Phone */}
          <button
            className="btn-press"
            onClick={handlePhone}
            style={{
              width: "100%",
              height: "56px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              background: "#1e1e1e",
              border: "1px solid #2e2e2e",
              borderRadius: "16px",
              color: "#ffffff",
              fontSize: "16px",
              fontWeight: 700,
              fontFamily: "var(--font-display)",
              cursor: "pointer",
            }}
          >
            <PhoneIcon />
            Entrar com telefone
          </button>

          {/* Divider */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "16px 0" }}>
            <div style={{ flex: 1, height: "1px", background: "#2a2a2a" }} />
            <p style={{ fontFamily: "var(--font-body)", fontSize: "12px", fontWeight: 500, color: "#606060", margin: 0 }}>ou</p>
            <div style={{ flex: 1, height: "1px", background: "#2a2a2a" }} />
          </div>

          {/* Novo usuário — card informativo */}
          <div style={{
            background: "#1a1a1a",
            border: "1px solid #2a2a2a",
            borderRadius: "16px",
            padding: "17px",
            display: "flex",
            flexDirection: "column",
            gap: "4px",
          }}>
            <p style={{
              fontFamily: "var(--font-display)",
              fontWeight: 700,
              fontSize: "16px",
              lineHeight: "19.5px",
              color: "var(--color-accent)",
              margin: 0,
            }}>
              ⚽ Novo no App do Baba?
            </p>
            <p style={{
              fontFamily: "var(--font-body)",
              fontWeight: 400,
              fontSize: "14px",
              lineHeight: "18px",
              color: "#666",
              margin: 0,
            }}>
              Peça ao administrador da sua liga um link de convite. Só é possível entrar por convite.
            </p>
          </div>

          {/* Terms */}
          <p style={{
            textAlign: "center",
            fontSize: "11px",
            lineHeight: "16px",
            color: "#666",
            fontFamily: "var(--font-body)",
            margin: "8px 0 0",
          }}>
            Ao continuar você aceita os{" "}
            <strong style={{ fontWeight: 700 }}>Termos de Uso</strong>
            {" "}e a{" "}
            <strong style={{ fontWeight: 700 }}>Política de Privacidade</strong>
          </p>
        </div>
      </main>
    </>
  );
}

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 18 18" fill="none" aria-hidden>
      <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
      <path d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z" fill="#FBBC05"/>
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.961L3.964 7.293C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="white" aria-hidden>
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.8 19.79 19.79 0 01.0 1.18 2 2 0 012 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 7.91a16 16 0 006.59 6.59l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/>
    </svg>
  );
}
