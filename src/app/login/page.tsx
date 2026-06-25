"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { signIn } from "next-auth/react";

export default function LoginPage() {
  // mostra cada botão só se o provider correspondente estiver ativo (depende das envs na Vercel)
  const [hasGoogle, setHasGoogle] = useState(true);
  const [hasResend, setHasResend] = useState(false);
  useEffect(() => {
    fetch("/api/auth/providers")
      .then(r => r.ok ? r.json() : null)
      .then(p => { setHasGoogle(!!p?.google); setHasResend(!!p?.resend); })
      .catch(() => {});
  }, []);

  return (
    <div style={{
      position: "relative",
      width: "100%", minHeight: "100dvh",
      background: "#0a0e0e", overflow: "hidden",
    }}>
      {/* Background listrado (Figma container) */}
      <div aria-hidden style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          alt=""
          src="/login-bg.png"
          style={{
            position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)",
            height: "100%", width: "min(100%, 430px)", objectFit: "cover",
          }}
        />
      </div>

      {/* Conteúdo — ancorado no topo, centralizado horizontalmente */}
      <div style={{
        position: "relative",
        width: "100%", maxWidth: 393, margin: "0 auto",
        boxSizing: "border-box",
        paddingTop: 40, paddingBottom: 24, paddingLeft: 16, paddingRight: 16,
        display: "flex", flexDirection: "column", alignItems: "center", gap: 40,
      }}>

        {/* Main Container — logo + título */}
        <div style={{
          display: "flex", flexDirection: "column", alignItems: "center",
          padding: "48px 32px",
        }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, width: 246 }}>
            <Image
              alt="Canelada" src="/logo.png" width={80} height={80} priority
              style={{ objectFit: "cover", borderRadius: "50%", display: "block" }}
            />
            <div style={{ display: "flex", flexDirection: "column", gap: 4, alignItems: "center", width: "100%" }}>
              <p style={{
                margin: 0, fontFamily: "var(--font-display)", fontWeight: 900,
                fontSize: 28, lineHeight: "32px", color: "#fff",
                textAlign: "center", whiteSpace: "nowrap",
              }}>
                Canelada
              </p>
              <p style={{
                margin: 0, fontFamily: "var(--font-body)", fontWeight: 700,
                fontSize: 18, lineHeight: "22px", color: "#fff",
                textAlign: "center", whiteSpace: "nowrap",
              }}>
                Quando o baba vira resenha
              </p>
            </div>
          </div>
        </div>

        {/* Auth Section */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8, width: "100%" }}>

          {/* Botões */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12, width: "100%" }}>
            {/* Google */}
            {hasGoogle && (
              <button
                onClick={() => signIn("google", { callbackUrl: "/feed" })}
                style={{
                  width: "100%", height: 56, background: "#fff", border: "none",
                  borderRadius: 16, cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 12,
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/google-icon.svg" alt="" aria-hidden width={20} height={20} />
                <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16, lineHeight: "20px", color: "#0a0e0e", whiteSpace: "nowrap" }}>
                  Continuar com Google
                </span>
              </button>
            )}

            {/* Login por e-mail (link mágico) — só se o Resend estiver ativo */}
            {hasResend && (
              <button
                onClick={() => signIn("resend", { callbackUrl: "/feed" })}
                style={{
                  width: "100%", height: 56, background: "#1c1c1c", border: "1px solid #2c2c2c",
                  borderRadius: 16, cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 12,
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <rect x="2" y="4" width="20" height="16" rx="2" />
                  <path d="m22 7-10 6L2 7" />
                </svg>
                <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16, lineHeight: "20px", color: "#fff", whiteSpace: "nowrap" }}>
                  Entrar com e-mail
                </span>
              </button>
            )}
          </div>

          {/* Divisor "ou" */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "16px 0" }}>
            <div style={{ flex: 1, height: 1, background: "#2c2c2c" }} />
            <span style={{ fontFamily: "var(--font-body)", fontWeight: 500, fontSize: 12, lineHeight: "16px", color: "#606060" }}>ou</span>
            <div style={{ flex: 1, height: 1, background: "#2c2c2c" }} />
          </div>

          {/* Card de convite */}
          <div style={{
            background: "#1a1a1a", border: "1px solid #2c2c2c",
            borderRadius: 16, padding: 17,
            display: "flex", flexDirection: "column", gap: 4,
          }}>
            <p style={{ margin: 0, fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16, lineHeight: "20px", color: "#9fe870" }}>
              ⚽ Novo no App do Baba?
            </p>
            <p style={{ margin: 0, paddingTop: 4, fontFamily: "var(--font-body)", fontWeight: 400, fontSize: 14, lineHeight: "18px", color: "#7a7a7a" }}>
              Peça ao administrador da sua liga um link de convite. Só é possível entrar por convite.
            </p>
          </div>

          {/* Termos */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 24 }}>
            <p style={{ margin: 0, fontFamily: "var(--font-body)", fontWeight: 400, fontSize: 11, lineHeight: "16px", color: "#7a7a7a", textAlign: "center" }}>
              Ao continuar você aceita os{" "}
              <strong style={{ fontWeight: 700, color: "#7a7a7a" }}>Termos de Uso</strong>
              {" "}e a{" "}
              <strong style={{ fontWeight: 700, color: "#7a7a7a" }}>Política de Privacidade</strong>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
