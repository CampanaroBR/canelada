"use client";

import { useState, useEffect } from "react";
import { X, ShareNetwork } from "@phosphor-icons/react";

interface Props {
  open: boolean;
  onClose: () => void;
  tipo: string;
  texto: string;
  data: Date;
  mascot: string;
  qtd?: number;
}

const PERSONAGEM_TITLES: Record<string, string> = {
  MVP:    "MATADOR",
  BAGRE:  "BAGRE DA NOITE",
  RACUDO: "PREGUEIRO",
};

export function PersonagemShareModal({ open, onClose, tipo, texto, data, mascot, qtd = 8 }: Props) {
  const [visible, setVisible] = useState(false);
  const [animOut, setAnimOut] = useState(false);

  useEffect(() => {
    if (open) { setAnimOut(false); setVisible(true); }
    else if (visible) {
      setAnimOut(true);
      const t = setTimeout(() => setVisible(false), 300);
      return () => clearTimeout(t);
    }
  }, [open, visible]);

  if (!visible) return null;

  const title = PERSONAGEM_TITLES[tipo] ?? tipo;
  const nome = texto.split(" ").slice(0, 3).join(" ");
  const dateStr = new Date(data).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });

  async function handleShare() {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: `${nome} é o ${title}!`,
          text: `${nome} foi eleito o ${title} do jogo! 🏆 #Canelada`,
        });
      } catch {
        // user cancelled
      }
    }
  }

  return (
    <>
      <style>{`
        @keyframes modal-in  { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        @keyframes modal-out { from { opacity: 1; transform: scale(1); }    to { opacity: 0; transform: scale(0.95); } }
        @keyframes fade-in2  { from { opacity: 0; } to { opacity: 1; } }
        @keyframes fade-out2 { from { opacity: 1; } to { opacity: 0; } }
      `}</style>

      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 60,
          animation: `${animOut ? "fade-out2" : "fade-in2"} 300ms ease forwards`,
        }}
      />

      {/* Modal */}
      <div style={{
        position: "fixed", inset: 0, zIndex: 61,
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "0 16px",
        pointerEvents: "none",
      }}>
        <div style={{
          width: "100%", maxWidth: 393,
          background: "#0a5c69",
          backgroundImage: "linear-gradient(180deg, #0a5c69 0%, #0a3540 100%)",
          borderRadius: 32,
          overflow: "hidden",
          position: "relative",
          pointerEvents: "auto",
          animation: `${animOut ? "modal-out" : "modal-in"} 300ms cubic-bezier(0.32,0.72,0,1) forwards`,
        }}>

          {/* Close button */}
          <button
            onClick={onClose}
            style={{
              position: "absolute", top: 16, right: 16,
              width: 48, height: 48,
              background: "#000", border: "1px solid #424242",
              borderRadius: 24, display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", zIndex: 2,
            }}
          >
            <X size={16} color="#fff" weight="bold" />
          </button>

          {/* Glow blob */}
          <div aria-hidden style={{
            position: "absolute",
            top: "50%", left: "50%",
            transform: "translate(-50%, -40%)",
            width: 289, height: 296,
            background: "#0a5c69",
            filter: "blur(88px)",
            borderRadius: "50%",
            pointerEvents: "none",
          }} />

          {/* Character illustration */}
          <div style={{ paddingTop: 60, paddingBottom: 0, display: "flex", justifyContent: "center", position: "relative", zIndex: 1 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={mascot}
              alt={title}
              style={{ width: 264, height: 264, objectFit: "cover", mixBlendMode: "screen" }}
            />
          </div>

          {/* Title */}
          <div style={{ padding: "0 24px", position: "relative", zIndex: 1, marginTop: -16 }}>
            <h1 style={{
              margin: 0,
              fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 56,
              lineHeight: "64px", letterSpacing: "-2px",
              color: "#fff", textAlign: "center",
            }}>
              {title}
            </h1>
          </div>

          {/* Description */}
          <div style={{ padding: "16px 40px 0", position: "relative", zIndex: 1 }}>
            <p style={{ margin: 0, fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 20, lineHeight: "24px", color: "#fff", textAlign: "center" }}>
              <span style={{ color: "#9fe870" }}>{nome}</span>
              {" foi eleito o "}
              <span style={{ color: "#9fe870" }}>{title}</span>
              {` do jogo por ${qtd} jogadores.`}
            </p>
          </div>

          {/* Share button */}
          <div style={{ padding: "32px 40px 24px", display: "flex", justifyContent: "center", position: "relative", zIndex: 1 }}>
            <button
              onClick={handleShare}
              style={{
                background: "#171717",
                borderRadius: 22,
                height: 64,
                padding: "0 24px",
                display: "flex", alignItems: "center", gap: 8,
                cursor: "pointer", border: "none",
                boxShadow: "4px 8px 8px 4px rgba(0,0,0,0.08)",
              }}
            >
              <span style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 18, color: "#9fe870" }}>Compartilhar</span>
              <ShareNetwork size={20} color="#9fe870" weight="bold" />
            </button>
          </div>

          {/* Footer */}
          <div style={{
            borderTop: "1px solid #42bace",
            padding: "16px 14px",
            display: "flex", alignItems: "center", justifyContent: "center",
            position: "relative", zIndex: 1,
          }}>
            <span style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 12, color: "#fff", letterSpacing: "0.5px", textTransform: "uppercase" }}>
              CONCLUÍDO · {dateStr}
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
