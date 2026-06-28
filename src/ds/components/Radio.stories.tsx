import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { Radio } from "./Radio";

const meta: Meta<typeof Radio> = { title: "Forms/Radio", component: Radio };
export default meta;
type Story = StoryObj<typeof Radio>;

export const Grupo: Story = {
  render: () => {
    const [v, setV] = useState("direito");
    const opts = [
      { id: "direito", label: "Pé direito" },
      { id: "esquerdo", label: "Pé esquerdo" },
      { id: "ambi", label: "Ambidestro" },
    ];
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {opts.map((o) => (
          <Radio key={o.id} checked={v === o.id} onChange={() => setV(o.id)} label={o.label} />
        ))}
      </div>
    );
  },
};

export const Estados: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
      <Radio checked={false} />
      <Radio checked />
      <Radio checked disabled />
      <Radio checked size="xs" />
    </div>
  ),
};
