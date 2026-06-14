"use client";

import { useRouter } from "next/navigation";

const imgX     = "http://localhost:3845/assets/c6048d3d966a755882e18ffea09b55b0e4f3cf24.svg";
const imgShare = "http://localhost:3845/assets/72c12c8d6913f07e65f6886afcdbe05e62f2eb6d.svg";

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
    <div style={{ position: "relative", width: "100%", height: "100dvh", background: "#0a0e0e", overflow: "hidden" }}>

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
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img alt="Fechar" src={imgX} style={{ width: 16, height: 16 }} />
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

      {/* Share button */}
      <div style={{
        position: "absolute",
        top: 648,
        left: "50%",
        transform: "translateX(-50%)",
        background: "#171717",
        borderRadius: 22,
        height: 64,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px 24px",
        boxShadow: "4px 8px 8px 4px rgba(0,0,0,0.08)",
      }}>
        <button onClick={handleShare} style={{ display: "flex", alignItems: "center", gap: 8, background: "none", border: "none", cursor: "pointer" }}>
          <span style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 18, lineHeight: "24px", color: "#9fe870" }}>Compartilhar</span>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img alt="" src={imgShare} style={{ width: 20, height: 20 }} />
        </button>
      </div>

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
