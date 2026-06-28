import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { Checkbox } from "./Checkbox";

const meta: Meta<typeof Checkbox> = { title: "Forms/Checkbox", component: Checkbox };
export default meta;
type Story = StoryObj<typeof Checkbox>;

export const Interactive: Story = {
  render: () => {
    const [on, setOn] = useState(true);
    return <Checkbox checked={on} onChange={setOn} label="Confirmar presença" />;
  },
};

export const Estados: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <Checkbox checked={false} label="Unselected" />
      <Checkbox checked label="Selected" />
      <Checkbox indeterminate label="Indeterminate" />
      <Checkbox checked label="Disabled" disabled />
      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <Checkbox checked size="sm" />
        <Checkbox checked size="xs" />
      </div>
    </div>
  ),
};
