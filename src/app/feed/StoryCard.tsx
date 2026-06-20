import Image from "next/image";
import { Prisma } from "@prisma/client";
import { SelecaoCard } from "./SelecaoCard";

export type StoryWithRodada = Prisma.StoryGetPayload<{
  include: { rodada: { select: { data: true } } };
}>;

const TIPO_CONFIG = {
  MVP: {
    label: "MVP",
    icon: "⚽",
    color: "var(--color-accent)",
    colorRaw: "rgba(159,232,112,",
    accentBar: "var(--color-accent)",
    illustration: "/traits/Craque.png",
  },
  BAGRE: {
    label: "BAGRE",
    icon: "🐟",
    color: "var(--color-bagre)",
    colorRaw: "rgba(239,68,68,",
    accentBar: "var(--color-bagre)",
    illustration: "/traits/Bagre.png",
  },
  TRAIT_CONQUISTADA: {
    label: "CONQUISTA",
    icon: "💎",
    color: "var(--color-warning)",
    colorRaw: "rgba(245,158,11,",
    accentBar: "var(--color-warning)",
    illustration: "/traits/Firuleiro.png",
  },
  SELECAO: {
    label: "SELEÇÃO",
    icon: "🏆",
    color: "var(--color-success)",
    colorRaw: "rgba(34,197,94,",
    accentBar: "var(--color-success)",
    illustration: "/traits/Xerife.png",
  },
  SEQUENCIA: {
    label: "SEQUÊNCIA",
    icon: "🔥",
    color: "var(--color-accent)",
    colorRaw: "rgba(159,232,112,",
    accentBar: "var(--color-accent)",
    illustration: "/traits/Racudo.png",
  },
} as const;

function timeAgo(date: Date): string {
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60_000);
  const hrs  = Math.floor(mins / 60);
  const days = Math.floor(hrs / 24);
  if (mins < 1)  return "agora";
  if (mins < 60) return `${mins}min`;
  if (hrs < 24)  return `${hrs}h`;
  if (days < 7)  return `${days}d`;
  return date.toLocaleDateString("pt-BR", { day: "numeric", month: "short" });
}

function rodadaLabel(date: Date): string {
  return date.toLocaleDateString("pt-BR", { weekday: "short", day: "numeric", month: "short" });
}

export function StoryCard({ story }: { story: StoryWithRodada }) {
  if (story.tipo === "SELECAO") return <SelecaoCard story={story} />;

  const cfg = TIPO_CONFIG[story.tipo];

  return (
    <article
      style={{
        position: "relative",
        borderRadius: "var(--radius-lg)",
        background: "var(--color-surface-1)",
        boxShadow: "var(--shadow-border)",
        overflow: "hidden",
        minHeight: "96px",
      }}
    >
      {/* Accent bar esquerda — 3px */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          width: "3px",
          background: cfg.accentBar,
          borderRadius: "3px 0 0 3px",
        }}
      />

      {/* SVG illustration — background hero visual */}
      <div aria-hidden style={{
        position: "absolute",
        right: "-8px",
        bottom: "-8px",
        width: "120px",
        height: "120px",
        opacity: 0.13,
        pointerEvents: "none",
        filter: `drop-shadow(0 0 24px ${cfg.colorRaw}0.6))`,
      }}>
        <Image
          src={cfg.illustration}
          alt=""
          width={120}
          height={120}
          style={{ width: "100%", height: "100%", objectFit: "contain" }}
        />
      </div>

      {/* Glow layer */}
      <div aria-hidden style={{
        position: "absolute",
        right: 0,
        bottom: 0,
        width: "140px",
        height: "140px",
        background: `radial-gradient(circle at 80% 80%, ${cfg.colorRaw}0.08) 0%, transparent 70%)`,
        pointerEvents: "none",
      }} />

      {/* Inner core */}
      <div style={{ padding: "14px 140px 14px 20px", position: "relative" }}>

        {/* Top row */}
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "10px",
        }}>
          {/* Label pill */}
          <div style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "5px",
            padding: "3px 10px",
            borderRadius: "var(--radius-pill)",
            background: `${cfg.colorRaw}0.10)`,
            boxShadow: `0 0 0 1px ${cfg.colorRaw}0.20)`,
          }}>
            <span aria-hidden style={{ fontSize: "11px", lineHeight: 1 }}>{cfg.icon}</span>
            <span style={{
              fontFamily: "var(--font-display)",
              fontWeight: 900,
              fontSize: "11px",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: cfg.color,
            }}>
              {cfg.label}
            </span>
          </div>

          <time
            className="tabular"
            dateTime={new Date(story.createdAt).toISOString()}
            style={{
              fontSize: "11px",
              fontWeight: 600,
              letterSpacing: "0.04em",
              color: "var(--color-text-muted)",
              fontFamily: "var(--font-body)",
            }}
          >
            {timeAgo(new Date(story.createdAt))}
          </time>
        </div>

        {/* Story text */}
        <p style={{
          fontSize: "18px",
          fontWeight: 600,
          lineHeight: 1.4,
          color: "var(--color-text-primary)",
          fontFamily: "var(--font-body)",
          margin: "0 0 11px",
          letterSpacing: "-0.02em",
        }}>
          {story.texto}
        </p>

        {/* Footer */}
        <p style={{
          fontSize: "11px",
          fontWeight: 600,
          letterSpacing: "0.08em",
          color: "var(--color-text-muted)",
          fontFamily: "var(--font-body)",
          textTransform: "uppercase",
          margin: 0,
        }}>
          Rodada · {rodadaLabel(new Date(story.rodada.data))}
        </p>

      </div>
    </article>
  );
}
