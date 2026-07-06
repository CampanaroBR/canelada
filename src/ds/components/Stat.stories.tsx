import type { Meta, StoryObj } from "@storybook/react-vite";
import { Stat } from "./Stat";

const meta: Meta<typeof Stat> = { title: "Data/Stat", component: Stat, tags: ["!autodocs"] };
export default meta;
type Story = StoryObj<typeof Stat>;

export const Empilhado: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 24, width: 280 }}>
      <Stat value={87} label="OVERALL" color="#9fe870" />
      <Stat value={12} label="RODADAS" />
      <Stat value={3} label="MVPS" color="#c5973a" />
    </div>
  ),
};

export const EmLinha: Story = {
  render: () => (
    <div style={{ background: "#242424", border: "1px solid #424242", borderRadius: 12, padding: "9px 13px", width: 280 }}>
      <Stat
        direction="inline"
        icon={<span style={{ fontSize: 18 }}>🏅</span>}
        value={<>12/<span style={{ fontWeight: 600, fontSize: 16, color: "#7a7a7a" }}>20 jogadores</span></>}
        label="já conquistaram uma medalha"
      />
    </div>
  ),
};
