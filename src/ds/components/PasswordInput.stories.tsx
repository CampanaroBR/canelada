import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { PasswordInput } from "./PasswordInput";

const meta: Meta<typeof PasswordInput> = {
  title: "Forms/PasswordInput",
  component: PasswordInput,
  decorators: [(S) => <div style={{ width: 320 }}><S /></div>],
};
export default meta;
type Story = StoryObj<typeof PasswordInput>;

export const Default: Story = {
  render: () => {
    const [v, setV] = useState("");
    return <PasswordInput label="Senha" placeholder="••••••••" value={v} onChange={(e) => setV(e.target.value)} />;
  },
};

export const ComForca: Story = {
  render: () => {
    const [v, setV] = useState("Canela");
    return <PasswordInput label="Nova senha" strength value={v} onChange={(e) => setV(e.target.value)} hint="Mín. 8 caracteres, com número e símbolo." />;
  },
};

export const Erro: Story = {
  render: () => <PasswordInput label="Senha" value="123" error="Senha muito fraca." />,
};
