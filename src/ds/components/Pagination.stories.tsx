import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { Pagination } from "./Pagination";

const meta: Meta<typeof Pagination> = {
  title: "Navigation/Pagination",
  component: Pagination,
  tags: ["!autodocs"],
  parameters: { layout: "padded" },
};
export default meta;
type Story = StoryObj<typeof Pagination>;

export const Interativo: Story = {
  render: () => {
    const [p, setP] = useState(1);
    return <Pagination page={p} total={10} onChange={setP} />;
  },
};

export const Variacoes: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <Pagination page={1} total={3} />
      <Pagination page={5} total={10} />
      <Pagination page={10} total={10} />
    </div>
  ),
};
