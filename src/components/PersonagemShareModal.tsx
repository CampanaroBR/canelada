"use client";

import { useState, useEffect } from "react";
import { X, ShareNetwork } from "@phosphor-icons/react";

interface Props {
  open: boolean;
  onClose: () => void;
  tipo: string;
  apelido: string;
  data: Date;
  mascot: string;
  qtd?: number;
  grupoNome?: string;
}

const PERSONAGEM_TITLES: Record<string, string> = {
  MVP:    "MATADOR",
  BAGRE:  "BAGRE DA NOITE",
  RACUDO: "PREGUEIRO",
};

const PERSONAGEM_LABELS: Record<string, string> = {
  MVP:    "Matador",
  BAGRE:  "Bagre da Noite",
  RACUDO: "Pregueiro",
};

const SPRING_IN  = "cubic-bezier(0.32, 0.72, 0, 1)";
const SPRING_OUT = "cubic-bezier(0.4, 0, 1, 1)";

export function PersonagemShareModal({ open, onClose, tipo, apelido, data, mascot, qtd = 8, grupoNome }: Props) {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (open) {
      setMounted(true);
      requestAnimationFrame(() => requestAnimationFrame(() => setVisible(true)));
    } else {
      setVisible(false);
      const t = setTimeout(() => setMounted(false), 320);
      return () => clearTimeout(t);
    }
  }, [open]);

  if (!mounted) return null;

  const title    = PERSONAGEM_TITLES[tipo] ?? tipo;
  const label    = PERSONAGEM_LABELS[tipo] ?? tipo;
  const dateStr  = new Date(data).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });

  async function handleShare() {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: `${apelido} é o ${label}!`,
          text:  `${apelido} foi eleito o ${label} do jogo${grupoNome ? ` do ${grupoNome}` : ""}! 🏆 #Canelada`,
        });
      } catch { /* cancelled */ }
    }
  }

  const dur  = visible ? "380ms" : "260ms";
  const ease = visible ? SPRING_IN : SPRING_OUT;

  return (
    /* Full-screen backdrop */
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 100,
        display: "flex", justifyContent: "center",
        background: "rgba(0,0,0,0.6)",
        backdropFilter: "blur(2px)", WebkitBackdropFilter: "blur(2px)",
        transition: `opacity ${dur} ease`,
        opacity: visible ? 1 : 0,
      }}
    >
      {/* Mobile frame — max 430px wide, slides up from bottom */}
      <div
        role="dialog"
        aria-modal="true"
        onClick={e => e.stopPropagation()}
        style={{
          position: "relative",
          width: "100%", maxWidth: 430,
          height: "100%",
          /* #0a0e0e so the corner triangles in share-bg show dark, not teal */
          background: "#0a0e0e",
          overflow: "hidden",
          display: "flex", flexDirection: "column",
          transition: `transform ${dur} ${ease}`,
          transform: visible ? "translateY(0)" : "translateY(100%)",
          willChange: "transform",
        }}
      >
        {/* Background image */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          aria-hidden alt=""
          src="/ilustracoes/share-bg.png"
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", pointerEvents: "none", zIndex: 0 }}
        />

        {/* Close button — absolute top-right */}
        <button
          onClick={onClose}
          aria-label="Fechar"
          style={{
            position: "absolute", top: 70, right: 16, zIndex: 2,
            width: 48, height: 48,
            background: "#000", border: "1px solid #424242",
            borderRadius: 24,
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer",
          }}
        >
          <X size={16} color="#fff" weight="bold" />
        </button>

        {/* Upper content — grows to fill space */}
        <div style={{ position: "relative", zIndex: 1, flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", paddingTop: 80, paddingBottom: 24 }}>

          {/* Character illustration */}
          <div style={{ position: "relative", width: 264, height: 264, flexShrink: 0 }}>
            {/* Glow blob */}
            <div aria-hidden style={{
              position: "absolute",
              top: "50%", left: "50%",
              transform: "translate(-50%, -50%)",
              width: 289, height: 296,
              background: "#0a5c69", filter: "blur(88px)",
              borderRadius: "50%", pointerEvents: "none",
            }} />
            {/* Mascot */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={mascot} alt={title}
              style={{ position: "absolute", top: -18, left: "50%", transform: "translateX(-50%)", width: 300, height: 300, objectFit: "contain" }}
            />
          </div>

          {/* Title */}
          <p style={{
            margin: "16px 0 0",
            fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 56,
            lineHeight: "60px", letterSpacing: "-2px",
            color: "#fff", textAlign: "center",
            padding: "0 16px",
          }}>
            {title}
          </p>

          {/* Description */}
          <p style={{
            margin: "24px 0 0",
            padding: "0 40px",
            fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 20,
            lineHeight: "24px", color: "#fff", letterSpacing: "-1px",
            alignSelf: "flex-start",
          }}>
            <span style={{ color: "#9fe870" }}>{apelido}</span>
            {" foi eleito o "}
            <span style={{ color: "#9fe870" }}>{label}</span>
            {` do jogo por ${qtd} jogadores`}
            {grupoNome ? <> do <span style={{ color: "#9fe870" }}>{grupoNome}</span></> : ""}
            {"."}
          </p>
        </div>

        {/* Share button — pinned above footer */}
        <div style={{ position: "relative", zIndex: 1, display: "flex", justifyContent: "center", paddingBottom: 28 }}>
          <button
            onClick={handleShare}
            style={{
              background: "#171717", border: "none",
              borderRadius: 22, height: 64,
              padding: "16px 32px",
              display: "flex", alignItems: "center", gap: 8,
              cursor: "pointer",
              boxShadow: "4px 8px 8px 4px rgba(0,0,0,0.08)",
              whiteSpace: "nowrap",
            }}
          >
            <span style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 18, color: "#9fe870" }}>Compartilhar</span>
            <ShareNetwork size={20} color="#9fe870" weight="bold" />
          </button>
        </div>

        {/* Footer — pinned to bottom */}
        <div style={{
          position: "relative", zIndex: 1,
          flexShrink: 0,
          height: 56,
          borderTop: "1px solid #42bace",
          display: "flex", alignItems: "center", justifyContent: "center",
          paddingBottom: "env(safe-area-inset-bottom, 0px)",
        }}>
          <span style={{
            fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 12,
            color: "#fff", letterSpacing: "0.5px", textTransform: "uppercase",
            whiteSpace: "nowrap",
          }}>
            CONCLUÍDO · {dateStr}
          </span>
        </div>
      </div>
    </div>
  );
}
