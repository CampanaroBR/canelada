"use client";

import { useRouter } from "next/navigation";
import { X, ShareNetwork } from "@phosphor-icons/react";

interface Props {
  title: string;
  bgImg: string;
  mascotImg: string;
  glowColor: string;
  nameColor: string;
  footerBorder: string;
  vencedorNome: string;
  vencedorQtd: number;
  categoriaLabel: string;
  data: string;
}

export function PremioScreen({
  title, bgImg, mascotImg, glowColor, nameColor, footerBorder,
  vencedorNome, vencedorQtd, categoriaLabel, data,
}: Props) {
  const router = useRouter();

  function handleShare() {
    if (navigator.share) {
      navigator.share({
        title: `${vencedorNome} é o ${categoriaLabel}!`,
        text: `${vencedorNome} foi eleito o ${categoriaLabel} do jogo por ${vencedorQtd} jogadores.`,
      }).catch(() => null);
    }
  }

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 60, background: "#0a0e0e", overflow: "hidden" }}>

      {/* Background gradient image */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img alt="" aria-hidden src={bgImg} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", pointerEvents: "none" }} />

      {/* Glow blur behind mascot */}
      <div aria-hidden style={{
        position: "absolute",
        left: "50%", top: "calc(50% - 196px)",
        transform: "translate(-50%, -50%)",
        width: 289, height: 296,
        background: glowColor,
        filter: "blur(88.6px)",
        borderRadius: "50%",
        pointerEvents: "none",
      }} />

      {/* Mascot */}
      <div style={{ position: "absolute", left: "50%", top: 100, transform: "translateX(-50%)", width: 264, height: 264 }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img alt={title} src={mascotImg} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
      </div>

      {/* Close button */}
      <button
        onClick={() => router.back()}
        style={{
          position: "absolute", top: 70, right: 64,
          width: 48, height: 48,
          background: "#000",
          border: "1px solid #424242",
          borderRadius: 24,
          display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "pointer",
        }}
        aria-label="Fechar"
      >
        <X size={16} color="#fff" weight="bold" />
      </button>

      {/* Title */}
      <p style={{
        position: "absolute",
        top: 390,
        left: "50%",
        transform: "translateX(-50%)",
        margin: 0,
        fontFamily: "var(--font-display)",
        fontWeight: 700,
        fontSize: 56,
        lineHeight: "64px",
        color: "#fff",
        letterSpacing: "-2px",
        whiteSpace: "nowrap",
      }}>
        {title}
      </p>

      {/* Subtitle */}
      <div style={{ position: "absolute", top: 512, left: 40, width: 313, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ margin: 0, fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 20, lineHeight: "24px", color: "#fff", letterSpacing: "-1px" }}>
          <span style={{ color: nameColor }}>{vencedorNome}</span>
          {" foi eleito o "}
          <span style={{ color: nameColor }}>{categoriaLabel}</span>
          {` do jogo por ${vencedorQtd} jogadores do Baba do PJ.`}
        </p>
      </div>

      {/* Share button — padrão do app (secondary) */}
      <button
        onClick={handleShare}
        style={{
          position: "absolute",
          top: 648,
          left: "50%",
          transform: "translateX(-50%)",
          background: "#2a2a2a",
          border: "1px solid #3a3a3a",
          borderRadius: 16,
          height: 54,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          padding: "0 24px",
          cursor: "pointer",
          boxShadow: "0px 4px 9.8px 2px rgba(0,0,0,0.25)",
          WebkitTapHighlightColor: "transparent",
        }}
      >
        <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16, lineHeight: "20px", color: "#9fe870" }}>Compartilhar</span>
        <ShareNetwork size={20} color="#9fe870" weight="bold" />
      </button>

      {/* Footer */}
      <div style={{
        position: "absolute",
        top: 796, left: 0,
        width: "100%", height: 56,
        borderTop: `1px solid ${footerBorder}`,
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "16px 14px",
        overflow: "hidden",
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "4px 0" }}>
          <p style={{
            margin: 0,
            fontFamily: "var(--font-display)",
            fontWeight: 600,
            fontSize: 12,
            lineHeight: "15px",
            color: "#fff",
            letterSpacing: "0.5px",
            whiteSpace: "nowrap",
          }}>
            CONCLUÍDO · {data}
          </p>
        </div>
      </div>
    </div>
  );
}
