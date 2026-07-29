"use client";

import { forwardRef } from "react";
import type { PersonagemItem } from "./StatSheets";

/**
 * Card de compartilhamento (story/WhatsApp), 1080×1920 — 9:16.
 *
 * Antes o share tirava um `toPng` do PRÓPRIO card da tela: saía na proporção do
 * card (quase quadrado), então o Instagram esticava pra largura toda e ficava
 * gigante e sem respiro; e a foto do Google (lh3.googleusercontent.com) sumia,
 * porque html-to-image não consegue embutir imagem cross-origin — vinha só o
 * anel verde vazio. Aqui o nó é desenhado no tamanho final de verdade e a foto
 * chega já convertida em data URI (ver `compartilhar` em PerfilCliente).
 *
 * Renderiza fora da tela e só enquanto compartilha.
 */

const ACCENT = "#9fe870";
const W = 1080;
const H = 1920;

export interface ShareStoryCardProps {
  displayName: string;
  subtitle: string;
  initials: string;
  overall: number;
  posAbbr: string;
  joinYear: number;
  grupoNome: string;
  /** Já em data URI — URL remota não sobrevive à captura. */
  fotoData: string | null;
  stats: { label: string; value: number; color: string }[];
  personagens: PersonagemItem[];
}

export const ShareStoryCard = forwardRef<HTMLDivElement, ShareStoryCardProps>(function ShareStoryCard(
  { displayName, subtitle, initials, overall, posAbbr, joinYear, grupoNome, fotoData, stats, personagens },
  ref,
) {
  const top = personagens.slice(0, 3);

  return (
    <div
      ref={ref}
      style={{
        width: W,
        height: H,
        position: "relative",
        overflow: "hidden",
        background: "#050505",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        // Composição CENTRADA no quadro 9:16. Com o rodapé empurrado pro fundo
        // (flex:1) sobrava um buraco no terço inferior; centrado, as margens de
        // cima e de baixo ficam iguais e o card respira igual dos dois lados.
        justifyContent: "center",
        padding: "96px 72px",
        boxSizing: "border-box",
      }}
    >
      {/* Mesh de luz: dois orbes desfocados. Substitui o fundo chapado #090909,
          que deixava o card sem profundidade nenhuma no feed do story. */}
      <div style={{
        position: "absolute", top: -280, left: -220, width: 900, height: 900,
        background: `radial-gradient(circle, ${ACCENT}26 0%, transparent 68%)`,
        pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute", bottom: -340, right: -260, width: 980, height: 980,
        background: "radial-gradient(circle, #1f6feb1f 0%, transparent 70%)",
        pointerEvents: "none",
      }} />

      {/* Eyebrow: o grupo. O card antigo não dizia de onde era. */}
      <div style={{
        position: "relative",
        display: "flex", alignItems: "center", gap: 14,
        padding: "14px 30px", borderRadius: 999,
        background: "rgba(255,255,255,0.04)",
        boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.08)",
        marginBottom: 64,
      }}>
        <span style={{ width: 10, height: 10, borderRadius: 999, background: ACCENT, display: "block" }} />
        <span style={{
          fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 24,
          letterSpacing: "3.4px", textTransform: "uppercase", color: "#c8c8c8",
        }}>
          {grupoNome}
        </span>
      </div>

      {/* Double-bezel: casca externa + núcleo, com raios concêntricos. Dá o
          aspecto de peça física em vez de retângulo com borda cinza. */}
      <div style={{
        position: "relative",
        width: "100%",
        padding: 14,
        borderRadius: 78,
        background: "rgba(255,255,255,0.035)",
        boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.07)",
      }}>
        <div style={{
          borderRadius: 64,
          background: "linear-gradient(180deg, #141414 0%, #0c0c0c 100%)",
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.09), 0 40px 90px rgba(0,0,0,0.6)",
          padding: "72px 56px 60px",
          display: "flex", flexDirection: "column", alignItems: "center",
        }}>
          <span style={{
            fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 20,
            letterSpacing: "3px", color: "#5f5f5f", marginBottom: 8,
          }}>
            DESDE {joinYear}
          </span>

          {/* Avatar — anel externo suave em vez de borda dura de 2px */}
          <div style={{
            width: 300, height: 300, borderRadius: 999, padding: 8,
            background: `conic-gradient(from 210deg, ${ACCENT}, #4e7d33 45%, ${ACCENT} 100%)`,
            marginTop: 34,
            boxShadow: `0 24px 70px ${ACCENT}1f`,
          }}>
            <div style={{
              width: "100%", height: "100%", borderRadius: 999, overflow: "hidden",
              background: "#171717", display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              {fotoData ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={fotoData} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                <span style={{ fontFamily: "var(--font-display)", fontWeight: 900, fontSize: 96, color: ACCENT }}>
                  {initials}
                </span>
              )}
            </div>
          </div>

          <h1 style={{
            fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 84,
            lineHeight: 1.04, letterSpacing: "-1.6px", color: "#fff",
            margin: "44px 0 0", textAlign: "center", maxWidth: "100%",
            overflowWrap: "anywhere",
          }}>
            {displayName}
          </h1>
          {subtitle && (
            <p style={{
              fontFamily: "var(--font-body)", fontWeight: 500, fontSize: 30,
              color: "#8d8d8d", margin: "16px 0 0", textAlign: "center",
            }}>
              {subtitle}
            </p>
          )}

          {/* OVR */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: 46 }}>
            <span style={{
              fontFamily: "var(--font-numeric)", fontWeight: 700, fontSize: 208,
              lineHeight: 0.86, letterSpacing: "-6px", color: ACCENT,
              fontVariantNumeric: "tabular-nums",
            }}>
              {overall}
            </span>
            <div style={{ display: "flex", alignItems: "center", gap: 18, marginTop: 22 }}>
              <span style={{
                fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 22,
                letterSpacing: "5px", color: ACCENT,
              }}>
                OVERALL
              </span>
              <span style={{ width: 5, height: 5, borderRadius: 999, background: "#4a4a4a", display: "block" }} />
              <span style={{
                fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 24,
                letterSpacing: "2px", color: "#e4e4e4",
              }}>
                {posAbbr}
              </span>
            </div>
          </div>

          <div style={{ height: 1, width: "100%", background: "rgba(255,255,255,0.07)", margin: "56px 0 44px" }} />

          {/* Stats */}
          <div style={{ display: "flex", width: "100%" }}>
            {stats.map((s) => (
              <div key={s.label} style={{
                flex: 1, display: "flex", flexDirection: "column",
                alignItems: "center", gap: 10,
              }}>
                <span style={{
                  fontFamily: "var(--font-numeric)", fontWeight: 700, fontSize: 60,
                  lineHeight: 1, color: s.color, fontVariantNumeric: "tabular-nums",
                }}>
                  {s.value}
                </span>
                <span style={{
                  fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 17,
                  letterSpacing: "1.4px", color: "#7c7c7c", textAlign: "center",
                }}>
                  {s.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Personagens — o detalhe que faltava: mostra QUEM ele é no baba, não só números */}
      {top.length > 0 && (
        <div style={{ position: "relative", width: "100%", marginTop: 56 }}>
          <span style={{
            display: "block", fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 19,
            letterSpacing: "3px", color: "#6b6b6b", marginBottom: 22, textAlign: "center",
          }}>
            PERSONAGENS
          </span>
          <div style={{ display: "flex", gap: 16, justifyContent: "center" }}>
            {top.map((p) => (
              <div key={p.slug} style={{
                flex: 1, maxWidth: 300,
                display: "flex", alignItems: "center", gap: 18,
                padding: 16, borderRadius: 34,
                background: "rgba(255,255,255,0.035)",
                boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.07)",
              }}>
                <div style={{
                  position: "relative", width: 84, height: 84, borderRadius: 24,
                  overflow: "hidden", flexShrink: 0, background: "#191919",
                }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.bg} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.mascote} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "contain", padding: 8 }} />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 4, minWidth: 0 }}>
                  <span style={{
                    fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 22,
                    color: "#f0f0f0", lineHeight: 1.15,
                  }}>
                    {p.nome}
                  </span>
                  <span style={{
                    fontFamily: "var(--font-numeric)", fontWeight: 700, fontSize: 20,
                    color: "#A78BFA", fontVariantNumeric: "tabular-nums",
                  }}>
                    {p.vezes}x
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <span style={{
        position: "relative",
        fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 26,
        letterSpacing: "4px", color: "#585858",
        marginTop: 76,
      }}>
        CANELADA.APP.BR
      </span>
    </div>
  );
});
