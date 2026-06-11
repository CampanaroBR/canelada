import { Prisma } from "@prisma/client";
import { SelecaoCard } from "./SelecaoCard";

export type StoryWithRodada = Prisma.StoryGetPayload<{
  include: { rodada: { select: { data: true } } };
}>;

const TIPO_CONFIG = {
  MVP: {
    label: "MVP",
    emoji: "⚽",
    color: "#B5FF4D",
    bg: "rgba(181,255,77,0.10)",
    border: "rgba(181,255,77,0.22)",
  },
  BAGRE: {
    label: "BAGRE",
    emoji: "🐟",
    color: "#EF4444",
    bg: "rgba(239,68,68,0.10)",
    border: "rgba(239,68,68,0.22)",
  },
  TRAIT_CONQUISTADA: {
    label: "TRAIT",
    emoji: "💎",
    color: "#F59E0B",
    bg: "rgba(245,158,11,0.10)",
    border: "rgba(245,158,11,0.22)",
  },
  SELECAO: {
    label: "SELEÇÃO",
    emoji: "🏆",
    color: "#22C55E",
    bg: "rgba(34,197,94,0.10)",
    border: "rgba(34,197,94,0.22)",
  },
  SEQUENCIA: {
    label: "SEQUÊNCIA",
    emoji: "🔥",
    color: "#B5FF4D",
    bg: "rgba(181,255,77,0.10)",
    border: "rgba(181,255,77,0.22)",
  },
} as const;

function timeAgo(date: Date): string {
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

function rodadaLabel(date: Date): string {
  return date.toLocaleDateString("pt-BR", { weekday: "short", day: "numeric", month: "short" });
}

export function StoryCard({ story }: { story: StoryWithRodada }) {
  if (story.tipo === "SELECAO") {
    return <SelecaoCard story={story} />;
  }

  const cfg = TIPO_CONFIG[story.tipo];

  return (
    <article style={{
      background: "var(--color-surface-1)",
      borderRadius: "var(--radius-lg)",
      border: "1px solid var(--color-border-muted)",
      borderLeft: `3px solid ${cfg.color}`,
      padding: "16px",
      display: "flex",
      flexDirection: "column",
      gap: "12px",
    }}>
      {/* Top row */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "5px",
          padding: "4px 10px",
          borderRadius: "var(--radius-pill)",
          background: cfg.bg,
          border: `1px solid ${cfg.border}`,
        }}>
          <span style={{ fontSize: "12px", lineHeight: 1 }}>{cfg.emoji}</span>
          <span style={{
            fontFamily: "var(--font-display)",
            fontWeight: 900,
            fontSize: "11px",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: cfg.color,
          }}>
            {cfg.label}
          </span>
        </div>
        <span style={{
          fontSize: "12px",
          color: "var(--color-text-muted)",
          fontFamily: "var(--font-body)",
          fontWeight: 500,
        }}>
          {timeAgo(new Date(story.createdAt))}
        </span>
      </div>

      {/* Story text */}
      <p style={{
        fontSize: "16px",
        fontWeight: 500,
        lineHeight: 1.5,
        color: "var(--color-text-primary)",
        fontFamily: "var(--font-body)",
        margin: 0,
      }}>
        {story.texto}
      </p>

      {/* Footer */}
      <p style={{
        fontSize: "12px",
        color: "var(--color-text-muted)",
        fontFamily: "var(--font-body)",
        margin: 0,
        textTransform: "capitalize",
        letterSpacing: "0.01em",
      }}>
        Rodada · {rodadaLabel(new Date(story.rodada.data))}
      </p>
    </article>
  );
}
