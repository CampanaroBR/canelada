import type { Meta, StoryObj } from "@storybook/react-vite";
import { ChartBar, CaretRight } from "reicon-react";
import { SectionHeader } from "./SectionHeader";

const meta: Meta<typeof SectionHeader> = { title: "Layout/SectionHeader", component: SectionHeader, tags: ["!autodocs"] };
export default meta;
type Story = StoryObj<typeof SectionHeader>;

export const Simples: Story = {
  args: { icon: <ChartBar size={24} color="#9fe870" weight="Filled" />, title: "PERSONAGEM DA SEMANA" },
};

export const ComSubtitulo: Story = {
  args: { icon: <ChartBar size={24} color="#9fe870" weight="Filled" />, title: "CLASSIFICAÇÃO", subtitle: "Pontuação da galera" },
};

export const ComTrailing: Story = {
  args: {
    icon: <ChartBar size={24} color="#9fe870" weight="Filled" />,
    title: "BADGES",
    trailing: (
      <div style={{ display: "flex", alignItems: "center", gap: 4, background: "#2c2c2c", border: "1px solid #424242", borderRadius: 9999, padding: "9px 13px" }}>
        <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 12, color: "#fff" }}>Ver mais</span>
        <CaretRight size={12} color="#fff" weight="Outline" />
      </div>
    ),
  },
};
