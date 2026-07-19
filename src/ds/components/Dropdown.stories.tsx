import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { Football } from "reicon-react";
import { Dropdown } from "./Dropdown";

const meta: Meta<typeof Dropdown> = {
  title: "Forms/Dropdown",
  component: Dropdown,
  tags: ["!autodocs"],
  decorators: [(S) => <div style={{ width: 300 }}><S /></div>],
};
export default meta;
type Story = StoryObj<typeof Dropdown>;

const posicoes = [
  { value: "GOL", label: "Goleiro" },
  { value: "ZAG", label: "Zagueiro" },
  { value: "MEI", label: "Meio-Campo" },
  { value: "ATA", label: "Atacante" },
];

export const Default: Story = {
  render: () => {
    const [v, setV] = useState("MEI");
    return <Dropdown label="Posição" required options={posicoes} value={v} onChange={setV} />;
  },
};

export const ComIcone: Story = {
  render: () => {
    const [v, setV] = useState("");
    return <Dropdown label="Posição" leftIcon={<Football size={18} weight="Outline" />} options={posicoes} value={v} onChange={setV} placeholder="Escolha a posição" />;
  },
};

export const Estados: Story = {
  render: () => {
    const [v, setV] = useState("");
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <Dropdown label="Vazio" options={posicoes} value={v} onChange={setV} placeholder="Selecione" />
        <Dropdown label="Com erro" options={posicoes} value="" error placeholder="Obrigatório" />
        <Dropdown label="Desabilitado" options={posicoes} value="MEI" disabled />
      </div>
    );
  },
};
