import React, { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { colors, font, motion } from "./tokens";

const meta: Meta = { title: "Foundations/Movimento", parameters: { layout: "fullscreen" } };
export default meta;
type Story = StoryObj;

const Page = ({ children }: { children: React.ReactNode }) => (
  <div style={{ padding: 32, background: colors.bg.base, minHeight: "100vh", maxWidth: 760 }}>{children}</div>
);
const H = ({ children }: { children: React.ReactNode }) => (
  <h2 style={{ fontFamily: font.display, fontWeight: 900, fontSize: 22, color: "#fff", margin: "28px 0 8px" }}>{children}</h2>
);

export const Movimento: Story = {
  render: () => {
    const [k, setK] = useState(0); // replay
    const eases = Object.entries(motion.ease);
    const durs = Object.entries(motion.duration);
    return (
      <Page>
        <H>Movimento</H>
        <p style={{ fontFamily: font.body, fontSize: 13, color: colors.text.muted, margin: "0 0 16px" }}>
          Durations e easings do Canelada. Clique pra reproduzir as animações.
        </p>
        <button onClick={() => setK((v) => v + 1)} style={{ marginBottom: 20, background: colors.accent.default, color: colors.text.onAccent, border: "none", borderRadius: 12, padding: "10px 16px", fontFamily: font.display, fontWeight: 700, fontSize: 14, cursor: "pointer" }}>
          ▶ Reproduzir
        </button>

        <H>Durations</H>
        {durs.map(([name, ms]) => (
          <div key={name} style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 12 }}>
            <div style={{ width: 120, fontFamily: font.body, fontSize: 12, color: "#fff" }}>{name} · {ms}ms</div>
            <div style={{ flex: 1, height: 8, background: colors.bg.card, borderRadius: 99, position: "relative", overflow: "hidden" }}>
              <div key={k} style={{ position: "absolute", left: 0, top: 0, height: "100%", width: 32, borderRadius: 99, background: colors.accent.default, animation: `bagre-run ${ms as number}ms ${motion.ease.out}` }} />
            </div>
          </div>
        ))}

        <H>Easings</H>
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
          {eases.map(([name, fn]) => (
            <div key={name} style={{ width: 150 }}>
              <div style={{ height: 60, background: colors.bg.card, borderRadius: 12, border: `1px solid ${colors.bg.border}`, position: "relative", overflow: "hidden" }}>
                <div key={k} style={{ position: "absolute", top: 18, left: 8, width: 24, height: 24, borderRadius: 8, background: colors.accent.default, animation: `bagre-slide 700ms ${fn as string}` }} />
              </div>
              <div style={{ fontFamily: font.body, fontSize: 11, color: "#fff", marginTop: 6 }}>ease/{name}</div>
            </div>
          ))}
        </div>

        <style>{`
          @keyframes bagre-run { from { transform: translateX(-32px) } to { transform: translateX(calc(100% + 320px)) } }
          @keyframes bagre-slide { from { left: 8px } to { left: calc(100% - 32px) } }
        `}</style>
      </Page>
    );
  },
};
