"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { X, ShareNetwork } from "@phosphor-icons/react";

interface Props {
  title: string;
  bgImg: string;
  bakedImg?: string;
  mascotImg: string;
  glowColor: string;
  nameColor: string;
  footerBorder: string;
  vencedorNome: string;
  vencedorQtd: number;
  categoriaLabel: string;
  grupoNome: string;
  data: string;
}

export function PremioScreen({
  title, bgImg, bakedImg, mascotImg, glowColor, nameColor, footerBorder,
  vencedorNome, vencedorQtd, categoriaLabel, grupoNome, data,
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

  const closeBtn = (
    <button
      onClick={() => router.back()}
      aria-label="Fechar"
      style={{
        position: "absolute",
        top: "calc(env(safe-area-inset-top, 0px) + 16px)",
        right: 16, zIndex: 2,
        width: 48, height: 48,
        background: "#000", border: "1px solid #424242", borderRadius: 24,
        display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
      }}
    >
      <X size={16} color="#fff" weight="bold" />
    </button>
  );

  const shareBtn = (
    <button
      onClick={handleShare}
      style={{
        background: "#9fe870", border: "none", borderRadius: 20, height: 54,
        display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
        padding: "0 24px", cursor: "pointer", WebkitTapHighlightColor: "transparent",
      }}
    >
      <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16, lineHeight: "20px", color: "#090909" }}>Compartilhar</span>
      <ShareNetwork size={20} color="#090909" weight="bold" />
    </button>
  );

  const subtitle = (
    <p style={{ margin: 0, maxWidth: 320, fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 20, lineHeight: "24px", color: "#fff", letterSpacing: "-1px", textAlign: "center" }}>
      <span style={{ color: nameColor }}>{vencedorNome}</span>
      {" foi eleito o "}
      <span style={{ color: nameColor }}>{categoriaLabel}</span>
      {` do jogo por ${vencedorQtd} jogadores do ${grupoNome}.`}
    </p>
  );

  // ── Layout PREMIUM: arte bakeada (mascote + título + bolinhas) como fundo ──
  if (bakedImg) {
    return (
      <div style={{ position: "fixed", inset: 0, zIndex: 60, background: "#0a0e0e", overflow: "hidden" }}>
        <Image alt={title} src={bakedImg} fill priority sizes="430px" style={{ objectFit: "cover" }} />
        {closeBtn}
        {/* Overlays posicionados na zona inferior da arte (proporcional) */}
        <div style={{
          position: "absolute", left: 0, right: 0, bottom: 0,
          display: "flex", flexDirection: "column", alignItems: "center",
          gap: 24,
          padding: "0 24px 0",
        }}>
          {subtitle}
          {shareBtn}
          <div style={{
            width: "100%", borderTop: `1px solid ${footerBorder}`,
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: "16px 14px calc(env(safe-area-inset-bottom, 0px) + 20px)",
            marginTop: 8,
          }}>
            <p style={{ margin: 0, fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 12, lineHeight: "15px", color: "#fff", letterSpacing: "0.5px", whiteSpace: "nowrap" }}>
              CONCLUÍDO · {data}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 60, background: "#0a0e0e", overflow: "hidden", display: "flex", flexDirection: "column" }}>

      {/* Background gradient image */}
      <Image alt="" aria-hidden src={bgImg} fill priority sizes="430px" style={{ objectFit: "cover", pointerEvents: "none" }} />

      {/* Close button — respiro do topo via safe-area */}
      <button
        onClick={() => router.back()}
        style={{
          position: "absolute",
          top: "calc(env(safe-area-inset-top, 0px) + 16px)",
          right: 16,
          zIndex: 2,
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

      {/* Conteúdo centralizado verticalmente, preenchendo a tela */}
      <div style={{
        position: "relative",
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 28,
        padding: "calc(env(safe-area-inset-top, 0px) + 80px) 24px 24px",
      }}>
        {/* Mascot + glow */}
        <div style={{ position: "relative", width: 264, height: 264, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div aria-hidden style={{
            position: "absolute", width: 289, height: 296,
            background: glowColor, filter: "blur(88.6px)", borderRadius: "50%", pointerEvents: "none",
          }} />
          <Image alt={title} src={mascotImg} width={264} height={264} priority style={{ position: "relative", width: "100%", height: "100%", objectFit: "contain" }} />
        </div>

        {/* Title */}
        <h1 style={{
          margin: 0,
          fontFamily: "var(--font-display)",
          fontWeight: 700,
          fontSize: 56,
          lineHeight: "60px",
          color: "#ffffff",
          letterSpacing: "-2px",
          textAlign: "center",
          textShadow: "0 2px 14px rgba(0,0,0,0.22)",
        }}>
          {title}
        </h1>

        {/* Subtitle */}
        <p style={{ margin: 0, maxWidth: 320, fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 20, lineHeight: "24px", color: "#fff", letterSpacing: "-1px", textAlign: "center" }}>
          <span style={{ color: nameColor }}>{vencedorNome}</span>
          {" foi eleito o "}
          <span style={{ color: nameColor }}>{categoriaLabel}</span>
          {` do jogo por ${vencedorQtd} jogadores do ${grupoNome}.`}
        </p>

        {/* Share button — padrão do app */}
        <button
          onClick={handleShare}
          style={{
            marginTop: 12,
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
      </div>

      {/* Footer fixo na base */}
      <div style={{
        position: "relative",
        flexShrink: 0,
        width: "100%",
        borderTop: `1px solid ${footerBorder}`,
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "16px 14px calc(env(safe-area-inset-bottom, 0px) + 20px)",
      }}>
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
  );
}
