"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toBlob } from "html-to-image";
import { X, ShareNetwork } from "@phosphor-icons/react";

interface Props {
  slug: string;
  title: string;
  bakedImg: string;
  nameColor: string;
  footerBorder: string;
  descricao: string | null;
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

// Mesmo padrão do ShareCardModal (personagem da semana): arte "assada" (fundo +
// mascote + título + emoji, canvas fixo 393x852 @2x). A arte fica num container
// com aspect-ratio travado na proporção do canvas (393:852) — nunca esticada
// nem cortada — e o resto (descrição, frase do vencedor, botão, rodapé) flui
// normalmente LOGO ABAIXO dela, em vez de ficar em overlay absoluto ancorado no
// fundo real da tela. Overlay absoluto + object-fit:cover full-bleed foi
// abandonado porque em telas com proporção diferente da arte (ex.: barra de
// endereço visível reduzindo a altura útil), o corte do cover empurrava o
// título/emoji da arte pra mais perto do fundo real da tela, onde o overlay
// já estava fixo — resultado: título ou emoji cortados por trás do texto ao
// vivo. Com fluxo normal isso é estruturalmente impossível de acontecer.
export function PremioScreen({
  slug, title, bakedImg, nameColor, footerBorder, descricao,
  vencedorNome, vencedorQtd, categoriaLabel, grupoNome, data,
}: Props) {
  const router = useRouter();
  const [sharing, setSharing] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const shareBtnRef = useRef<HTMLButtonElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const artData = useDataUrl(bakedImg);
  const artReady = artData.startsWith("data:");

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
    <div ref={cardRef} style={{
      position: "fixed", inset: 0, zIndex: 80, background: "#0a0e0e",
      overflowY: "auto", WebkitOverflowScrolling: "touch",
      display: "flex", flexDirection: "column",
    }}>
      <div style={{ position: "relative", width: "100%", aspectRatio: "786 / 1704", flexShrink: 0 }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img alt={title} src={artData} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />

        <button
          ref={closeBtnRef}
          onClick={() => router.back()}
          aria-label="Fechar"
          style={{
            position: "absolute", top: "calc(env(safe-area-inset-top, 0px) + 16px)", right: 16, zIndex: 2,
            width: 48, height: 48, background: "#000", border: "1px solid #424242", borderRadius: 24,
            display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
          }}
        >
          <X size={16} color="#fff" weight="bold" />
        </button>
      </div>

      <div style={{
        flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 24, padding: "24px 24px 0",
      }}>
        {descricao && (
          <p style={{ margin: 0, maxWidth: 340, fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 20, lineHeight: "24px", color: "#fff", textAlign: "center" }}>
            {descricao}
          </p>
        )}

        <p style={{ margin: 0, maxWidth: 320, fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 20, lineHeight: "24px", color: "#fff", letterSpacing: "-1px", textAlign: "center" }}>
          <span style={{ color: nameColor }}>{vencedorNome}</span>
          {" foi eleito o "}
          <span style={{ color: nameColor }}>{categoriaLabel}</span>
          {` do jogo por ${vencedorQtd} jogadores do ${grupoNome}.`}
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
          <ShareNetwork size={20} color="#9fe870" weight="bold" />
        </button>

        <div style={{
          width: "100%", borderTop: `1px solid ${footerBorder}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: "16px 14px calc(env(safe-area-inset-bottom, 0px) + 20px)", marginTop: 8,
        }}>
          <p style={{ margin: 0, fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 12, lineHeight: "15px", color: "#fff", letterSpacing: "0.5px", whiteSpace: "nowrap" }}>
            CONCLUÍDO · {data}
          </p>
        </div>
      </div>
    </div>
  );
}
