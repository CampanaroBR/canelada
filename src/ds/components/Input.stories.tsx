import type { Meta, StoryObj } from "@storybook/react-vite";
import { Input } from "./Input";

const meta: Meta<typeof Input> = {
  title: "Core/Input",
  component: Input,
  args: { label: "Apelido no baba", placeholder: "Craque" },
  decorators: [(S) => <div style={{ width: 320 }}><S /></div>],
};
export default meta;
type Story = StoryObj<typeof Input>;

export const Default: Story = {};
export const Required: Story = { args: { label: "Posição", required: true } };
export const WithHint: Story = { args: { label: "Nome", hint: "Como o grupo vai te conhecer." } };
export const Disabled: Story = { args: { label: "Nome", value: "Arthur", disabled: true } };
