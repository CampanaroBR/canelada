"use client";

import { useState, useEffect } from "react";

const imgTrophy      = "http://localhost:3845/assets/e3f883d17ae67efead123e30b9dec3f2de83035c.svg";
const imgX           = "http://localhost:3845/assets/c6048d3d966a755882e18ffea09b55b0e4f3cf24.svg";
const imgShare       = "http://localhost:3845/assets/dbdc853835956bc779b76d41db5a8392794a04c4.svg";
const imgMedal1      = "http://localhost:3845/assets/ed3d245a654a2fbbf71fa008b60c5261a3b492b4.svg";
const imgMedal2      = "http://localhost:3845/assets/5cbc74c5d63a841c4db0d1f95fa614b4b6ccb83e.svg";
const imgMedal3      = "http://localhost:3845/assets/9a1646dc20219cb326579f1d3aa136312f40d036.svg";

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
  datas?: string[]; // date filter labels
  dataAtiva?: number;
}

export function BottomsheetMaisVotados({ open, onClose, entries, datas = [], dataAtiva = 2 }: Props) {
  const [visible, setVisible] = useState(false);
  const [animOut, setAnimOut] = useState(false);

  useEffect(() => {
    if (open) { setAnimOut(false); setVisible(true); }
    else if (visible) {
      setAnimOut(true);
      const t = setTimeout(() => setVisible(false), 280);
      return () => clearTimeout(t);
    }
  }, [open, visible]);

  if (!visible) return null;

  const medalImgs = [imgMedal1, imgMedal2, imgMedal3];

  return (
    <>
      <style>{`
        @keyframes bs-in  { from { transform: translateY(100%); } to { transform: translateY(0); } }
        @keyframes bs-out { from { transform: translateY(0);    } to { transform: translateY(100%); } }
        @keyframes fade-in  { from { opacity: 0; } to { opacity: 1; } }
        @keyframes fade-out { from { opacity: 1; } to { opacity: 0; } }
      `}</style>

      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 50,
          animation: `${animOut ? "fade-out" : "fade-in"} 280ms ease forwards`,
        }}
      />

      {/* Sheet */}
      <div style={{
        position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)",
        width: "100%", maxWidth: 430,
        background: "#1a1a1a",
        border: "1px solid #424242",
        borderRadius: "48px 48px 0 0",
        overflow: "hidden",
        zIndex: 51,
        animation: `${animOut ? "bs-out" : "bs-in"} 280ms cubic-bezier(0.32,0.72,0,1) forwards`,
        boxShadow: "0 2px 8px rgba(40,41,61,0.16), 0 16px 24px rgba(96,97,112,0.16)",
      }}>

        {/* Pull handle */}
        <div style={{ height: 32, display: "flex", alignItems: "center", justifyContent: "center", paddingBottom: 16, paddingTop: 12 }}>
          <div style={{ width: 40, height: 4, background: "#3a3a3a", borderRadius: 9999 }} />
        </div>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "4px 8px 16px", backdropFilter: "blur(4px)" }}>
          <div style={{ width: 40, height: 40 }} />
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={imgTrophy} alt="" style={{ width: 16, height: 16 }} />
            <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 18, color: "#fff" }}>MAIS VOTADOS</span>
          </div>
          <button onClick={onClose} style={{ width: 40, height: 40, background: "#000", border: "1px solid #424242", borderRadius: 24, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={imgX} alt="Fechar" style={{ width: 16, height: 16 }} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: "8px 16px 16px", display: "flex", flexDirection: "column", gap: 16, backdropFilter: "blur(4px)" }}>

          {/* Share button */}
          <button style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#2a2a2a", border: "1px solid #3a3a3a", borderRadius: 9999, padding: "9px 17px", cursor: "pointer" }}>
            <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 12, color: "#fff" }}>Compartilhar</span>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={imgShare} alt="" style={{ width: 16, height: 16 }} />
          </button>

          {/* Date filters */}
          {datas.length > 0 && (
            <div style={{ display: "flex", gap: 8, height: 38, overflow: "hidden" }}>
              {datas.map((d, i) => (
                <button key={i} style={{
                  background: i === dataAtiva ? "#9fe870" : "#111",
                  border: i === dataAtiva ? "none" : "1px solid #2e2e2e",
                  borderRadius: 9999,
                  padding: i === dataAtiva ? "6px 12px" : "7px 13px",
                  fontFamily: "var(--font-display)",
                  fontWeight: 700,
                  fontSize: 12,
                  color: i === dataAtiva ? "#000" : "#555",
                  cursor: "pointer",
                  flexShrink: 0,
                }}>
                  {d}
                </button>
              ))}
            </div>
          )}

          {/* Leaderboard */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {entries.map((entry) => (
              <div key={entry.rank} style={{ background: "#000", borderRadius: 14, padding: "8px 8px 8px 24px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 20, color: "#fff", flexShrink: 0 }}>
                    {entry.rank}.
                  </span>
                  <div style={{ flex: 1, background: "#1b1b1b", borderRadius: 12, display: "flex", alignItems: "center", gap: 8, padding: 8, height: 52 }}>
                    <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 8, overflow: "hidden" }}>
                      <div style={{ width: 40, height: 40, background: "#3a3a3a", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <span style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 20, color: "#fff" }}>{entry.qtd}x</span>
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <p style={{ margin: 0, fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 16, color: "#fff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {entry.apelido.toUpperCase()}
                        </p>
                        <p style={{ margin: 0, fontFamily: "var(--font-display)", fontWeight: 500, fontSize: 12, color: "#8d908d" }}>
                          {entry.categoria}
                        </p>
                      </div>
                    </div>
                    {entry.rank <= 3 && (
                      <div style={{ width: 40, height: 40, background: "#000", border: "1px solid #353535", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={medalImgs[entry.rank - 1]} alt="" style={{ width: 28, height: 28 }} />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer spacer */}
        <div style={{ height: 16, background: "#1a1a1a" }} />
      </div>
    </>
  );
}
