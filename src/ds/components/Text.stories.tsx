import type { Meta, StoryObj } from "@storybook/react-vite";
import { Text } from "./Text";
import { text } from "../tokens";

const meta: Meta<typeof Text> = { title: "Core/Text", component: Text };
export default meta;
type Story = StoryObj<typeof Text>;

export const Variantes: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {(Object.keys(text) as (keyof typeof text)[]).map((k) => (
        <Text key={k} as="p" variant={k}>{k}</Text>
      ))}
    </div>
  ),
};

export const Cores: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <Text variant="heading-h5">Texto primário</Text>
      <Text variant="paragraph-m" color="#999">Texto secundário</Text>
      <Text variant="paragraph-m" color="#7a7a7a">Texto muted</Text>
      <Text variant="label-s" color="#9fe870">Texto accent</Text>
    </div>
  ),
};
