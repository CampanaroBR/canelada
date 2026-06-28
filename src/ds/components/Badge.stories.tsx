import type { Meta, StoryObj } from "@storybook/react-vite";
import { Badge } from "./Badge";

const meta: Meta<typeof Badge> = {
  title: "Feedback/Badge",
  component: Badge,
  args: { children: "Badge", tone: "accent", variant: "soft" },
  argTypes: {
    tone: { control: "inline-radio", options: ["accent", "brand", "neutral", "success", "danger", "gold"] },
    variant: { control: "inline-radio", options: ["solid", "soft", "outline"] },
  },
};
export default meta;
type Story = StoryObj<typeof Badge>;

export const Playground: Story = {};

export const Variantes: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ display: "flex", gap: 8 }}>
        <Badge variant="solid">Solid</Badge>
        <Badge variant="soft">Soft</Badge>
        <Badge variant="outline">Outline</Badge>
      </div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", maxWidth: 360 }}>
        <Badge tone="accent">Accent</Badge>
        <Badge tone="brand">Brand</Badge>
        <Badge tone="success" dot>Desbloqueada</Badge>
        <Badge tone="danger">Bagre</Badge>
        <Badge tone="gold" dot>Épica</Badge>
        <Badge tone="neutral">Neutro</Badge>
      </div>
    </div>
  ),
};
