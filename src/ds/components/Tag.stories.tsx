import type { Meta, StoryObj } from "@storybook/react-vite";
import { Tag } from "./Tag";

const meta: Meta<typeof Tag> = { title: "Core/Tag", component: Tag, args: { children: "Etiqueta" } };
export default meta;
type Story = StoryObj<typeof Tag>;

export const Todos: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", maxWidth: 360 }}>
      <Tag tone="new">NOVO</Tag>
      <Tag tone="success">Desbloqueada</Tag>
      <Tag tone="danger">Bloqueado</Tag>
      <Tag tone="gold" dot="#e2c485">Épica</Tag>
      <Tag tone="neutral" dot="#a978f0">Rara</Tag>
      <Tag tone="neutral">Categoria</Tag>
    </div>
  ),
};
