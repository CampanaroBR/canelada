import type { Meta, StoryObj } from "@storybook/react-vite";
import { Container } from "./Container";
import { Slot } from "./Slot";
import { font, colors } from "../tokens";

const meta: Meta<typeof Container> = {
  title: "Overlays/Container",
  component: Container,
  decorators: [(S) => <div style={{ width: 360 }}><S /></div>],
};
export default meta;
type Story = StoryObj<typeof Container>;

export const Titulada: Story = {
  render: () => (
    <Container
      title="BADGES"
      action={<span style={{ fontFamily: font.display, fontWeight: 700, fontSize: 13, color: colors.text.primary }}>Ver mais ›</span>}
    >
      <Slot label="conteúdo da seção" height={80} />
    </Container>
  ),
};

export const Tons: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <Container title="Surface" tone="surface"><Slot height={40} /></Container>
      <Container title="Card" tone="card"><Slot height={40} /></Container>
    </div>
  ),
};
