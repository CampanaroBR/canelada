"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { toPng } from "html-to-image";
import { X, ShareNetwork } from "@phosphor-icons/react";

export type PersonagemSemana = {
  slug: string;
  nome: string;
  emoji: string | null;
  art: string;
  vencedor: string;
  votos: number;
};

interface Props {
  personagem: PersonagemSemana;
  grupoNome: string;
  onClose: () => void;
}

/** Card premium full-screen do personagem da semana — arte bakeada + compartilhar. */
export function ShareCardModal({ personagem, grupoNome, onClose }: Props) {
  const [sharing, setSharing] = useState(false);
  const { nome, art, vencedor, votos } = personagem;
  const cardRef = useRef<HTMLDivElement>(null);
  const shareBtnRef = useRef<HTMLButtonElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  async function handleShare() {
    if (sharing || !cardRef.current) return;
    setSharing(true);
    const texto = `${vencedor} foi eleito o ${nome} do jogo por ${votos} jogadores do ${grupoNome}! ⚽`;
    try {
      // Captura a tela real (arte + nome do vencedor sobreposto), não só a
      // arte estática — senão a imagem compartilhada fica "vazia" (genérica).
      const dataUrl = await toPng(cardRef.current, {
        pixelRatio: 2, cacheBust: true,
        filter: (n) => n !== shareBtnRef.current && n !== closeBtnRef.current,
      });
      const blob = await (await fetch(dataUrl)).blob();
      const file = new File([blob], `${personagem.slug}.png`, { type: "image/png" });
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], text: texto });
      } else if (navigator.share) {
        await navigator.share({ text: texto });
      } else {
        const url = URL.createObjectURL(blob);
        Object.assign(document.createElement("a"), { href: url, download: `${personagem.slug}.png` }).click();
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
      <Image alt={nome} src={art} fill priority sizes="430px" style={{ objectFit: "cover" }} />

      {/* Close */}
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
        <X size={16} color="#fff" weight="bold" />
      </button>

      {/* Overlays na zona inferior */}
      <div style={{
        position: "absolute", left: 0, right: 0, bottom: 0,
        display: "flex", flexDirection: "column", alignItems: "center", gap: 24, padding: "0 24px 0",
      }}>
        <p style={{ margin: 0, maxWidth: 320, fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 20, lineHeight: "24px", color: "#fff", letterSpacing: "-1px", textAlign: "center" }}>
          <span style={{ color: "#9fe870" }}>{vencedor}</span>
          {" foi eleito o "}
          <span style={{ color: "#9fe870" }}>{nome}</span>
          {` do jogo por ${votos} jogadores do ${grupoNome}.`}
        </p>

        <button
          ref={shareBtnRef}
          onClick={handleShare}
          style={{
            background: "#9fe870", border: "none", borderRadius: 20, height: 54,
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            padding: "0 24px", cursor: "pointer", WebkitTapHighlightColor: "transparent",
            opacity: sharing ? 0.7 : 1,
          }}
        >
          <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16, lineHeight: "20px", color: "#090909" }}>
            {sharing ? "Compartilhando..." : "Compartilhar"}
          </span>
          <ShareNetwork size={20} color="#090909" weight="bold" />
        </button>

        <div style={{
          width: "100%", borderTop: "1px solid rgba(255,255,255,0.25)",
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: "16px 14px calc(env(safe-area-inset-bottom, 0px) + 20px)", marginTop: 8,
        }}>
          <p style={{ margin: 0, fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 12, lineHeight: "15px", color: "#fff", letterSpacing: "0.5px", whiteSpace: "nowrap" }}>
            {votos} VOTOS · PERSONAGEM DA SEMANA
          </p>
        </div>
      </div>
    </div>
  );
}
