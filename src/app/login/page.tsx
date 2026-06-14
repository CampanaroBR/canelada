"use client";

import { signIn } from "next-auth/react";

const ASSETS = {
  bg:     "http://localhost:3845/assets/d587fe7c24ceb24c8d6ecc467f3f8a203987b753.png",
  logo:   "http://localhost:3845/assets/31c46a81e6d70b0dc33ca60496ecfa043e761f1c.png",
  google: "http://localhost:3845/assets/e6026b325b204e0310f53c70753007bf197e776a.svg",
  apple:  "http://localhost:3845/assets/79e06fa7512f018f36aa91d5bde850cc5a2ffa69.svg",
  phone:  "http://localhost:3845/assets/ccd31afc9916b6faaedcfa108579f4769d5459c9.svg",
};

export default function LoginPage() {
  return (
    <>
      <style>{`
        .auth-btn { transition: transform 120ms cubic-bezier(.23,1,.32,1), opacity 120ms; -webkit-tap-highlight-color: transparent; cursor: pointer; }
        .auth-btn:active { transform: scale(0.97); opacity: 0.85; }
      `}</style>

      <main style={{ position: "relative", width: "100%", minHeight: "100dvh", background: "#0a0f10", overflow: "hidden" }}>

        {/* Background stripe image */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img alt="" aria-hidden src={ASSETS.bg} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", pointerEvents: "none" }} />

        {/* Blur glow */}
        <div aria-hidden style={{ position: "absolute", left: "calc(50% - 158px)", top: "calc(50% - 202px)", width: 316, height: 324, background: "#2a2a2a", filter: "blur(80px)", borderRadius: "50%", pointerEvents: "none" }} />

        {/* Title section */}
        <div style={{ position: "absolute", left: "50%", transform: "translateX(-50%)", top: 110, width: 246, display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div style={{ width: 116, height: 116, marginBottom: -8, overflow: "hidden", position: "relative" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img alt="Canelada" src={ASSETS.logo} style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: "center" }}>
            <p style={{ margin: 0, fontFamily: "var(--font-display)", fontWeight: 900, fontSize: 28, lineHeight: "36px", color: "#fff", textAlign: "center", letterSpacing: "-0.5px" }}>
              Canelada
            </p>
            <p style={{ margin: 0, fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 18, lineHeight: "22px", color: "#6c6c6c", textAlign: "center", whiteSpace: "nowrap" }}>
              Quando o baba vira resenha
            </p>
          </div>
        </div>

        {/* Auth section */}
        <div style={{ position: "absolute", left: 24, top: 408, width: 345, display: "flex", flexDirection: "column", gap: 8 }}>

          {/* Buttons */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>

            {/* Google */}
            <button
              className="auth-btn"
              onClick={() => signIn("google", { callbackUrl: "/api/auth/post-login" })}
              style={{ width: "100%", height: 56, background: "#fff", border: "none", borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", gap: 12, padding: "16px 79px" }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img alt="" src={ASSETS.google} style={{ width: 20, height: 20, flexShrink: 0 }} />
              <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16, color: "#111", whiteSpace: "nowrap" }}>Continuar com Google</span>
            </button>

            {/* Apple */}
            <button
              className="auth-btn"
              onClick={() => signIn("apple", { callbackUrl: "/api/auth/post-login" }).catch(() => null)}
              style={{ width: "100%", height: 56, background: "#1e1e1e", border: "1px solid #2e2e2e", borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "18px 88px" }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img alt="" src={ASSETS.apple} style={{ width: 20, height: 20, flexShrink: 0 }} />
              <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16, color: "#fff", whiteSpace: "nowrap" }}>Continuar com Apple</span>
            </button>

            {/* Phone */}
            <button
              className="auth-btn"
              onClick={() => alert("Em breve!")}
              style={{ width: "100%", height: 56, background: "#1e1e1e", border: "1px solid #2e2e2e", borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "19px 92px" }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img alt="" src={ASSETS.phone} style={{ width: 20, height: 20, flexShrink: 0 }} />
              <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16, color: "#fff", whiteSpace: "nowrap" }}>Entrar com telefone</span>
            </button>
          </div>

          {/* Divider */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "16px 0" }}>
            <div style={{ flex: 1, height: 1, background: "#2a2a2a" }} />
            <span style={{ fontFamily: "var(--font-body)", fontWeight: 500, fontSize: 12, color: "#606060" }}>ou</span>
            <div style={{ flex: 1, height: 1, background: "#2a2a2a" }} />
          </div>

          {/* Invite card */}
          <div style={{ background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: 16, padding: 17, display: "flex", flexDirection: "column", gap: 4 }}>
            <p style={{ margin: 0, fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16, lineHeight: "19.5px", color: "#9fe870", whiteSpace: "nowrap" }}>
              ⚽ Novo no App do Baba?
            </p>
            <p style={{ margin: 0, fontFamily: "var(--font-body)", fontWeight: 400, fontSize: 14, lineHeight: "18px", color: "#666", width: 311 }}>
              Peça ao administrador da sua liga um link de convite. Só é possível entrar por convite.
            </p>
          </div>

          {/* Terms */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 24, height: 56 }}>
            <p style={{ margin: 0, fontFamily: "var(--font-body)", fontWeight: 400, fontSize: 11, lineHeight: "16px", color: "#666", textAlign: "center", width: 345 }}>
              Ao continuar você aceita os{" "}
              <strong style={{ fontWeight: 700 }}>Termos de Uso</strong>
              {" "}e a{" "}
              <strong style={{ fontWeight: 700 }}>Política de Privacidade</strong>
            </p>
          </div>
        </div>
      </main>
    </>
  );
}
