"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toBlob } from "html-to-image";
import { X, ShareNetwork } from "@phosphor-icons/react";

interface Props {
  slug: string;
  title: string;
  descricao: string | null;
  bgImg: string;
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

// Pré-carrega a arte como data-URL — html-to-image não embute <img>/next/image
// remoto (via /_next/image) a tempo, e o fundo sai preto na captura (iOS e não só).
function useDataUrl(src: string): string {
  const [url, setUrl] = useState(src);
  useEffect(() => {
    let on = true;
    setUrl(src);
    fetch(src)
      .then((r) => r.blob())
      .then((b) => new Promise<string>((res) => { const fr = new FileReader(); fr.onload = () => res(fr.result as string); fr.readAsDataURL(b); }))
      .then((d) => { if (on) setUrl(d); })
      .catch(() => {});
    return () => { on = false; };
  }, [src]);
  return url;
}

// Espelha a tela "unlocked-gift" do Figma (node 743:137/743:174): fundo
// gradiente+listras, mascote com glow, título branco, descrição e frase do
// vencedor em preto (var(--bg/surface) e var(--neutral/1000) do design).
// Layout em fluxo normal (não coordenadas absolutas fixas do Figma) — o
// canvas original assume ~852px e texto curto; em viewport real de celular
// (barra de endereço etc.) e com descrições mais longas isso cortava o
// botão de compartilhar e sobrepunha o rodapé. Em fluxo, a tela cresce e
// rola normalmente sem quebrar, mantendo cores/tipografia/ordem idênticas.
export function PremioScreen({
  slug, title, descricao, bgImg, mascotImg, glowColor, nameColor, footerBorder,
  vencedorNome, vencedorQtd, categoriaLabel, grupoNome, data,
}: Props) {
  const router = useRouter();
  const [sharing, setSharing] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const shareBtnRef = useRef<HTMLButtonElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const bgData = useDataUrl(bgImg);
  const mascotData = useDataUrl(mascotImg);
  const artReady = bgData.startsWith("data:") && mascotData.startsWith("data:");

  async function handleShare() {
    if (sharing || !cardRef.current || !artReady) return;
    setSharing(true);
    const texto = `${vencedorNome} foi eleito o ${categoriaLabel} do jogo por ${vencedorQtd} jogadores do ${grupoNome}! ⚽`;
    try {
      try { await document.fonts.ready; } catch { /* segue */ }
      // Safari/iOS: a 1ª captura costuma sair incompleta — captura 2x e usa a última.
      const opts = {
        pixelRatio: 2, cacheBust: true,
        filter: (n: HTMLElement) => n !== shareBtnRef.current && n !== closeBtnRef.current,
      };
      await toBlob(cardRef.current, opts);
      const blob = await toBlob(cardRef.current, opts);
      if (!blob) throw new Error("sem blob");
      const file = new File([blob], `${slug}.png`, { type: "image/png" });
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], text: texto });
      } else if (navigator.share) {
        await navigator.share({ text: texto });
      } else {
        const url = URL.createObjectURL(blob);
        Object.assign(document.createElement("a"), { href: url, download: `${slug}.png` }).click();
        URL.revokeObjectURL(url);
      }
    } catch (e) {
      if ((e as Error)?.name !== "AbortError") console.error(e);
    } finally {
      setSharing(false);
    }
  }

  return (
    <div ref={cardRef} style={{ position: "relative", minHeight: "100dvh", background: "#0a0e0e" }}>
      {/* Container 1 — fundo gradiente + listras, cobre toda a altura real do conteúdo */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img alt="" aria-hidden src={bgData} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", pointerEvents: "none" }} />

      {/* Close Button */}
      <button
        ref={closeBtnRef}
        onClick={() => router.back()}
        aria-label="Fechar"
        style={{
          position: "absolute",
          top: "calc(env(safe-area-inset-top, 0px) + 22px)",
          right: 16, zIndex: 2,
          width: 48, height: 48,
          background: "#000", border: "1px solid #424242", borderRadius: 24,
          display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
        }}
      >
        <X size={16} color="#fff" weight="bold" />
      </button>

      {/* Conteúdo em fluxo normal — cresce com o texto, nunca corta nada */}
      <div style={{
        position: "relative", display: "flex", flexDirection: "column", alignItems: "center",
        paddingTop: "calc(env(safe-area-inset-top, 0px) + 90px)",
      }}>
        {/* Mascote + glow — 264x264, altura reservada fixa */}
        <div style={{ position: "relative", width: 264, height: 264, flexShrink: 0 }}>
          <div aria-hidden style={{
            position: "absolute", left: "50%", top: "50%",
            transform: "translate(-50%, -50%)",
            width: 289, height: 296, borderRadius: "50%",
            background: glowColor, filter: "blur(88.6px)",
          }} />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img alt={title} src={mascotData} style={{ position: "relative", width: "100%", height: "100%", objectFit: "contain" }} />
        </div>

        {/* Título + descrição + frase do vencedor */}
        <div style={{
          display: "flex", flexDirection: "column", alignItems: "center", gap: 24,
          width: "100%", maxWidth: 313, padding: "0 24px", marginTop: 40,
        }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, width: "100%", textAlign: "center" }}>
            <p style={{
              margin: 0, width: "100%",
              fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 56, lineHeight: "64px",
              color: "#ffffff", letterSpacing: "-2px",
            }}>
              {title}
            </p>
            {descricao && (
              <p style={{
                margin: 0, width: "100%",
                fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 20, lineHeight: "22px",
                color: "#0a0e0e", letterSpacing: "-0.8px",
              }}>
                {descricao}
              </p>
            )}
          </div>

          <p style={{ margin: 0, width: "100%", fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 20, lineHeight: "24px", color: "#090909", textAlign: "center" }}>
            <span style={{ color: nameColor }}>{vencedorNome}</span>
            {" foi eleito o "}
            <span style={{ color: nameColor }}>{categoriaLabel}</span>
            {` do jogo por ${vencedorQtd} jogadores do ${grupoNome}.`}
          </p>
        </div>

        {/* AuthButton — Compartilhar */}
        <button
          ref={shareBtnRef}
          onClick={handleShare}
          disabled={sharing || !artReady}
          style={{
            marginTop: 40,
            background: "#090909", border: "1px solid #9fe870", borderRadius: 20, height: 64,
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            padding: "0 33px", cursor: sharing || !artReady ? "default" : "pointer", WebkitTapHighlightColor: "transparent",
            opacity: sharing || !artReady ? 0.7 : 1,
          }}
        >
          <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 20, color: "#9fe870" }}>
            {sharing ? "Compartilhando..." : !artReady ? "Preparando…" : "Compartilhar"}
          </span>
          <ShareNetwork size={24} color="#9fe870" weight="bold" />
        </button>

        {/* Footer */}
        <div style={{
          width: "100%", marginTop: 40,
          borderTop: `1px solid ${footerBorder}`,
          padding: "16px 16px calc(env(safe-area-inset-bottom, 0px) + 16px)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <p style={{ margin: 0, fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 12, lineHeight: "16px", color: "#fff", whiteSpace: "nowrap" }}>
            CONCLUÍDO · {data}
          </p>
        </div>
      </div>
    </div>
  );
}
