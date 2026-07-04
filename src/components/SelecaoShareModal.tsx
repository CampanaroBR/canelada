"use client";

import { useEffect, useRef, useState } from "react";
import { X, ShareNetwork, CalendarBlank, Alarm } from "@phosphor-icons/react";
import { toBlob } from "html-to-image";
import type { PersonagemSemana } from "./ShareCardModal";

const SHARE_BG = "/share-campo.jpg"; // estádio + gramado já compostos

// Pré-carrega uma imagem como data-URL — no iOS o html-to-image não embute <img>
// remoto a tempo e o fundo sai preto na captura.
function useDataUrl(src: string): string {
  const [url, setUrl] = useState(src);
  useEffect(() => {
    let on = true;
    fetch(src)
      .then((r) => r.blob())
      .then((b) => new Promise<string>((res) => { const fr = new FileReader(); fr.onload = () => res(fr.result as string); fr.readAsDataURL(b); }))
      .then((d) => { if (on) setUrl(d); })
      .catch(() => {});
    return () => { on = false; };
  }, [src]);
  return url;
}
const TSHIRT_FILLED = "/tshirt-filled.svg";
const TSHIRT_GK_FILL = "/tshirt-gk-filled.svg";

interface Props {
  selecao: (PersonagemSemana | null)[];
  grupoNome: string;
  dataRodada: string | null;
  horarioJogo: string;
  parcial: boolean; // true = "Time parcial", false = "Time da rodada"
  gkVermelho: boolean; // GK com camisa vermelha (melhores)
  onClose: () => void;
}

/** Camisa + nome (versão estática pra captura) */
function Shirt({ p, tshirt }: { p: PersonagemSemana | null; tshirt: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flex: 1 }}>
      <div style={{
        background: "#1c1c1c", border: "1px solid #666", borderRadius: 22,
        width: 48, height: 48, display: "flex", alignItems: "center", justifyContent: "center",
        // sem boxShadow: o html-to-image no iOS renderiza a sombra como quadrado escuro
        marginBottom: -8, padding: 7, overflow: "hidden", flexShrink: 0,
      }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img alt="" src={tshirt} style={{ width: 24, height: 24 }} />
      </div>
      <p style={{ margin: 0, fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 12, lineHeight: "normal", color: "#fff", textAlign: "center", whiteSpace: "nowrap", textTransform: "uppercase", maxWidth: 90, overflow: "hidden", textOverflow: "ellipsis" }}>
        {p?.vencedor ?? "?"}
      </p>
    </div>
  );
}

/** Tela full-screen pra compartilhar a escalação inteira (parcial ou fechada). */
export function SelecaoShareModal({ selecao, grupoNome, dataRodada, horarioJogo, parcial, gkVermelho, onClose }: Props) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [sharing, setSharing] = useState(false);
  const bgData = useDataUrl(SHARE_BG);
  // só libera o share com o fundo já embutido como data-URL e com alguém votado
  const bgReady = bgData.startsWith("data:");
  const temVoto = selecao.some((p) => !!p);

  async function handleShare() {
    if (sharing || !cardRef.current || !bgReady) return;
    setSharing(true);
    const texto = `${parcial ? "Parcial" : "Time"} da rodada — ${grupoNome}! ⚽`;
    try {
      // garante fontes e imagens prontas antes da captura (iOS)
      try { await document.fonts.ready; } catch { /* segue */ }
      await Promise.all(
        Array.from(cardRef.current.querySelectorAll("img")).map((img) => img.decode().catch(() => {}))
      );
      // Safari/iOS: a 1ª captura costuma sair incompleta (imagens/fontes não inline).
      // Capturamos 2x e usamos a última — workaround conhecido do html-to-image.
      await toBlob(cardRef.current, { pixelRatio: 2 });
      const blob = await toBlob(cardRef.current, { pixelRatio: 2 });
      if (!blob) throw new Error("sem blob");
      const file = new File([blob], "selecao.png", { type: "image/png" });
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], text: texto });
      } else if (navigator.share) {
        await navigator.share({ text: texto });
      } else {
        const url = URL.createObjectURL(blob);
        Object.assign(document.createElement("a"), { href: url, download: "selecao.png" }).click();
        URL.revokeObjectURL(url);
      }
    } catch (e) {
      if ((e as Error)?.name !== "AbortError") console.error(e);
    } finally {
      setSharing(false);
    }
  }

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 80, background: "#0a0e0e", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      {/* Close */}
      <button
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

      {/* Card capturável */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
        <div ref={cardRef} style={{
          position: "relative", width: "100%", maxWidth: 430, aspectRatio: "393 / 852",
          background: "#0a0e0e", overflow: "hidden",
        }}>
          {/* Fundo: estádio + gramado já compostos */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={bgData} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />

          {/* Título */}
          <div style={{ position: "absolute", top: "7.5%", left: 0, right: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
              <p style={{ margin: 0, fontFamily: "var(--font-display)", fontWeight: 900, fontSize: 28, lineHeight: "32px", color: "#fff", textAlign: "center", textTransform: "uppercase" }}>{grupoNome}</p>
              <p style={{ margin: 0, fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16, lineHeight: "20px", color: "#fff", textAlign: "center" }}>{parcial ? "Time parcial" : "Time da rodada"}</p>
            </div>
            {dataRodada && (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                <div style={{ background: "#1c1c1c", display: "flex", alignItems: "center", gap: 4, padding: "4px 8px", borderRadius: 48 }}>
                  <CalendarBlank size={16} color="#9fe870" weight="bold" />
                  <span style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 12, lineHeight: "16px", color: "#9fe870", whiteSpace: "nowrap" }}>{dataRodada}</span>
                </div>
                <div style={{ background: "#1c1c1c", display: "flex", alignItems: "center", gap: 4, padding: "4px 8px", borderRadius: 48 }}>
                  <Alarm size={16} color="#fff" weight="bold" />
                  <span style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 12, lineHeight: "16px", color: "#fff", whiteSpace: "nowrap" }}>{horarioJogo}</span>
                </div>
              </div>
            )}
          </div>

          {/* Escalação sobre o gramado */}
          <div style={{ position: "absolute", left: "13%", right: "13%", top: "39%", bottom: "27%", display: "flex", flexDirection: "column", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", justifyContent: "center", width: "60%" }}>
              <Shirt p={selecao[0]} tshirt={TSHIRT_FILLED} />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
              <Shirt p={selecao[1]} tshirt={TSHIRT_FILLED} />
              <Shirt p={selecao[2]} tshirt={TSHIRT_FILLED} />
              <Shirt p={selecao[3]} tshirt={TSHIRT_FILLED} />
            </div>
            <div style={{ display: "flex", justifyContent: "center", width: "60%" }}>
              <Shirt p={selecao[4]} tshirt={gkVermelho ? TSHIRT_GK_FILL : TSHIRT_FILLED} />
            </div>
          </div>
        </div>
      </div>

      {/* Compartilhar */}
      <div style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center", gap: 8, padding: "0 24px calc(env(safe-area-inset-bottom, 0px) + 24px)" }}>
        {!temVoto && (
          <p style={{ margin: 0, fontFamily: "var(--font-body)", fontWeight: 500, fontSize: 13, color: "#8a8a8a", textAlign: "center" }}>
            Ninguém foi votado ainda — compartilhe depois que a votação rolar.
          </p>
        )}
        <button
          onClick={handleShare}
          disabled={sharing || !bgReady || !temVoto}
          style={{
            background: !temVoto ? "#2c2c2c" : "#9fe870", border: "none", borderRadius: 20, height: 54, width: "100%", maxWidth: 382,
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            cursor: sharing || !bgReady || !temVoto ? "default" : "pointer",
            WebkitTapHighlightColor: "transparent", opacity: sharing || !bgReady ? 0.7 : 1,
          }}
        >
          <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16, lineHeight: "20px", color: !temVoto ? "#7a7a7a" : "#090909" }}>
            {sharing ? "Gerando imagem..." : !bgReady ? "Preparando…" : "Compartilhar"}
          </span>
          <ShareNetwork size={20} color={!temVoto ? "#7a7a7a" : "#090909"} weight="bold" />
        </button>
      </div>
    </div>
  );
}
