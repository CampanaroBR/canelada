"use client";

import { useEffect, useRef, useState } from "react";
import { toBlob } from "html-to-image";
import { X, Share } from "reicon-react";

export interface ShareArtCardProps {
  /** Usado no nome do arquivo compartilhado/baixado. */
  slug: string;
  /** Arte "assada" full-bleed (fundo + mascote + título já compostos). */
  artSrc: string;
  altText: string;
  onClose: () => void;
  /** Texto passado pro navigator.share / usado como legenda. */
  shareText: string;
  descricao?: string | null;
  /** Frase do vencedor, com os nomes já destacados (ex.: <>{nome} foi eleito o <b>X</b>...</>). */
  sentence: React.ReactNode;
  footerText: string;
  footerBorder: string;
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

/**
 * Card full-screen padrão pra "prêmio"/"personagem da semana": arte assada
 * (fundo + mascote + título, canvas fixo 393x852 @2x) full-bleed via
 * position:fixed+cover, com descrição/frase do vencedor/botão/rodapé como
 * overlay absoluto na zona inferior — a área em branco da arte já é o espaço
 * reservado pro overlay, sem vão nem corte em nenhum aparelho. O que pode
 * quebrar em 2 linhas e sobrepor o overlay é o TÍTULO ASSADO NA IMAGEM — isso
 * se corrige regerando a arte com fonte menor pra caber numa linha só, não
 * trocando o layout inteiro.
 */
export function ShareArtCard({
  slug, artSrc, altText, onClose, shareText, descricao, sentence, footerText, footerBorder,
}: ShareArtCardProps) {
  const [sharing, setSharing] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const shareBtnRef = useRef<HTMLButtonElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const artData = useDataUrl(artSrc);
  const artReady = artData.startsWith("data:");

  async function handleShare() {
    if (sharing || !cardRef.current || !artReady) return;
    setSharing(true);
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
        await navigator.share({ files: [file], text: shareText });
      } else if (navigator.share) {
        await navigator.share({ text: shareText });
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
    <div ref={cardRef} style={{ position: "fixed", inset: 0, zIndex: 80, background: "#0a0e0e", overflow: "hidden" }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img alt={altText} src={artData} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />

      <button
        ref={closeBtnRef}
        onClick={onClose}
        aria-label="Fechar"
        style={{
          position: "absolute", top: "calc(env(safe-area-inset-top, 0px) + 16px)", right: 16, zIndex: 2,
          width: 48, height: 48, background: "#000", border: "1px solid #424242", borderRadius: 24,
          display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
        }}
      >
        <X size={16} color="#fff" weight="Outline" />
      </button>

      <div style={{
        position: "absolute", left: 0, right: 0, bottom: 0,
        display: "flex", flexDirection: "column", alignItems: "center", gap: 24, padding: "0 24px 0",
      }}>
        {descricao && (
          <p style={{ margin: 0, maxWidth: 340, fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 20, lineHeight: "24px", color: "#fff", textAlign: "center" }}>
            {descricao}
          </p>
        )}

        <p style={{ margin: 0, maxWidth: 320, fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 20, lineHeight: "24px", color: "#fff", letterSpacing: "-1px", textAlign: "center" }}>
          {sentence}
        </p>

        {/* Sem `disabled` nativo: em alguns navegadores mobile (Samsung Internet,
            WebViews OEM) um <button disabled> ignora background/border customizados
            e cai no chrome nativo do SO, ficando invisível sobre o fundo. */}
        <button
          ref={shareBtnRef}
          onClick={handleShare}
          aria-disabled={sharing || !artReady}
          style={{
            appearance: "none", WebkitAppearance: "none",
            background: "#090909", border: "1px solid #9fe870", borderRadius: 20, height: 64,
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            padding: "0 24px", cursor: sharing || !artReady ? "default" : "pointer", WebkitTapHighlightColor: "transparent",
            opacity: sharing || !artReady ? 0.7 : 1,
          }}
        >
          <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16, lineHeight: "20px", color: "#9fe870" }}>
            {sharing ? "Compartilhando..." : !artReady ? "Preparando…" : "Compartilhar"}
          </span>
          <Share size={20} color="#9fe870" weight="Outline" />
        </button>

        <div style={{
          width: "100%", borderTop: `1px solid ${footerBorder}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: "16px 14px calc(env(safe-area-inset-bottom, 0px) + 20px)", marginTop: 8,
        }}>
          <p style={{ margin: 0, fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 12, lineHeight: "15px", color: "#fff", letterSpacing: "0.5px", whiteSpace: "nowrap" }}>
            {footerText}
          </p>
        </div>
      </div>
    </div>
  );
}
