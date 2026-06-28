import type { Meta, StoryObj } from "@storybook/react-vite";
import { EmptyState } from "./EmptyState";
import { Button } from "./Button";

const meta: Meta<typeof EmptyState> = {
  title: "Patterns/EmptyState",
  component: EmptyState,
  decorators: [(S) => <div style={{ width: 360 }}><S /></div>],
};
export default meta;
type Story = StoryObj<typeof EmptyState>;

const Trophy = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="#3a3a3a"><path d="M6 4h12v3a6 6 0 01-12 0V4zm2 13h8v3H8z" /></svg>
);

export const SemClassificacao: Story = {
  args: {
    icon: <Trophy />,
    title: "Sem classificação ainda",
    description: "Nenhuma rodada encerrada nesta semana.",
  },
};

export const ComAcao: Story = {
  args: {
    icon: <Trophy />,
    title: "Nenhuma rodada criada",
    description: "Crie a primeira rodada pra começar a votação.",
    action: <Button size="sm">Criar Rodada</Button>,
  },
};
