"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { toPng } from "html-to-image";
import { Export, ShieldStar } from "reicon-react";
import { ContaActions } from "./ContaActions";
import { EditarPerfilSheet, type PerfilInitial } from "./EditarPerfilSheet";
import { StatSheets, type SheetKind, type PersonagemItem, type RodadaItem } from "./StatSheets";
import { ShareStoryCard } from "./ShareStoryCard";
import { Stat } from "@/ds";

const ACCENT = "#9fe870";

interface Props {
  displayName: string;
  subtitle: string;
  initials: string;
  overall: number;
  posAbbr: string;
  joinYear: number;
  foto: string;
  stats: { label: string; value: number; color: string; href?: string }[];
  email: string;
  grupoNome: string;
  roleLabel: string;
  isAdmin: boolean;
  initial: PerfilInitial;
  isOwner: boolean;
  detalhes: {
    personagens: PersonagemItem[];
    presencas: RodadaItem[];
    mvps: RodadaItem[];
    bagres: RodadaItem[];
  };
}

/** Stats que abrem sheet de detalhe ao tocar (o label é a chave da sheet). */
const SHEETS: SheetKind[] = ["PERSONAGENS", "PRESENÇAS", "MVP's", "BAGRES"];

export function PerfilCliente(props: Props) {
  const { displayName, subtitle, initials, overall, posAbbr, joinYear, foto, stats, email, grupoNome, roleLabel, isAdmin, initial, isOwner, detalhes } = props;
  const [editOpen, setEditOpen] = useState(false);
  const [sheet, setSheet] = useState<SheetKind | null>(null);
  const [sharing, setSharing] = useState(false);
  // O card de story só é montado durante a captura (é 1080×1920 — caro pra
  // deixar no DOM à toa num celular).
  const [renderShare, setRenderShare] = useState(false);
  const [fotoData, setFotoData] = useState<string | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const shareRef = useRef<HTMLDivElement>(null);
  const shareBtnRef = useRef<HTMLButtonElement>(null);

  /** Baixa a foto e devolve data URI. html-to-image NÃO embute imagem
   *  cross-origin (a foto do Google), e era por isso que o card compartilhado
   *  saía com o anel verde vazio. Falhou? devolve null → cai nas iniciais. */
  async function fotoEmDataUri(src: string): Promise<string | null> {
    if (!src) return null;
    try {
      const res = await fetch(src, { mode: "cors", cache: "force-cache" });
      if (!res.ok) return null;
      const blob = await res.blob();
      return await new Promise<string | null>((resolve) => {
        const fr = new FileReader();
        fr.onload = () => resolve(typeof fr.result === "string" ? fr.result : null);
        fr.onerror = () => resolve(null);
        fr.readAsDataURL(blob);
      });
    } catch {
      return null;
    }
  }

  /** Espera fontes + todas as imagens do nó decodificarem. Sem isso a captura
   *  pega o card meio montado (texto sem fonte, miniatura em branco). */
  async function esperarPronto(node: HTMLElement) {
    try { await document.fonts.ready; } catch { /* browser antigo */ }
    const imgs = Array.from(node.querySelectorAll("img"));
    await Promise.all(imgs.map((img) =>
      img.complete ? Promise.resolve() : new Promise<void>((r) => {
        img.onload = () => r();
        img.onerror = () => r();
      })
    ));
    // 2 frames: garante que o layout do nó recém-montado já estabilizou
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
  }

  async function compartilhar() {
    if (sharing) return;
    setSharing(true);
    const text = `🏆 ${displayName} — ${overall} OVR no Canelada`;
    const url = typeof window !== "undefined" ? window.location.href : "";
    try {
      setFotoData(await fotoEmDataUri(foto));
      setRenderShare(true);
      await new Promise((r) => requestAnimationFrame(r));
      const node = shareRef.current;
      if (!node) throw new Error("share node ausente");
      await esperarPronto(node);

      // O nó já é 1080×1920, então pixelRatio 1 dá o tamanho de story exato —
      // antes era pixelRatio 2 sobre o card da tela, o que gerava uma imagem
      // quase quadrada e enorme, que o Instagram esticava.
      const dataUrl = await toPng(node, {
        pixelRatio: 1, width: 1080, height: 1920,
        cacheBust: true, backgroundColor: "#050505",
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
      if ((e as Error)?.name !== "AbortError") {
        try { if (navigator.share) await navigator.share({ title: displayName, text, url }); } catch { /* */ }
      }
    } finally {
      setRenderShare(false);
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
          style={{ position: "absolute", top: 16, right: 16, zIndex: 2, width: 48, height: 48, borderRadius: 16, background: "#090909", border: "1px solid #383838", display: "flex", alignItems: "center", justifyContent: "center", cursor: sharing ? "default" : "pointer", opacity: sharing ? 0.5 : 1, WebkitTapHighlightColor: "transparent" }}
        >
          <Export size={24} color="#9fe870" weight="Outline" />
        </button>

        {/* DESDE */}
        <div style={{ display: "flex", justifyContent: "center", width: "100%" }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
            <span style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 10, lineHeight: "14px", color: "#666" }}>DESDE</span>
            <span style={{ fontFamily: "var(--font-numeric)", fontWeight: 700, fontSize: 13, color: "#cfcfcf" }}>{joinYear}</span>
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
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontFamily: "var(--font-display)", fontWeight: 900, fontSize: 28, lineHeight: "32px", color: "#fff", textTransform: "uppercase" }}>{displayName}</span>
              {isAdmin && <ShieldStar size={22} color={ACCENT} weight="Filled" aria-label={roleLabel} />}
            </div>
            {subtitle && <span style={{ fontFamily: "var(--font-body)", fontWeight: 400, fontSize: 14, lineHeight: "1.4", color: "#7a7a7a" }}>{subtitle}</span>}
          </div>

          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
            <span style={{ fontFamily: "var(--font-numeric)", fontWeight: 700, fontSize: 64, lineHeight: "72px", letterSpacing: "-1px", color: ACCENT }}>{overall}</span>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
              <span style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 10, letterSpacing: "1.8px", color: ACCENT }}>OVERALL</span>
              <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 13, letterSpacing: "1px", color: "#cfcfcf" }}>{posAbbr}</span>
            </div>
          </div>
        </div>

        {/* divisória */}
        <div style={{ height: 1, background: "#22271f", width: "100%" }} />

        {/* stats — tocar abre a sheet com o detalhe por trás do número */}
        <div style={{ display: "flex", gap: 12, width: "100%" }}>
          {stats.map((s) => {
            const kind = SHEETS.find((k) => k === s.label);
            return kind ? (
              <button
                key={s.label}
                onClick={() => setSheet(kind)}
                aria-label={`Ver detalhe de ${s.label}`}
                style={{
                  flex: "1 0 0", minWidth: 0, background: "none", border: "none",
                  padding: 0, cursor: "pointer", WebkitTapHighlightColor: "transparent",
                }}
              >
                <Stat value={s.value} label={s.label} color={s.color} />
              </button>
            ) : s.href ? (
              <Link key={s.label} href={s.href} style={{ flex: "1 0 0", minWidth: 0, textDecoration: "none", WebkitTapHighlightColor: "transparent" }}>
                <Stat value={s.value} label={s.label} color={s.color} />
              </Link>
            ) : (
              <Stat key={s.label} value={s.value} label={s.label} color={s.color} />
            );
          })}
        </div>
      </div>

      {/* ── CONTA (só no próprio perfil) ── */}
      {isOwner && (
        <>
          <ContaActions email={email} grupoNome={grupoNome} roleLabel={roleLabel} onEditar={() => setEditOpen(true)} />
          <EditarPerfilSheet open={editOpen} onClose={() => setEditOpen(false)} initial={initial} />
        </>
      )}

      {/* Detalhe dos stats — vale também no perfil dos outros (dá pra ver a
          carreira de quem você abriu, não só a sua). */}
      <StatSheets
        aberta={sheet}
        onClose={() => setSheet(null)}
        personagens={detalhes.personagens}
        presencas={detalhes.presencas}
        mvps={detalhes.mvps}
        bagres={detalhes.bagres}
      />

      {/* Fora da tela (não `display:none`, senão não renderiza pra captura). */}
      {renderShare && (
        <div style={{ position: "fixed", top: 0, left: -20000, zIndex: -1, pointerEvents: "none" }} aria-hidden>
          <ShareStoryCard
            ref={shareRef}
            displayName={displayName}
            subtitle={subtitle}
            initials={initials}
            overall={overall}
            posAbbr={posAbbr}
            joinYear={joinYear}
            grupoNome={grupoNome}
            fotoData={fotoData}
            stats={stats}
            personagens={detalhes.personagens}
          />
        </div>
      )}
    </>
  );
}
