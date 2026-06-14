"use client";

import { signIn } from "next-auth/react";

const IMG = {
  bg:     "http://localhost:3845/assets/d587fe7c24ceb24c8d6ecc467f3f8a203987b753.png",
  logo:   "http://localhost:3845/assets/31c46a81e6d70b0dc33ca60496ecfa043e761f1c.png",
  google: "http://localhost:3845/assets/e6026b325b204e0310f53c70753007bf197e776a.svg",
  apple:  "http://localhost:3845/assets/79e06fa7512f018f36aa91d5bde850cc5a2ffa69.svg",
  phone:  "http://localhost:3845/assets/ccd31afc9916b6faaedcfa108579f4769d5459c9.svg",
};

export default function LoginPage() {
  return (
    <div style={{ position: "relative", width: "100%", height: "100dvh", background: "#0a0f10", overflow: "hidden" }}>

      {/* Background image */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img alt="" aria-hidden src={IMG.bg} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", pointerEvents: "none" }} />

      {/* Center glow blur */}
      <div aria-hidden style={{
        position: "absolute",
        left: "calc(50% - 3.5px)",
        top: "calc(50% - 202px)",
        transform: "translate(-50%, -50%)",
        width: 316,
        height: 324,
        background: "#2a2a2a",
        filter: "blur(80.35px)",
        borderRadius: "50%",
        pointerEvents: "none",
      }} />

      {/* Title: Logo + Brand + Tagline */}
      <div style={{
        position: "absolute",
        left: 73,
        top: 110,
        width: 246,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img alt="Canelada" src={IMG.logo} style={{ width: 116, height: 116, objectFit: "contain", marginBottom: -8 }} />
        <div style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: "center", width: "100%" }}>
          <p style={{ margin: 0, fontFamily: "var(--font-display)", fontWeight: 900, fontSize: 28, lineHeight: "36px", color: "#fff", textAlign: "center", letterSpacing: "-0.5px" }}>
            Canelada
          </p>
          <p style={{ margin: 0, fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 18, lineHeight: "22px", color: "#6c6c6c", whiteSpace: "nowrap" }}>
            Quando o baba vira resenha
          </p>
        </div>
      </div>

      {/* Auth Section */}
      <div style={{ position: "absolute", left: 24, top: 408, width: 345, display: "flex", flexDirection: "column", gap: 8 }}>

        {/* Buttons group */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {/* Google */}
          <button
            onClick={() => signIn("google", { callbackUrl: "/feed" })}
            style={{
              width: "100%", height: 56, background: "#fff", border: "none",
              borderRadius: 16, cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img alt="" src={IMG.google} style={{ width: 20, height: 20 }} />
              <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16, lineHeight: "20px", color: "#111", whiteSpace: "nowrap" }}>
                Continuar com Google
              </span>
            </div>
          </button>

          {/* Apple */}
          <button
            onClick={() => signIn("apple", { callbackUrl: "/feed" })}
            style={{
              width: "100%", height: 56, background: "#1e1e1e",
              border: "1px solid #2e2e2e", borderRadius: 16, cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img alt="" src={IMG.apple} style={{ width: 20, height: 20 }} />
              <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16, lineHeight: "20px", color: "#fff", whiteSpace: "nowrap" }}>
                Continuar com Apple
              </span>
            </div>
          </button>

          {/* Phone */}
          <button
            onClick={() => signIn("resend", { callbackUrl: "/feed" })}
            style={{
              width: "100%", height: 56, background: "#1e1e1e",
              border: "1px solid #2e2e2e", borderRadius: 16, cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img alt="" src={IMG.phone} style={{ width: 20, height: 20 }} />
              <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16, lineHeight: "20px", color: "#fff", whiteSpace: "nowrap" }}>
                Entrar com telefone
              </span>
            </div>
          </button>
        </div>

        {/* "ou" divider */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "16px 0" }}>
          <div style={{ flex: 1, height: 1, background: "#2a2a2a" }} />
          <span style={{ fontFamily: "var(--font-body)", fontWeight: 500, fontSize: 12, lineHeight: "18px", color: "#606060" }}>ou</span>
          <div style={{ flex: 1, height: 1, background: "#2a2a2a" }} />
        </div>

        {/* Invite card */}
        <div style={{
          background: "#1a1a1a", border: "1px solid #2a2a2a",
          borderRadius: 16, padding: 17,
          display: "flex", flexDirection: "column", gap: 4,
        }}>
          <p style={{ margin: 0, fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16, lineHeight: "19.5px", color: "#9fe870" }}>
            ⚽ Novo no App do Baba?
          </p>
          <p style={{ margin: 0, marginTop: 4, fontFamily: "var(--font-body)", fontWeight: 400, fontSize: 14, lineHeight: "18px", color: "#666" }}>
            Peça ao administrador da sua liga um link de convite. Só é possível entrar por convite.
          </p>
        </div>

        {/* Terms */}
        <div style={{ paddingTop: 24, display: "flex", justifyContent: "center" }}>
          <p style={{ margin: 0, fontFamily: "var(--font-body)", fontWeight: 400, fontSize: 11, lineHeight: "16px", color: "#666", textAlign: "center" }}>
            Ao continuar você aceita os{" "}
            <strong style={{ fontWeight: 700, color: "#666" }}>Termos de Uso</strong>
            {" "}e a{" "}
            <strong style={{ fontWeight: 700, color: "#666" }}>Política de Privacidade</strong>
          </p>
        </div>
      </div>
    </div>
  );
}
