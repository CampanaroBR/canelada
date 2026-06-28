import type { Meta, StoryObj } from "@storybook/react-vite";
import { ProgressBar } from "./ProgressBar";

const meta: Meta<typeof ProgressBar> = {
  title: "Feedback/ProgressBar",
  component: ProgressBar,
  args: { value: 40, tone: "accent" },
  decorators: [(S) => <div style={{ width: 320 }}><S /></div>],
};
export default meta;
type Story = StoryObj<typeof ProgressBar>;

export const Default: Story = {};
export const ComLabel: Story = { args: { value: 8, label: "Suas badges", showValue: true } };

export const Tons: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, width: 320 }}>
      <ProgressBar value={70} tone="accent" showValue label="Accent" />
      <ProgressBar value={45} tone="gold" showValue label="Gold" />
      <ProgressBar value={30} tone="danger" showValue label="Danger" />
      <ProgressBar value={60} tone="brand" showValue label="Brand" />
    </div>
  ),
};
