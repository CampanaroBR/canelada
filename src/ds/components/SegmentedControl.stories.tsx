import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { SegmentedControl } from "./SegmentedControl";

const meta: Meta<typeof SegmentedControl> = {
  title: "Core/SegmentedControl",
  component: SegmentedControl,
};
export default meta;
type Story = StoryObj<typeof SegmentedControl>;

export const Anatomia: Story = {
  render: () => {
    const [v, setV] = useState("melhores");
    return (
      <SegmentedControl
        fullWidth
        value={v}
        onChange={setV}
        items={[{ value: "melhores", label: "Os melhores" }, { value: "piores", label: "Os piores" }]}
      />
    );
  },
  decorators: [(S) => <div style={{ width: 320 }}><S /></div>],
};

export const TamanhoAutomatico: Story = {
  render: () => {
    const [v, setV] = useState("semana");
    return (
      <SegmentedControl
        value={v}
        onChange={setV}
        items={[
          { value: "semana", label: "Semanal" },
          { value: "mes", label: "Mensal" },
          { value: "temporada", label: "Temporada" },
        ]}
      />
    );
  },
};
