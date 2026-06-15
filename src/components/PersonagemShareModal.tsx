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

export function PersonagemShareModal({
  open, onClose, tipo, apelido, data, mascot, qtd = 8, grupoNome,
}: Props) {
  const [mounted, setMounted]   = useState(false);
  const [visible, setVisible]   = useState(false);

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

  const title   = PERSONAGEM_TITLES[tipo] ?? tipo;
  const label   = PERSONAGEM_LABELS[tipo] ?? tipo;
  const dateStr = new Date(data).toLocaleDateString("pt-BR", {
    day: "2-digit", month: "2-digit", year: "numeric",
  });

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
    /* Backdrop */
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 100,
        display: "flex", justifyContent: "center",
        background: "rgba(0,0,0,0.6)",
        backdropFilter: "blur(2px)", WebkitBackdropFilter: "blur(2px)",
        transition: `opacity ${dur} ease`,
        opacity: visible ? 1 : 0,
        touchAction: "none",
      }}
    >
      {/* Mobile frame */}
      <div
        role="dialog"
        aria-modal="true"
        onClick={e => e.stopPropagation()}
        style={{
          position: "relative",
          width: "100%", maxWidth: 430,
          height: "100%",
          background: "#0a0e0e",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-end",
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
          style={{
            position: "absolute", inset: 0,
            width: "100%", height: "100%",
            objectFit: "cover", pointerEvents: "none", zIndex: 0,
          }}
        />

        {/* ── Row 1: Close button (right-aligned, sits at the very top) ── */}
        <div style={{
          position: "relative", zIndex: 1,
          width: "100%", flexShrink: 0,
          display: "flex", justifyContent: "flex-end",
          padding: "15px 16px 15px 10px",
        }}>
          <button
            onClick={onClose}
            aria-label="Fechar"
            style={{
              width: 48, height: 48,
              background: "#000", border: "1px solid #424242",
              borderRadius: 24,
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer",
            }}
          >
            <X size={16} color="#fff" weight="bold" />
          </button>
        </div>

        {/* ── Row 2: Main content + Footer (fills remaining height) ── */}
        <div style={{
          position: "relative", zIndex: 1,
          flex: 1, minHeight: 0,
          width: "100%",
          display: "flex", flexDirection: "column",
          justifyContent: "space-between",
          alignItems: "center",
        }}>

          {/* Inner: illustration → title → description → share button */}
          <div style={{
            display: "flex", flexDirection: "column",
            alignItems: "center",
            gap: 58,
            width: 313,
            paddingTop: 8,
          }}>

            {/* illustration + title (gap 8) → description (gap 64) */}
            <div style={{
              display: "flex", flexDirection: "column",
              alignItems: "center",
              gap: 64,
              width: "100%",
            }}>
              {/* Illustration + title (gap 8) */}
              <div style={{
                display: "flex", flexDirection: "column",
                alignItems: "center",
                gap: 8,
                width: 300,
              }}>
                {/* Image container 300×300 */}
                <div style={{ position: "relative", width: 300, height: 300, flexShrink: 0 }}>
                  {/* Glow */}
                  <div aria-hidden style={{
                    position: "absolute",
                    top: "50%", left: "50%",
                    transform: "translate(-50%, -50%)",
                    width: 289, height: 296,
                    background: "#0a5c69",
                    filter: "blur(88.6px)",
                    borderRadius: "50%",
                    pointerEvents: "none",
                  }} />
                  {/* Mascot */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={mascot} alt={title}
                    style={{
                      position: "absolute", inset: 0,
                      width: "100%", height: "100%",
                      objectFit: "contain",
                    }}
                  />
                </div>

                {/* Title — centered, 300px wide */}
                <p style={{
                  margin: 0,
                  width: 300,
                  fontFamily: "var(--font-display)", fontWeight: 700,
                  fontSize: 56, lineHeight: "64px", letterSpacing: "-2px",
                  color: "#fff", textAlign: "center",
                }}>
                  {title}
                </p>
              </div>

              {/* Description — 313px wide */}
              <p style={{
                margin: 0,
                width: 313,
                fontFamily: "var(--font-body)", fontWeight: 600,
                fontSize: 20, lineHeight: "24px",
                color: "#fff", letterSpacing: "-1px",
              }}>
                <span style={{ color: "#9fe870" }}>{apelido}</span>
                {" foi eleito o "}
                <span style={{ color: "#9fe870" }}>{label}</span>
                {` do jogo por ${qtd} jogadores${grupoNome ? ` do ${grupoNome}` : ""}.`}
              </p>
            </div>

            {/* Share button */}
            <button
              onClick={handleShare}
              style={{
                background: "#171717", border: "none",
                borderRadius: 22, height: 64,
                padding: "16px 24px",
                display: "flex", alignItems: "center", gap: 8,
                cursor: "pointer",
                boxShadow: "4px 8px 8px 4px rgba(0,0,0,0.08)",
                whiteSpace: "nowrap",
              }}
            >
              <span style={{
                fontFamily: "var(--font-display)", fontWeight: 600,
                fontSize: 18, lineHeight: "24px", color: "#9fe870",
              }}>
                Compartilhar
              </span>
              <ShareNetwork size={20} color="#9fe870" weight="bold" />
            </button>
          </div>

          {/* Footer — pinned to bottom via space-between */}
          <div style={{
            flexShrink: 0,
            width: "100%", height: 56,
            borderTop: "1px solid #42bace",
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: "0 14px",
          }}>
            <span style={{
              fontFamily: "var(--font-display)", fontWeight: 600,
              fontSize: 12, lineHeight: "15px",
              color: "#fff", letterSpacing: "0.5px",
              textTransform: "uppercase", whiteSpace: "nowrap",
            }}>
              CONCLUÍDO · {dateStr}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
