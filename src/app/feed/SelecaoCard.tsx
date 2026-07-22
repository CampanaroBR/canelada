"use client";

import { Prisma } from "@prisma/client";
import { Export } from "reicon-react";

export type SelecaoStory = Prisma.StoryGetPayload<{
  include: { rodada: { select: { data: true } } };
}>;

const AVATAR_COLORS = ["#B5FF4D", "#60A5FA", "#F59E0B", "#EF4444", "#A78BFA", "#34D399", "#F97316", "#EC4899"];

function avatarColor(name: string) {
  let h = 0;
  for (const c of name) h = (h * 31 + c.charCodeAt(0)) & 0xffff;
  return AVATAR_COLORS[h % AVATAR_COLORS.length];
}

function rodadaLabel(date: Date) {
  return date.toLocaleDateString("pt-BR", { weekday: "short", day: "numeric", month: "short", timeZone: "UTC" });
}

function timeAgo(date: Date) {
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60_000);
  const hrs = Math.floor(mins / 60);
  const days = Math.floor(hrs / 24);
  if (mins < 1) return "agora";
  if (mins < 60) return `${mins}min`;
  if (hrs < 24) return `${hrs}h`;
  if (days < 7) return `${days}d`;
  return date.toLocaleDateString("pt-BR", { day: "numeric", month: "short" });
}

function PitchPlayer({ name }: { name: string }) {
  const color = avatarColor(name);
  const initials = name.trim().slice(0, 2).toUpperCase();
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
      <div style={{
        width: "44px",
        height: "44px",
        borderRadius: "50%",
        background: color + "28",
        border: `2px solid ${color}77`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "var(--font-display)",
        fontWeight: 900,
        fontSize: "14px",
        color,
        letterSpacing: "0.04em",
        flexShrink: 0,
      }}>
        {initials}
      </div>
      <span style={{
        fontSize: "10px",
        fontWeight: 600,
        fontFamily: "var(--font-body)",
        color: "rgba(255,255,255,0.65)",
        maxWidth: "56px",
        textAlign: "center",
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
      }}>
        {name}
      </span>
    </div>
  );
}

export function SelecaoCard({ story }: { story: SelecaoStory }) {
  // Parse names from "⭐ Seleção: P1 · P2 · ..."
  const after = story.texto.split(": ").slice(1).join(": ");
  const players = after.split(" · ").filter(Boolean);

  async function handleShare() {
    const text = `🏆 Seleção da rodada:\n${players.join(", ")}\n\nCanelada — o baba virou resenha.`;
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title: "Canelada — Seleção da Rodada", text });
      } catch {
        // user cancelled — no-op
      }
    } else if (navigator.clipboard) {
      await navigator.clipboard.writeText(text);
    }
  }

  const [p1, p2, p3, p4, p5] = players;

  return (
    <article style={{
      background: "#071a10",
      borderRadius: "var(--radius-lg)",
      border: "1px solid rgba(34,197,94,0.12)",
      overflow: "hidden",
    }}>
      {/* Header */}
      <div style={{
        padding: "14px 16px 12px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        borderBottom: "1px dashed rgba(255,255,255,0.06)",
      }}>
        <div style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "5px",
          padding: "4px 10px",
          borderRadius: "9999px",
          background: "rgba(34,197,94,0.12)",
          border: "1px solid rgba(34,197,94,0.25)",
        }}>
          <span style={{ fontSize: "12px", lineHeight: 1 }}>🏆</span>
          <span style={{
            fontFamily: "var(--font-display)",
            fontWeight: 900,
            fontSize: "11px",
            letterSpacing: "0.1em",
            textTransform: "uppercase" as const,
            color: "#22C55E",
          }}>
            SELEÇÃO
          </span>
        </div>
        <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.25)", fontFamily: "var(--font-body)" }}>
          {timeAgo(new Date(story.createdAt))}
        </span>
      </div>

      {/* Pitch formation */}
      <div style={{
        padding: "20px 24px",
        position: "relative",
        background: "linear-gradient(180deg, #071a10 0%, #0a2416 100%)",
      }}>
        {/* Decorative center line */}
        <div style={{
          position: "absolute",
          left: "50%",
          top: 0,
          bottom: 0,
          width: "1px",
          background: "rgba(255,255,255,0.05)",
        }} />

        <div style={{ display: "flex", flexDirection: "column", gap: "16px", position: "relative", zIndex: 1 }}>
          {/* Row 1: top player (MVP / most votes) */}
          <div style={{ display: "flex", justifyContent: "center" }}>
            {p1 && <PitchPlayer name={p1} />}
          </div>
          {/* Row 2 */}
          {(p2 || p3) && (
            <div style={{ display: "flex", justifyContent: "space-around" }}>
              {p2 && <PitchPlayer name={p2} />}
              {p3 && <PitchPlayer name={p3} />}
            </div>
          )}
          {/* Row 3 */}
          {(p4 || p5) && (
            <div style={{ display: "flex", justifyContent: "space-around" }}>
              {p4 && <PitchPlayer name={p4} />}
              {p5 && <PitchPlayer name={p5} />}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div style={{
        padding: "12px 16px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        borderTop: "1px dashed rgba(255,255,255,0.06)",
      }}>
        <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.25)", fontFamily: "var(--font-body)" }}>
          Rodada · {rodadaLabel(new Date(story.rodada.data))}
        </span>
        <button
          onClick={handleShare}
          style={{
            background: "rgba(34,197,94,0.12)",
            border: "1px solid rgba(34,197,94,0.25)",
            borderRadius: "9999px",
            padding: "6px 14px",
            color: "#22C55E",
            fontFamily: "var(--font-display)",
            fontWeight: 900,
            fontSize: "12px",
            letterSpacing: "0.08em",
            textTransform: "uppercase" as const,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "5px",
            WebkitTapHighlightColor: "transparent",
          }}
        >
          <Export size={13} color="#22C55E" weight="Outline" />
          COMPARTILHAR
        </button>
      </div>
    </article>
  );
}
