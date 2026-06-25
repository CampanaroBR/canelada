"use client";

import { useRef, useState } from "react";
import { toPng } from "html-to-image";
import { ShareNetwork } from "@phosphor-icons/react";
import { ContaActions } from "./ContaActions";
import { EditarPerfilSheet, type PerfilInitial } from "./EditarPerfilSheet";

const ACCENT = "#9fe870";

interface Props {
  displayName: string;
  subtitle: string;
  initials: string;
  overall: number;
  posAbbr: string;
  joinYear: number;
  foto: string;
  stats: { label: string; value: number; color: string }[];
  email: string;
  grupoNome: string;
  roleLabel: string;
  initial: PerfilInitial;
  isOwner: boolean;
}

export function PerfilCliente(props: Props) {
  const { displayName, subtitle, initials, overall, posAbbr, joinYear, foto, stats, email, grupoNome, roleLabel, initial, isOwner } = props;
  const [editOpen, setEditOpen] = useState(false);
  const [sharing, setSharing] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const shareBtnRef = useRef<HTMLButtonElement>(null);

  async function compartilhar() {
    if (sharing || !cardRef.current) return;
    setSharing(true);
    const text = `🏆 ${displayName} — ${overall} OVR no Canelada`;
    const url = typeof window !== "undefined" ? window.location.href : "";
    try {
      const dataUrl = await toPng(cardRef.current, {
        pixelRatio: 2, cacheBust: true, backgroundColor: "#090909",
        filter: (n) => n !== shareBtnRef.current,
      });
      const blob = await (await fetch(dataUrl)).blob();
      const file = new File([blob], "card-canelada.png", { type: "image/png" });
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], text });
      } else if (navigator.share) {
        await navigator.share({ title: displayName, text, url });
      } else {
        const u = URL.createObjectURL(blob);
        Object.assign(document.createElement("a"), { href: u, download: "card-canelada.png" }).click();
        URL.revokeObjectURL(u);
      }
    } catch (e) {
      // CORS na foto pode falhar a imagem → fallback texto
      if ((e as Error)?.name !== "AbortError") {
        try { if (navigator.share) await navigator.share({ title: displayName, text, url }); } catch { /* */ }
      }
    } finally {
      setSharing(false);
    }
  }

  const avatarInner = foto
    // eslint-disable-next-line @next/next/no-img-element
    ? <img src={foto} alt={displayName} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
    : <span style={{ fontFamily: "var(--font-display)", fontWeight: 900, fontSize: 32, color: ACCENT }}>{initials}</span>;
  const avatarStyle: React.CSSProperties = { position: "relative", width: 116, height: 116, borderRadius: "50%", background: "#171717", border: `2px solid ${ACCENT}`, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", padding: 0 };

  return (
    <>
      {/* ── CARD DO JOGADOR ── */}
      <div ref={cardRef} style={{
        position: "relative",
        background: "#171717", border: "2px solid #383838",
        borderRadius: "64px 0 64px 64px", overflow: "hidden",
        padding: "20px 24px 32px", display: "flex", flexDirection: "column", gap: 16,
      }}>
        {/* Compartilhar */}
        <button
          ref={shareBtnRef}
          onClick={compartilhar}
          disabled={sharing}
          aria-label="Compartilhar card"
          style={{ position: "absolute", top: 16, right: 16, zIndex: 2, width: 36, height: 36, borderRadius: 10, background: "#1c1c1c", border: "1px solid #383838", display: "flex", alignItems: "center", justifyContent: "center", cursor: sharing ? "default" : "pointer", opacity: sharing ? 0.5 : 1, WebkitTapHighlightColor: "transparent" }}
        >
          <ShareNetwork size={18} color="#9fe870" weight="bold" />
        </button>

        {/* DESDE */}
        <div style={{ display: "flex", justifyContent: "center", width: "100%" }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
            <span style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 10, lineHeight: "14px", color: "#666" }}>DESDE</span>
            <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 13, color: "#cfcfcf" }}>{joinYear}</span>
          </div>
        </div>

        {/* avatar + nome + overall */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, paddingTop: 6 }}>
          {isOwner ? (
            <button type="button" onClick={() => setEditOpen(true)} aria-label="Editar perfil" style={{ ...avatarStyle, cursor: "pointer", WebkitTapHighlightColor: "transparent" }}>{avatarInner}</button>
          ) : (
            <div style={avatarStyle}>{avatarInner}</div>
          )}

          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, width: "100%", textAlign: "center" }}>
            <span style={{ fontFamily: "var(--font-display)", fontWeight: 900, fontSize: 28, lineHeight: "32px", color: "#fff", textTransform: "uppercase" }}>{displayName}</span>
            {subtitle && <span style={{ fontFamily: "var(--font-body)", fontWeight: 400, fontSize: 14, lineHeight: "1.4", color: "#7a7a7a" }}>{subtitle}</span>}
          </div>

          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
            <span style={{ fontFamily: "var(--font-display)", fontWeight: 900, fontSize: 64, lineHeight: "72px", color: ACCENT }}>{overall}</span>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
              <span style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 10, letterSpacing: "1.8px", color: ACCENT }}>OVERALL</span>
              <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 13, letterSpacing: "1px", color: "#cfcfcf" }}>{posAbbr}</span>
            </div>
          </div>
        </div>

        {/* divisória */}
        <div style={{ height: 1, background: "#22271f", width: "100%" }} />

        {/* stats */}
        <div style={{ display: "flex", gap: 12, width: "100%" }}>
          {stats.map((s) => (
            <div key={s.label} style={{ flex: "1 0 0", minWidth: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
              <span style={{ fontFamily: "var(--font-display)", fontWeight: 900, fontSize: 22, color: s.color, fontVariantNumeric: "tabular-nums" }}>{s.value}</span>
              <span style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 10, lineHeight: "14px", color: "#7a7a7a", textAlign: "center" }}>{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── CONTA (só no próprio perfil) ── */}
      {isOwner && (
        <>
          <ContaActions email={email} grupoNome={grupoNome} roleLabel={roleLabel} onEditar={() => setEditOpen(true)} />
          <EditarPerfilSheet open={editOpen} onClose={() => setEditOpen(false)} initial={initial} />
        </>
      )}
    </>
  );
}
