import type { Meta, StoryObj } from "@storybook/react-vite";
import { Input } from "./Input";

const meta: Meta<typeof Input> = {
  title: "Forms/Input",
  component: Input,
  tags: ["!autodocs"],
  args: { label: "Apelido no baba", placeholder: "Craque" },
  decorators: [(S) => <div style={{ width: 320 }}><S /></div>],
};
export default meta;
type Story = StoryObj<typeof Input>;

export const Default: Story = {};
export const Required: Story = { args: { label: "Posição", required: true } };
export const WithHint: Story = { args: { label: "Nome", hint: "Como o grupo vai te conhecer." } };
export const Disabled: Story = { args: { label: "Nome", value: "Arthur", disabled: true } };
export const Erro: Story = { args: { label: "Apelido", value: "x", error: "Apelido muito curto (mín. 2)." } };
export const ComIcone: Story = {
  args: {
    label: "E-mail",
    placeholder: "voce@email.com",
    leftIcon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 7l9 6 9-6" /></svg>
    ),
  },
};
