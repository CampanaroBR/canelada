import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { Rating } from "./Rating";

const meta: Meta<typeof Rating> = { title: "Data/Rating", component: Rating, args: { value: 3.5, max: 5 } };
export default meta;
type Story = StoryObj<typeof Rating>;

export const Estrelas: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <Rating value={0} count={0} />
      <Rating value={2.5} count={12} />
      <Rating value={4} count={37} />
      <Rating value={5} count={88} />
      <Rating value={3} size="xs" />
    </div>
  ),
};

export const Coracoes: Story = {
  render: () => <Rating value={4} icon="heart" count={21} />,
};

export const Interativo: Story = {
  render: () => {
    const [v, setV] = useState(3);
    return <Rating value={v} onChange={setV} count={v} />;
  },
};
