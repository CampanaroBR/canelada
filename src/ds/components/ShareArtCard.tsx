"use client";

import { useEffect, useRef, useState } from "react";
import { toBlob } from "html-to-image";
import { X, Export } from "reicon-react";

export interface ShareArtCardProps {
  /** Usado no nome do arquivo compartilhado/baixado. */
  slug: string;
  /** Fundo sem título (arte única do card, ex.: /votacao-bg/frangueiro.png). */
  bgSrc: string;
  /** Mascote transparente completo (ex.: /votacao-mascot/frangueiro.png). */
  mascotSrc: string;
  /** Título renderizado como texto de verdade (ex.: "FRANGUEIRO"). */
  title: string;
  /** Cor do título — preto pra fundo claro, branco pra escuro. */
  titleColor: string;
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
 * Card full-screen padrão pra "prêmio"/"personagem da semana". Compõe a arte AO
 * VIVO — fundo sem título (cover) + mascote transparente (contain) + título como
 * texto de verdade — em vez de uma arte JPG achatada com o título assado. Isso
 * elimina o título pixelado/serrilhado que dependia da qualidade do export, e
 * deixa a cor do título ajustável por card (preto/branco conforme o fundo).
 * Descrição/frase do vencedor/botão/rodapé ficam como overlay na zona inferior.
 */
export function ShareArtCard({
  slug, bgSrc, mascotSrc, title, titleColor, altText, onClose, shareText, descricao, sentence, footerText, footerBorder,
}: ShareArtCardProps) {
  const [sharing, setSharing] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const shareBtnRef = useRef<HTMLButtonElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const bgData = useDataUrl(bgSrc);
  const mascotData = useDataUrl(mascotSrc);
  const artReady = bgData.startsWith("data:") && mascotData.startsWith("data:");
  // Sem sombra no título — a cor (preto/branco) já garante o contraste. Sombra
  // pesada deixava o texto "sujo"/borrado. O texto do corpo/rodapé segue a mesma
  // cor do título pra manter contraste em fundo claro ou escuro.
  const bodyColor = titleColor;
  // O título fica na faixa entre os triângulos e no design é sempre uma linha
  // só — nomes longos ("GOL MAIS BONITO") quebravam em duas e invadiam a arte.
  const titleSize = title.length > 14 ? 32 : title.length > 10 ? 38 : 44;

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
      {/* Fundo sem título (cover) */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img aria-hidden alt="" src={bgData} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />

      {/* Mascote + título ao vivo, na metade superior */}
      <div style={{
        position: "absolute", top: "calc(env(safe-area-inset-top, 0px) + 6%)", left: 0, right: 0,
        display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
      }}>
        <div style={{ width: "72%", maxWidth: 320, aspectRatio: "1 / 1", position: "relative" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img alt={altText} src={mascotData} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "contain" }} />
        </div>
        <p style={{
          margin: 0, padding: "0 24px",
          fontFamily: "var(--font-display)", fontWeight: 900, fontSize: titleSize, lineHeight: 1.05,
          letterSpacing: "-0.5px", color: titleColor, textAlign: "center",
          textTransform: "uppercase", whiteSpace: "nowrap",
        }}>
          {title}
        </p>
      </div>

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
          <p style={{ margin: 0, maxWidth: 340, fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 20, lineHeight: "24px", color: bodyColor, textAlign: "center" }}>
            {descricao}
          </p>
        )}

        <p style={{ margin: 0, maxWidth: 320, fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 20, lineHeight: "24px", color: bodyColor, letterSpacing: "-1px", textAlign: "center" }}>
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
          <Export size={20} color="#9fe870" weight="Outline" />
        </button>

        <div style={{
          width: "100%", borderTop: `1px solid ${footerBorder}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: "16px 14px calc(env(safe-area-inset-bottom, 0px) + 20px)", marginTop: 8,
        }}>
          <p style={{ margin: 0, fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 12, lineHeight: "15px", color: bodyColor, letterSpacing: "0.5px", whiteSpace: "nowrap" }}>
            {footerText}
          </p>
        </div>
      </div>
    </div>
  );
}
