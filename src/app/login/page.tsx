"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { signIn } from "next-auth/react";
import { Separator } from "@/ds";

const EASE = "cubic-bezier(0.32, 0.72, 0, 1)";

function useEntrance() {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const raf = requestAnimationFrame(() => requestAnimationFrame(() => setVisible(true)));
    return () => cancelAnimationFrame(raf);
  }, []);
  return visible;
}

function Reveal({ children, delay = 0, visible }: { children: React.ReactNode; delay?: number; visible: boolean }) {
  return (
    <div
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(22px)",
        filter: visible ? "blur(0px)" : "blur(6px)",
        transition: `opacity 620ms ${EASE} ${delay}ms, transform 620ms ${EASE} ${delay}ms, filter 620ms ${EASE} ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

function PressButton({
  children, onClick, style,
}: { children: React.ReactNode; onClick?: () => void; style: React.CSSProperties }) {
  return (
    <button
      onClick={onClick}
      style={{
        ...style,
        transition: `transform 220ms ${EASE}, opacity 220ms ${EASE}`,
        WebkitTapHighlightColor: "transparent",
      }}
      onPointerDown={(e) => { e.currentTarget.style.transform = "scale(0.97)"; }}
      onPointerUp={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
      onPointerLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
    >
      {children}
    </button>
  );
}

export default function LoginPage() {
  const visible = useEntrance();
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
      background: "#090909", overflow: "hidden",
    }}>
      {/* Glow radial verde, fixo, atrás de tudo */}
      <div aria-hidden style={{
        position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0,
        background: "radial-gradient(560px 420px at 50% -8%, rgba(159,232,112,0.16), transparent 70%)",
      }} />

      {/* Conteúdo — ancorado no topo, centralizado horizontalmente */}
      <div style={{
        position: "relative", zIndex: 1,
        width: "100%", maxWidth: 393, margin: "0 auto",
        boxSizing: "border-box",
        minHeight: "100dvh",
        paddingTop: "calc(env(safe-area-inset-top, 0px) + 64px)",
        paddingBottom: 24, paddingLeft: 20, paddingRight: 20,
        display: "flex", flexDirection: "column", alignItems: "center", gap: 40,
      }}>

        {/* Logo + eyebrow + headline */}
        <Reveal visible={visible} delay={0}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}>
            <div style={{
              width: 72, height: 72, borderRadius: "50%",
              border: "2px solid #9fe870",
              boxShadow: "0 0 32px rgba(159,232,112,0.28)",
              display: "flex", alignItems: "center", justifyContent: "center",
              overflow: "hidden", flexShrink: 0,
            }}>
              <Image alt="Canelada" src="/logo.png" width={72} height={72} priority style={{ objectFit: "cover" }} />
            </div>

            <div style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              padding: "5px 14px", borderRadius: 9999,
              background: "rgba(159,232,112,0.08)", border: "1px solid rgba(159,232,112,0.3)",
            }}>
              <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#9fe870" }} />
              <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: "#9fe870" }}>
                Bem-vindo de volta
              </span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 4, alignItems: "center" }}>
              <p style={{
                margin: 0, fontFamily: "var(--font-display)", fontWeight: 900,
                fontSize: 34, lineHeight: "38px", letterSpacing: "-0.5px", color: "#fff",
                textAlign: "center",
              }}>
                Canelada
              </p>
              <p style={{
                margin: 0, fontFamily: "var(--font-body)", fontWeight: 500,
                fontSize: 15, lineHeight: "20px", color: "#8a8a8a",
                textAlign: "center",
              }}>
                Quando o baba vira resenha
              </p>
            </div>
          </div>
        </Reveal>

        {/* Auth Section */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12, width: "100%" }}>

          {/* Botões */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12, width: "100%" }}>
            {hasGoogle && (
              <Reveal visible={visible} delay={100}>
                <PressButton
                  onClick={() => signIn("google", { callbackUrl: "/feed" })}
                  style={{
                    width: "100%", height: 56, background: "#fff", border: "none",
                    borderRadius: 9999, cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 12,
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/google-icon.svg" alt="" aria-hidden width={20} height={20} />
                  <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16, lineHeight: "20px", color: "#0a0e0e", whiteSpace: "nowrap" }}>
                    Continuar com Google
                  </span>
                </PressButton>
              </Reveal>
            )}

            {hasResend && (
              <Reveal visible={visible} delay={150}>
                <PressButton
                  onClick={() => signIn("resend", { callbackUrl: "/feed" })}
                  style={{
                    width: "100%", height: 56, background: "#171717", border: "1px solid #2c2c2c",
                    borderRadius: 9999, cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 12,
                  }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9fe870" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <rect x="2" y="4" width="20" height="16" rx="2" />
                    <path d="m22 7-10 6L2 7" />
                  </svg>
                  <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16, lineHeight: "20px", color: "#fff", whiteSpace: "nowrap" }}>
                    Entrar com e-mail
                  </span>
                </PressButton>
              </Reveal>
            )}
          </div>

          {/* Divisor "ou" */}
          <Reveal visible={visible} delay={190}>
            <Separator label="ou" />
          </Reveal>

          {/* Card de convite — double-bezel */}
          <Reveal visible={visible} delay={230}>
            <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 24, padding: 6 }}>
              <div style={{
                background: "#111", border: "1px solid #2c2c2c",
                borderRadius: 18, padding: "18px 18px",
                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04)",
                display: "flex", flexDirection: "column", gap: 4,
              }}>
                <p style={{ margin: 0, fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16, lineHeight: "20px", color: "#9fe870" }}>
                  ⚽ Novo no App do Baba?
                </p>
                <p style={{ margin: 0, paddingTop: 4, fontFamily: "var(--font-body)", fontWeight: 400, fontSize: 14, lineHeight: "18px", color: "#8a8a8a" }}>
                  Peça ao administrador da sua liga um link de convite. Só é possível entrar por convite.
                </p>
              </div>
            </div>
          </Reveal>

          {/* Termos */}
          <Reveal visible={visible} delay={280}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 20 }}>
              <p style={{ margin: 0, fontFamily: "var(--font-body)", fontWeight: 400, fontSize: 11, lineHeight: "16px", color: "#6e6e6e", textAlign: "center" }}>
                Ao continuar você aceita os{" "}
                <strong style={{ fontWeight: 700, color: "#8a8a8a" }}>Termos de Uso</strong>
                {" "}e a{" "}
                <strong style={{ fontWeight: 700, color: "#8a8a8a" }}>Política de Privacidade</strong>
              </p>
            </div>
          </Reveal>
        </div>
      </div>
    </div>
  );
}
