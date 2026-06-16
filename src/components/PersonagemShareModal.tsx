"use client";

import { useState, useEffect } from "react";
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

const TITLES: Record<string, string> = {
  MVP:    "MATADOR",
  BAGRE:  "BAGRE DA NOITE",
  RACUDO: "PREGUEIRO",
};
const LABELS: Record<string, string> = {
  MVP:    "Matador",
  BAGRE:  "Bagre da Noite",
  RACUDO: "Pregueiro",
};

const SPRING_IN  = "cubic-bezier(0.32, 0.72, 0, 1)";
const SPRING_OUT = "cubic-bezier(0.4, 0, 1, 1)";

/* ── Canvas helpers ─────────────────────────────────────────── */

function loadImg(src: string): Promise<HTMLImageElement> {
  return new Promise((res, rej) => {
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.onload  = () => res(img);
    img.onerror = rej;
    // Absolute URL so the browser can fetch from origin
    img.src = src.startsWith("http") ? src : window.location.origin + src;
  });
}

/** Draw coloured rich-text paragraph on canvas, returns final Y */
function drawRichText(
  ctx: CanvasRenderingContext2D,
  segments: { text: string; color: string }[],
  x: number, startY: number,
  maxW: number, lineH: number,
  font: string,
): number {
  ctx.font         = font;
  ctx.textBaseline = "top";
  ctx.textAlign    = "left";

  let cx = x, cy = startY;
  for (const { text, color } of segments) {
    ctx.fillStyle = color;
    // Split preserving spaces so we can wrap word by word
    const tokens = text.split(/(\s)/);
    for (const tok of tokens) {
      const w = ctx.measureText(tok).width;
      if (tok !== " " && cx + w > x + maxW && cx > x) {
        cy += lineH;
        cx  = x;
      }
      ctx.fillText(tok, cx, cy);
      cx += w;
    }
  }
  return cy;
}

/**
 * Renders the share card (Figma 194-267) on a canvas and returns a JPEG Blob.
 * Fixed 393×848px — no UI chrome, only background + glow + mascot + title + description.
 */
async function buildShareJpeg(
  mascotSrc: string,
  title: string,
  label: string,
  apelido: string,
  qtd: number,
  grupoNome?: string,
): Promise<Blob> {
  // Exact dimensions from Figma node 194-267
  const W = 393, H = 848;

  const [bgImg, mascotImg] = await Promise.all([
    loadImg("/ilustracoes/share-bg.png"),
    loadImg(mascotSrc),
  ]);
  await document.fonts.ready;

  // Layout constants
  const TOP     = 80;   // character starts at y:80 — some breathing room from top
  const IMGSIZE = 300;
  const TITLEW  = 300;
  const DESCW   = 313;
  const SCALE   = 2;   // 2x for sharp JPEG

  // Pre-measure title lines (Barlow Condensed Bold 56px)
  const tmpCanvas = document.createElement("canvas");
  const tmpCtx    = tmpCanvas.getContext("2d")!;
  tmpCtx.font     = "bold 56px 'Barlow Condensed', sans-serif";
  const titleLines = (() => {
    const words = title.split(" ");
    const lines: string[] = [];
    let line = "";
    for (const w of words) {
      const test = line + w + " ";
      if (tmpCtx.measureText(test).width > TITLEW && line) {
        lines.push(line.trim()); line = w + " ";
      } else { line = test; }
    }
    if (line.trim()) lines.push(line.trim());
    return lines;
  })();

  const canvas = document.createElement("canvas");
  canvas.width  = W * SCALE;
  canvas.height = H * SCALE;
  const ctx = canvas.getContext("2d")!;
  ctx.scale(SCALE, SCALE);;

  // 1. Background (cover-crop to fill 393×848)
  const scale = Math.max(W / bgImg.width, H / bgImg.height);
  const bw = bgImg.width * scale, bh = bgImg.height * scale;
  ctx.drawImage(bgImg, (W - bw) / 2, (H - bh) / 2, bw, bh);

  // 2. Glow behind mascot
  const glowCX = W / 2, glowCY = TOP + IMGSIZE / 2;
  const glow = ctx.createRadialGradient(glowCX, glowCY, 0, glowCX, glowCY, 145);
  glow.addColorStop(0, "rgba(10,92,105,0.9)");
  glow.addColorStop(1, "rgba(10,92,105,0)");
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.ellipse(glowCX, glowCY, 180, 180, 0, 0, Math.PI * 2);
  ctx.fill();

  // 3. Mascot
  ctx.drawImage(mascotImg, (W - IMGSIZE) / 2, TOP, IMGSIZE, IMGSIZE);

  // 4. Title (centered, Barlow Condensed Bold 56px / lh 64)
  ctx.font          = "bold 56px 'Barlow Condensed', sans-serif";
  ctx.fillStyle     = "#ffffff";
  ctx.textAlign     = "center";
  ctx.textBaseline  = "top";
  let titleY = TOP + IMGSIZE + 8;
  for (const line of titleLines) {
    ctx.fillText(line, W / 2, titleY);
    titleY += 54;
  }

  // 5. Description (Inter SemiBold 20px, mixed colors)
  const descY = titleY + 64;
  drawRichText(
    ctx,
    [
      { text: apelido, color: "#9fe870" },
      { text: " foi eleito o ", color: "#ffffff" },
      { text: label,   color: "#9fe870" },
      { text: ` do jogo por ${qtd} jogadores${grupoNome ? ` do ${grupoNome}` : ""}.`, color: "#ffffff" },
    ],
    (W - DESCW) / 2, descY, DESCW, 26,
    "600 20px 'Inter', sans-serif",
  );

  return new Promise((res, rej) =>
    canvas.toBlob(b => (b ? res(b) : rej(new Error("toBlob failed"))), "image/jpeg", 0.93)
  );
}

/* ── Component ──────────────────────────────────────────────── */

export function PersonagemShareModal({
  open, onClose, tipo, apelido, data, mascot, qtd = 8, grupoNome,
}: Props) {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const [sharing, setSharing] = useState(false);

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

  const title   = TITLES[tipo] ?? tipo;
  const label   = LABELS[tipo] ?? tipo;
  const dateStr = new Date(data).toLocaleDateString("pt-BR", {
    day: "2-digit", month: "2-digit", year: "numeric",
  });

  async function handleShare() {
    if (sharing) return;
    setSharing(true);
    try {
      const blob = await buildShareJpeg(mascot, title, label, apelido, qtd, grupoNome);
      const file = new File([blob], "canelada.jpg", { type: "image/jpeg" });
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: `${apelido} é o ${label}! 🏆` });
      } else {
        // Desktop fallback — download
        const url = URL.createObjectURL(blob);
        Object.assign(document.createElement("a"), { href: url, download: "canelada.jpg" }).click();
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
    <>
      {/* Backdrop — separate from modal to avoid compositing artifacts */}
      <div
        aria-hidden
        onClick={onClose}
        style={{
          position: "absolute", inset: 0, zIndex: 100,
          background: "rgba(0,0,0,0.6)",
          backdropFilter: "blur(2px)", WebkitBackdropFilter: "blur(2px)",
          transition: `opacity ${dur} ease`,
          opacity: visible ? 1 : 0,
          touchAction: "none",
        }}
      />

      {/* Modal positioner */}
      <div
        style={{
          position: "absolute", inset: 0, zIndex: 101,
          display: "flex", justifyContent: "center",
          pointerEvents: "none",
          touchAction: "none",
        }}
      >
        {/* ── Mobile frame ── */}
        <div
          role="dialog"
          aria-modal="true"
          onClick={e => e.stopPropagation()}
          style={{
            position: "relative",
            width: "100%", maxWidth: 430, height: "100%",
            background: "#0a0e0e",
            overflow: "hidden",
            display: "flex", flexDirection: "column",
            pointerEvents: "auto",
            transition: `transform ${dur} ${ease}`,
            transform: visible ? "translateY(0)" : "translateY(100%)",
            willChange: "transform",
          }}
        >
          {/* Background — covers full modal */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            aria-hidden alt="" src="/ilustracoes/share-bg.png"
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", pointerEvents: "none", zIndex: 0 }}
          />
          {/* Dark gradient at top to cover light beams behind close button */}
          <div aria-hidden style={{
            position: "absolute", top: 0, left: 0, right: 0, height: 110,
            background: "linear-gradient(to bottom, rgba(8,22,26,0.72) 0%, transparent 100%)",
            pointerEvents: "none", zIndex: 0,
          }} />

          {/* ── Close button ── */}
          <div style={{
            position: "relative", zIndex: 1,
            width: "100%", flexShrink: 0,
            display: "flex", justifyContent: "flex-end",
            padding: "15px 16px 0 10px",
          }}>
            <button
              onClick={onClose}
              aria-label="Fechar"
              style={{
                width: 48, height: 48,
                background: "#000", border: "1px solid #424242",
                borderRadius: 24,
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer",
              }}
            >
              <X size={16} color="#fff" weight="bold" />
            </button>
          </div>

          {/* ── Main content: illustration + title + description (top) | share button (bottom) ── */}
          <div style={{
            position: "relative", zIndex: 1,
            flex: 1, minHeight: 0,
            width: "100%",
            display: "flex", flexDirection: "column",
            alignItems: "center",
            justifyContent: "space-between",
            paddingTop: 16,
            overflow: "hidden",
          }}>
            {/* Upper group: illustration + title + description */}
            <div style={{
              display: "flex", flexDirection: "column",
              alignItems: "center", gap: 16,
              width: 313,
            }}>
              {/* Illustration + title */}
              <div style={{
                display: "flex", flexDirection: "column",
                alignItems: "center", gap: 8, width: 300,
              }}>
                <div style={{ position: "relative", width: 300, height: 300, flexShrink: 0 }}>
                  <div aria-hidden style={{
                    position: "absolute", top: "50%", left: "50%",
                    transform: "translate(-50%,-50%)",
                    width: 289, height: 296,
                    background: "#0a5c69", filter: "blur(88.6px)",
                    borderRadius: "50%", pointerEvents: "none",
                  }} />
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={mascot} alt={title} style={{
                    position: "absolute", inset: 0,
                    width: "100%", height: "100%", objectFit: "contain",
                  }} />
                </div>
                <p style={{
                  margin: 0, width: 300,
                  fontFamily: "var(--font-display)", fontWeight: 700,
                  fontSize: 56, lineHeight: "54px", letterSpacing: "-2px",
                  color: "#fff", textAlign: "center",
                }}>
                  {title}
                </p>
              </div>

              {/* Description */}
              <p style={{
                margin: 0, width: 313,
                fontFamily: "var(--font-body)", fontWeight: 600,
                fontSize: 20, lineHeight: "24px",
                color: "#fff", letterSpacing: "-1px",
              }}>
                <span style={{ color: "#9fe870" }}>{apelido}</span>
                {" foi eleito o "}
                <span style={{ color: "#9fe870" }}>{label}</span>
                {` do jogo por ${qtd} jogadores${grupoNome ? ` do ${grupoNome}` : ""}.`}
              </p>
            </div>

            {/* Share button */}
            <button
              onClick={handleShare}
              disabled={sharing}
              style={{
                flexShrink: 0,
                background: "#171717", border: "none",
                borderRadius: 22, height: 64, padding: "16px 24px",
                display: "flex", alignItems: "center", gap: 8,
                cursor: sharing ? "default" : "pointer",
                boxShadow: "4px 8px 8px 4px rgba(0,0,0,0.08)",
                whiteSpace: "nowrap", opacity: sharing ? 0.7 : 1,
                marginBottom: 16,
              }}
            >
              {sharing
                ? <Spinner size={20} color="#9fe870" />
                : <ShareNetwork size={20} color="#9fe870" weight="bold" />
              }
              <span style={{
                fontFamily: "var(--font-display)", fontWeight: 600,
                fontSize: 18, lineHeight: "24px", color: "#9fe870",
              }}>
                {sharing ? "Gerando..." : "Compartilhar"}
              </span>
            </button>
          </div>

          {/* ── Footer ── */}
          <div style={{
            position: "relative", zIndex: 1,
            flexShrink: 0, width: "100%", height: 56,
            borderTop: "1px solid #42bace",
            display: "flex", alignItems: "center", justifyContent: "center",
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
    </>
  );
}
