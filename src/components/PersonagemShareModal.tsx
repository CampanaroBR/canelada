"use client";

import { useRef, useState, useEffect } from "react";
import { X, ShareNetwork, Spinner } from "@phosphor-icons/react";

interface Props {
  open: boolean;
  onClose: () => void;
  tipo: string;
  apelido: string;
  data: Date;
  mascot: string;
  qtd?: number;
  grupoNome?: string;
}

const PERSONAGEM_TITLES: Record<string, string> = {
  MVP:    "MATADOR",
  BAGRE:  "BAGRE DA NOITE",
  RACUDO: "PREGUEIRO",
};

const PERSONAGEM_LABELS: Record<string, string> = {
  MVP:    "Matador",
  BAGRE:  "Bagre da Noite",
  RACUDO: "Pregueiro",
};

const SPRING_IN  = "cubic-bezier(0.32, 0.72, 0, 1)";
const SPRING_OUT = "cubic-bezier(0.4, 0, 1, 1)";

function loadImg(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.onload  = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string, x: number, y: number,
  maxW: number, lineH: number,
) {
  const words = text.split(" ");
  let line = "";
  let curY = y;
  for (const word of words) {
    const test = line + word + " ";
    if (ctx.measureText(test).width > maxW && line) {
      ctx.fillText(line.trim(), x, curY);
      line = word + " ";
      curY += lineH;
    } else {
      line = test;
    }
  }
  ctx.fillText(line.trim(), x, curY);
  return curY;
}

export function PersonagemShareModal({
  open, onClose, tipo, apelido, data, mascot, qtd = 8, grupoNome,
}: Props) {
  const [mounted, setMounted]   = useState(false);
  const [visible, setVisible]   = useState(false);
  const [sharing, setSharing]   = useState(false);

  useEffect(() => {
    if (open) {
      setMounted(true);
      requestAnimationFrame(() => requestAnimationFrame(() => setVisible(true)));
    } else {
      setVisible(false);
      const t = setTimeout(() => setMounted(false), 320);
      return () => clearTimeout(t);
    }
  }, [open]);

  if (!mounted) return null;

  const title   = PERSONAGEM_TITLES[tipo] ?? tipo;
  const label   = PERSONAGEM_LABELS[tipo] ?? tipo;
  const dateStr = new Date(data).toLocaleDateString("pt-BR", {
    day: "2-digit", month: "2-digit", year: "numeric",
  });

  /* ── Canvas → JPEG → Web Share ── */
  async function handleShare() {
    if (sharing) return;
    setSharing(true);
    try {
      // Canvas dimensions match Figma frame
      const W = 393, H = 852;
      const canvas = document.createElement("canvas");
      canvas.width  = W;
      canvas.height = H;
      const ctx = canvas.getContext("2d")!;

      // 1. Background
      const bgImg = await loadImg("/ilustracoes/share-bg.png");
      ctx.drawImage(bgImg, 0, 0, W, H);

      // 2. Glow behind character (approximated with radial gradient)
      const glow = ctx.createRadialGradient(W / 2, 250, 0, W / 2, 250, 145);
      glow.addColorStop(0, "rgba(10,92,105,0.85)");
      glow.addColorStop(1, "rgba(10,92,105,0)");
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.ellipse(W / 2, 250, 180, 180, 0, 0, Math.PI * 2);
      ctx.fill();

      // 3. Mascot illustration (300×300, centered, top: 82)
      const mascotImg = await loadImg(mascot);
      ctx.drawImage(mascotImg, (W - 300) / 2, 82, 300, 300);

      // 4. Title text (Barlow Condensed Bold 56px, white, centered)
      await document.fonts.load("bold 56px 'Barlow Condensed'");
      ctx.font        = "bold 56px 'Barlow Condensed', sans-serif";
      ctx.fillStyle   = "#ffffff";
      ctx.textAlign   = "center";
      ctx.textBaseline = "top";
      wrapText(ctx, title, W / 2, 395, W - 32, 64);

      // 5. Description text — Inter SemiBold 20px, mixed colors
      await document.fonts.load("600 20px 'Inter'");
      ctx.font          = "600 20px 'Inter', sans-serif";
      ctx.textAlign     = "left";
      ctx.textBaseline  = "top";

      const descY  = 540;
      const descX  = 40;
      const maxDescW = 313;
      const lineH  = 26;

      // Build colored segments
      const segments: { text: string; color: string }[] = [
        { text: apelido,     color: "#9fe870" },
        { text: " foi eleito o ", color: "#ffffff" },
        { text: label,       color: "#9fe870" },
        { text: ` do jogo por ${qtd} jogadores${grupoNome ? ` do ${grupoNome}` : ""}.`, color: "#ffffff" },
      ];

      // Measure + word-wrap the mixed-color paragraph
      let cx = descX, cy = descY;
      for (const seg of segments) {
        ctx.fillStyle = seg.color;
        const words = seg.text.split(/(\s+)/);
        for (const chunk of words) {
          const w = ctx.measureText(chunk).width;
          if (cx + w > descX + maxDescW && chunk.trim()) {
            cy += lineH;
            cx  = descX;
          }
          ctx.fillText(chunk, cx, cy);
          cx += w;
        }
      }

      // 6. Footer bar
      ctx.fillStyle = "#0a0e0e";
      ctx.fillRect(0, H - 56, W, 56);
      ctx.strokeStyle = "#42bace";
      ctx.lineWidth   = 1;
      ctx.beginPath();
      ctx.moveTo(0, H - 56);
      ctx.lineTo(W, H - 56);
      ctx.stroke();
      ctx.font          = "600 12px 'Barlow Condensed', sans-serif";
      ctx.fillStyle     = "#ffffff";
      ctx.textAlign     = "center";
      ctx.textBaseline  = "middle";
      ctx.letterSpacing = "0.5px";
      ctx.fillText(`CONCLUÍDO · ${dateStr}`, W / 2, H - 28);

      // 7. Export as JPEG blob
      const blob: Blob = await new Promise((res, rej) =>
        canvas.toBlob(b => (b ? res(b) : rej(new Error("toBlob failed"))), "image/jpeg", 0.92)
      );
      const file = new File([blob], "canelada.jpg", { type: "image/jpeg" });

      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: `${apelido} é o ${label}! 🏆` });
      } else {
        // Fallback: download
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url; a.download = "canelada.jpg"; a.click();
        URL.revokeObjectURL(url);
      }
    } catch (e) {
      if ((e as Error)?.name !== "AbortError") console.error(e);
    } finally {
      setSharing(false);
    }
  }

  const dur  = visible ? "380ms" : "260ms";
  const ease = visible ? SPRING_IN : SPRING_OUT;

  return (
    /* Backdrop */
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 100,
        display: "flex", justifyContent: "center",
        background: "rgba(0,0,0,0.6)",
        backdropFilter: "blur(2px)", WebkitBackdropFilter: "blur(2px)",
        transition: `opacity ${dur} ease`,
        opacity: visible ? 1 : 0,
        touchAction: "none",
      }}
    >
      {/* Mobile frame */}
      <div
        role="dialog"
        aria-modal="true"
        onClick={e => e.stopPropagation()}
        style={{
          position: "relative",
          width: "100%", maxWidth: 430,
          height: "100%",
          background: "#0a0e0e",
          overflow: "hidden",
          display: "flex", flexDirection: "column",
          transition: `transform ${dur} ${ease}`,
          transform: visible ? "translateY(0)" : "translateY(100%)",
          willChange: "transform",
        }}
      >

        {/* ── VISUAL AREA (flex-1 — captured as JPEG) ── */}
        <div style={{
          flex: 1, minHeight: 0,
          position: "relative",
          overflow: "hidden",
        }}>
          {/* Background image */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            aria-hidden alt="" src="/ilustracoes/share-bg.png"
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", pointerEvents: "none" }}
          />

          {/* Close button — absolute top-right */}
          <button
            onClick={onClose}
            aria-label="Fechar"
            style={{
              position: "absolute", top: 15, right: 16, zIndex: 2,
              width: 48, height: 48,
              background: "#000", border: "1px solid #424242",
              borderRadius: 24,
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer",
            }}
          >
            <X size={16} color="#fff" weight="bold" />
          </button>

          {/* Content: character + title + description centered vertically */}
          <div style={{
            position: "absolute", inset: 0,
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
            gap: 0,
            paddingTop: 16, paddingBottom: 16,
          }}>
            {/* Illustration 300×300 */}
            <div style={{ position: "relative", width: 300, height: 300, flexShrink: 0 }}>
              <div aria-hidden style={{
                position: "absolute", top: "50%", left: "50%",
                transform: "translate(-50%,-50%)",
                width: 289, height: 296,
                background: "#0a5c69", filter: "blur(88.6px)",
                borderRadius: "50%", pointerEvents: "none",
              }} />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={mascot} alt={title}
                style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "contain" }}
              />
            </div>

            {/* Title */}
            <p style={{
              margin: "8px 0 0",
              width: 300,
              fontFamily: "var(--font-display)", fontWeight: 700,
              fontSize: 56, lineHeight: "64px", letterSpacing: "-2px",
              color: "#fff", textAlign: "center",
            }}>
              {title}
            </p>

            {/* Description */}
            <p style={{
              margin: "32px 0 0",
              width: 313,
              fontFamily: "var(--font-body)", fontWeight: 600,
              fontSize: 20, lineHeight: "26px", color: "#fff", letterSpacing: "-1px",
            }}>
              <span style={{ color: "#9fe870" }}>{apelido}</span>
              {" foi eleito o "}
              <span style={{ color: "#9fe870" }}>{label}</span>
              {` do jogo por ${qtd} jogadores${grupoNome ? ` do ${grupoNome}` : ""}.`}
            </p>
          </div>
        </div>

        {/* ── SHARE BUTTON ── */}
        <div style={{
          flexShrink: 0,
          display: "flex", justifyContent: "center",
          padding: "20px 24px 16px",
          background: "#0a0e0e",
          position: "relative", zIndex: 1,
        }}>
          <button
            onClick={handleShare}
            disabled={sharing}
            style={{
              background: "#171717", border: "none",
              borderRadius: 22, height: 64,
              padding: "16px 32px",
              display: "flex", alignItems: "center", gap: 8,
              cursor: sharing ? "default" : "pointer",
              boxShadow: "4px 8px 8px 4px rgba(0,0,0,0.08)",
              whiteSpace: "nowrap", opacity: sharing ? 0.7 : 1,
            }}
          >
            {sharing
              ? <Spinner size={20} color="#9fe870" style={{ animation: "spin 1s linear infinite" }} />
              : <ShareNetwork size={20} color="#9fe870" weight="bold" />
            }
            <span style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 18, lineHeight: "24px", color: "#9fe870" }}>
              {sharing ? "Gerando..." : "Compartilhar"}
            </span>
          </button>
        </div>

        {/* ── FOOTER ── */}
        <div style={{
          flexShrink: 0,
          height: 56, borderTop: "1px solid #42bace",
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: "0 14px",
          background: "#0a0e0e",
          position: "relative", zIndex: 1,
        }}>
          <span style={{
            fontFamily: "var(--font-display)", fontWeight: 600,
            fontSize: 12, lineHeight: "15px",
            color: "#fff", letterSpacing: "0.5px",
            textTransform: "uppercase", whiteSpace: "nowrap",
          }}>
            CONCLUÍDO · {dateStr}
          </span>
        </div>
      </div>
    </div>
  );
}
