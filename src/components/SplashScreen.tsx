"use client";

import { useEffect, useState } from "react";

const KEY = "canelada-splash-shown";
const SHOW_MS = 1000;
const FADE_MS = 380;

/**
 * Splash rápido de abertura — logo com glow verde, some sozinho.
 * Mostra 1x por sessão (sessionStorage), então navegações internas não repetem.
 */
export function SplashScreen() {
  const [phase, setPhase] = useState<"hidden" | "show" | "fade">("hidden");

  useEffect(() => {
    if (sessionStorage.getItem(KEY)) return;
    sessionStorage.setItem(KEY, "1");
    setPhase("show");
    const t1 = setTimeout(() => setPhase("fade"), SHOW_MS);
    const t2 = setTimeout(() => setPhase("hidden"), SHOW_MS + FADE_MS);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  if (phase === "hidden") return null;

  return (
    <div
      aria-hidden
      style={{
        position: "fixed", inset: 0, zIndex: 9999,
        background: "#090909",
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 20,
        opacity: phase === "fade" ? 0 : 1,
        transition: `opacity ${FADE_MS}ms cubic-bezier(0.32,0.72,0,1)`,
        pointerEvents: phase === "fade" ? "none" : "auto",
      }}
    >
      <style>{`
        @keyframes splash-pop { 0% { transform: scale(0.82); opacity: 0; } 60% { transform: scale(1.06); opacity: 1; } 100% { transform: scale(1); } }
        @keyframes splash-glow { 0%,100% { box-shadow: 0 0 40px 4px rgba(159,232,112,0.28); } 50% { box-shadow: 0 0 64px 10px rgba(159,232,112,0.45); } }
        @keyframes splash-text { 0% { opacity: 0; transform: translateY(8px); } 100% { opacity: 1; transform: translateY(0); } }
      `}</style>
      <div
        style={{
          width: 96, height: 96, borderRadius: "50%",
          border: "2px solid #9fe870",
          overflow: "hidden",
          animation: `splash-pop 500ms cubic-bezier(0.34,1.56,0.64,1) both, splash-glow 1.6s ease-in-out infinite`,
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.png" alt="" width={96} height={96} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </div>
      <div style={{ textAlign: "center", animation: "splash-text 420ms cubic-bezier(0.32,0.72,0,1) 180ms both" }}>
        <p style={{ margin: 0, fontFamily: "var(--font-display)", fontWeight: 900, fontSize: 26, letterSpacing: "-0.5px", color: "#fff" }}>
          Canelada
        </p>
        <p style={{ margin: "2px 0 0", fontFamily: "var(--font-body)", fontWeight: 500, fontSize: 13, color: "#8a8a8a" }}>
          Quando o baba vira resenha
        </p>
      </div>
    </div>
  );
}
