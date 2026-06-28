import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { Select } from "./Select";

const meta: Meta<typeof Select> = {
  title: "Forms/Select",
  component: Select,
  decorators: [(S) => <div style={{ width: 280 }}><S /></div>],
};
export default meta;
type Story = StoryObj<typeof Select>;

const posicoes = [
  { value: "GOL", label: "Goleiro" },
  { value: "ZAG", label: "Zagueiro" },
  { value: "MEI", label: "Meio-Campo" },
  { value: "ATA", label: "Atacante" },
];

export const Default: Story = {
  render: () => {
    const [v, setV] = useState("MEI");
    return <Select label="Posição" required options={posicoes} value={v} onChange={setV} />;
  },
};

export const Vazio: Story = { args: { label: "Posição", options: posicoes, value: "", placeholder: "Selecione" } };
export const Erro: Story = { args: { label: "Posição", options: posicoes, value: "", error: true, placeholder: "Obrigatório" } };
export const Disabled: Story = { args: { label: "Posição", options: posicoes, value: "MEI", disabled: true } };
