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

export function PersonagemShareModal({ open, onClose, tipo, apelido, data, mascot, qtd = 8, grupoNome }: Props) {
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
  const label = PERSONAGEM_LABELS[tipo] ?? tipo;
  const dateStr = new Date(data).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
  const dateFormatted = `CONCLUÍDO · ${dateStr}`;

  async function handleShare() {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: `${apelido} é o ${label}!`,
          text: `${apelido} foi eleito o ${label} do jogo${grupoNome ? ` do ${grupoNome}` : ""}! 🏆 #Canelada`,
        });
      } catch { /* user cancelled */ }
    }
  }

  return (
    <>
      <style>{`
        @keyframes share-in  { from { opacity:0; transform:translateY(40px); } to { opacity:1; transform:translateY(0); } }
        @keyframes share-out { from { opacity:1; transform:translateY(0); }    to { opacity:0; transform:translateY(40px); } }
      `}</style>

      <div style={{
        position: "fixed", inset: 0, zIndex: 100,
        background: "#0a0e0e",
        animation: `${animOut ? "share-out" : "share-in"} 320ms cubic-bezier(0.32,0.72,0,1) forwards`,
        overflow: "hidden",
      }}>

        {/* Background image — teal gradient */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          aria-hidden
          alt=""
          src="/ilustracoes/share-bg.png"
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", pointerEvents: "none" }}
        />

        {/* Close button — top:70, right:16 */}
        <button
          onClick={onClose}
          style={{
            position: "absolute", top: 70, right: 16,
            width: 48, height: 48,
            background: "#000", border: "1px solid #424242",
            borderRadius: 24, display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", zIndex: 2,
          }}
        >
          <X size={16} color="#fff" weight="bold" />
        </button>

        {/* Image container — centered, top:100, 264×264 */}
        <div style={{
          position: "absolute",
          top: 100,
          left: "50%", transform: "translateX(-50%)",
          width: 264, height: 264,
        }}>
          {/* Glow blob */}
          <div aria-hidden style={{
            position: "absolute",
            top: "50%", left: "50%",
            transform: "translate(-50%, -50%)",
            width: 289, height: 296,
            background: "#0a5c69",
            filter: "blur(88px)",
            borderRadius: "50%",
            pointerEvents: "none",
          }} />
          {/* Character — 300×300, top:-18, centered */}
          <div style={{
            position: "absolute",
            top: -18, left: "50%", transform: "translateX(-50%)",
            width: 300, height: 300,
          }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={mascot}
              alt={title}
              style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "contain" }}
            />
          </div>
        </div>

        {/* Title — top:390, Barlow Bold 56px */}
        <p style={{
          position: "absolute",
          top: 390,
          left: 24, right: 24,
          margin: 0,
          fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 56,
          lineHeight: "64px", letterSpacing: "-2px",
          color: "#fff", textAlign: "center",
        }}>
          {title}
        </p>

        {/* Description — top:512, left:40, width:313, Inter SemiBold 20px */}
        <div style={{
          position: "absolute",
          top: 512,
          left: 40, width: 313,
        }}>
          <p style={{
            margin: 0,
            fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 20,
            lineHeight: "24px", color: "#fff", letterSpacing: "-1px",
          }}>
            <span style={{ color: "#9fe870" }}>{apelido}</span>
            {" foi eleito o "}
            <span style={{ color: "#9fe870" }}>{label}</span>
            {` do jogo por ${qtd} jogadores`}
            {grupoNome ? <> do <span style={{ color: "#9fe870" }}>{grupoNome}</span></> : ""}
            {"."}
          </p>
        </div>

        {/* Share button — top:648, centered */}
        <div style={{
          position: "absolute",
          top: 648,
          left: "50%", transform: "translateX(-50%)",
        }}>
          <button
            onClick={handleShare}
            style={{
              background: "#171717",
              borderRadius: 22, height: 64,
              padding: "16px 24px",
              display: "flex", alignItems: "center", gap: 8,
              cursor: "pointer", border: "none",
              boxShadow: "4px 8px 8px 4px rgba(0,0,0,0.08)",
              whiteSpace: "nowrap",
            }}
          >
            <span style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 18, color: "#9fe870" }}>Compartilhar</span>
            <ShareNetwork size={20} color="#9fe870" weight="bold" />
          </button>
        </div>

        {/* Footer — bottom:0, border-top #42bace */}
        <div style={{
          position: "absolute", bottom: 0, left: 0, right: 0, height: 56,
          borderTop: "1px solid #42bace",
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: "16px 14px",
        }}>
          <span style={{
            fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 12,
            color: "#fff", letterSpacing: "0.5px", textTransform: "uppercase",
            whiteSpace: "nowrap",
          }}>
            {dateFormatted}
          </span>
        </div>
      </div>
    </>
  );
}
