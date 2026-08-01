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
  const top = personagens.slice(0, 2);
  // Nome longo REDUZ a fonte em vez de quebrar em 2 linhas: a 2ª linha somava
  // ~87px e estourava os 1920px (apelidos como "Santiago, o Maestro" existem).
  const tamanhoNome = displayName.length > 16 ? 56 : displayName.length > 11 ? 70 : 84;

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
        padding: "72px 72px",
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
        marginBottom: 48,
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
          padding: "60px 56px 52px",
          display: "flex", flexDirection: "column", alignItems: "center",
        }}>
          <span style={{
            fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 26,
            letterSpacing: "3.4px", color: "#6d6d6d", marginBottom: 8,
          }}>
            DESDE {joinYear}
          </span>

          {/* Avatar. TODAS as medidas em px explícito — `width/height: 100%` some
              na captura (html-to-image clona pra dentro de um SVG e a
              porcentagem não resolve), e era por isso que saía só o anel verde
              sem a foto nem as iniciais. Mesma regra vale pras miniaturas. */}
          <div style={{
            position: "relative", width: 276, height: 276, borderRadius: 999,
            marginTop: 26,
            background: `conic-gradient(from 210deg, ${ACCENT}, #4e7d33 45%, ${ACCENT} 100%)`,
            boxShadow: `0 24px 70px ${ACCENT}1f`,
          }}>
            <div style={{
              position: "absolute", top: 8, left: 8,
              width: 260, height: 260, borderRadius: 999, overflow: "hidden",
              background: "#171717", display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              {fotoData ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={fotoData} alt="" width={260} height={260} style={{ width: 260, height: 260, objectFit: "cover", display: "block" }} />
              ) : (
                <span style={{ fontFamily: "var(--font-display)", fontWeight: 900, fontSize: 104, color: ACCENT }}>
                  {initials}
                </span>
              )}
            </div>
          </div>

          <h1 style={{
            fontFamily: "var(--font-display)", fontWeight: 800, fontSize: tamanhoNome,
            lineHeight: 1.04, letterSpacing: "-1.6px", color: "#fff",
            margin: "34px 0 0", textAlign: "center", maxWidth: "100%",
            overflowWrap: "anywhere",
          }}>
            {displayName}
          </h1>
          {subtitle && (
            <p style={{
              fontFamily: "var(--font-body)", fontWeight: 500, fontSize: 34,
              color: "#949494", margin: "12px 0 0", textAlign: "center",
            }}>
              {subtitle}
            </p>
          )}

          {/* OVR */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: 36 }}>
            <span style={{
              fontFamily: "var(--font-numeric)", fontWeight: 700, fontSize: 190,
              lineHeight: 0.86, letterSpacing: "-6px", color: ACCENT,
              fontVariantNumeric: "tabular-nums",
            }}>
              {overall}
            </span>
            <div style={{ display: "flex", alignItems: "center", gap: 18, marginTop: 22 }}>
              <span style={{
                fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 26,
                letterSpacing: "5px", color: ACCENT,
              }}>
                OVERALL
              </span>
              <span style={{ width: 5, height: 5, borderRadius: 999, background: "#4a4a4a", display: "block" }} />
              <span style={{
                fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 28,
                letterSpacing: "2px", color: "#e4e4e4",
              }}>
                {posAbbr}
              </span>
            </div>
          </div>

          <div style={{ height: 1, width: "100%", background: "rgba(255,255,255,0.07)", margin: "44px 0 36px" }} />

          {/* Stats */}
          <div style={{ display: "flex", width: "100%" }}>
            {stats.map((s) => (
              <div key={s.label} style={{
                flex: 1, display: "flex", flexDirection: "column",
                alignItems: "center", gap: 10,
              }}>
                <span style={{
                  fontFamily: "var(--font-numeric)", fontWeight: 700, fontSize: 76,
                  lineHeight: 1, color: s.color, fontVariantNumeric: "tabular-nums",
                }}>
                  {s.value}
                </span>
                <span style={{
                  fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 21,
                  letterSpacing: "1.6px", color: "#8a8a8a", textAlign: "center",
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
        <div style={{ position: "relative", width: "100%", marginTop: 44 }}>
          <span style={{
            display: "block", fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 24,
            letterSpacing: "3.4px", color: "#787878", marginBottom: 20, textAlign: "center",
          }}>
            PERSONAGENS
          </span>
          {/* Empilhado em vez de 3 colunas: em 3 colunas sobravam ~270px por
              card, o que espremia nome e contagem a ponto de sumirem no story.
              Na vertical cabe miniatura grande e texto legível. */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {top.map((p) => (
              <div key={p.slug} style={{
                display: "flex", alignItems: "center", gap: 22,
                padding: 16, borderRadius: 36,
                background: "rgba(255,255,255,0.04)",
                boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.08)",
              }}>
                {/* px explícito, sem inset/% — mesma razão do avatar */}
                <div style={{
                  position: "relative", width: 112, height: 112, borderRadius: 30,
                  overflow: "hidden", flexShrink: 0, background: "#191919",
                }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.bg} alt="" width={112} height={112}
                    style={{ position: "absolute", top: 0, left: 0, width: 112, height: 112, objectFit: "cover", display: "block" }} />
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.mascote} alt="" width={96} height={96}
                    style={{ position: "absolute", top: 8, left: 8, width: 96, height: 96, objectFit: "contain", display: "block" }} />
                </div>
                <span style={{
                  flex: 1, fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 40,
                  color: "#f2f2f2", lineHeight: 1.1,
                }}>
                  {p.nome}
                </span>
                <span style={{
                  fontFamily: "var(--font-numeric)", fontWeight: 700, fontSize: 34,
                  color: "#A78BFA", fontVariantNumeric: "tabular-nums",
                  background: "rgba(167,139,250,0.14)", borderRadius: 999,
                  padding: "8px 20px", flexShrink: 0,
                }}>
                  {p.vezes}x
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <span style={{
        position: "relative",
        fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 26,
        letterSpacing: "4px", color: "#585858",
        marginTop: 52,
      }}>
        CANELADA.APP.BR
      </span>
    </div>
  );
});
