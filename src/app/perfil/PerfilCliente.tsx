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
    ? <img src={foto} alt={displayName} style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" }} />
    : <span style={{ fontFamily: "var(--font-display)", fontWeight: 900, fontSize: 34, color: ACCENT }}>{initials}</span>;
  // Anel em cone-gradient + halo difuso no lugar da borda chapada de 2px: dá
  // volume ao avatar sem endurecer o contorno.
  const avatarStyle: React.CSSProperties = {
    position: "relative", width: 124, height: 124, borderRadius: "50%",
    padding: 3, border: "none",
    background: `conic-gradient(from 210deg, ${ACCENT}, #4e7d33 42%, ${ACCENT} 100%)`,
    boxShadow: `0 10px 34px ${ACCENT}24`,
    display: "flex", alignItems: "center", justifyContent: "center",
  };
  const avatarCore: React.CSSProperties = {
    width: "100%", height: "100%", borderRadius: "50%", overflow: "hidden",
    background: "#141414", display: "flex", alignItems: "center", justifyContent: "center",
  };

  return (
    <>
      {/* ── CARD DO JOGADOR ──
          Double-bezel: casca externa (hairline) + núcleo, com raios concêntricos
          — o card era um retângulo chapado com borda cinza de 2px, que é o que
          deixava a tela "grosseira". O canto assimétrico (estilo card de FIFA) é
          identidade da marca e foi mantido, só recalculado pro núcleo. */}
      <div style={{
        position: "relative",
        padding: 6,
        borderRadius: "64px 0 64px 64px",
        background: "rgba(255,255,255,0.035)",
        boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.07)",
      }}>
        <div ref={cardRef} style={{
          position: "relative",
          borderRadius: "58px 0 58px 58px",
          background: "linear-gradient(180deg, #191919 0%, #0f0f0f 100%)",
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.08), 0 26px 60px rgba(0,0,0,0.55)",
          overflow: "hidden",
          padding: "20px 24px 28px", display: "flex", flexDirection: "column", gap: 18,
        }}>
          {/* Luz atrás do avatar — profundidade sem pesar */}
          <div aria-hidden style={{
            position: "absolute", top: -110, left: "50%", transform: "translateX(-50%)",
            width: 420, height: 420, pointerEvents: "none",
            background: `radial-gradient(circle, ${ACCENT}1c 0%, transparent 66%)`,
          }} />

          {/* Compartilhar — ilha circular com hairline, some do print */}
          <button
            ref={shareBtnRef}
            onClick={compartilhar}
            disabled={sharing}
            aria-label="Compartilhar card"
            style={{
              position: "absolute", top: 18, right: 18, zIndex: 2,
              width: 46, height: 46, borderRadius: 999,
              background: "rgba(255,255,255,0.05)",
              boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.1)",
              border: "none",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: sharing ? "default" : "pointer", opacity: sharing ? 0.45 : 1,
              transition: "transform 220ms cubic-bezier(0.32,0.72,0,1), opacity 220ms cubic-bezier(0.32,0.72,0,1)",
              WebkitTapHighlightColor: "transparent",
            }}
          >
            <Export size={22} color={ACCENT} weight="Outline" />
          </button>

          {/* DESDE — eyebrow pill */}
          <div style={{ position: "relative", display: "flex", justifyContent: "center", width: "100%" }}>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 7,
              padding: "6px 14px", borderRadius: 999,
              background: "rgba(255,255,255,0.04)",
              boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.07)",
            }}>
              <span style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 9.5, letterSpacing: "1.6px", color: "#787878" }}>DESDE</span>
              <span style={{ fontFamily: "var(--font-numeric)", fontWeight: 700, fontSize: 12, color: "#d4d4d4", fontVariantNumeric: "tabular-nums" }}>{joinYear}</span>
            </div>
          </div>

          {/* avatar + nome + overall */}
          <div style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center", gap: 18, paddingTop: 4 }}>
            {isOwner ? (
              <button type="button" onClick={() => setEditOpen(true)} aria-label="Editar perfil" style={{ ...avatarStyle, cursor: "pointer", WebkitTapHighlightColor: "transparent" }}>
                <span style={avatarCore}>{avatarInner}</span>
              </button>
            ) : (
              <div style={avatarStyle}><span style={avatarCore}>{avatarInner}</span></div>
            )}

            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, width: "100%", textAlign: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                <span style={{ fontFamily: "var(--font-display)", fontWeight: 900, fontSize: 30, lineHeight: "34px", letterSpacing: "-0.4px", color: "#fff", textTransform: "uppercase" }}>{displayName}</span>
                {isAdmin && <ShieldStar size={22} color={ACCENT} weight="Filled" aria-label={roleLabel} />}
              </div>
              {subtitle && <span style={{ fontFamily: "var(--font-body)", fontWeight: 400, fontSize: 14, lineHeight: 1.4, color: "#818181" }}>{subtitle}</span>}
            </div>

            {/* OVR — posição na mesma linha do rótulo, com separador; antes eram
                duas linhas empilhadas e o bloco ficava alto demais. */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
              <span style={{
                fontFamily: "var(--font-numeric)", fontWeight: 700, fontSize: 72,
                lineHeight: "72px", letterSpacing: "-2.4px", color: ACCENT,
                fontVariantNumeric: "tabular-nums",
                textShadow: `0 0 46px ${ACCENT}3d`,
              }}>{overall}</span>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 10, letterSpacing: "2.4px", color: ACCENT }}>OVERALL</span>
                <span style={{ width: 3, height: 3, borderRadius: 999, background: "#4a4a4a", display: "block" }} />
                <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 12, letterSpacing: "1.4px", color: "#d0d0d0" }}>{posAbbr}</span>
              </div>
            </div>
          </div>

          {/* divisória que desvanece nas pontas — linha reta de ponta a ponta
              corta o card; esta some nas bordas e integra melhor */}
          <div style={{ position: "relative", height: 1, width: "100%", background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.1) 22%, rgba(255,255,255,0.1) 78%, transparent)" }} />

          {/* stats — cada um vira uma ILHA com hairline. Além do acabamento,
              resolve um problema real: eles abrem sheet ao toque mas não tinham
              nenhuma pista visual de que eram tocáveis (número solto no vazio). */}
          <div style={{ position: "relative", display: "flex", gap: 6, width: "100%" }}>
            {stats.map((s) => {
              const kind = SHEETS.find((k) => k === s.label);
              const ilha: React.CSSProperties = {
                flex: "1 0 0", minWidth: 0,
                padding: "12px 2px 10px", borderRadius: 18,
                background: "rgba(255,255,255,0.03)",
                boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.06)",
                display: "flex", alignItems: "center", justifyContent: "center",
              };
              return kind ? (
                <button
                  key={s.label}
                  onClick={() => setSheet(kind)}
                  aria-label={`Ver detalhe de ${s.label}`}
                  style={{
                    ...ilha, border: "none", cursor: "pointer",
                    transition: "transform 220ms cubic-bezier(0.32,0.72,0,1), background 220ms cubic-bezier(0.32,0.72,0,1)",
                    WebkitTapHighlightColor: "transparent",
                  }}
                >
                  <Stat value={s.value} label={s.label} color={s.color} labelSize={8.5} />
                </button>
              ) : s.href ? (
                <Link key={s.label} href={s.href} style={{ ...ilha, textDecoration: "none", WebkitTapHighlightColor: "transparent" }}>
                  <Stat value={s.value} label={s.label} color={s.color} labelSize={8.5} />
                </Link>
              ) : (
                <div key={s.label} style={ilha}>
                  <Stat value={s.value} label={s.label} color={s.color} labelSize={8.5} />
                </div>
              );
            })}
          </div>
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
