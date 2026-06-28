import type { Meta, StoryObj } from "@storybook/react-vite";
import { PanelHeader } from "./PanelHeader";
import { IconBox } from "./IconBox";
import { Button } from "./Button";

const meta: Meta<typeof PanelHeader> = {
  title: "Patterns/PanelHeader",
  component: PanelHeader,
  parameters: { layout: "fullscreen" },
  decorators: [(S) => <div style={{ width: 393 }}><S /></div>],
};
export default meta;
type Story = StoryObj<typeof PanelHeader>;

const Dot = () => <div style={{ width: 20, height: 20, borderRadius: 6, background: "#9fe870" }} />;

export const MeuGrupo: Story = {
  args: {
    title: "Baba do PJ",
    subtitle: "6 jogadores · 12 rodadas",
    icon: <IconBox size={48} radiusToken="lg"><Dot /></IconBox>,
  },
};

export const ComAcao: Story = {
  args: {
    title: "Classificação",
    subtitle: "Pontuação da galera",
    icon: <IconBox size={48} radiusToken="lg"><Dot /></IconBox>,
    action: <Button size="sm" variant="ghost">↗</Button>,
  },
};
