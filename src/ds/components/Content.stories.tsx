import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { Content } from "./Content";
import { Card } from "./Card";
import { Divider } from "./Divider";
import { Avatar } from "./Avatar";
import { Checkbox } from "./Checkbox";
import { Radio } from "./Radio";
import { Toggle } from "./Toggle";
import { Badge } from "./Badge";
import { IconBox } from "./IconBox";
import { colors } from "../tokens";

const meta: Meta<typeof Content> = {
  title: "Core/Content",
  component: Content,
  decorators: [(S) => <div style={{ width: 380 }}><S /></div>],
};
export default meta;
type Story = StoryObj<typeof Content>;

const Caret = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
);
const Dot = () => <div style={{ width: 20, height: 20, borderRadius: 6, background: colors.accent.default }} />;

export const Anatomia: Story = {
  args: {
    leading: <IconBox><Dot /></IconBox>,
    label: "Dados pessoais",
    badge: <Badge tone="accent" size="sm">NOVO</Badge>,
    description: "Nome, apelido, posição, foto",
    trailing: <Caret />,
  },
};

export const ListaDeConta: Story = {
  render: () => {
    const [notif, setNotif] = useState(true);
    return (
      <Card padding={16} tone="surface">
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <Content leading={<IconBox><Dot /></IconBox>} label="Dados pessoais" description="Nome, apelido, posição, foto" trailing={<Caret />} onClick={() => {}} />
          <Divider />
          <Content leading={<IconBox><Dot /></IconBox>} label="Notificações" description="Avisos de votação e badges" trailing={<Toggle checked={notif} onChange={setNotif} />} />
        </div>
      </Card>
    );
  },
};

export const SelecaoMembros: Story = {
  render: () => {
    const [sel, setSel] = useState<Set<string>>(new Set(["arthur"]));
    const toggle = (id: string) => setSel((p) => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n; });
    const membros = [
      { id: "arthur", nome: "Arthur", sub: "MEI · Admin", adm: true },
      { id: "bebeto", nome: "Bebeto", sub: "ATA · Jogador" },
      { id: "rivaldo", nome: "Rivaldo", sub: "ATA · Jogador" },
    ];
    return (
      <Card padding={16} tone="surface">
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {membros.map((m) => (
            <Content
              key={m.id}
              leading={<Avatar name={m.nome} size={42} />}
              label={m.nome}
              badge={m.adm ? <Badge tone="accent" size="sm">Admin</Badge> : undefined}
              description={m.sub}
              trailing={<Checkbox checked={sel.has(m.id)} onChange={() => toggle(m.id)} />}
            />
          ))}
        </div>
      </Card>
    );
  },
};

export const ComRadio: Story = {
  render: () => {
    const [v, setV] = useState("direito");
    const opts = [
      { id: "direito", label: "Pé direito", desc: "Chuta melhor com a direita" },
      { id: "esquerdo", label: "Pé esquerdo", desc: "Canhoto" },
      { id: "ambi", label: "Ambidestro", desc: "Manda dos dois" },
    ];
    return (
      <Card padding={16} tone="surface">
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {opts.map((o) => (
            <Content key={o.id} leading={<Radio checked={v === o.id} onChange={() => setV(o.id)} />} label={o.label} description={o.desc} onClick={() => setV(o.id)} />
          ))}
        </div>
      </Card>
    );
  },
};
