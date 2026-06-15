"use client";

import { useState, useEffect, useRef } from "react";
import { Trophy, X, ShareNetwork, MedalMilitary } from "@phosphor-icons/react";

export type LeaderboardEntry = {
  rank: number;
  apelido: string;
  qtd: number;
  categoria: string;
};

interface Props {
  open: boolean;
  onClose: () => void;
  entries: LeaderboardEntry[];
  datas?: string[];
  dataAtiva?: number;
}

const MEDAL_COLORS = ["#F59E0B", "#9CA3AF", "#B45309"];

// Spring-like easing for bottom sheet — fast deceleration
const SPRING_IN  = "cubic-bezier(0.32, 0.72, 0, 1)";
const SPRING_OUT = "cubic-bezier(0.4, 0, 1, 1)";
const DUR_IN  = "380ms";
const DUR_OUT = "260ms";

export function BottomsheetMaisVotados({
  open, onClose, entries, datas = [], dataAtiva = 2,
}: Props) {
  const [mounted, setMounted]     = useState(false);
  const [visible, setVisible]     = useState(false);
  const [activePill, setActivePill] = useState(dataAtiva);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (open) {
      if (timerRef.current) clearTimeout(timerRef.current);
      setActivePill(dataAtiva);
      setMounted(true);
      // tiny rAF so the browser paints the hidden state first → transition fires
      requestAnimationFrame(() => requestAnimationFrame(() => setVisible(true)));
    } else {
      setVisible(false);
      timerRef.current = setTimeout(() => setMounted(false), 300);
    }
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [open, dataAtiva]);

  if (!mounted) return null;

  return (
    <>
      <style>{`
        @keyframes bs-backdrop-in  { from { opacity: 0; } to { opacity: 1; } }
        @keyframes bs-backdrop-out { from { opacity: 1; } to { opacity: 0; } }
      `}</style>

      {/* Backdrop */}
      <div
        onClick={onClose}
        aria-hidden
        style={{
          position: "fixed", inset: 0, zIndex: 50,
          background: "rgba(0,0,0,0.65)",
          backdropFilter: "blur(2px)",
          WebkitBackdropFilter: "blur(2px)",
          transition: `opacity ${visible ? DUR_IN : DUR_OUT} ease`,
          opacity: visible ? 1 : 0,
          willChange: "opacity",
        }}
      />

      {/* Sheet positioner */}
      <div style={{
        position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 51,
        display: "flex", justifyContent: "center",
        pointerEvents: "none",
      }}>
        <div
          role="dialog"
          aria-modal="true"
          style={{
            width: "100%", maxWidth: 430,
            background: "#1a1a1a",
            border: "1px solid #424242",
            borderRadius: "48px 48px 0 0",
            display: "flex", flexDirection: "column",
            maxHeight: "90dvh",
            pointerEvents: "auto",
            boxShadow: "0px 2px 8px rgba(40,41,61,0.16), 0px 16px 24px rgba(96,97,112,0.16)",
            transition: `transform ${visible ? DUR_IN : DUR_OUT} ${visible ? SPRING_IN : SPRING_OUT}`,
            transform: visible ? "translateY(0)" : "translateY(100%)",
            willChange: "transform",
          }}
        >
          {/* Drag handle */}
          <div style={{
            flexShrink: 0,
            height: 32, display: "flex", alignItems: "center", justifyContent: "center",
            paddingTop: 12, paddingBottom: 8,
          }}>
            <div style={{ width: 40, height: 4, background: "#3a3a3a", borderRadius: 9999 }} />
          </div>

          {/* Header */}
          <div style={{
            flexShrink: 0,
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "4px 16px 16px",
          }}>
            {/* Left spacer (mirrors close button) */}
            <div style={{ width: 40, height: 40 }} />

            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Trophy size={16} color="#9fe870" weight="fill" />
              <span style={{
                fontFamily: "var(--font-display)", fontWeight: 800,
                fontSize: 18, lineHeight: "20px", color: "#fff",
              }}>
                MAIS VOTADOS
              </span>
            </div>

            <button
              onClick={onClose}
              aria-label="Fechar"
              style={{
                width: 40, height: 40, background: "#000",
                border: "1px solid #424242", borderRadius: 24,
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer", flexShrink: 0,
              }}
            >
              <X size={16} color="#fff" weight="bold" />
            </button>
          </div>

          {/* Scrollable content */}
          <div style={{
            flex: 1, overflowY: "auto",
            display: "flex", flexDirection: "column", gap: 16,
            padding: "0 16px",
            paddingBottom: "calc(16px + env(safe-area-inset-bottom, 0px))",
          }}>
            {/* Compartilhar */}
            <button style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              background: "#2a2a2a", border: "1px solid #3a3a3a",
              borderRadius: 9999, padding: "9px 17px",
              cursor: "pointer", alignSelf: "flex-start",
            }}>
              <span style={{
                fontFamily: "var(--font-display)", fontWeight: 700,
                fontSize: 12, lineHeight: "18px", color: "#fff",
              }}>Compartilhar</span>
              <ShareNetwork size={16} color="#fff" weight="bold" />
            </button>

            {/* Date pills */}
            {datas.length > 0 && (
              <div style={{ display: "flex", gap: 8, height: 38, overflow: "hidden" }}>
                {datas.map((d, i) => {
                  const active = i === activePill;
                  return (
                    <button
                      key={i}
                      onClick={() => setActivePill(i)}
                      style={{
                        background: active ? "#9fe870" : "#111",
                        border: active ? "none" : "1px solid #2e2e2e",
                        borderRadius: 9999,
                        padding: active ? "6px 12px" : "7px 13px",
                        fontFamily: "var(--font-display)", fontWeight: 700,
                        fontSize: 12, lineHeight: "18px",
                        color: active ? "#000" : "#555",
                        cursor: "pointer", flexShrink: 0, whiteSpace: "nowrap",
                      }}
                    >
                      {d}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Leaderboard rows */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {entries.map((entry) => (
                <div
                  key={entry.rank}
                  style={{
                    background: "#000", borderRadius: 14,
                    paddingLeft: 24, paddingRight: 8,
                    paddingTop: 8, paddingBottom: 8,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                    <span style={{
                      fontFamily: "var(--font-display)", fontWeight: 800,
                      fontSize: 20, lineHeight: "18px", color: "#fff", flexShrink: 0,
                    }}>
                      {entry.rank}.
                    </span>
                    <div style={{
                      flex: 1, minWidth: 1, background: "#1b1b1b", borderRadius: 12,
                      display: "flex", alignItems: "center", gap: 8,
                      padding: 8, height: 52,
                    }}>
                      {/* Player info */}
                      <div style={{ flex: 1, minWidth: 1, display: "flex", alignItems: "center", gap: 8, overflow: "hidden" }}>
                        <div style={{
                          width: 40, height: 40, background: "#3a3a3a", borderRadius: 12,
                          display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                        }}>
                          <span style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 20, color: "#fff" }}>
                            {entry.qtd}x
                          </span>
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <p style={{
                            margin: 0, fontFamily: "var(--font-display)", fontWeight: 800,
                            fontSize: 16, lineHeight: "18px", color: "#fff",
                            whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                          }}>
                            {entry.apelido.toUpperCase()}
                          </p>
                          <p style={{
                            margin: 0, fontFamily: "var(--font-display)", fontWeight: 500,
                            fontSize: 12, lineHeight: "14px", color: "#8d908d",
                          }}>
                            {entry.categoria}
                          </p>
                        </div>
                      </div>

                      {/* Medal icon — top 3 only */}
                      {entry.rank <= 3 && (
                        <div style={{
                          width: 40, height: 40, background: "#000",
                          border: "1px solid #353535", borderRadius: 12,
                          display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                        }}>
                          <MedalMilitary
                            size={28}
                            weight="fill"
                            color={MEDAL_COLORS[entry.rank - 1]}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
