import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { RowItem } from "./RowItem";
import { Card } from "./Card";
import { IconBox } from "./IconBox";
import { Divider } from "./Divider";
import { Avatar } from "./Avatar";
import { Toggle } from "./Toggle";

const meta: Meta<typeof RowItem> = { title: "Core/RowItem", component: RowItem };
export default meta;
type Story = StoryObj<typeof RowItem>;

const Dot = ({ c }: { c: string }) => (
  <div style={{ width: 18, height: 18, borderRadius: 5, background: c }} />
);

export const ListaDeConta: Story = {
  render: () => {
    const [on, setOn] = useState(true);
    return (
      <Card padding={0} style={{ width: 360, overflow: "hidden" }}>
        <RowItem icon={<IconBox><Dot c="#9fe870" /></IconBox>} label="Dados pessoais" sub="Nome, apelido, posição, foto" onClick={() => {}} />
        <Divider />
        <RowItem icon={<IconBox><Dot c="#9fe870" /></IconBox>} label="Minhas Badges" sub="Personagens e conquistas" onClick={() => {}} />
        <Divider />
        <RowItem icon={<IconBox><Dot c="#9fe870" /></IconBox>} label="Notificações" sub="Avisos de votação" trailing={<Toggle checked={on} onChange={setOn} />} />
      </Card>
    );
  },
};

export const Membros: Story = {
  render: () => (
    <Card padding={0} style={{ width: 360, overflow: "hidden" }}>
      <RowItem icon={<Avatar name="Arthur" size={42} />} label="Arthur" sub="MEI · Admin" onClick={() => {}} />
      <Divider />
      <RowItem icon={<Avatar name="Bebeto" size={42} />} label="Bebeto" sub="ATA · Jogador" onClick={() => {}} />
    </Card>
  ),
};
