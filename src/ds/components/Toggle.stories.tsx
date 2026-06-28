import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { Toggle } from "./Toggle";

const meta: Meta<typeof Toggle> = { title: "Forms/Toggle", component: Toggle };
export default meta;
type Story = StoryObj<typeof Toggle>;

export const Interactive: Story = {
  render: () => {
    const [on, setOn] = useState(true);
    return <Toggle checked={on} onChange={setOn} />;
  },
};

export const Estados: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
      <Toggle checked={false} />
      <Toggle checked={true} />
      <Toggle checked={true} disabled />
    </div>
  ),
};
