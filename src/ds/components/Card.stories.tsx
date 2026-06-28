import type { Meta, StoryObj } from "@storybook/react-vite";
import { Card } from "./Card";
import { font } from "../tokens";

const meta: Meta<typeof Card> = { title: "Core/Card", component: Card, tags: ["!autodocs"] };
export default meta;
type Story = StoryObj<typeof Card>;

const Demo = ({ t }: { t: string }) => (
  <span style={{ fontFamily: font.display, fontWeight: 800, fontSize: 16, color: "#fff" }}>{t}</span>
);

export const Tons: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 12, width: 320 }}>
      <Card tone="surface"><Demo t="surface · #0a0e0e" /></Card>
      <Card tone="card"><Demo t="card · #171717" /></Card>
      <Card tone="base"><Demo t="base · #090909" /></Card>
    </div>
  ),
};
