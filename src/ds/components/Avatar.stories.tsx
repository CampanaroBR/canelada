import type { Meta, StoryObj } from "@storybook/react-vite";
import { Avatar } from "./Avatar";

const meta: Meta<typeof Avatar> = {
  title: "Core/Avatar",
  component: Avatar,
  args: { name: "Arthur Fonseca", size: 56 },
};
export default meta;
type Story = StoryObj<typeof Avatar>;

export const Initials: Story = {};
export const Ring: Story = { args: { ring: true, size: 96 } };
export const Checked: Story = { args: { checked: true } };

export const Tamanhos: Story = {
  render: () => (
    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
      <Avatar name="AB" size={32} />
      <Avatar name="AB" size={42} />
      <Avatar name="AB" size={56} checked />
      <Avatar name="AB" size={96} ring />
    </div>
  ),
};
