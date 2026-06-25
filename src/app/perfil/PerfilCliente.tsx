"use client";

import { useState } from "react";
import { ContaActions } from "./ContaActions";
import { EditarPerfilSheet, type PerfilInitial } from "./EditarPerfilSheet";

const ACCENT = "#9fe870";

interface Props {
  apelido: string;
  overall: number;
  posAbbr: string;
  joinYear: number;
  subtitle: string;
  foto: string;
  initials: string;
  stats: { label: string; value: number; color: string }[];
  email: string;
  grupoNome: string;
  roleLabel: string;
  initial: PerfilInitial;
  isOwner: boolean;
}

export function PerfilCliente(props: Props) {
  const { apelido, overall, posAbbr, joinYear, subtitle, foto, initials, stats, email, grupoNome, roleLabel, initial, isOwner } = props;
  const [editOpen, setEditOpen] = useState(false);
  const avatarInner = foto
    // eslint-disable-next-line @next/next/no-img-element
    ? <img src={foto} alt={apelido} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
    : <span style={{ fontFamily: "var(--font-display)", fontWeight: 900, fontSize: 44, color: ACCENT }}>{initials}</span>;
  const avatarStyle: React.CSSProperties = { position: "relative", width: 116, height: 116, borderRadius: "50%", background: "#0a0e0e", border: `2px solid ${ACCENT}`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 0 30px ${ACCENT}33`, overflow: "hidden", padding: 0 };

  return (
    <>
      {/* ── CARD DO JOGADOR ── */}
      <div style={{ padding: "12px 16px 0" }}>
        <div style={{ position: "relative", overflow: "hidden", borderRadius: 22, padding: "22px 18px 18px", background: "linear-gradient(160deg, #10160f 0%, #0a0e0e 55%)", border: "1px solid #2f3a2a" }}>
          <div aria-hidden style={{ position: "absolute", inset: 0, background: `radial-gradient(120% 60% at 50% -10%, ${ACCENT}24, transparent 60%)`, pointerEvents: "none" }} />

          <div style={{ position: "relative", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div style={{ textAlign: "center", lineHeight: 1 }}>
              <div style={{ fontFamily: "var(--font-display)", fontWeight: 900, fontSize: 40, color: ACCENT, letterSpacing: "-0.02em" }}>{overall}</div>
              <div style={{ fontFamily: "var(--font-body)", fontWeight: 800, fontSize: 10, letterSpacing: "0.18em", color: ACCENT, marginTop: 2 }}>OVR</div>
              <div style={{ marginTop: 8, fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 13, letterSpacing: "0.08em", color: "#cfcfcf" }}>{posAbbr}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 10, letterSpacing: "0.12em", color: "#5a5a5a" }}>DESDE</div>
              <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 13, color: "#cfcfcf" }}>{joinYear}</div>
            </div>
          </div>

          {/* avatar — tocável (abre edição) só no próprio perfil */}
          <div style={{ position: "relative", display: "flex", justifyContent: "center", margin: "6px 0 12px" }}>
            {isOwner ? (
              <button type="button" onClick={() => setEditOpen(true)} aria-label="Editar perfil" style={{ ...avatarStyle, cursor: "pointer", WebkitTapHighlightColor: "transparent" }}>
                {avatarInner}
              </button>
            ) : (
              <div style={avatarStyle}>{avatarInner}</div>
            )}
          </div>

          <div style={{ position: "relative", textAlign: "center" }}>
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 900, fontSize: 30, letterSpacing: "0.01em", textTransform: "uppercase", color: "#fff", lineHeight: 1 }}>{apelido}</div>
            {subtitle && <div style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 13, color: "#7a7a7a", marginTop: 6 }}>{subtitle}</div>}
          </div>

          <div style={{ position: "relative", height: 1, background: "#22271f", margin: "16px 4px" }} />

          <div style={{ position: "relative", display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 6 }}>
            {stats.map((s) => (
              <div key={s.label} style={{ textAlign: "center" }}>
                <div style={{ fontFamily: "var(--font-display)", fontWeight: 900, fontSize: 22, color: s.color, fontVariantNumeric: "tabular-nums" }}>{s.value}</div>
                <div style={{ fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 8.5, letterSpacing: "0.08em", color: "#7a7a7a", marginTop: 2 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── CONTA (só no próprio perfil) ── */}
      {isOwner && (
        <>
          <div style={{ padding: "0 16px" }}>
            <ContaActions email={email} grupoNome={grupoNome} roleLabel={roleLabel} onEditar={() => setEditOpen(true)} />
          </div>
          <EditarPerfilSheet open={editOpen} onClose={() => setEditOpen(false)} initial={initial} />
        </>
      )}
    </>
  );
}
