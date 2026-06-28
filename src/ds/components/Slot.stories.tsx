import type { Meta, StoryObj } from "@storybook/react-vite";
import { Slot } from "./Slot";

const meta: Meta<typeof Slot> = {
  title: "Overlays/Slot",
  component: Slot,
  decorators: [(S) => <div style={{ width: 320 }}><S /></div>],
};
export default meta;
type Story = StoryObj<typeof Slot>;

export const Vazio: Story = { args: { label: "conteúdo", height: 64 } };
export const Composicao: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 8, width: 320 }}>
      <Slot label="header" height={48} />
      <Slot label="body" height={96} />
      <Slot label="footer" height={48} />
    </div>
  ),
};
