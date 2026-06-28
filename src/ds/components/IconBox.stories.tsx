import type { Meta, StoryObj } from "@storybook/react-vite";
import { IconBox } from "./IconBox";

const meta: Meta<typeof IconBox> = { title: "Core/IconBox", component: IconBox };
export default meta;
type Story = StoryObj<typeof IconBox>;

const Bell = ({ c = "#9fe870" }: { c?: string }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 01-3.4 0" />
  </svg>
);

export const Tons: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
      <IconBox tone="default"><Bell /></IconBox>
      <IconBox tone="accent"><Bell c="#0a1a06" /></IconBox>
      <IconBox tone="danger"><Bell c="#1a0606" /></IconBox>
    </div>
  ),
};

export const Tamanhos: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
      <IconBox size={32}><Bell /></IconBox>
      <IconBox size={36}><Bell /></IconBox>
      <IconBox size={48} radiusToken="lg"><Bell /></IconBox>
    </div>
  ),
};
