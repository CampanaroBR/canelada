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

// Arte "assada" (fundo + mascote + título + descrição já renderizados numa
// imagem 2x) igual matador/categoria/paredão — evita qualquer risco de layout
// quebrar em viewport real (o que aconteceu repetidamente tentando montar
// tudo em camadas CSS vivas). Só a frase do vencedor, o botão e o rodapé
// ficam por cima, dinâmicos.
export function PremioScreen({
  slug, title, bakedImg, nameColor, footerBorder,
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
    <div style={{ position: "fixed", inset: 0, zIndex: 60, background: "#0a0e0e", display: "flex", justifyContent: "center", alignItems: "flex-start", overflowY: "auto" }}>
      {/* Wrapper com a MESMA proporção da arte (393:852) — preenche a largura
          toda (sem barras pretas laterais). Com a descrição curta já sobra
          espaço de sobra antes do botão/rodapé na maioria dos aparelhos;
          overflowY:auto no pai é só uma rede de segurança pra telas muito
          baixas, não a estratégia principal (que seria encolher o card
          inteiro e criar as barras laterais indesejadas).
          alignItems:"flex-start" é obrigatório — o padrão do flexbox é
          "stretch", que estica esse wrapper e anula o aspectRatio. */}
      <div ref={cardRef} style={{ position: "relative", width: "100%", maxWidth: 430, aspectRatio: "393 / 852", flexShrink: 0 }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img alt={title} src={artData} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />

        {/* Close Button */}
        <button
          ref={closeBtnRef}
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

        {/* Overlays na zona inferior da arte — frase do vencedor, botão, rodapé */}
        <div style={{
          position: "absolute", left: 0, right: 0, bottom: 0,
          display: "flex", flexDirection: "column", alignItems: "center",
          gap: 24, padding: "0 24px 0",
        }}>
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
            padding: "16px 14px calc(env(safe-area-inset-bottom, 0px) + 20px)",
            marginTop: 8,
          }}>
            <p style={{ margin: 0, fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 12, lineHeight: "15px", color: "#fff", letterSpacing: "0.5px", whiteSpace: "nowrap" }}>
              CONCLUÍDO · {data}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
