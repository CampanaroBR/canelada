import type { Meta, StoryObj } from "@storybook/react-vite";
import { Badge } from "./Badge";
import { Card } from "./Card";
import { font, colors } from "../tokens";

const meta: Meta<typeof Badge> = {
  title: "Feedback/Badge",
  component: Badge,
  tags: ["!autodocs"],
  args: { children: "Badge", tone: "accent", variant: "soft" },
  argTypes: {
    tone: { control: "inline-radio", options: ["accent", "brand", "neutral", "success", "danger", "gold"] },
    variant: { control: "inline-radio", options: ["solid", "soft", "outline"] },
  },
};
export default meta;
type Story = StoryObj<typeof Badge>;

export const Playground: Story = {};

export const Anatomia: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
      <Badge tone="gold" dot>Épica</Badge>
    </div>
  ),
};

export const Variantes: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
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

export const NoContexto: Story = {
  render: () => (
    <Card tone="card" padding={16} style={{ width: 320 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontFamily: font.display, fontWeight: 800, fontSize: 16, color: colors.text.primary }}>Primeira Pelada</span>
        <Badge tone="accent" size="sm">NOVO</Badge>
      </div>
      <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
        <Badge tone="neutral">Presença</Badge>
        <Badge tone="gold" dot>Épica</Badge>
      </div>
    </Card>
  ),
};
