import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { Tabs } from "./Tabs";

const meta: Meta<typeof Tabs> = { title: "Core/Tabs", component: Tabs };
export default meta;
type Story = StoryObj<typeof Tabs>;

const items = [
  { value: "todas", label: "Todas (24)" },
  { value: "desbloqueadas", label: "Desbloqueadas (2)" },
  { value: "andamento", label: "Em andamento (7)" },
];

export const Scroll: Story = {
  render: () => {
    const [v, setV] = useState("todas");
    return <div style={{ width: 360 }}><Tabs items={items} value={v} onChange={setV} /></div>;
  },
};

export const Fill: Story = {
  render: () => {
    const [v, setV] = useState("semana");
    return (
      <div style={{ width: 360 }}>
        <Tabs
          layout="fill"
          value={v}
          onChange={setV}
          items={[{ value: "semana", label: "Semanal" }, { value: "mes", label: "Mensal" }]}
        />
      </div>
    );
  },
};
